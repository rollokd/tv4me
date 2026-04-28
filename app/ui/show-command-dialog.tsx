"use client";

import { addUserShow, setUserShowStatus } from "@/app/lib/actions";
import { imageLoader } from "@/app/lib/client-utils";
import type { ShowStatus } from "@/app/lib/shows";
import {
  type ShowSearchResult,
  showSearchQueryOptions,
} from "@/app/queries/shows/search";
import {
  type LibraryShow,
  type UserLibraryPayload,
  userLibraryKeys,
  userLibraryQueryOptions,
} from "@/app/queries/users/library";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  BanIcon,
  CheckIcon,
  CirclePauseIcon,
  ExternalLinkIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  TvIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useDebounce } from "use-debounce";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function statusLabel(status: ShowStatus) {
  if (status === "active") return "Active";
  if (status === "paused") return "Paused";
  return "Abandoned";
}

function showYear(show: ShowSearchResult) {
  return show.first_air_date ? show.first_air_date.slice(0, 4) : null;
}

function showText(show: ShowSearchResult) {
  return [show.name, show.original_name, show.overview, showYear(show)]
    .filter(Boolean)
    .join(" ");
}

export default function ShowCommandDialog({
  userId,
  open,
  onOpenChange,
}: {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query.trim(), 250);
  const [isPending, startTransition] = useTransition();
  const userLibraryQuery = useQuery(userLibraryQueryOptions(userId, open));
  const searchReady = debouncedQuery.length > 1;
  const showSearchQuery = useQuery(
    showSearchQueryOptions(debouncedQuery, open && searchReady),
  );
  const library = useMemo(
    () => userLibraryQuery.data?.libraryShows ?? [],
    [userLibraryQuery.data?.libraryShows],
  );
  const visibleResults = searchReady ? (showSearchQuery.data ?? []) : [];

  const libraryById = useMemo(
    () => new Map(library.map((show) => [show.tmdbTvId, show])),
    [library],
  );

  const filteredLibrary = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return library.slice(0, 8);
    }

    return library
      .filter((show) => show.title.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [library, query]);
  function closeAndGo(showId: number) {
    onOpenChange(false);
    router.push(`/shows/${showId}`);
  }

  function updateLibraryCache(
    updater: (current: LibraryShow[]) => LibraryShow[],
  ) {
    queryClient.setQueryData<UserLibraryPayload>(
      userLibraryKeys.library(userId),
      (current) => {
        const currentShows = current?.libraryShows ?? [];
        const nextShows = updater(currentShows);

        return {
          libraryShowIds: nextShows.map((show) => show.tmdbTvId),
          libraryShows: nextShows,
        };
      },
    );
  }

  function updateLibraryStatus(showId: number, status: ShowStatus) {
    startTransition(async () => {
      const result = await setUserShowStatus(userId, showId, status);

      if (result === "successful") {
        updateLibraryCache((current) =>
          current.map((show) =>
            show.tmdbTvId === showId ? { ...show, status } : show,
          ),
        );
        router.refresh();
      }
    });
  }

  function addShow(show: ShowSearchResult) {
    startTransition(async () => {
      const result = await addUserShow(userId, show.id);

      if (result === "successful") {
        updateLibraryCache((current) => [
          ...current,
          {
            tmdbTvId: show.id,
            title: show.name,
            status: "active",
            poster_path: show.poster_path ?? null,
          },
        ]);
        router.refresh();
      }
    });
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search shows"
      description="Search TMDB and manage your library."
      className="max-w-2xl"
    >
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search shows or manage your library..."
      />
      <CommandList className="max-h-[70vh]">
        <CommandEmpty>
          {showSearchQuery.isFetching ? "Searching..." : "No shows found."}
        </CommandEmpty>

        {filteredLibrary.length ? (
          <CommandGroup heading="Your library">
            {filteredLibrary.map((show) => (
              <CommandItem
                key={show.tmdbTvId}
                value={`${show.title} ${show.status} ${show.tmdbTvId}`}
                onSelect={() => closeAndGo(show.tmdbTvId)}
                className="items-start gap-2.5 rounded-md py-2.5 sm:gap-3 sm:py-3"
              >
                {show.poster_path ? (
                  <Image
                    loader={imageLoader}
                    src={show.poster_path}
                    alt={show.title}
                    width={44}
                    height={66}
                    className="h-14 w-9 shrink-0 rounded-md object-cover sm:h-16 sm:w-11"
                  />
                ) : (
                  <div className="flex h-14 w-9 shrink-0 items-center justify-center rounded-md bg-muted sm:h-16 sm:w-11">
                    <TvIcon className="size-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-medium">{show.title}</span>
                    <Badge variant="secondary" className="rounded-md">
                      {statusLabel(show.status)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-md"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        closeAndGo(show.tmdbTvId);
                      }}
                    >
                      <ExternalLinkIcon className="size-3.5" />
                      Details
                    </Button>
                    {show.status !== "active" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 rounded-md"
                        disabled={isPending}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          updateLibraryStatus(show.tmdbTvId, "active");
                        }}
                      >
                        <RotateCcwIcon className="size-3.5" />
                        Resume
                      </Button>
                    ) : null}
                    {show.status !== "paused" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 rounded-md"
                        disabled={isPending}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          updateLibraryStatus(show.tmdbTvId, "paused");
                        }}
                      >
                        <CirclePauseIcon className="size-3.5" />
                        Pause
                      </Button>
                    ) : null}
                    {show.status !== "abandoned" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 rounded-md"
                        disabled={isPending}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          updateLibraryStatus(show.tmdbTvId, "abandoned");
                        }}
                      >
                        <BanIcon className="size-3.5" />
                        Abandon
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}

        {filteredLibrary.length && (visibleResults.length || searchReady) ? (
          <CommandSeparator />
        ) : null}

        {searchReady ? (
          <CommandGroup heading="TMDB results">
            {visibleResults.map((show) => {
              const libraryShow = libraryById.get(show.id);

              return (
                <CommandItem
                  key={show.id}
                  value={showText(show)}
                  onSelect={() =>
                    libraryShow ? closeAndGo(show.id) : addShow(show)
                  }
                  className="items-start gap-3 rounded-md"
                >
                  {show.poster_path ? (
                    <Image
                      loader={imageLoader}
                      src={show.poster_path}
                      alt={show.name}
                      width={44}
                      height={66}
                      className="h-16 w-11 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-11 shrink-0 items-center justify-center rounded-md bg-muted">
                      <SearchIcon className="size-4" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="truncate font-medium">{show.name}</span>
                      {showYear(show) ? (
                        <span className="text-xs text-muted-foreground">
                          {showYear(show)}
                        </span>
                      ) : null}
                      {libraryShow ? (
                        <Badge variant="secondary" className="rounded-md">
                          {statusLabel(libraryShow.status)}
                        </Badge>
                      ) : null}
                    </div>
                    {show.overview ? (
                      <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {show.overview}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      {libraryShow ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 rounded-md"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              closeAndGo(show.id);
                            }}
                          >
                            <ExternalLinkIcon className="size-3.5" />
                            Details
                          </Button>
                          {libraryShow.status !== "paused" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 rounded-md"
                              disabled={isPending}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                updateLibraryStatus(show.id, "paused");
                              }}
                            >
                              <CirclePauseIcon className="size-3.5" />
                              Pause
                            </Button>
                          ) : null}
                          {libraryShow.status !== "abandoned" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 rounded-md"
                              disabled={isPending}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                updateLibraryStatus(show.id, "abandoned");
                              }}
                            >
                              <BanIcon className="size-3.5" />
                              Abandon
                            </Button>
                          ) : null}
                        </>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          className="h-7 rounded-md"
                          disabled={isPending}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            addShow(show);
                          }}
                        >
                          <PlusIcon className="size-3.5" />
                          Add
                        </Button>
                      )}
                      {libraryShow?.status !== "active" && libraryShow ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-md"
                          disabled={isPending}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            updateLibraryStatus(show.id, "active");
                          }}
                        >
                          <CheckIcon className="size-3.5" />
                          Active
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}
