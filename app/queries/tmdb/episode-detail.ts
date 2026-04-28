import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

const guestStarSchema = z
  .object({
    name: z.string().optional(),
    character: z.string().nullable().optional(),
  })
  .passthrough();

const crewMemberSchema = z
  .object({
    name: z.string().optional(),
    job: z.string().optional(),
    department: z.string().optional(),
  })
  .passthrough();

export const tmdbEpisodeDetailSchema = z
  .object({
    air_date: z.string().nullable().optional(),
    crew: z.array(crewMemberSchema).optional(),
    episode_number: z.number(),
    episode_type: z.string().optional(),
    guest_stars: z.array(guestStarSchema).optional(),
    id: z.number(),
    name: z.string(),
    overview: z.string().nullable().optional(),
    runtime: z.number().nullable().optional(),
    season_number: z.number(),
    still_path: z.string().nullable().optional(),
    vote_average: z.number().optional(),
    vote_count: z.number().optional(),
  })
  .passthrough();

export type TmdbEpisodeDetail = z.infer<typeof tmdbEpisodeDetailSchema>;

const episodePayloadSchema = z.object({
  episode: tmdbEpisodeDetailSchema,
});

export const tmdbEpisodeDetailKeys = {
  all: ["tmdb", "episode-detail"] as const,
  episode: (showId: number, season: number, episode: number) =>
    [...tmdbEpisodeDetailKeys.all, showId, season, episode] as const,
};

export async function fetchTmdbEpisodeDetail(
  showId: number,
  seasonNumber: number,
  episodeNumber: number,
) {
  const response = await fetch(
    `/api/tmdb/shows/${showId}/season/${seasonNumber}/episode/${episodeNumber}`,
  );

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const err =
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : "Failed to load episode";
    throw new Error(err);
  }

  const payload: unknown = await response.json();
  return episodePayloadSchema.parse(payload).episode;
}

export function tmdbEpisodeDetailQueryOptions(
  showId: number,
  seasonNumber: number,
  episodeNumber: number,
  enabled: boolean,
) {
  return queryOptions({
    queryKey: tmdbEpisodeDetailKeys.episode(showId, seasonNumber, episodeNumber),
    queryFn: () =>
      fetchTmdbEpisodeDetail(showId, seasonNumber, episodeNumber),
    enabled,
  });
}
