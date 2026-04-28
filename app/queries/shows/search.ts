import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

export const showSearchResultSchema = z
  .object({
    adult: z.boolean().optional(),
    backdrop_path: z.string().nullable().optional(),
    genre_ids: z.array(z.number()).optional(),
    id: z.number(),
    origin_country: z.array(z.string()).optional(),
    original_language: z.string().optional(),
    original_name: z.string().optional(),
    overview: z.string().optional(),
    popularity: z.number().optional(),
    poster_path: z.string().nullable().optional(),
    first_air_date: z.string().optional(),
    name: z.string(),
    vote_average: z.number().optional(),
    vote_count: z.number().optional(),
  })

export const showSearchPayloadSchema = z.object({
  searchResults: z.array(showSearchResultSchema).optional(),
});

export type ShowSearchResult = z.infer<typeof showSearchResultSchema>;

export const showSearchKeys = {
  all: ["shows", "search"] as const,
  query: (query: string) => [...showSearchKeys.all, query] as const,
};

export async function fetchShowSearchResults(query: string) {
  const response = await fetch(
    `/api/shows/search/${encodeURIComponent(query)}`,
  );

  if (!response.ok) {
    throw new Error("Search failed");
  }

  const payload = showSearchPayloadSchema.parse(await response.json());

  return payload.searchResults ?? [];
}

export function showSearchQueryOptions(query: string, enabled = true) {
  return queryOptions({
    queryKey: showSearchKeys.query(query),
    queryFn: () => fetchShowSearchResults(query),
    enabled,
  });
}
