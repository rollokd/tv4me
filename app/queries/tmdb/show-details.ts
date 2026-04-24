import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

export const tmdbEpisodeSchema = z
  .object({
    air_date: z.string(),
    episode_number: z.number(),
    id: z.number(),
    name: z.string(),
    overview: z.string(),
    season_number: z.number(),
  })

export const tmdbSeasonSchema = z
  .object({
    episodes: z.array(tmdbEpisodeSchema).optional(),
    season_number: z.number().optional(),
  })

export const tmdbShowDetailsPayloadSchema = z.object({
  series: z
    .object({
      seasons: z.array(tmdbSeasonSchema).optional(),
    })
});

const tmdbErrorPayloadSchema = z.object({
  error: z.string().optional(),
});

export type TmdbEpisode = z.infer<typeof tmdbEpisodeSchema>;

export const tmdbShowKeys = {
  all: ["tmdb", "shows"] as const,
  details: (showId: number) =>
    [...tmdbShowKeys.all, showId, "details"] as const,
};

export async function fetchTmdbShowDetails(showId: number) {
  const response = await fetch(`/api/tmdb/shows/${showId}`);

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const parsed = tmdbErrorPayloadSchema.nullable().safeParse(payload);
    throw new Error(parsed.data?.error ?? "Failed to load episodes");
  }

  const payload: unknown = await response.json();
  return tmdbShowDetailsPayloadSchema.parse(payload);
}

export function tmdbShowDetailsQueryOptions(showId: number, enabled = true) {
  return queryOptions({
    queryKey: tmdbShowKeys.details(showId),
    queryFn: () => fetchTmdbShowDetails(showId),
    enabled,
  });
}
