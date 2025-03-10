"use client";
import { SeriesExtended } from "@/app/lib/definitions";

import Image from "next/image";
import clsx from "clsx";
import { imageLoader, prettyDate } from "@/app/lib/client-utils";
import { useState } from "react";

function ShowItem({
  show,
  currShow,
  setCurrShow,
  epsLeft,
}: {
  show: SeriesExtended;
  currShow: number;
  setCurrShow: (showId: number, ep: number) => void;
  epsLeft: number;
}) {
  const nextEpisodeId = show.seasons[0]?.episodes?.[0]?.id ?? null;

  return (
    <div
      className={clsx(
        currShow === show.id && "border-blue-600",
        "flex flex-row items-center border-2 rounded-md cursor-pointer transition duration-500 ease-in-out hover:bg-blue-600 active:bg-blue-600",
      )}
      key={show.id}
      onClick={() => setCurrShow(show.id, nextEpisodeId ?? 0)}
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
        <p className="text-xs md:text-sm">
          {show.next_episode_to_air ? (
            <>Next Airdate: {prettyDate(show.next_episode_to_air.air_date)}</>
          ) : (
            <>Last Airdate: {prettyDate(show.last_air_date)}</>
          )}
        </p>
        <p className="text-xs md:text-sm">
          Episodes Left: {epsLeft === 0 ? "Finished" : epsLeft}
        </p>
      </div>
    </div>
  );
}

export default function ShowList({ shows }: { shows: SeriesExtended[] }) {
  const [currShow, setCurrShow] = useState(0);
  const getShowStatus = (index: number) => {
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
  };

  function getEpsLeft() {
    // const userShow = user.shows.find((s) => s.showId === currShow);
    // return userShow && userShow.watched.filter((w) => w === false).length;
    return 0;
  }

  const filtered = shows.reduce(
    (acc: SeriesExtended[][], show) => {
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
    [[], [], []],
  );

  const showNodes = filtered.map((shows, index) => {
    return (
      <div key={index}>
        <h1 className="text-2xl border-b-2 mb-2 p-2 sticky top-0 z-0 bg-card">
          {getShowStatus(index)}
        </h1>
        <div className="flex flex-col p-3 gap-2">
          {shows.map((show) => (
            <ShowItem
              key={show.id}
              show={show}
              currShow={currShow}
              setCurrShow={setCurrShow}
              epsLeft={getEpsLeft() || 0}
            ></ShowItem>
          ))}
        </div>
      </div>
    );
  });

  return (
    <div className="flex flex-col w-1/3 rounded-md">
      <h1 className="text-2xl sticky top-0 px-3 pt-3 pb-1 z-10 rounded-md">
        Shows
      </h1>
      <div className="flex flex-col gap-3 border-2 rounded-md overflow-y-auto scrollbar-hide mt-2 h-full">
        {showNodes ? (
          showNodes
        ) : (
          <div className="flex flex-col w-1/3 overflow-y-auto scrollbar-hide rounded-md">
            No Shows Yet
          </div>
        )}
      </div>
    </div>
  );
}
