import type { ShowStatus } from "@/app/lib/shows";
import { queryOptions } from "@tanstack/react-query";

export type LibraryShow = {
  tmdbTvId: number;
  title: string;
  status: ShowStatus;
};

export type UserLibraryPayload = {
  libraryShowIds: number[];
  libraryShows: LibraryShow[];
};

export const userLibraryKeys = {
  all: ["users"] as const,
  library: (userId: string) =>
    [...userLibraryKeys.all, userId, "library"] as const,
};

export async function fetchUserLibrary(userId: string) {
  const response = await fetch(`/api/users/${userId}`);

  if (!response.ok) {
    throw new Error("Failed to load library");
  }

  return response.json() as Promise<UserLibraryPayload>;
}

export function userLibraryQueryOptions(userId: string, enabled = true) {
  return queryOptions({
    queryKey: userLibraryKeys.library(userId),
    queryFn: () => fetchUserLibrary(userId),
    enabled,
  });
}
