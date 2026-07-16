import type { PlaceSearchResult } from "@weatheron/shared";

type SearchOrigin = {
  coordinate: PlaceSearchResult["coordinate"];
};

export function sortPlaceSearchResults(
  places: PlaceSearchResult[],
  query: string,
  origin?: SearchOrigin | null,
): PlaceSearchResult[] {
  return places
    .map((place, index) => ({
      place,
      index,
      textRank: getTextMatchRank(place, query),
      distanceMeters: origin ? getCoordinateDistanceMeters(origin.coordinate, place.coordinate) : 0,
    }))
    .sort((a, b) => {
      if (!origin) return a.textRank - b.textRank || a.index - b.index;
      return (
        a.distanceMeters - b.distanceMeters ||
        a.textRank - b.textRank ||
        a.index - b.index
      );
    })
    .map((item) => item.place);
}

export function getCoordinateDistanceMeters(
  origin: PlaceSearchResult["coordinate"],
  destination: PlaceSearchResult["coordinate"],
) {
  const earthRadiusMeters = 6371000;
  const lat1 = toRadians(origin.latitude);
  const lat2 = toRadians(destination.latitude);
  const deltaLat = toRadians(destination.latitude - origin.latitude);
  const deltaLon = toRadians(destination.longitude - origin.longitude);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getTextMatchRank(place: PlaceSearchResult, query: string) {
  const normalizedQuery = normalizeText(query);
  const normalizedName = normalizeText(place.name);
  const normalizedAddress = normalizeText(place.address);
  if (!normalizedQuery || normalizedName === normalizedQuery) return 0;
  if (normalizedName.startsWith(normalizedQuery)) return 1;
  if (normalizedName.includes(normalizedQuery)) return 2;
  if (normalizedAddress.includes(normalizedQuery)) return 3;
  return 4;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
