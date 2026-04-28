/**
 * One-off import from Marathon TV CSV exports (TMDB series ids).
 *
 * Usage:
 *   pnpm import:marathon
 *   pnpm import:marathon -- --export-dir ./marathon-tv-exports --user-id <id> --dry-run
 */
import "../envConfig";
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { sql } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { db } from "../app/db";
import { episodeWatches, shows } from "../app/lib/schema/shows-schema";

const DEFAULT_EXPORT_DIR = path.join(process.cwd(), "marathon-tv-exports");

type Args = {
  exportDir: string;
  userId?: string;
  dryRun: boolean;
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  let exportDir = DEFAULT_EXPORT_DIR;
  let userId = process.env.MARATHON_IMPORT_USER_ID;
  let dryRun = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--export-dir" && argv[i + 1]) {
      exportDir = path.resolve(argv[++i]);
    } else if (a === "--user-id" && argv[i + 1]) {
      userId = argv[++i];
    } else if (a === "--dry-run") {
      dryRun = true;
    }
  }
  return { exportDir, userId, dryRun };
}

const EPISODE_RE = /^S(\d+)\s*E(\d+)$/i;
const SPECIAL_EPISODE_RE = /^SP\s*E(\d+)$/i;

function parseEpisodeCell(
  cell: string,
): { season: number; episode: number } | null {
  const value = String(cell).trim();
  const special = value.match(SPECIAL_EPISODE_RE);
  if (special) {
    return { season: 0, episode: Number(special[1]) };
  }

  const standard = value.match(EPISODE_RE);
  if (!standard) return null;
  return { season: Number(standard[1]), episode: Number(standard[2]) };
}

type ShowRow = Record<string, string>;

type ParsedShow = {
  userId: string;
  tmdbTvId: number;
  title: string;
  status: "active" | "paused" | "abandoned";
  watchthroughCount: number;
  imported: boolean;
};

type ParsedEpisode = {
  userId: string;
  tmdbTvId: number;
  watchthrough: number;
  seasonNumber: number;
  episodeNumber: number;
  batched: boolean;
  watchedAt: Date;
};

const SHOW_CHUNK_SIZE = 100;
const EPISODE_CHUNK_SIZE = 200;

function parseShowsCsv(filePath: string): ShowRow[] {
  const raw = fs.readFileSync(filePath, "utf8");
  return parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as ShowRow[];
}

function statusFromMarathon(s: string): "active" | "paused" | "abandoned" {
  const v = s?.toLowerCase();
  if (v === "paused") return "paused";
  if (v === "abandoned") return "abandoned";
  return "active";
}

function parseIntegerField(value: string | undefined, field: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid ${field}: ${JSON.stringify(value)}`);
  }
  return parsed;
}

function parseOptionalDate(value: string | undefined): Date {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid Created timestamp: ${JSON.stringify(value)}`);
  }
  return parsed;
}

async function main() {
  const { exportDir, userId, dryRun } = parseArgs();
  if (!userId) {
    throw new Error(
      "Missing user id. Pass --user-id <better-auth-user-id> or set MARATHON_IMPORT_USER_ID.",
    );
  }

  const showsPath = path.join(exportDir, "shows.csv");
  if (!fs.existsSync(showsPath)) {
    console.error(`Missing ${showsPath}`);
    process.exit(1);
  }

  const showRows = parseShowsCsv(showsPath);
  console.log(`Found ${showRows.length} shows in export (user ${userId})`);

  const invalidShows: string[] = [];
  const showMap = new Map<number, ParsedShow>();

  for (const row of showRows) {
    try {
      const tmdbTvId = parseIntegerField(row["Series ID"], "Series ID");
      const parsedShow: ParsedShow = {
        userId,
        tmdbTvId,
        title: row["Series"]?.trim() || "Unknown",
        status: statusFromMarathon(row["Status"] ?? "active"),
        watchthroughCount: parseIntegerField(
          row["Watchthroughs Count"] ?? "0",
          "Watchthroughs Count",
        ),
        imported:
          String(row["Imported?"] ?? "")
            .trim()
            .toLowerCase() === "yes",
      };
      showMap.set(tmdbTvId, parsedShow);
    } catch (error) {
      invalidShows.push(
        `${row["Series"] ?? "Unknown show"}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  const showValues = [...showMap.values()];
  if (invalidShows.length > 0) {
    console.warn(`Skipping ${invalidShows.length} invalid show rows`);
    for (const reason of invalidShows.slice(0, 10)) {
      console.warn(`  - ${reason}`);
    }
  }

  const historyFiles = fs
    .readdirSync(exportDir)
    .filter((f) => /^history-\d+\.csv$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const episodeRows: ParsedEpisode[] = [];
  let invalidEpisodes = 0;
  let skippedEpisodesWithoutShow = 0;

  for (const hf of historyFiles) {
    const fp = path.join(exportDir, hf);
    const raw = fs.readFileSync(fp, "utf8");
    const rows = parse(raw, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];
    for (const row of rows) {
      try {
        const tmdbTvId = parseIntegerField(row["Series ID"], "Series ID");
        if (!showMap.has(tmdbTvId)) {
          skippedEpisodesWithoutShow++;
          continue;
        }

        const parsed = parseEpisodeCell(row["Episode"] ?? "");
        if (!parsed) {
          invalidEpisodes++;
          continue;
        }

        const watchthrough = parseIntegerField(
          row["Watchthrough"] ?? "0",
          "Watchthrough",
        );
        const batched =
          String(row["Batched?"] ?? "")
            .trim()
            .toLowerCase() === "yes";
        const watchedAt = parseOptionalDate(row["Created"]);

        episodeRows.push({
          userId,
          tmdbTvId,
          watchthrough,
          seasonNumber: parsed.season,
          episodeNumber: parsed.episode,
          batched,
          watchedAt,
        });
      } catch {
        invalidEpisodes++;
      }
    }
  }

  console.log(`Prepared ${showValues.length} shows for import`);
  console.log(
    `Parsed ${episodeRows.length} episode watch rows from history files`,
  );
  if (invalidEpisodes > 0) {
    console.warn(`Skipped ${invalidEpisodes} invalid history rows`);
  }
  if (skippedEpisodesWithoutShow > 0) {
    console.warn(
      `Skipped ${skippedEpisodesWithoutShow} history rows whose Series ID was not present in shows.csv`,
    );
  }

  const now = new Date();
  const queries: BatchItem<"pg">[] = [];

  for (const chunk of chunkArray(showValues, SHOW_CHUNK_SIZE)) {
    if (!chunk.length) continue;
    queries.push(
      db
        .insert(shows)
        .values(
          chunk.map((row) => ({
            ...row,
            updatedAt: now,
          })),
        )
        .onConflictDoUpdate({
          target: [shows.userId, shows.tmdbTvId],
          set: {
            title: sql.raw("excluded.title"),
            status: sql.raw("excluded.status"),
            watchthroughCount: sql.raw("excluded.watchthrough_count"),
            imported: sql.raw("excluded.imported"),
            updatedAt: now,
          },
        }),
    );
  }

  for (const chunk of chunkArray(episodeRows, EPISODE_CHUNK_SIZE)) {
    if (!chunk.length) continue;
    queries.push(
      db
        .insert(episodeWatches)
        .values(chunk)
        .onConflictDoNothing({
          target: [
            episodeWatches.userId,
            episodeWatches.tmdbTvId,
            episodeWatches.watchthrough,
            episodeWatches.seasonNumber,
            episodeWatches.episodeNumber,
          ],
        }),
    );
  }

  console.log(`Prepared ${queries.length} SQL batch items`);

  if (dryRun) {
    console.log("Dry run — no database writes.");
    return;
  }

  if (queries.length === 0) {
    console.log("No SQL batch items to execute.");
    return;
  }

  await db.batch([queries[0], ...queries.slice(1)] as [
    BatchItem<"pg">,
    ...BatchItem<"pg">[],
  ]);
  console.log("Import finished successfully.");
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
