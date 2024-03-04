"use client";
import { SeriesExtended, Show, User } from "@/app/lib/definitions";
import { Suspense, useEffect, useState } from "react";
import ShowList from "./show-list";
import EpisodeList from "./episode-list";
import EpisodeItem from "./episode-info";

export default function ShowsTable({ id }: { id: string }) {
  const [user, setUser] = useState<User>({ _id: "", shows: [] });
  const [series, setSeries] = useState<SeriesExtended[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [currShow, setCurrShow] = useState<number>(121361); //default to zero
  const [currEpisode, setCurrEpisode] = useState<number>(0);

  const episodes = series.find((s) => s.id === currShow)?.episodes;
  const watchedList = user.shows.find((s) => s.showId === currShow)?.watched;

  useEffect(() => {
    const fetchUser = async () => {
      // console.log("fetching user");
      const response = await fetch(`http://localhost:3000/api/shows/${id}`, {
        next: { tags: ["userData"] },
      });
      const data: { user: User; series: SeriesExtended[]; seriesData: Show[] } =
        await response.json();
      // console.log("fetched data for table:", data);
      setUser(data.user);
      setSeries(data.series);
      setShows(data.seriesData);
    };

    fetchUser();
  }, [id]);

  // console.log("episodes", series.find((s) => s.id === currShow)?.episodes);

  return (
    <div className="flex flex-row bg-gray-800 gap-12 p-3">
      {shows.length ? (
        <ShowList shows={shows} setCurrShow={setCurrShow} />
      ) : (
        <div>No Shows Yet</div>
      )}
      {shows.length ? (
        <EpisodeList
          user={user}
          setUser={setUser}
          currShow={currShow}
          episodes={episodes}
          setCurrEpisode={setCurrEpisode}
          watchedList={watchedList}
        />
      ) : (
        <div>Loading...</div>
      )}
      <EpisodeItem episode={episodes?.find((e) => e.id === currEpisode)} />
    </div>
  );
}
