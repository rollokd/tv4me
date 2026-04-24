import type { SeriesExtended } from "./definitions";
import { getShow, getSeriesInfo } from "./api";
import {
  deleteUserShow,
  getUserLibraryRows,
  getUserLibraryTmdbIds,
  getUserWatchedEpisodesByShow,
  insertUserShow,
  toggleEpisodeWatched,
} from "./shows";

export type SeriesWithWatchedKeys = SeriesExtended & {
  watchedEpisodeKeys: string[];
};

export function watchedKey(seasonNumber: number, episodeNumber: number) {
  return `${seasonNumber}:${episodeNumber}`;
}

export async function getUserLibraryWithProgress(
  userId: string,
  watchthrough = 0,
): Promise<SeriesWithWatchedKeys[]> {
  const [libraryRows, watchedRows] = await Promise.all([
    getUserLibraryRows(userId),
    getUserWatchedEpisodesByShow(userId, watchthrough),
  ]);

  const watchedByShow = new Map<number, string[]>();
  for (const row of watchedRows) {
    const keys = watchedByShow.get(row.tmdbTvId) ?? [];
    keys.push(watchedKey(row.seasonNumber, row.episodeNumber));
    watchedByShow.set(row.tmdbTvId, keys);
  }

  const hydrated = await Promise.all(
    libraryRows.map((row) => getSeriesInfo(row.tmdbTvId)),
  );

  return hydrated.map((series) => ({
    ...series,
    watchedEpisodeKeys: watchedByShow.get(series.id) ?? [],
  }));
}

export async function getUserShowsList(userId: string) {
  const libraryRows = await getUserLibraryRows(userId);
  return Promise.all(libraryRows.map((row) => getShow(row.tmdbTvId)));
}

export {
  deleteUserShow,
  getUserLibraryRows,
  getUserLibraryTmdbIds,
  getUserWatchedEpisodesByShow,
  insertUserShow,
  toggleEpisodeWatched,
};
