import type { GeoCoordinate } from "../weather/kmaGrid";
import type { DestinationCare } from "./recommendation";

export type PlaceSearchProvider = "fixture" | "kakao" | "google" | "openmeteo";

export type PlaceSearchResult = {
  id: string;
  name: string;
  address: string;
  category: DestinationCare["category"];
  countryCode: "KR" | "JP" | "GLOBAL";
  coordinate: GeoCoordinate;
  distanceMeters?: number;
  timezone: string;
  provider: PlaceSearchProvider;
};
