"use client";

import { updateWatchedEp } from "@/app/lib/actions";
import type { Episode } from "@/app/lib/definitions";
import type { SeriesWithWatchedKeys } from "@/app/lib/library-service";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as SolidCheck } from "@heroicons/react/24/solid";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function EpisodeList({
  userId,
  currShow,
  selectedSeries,
}: {
  userId: string;
  currShow: number | null;
  selectedSeries: SeriesWithWatchedKeys | undefined;
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
      .sort((a, b) => a[0] - b[0]);
  }, [filteredEpisodes]);

  if (!currShow || !selectedSeries) {
    return (
      <Card className="p-5 flex flex-col text-muted-foreground w-1/3 border-2">
        Select a show to see episodes.
      </Card>
    );
  }

  if (loadingEpisodes) {
    return (
      <Card className="p-5 flex flex-col text-muted-foreground w-1/3 border-2">
        Loading episodes...
      </Card>
    );
  }

  if (episodesError) {
    return (
      <Card className="p-5 flex flex-col text-destructive w-1/3 border-2">
        {episodesError}
      </Card>
    );
  }

  const seasonNodes = seasonsOrdered.map(([seasonNum, seasonEps]) => (
    <div key={seasonNum}>
      <h2 className="text-2xl sticky top-0 px-3 py-2 border-b-2 bg-card z-[1]">
        Season {seasonNum}
      </h2>
      <div className="rounded-md overflow-y-auto scrollbar-hide h-full">
        <ol className="pl-5 flex flex-col list-decimal list-inside">
          {seasonEps.map((episode: Episode, epIndex: number) => {
            const key = `${episode.season_number}:${episode.episode_number}`;
            const isWatched = watchedSet.has(key);
            const air = episode.air_date
              ? new Date(episode.air_date).getTime()
              : 0;
            const unaired = air > Date.now();
            return (
              <li
                className={clsx(
                  "flex flex-row p-2 justify-between items-center cursor-pointer border-b-2 transition hover:text-primary",
                  currEpisode === episode.id && "text-primary font-medium",
                  unaired && "text-muted-foreground",
                )}
                key={episode.id}
                onClick={() => setCurrEpisode(episode.id)}
              >
                <span>
                  {epIndex + 1}. {episode.name}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant={isWatched ? "secondary" : "default"}
                  className="rounded-full shrink-0"
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
                    <SolidCheck className="w-7 h-7" />
                  ) : (
                    <PlusCircleIcon className="w-7 h-7" />
                  )}
                </Button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  ));

  return (
    <div className="flex flex-col w-1/3 rounded-md min-h-0">
      {filteredEpisodes.length ? (
        <>
          <h1 className="rounded-md text-2xl sticky top-0 px-3 pt-3 pb-1 z-10 bg-card">
            Episodes
          </h1>
          <Card className="border-2 overflow-y-auto scrollbar-hide h-full mt-2 min-h-0">
            {seasonNodes}
          </Card>
        </>
      ) : (
        <p className="text-muted-foreground">No episodes loaded yet.</p>
      )}
    </div>
  );
}

export default EpisodeList;
