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
import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { imageLoader } from "@/app/lib/client-utils";
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
import { LoaderCircleIcon as AnimatedLoaderCircleIcon } from "@/components/ui/loader-circle";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeftIcon,
  BanIcon,
  CirclePauseIcon,
  RotateCcwIcon,
  TvIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import EpisodeDetailDialog from "./episode-detail-dialog";
import EpisodeSeasonsAccordion from "./episode-seasons-accordion";

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
  const [episodeDetailTarget, setEpisodeDetailTarget] =
    useState<TmdbEpisode | null>(null);
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

  const defaultSeasonAccordionValue = useMemo(
    () => (seasonsOrdered[0] ? [`season-${seasonsOrdered[0][0]}`] : []),
    [seasonsOrdered],
  );

  const episodeDialogKey = episodeDetailTarget
    ? `${episodeDetailTarget.season_number}:${episodeDetailTarget.episode_number}`
    : null;
  const episodeDialogWatched = episodeDialogKey
    ? watchedSet.has(episodeDialogKey)
    : false;
  const episodeDialogUnaired = episodeDetailTarget?.air_date
    ? new Date(episodeDetailTarget.air_date).getTime() > Date.now()
    : false;
  const episodeDialogPending = episodeDialogKey
    ? pendingWatchedSet.has(episodeDialogKey)
    : false;

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
      setEpisodeDetailTarget(null);
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

  const seasonsAccordion = (
    <EpisodeSeasonsAccordion
      seasonsOrdered={seasonsOrdered}
      defaultSeasonValue={defaultSeasonAccordionValue}
      watchedSet={watchedSet}
      pendingWatchedSet={pendingWatchedSet}
      focusEpisodeId={episodeDetailTarget?.id ?? null}
      onEpisodeOpen={setEpisodeDetailTarget}
      onWatchedClick={handleWatchedClick}
      watchActionsDisabled={pendingWatchedKeys.length > 0}
    />
  );

  return (
    <>
      <Card className="flex h-full min-h-0 flex-col gap-0 border-border/60 bg-card/90 pt-0 shadow-[0_20px_50px_-40px_color-mix(in_oklab,var(--color-accent)_22%,transparent)] sm:border-border/70 sm:shadow-[0_24px_70px_-50px_color-mix(in_oklab,var(--color-accent)_25%,transparent)]">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
            <div className="space-y-4 px-4 pb-4 pt-3">
              {showMobileBackButton ? (
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
              ) : null}
              <CardTitle className="text-center text-xl leading-tight tracking-[-0.03em]">
                {selectedSeries.name}
              </CardTitle>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <Badge
                  variant="secondary"
                  className="rounded-full px-2.5 py-0.5 text-xs capitalize"
                >
                  {selectedSeries.libraryStatus}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full px-2.5 py-0.5 text-xs"
                >
                  {selectedSeries.status}
                </Badge>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
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
              <p className="text-pretty text-center text-sm leading-relaxed text-muted-foreground">
                {selectedSeries.overview || "No show summary available."}
              </p>
            </div>

            <div className="sticky top-0 z-20 flex items-center gap-3 border-y border-border/60 bg-card/95 px-4 py-2.5 backdrop-blur-md supports-backdrop-filter:bg-card/85 rounded-t-xl">
              {selectedSeries.poster_path ? (
                <div className="shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/50">
                  <Image
                    loader={imageLoader}
                    width={64}
                    height={96}
                    src={selectedSeries.poster_path}
                    alt={selectedSeries.name}
                    className="h-16 w-11 object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-11 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50">
                  <TvIcon className="size-5 text-muted-foreground" />
                </div>
              )}
              <p className="min-w-0 flex-1 text-sm leading-snug text-muted-foreground">
                <span className="font-medium text-foreground">
                  {watchedKeys.length}
                </span>{" "}
                watched
                <span className="text-border px-1.5">·</span>
                <span className="font-medium text-foreground">
                  {filteredEpisodes.length}
                </span>{" "}
                with air dates
              </p>
            </div>

            <div className="px-4 pb-8 pt-3">
              {filteredEpisodes.length ? (
                seasonsAccordion
              ) : (
                <div className="flex min-h-50 items-center justify-center text-sm text-muted-foreground">
                  No episodes loaded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden min-h-0 flex-1 flex-col md:flex">
          <CardHeader className="gap-4 border-b border-border/70 px-6 pb-5 pt-6">
            <div className="flex items-start gap-4">
              {selectedSeries.poster_path ? (
                <div className="shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-muted/60">
                  <Image
                    loader={imageLoader}
                    width={96}
                    height={144}
                    src={selectedSeries.poster_path}
                    alt={selectedSeries.name}
                    className="h-28 w-20 object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/60">
                  <TvIcon className="size-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 space-y-3">
                <CardTitle className="text-2xl tracking-[-0.03em]">
                  {selectedSeries.name}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="rounded-full px-2.5 py-0.5 text-xs capitalize"
                  >
                    {selectedSeries.libraryStatus}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full px-2.5 py-0.5 text-xs"
                  >
                    {selectedSeries.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {watchedKeys.length} watched
                  <span className="text-border px-2">·</span>
                  {filteredEpisodes.length} with air dates
                </p>
                <div className="flex flex-wrap gap-2">
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
                <p className="text-pretty text-sm leading-7 text-muted-foreground">
                  {selectedSeries.overview || "No show summary available."}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-hidden px-6 pt-6">
            {filteredEpisodes.length ? (
              <ScrollArea className="h-full pr-3">
                {seasonsAccordion}
              </ScrollArea>
            ) : (
              <div className="flex min-h-60 items-center justify-center text-sm text-muted-foreground">
                No episodes loaded yet.
              </div>
            )}
          </CardContent>
        </div>
      </Card>

      <EpisodeDetailDialog
        open={episodeDetailTarget !== null}
        onOpenChange={(next) => {
          if (!next) setEpisodeDetailTarget(null);
        }}
        showId={currShow}
        listEpisode={episodeDetailTarget}
        isWatched={episodeDialogWatched}
        unaired={episodeDialogUnaired}
        isPending={episodeDialogPending}
        watchActionsDisabled={pendingWatchedKeys.length > 0}
        onWatchClick={(e) => {
          if (episodeDetailTarget) {
            handleWatchedClick(e, episodeDetailTarget);
          }
        }}
      />

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
