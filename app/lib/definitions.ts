export interface Response<T> {
  data: T;
  status: string;
}

export interface Show {
  id: number;
  name: string;
  slug: string;
  image: string;
  nameTranslations: string[];
  overviewTranslations: string[];
  aliases: Alias[];
  firstAired: string;
  lastAired: string;
  nextAired: string;
  score: number;
  status: Status;
  originalCountry: string;
  originalLanguage: string;
  defaultSeasonType: number;
  isOrderRandomized: boolean;
  lastUpdated: string;
  averageRuntime: number;
  episodes: any;
  overview: string;
  year: string;
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
  id: number;
  seriesId: number;
  name: string;
  aired: string;
  runtime: number;
  nameTranslations: any;
  overview: string;
  overviewTranslations: any;
  image: string;
  imageType: number;
  isMovie: number;
  seasons: any;
  number: number;
  seasonNumber: number;
  lastUpdated: string;
  finaleType: string;
  year: string;
}

export interface SearchResponse {
  objectID: string;
  aliases: string[];
  country: string;
  id: string;
  image_url: string;
  name: string;
  first_air_time: string;
  overview: string;
  primary_language: string;
  primary_type: string;
  status: string;
  type: string;
  tvdb_id: string;
  year: string;
  slug: string;
  network: string;
  thumbnail: string;
}

export interface UserShow {
  showId: number;
  watched: boolean[];
  _id: string;
}

export interface User {
  _id: string;
  shows: UserShow[];
}

export interface SeriesResponse {
  data: SeriesExtended;
  status: string;
}

export interface SeriesExtended {
  artwork: Artwork[];
  companies: Companies;
  episodes: EpisodeSeries[];
  id: number;
  image: string;
  imageType: number;
  lastUpdated: string;
  name: string;
  // nameTranslations: string[];
  number: number;
  // overviewTranslations: string[];
  seriesId: number;
  // trailers: Trailer[];
  // type: Type2;
  // tagOptions: TagOption11[];
  // translations: Translation[];
  year: string;
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
