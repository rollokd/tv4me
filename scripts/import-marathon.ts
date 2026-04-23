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
import { db } from "../app/db";
import { episodeWatches, shows } from "../app/lib/schema/shows-schema";

const DEFAULT_USER_ID = "3uITgZqwtbBHI7f4dgqXavNg0CJIITiv";

type Args = {
  exportDir: string;
  userId: string;
  dryRun: boolean;
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  let exportDir = path.join(process.cwd(), "marathon-tv-exports");
  let userId = DEFAULT_USER_ID;
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

function parseEpisodeCell(cell: string): { season: number; episode: number } | null {
  const m = String(cell).trim().match(EPISODE_RE);
  if (!m) return null;
  return { season: Number(m[1]), episode: Number(m[2]) };
}

type ShowRow = Record<string, string>;

function parseShowsCsv(filePath: string): ShowRow[] {
  const raw = fs.readFileSync(filePath, "utf8");
  return parse(raw, { columns: true, skip_empty_lines: true, trim: true }) as ShowRow[];
}

function statusFromMarathon(s: string): "active" | "paused" | "abandoned" {
  const v = s?.toLowerCase();
  if (v === "paused") return "paused";
  if (v === "abandoned") return "abandoned";
  return "active";
}

async function main() {
  const { exportDir, userId, dryRun } = parseArgs();
  const showsPath = path.join(exportDir, "shows.csv");
  if (!fs.existsSync(showsPath)) {
    console.error(`Missing ${showsPath}`);
    process.exit(1);
  }

  const showRows = parseShowsCsv(showsPath);
  console.log(`Found ${showRows.length} shows in export (user ${userId})`);

  const showValues = showRows.map((row) => {
    const tmdbTvId = Number(row["Series ID"]);
    const title = row["Series"] ?? "Unknown";
    const status = statusFromMarathon(row["Status"] ?? "active");
    const watchthroughCount = Number(row["Watchthroughs Count"] ?? 0) || 0;
    const imported =
      String(row["Imported?"] ?? "")
        .trim()
        .toLowerCase() === "yes";
    return {
      userId,
      tmdbTvId,
      title,
      status,
      watchthroughCount,
      imported,
    };
  });

  const historyFiles = fs
    .readdirSync(exportDir)
    .filter((f) => /^history-\d+\.csv$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const episodeRows: {
    userId: string;
    tmdbTvId: number;
    watchthrough: number;
    seasonNumber: number;
    episodeNumber: number;
    batched: boolean;
    watchedAt: Date;
  }[] = [];

  for (const hf of historyFiles) {
    const fp = path.join(exportDir, hf);
    const raw = fs.readFileSync(fp, "utf8");
    const rows = parse(raw, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];
    for (const row of rows) {
      const tmdbTvId = Number(row["Series ID"]);
      const watchthrough = Number(row["Watchthrough"] ?? 0) || 0;
      const parsed = parseEpisodeCell(row["Episode"] ?? "");
      if (!parsed) continue;
      const batched =
        String(row["Batched?"] ?? "")
          .trim()
          .toLowerCase() === "yes";
      const watchedAt = row["Created"]
        ? new Date(row["Created"])
        : new Date();
      episodeRows.push({
        userId,
        tmdbTvId,
        watchthrough,
        seasonNumber: parsed.season,
        episodeNumber: parsed.episode,
        batched,
        watchedAt,
      });
    }
  }

  console.log(`Parsed ${episodeRows.length} episode watch rows from history files`);

  if (dryRun) {
    console.log("Dry run — no database writes.");
    return;
  }

  for (const row of showValues) {
    await db
      .insert(shows)
      .values({
        ...row,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [shows.userId, shows.tmdbTvId],
        set: {
          title: row.title,
          status: row.status,
          watchthroughCount: row.watchthroughCount,
          imported: row.imported,
          updatedAt: new Date(),
        },
      });
  }

  for (const chunk of chunkArray(episodeRows, 200)) {
    if (!chunk.length) continue;
    await db.insert(episodeWatches).values(chunk).onConflictDoNothing({
      target: [
        episodeWatches.userId,
        episodeWatches.tmdbTvId,
        episodeWatches.watchthrough,
        episodeWatches.seasonNumber,
        episodeWatches.episodeNumber,
      ],
    });
  }

  console.log("Import finished.");
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
