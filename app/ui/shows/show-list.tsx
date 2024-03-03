"use client";
import { SeriesExtended, Show } from "@/app/lib/definitions";
import { Dispatch, SetStateAction } from "react";

function ShowItem({
  show,
  setCurrShow,
}: {
  show: Show;
  setCurrShow: Dispatch<SetStateAction<number>>;
}) {
  return (
    <div
      className="bg-red-800 rounded-md cursor-pointer hover:bg-red-600 transition duration-500 ease-in-out"
      key={show.id}
      onClick={() => setCurrShow(show.id)}
    >
      <p>{show.name}</p>
      <p>{show.lastAired}</p>
    </div>
  );
}

export default function ShowList({
  shows,
  setCurrShow,
}: {
  shows: Show[];
  setCurrShow: Dispatch<SetStateAction<number>>;
}) {
  return (
    <div className="flex flex-col w-1/3 gap-2">
      {shows &&
        shows.length > 0 &&
        shows.map((show: Show) => (
          <ShowItem
            key={show.id}
            show={show}
            setCurrShow={setCurrShow}
          ></ShowItem>
        ))}
    </div>
  );
}
