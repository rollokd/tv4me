import {
  SeriesExtended,
  SeriesResponse,
  Show,
  Response,
  SearchResponse,
  EpisodeSeries,
  ConfigurationResponse,
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
    })
  );
  return resp;
}

export async function getShow(id: number): Promise<SeriesExtended> {
  const response = await fetch(`${BASE_URL}/tv/${id}`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}` },
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
  console.log(resp);
  return resp;
}

export async function getSeriesInfo(id: number): Promise<SeriesExtended> {
  const response = await fetch(`${BASE_URL}/tv/${id}`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}` },
  });
  const data: SeriesExtended = await response.json();
  console.log(data.seasons);
  const episodes = data.seasons
    .filter(
      (season) => season.name !== "Specials" || season.season_number !== 0
    )
    .map(async (season) => {
      if (season.season_number === 0) return;
      return fetch(`${BASE_URL}/tv/${id}/season/${season.season_number}`, {
        headers: { Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}` },
      }).then((res) => res.json());
    });
  data.seasons = await Promise.all(episodes);
  console.log(data.seasons[0]);
  return data;
}

export async function getEpisodes(id: number): Promise<number> {
  const response = await fetch(`${BASE_URL}/tv/${id}`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}` },
  });
  const data: SeriesExtended = await response.json();
  console.log(data);
  return data.number_of_episodes;
}

export async function getSearchResults(
  query: string
): Promise<Response<SearchResponse[]>> {
  const response = await fetch(
    `${BASE_URL}/search/tv?query=${query}&include_adult=true&language=en-US&page=1`,
    {
      headers: { Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}` },
    }
  );
  const data = await response.json();
  console.log(data);
  return data.results;
}

export async function getConfiguration(): Promise<ConfigurationResponse> {
  const response = await fetch(`${BASE_URL}/configuration`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}` },
  });
  const data = await response.json();
  return data;
}
