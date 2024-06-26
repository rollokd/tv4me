"use client";
import { SeriesExtended, Show, User } from "@/app/lib/definitions";
import Image from "next/image";
import clsx from "clsx";
import { prettyDate } from "@/app/lib/client-utils";

function ShowItem({
  show,
  currShow,
  setCurrShow,
  firstEp,
  epsLeft,
}: {
  show: Show;
  currShow: number;
  setCurrShow: Function;
  firstEp: number;
  epsLeft: number;
}) {
  return (
    <div
      className={clsx(
        currShow === show.id && "bg-blue-600",
        "flex flex-row items-center border-2 border-white text-white rounded-md cursor-pointer transition duration-500 ease-in-out hover:bg-blue-600 active:bg-blue-600"
      )}
      key={show.id}
      onClick={() => setCurrShow(show.id, firstEp)}
    >
      <Image
        className="w-auto h-full rounded-md"
        width={75}
        height={75}
        src={show.image}
        alt={show.name}
      ></Image>
      <div className="flex flex-col p-2">
        <p className="md:text-xl">{show.name}</p>
        <p className="text-xs md:text-sm">
          Airdate: {prettyDate(show.lastAired)}
        </p>
        <p className="text-xs md:text-sm">Episodes Left: {epsLeft}</p>
      </div>
    </div>
  );
}

export default function ShowList({
  user,
  shows,
  currShow,
  setCurrShow,
  series,
}: {
  user: User;
  shows: Show[];
  currShow: number;
  setCurrShow: Function;
  series: SeriesExtended[];
}) {
  const getShowStatus = (index: number) => {
    switch (index) {
      case 0:
        return "Upcoming";
      case 1:
        return "To Be Announced";
      case 2:
        return "Ended";
    }
  };

  const getFirstEp = (series: SeriesExtended) => {
    return series.episodes.filter((e) => e.seasonNumber === 1)[0].id;
  };

  function getEpsLeft(currShow: number) {
    const userShow = user.shows.find((s) => s.showId === currShow);
    return userShow && userShow.watched.filter((w) => w === false).length;
  }

  const filtered = shows.reduce(
    (acc: Show[][], show) => {
      if (show.status.name === "Ended") {
        acc[2].push(show);
      }
      if (show.nextAired) {
        acc[0].push(show);
      }
      if (show.status.name === "Continuing" && !show.nextAired) {
        acc[1].push(show);
      }
      return acc;
    },
    [[], [], []]
  );

  const showNodes = filtered.map((shows, index) => {
    return (
      <div key={index}>
        <h1 className="text-2xl text-white border-b-2 border-white mb-2 p-2 sticky top-0 bg-gray-950 z-0">
          {getShowStatus(index)}
        </h1>
        <div className="flex flex-col p-3 gap-2">
          {shows.map((show) => (
            <ShowItem
              key={show.id}
              show={show}
              currShow={currShow}
              setCurrShow={setCurrShow}
              firstEp={getFirstEp(
                series.find((s) => s.id === show.id) || series[0]
              )}
              epsLeft={getEpsLeft(show.id) || 0}
            ></ShowItem>
          ))}
        </div>
      </div>
    );
  });

  return (
    <div className="flex flex-col w-1/3 bg-gray-950 rounded-md">
      <h1 className="text-white bg-gray-950 text-2xl sticky top-0 px-3 pt-3 pb-1 z-10 rounded-md">
        Shows
      </h1>
      <div className="flex flex-col gap-3 border-2 border-white rounded-md overflow-y-auto scrollbar-hide mt-2">
        {showNodes ? (
          showNodes
        ) : (
          <div className="flex flex-col w-1/3 overflow-y-auto scrollbar-hide bg-gray-950 rounded-md">
            No Shows Yet
          </div>
        )}
      </div>
    </div>
  );
}
