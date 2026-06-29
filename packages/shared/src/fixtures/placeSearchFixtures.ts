import type { PlaceSearchResult } from "../types/places";

export const placeSearchFixtures: PlaceSearchResult[] = [
  {
    id: "kr-gangneung-anmok-beach",
    name: "강릉 안목해변",
    address: "강원 강릉시 창해로14번길",
    category: "beach",
    countryCode: "KR",
    coordinate: {
      latitude: 37.7715,
      longitude: 128.9483,
    },
    timezone: "Asia/Seoul",
    provider: "fixture",
  },
  {
    id: "kr-jamsil-baseball-stadium",
    name: "잠실종합운동장",
    address: "서울 송파구 올림픽로 25",
    category: "sports",
    countryCode: "KR",
    coordinate: {
      latitude: 37.5122,
      longitude: 127.0719,
    },
    timezone: "Asia/Seoul",
    provider: "fixture",
  },
  {
    id: "jp-tokyo-station",
    name: "도쿄역",
    address: "Tokyo Station, Marunouchi, Tokyo",
    category: "custom",
    countryCode: "JP",
    coordinate: {
      latitude: 35.6812,
      longitude: 139.7671,
    },
    timezone: "Asia/Tokyo",
    provider: "fixture",
  },
  {
    id: "global-singapore-marina-bay",
    name: "Marina Bay",
    address: "Marina Bay, Singapore",
    category: "custom",
    countryCode: "GLOBAL",
    coordinate: {
      latitude: 1.2834,
      longitude: 103.8607,
    },
    timezone: "Asia/Singapore",
    provider: "fixture",
  },
];

export function searchFixturePlaces(query: string): PlaceSearchResult[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return placeSearchFixtures.slice(0, 3);
  return placeSearchFixtures.filter((place) => {
    const haystack = normalizeSearchText(`${place.name} ${place.address} ${place.category} ${place.countryCode}`);
    return haystack.includes(normalizedQuery);
  });
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}
