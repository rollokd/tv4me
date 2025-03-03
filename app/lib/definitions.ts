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
    profile_sizes: string[];
    still_sizes: string[];
  };
}

export interface Alias {
  language: string;
  name: string;
}

export interface Status {
  id: any;
  name: any;
  recordType: string;
  keepUpdated: boolean;
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
  genre_ids: any[];
  id: number;
  origin_country: any[];
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

export interface UserShow {
  showId: number;
  watched: boolean[];
  // _id: string;
}

export interface User {
  _id: string;
  shows: UserShow[];
}
export interface Artwork {
  height: number;
  id: number;
  image: string;
  includesText: boolean;
  language: string;
  score: number;
  thumbnail: string;
  type: number;
  width: number;
}

export interface Companies {
  studio: Studio[];
  network: Network[];
  production: Production[];
  distributor: Distributor[];
}

export interface Studio {
  activeDate: string;
  aliases: Alias[];
  country: string;
  id: number;
  inactiveDate: string;
  name: string;
  nameTranslations: string[];
  overviewTranslations: string[];
  primaryCompanyType: number;
  slug: string;
  tagOptions: TagOption[];
}

export interface Alias {
  language: string;
  name: string;
}

export interface TagOption {
  helpText: string;
  id: number;
  name: string;
  tag: number;
  tagName: string;
}

export interface Network {
  activeDate: string;
  country: string;
  id: number;
  inactiveDate: string;
  name: string;
  nameTranslations: string[];
  overviewTranslations: string[];
  primaryCompanyType: number;
  slug: string;
}

export interface Production {
  activeDate: string;
  country: string;
  id: number;
  inactiveDate: string;
  name: string;
  nameTranslations: string[];
  overviewTranslations: string[];
  primaryCompanyType: number;
  slug: string;
}

export interface Distributor {
  activeDate: string;
  country: string;
  id: number;
  inactiveDate: string;
  name: string;
  nameTranslations: string[];
  overviewTranslations: string[];
  primaryCompanyType: number;
  slug: string;
}

export interface EpisodeSeries {
  aired: string;
  airsAfterSeason: number;
  airsBeforeEpisode: number;
  airsBeforeSeason: number;
  finaleType: string;
  id: number;
  image: string;
  imageType: number;
  isMovie: number;
  lastUpdated: string;
  linkedMovie: number;
  name: string;
  nameTranslations: string[];
  number: number;
  overview: string;
  overviewTranslations: string[];
  runtime: number;
  seasonNumber: number;
  seasons: Season[];
  seriesId: number;
  seasonName: string;
  year: string;
}

export interface Season {
  id: number;
  image: string;
  imageType: number;
  lastUpdated: string;
  name: string;
  nameTranslations: string[];
  number: number;
  overviewTranslations: string[];
  seriesId: number;
  type: Type;
  year: string;
}

export interface Type {
  alternateName: string;
  id: number;
  name: string;
  type: string;
}

export type SeriesExtended = {
  adult: boolean;
  backdrop_path: string;
  created_by: CreatedByItem[];
  episode_run_time: any[];
  first_air_date: string;
  genres: GenresItem[];
  homepage: string;
  id: number;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: Last_episode_to_air;
  name: string;
  next_episode_to_air: Next_episode_to_air;
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

// export interface Trailer {
//   id: number;
//   language: string;
//   name: string;
//   url: string;
//   runtime: number;
// }

// export interface Type2 {
//   alternateName: string;
//   id: number;
//   name: string;
//   type: string;
// }

// export interface TagOption11 {
//   helpText: string;
//   id: number;
//   name: string;
//   tag: number;
//   tagName: string;
// }

// export interface Translation {
//   aliases: string[];
//   isAlias: boolean;
//   isPrimary: boolean;
//   language: string;
//   name: string;
//   overview: string;
//   tagline: string;
// }
