"use client";
import { SeriesExtended, Show } from "@/app/lib/definitions";
import { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import clsx from "clsx";
import { prettyDate } from "@/app/lib/client-utils";

function ShowItem({
  show,
  currShow,
  setCurrShow,
}: {
  show: Show;
  currShow: number;
  setCurrShow: Dispatch<SetStateAction<number>>;
}) {
  return (
    <div
      className={clsx(
        currShow === show.id && "bg-blue-600",
        "flex flex-row items-center border-2 border-white text-white rounded-md cursor-pointer transition duration-500 ease-in-out hover:bg-blue-600 active:bg-blue-600"
      )}
      key={show.id}
      onClick={() => setCurrShow(show.id)}
    >
      <Image
        className="rounded-md"
        width={100}
        height={100}
        src={show.image}
        alt={show.name}
      ></Image>
      <div className="flex flex-col p-2">
        <p className="text-xl">{show.name}</p>
        <p className="text-s">Airdate: {prettyDate(show.lastAired)}</p>
      </div>
    </div>
  );
}

export default function ShowList({
  shows,
  currShow,
  setCurrShow,
}: {
  shows: Show[];
  currShow: number;
  setCurrShow: Dispatch<SetStateAction<number>>;
}) {
  const sortedShows = shows.sort((a, b) => {
    return new Date(b.lastAired).getTime() - new Date(a.lastAired).getTime();
  });

  return (
    <div className="flex flex-col w-1/3 overflow-y-auto scrollbar-hide bg-gray-950 rounded-md">
      <h1 className="text-white bg-gray-950 text-2xl sticky top-0 px-3 pt-3 pb-1">
        Shows
      </h1>
      <div className="flex flex-col gap-3 px-3 pb-3 pt-2">
        {sortedShows && sortedShows.length > 0 ? (
          sortedShows.map((show: Show) => (
            <ShowItem
              key={show.id}
              show={show}
              currShow={currShow}
              setCurrShow={setCurrShow}
            ></ShowItem>
          ))
        ) : (
          <div className="flex flex-col w-1/3 overflow-y-auto scrollbar-hide bg-gray-950 rounded-md">
            No Shows Yet
          </div>
        )}
      </div>
    </div>
  );
}
