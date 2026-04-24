"use client";

import type { SeriesWithWatchedKeys } from "@/app/lib/library-service";
import Image from "next/image";
import clsx from "clsx";
import { imageLoader, prettyDate } from "@/app/lib/client-utils";
import { useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";

function ShowItem({
  show,
  currShow,
  setCurrShow,
  epsLeft,
}: {
  show: SeriesWithWatchedKeys;
  currShow: number | null;
  setCurrShow: (showId: number) => void;
  epsLeft: number;
}) {
  return (
    <Card
      className={clsx(
        currShow === show.id && "ring-2 ring-primary",
        "flex flex-row items-center border-2 rounded-md cursor-pointer transition duration-500 ease-in-out hover:bg-accent",
      )}
      key={show.id}
      onClick={() => setCurrShow(show.id)}
    >
      {show.poster_path && (
        <Image
          className="rounded-l-[0.375rem]"
          loader={imageLoader}
          width={100}
          height={150}
          src={show.poster_path}
          alt={show.name}
        />
      )}
      <div className="flex flex-col p-2">
        <p className="md:text-xl">{show.name}</p>
        <p className="text-xs md:text-sm text-muted-foreground">
          {show.next_episode_to_air ? (
            <>Next: {prettyDate(show.next_episode_to_air.air_date)}</>
          ) : show.last_air_date ? (
            <>Last: {prettyDate(show.last_air_date)}</>
          ) : (
            <>Last air date unknown</>
          )}
        </p>
        <p className="text-xs md:text-sm text-muted-foreground">
          Episodes left: {epsLeft === 0 ? "Finished" : epsLeft}
        </p>
      </div>
    </Card>
  );
}

function getShowStatus(index: number) {
  switch (index) {
    case 0:
      return "Upcoming";
    case 1:
      return "Returning";
    case 2:
      return "Ended";
    default:
      return "Unknown";
  }
}

export default function ShowList({
  shows,
  currShow,
  setCurrShow,
}: {
  shows: SeriesWithWatchedKeys[];
  currShow: number | null;
  setCurrShow: (id: number) => void;
}) {
  useEffect(() => {
    if (currShow === null && shows.length > 0) {
      setCurrShow(shows[0].id);
    }
  }, [currShow, shows, setCurrShow]);

  function epsLeftFor(show: SeriesWithWatchedKeys) {
    const watched = new Set(show.watchedEpisodeKeys);
    const eps = show.seasons?.flatMap((s) => s.episodes ?? []) ?? [];
    const countable = eps.filter((e) => e.air_date);
    if (!countable.length) return 0;
    return countable.filter(
      (e) => !watched.has(`${e.season_number}:${e.episode_number}`),
    ).length;
  }

  const filtered = useMemo(
    () =>
      shows.reduce(
        (acc: SeriesWithWatchedKeys[][], show) => {
          if (show.status === "Ended") {
            acc[2].push(show);
          }
          if (show.next_episode_to_air) {
            acc[0].push(show);
          }
          if (show.status === "Returning Series" && !show.next_episode_to_air) {
            acc[1].push(show);
          }
          return acc;
        },
        [[], [], []] as SeriesWithWatchedKeys[][],
      ),
    [shows],
  );

  const showNodes = filtered.map((group, index) => (
    <div key={index}>
      <h1 className="text-2xl border-b-2 mb-2 p-2 sticky top-0 z-0 bg-card">
        {getShowStatus(index)}
      </h1>
      <div className="flex flex-col p-3 gap-2">
        {group.map((show) => (
          <ShowItem
            key={show.id}
            show={show}
            currShow={currShow}
            setCurrShow={setCurrShow}
            epsLeft={epsLeftFor(show)}
          />
        ))}
      </div>
    </div>
  ));

  return (
    <div className="flex flex-col w-1/3 rounded-md min-h-0">
      <h1 className="text-2xl sticky top-0 px-3 pt-3 pb-1 z-10 rounded-md">
        Shows
      </h1>
      <div className="flex flex-col gap-3 border-2 rounded-md overflow-y-auto scrollbar-hide mt-2 h-full min-h-0">
        {showNodes}
      </div>
    </div>
  );
}
