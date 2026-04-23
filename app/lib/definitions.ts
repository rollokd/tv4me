/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Response<T> {
  data: T;
  status: string;
}

export interface ConfigurationResponse {
  images: {
    secure_base_url: string;
    backdrop_sizes: string[];
    logo_sizes: string[];
    poster_sizes: string[];
    still_sizes: string[];
  };
}

export interface Episode {
  air_date: string;
  episode_number: number;
  episode_type: string;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string;
  vote_average: number;
  vote_count: number;
  crew: CrewItem[];
  guest_stars: GuestStarsItem[];
}

interface CrewItem {
  job: string;
  department: string;
  credit_id: string;
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
}

interface GuestStarsItem {
  character: string;
  credit_id: string;
  order: number;
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
}

export interface SearchResponse {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  first_air_date: string;
  name: string;
  vote_average: number;
  vote_count: number;
}

export type SeriesExtended = {
  adult: boolean;
  backdrop_path: string;
  created_by: CreatedByItem[];
  episode_run_time: number[];
  first_air_date: string;
  genres: GenresItem[];
  homepage: string;
  id: number;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: Last_episode_to_air | null;
  name: string;
  next_episode_to_air: Next_episode_to_air | null;
  networks: NetworksItem[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: ProductionCompaniesItem[];
  production_countries: ProductionCountriesItem[];
  seasons: SeasonsItem[];
  spoken_languages: SpokenLanguagesItem[];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
};

interface CreatedByItem {
  id: number;
  credit_id: string;
  name: string;
  original_name: string;
  gender: number;
  profile_path: string;
}

interface GenresItem {
  id: number;
  name: string;
}

interface Last_episode_to_air {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  episode_type: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string;
}

interface Next_episode_to_air {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  episode_type: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string;
}

interface NetworksItem {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
}

interface ProductionCompaniesItem {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
}

interface ProductionCountriesItem {
  iso_3166_1: string;
  name: string;
}

interface SeasonsItem {
  air_date: string;
  episode_count?: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  episodes?: Episode[];
  vote_average: number;
}

interface SpokenLanguagesItem {
  english_name: string;
  iso_639_1: string;
  name: string;
}
