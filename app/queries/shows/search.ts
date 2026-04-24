import type { SearchResponse } from "@/app/lib/definitions";
import { queryOptions } from "@tanstack/react-query";

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

  const payload = (await response.json()) as {
    searchResults?: SearchResponse[];
  };

  return payload.searchResults ?? [];
}

export function showSearchQueryOptions(query: string, enabled = true) {
  return queryOptions({
    queryKey: showSearchKeys.query(query),
    queryFn: () => fetchShowSearchResults(query),
    enabled,
  });
}
