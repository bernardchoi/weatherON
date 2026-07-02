import { searchFixturePlaces, type PlaceSearchResult } from "@weatheron/shared";
import {
  DEFAULT_OPEN_METEO_GEOCODING_URL,
  DEFAULT_WEATHER_TIMEOUT_MS,
  getWeatherRuntimeConfig,
  isLocalWeatherProxyUrl,
} from "../config/weatherEnv";

export type SearchPlacesParams = {
  query: string;
  countryCode?: "KR" | "JP" | "GLOBAL";
  locale?: string;
};

export type PlaceSearchClient = {
  searchPlaces: (params: SearchPlacesParams) => Promise<PlaceSearchResult[]>;
};

export type ProxyPlaceSearchClientOptions = {
  apiBaseUrl: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export type OpenMeteoPlaceSearchClientOptions = {
  geocodingUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

type OpenMeteoGeocodingResponse = {
  results?: OpenMeteoGeocodingPlace[];
};

type OpenMeteoGeocodingPlace = {
  id?: number;
  name?: string;
  latitude?: number;
  longitude?: number;
  country_code?: string;
  country?: string;
  admin1?: string;
  admin2?: string;
  timezone?: string;
  feature_code?: string;
};

export const fixturePlaceSearchClient: PlaceSearchClient = {
  async searchPlaces(params) {
    return filterPlacesByCountryCode(searchFixturePlaces(params.query), params.countryCode);
  },
};

export function createProxyPlaceSearchClient(options: ProxyPlaceSearchClientOptions): PlaceSearchClient {
  const timeoutMs = options.timeoutMs ?? DEFAULT_WEATHER_TIMEOUT_MS;

  return {
    async searchPlaces(params) {
      const url = new URL("/places/search", normalizeBaseUrl(options.apiBaseUrl));
      url.searchParams.set("q", params.query);
      if (params.countryCode) url.searchParams.set("countryCode", params.countryCode);
      url.searchParams.set("language", getSearchLanguage(params.locale));
      const remoteResults = await fetchJson<PlaceSearchResult[]>(url, timeoutMs, options.fetchImpl);
      return mergePlaceSearchResults(getCuratedPlaceMatches(params.query, params.countryCode), remoteResults);
    },
  };
}

export function createOpenMeteoPlaceSearchClient(options: OpenMeteoPlaceSearchClientOptions = {}): PlaceSearchClient {
  const timeoutMs = options.timeoutMs ?? DEFAULT_WEATHER_TIMEOUT_MS;

  return {
    async searchPlaces(params) {
      const query = params.query.trim();
      if (query.length < 2) return [];
      const url = new URL(options.geocodingUrl ?? DEFAULT_OPEN_METEO_GEOCODING_URL);
      url.searchParams.set("name", getSearchQueryAlias(query));
      url.searchParams.set("count", "8");
      url.searchParams.set("language", getSearchLanguage(params.locale));
      url.searchParams.set("format", "json");
      if (params.countryCode && params.countryCode !== "GLOBAL") {
        url.searchParams.set("countryCode", params.countryCode);
      }
      const curatedResults = getCuratedPlaceMatches(query, params.countryCode);
      try {
        const payload = await fetchJson<OpenMeteoGeocodingResponse>(url, timeoutMs, options.fetchImpl);
        return mergePlaceSearchResults(curatedResults, normalizeOpenMeteoPlaces(payload.results ?? [], params.countryCode));
      } catch (error) {
        if (curatedResults.length > 0) return curatedResults;
        throw error;
      }
    },
  };
}

export function createRuntimePlaceSearchClient(): PlaceSearchClient {
  const config = getWeatherRuntimeConfig();
  const openMeteoClient = createOpenMeteoPlaceSearchClient({
    geocodingUrl: config.openMeteoGeocodingUrl,
    timeoutMs: config.timeoutMs,
  });
  if (config.clientMode === "openmeteo") {
    return openMeteoClient;
  }
  if (config.clientMode === "proxy" && config.weatherApiBaseUrl) {
    if (isLocalWeatherProxyUrl(config.weatherApiBaseUrl) && !config.allowLocalProxy) return openMeteoClient;
    return createProxyPlaceSearchClient({
      apiBaseUrl: config.weatherApiBaseUrl,
      timeoutMs: config.timeoutMs,
    });
  }
  return fixturePlaceSearchClient;
}

export const runtimePlaceSearchClient = createRuntimePlaceSearchClient();

async function fetchJson<T>(url: URL, timeoutMs: number, fetchImpl = globalThis.fetch): Promise<T> {
  if (!fetchImpl) throw new Error("fetch is not available");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url.toString(), { signal: controller.signal });
    const bodyText = await response.text();
    if (!response.ok) throw new Error(`Place API request failed: ${response.status} ${bodyText.slice(0, 240)}`);
    return JSON.parse(bodyText) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

export function getDeviceSearchLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || "ko-KR";
  } catch {
    return "ko-KR";
  }
}

function getSearchLanguage(locale?: string): string {
  const language = (locale || getDeviceSearchLocale()).split("-")[0]?.toLowerCase();
  if (language === "ja") return "ja";
  if (language === "en") return "en";
  return "ko";
}

function getSearchQueryAlias(query: string): string {
  const normalized = query.trim().toLowerCase();
  return placeSearchQueryAliases[normalized] ?? query;
}

const placeSearchQueryAliases: Record<string, string> = {
  "잠실": "잠실야구장",
  "잠실 야구장": "잠실야구장",
  "잠실종합운동장": "잠실야구장",
  "jamsil": "Jamsil Baseball Stadium",
  "jamsil stadium": "Jamsil Baseball Stadium",
  "도쿄": "Tokyo",
  "tokyo station": "Tokyo Station",
  "tokyostation": "Tokyo Station",
  "도쿄역": "Tokyo Station",
  "도쿄 역": "Tokyo Station",
  "東京駅": "Tokyo Station",
  "시부야": "Shibuya",
  "신주쿠": "Shinjuku",
  "오사카": "Osaka",
  "교토": "Kyoto",
  "삿포로": "Sapporo",
  "후쿠오카": "Fukuoka",
  "싱가포르": "Singapore",
  "마리나베이": "Marina Bay",
  "마리나 베이": "Marina Bay",
  "방콕": "Bangkok",
  "타이베이": "Taipei",
  "홍콩": "Hong Kong",
  "파리": "Paris",
  "런던": "London",
  "뉴욕": "New York",
};

function getCuratedPlaceMatches(query: string, countryCode?: SearchPlacesParams["countryCode"]): PlaceSearchResult[] {
  return filterPlacesByCountryCode(searchFixturePlaces(query), countryCode);
}

function filterPlacesByCountryCode(
  places: PlaceSearchResult[],
  countryCode?: SearchPlacesParams["countryCode"],
): PlaceSearchResult[] {
  if (!countryCode || countryCode === "GLOBAL") return places;
  return places.filter((place) => place.countryCode === countryCode);
}

function mergePlaceSearchResults(...groups: PlaceSearchResult[][]): PlaceSearchResult[] {
  const seen = new Set<string>();
  return groups.flat().filter((place) => {
    const key = getPlaceIdentityKey(place);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getPlaceIdentityKey(place: PlaceSearchResult): string {
  const lat = place.coordinate.latitude.toFixed(4);
  const lon = place.coordinate.longitude.toFixed(4);
  return `${place.countryCode}:${normalizePlaceIdentityText(place.name)}:${lat}:${lon}`;
}

function normalizePlaceIdentityText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function normalizeOpenMeteoPlaces(
  places: OpenMeteoGeocodingPlace[],
  requestedCountryCode?: SearchPlacesParams["countryCode"],
): PlaceSearchResult[] {
  return places
    .filter((place) => isValidOpenMeteoPlace(place))
    .filter((place) => {
      if (!requestedCountryCode || requestedCountryCode === "GLOBAL") return true;
      return place.country_code === requestedCountryCode;
    })
    .map((place) => {
      const countryCode = normalizeCountryCode(place.country_code);
      return {
        id: `openmeteo-${String(place.id ?? `${place.name}-${place.latitude}-${place.longitude}`).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name: place.name ?? "검색 장소",
        address: [place.admin2, place.admin1, place.country].filter(Boolean).join(" · ") || (place.country ?? "주소 정보 없음"),
        category: inferPlaceCategory(place),
        countryCode,
        coordinate: {
          latitude: place.latitude ?? 0,
          longitude: place.longitude ?? 0,
        },
        timezone: place.timezone || getDefaultTimezone(countryCode),
        provider: "openmeteo",
      } satisfies PlaceSearchResult;
    });
}

function isValidOpenMeteoPlace(place: OpenMeteoGeocodingPlace): boolean {
  return (
    typeof place.name === "string" &&
    typeof place.latitude === "number" &&
    typeof place.longitude === "number" &&
    Number.isFinite(place.latitude) &&
    Number.isFinite(place.longitude)
  );
}

function normalizeCountryCode(countryCode?: string): PlaceSearchResult["countryCode"] {
  if (countryCode === "KR" || countryCode === "JP") return countryCode;
  return "GLOBAL";
}

function getDefaultTimezone(countryCode: PlaceSearchResult["countryCode"]): string {
  if (countryCode === "JP") return "Asia/Tokyo";
  if (countryCode === "KR") return "Asia/Seoul";
  return "UTC";
}

function inferPlaceCategory(place: OpenMeteoGeocodingPlace): PlaceSearchResult["category"] {
  const value = `${place.name ?? ""} ${place.feature_code ?? ""}`.toLowerCase();
  if (value.includes("airport") || value.includes("공항")) return "airport";
  if (value.includes("beach") || value.includes("해변")) return "beach";
  if (value.includes("mount") || value.includes("산")) return "mountain";
  return "custom";
}
