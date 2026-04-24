import type { SeriesExtended } from "@/app/lib/definitions";
import { queryOptions } from "@tanstack/react-query";

export const tmdbShowKeys = {
  all: ["tmdb", "shows"] as const,
  details: (showId: number) =>
    [...tmdbShowKeys.all, showId, "details"] as const,
};

export async function fetchTmdbShowDetails(showId: number) {
  const response = await fetch(`/api/tmdb/shows/${showId}`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error ?? "Failed to load episodes");
  }

  return response.json() as Promise<{ series: SeriesExtended }>;
}

export function tmdbShowDetailsQueryOptions(showId: number, enabled = true) {
  return queryOptions({
    queryKey: tmdbShowKeys.details(showId),
    queryFn: () => fetchTmdbShowDetails(showId),
    enabled,
  });
}
