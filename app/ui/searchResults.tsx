"use client";

import { CheckCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { addUserShow, removeUserShow } from "../lib/actions";
import { imageLoader } from "../lib/client-utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type UserLibraryPayload,
  userLibraryKeys,
  userLibraryQueryOptions,
} from "@/app/queries/users/library";
import { showSearchQueryOptions } from "@/app/queries/shows/search";

export default function SearchResults({
  query,
  id,
}: {
  query: string;
  id: string;
}) {
  const queryClient = useQueryClient();
  const normalizedQuery = query.trim();
  const userLibraryQuery = useQuery(userLibraryQueryOptions(id));
  const showSearchQuery = useQuery(
    showSearchQueryOptions(normalizedQuery, normalizedQuery !== ""),
  );
  const libraryShowIds = userLibraryQuery.data?.libraryShowIds ?? [];
  const response = normalizedQuery ? (showSearchQuery.data ?? []) : [];

  function updateLibraryCache(
    updater: (current: UserLibraryPayload) => UserLibraryPayload,
  ) {
    queryClient.setQueryData<UserLibraryPayload>(
      userLibraryKeys.library(id),
      (current) =>
        updater(
          current ?? {
            libraryShowIds: [],
            libraryShows: [],
          },
        ),
    );
  }

  return (
    <div className="grid grid-cols-2 grid-rows-4 border-2 rounded-md gap-5 m-5 p-5 grow">
      {response.length ? (
        <>
          {response.map((result) => (
            <Card
              className="flex flex-row box-border items-center border-2 rounded-lg gap-4 p-2"
              key={result.id}
            >
              {result.poster_path && (
                <Image
                  className="rounded-l-md"
                  loader={imageLoader}
                  width={100}
                  height={150}
                  src={result.poster_path}
                  alt={"Image of tv show: " + result.name}
                />
              )}
              <div className="flex flex-col gap-4">
                <span className="font-medium">{result.name}</span>
                <Button
                  type="button"
                  variant={
                    libraryShowIds.includes(Number(result.id))
                      ? "secondary"
                      : "default"
                  }
                  className="w-fit gap-1 rounded-full font-bold"
                  disabled={userLibraryQuery.isLoading}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const rid = Number(result.id);
                    if (!libraryShowIds.includes(rid)) {
                      const res = await addUserShow(id, rid);
                      if (res === "successful") {
                        updateLibraryCache((current) => ({
                          libraryShowIds: [...current.libraryShowIds, rid],
                          libraryShows: [
                            ...current.libraryShows,
                            {
                              tmdbTvId: rid,
                              title: result.name,
                              status: "active",
                              poster_path: result.poster_path ?? null,
                            },
                          ],
                        }));
                      }
                    } else {
                      const res = await removeUserShow(id, rid);
                      if (res === "successful") {
                        updateLibraryCache((current) => ({
                          libraryShowIds: current.libraryShowIds.filter(
                            (x) => x !== rid,
                          ),
                          libraryShows: current.libraryShows.filter(
                            (show) => show.tmdbTvId !== rid,
                          ),
                        }));
                      }
                    }
                  }}
                >
                  {libraryShowIds.includes(Number(result.id)) ? (
                    <>
                      Added
                      <CheckCircleIcon className="h-6 w-6" />
                    </>
                  ) : (
                    <>
                      Add
                      <PlusCircleIcon className="h-6 w-6" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </>
      ) : (
        <div className="col-span-2 justify-self-center self-center text-muted-foreground">
          Try searching for something!
        </div>
      )}
    </div>
  );
}
