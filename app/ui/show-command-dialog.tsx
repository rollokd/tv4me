"use client";

import { addUserShow, setUserShowStatus } from "@/app/lib/actions";
import { imageLoader } from "@/app/lib/client-utils";
import type { SearchResponse } from "@/app/lib/definitions";
import type { ShowStatus } from "@/app/lib/shows";
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
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

type LibraryShow = {
  tmdbTvId: number;
  title: string;
  status: ShowStatus;
};

type UserPayload = {
  libraryShowIds: number[];
  libraryShows: LibraryShow[];
};

function statusLabel(status: ShowStatus) {
  if (status === "active") return "Active";
  if (status === "paused") return "Paused";
  return "Abandoned";
}

function showYear(show: SearchResponse) {
  return show.first_air_date ? show.first_air_date.slice(0, 4) : null;
}

function showText(show: SearchResponse) {
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
  const [query, setQuery] = useState("");
  const [library, setLibrary] = useState<LibraryShow[]>([]);
  const [results, setResults] = useState<SearchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

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
  const searchReady = query.trim().length > 1;
  const visibleResults = searchReady ? results : [];

  useEffect(() => {
    if (!open) {
      return;
    }

    fetch(`/api/users/${userId}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load library");
        return response.json() as Promise<UserPayload>;
      })
      .then((payload) => {
        setLibrary(payload.libraryShows ?? []);
      })
      .catch(() => {
        setLibrary([]);
      });
  }, [open, userId]);

  useEffect(() => {
    const trimmed = query.trim();

    if (!open || trimmed.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setLoading(true);
      fetch(`/api/shows/search/${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) throw new Error("Search failed");
          return response.json() as Promise<{
            searchResults: SearchResponse[];
          }>;
        })
        .then((payload) => {
          setResults(payload.searchResults ?? []);
        })
        .catch((error) => {
          if (!(error instanceof DOMException && error.name === "AbortError")) {
            setResults([]);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [open, query]);

  function closeAndGo(showId: number) {
    onOpenChange(false);
    router.push(`/shows/${showId}`);
  }

  function updateLibraryStatus(showId: number, status: ShowStatus) {
    startTransition(async () => {
      const result = await setUserShowStatus(userId, showId, status);

      if (result === "successful") {
        setLibrary((current) =>
          current.map((show) =>
            show.tmdbTvId === showId ? { ...show, status } : show,
          ),
        );
        router.refresh();
      }
    });
  }

  function addShow(show: SearchResponse) {
    startTransition(async () => {
      const result = await addUserShow(userId, show.id);

      if (result === "successful") {
        setLibrary((current) => [
          ...current,
          {
            tmdbTvId: show.id,
            title: show.name,
            status: "active",
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
          {loading ? "Searching..." : "No shows found."}
        </CommandEmpty>

        {filteredLibrary.length ? (
          <CommandGroup heading="Your library">
            {filteredLibrary.map((show) => (
              <CommandItem
                key={show.tmdbTvId}
                value={`${show.title} ${show.status} ${show.tmdbTvId}`}
                onSelect={() => closeAndGo(show.tmdbTvId)}
                className="items-start gap-3 rounded-md"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                  <SearchIcon className="size-4" />
                </div>
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
