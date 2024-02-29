import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { Show } from "../lib/definitions";

type response = {
  status: string;
  data: Show[];
};

async function getShows() {
  const response = await fetch("https://api4.thetvdb.com/v4/series?page=0", {
    headers: { Authorization: `Bearer ${process.env.TVDB_TOKEN}` },
  });
  const data = await response.json();
  return data;
}

export default async function Page() {
  const { data }: response = await getShows();

  return (
    <div>
      {data.map((show: Show) => (
        <p key={show.id}>{show.name}</p>
      ))}
    </div>
  );
}
