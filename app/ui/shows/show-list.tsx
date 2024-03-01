"use client";
import { SeriesExtended } from "@/app/lib/definitions";

function ShowItem({ show }: { show: SeriesExtended }) {
  return (
    <div key={show.id}>
      <p>{show.name}</p>
    </div>
  );
}

export default function ShowList({ shows }: { shows: SeriesExtended[] }) {
  return (
    <div>
      {shows.length > 0 &&
        shows.map((show: SeriesExtended) => (
          <ShowItem key={show.id} show={show}></ShowItem>
        ))}
    </div>
  );
}
