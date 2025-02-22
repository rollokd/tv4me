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
  const [currShow, setCurrShow] = useState<number>(0);
  const [currEpisode, setCurrEpisode] = useState<number>(0);

  useEffect(() => {
    const fetchUser = async () => {
      const json = await getShowsAndEpsFromId(id);
      const data = JSON.parse(json);
      if (data === "failed") return console.log("failed to fetch data");
      console.log(data);
      setUser(data.user);
      setSeries(data.series);
      setShows(data.seriesData);
      if (data.series.length) setCurrShowAndEpFromSeries(data.series[0]);
    };

    fetchUser();
  }, [id]);

  console.log(series);

  if (!series) return null;

  const episodes = series.length
    ? series.find((s) => s.id === currShow)?.episodes
    : undefined;
  const watchedList = user
    ? user.shows.find((s) => s.showId === currShow)?.watched
    : undefined;

  const sortedShows =
    shows &&
    shows.sort((a, b) => {
      return new Date(b.lastAired).getTime() - new Date(a.lastAired).getTime();
    });

  const setCurrShowAndEpFromSeries = (series: SeriesExtended) => {
    if (series && series.id) {
      setCurrShow(series.id);
      setCurrEpisode(series.episodes.filter((e) => e.seasonNumber !== 0)[0].id);
    }
  };
  const setCurrShowAndEp = (showId: number, ep: number) => {
    setCurrShow(showId);
    setCurrEpisode(ep);
  };

  return (
    <div className="flex flex-row bg-gray-600 gap-3 p-5 overflow-y-auto h-full">
      {shows.length ? (
        <ShowList
          user={user}
          shows={sortedShows}
          currShow={currShow}
          setCurrShow={setCurrShowAndEp}
          series={series}
        />
      ) : (
        <div className="p-5 text-white flex flex-col text-2xl w-1/3 overflow-y-auto scrollbar-hide bg-gray-950 rounded-md">
          No Shows Yet <br />
          <p className="text-lg">Try searching for a new show</p>
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
        <div className="p-5 text-white text-2xl flex flex-col w-1/3 bg-gray-950 rounded-md">
          No Show Selected
        </div>
      )}
      <EpisodeItem episode={episodes?.find((e) => e.id === currEpisode)} />
    </div>
  );
}
