import type { SeriesExtended } from "./definitions";
import { getShow, getSeriesInfo } from "./api";
import {
  deleteUserShow,
  getUserLibraryRows,
  getUserLibraryTmdbIds,
  getUserWatchedEpisodesByShow,
  insertUserShow,
  markEpisodesWatched,
  type ShowStatus,
  toggleEpisodeWatched,
  updateUserShowStatus,
} from "./shows";

export type SeriesWithWatchedKeys = SeriesExtended & {
  libraryStatus: ShowStatus;
  watchedEpisodeKeys: string[];
};
const LIBRARY_TMDB_CONCURRENCY = 4;

export function watchedKey(seasonNumber: number, episodeNumber: number) {
  return `${seasonNumber}:${episodeNumber}`;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      results[currentIndex] = await mapper(items[currentIndex]!);
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
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

  const hydrated = await mapWithConcurrency(
    libraryRows,
    LIBRARY_TMDB_CONCURRENCY,
    (row) => getShow(row.tmdbTvId),
  );

  return hydrated.map((series, index) => {
    const row = libraryRows[index]!;

    return {
      ...series,
      libraryStatus: row.status ?? "active",
      watchedEpisodeKeys: watchedByShow.get(series.id) ?? [],
    };
  });
}

export async function getUserShowsList(userId: string) {
  const libraryRows = await getUserLibraryRows(userId);
  return mapWithConcurrency(libraryRows, LIBRARY_TMDB_CONCURRENCY, (row) =>
    getShow(row.tmdbTvId),
  );
}

export { getSeriesInfo };

export {
  deleteUserShow,
  getUserLibraryRows,
  getUserLibraryTmdbIds,
  getUserWatchedEpisodesByShow,
  insertUserShow,
  markEpisodesWatched,
  toggleEpisodeWatched,
  updateUserShowStatus,
};
