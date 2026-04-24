"use client";

import { updateWatchedEp } from "@/app/lib/actions";
import type { Episode } from "@/app/lib/definitions";
import type { SeriesWithWatchedKeys } from "@/app/lib/library-service";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as SolidCheck } from "@heroicons/react/24/solid";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { imageLoader, prettyDate } from "@/app/lib/client-utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  LoaderCircleIcon,
  TvIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const [currEpisode, setCurrEpisode] = useState<number | null>(null);
  const [optimisticWatchedByShow, setOptimisticWatchedByShow] = useState<
    Record<number, string[]>
  >({});
  const [episodes, setEpisodes] = useState<Episode[] | undefined>(undefined);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [episodesError, setEpisodesError] = useState<string | null>(null);

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

  useEffect(() => {
    let cancelled = false;

    async function loadEpisodes(showId: number) {
      setLoadingEpisodes(true);
      setEpisodesError(null);
      setEpisodes(undefined);

      try {
        const response = await fetch(`/api/tmdb/shows/${showId}`);
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error ?? "Failed to load episodes");
        }

        const payload = (await response.json()) as {
          series: { seasons?: { episodes?: Episode[] }[] };
        };
        const nextEpisodes =
          payload.series.seasons?.flatMap((season) => season.episodes ?? []) ??
          [];

        if (!cancelled) {
          setEpisodes(nextEpisodes);
        }
      } catch (error) {
        if (!cancelled) {
          setEpisodes([]);
          setEpisodesError(
            error instanceof Error ? error.message : "Failed to load episodes",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingEpisodes(false);
        }
      }
    }

    if (currShow === null) {
      return;
    }

    void loadEpisodes(currShow);

    return () => {
      cancelled = true;
    };
  }, [currShow]);

  async function handleWatchedClick(
    e: React.MouseEvent<HTMLButtonElement>,
    seasonNumber: number,
    episodeNumber: number,
  ) {
    e.preventDefault();
    e.stopPropagation();
    if (!currShow) return;
    const key = `${seasonNumber}:${episodeNumber}`;
    const wasWatched = watchedSet.has(key);
    const snapshot = [...watchedKeys];
    const next = wasWatched
      ? watchedKeys.filter((k) => k !== key)
      : [...watchedKeys, key];
    setOptimisticWatchedByShow((current) => ({
      ...current,
      [currShow]: next,
    }));

    const resp = await updateWatchedEp(
      userId,
      currShow,
      seasonNumber,
      episodeNumber,
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
  }

  const filteredEpisodes = useMemo(
    () => episodes?.filter((e) => e.air_date) ?? [],
    [episodes],
  );

  const seasonsOrdered = useMemo(() => {
    const map = new Map<number, Episode[]>();
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

  if (!currShow || !selectedSeries) {
    return (
      <Card className="border-border/70 bg-card/85">
        <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
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

  if (loadingEpisodes) {
    return (
      <Card className="border-border/70 bg-card/85">
        <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
          <LoaderCircleIcon className="size-5 animate-spin" />
          <p className="text-sm uppercase tracking-[0.22em]">
            Loading episodes
          </p>
        </CardContent>
      </Card>
    );
  }

  if (episodesError) {
    return (
      <Card className="border-border/70 bg-card/85">
        <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-2 p-8 text-center text-destructive">
          <p className="text-xl font-medium tracking-[-0.03em]">
            Couldn&apos;t load episodes
          </p>
          <p className="max-w-sm text-sm leading-7">{episodesError}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-h-0 border-border/70 bg-card/85 shadow-[0_24px_70px_-50px_color-mix(in_oklab,var(--color-accent)_25%,transparent)]">
      <CardHeader className="gap-5 border-b border-border/70">
        {showMobileBackButton ? (
          <div className="sm:hidden">
            <Button
              asChild
              variant="ghost"
              className="h-9 rounded-full px-0 text-sm text-muted-foreground hover:text-foreground"
            >
              <Link href="/shows">
                <ArrowLeftIcon className="size-4" />
                Back to library
              </Link>
            </Button>
          </div>
        ) : null}
        <div className="flex items-start gap-4">
          {selectedSeries.poster_path ? (
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/60">
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
            <div className="flex h-28 w-20 items-center justify-center rounded-2xl border border-border/70 bg-muted/60">
              <TvIcon className="size-5 text-muted-foreground" />
            </div>
          )}
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Selected show
              </p>
              <CardTitle className="text-2xl tracking-[-0.03em]">
                {selectedSeries.name}
              </CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {selectedSeries.status}
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {filteredEpisodes.length} aired episodes
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {watchedKeys.length} watched
              </Badge>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              {selectedSeries.overview || "No show summary available."}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 pt-6">
        {filteredEpisodes.length ? (
          <ScrollArea className="h-[min(72vh,820px)] pr-3">
            <Accordion
              type="multiple"
              defaultValue={
                seasonsOrdered[0] ? [`season-${seasonsOrdered[0][0]}`] : []
              }
              className="space-y-4"
            >
              {seasonsOrdered.map(([seasonNum, seasonEps]) => (
                <AccordionItem
                  key={seasonNum}
                  value={`season-${seasonNum}`}
                  className="overflow-hidden rounded-2xl border border-border/70 bg-background/70 px-0 last:border"
                >
                  <AccordionTrigger className="px-4 py-4 text-left hover:no-underline">
                    <div className="flex w-full items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                          Season {seasonNum}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Most recent episodes first
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="rounded-full px-2.5 py-1 text-[11px]"
                      >
                        {seasonEps.length} episodes
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <ItemGroup className="border-t border-border/70">
                      {seasonEps.map((episode: Episode, epIndex: number) => {
                        const key = `${episode.season_number}:${episode.episode_number}`;
                        const isWatched = watchedSet.has(key);
                        const air = episode.air_date
                          ? new Date(episode.air_date).getTime()
                          : 0;
                        const unaired = air > Date.now();
                        return (
                          <div key={episode.id}>
                            {epIndex > 0 ? <ItemSeparator /> : null}
                            <Item
                              className={clsx(
                                "rounded-none border-0 bg-transparent px-4 py-4",
                                currEpisode === episode.id && "bg-accent/6",
                                unaired && "text-muted-foreground",
                              )}
                              onClick={() => setCurrEpisode(episode.id)}
                            >
                              <ItemMedia
                                variant="icon"
                                className={clsx(
                                  "size-11 rounded-2xl border-border/70 bg-muted/60",
                                  currEpisode === episode.id &&
                                    "border-accent/40 bg-accent/10",
                                )}
                              >
                                <TvIcon className="size-4" />
                              </ItemMedia>
                              <ItemContent className="gap-2">
                                <ItemHeader className="items-start">
                                  <div className="space-y-2">
                                    <ItemTitle className="text-sm tracking-[-0.01em] md:text-base">
                                      E{episode.episode_number}. {episode.name}
                                    </ItemTitle>
                                    <div className="flex flex-wrap gap-2">
                                      <Badge
                                        variant={
                                          isWatched ? "secondary" : "outline"
                                        }
                                        className="rounded-full px-2.5 py-1 text-[11px]"
                                      >
                                        {isWatched ? "Watched" : "Unwatched"}
                                      </Badge>
                                      {unaired ? (
                                        <Badge
                                          variant="outline"
                                          className="rounded-full px-2.5 py-1 text-[11px]"
                                        >
                                          Unaired
                                        </Badge>
                                      ) : null}
                                    </div>
                                  </div>
                                  <ItemActions>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant={
                                        isWatched ? "secondary" : "default"
                                      }
                                      className="size-10 rounded-full shrink-0"
                                      disabled={unaired}
                                      onClick={(e) =>
                                        handleWatchedClick(
                                          e,
                                          episode.season_number,
                                          episode.episode_number,
                                        )
                                      }
                                    >
                                      {isWatched ? (
                                        <SolidCheck className="size-5" />
                                      ) : (
                                        <PlusCircleIcon className="size-5" />
                                      )}
                                    </Button>
                                  </ItemActions>
                                </ItemHeader>
                                <ItemDescription className="line-clamp-2 text-sm leading-6">
                                  {episode.overview ||
                                    "No episode summary available."}
                                </ItemDescription>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <CalendarDaysIcon className="size-3.5" />
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
  );
}

export default EpisodeList;
