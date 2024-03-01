"use client";
import { SeriesExtended, User } from "@/app/lib/definitions";
import { useEffect, useState } from "react";
import ShowList from "./show-list";

export default function ShowsTable({ id }: { id: string }) {
  console.log("got id", id);
  const [user, setUser] = useState<User>({ _id: "", shows: [] });
  const [shows, setShows] = useState<SeriesExtended[]>([]);
  // const [show, setShow] = useState<Show | null>(null);
  // const [episodes, setEpisodes] = useState<EpisodeSeries[]>([]);
  // const [currEpisode, setCurrEpisode] = useState<number>(0);
  // console.log("show table", shows);

  useEffect(() => {
    const fetchUser = async () => {
      console.log("fetching user");
      const response = await fetch(`http://localhost:3000/api/shows/${id}`);
      const data: { user: User; shows: SeriesExtended[] } =
        await response.json();
      console.log("fetched data for table:", data);
      setUser(data.user);
      setShows(data.shows);
    };

    fetchUser();
  }, [id]);

  return (
    <div className="flex flex-col bg-color-red">
      <ShowList shows={shows} />
    </div>
  );
}
