import type { SeriesWithWatchedKeys } from "@/app/lib/library-service";

/** TMDB uses "Canceled"; treat any non-returning terminal state as concluded. */
export function isTmdbSeriesConcluded(
  status: string | undefined | null,
): boolean {
  if (!status) return false;
  const s = status.toLowerCase().trim();
  return s === "ended" || s === "canceled" || s === "cancelled";
}

export type LibraryAiringSection = "upcoming" | "returning" | "ended";

export function libraryAiringSection(
  show: SeriesWithWatchedKeys,
): LibraryAiringSection {
  if (isTmdbSeriesConcluded(show.status)) {
    return "ended";
  }
  if (show.next_episode_to_air) {
    return "upcoming";
  }
  return "returning";
}
