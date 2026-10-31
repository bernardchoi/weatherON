import type { GeoCoordinate } from "../weather/kmaGrid";
import type { DestinationCare } from "./recommendation";

export type PlaceSearchProvider = "fixture" | "kakao" | "google" | "openmeteo";

export type PlaceSearchResult = {
  id: string;
  name: string;
  address: string;
  category: DestinationCare["category"];
  countryCode: "KR" | "JP" | "GLOBAL";
  /** Provider country; countryCode is the legacy weather/routing region. */
  countryIsoCode?: string;
  coordinate: GeoCoordinate;
  distanceMeters?: number;
  timezone: string;
  provider: PlaceSearchProvider;
};
