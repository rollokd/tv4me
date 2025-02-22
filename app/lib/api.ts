import {
  SeriesExtended,
  SeriesResponse,
  Show,
  Response,
  SearchResponse,
  EpisodeSeries,
} from "./definitions";

const BASE_URL = "https://api.themoviedb.org/3/";

export async function getShows() {
  const response = await fetch(BASE_URL + "trending/tv/day?page=0", {
    headers: { Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}` },
  });
  const data = await response.json();
  return data;
}

export async function getShowsList(shows: number[]) {
  const resp = await Promise.all(
    shows.map((show) => {
      return getShow(show);
    }),
  );
  return resp;
}

export async function getShow(id: number): Promise<Response<Show>> {
  const response = await fetch(`https://api4.thetvdb.com/v4/series/${id}`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}` },
  });
  const data = await response.json();
  return data;
}

export async function getUsersShowsAndEpisodes(shows: number[]) {
  const resp = await Promise.all(
    shows.map((show) => {
      return getSeriesInfo(show);
    }),
  );
  return resp;
}

export async function getSeriesInfo(id: number): Promise<SeriesResponse> {
  const response = await fetch(`${BASE_URL}/tv/${id}`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}` },
  });
  const data = await response.json();
  return data;
}

export async function getEpsNumber(id: number): Promise<number> {
  const response = await fetch(
    `https://api4.thetvdb.com/v4/series/${id}/extended?meta=episodes&short=true`,
    {
      headers: { Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}` },
    },
  );
  const data = await response.json();
  return data.data.episodes.filter(
    (ep: EpisodeSeries) => ep.seasonNumber !== 0 && ep.aired !== null,
  ).length;
}

export async function getSearchResults(
  query: string,
): Promise<Response<SearchResponse[]>> {
  const response = await fetch(
    `${BASE_URL}/search/tv?query=${query}&include_adult=true&language=en-US&page=1`,
    {
      headers: { Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}` },
    },
  );
  const data = await response.json();
  console.log(data);
  return data;
}
