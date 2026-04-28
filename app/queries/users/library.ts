import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

export const showStatusSchema = z.enum(["active", "paused", "abandoned"]);

export const libraryShowSchema = z.object({
  tmdbTvId: z.number(),
  title: z.string(),
  status: showStatusSchema,
  poster_path: z.string().nullable().optional(),
});

export const userLibraryPayloadSchema = z.object({
  libraryShowIds: z.array(z.number()),
  libraryShows: z.array(libraryShowSchema),
});

export type LibraryShow = z.infer<typeof libraryShowSchema>;
export type UserLibraryPayload = z.infer<typeof userLibraryPayloadSchema>;

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

  const payload: unknown = await response.json();
  return userLibraryPayloadSchema.parse(payload);
}

export function userLibraryQueryOptions(userId: string, enabled = true) {
  return queryOptions({
    queryKey: userLibraryKeys.library(userId),
    queryFn: () => fetchUserLibrary(userId),
    enabled,
  });
}
