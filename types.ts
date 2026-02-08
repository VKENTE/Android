
export interface ToiletLocation {
  title: string;
  uri: string;
  snippets?: string[];
  distance?: string;
}

export interface SearchResult {
  text: string;
  locations: ToiletLocation[];
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}
