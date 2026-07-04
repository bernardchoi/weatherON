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
    name: "잠실야구장",
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
    address: "일본 도쿄도 지요다구 마루노우치",
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
    id: "jp-shinsaibashi-station",
    name: "신사이바시역",
    address: "일본 오사카부 오사카시 주오구 신사이바시스지",
    category: "custom",
    countryCode: "JP",
    coordinate: {
      latitude: 34.675,
      longitude: 135.5006,
    },
    timezone: "Asia/Tokyo",
    provider: "fixture",
  },
  {
    id: "jp-namba-station",
    name: "난바역",
    address: "일본 오사카부 오사카시 주오구 난바",
    category: "custom",
    countryCode: "JP",
    coordinate: {
      latitude: 34.6663,
      longitude: 135.5001,
    },
    timezone: "Asia/Tokyo",
    provider: "fixture",
  },
  {
    id: "global-new-york-central-park",
    name: "Central Park",
    address: "Central Park, New York",
    category: "custom",
    countryCode: "GLOBAL",
    coordinate: {
      latitude: 40.7829,
      longitude: -73.9654,
    },
    timezone: "America/New_York",
    provider: "fixture",
  },
];

export function searchFixturePlaces(query: string): PlaceSearchResult[] {
  const normalizedQuery = normalizeSearchText(getFixtureSearchAlias(query));
  if (!normalizedQuery) return placeSearchFixtures.slice(0, 3);
  return placeSearchFixtures.filter((place) => {
    const haystack = normalizeSearchText(`${place.name} ${place.address} ${place.category} ${place.countryCode} ${getFixtureSearchAlias(place.name)}`);
    return haystack.includes(normalizedQuery) || normalizedQuery.split(/\s+/).every((token) => haystack.includes(token));
  });
}

export function localizePlaceSearchResults(places: PlaceSearchResult[], localeOrLanguage?: string): PlaceSearchResult[] {
  const language = getPlaceSearchLanguage(localeOrLanguage);
  return places.map((place) => localizePlaceSearchResult(place, language));
}

export function localizePlaceSearchResult(place: PlaceSearchResult, localeOrLanguage?: string): PlaceSearchResult {
  const language = getPlaceSearchLanguage(localeOrLanguage);
  const key = getKnownStationKey(place);
  if (!key) return place;
  const label = localizedStationLabels[key][language] ?? localizedStationLabels[key].ko;
  return {
    ...place,
    name: label.name,
    address: label.address,
    countryCode: "JP",
    timezone: "Asia/Tokyo",
  };
}

function getFixtureSearchAlias(value: string): string {
  const normalized = normalizeSearchText(value).replace(/\s+/g, " ");
  return placeSearchAliases[normalized] ?? value;
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function getPlaceSearchLanguage(value?: string): "ko" | "en" | "ja" {
  const language = String(value || "ko").split("-")[0]?.toLowerCase();
  if (language === "ja") return "ja";
  if (language === "en") return "en";
  return "ko";
}

function getKnownStationKey(place: PlaceSearchResult): KnownStationKey | null {
  if (place.id in localizedStationLabels) return place.id as KnownStationKey;
  const text = normalizeSearchText(`${place.name} ${place.address} ${place.id}`);
  const compact = text.replace(/\s+/g, "");
  const stationLike = /station|stn|역|駅|nankai/.test(text);
  if ((compact.includes("tokyostation") || compact.includes("도쿄역") || compact.includes("東京駅")) && stationLike) {
    return "jp-tokyo-station";
  }
  if ((compact.includes("shinsaibashi") || compact.includes("신사이바시") || compact.includes("心斎橋")) && stationLike) {
    return "jp-shinsaibashi-station";
  }
  if ((compact.includes("nambastation") || compact.includes("nankainamba") || compact.includes("난바역") || compact.includes("난카이난바") || compact.includes("難波駅") || compact.includes("なんば駅")) && stationLike) {
    return "jp-namba-station";
  }
  return null;
}

type KnownStationKey = "jp-tokyo-station" | "jp-shinsaibashi-station" | "jp-namba-station";

const localizedStationLabels: Record<KnownStationKey, Record<"ko" | "en" | "ja", { name: string; address: string }>> = {
  "jp-tokyo-station": {
    ko: { name: "도쿄역", address: "일본 도쿄도 지요다구 마루노우치" },
    en: { name: "Tokyo Station", address: "Tokyo Station, Marunouchi, Tokyo" },
    ja: { name: "東京駅", address: "東京都千代田区丸の内" },
  },
  "jp-shinsaibashi-station": {
    ko: { name: "신사이바시역", address: "일본 오사카부 오사카시 주오구 신사이바시스지" },
    en: { name: "Shinsaibashi Station", address: "Shinsaibashi Station, Chuo Ward, Osaka" },
    ja: { name: "心斎橋駅", address: "大阪府大阪市中央区心斎橋筋" },
  },
  "jp-namba-station": {
    ko: { name: "난바역", address: "일본 오사카부 오사카시 주오구 난바" },
    en: { name: "Namba Station", address: "Namba Station, Chuo Ward, Osaka" },
    ja: { name: "なんば駅", address: "大阪府大阪市中央区難波" },
  },
};

const placeSearchAliases: Record<string, string> = {
  "도쿄 역": "Tokyo Station",
  "도쿄역": "Tokyo Station",
  "東京駅": "Tokyo Station",
  "tokyostation": "Tokyo Station",
  "잠실": "잠실야구장",
  "잠실야구장": "Jamsil Baseball Stadium",
  "잠실 야구장": "잠실야구장",
  "잠실종합운동장": "잠실야구장",
  "jamsil": "잠실야구장",
  "jamsil stadium": "잠실야구장",
  "jamsil baseball stadium": "잠실야구장",
  "신사이바시": "Shinsaibashi Station",
  "신사이바시역": "Shinsaibashi Station",
  "shinsaibashi": "Shinsaibashi Station",
  "shinsaibashi station": "Shinsaibashi Station",
  "心斎橋": "Shinsaibashi Station",
  "心斎橋駅": "Shinsaibashi Station",
  "난바": "Namba Station",
  "난바역": "Namba Station",
  "난카이난바": "Namba Station",
  "난카이난바역": "Namba Station",
  "namba": "Namba Station",
  "namba station": "Namba Station",
  "nankai namba": "Namba Station",
  "nankai namba station": "Namba Station",
  "難波": "Namba Station",
  "難波駅": "Namba Station",
  "なんば": "Namba Station",
  "なんば駅": "Namba Station",
  "센트럴파크": "Central Park",
  "센트럴 파크": "Central Park",
};
