import { SeriesExtended, SeriesResponse } from "./definitions";
import { getUser } from "./users";

export async function getShows() {
  const response = await fetch("https://api4.thetvdb.com/v4/series?page=0", {
    headers: { Authorization: `Bearer ${process.env.TVDB_TOKEN}` },
  });
  const data = await response.json();
  return data;
}

export async function getShow(id: number) {
  const response = await fetch(`https://api4.thetvdb.com/v4/series/${id}`, {
    headers: { Authorization: `Bearer ${process.env.TVDB_TOKEN}` },
  });
  const data = await response.json();
  return data;
}

export async function getUsersShowsAndEpisodes(shows: number[]) {
  const resp = await Promise.all(
    shows.map((show) => {
      return getSeriesInfo(show);
    })
  );
  return resp;
}

export async function getSeriesInfo(id: number): Promise<SeriesResponse> {
  const response = await fetch(
    `https://api4.thetvdb.com/v4/series/${id}/extended?meta=episodes&short=true`,
    {
      headers: { Authorization: `Bearer ${process.env.TVDB_TOKEN}` },
    }
  );
  const data = await response.json();
  return data;
}
