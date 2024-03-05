"use client";
import { useEffect, useState } from "react";

import { SeriesExtended, Show, User } from "@/app/lib/definitions";

import EpisodeItem from "./episode-info";
import EpisodeList from "./episode-list";
import ShowList from "./show-list";
import { getShowsAndEpsFromId } from "@/app/lib/actions";

export default function ShowsTable({ id }: { id: string }) {
  const [user, setUser] = useState<User>({ _id: "", shows: [] });
  const [series, setSeries] = useState<SeriesExtended[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [currShow, setCurrShow] = useState<number>(121361); //default to zero
  const [currEpisode, setCurrEpisode] = useState<number>(0);

  const episodes = series.length
    ? series.find((s) => s.id === currShow)?.episodes
    : undefined;
  const watchedList = user
    ? user.shows.find((s) => s.showId === currShow)?.watched
    : undefined;

  useEffect(() => {
    const fetchUser = async () => {
      // console.log("fetching user");
      // const response = await fetch(`http://localhost:3000/api/shows/${id}`, {
      //   next: { tags: ["userData"] },
      // });
      // const data: { user: User; series: SeriesExtended[]; seriesData: Show[] } =
      //   await response.json();
      // console.log("fetched data for table:", data);
      const json = await getShowsAndEpsFromId(id);
      console.log("fetched data for table:", json);
      const data = JSON.parse(json);
      if (data === "failed") return console.log("failed to fetch data");
      setUser(data.user);
      setSeries(data.series);
      setShows(data.seriesData);
    };

    fetchUser();
  }, [id]);

  // console.log("episodes", series.find((s) => s.id === currShow)?.episodes);

  return (
    <div className="flex flex-row bg-gray-600 gap-3 p-5 overflow-y-auto h-full">
      {shows.length ? (
        <ShowList shows={shows} currShow={currShow} setCurrShow={setCurrShow} />
      ) : (
        <div className="flex flex-col w-1/3 overflow-y-auto scrollbar-hide bg-gray-950 rounded-md">
          No Shows Yet
        </div>
      )}
      {shows.length ? (
        <EpisodeList
          user={user}
          setUser={setUser}
          currShow={currShow}
          currEpisode={currEpisode}
          episodes={episodes}
          setCurrEpisode={setCurrEpisode}
          watchedList={watchedList}
        />
      ) : (
        <div className="flex flex-col w-1/3 bg-gray-950 rounded-md">
          Loading...
        </div>
      )}
      <EpisodeItem episode={episodes?.find((e) => e.id === currEpisode)} />
    </div>
  );
}
