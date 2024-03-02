"use client";
import { SeriesExtended, Show, User } from "@/app/lib/definitions";
import { Suspense, useEffect, useState } from "react";
import ShowList from "./show-list";

export default function ShowsTable({ id }: { id: string }) {
  // console.log("got id", id);
  const [user, setUser] = useState<User>({ _id: "", shows: [] });
  const [series, setSeries] = useState<SeriesExtended[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  // const [episodes, setEpisodes] = useState<EpisodeSeries[]>([]);
  // const [currEpisode, setCurrEpisode] = useState<number>(0);

  useEffect(() => {
    const fetchUser = async () => {
      // console.log("fetching user");
      const response = await fetch(`http://localhost:3000/api/shows/${id}`);
      const data: { user: User; series: SeriesExtended[]; seriesData: Show[] } =
        await response.json();
      // console.log("fetched data for table:", data);
      setUser(data.user);
      setSeries(data.series);
      setShows(data.seriesData);
    };

    fetchUser();
  }, [id]);

  return (
    <div className="flex flex-col bg-blue-800 w-1/3">
      {shows.length ? <ShowList shows={shows} /> : <div>No Shows Yet</div>}
    </div>
  );
}
