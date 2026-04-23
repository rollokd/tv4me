"use client";

import type { SeriesWithWatchedKeys } from "@/app/lib/api";
import ShowList from "./show-list";
import EpisodeList from "./episode-list";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";

interface ShowsTableProps {
  series: SeriesWithWatchedKeys[];
  userId: string;
}

export default function ShowsTable({ series, userId }: ShowsTableProps) {
  const sortedShows = useMemo(
    () =>
      series
        ? [...series].sort((a, b) => {
            const da = a.last_air_date
              ? new Date(a.last_air_date).getTime()
              : 0;
            const db = b.last_air_date
              ? new Date(b.last_air_date).getTime()
              : 0;
            return db - da;
          })
        : [],
    [series],
  );

  const [currShow, setCurrShow] = useState<number | null>(() =>
    sortedShows[0]?.id ?? null,
  );

  const selected = useMemo(
    () => sortedShows.find((s) => s.id === currShow),
    [sortedShows, currShow],
  );

  const episodes = useMemo(() => {
    if (!selected?.seasons) return undefined;
    return selected.seasons.flatMap((s) => s.episodes ?? []);
  }, [selected]);

  return (
    <div className="flex flex-row gap-3 p-5 overflow-y-auto h-full">
      {sortedShows.length ? (
        <ShowList
          shows={sortedShows}
          currShow={currShow}
          setCurrShow={setCurrShow}
        />
      ) : (
        <Card className="p-5 flex flex-col text-2xl w-1/3 rounded-md border-2">
          No Shows Yet
          <p className="text-lg text-muted-foreground">
            Try searching for a new show
          </p>
        </Card>
      )}
      {sortedShows.length ? (
        <EpisodeList
          userId={userId}
          currShow={currShow}
          selectedSeries={selected}
          episodes={episodes}
        />
      ) : (
        <Card className="p-5 text-2xl flex flex-col w-1/3 rounded-md border-2">
          No Show Selected
        </Card>
      )}
    </div>
  );
}
