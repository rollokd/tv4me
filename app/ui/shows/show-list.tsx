"use client";
import { SeriesExtended, Show } from "@/app/lib/definitions";

function ShowItem({ show }: { show: Show }) {
  return (
    <div className="bg-red-800" key={show.id}>
      <p>{show.name}</p>
      <p>{show.nextAired}</p>
    </div>
  );
}

export default function ShowList({ shows }: { shows: Show[] }) {
  console.log("show list", shows);
  return (
    <div>
      {shows &&
        shows.length > 0 &&
        shows.map((show: Show) => (
          <ShowItem key={show.id} show={show}></ShowItem>
        ))}
    </div>
  );
}
