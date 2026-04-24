import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { episodeWatches, shows } from "./schema/shows-schema";

export type LibraryShowRow = typeof shows.$inferSelect;
export type EpisodeWatchRow = typeof episodeWatches.$inferSelect;

export async function getUserLibraryRows(userId: string) {
  return db.select().from(shows).where(eq(shows.userId, userId));
}

export async function getUserLibraryTmdbIds(userId: string): Promise<number[]> {
  const rows = await getUserLibraryRows(userId);
  return rows.map((r) => r.tmdbTvId);
}

export async function insertUserShow(
  userId: string,
  tmdbTvId: number,
  title: string,
  opts?: { imported?: boolean; watchthroughCount?: number },
) {
  await db
    .insert(shows)
    .values({
      userId,
      tmdbTvId,
      title,
      imported: opts?.imported ?? false,
      watchthroughCount: opts?.watchthroughCount ?? 0,
    })
    .onConflictDoNothing({ target: [shows.userId, shows.tmdbTvId] });
}

export async function deleteUserShow(userId: string, tmdbTvId: number) {
  await db
    .delete(shows)
    .where(and(eq(shows.userId, userId), eq(shows.tmdbTvId, tmdbTvId)));
}

export async function getUserWatchedEpisodesByShow(
  userId: string,
  watchthrough = 0,
) {
  return db
    .select({
      tmdbTvId: episodeWatches.tmdbTvId,
      seasonNumber: episodeWatches.seasonNumber,
      episodeNumber: episodeWatches.episodeNumber,
    })
    .from(episodeWatches)
    .where(
      and(
        eq(episodeWatches.userId, userId),
        eq(episodeWatches.watchthrough, watchthrough),
      ),
    );
}

export async function getWatchedEpisodesForShow(
  userId: string,
  tmdbTvId: number,
  watchthrough = 0,
) {
  return db
    .select({
      seasonNumber: episodeWatches.seasonNumber,
      episodeNumber: episodeWatches.episodeNumber,
    })
    .from(episodeWatches)
    .where(
      and(
        eq(episodeWatches.userId, userId),
        eq(episodeWatches.tmdbTvId, tmdbTvId),
        eq(episodeWatches.watchthrough, watchthrough),
      ),
    );
}

export function watchedKey(season: number, episode: number) {
  return `${season}:${episode}`;
}

export async function toggleEpisodeWatched(
  userId: string,
  tmdbTvId: number,
  seasonNumber: number,
  episodeNumber: number,
  watchthrough = 0,
) {
  const existing = await db
    .select({ id: episodeWatches.id })
    .from(episodeWatches)
    .where(
      and(
        eq(episodeWatches.userId, userId),
        eq(episodeWatches.tmdbTvId, tmdbTvId),
        eq(episodeWatches.watchthrough, watchthrough),
        eq(episodeWatches.seasonNumber, seasonNumber),
        eq(episodeWatches.episodeNumber, episodeNumber),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(episodeWatches)
      .where(eq(episodeWatches.id, existing[0].id));
    return false;
  }

  await db.insert(episodeWatches).values({
    userId,
    tmdbTvId,
    watchthrough,
    seasonNumber,
    episodeNumber,
    batched: false,
  });
  return true;
}
