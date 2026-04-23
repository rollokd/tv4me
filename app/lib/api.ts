import {
  SeriesExtended,
  SearchResponse,
  ConfigurationResponse,
} from "./definitions";
import { getUserShows, getWatchedEpisodes } from "./shows";

const BASE_URL = "https://api.themoviedb.org/3/";

function authHeader() {
  const token = process.env.TMDB_READ_TOKEN;
  if (!token) {
    throw new Error("TMDB_READ_TOKEN is not set");
  }
  return { Authorization: `Bearer ${token}` };
}

async function tmdbJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: authHeader() });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`TMDB ${response.status}: ${text.slice(0, 200)}`);
  }
  return response.json() as Promise<T>;
}

export type SeriesWithWatchedKeys = SeriesExtended & {
  watchedEpisodeKeys: string[];
};

export async function getShows() {
  return tmdbJson<unknown>(BASE_URL + "trending/tv/day?page=1");
}

export async function getShowsList(userId: string) {
  const library = await getUserShows(userId);
  const showIds = library.map((row) => row.tmdbTvId);
  return Promise.all(showIds.map((showId) => getShow(showId)));
}

export async function getShow(id: number): Promise<SeriesExtended> {
  return tmdbJson<SeriesExtended>(`${BASE_URL}/tv/${id}`);
}

export async function getUsersShowsAndEpisodesWithProgress(
  userId: string,
): Promise<SeriesWithWatchedKeys[]> {
  const library = await getUserShows(userId);
  const watchedLists = await Promise.all(
    library.map((row) =>
      getWatchedEpisodes(userId, row.tmdbTvId, 0).then((we) => ({
        tmdbTvId: row.tmdbTvId,
        keys: we.map((w) => `${w.seasonNumber}:${w.episodeNumber}`),
      })),
    ),
  );
  const watchedByShow = new Map(
    watchedLists.map((w) => [w.tmdbTvId, w.keys] as const),
  );

  const resp = await Promise.all(
    library.map((row) => getSeriesInfo(row.tmdbTvId)),
  );

  return resp.map((series) => ({
    ...series,
    watchedEpisodeKeys: watchedByShow.get(series.id) ?? [],
  }));
}

/** @deprecated Use getUsersShowsAndEpisodesWithProgress */
export async function getUsersShowsAndEpisodes(userId: string) {
  return getUsersShowsAndEpisodesWithProgress(userId);
}

export async function getSeriesInfo(id: number): Promise<SeriesExtended> {
  const data = await tmdbJson<SeriesExtended>(`${BASE_URL}/tv/${id}`);
  const seasonEntries = (data.seasons ?? []).filter((s) => s.season_number > 0);
  data.seasons = await Promise.all(
    seasonEntries.map((season) =>
      tmdbJson<SeriesExtended["seasons"][number]>(
        `${BASE_URL}/tv/${id}/season/${season.season_number}`,
      ),
    ),
  );
  return data;
}

export async function getEpisodes(id: number): Promise<number> {
  const data = await tmdbJson<SeriesExtended>(`${BASE_URL}/tv/${id}`);
  return data.number_of_episodes;
}

export async function getSearchResults(query: string): Promise<SearchResponse[]> {
  const params = new URLSearchParams({
    query,
    include_adult: "true",
    language: "en-US",
    page: "1",
  });
  const data = await tmdbJson<{ results?: SearchResponse[] }>(
    `${BASE_URL}/search/tv?${params.toString()}`,
  );
  return data.results ?? [];
}

export async function getConfiguration(): Promise<ConfigurationResponse> {
  return tmdbJson<ConfigurationResponse>(`${BASE_URL}/configuration`);
}
