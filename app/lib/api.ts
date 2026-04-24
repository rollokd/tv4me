import {
  SeriesExtended,
  SearchResponse,
  ConfigurationResponse,
} from "./definitions";
import { cache } from "react";

const BASE_URL = "https://api.themoviedb.org/3/";
const TMDB_REVALIDATE_SECONDS = 60 * 60;
const TMDB_MAX_RETRIES = 2;

function authHeader() {
  const token = process.env.TMDB_READ_TOKEN;
  if (!token) {
    throw new Error("TMDB_READ_TOKEN is not set");
  }
  return { Authorization: `Bearer ${token}` };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tmdbJson<T>(url: string, attempt = 0): Promise<T> {
  const response = await fetch(url, {
    headers: authHeader(),
    next: { revalidate: TMDB_REVALIDATE_SECONDS },
  });

  if (response.status === 429 && attempt < TMDB_MAX_RETRIES) {
    const retryAfterSeconds = Number(
      response.headers.get("retry-after") ?? "1",
    );
    const waitMs =
      Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
        ? retryAfterSeconds * 1000
        : 1000 * (attempt + 1);
    await sleep(waitMs);
    return tmdbJson<T>(url, attempt + 1);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`TMDB ${response.status}: ${text.slice(0, 200)}`);
  }
  return response.json() as Promise<T>;
}

export async function getShows() {
  return tmdbJson<unknown>(BASE_URL + "trending/tv/day?page=1");
}

export const getShow = cache(async (id: number): Promise<SeriesExtended> => {
  return tmdbJson<SeriesExtended>(`${BASE_URL}/tv/${id}`);
});

export const getSeriesInfo = cache(
  async (id: number): Promise<SeriesExtended> => {
    const data = await tmdbJson<SeriesExtended>(`${BASE_URL}/tv/${id}`);
    const seasonEntries = (data.seasons ?? []).filter(
      (s) => s.season_number > 0,
    );
    data.seasons = await Promise.all(
      seasonEntries.map((season) =>
        tmdbJson<SeriesExtended["seasons"][number]>(
          `${BASE_URL}/tv/${id}/season/${season.season_number}`,
        ),
      ),
    );
    return data;
  },
);

export async function getEpisodes(id: number): Promise<number> {
  const data = await tmdbJson<SeriesExtended>(`${BASE_URL}/tv/${id}`);
  return data.number_of_episodes;
}

export async function getSearchResults(
  query: string,
): Promise<SearchResponse[]> {
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
