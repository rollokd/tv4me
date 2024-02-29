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
