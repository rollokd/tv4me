"use client";

import {
  markWatchedEpisodes,
  setUserShowStatus,
  updateWatchedEp,
} from "@/app/lib/actions";
import type { SeriesWithWatchedKeys } from "@/app/lib/library-service";
import type { EpisodeWatchTarget, ShowStatus } from "@/app/lib/shows";
import {
  type TmdbEpisode,
  tmdbShowDetailsQueryOptions,
} from "@/app/queries/tmdb/show-details";
import clsx from "clsx";
import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { imageLoader, prettyDate } from "@/app/lib/client-utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleCheckIcon } from "@/components/ui/circle-check";
import { CircleDashedIcon } from "@/components/ui/circle-dashed";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { LoaderCircleIcon as AnimatedLoaderCircleIcon } from "@/components/ui/loader-circle";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeftIcon,
  BanIcon,
  CalendarDaysIcon,
  CirclePauseIcon,
  RotateCcwIcon,
  TvIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

type WatchPreviousPrompt = {
  episode: TmdbEpisode;
  previousEpisodes: TmdbEpisode[];
};

function episodeKey(episode: EpisodeWatchTarget) {
  return `${episode.seasonNumber}:${episode.episodeNumber}`;
}

function episodeTarget(episode: TmdbEpisode): EpisodeWatchTarget {
  return {
    seasonNumber: episode.season_number,
    episodeNumber: episode.episode_number,
  };
}

function isEarlierEpisode(episode: TmdbEpisode, target: TmdbEpisode) {
  if (episode.season_number !== target.season_number) {
    return episode.season_number < target.season_number;
  }

  return episode.episode_number < target.episode_number;
}

function EpisodeList({
  userId,
  currShow,
  selectedSeries,
  showMobileBackButton = false,
}: {
  userId: string;
  currShow: number | null;
  selectedSeries: SeriesWithWatchedKeys | undefined;
  showMobileBackButton?: boolean;
}) {
  const router = useRouter();
  const [isStatusPending, startStatusTransition] = useTransition();
  const [currEpisode, setCurrEpisode] = useState<number | null>(null);
  const [pendingWatchedKeys, setPendingWatchedKeys] = useState<string[]>([]);
  const [watchPreviousPrompt, setWatchPreviousPrompt] =
    useState<WatchPreviousPrompt | null>(null);
  const [optimisticWatchedByShow, setOptimisticWatchedByShow] = useState<
    Record<number, string[]>
  >({});
  const episodeQuery = useQuery(
    tmdbShowDetailsQueryOptions(currShow ?? 0, currShow !== null),
  );

  const watchedKeys = useMemo(
    () =>
      currShow !== null
        ? (optimisticWatchedByShow[currShow] ??
          selectedSeries?.watchedEpisodeKeys ??
          [])
        : [],
    [currShow, optimisticWatchedByShow, selectedSeries?.watchedEpisodeKeys],
  );

  const watchedSet = useMemo(() => new Set(watchedKeys), [watchedKeys]);
  const pendingWatchedSet = useMemo(
    () => new Set(pendingWatchedKeys),
    [pendingWatchedKeys],
  );

  const filteredEpisodes = useMemo(
    () =>
      episodeQuery.data?.series.seasons
        ?.flatMap((season) => season.episodes ?? [])
        .filter((episode) => episode.air_date) ?? [],
    [episodeQuery.data],
  );

  const seasonsOrdered = useMemo(() => {
    const map = new Map<number, TmdbEpisode[]>();
    for (const ep of filteredEpisodes) {
      const list = map.get(ep.season_number) ?? [];
      list.push(ep);
      map.set(ep.season_number, list);
    }
    return [...map.entries()]
      .filter(([sn]) => sn > 0)
      .map(
        ([seasonNumber, seasonEpisodes]) =>
          [
            seasonNumber,
            [...seasonEpisodes].sort(
              (a, b) => b.episode_number - a.episode_number,
            ),
          ] as const,
      )
      .sort((a, b) => b[0] - a[0]);
  }, [filteredEpisodes]);

  async function markEpisodesAsWatched(episodes: TmdbEpisode[]) {
    if (!currShow) return;

    const targets = episodes.map(episodeTarget);
    const targetKeys = targets.map(episodeKey);
    const snapshot = [...watchedKeys];
    const next = Array.from(new Set([...watchedKeys, ...targetKeys]));

    setPendingWatchedKeys(targetKeys);
    setOptimisticWatchedByShow((current) => ({
      ...current,
      [currShow]: next,
    }));

    try {
      const resp = await markWatchedEpisodes(userId, currShow, targets, 0);
      if (resp === "failed") {
        setOptimisticWatchedByShow((current) => ({
          ...current,
          [currShow]: snapshot,
        }));
        console.error("Failed to update watched list");
        return;
      }
      router.refresh();
    } catch (error) {
      setOptimisticWatchedByShow((current) => ({
        ...current,
        [currShow]: snapshot,
      }));
      console.error("Failed to update watched list", error);
    } finally {
      setPendingWatchedKeys([]);
      setWatchPreviousPrompt(null);
    }
  }

  async function unmarkEpisodeAsWatched(episode: TmdbEpisode) {
    if (!currShow) return;

    const target = episodeTarget(episode);
    const key = episodeKey(target);
    const snapshot = [...watchedKeys];
    const next = watchedKeys.filter((watchedKey) => watchedKey !== key);

    setPendingWatchedKeys([key]);
    setOptimisticWatchedByShow((current) => ({
      ...current,
      [currShow]: next,
    }));

    try {
      const resp = await updateWatchedEp(
        userId,
        currShow,
        target.seasonNumber,
        target.episodeNumber,
        0,
      );
      if (resp === "failed") {
        setOptimisticWatchedByShow((current) => ({
          ...current,
          [currShow]: snapshot,
        }));
        console.error("Failed to update watched list");
        return;
      }
      router.refresh();
    } catch (error) {
      setOptimisticWatchedByShow((current) => ({
        ...current,
        [currShow]: snapshot,
      }));
      console.error("Failed to update watched list", error);
    } finally {
      setPendingWatchedKeys([]);
    }
  }

  function previousUnwatchedEpisodesFor(episode: TmdbEpisode) {
    return filteredEpisodes.filter((candidate) => {
      if (candidate.season_number <= 0) {
        return false;
      }

      const airDate = candidate.air_date
        ? new Date(candidate.air_date).getTime()
        : Number.POSITIVE_INFINITY;

      if (airDate > Date.now()) {
        return false;
      }

      return (
        isEarlierEpisode(candidate, episode) &&
        !watchedSet.has(episodeKey(episodeTarget(candidate)))
      );
    });
  }

  function handleWatchedClick(
    e: React.MouseEvent<HTMLButtonElement>,
    episode: TmdbEpisode,
  ) {
    e.preventDefault();
    e.stopPropagation();

    if (!currShow || pendingWatchedKeys.length > 0) return;

    const key = episodeKey(episodeTarget(episode));
    const wasWatched = watchedSet.has(key);

    if (wasWatched) {
      void unmarkEpisodeAsWatched(episode);
      return;
    }

    const previousEpisodes = previousUnwatchedEpisodesFor(episode);
    if (previousEpisodes.length > 0) {
      setWatchPreviousPrompt({ episode, previousEpisodes });
      return;
    }

    void markEpisodesAsWatched([episode]);
  }

  function handleStatusClick(status: ShowStatus) {
    if (!currShow) {
      return;
    }

    startStatusTransition(async () => {
      const response = await setUserShowStatus(userId, currShow, status);
      if (response === "successful") {
        router.refresh();
      }
    });
  }

  if (!currShow || !selectedSeries) {
    return (
      <Card className="h-full border-border/70 bg-card/85">
        <CardContent className="flex h-full min-h-105 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
          <p className="text-xl font-medium tracking-[-0.03em]">
            Select a show
          </p>
          <p className="max-w-sm text-sm leading-7">
            Episode details, air dates, and quick progress actions will appear
            here.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (episodeQuery.isLoading || episodeQuery.isFetching) {
    return (
      <Card className="h-full border-border/70 bg-card/85">
        <CardContent className="flex h-full min-h-105 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
          <AnimatedLoaderCircleIcon className="animate-spin" size={24} />
          <p className="text-sm uppercase tracking-[0.22em]">
            Loading episodes
          </p>
        </CardContent>
      </Card>
    );
  }

  if (episodeQuery.error) {
    return (
      <Card className="h-full border-border/70 bg-card/85">
        <CardContent className="flex h-full min-h-105 flex-col items-center justify-center gap-2 p-8 text-center text-destructive">
          <p className="text-xl font-medium tracking-[-0.03em]">
            Couldn&apos;t load episodes
          </p>
          <p className="max-w-sm text-sm leading-7">
            {episodeQuery.error instanceof Error
              ? episodeQuery.error.message
              : "Failed to load episodes"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="flex h-full min-h-0 gap-0 border-border/60 bg-card/90 shadow-[0_20px_50px_-40px_color-mix(in_oklab,var(--color-accent)_22%,transparent)] sm:border-border/70 sm:shadow-[0_24px_70px_-50px_color-mix(in_oklab,var(--color-accent)_25%,transparent)]">
        <CardHeader className="gap-3 border-b border-border/60 px-4 pb-4 pt-3 sm:gap-4 sm:border-border/70 sm:px-6 sm:pb-5 sm:pt-6">
          {showMobileBackButton ? (
            <div className="md:hidden">
              <Button
                asChild
                variant="ghost"
                className="h-8 -translate-x-2 rounded-full px-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Link href="/shows">
                  <ArrowLeftIcon className="size-4" />
                  Library
                </Link>
              </Button>
            </div>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            {selectedSeries.poster_path ? (
              <div className="mx-auto shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/50 sm:mx-0 sm:min-w-20 sm:rounded-2xl sm:border-border/70 sm:bg-muted/60">
                <Image
                  loader={imageLoader}
                  width={96}
                  height={144}
                  src={selectedSeries.poster_path}
                  alt={selectedSeries.name}
                  className="h-36 w-24 object-cover sm:h-28 sm:w-20"
                />
              </div>
            ) : (
              <div className="mx-auto flex h-36 w-24 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50 sm:mx-0 sm:h-28 sm:w-20 sm:rounded-2xl sm:border-border/70 sm:bg-muted/60">
                <TvIcon className="size-6 text-muted-foreground sm:size-5" />
              </div>
            )}
            <div className="min-w-0 space-y-2 sm:space-y-3">
              <CardTitle className="text-center text-xl leading-tight tracking-[-0.03em] sm:text-left sm:text-2xl">
                {selectedSeries.name}
              </CardTitle>
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start sm:gap-2">
                <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs capitalize">
                  {selectedSeries.libraryStatus}
                </Badge>
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs">
                  {selectedSeries.status}
                </Badge>
              </div>
              <p className="text-center text-xs text-muted-foreground sm:text-left">
                {watchedKeys.length} watched
                <span className="text-border px-1.5 sm:px-2">·</span>
                {filteredEpisodes.length} with air dates
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start sm:gap-2">
                {selectedSeries.libraryStatus !== "active" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-md"
                    disabled={isStatusPending}
                    onClick={() => handleStatusClick("active")}
                  >
                    <RotateCcwIcon className="size-3.5" />
                    Resume
                  </Button>
                ) : null}
                {selectedSeries.libraryStatus !== "paused" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-md"
                    disabled={isStatusPending}
                    onClick={() => handleStatusClick("paused")}
                  >
                    <CirclePauseIcon className="size-3.5" />
                    Pause
                  </Button>
                ) : null}
                {selectedSeries.libraryStatus !== "abandoned" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-md"
                    disabled={isStatusPending}
                    onClick={() => handleStatusClick("abandoned")}
                  >
                    <BanIcon className="size-3.5" />
                    Abandon
                  </Button>
                ) : null}
              </div>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:leading-7">
                {selectedSeries.overview || "No show summary available."}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-hidden px-4 pt-4 sm:px-6 sm:pt-6">
          {filteredEpisodes.length ? (
            <ScrollArea className="h-full pr-2 sm:pr-3">
              <Accordion
                type="multiple"
                defaultValue={
                  seasonsOrdered[0] ? [`season-${seasonsOrdered[0][0]}`] : []
                }
                className="space-y-3 sm:space-y-4"
              >
                {seasonsOrdered.map(([seasonNum, seasonEps]) => (
                  <AccordionItem
                    key={seasonNum}
                    value={`season-${seasonNum}`}
                    className="overflow-hidden rounded-xl border border-border/60 bg-background/75 px-0 last:border sm:rounded-2xl sm:border-border/70 sm:bg-background/70"
                  >
                    <AccordionTrigger className="px-3 py-3 text-left hover:no-underline sm:px-4 sm:py-3.5">
                      <div className="flex w-full items-center justify-between gap-3">
                        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground sm:text-sm sm:tracking-[0.18em]">
                          Season {seasonNum}
                        </h2>
                        <Badge
                          variant="outline"
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px]"
                        >
                          {seasonEps.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0">
                      <ItemGroup className="border-t border-border/70">
                        {seasonEps.map((episode, epIndex) => {
                          const key = `${episode.season_number}:${episode.episode_number}`;
                          const isWatched = watchedSet.has(key);
                          const isPending = pendingWatchedSet.has(key);
                          const air = episode.air_date
                            ? new Date(episode.air_date).getTime()
                            : 0;
                          const unaired = air > Date.now();
                          return (
                            <div key={episode.id}>
                              {epIndex > 0 ? <ItemSeparator /> : null}
                              <Item
                                className={clsx(
                                  "rounded-none border-0 bg-transparent px-3 py-3 sm:px-4 sm:py-3.5",
                                  currEpisode === episode.id && "bg-accent/6",
                                  unaired && "text-muted-foreground",
                                )}
                                onClick={() => setCurrEpisode(episode.id)}
                              >
                                <ItemMedia
                                  variant="icon"
                                  className={clsx(
                                    "size-9 rounded-xl border-border/60 bg-muted/50 sm:size-11 sm:rounded-2xl sm:border-border/70 sm:bg-muted/60",
                                    currEpisode === episode.id &&
                                      "border-accent/40 bg-accent/10",
                                  )}
                                >
                                  <TvIcon className="size-3.5 sm:size-4" />
                                </ItemMedia>
                                <ItemContent className="min-w-0 gap-1 sm:gap-2">
                                  <ItemHeader className="items-start">
                                    <div className="min-w-0 space-y-1 sm:space-y-1.5">
                                      <ItemTitle className="text-[13px] leading-snug tracking-[-0.01em] sm:text-sm md:text-base">
                                        <span className="text-muted-foreground">
                                          E{episode.episode_number}
                                        </span>{" "}
                                        {episode.name}
                                      </ItemTitle>
                                      <div className="flex flex-wrap gap-1.5">
                                        {isWatched ? (
                                          <Badge
                                            variant="secondary"
                                            className="rounded-full px-2 py-0.5 text-[10px] sm:text-[11px]"
                                          >
                                            Watched
                                          </Badge>
                                        ) : null}
                                        {unaired ? (
                                          <Badge
                                            variant="outline"
                                            className="rounded-full px-2 py-0.5 text-[10px] sm:text-[11px]"
                                          >
                                            Unaired
                                          </Badge>
                                        ) : null}
                                      </div>
                                    </div>
                                    <ItemActions>
                                      <Button
                                        type="button"
                                        size="icon-lg"
                                        variant={
                                          isWatched ? "secondary" : "default"
                                        }
                                        className={clsx(
                                          "shrink-0 rounded-full touch-manipulation",
                                          "[&_svg]:size-6!",
                                          "shadow-sm transition-transform active:scale-95",
                                        )}
                                        aria-label={
                                          isWatched
                                            ? `Mark episode ${episode.episode_number} as unwatched`
                                            : `Mark episode ${episode.episode_number} as watched`
                                        }
                                        disabled={
                                          unaired ||
                                          pendingWatchedKeys.length > 0
                                        }
                                        onClick={(e) =>
                                          handleWatchedClick(e, episode)
                                        }
                                      >
                                        {isPending ? (
                                          <AnimatedLoaderCircleIcon
                                            className="animate-spin"
                                            size={32}
                                          />
                                        ) : isWatched ? (
                                          <CircleCheckIcon size={32} />
                                        ) : (
                                          <CircleDashedIcon size={32} />
                                        )}
                                      </Button>
                                    </ItemActions>
                                  </ItemHeader>
                                  {episode.overview ? (
                                    <ItemDescription className="line-clamp-2 text-xs leading-snug text-muted-foreground sm:text-sm sm:leading-6">
                                      {episode.overview}
                                    </ItemDescription>
                                  ) : null}
                                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
                                    <CalendarDaysIcon className="size-3 shrink-0 opacity-80" />
                                    <span>
                                      {episode.air_date
                                        ? prettyDate(episode.air_date)
                                        : "Air date unknown"}
                                    </span>
                                  </div>
                                </ItemContent>
                              </Item>
                            </div>
                          );
                        })}
                      </ItemGroup>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          ) : (
            <div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">
              No episodes loaded yet.
            </div>
          )}
        </CardContent>
      </Card>
      <AlertDialog
        open={watchPreviousPrompt !== null}
        onOpenChange={(open) => {
          if (!open) {
            setWatchPreviousPrompt(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="rounded-2xl bg-accent/10 text-accent">
              <CircleCheckIcon size={34} />
            </AlertDialogMedia>
            <AlertDialogTitle>Mark earlier episodes too?</AlertDialogTitle>
            <AlertDialogDescription className="leading-6">
              {watchPreviousPrompt ? (
                <>
                  There{" "}
                  {watchPreviousPrompt.previousEpisodes.length === 1
                    ? "is"
                    : "are"}{" "}
                  {watchPreviousPrompt.previousEpisodes.length} earlier
                  unwatched{" "}
                  {watchPreviousPrompt.previousEpisodes.length === 1
                    ? "episode"
                    : "episodes"}
                  . Mark them watched with this episode?
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="outline"
              onClick={() => {
                if (!watchPreviousPrompt) return;
                void markEpisodesAsWatched([watchPreviousPrompt.episode]);
              }}
            >
              Just this episode
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => {
                if (!watchPreviousPrompt) return;
                void markEpisodesAsWatched([
                  ...watchPreviousPrompt.previousEpisodes,
                  watchPreviousPrompt.episode,
                ]);
              }}
            >
              Mark previous too
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default EpisodeList;
