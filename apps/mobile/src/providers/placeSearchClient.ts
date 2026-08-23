import { getPlaceSearchQueryAlias, isValidIanaTimeZone, localizePlaceSearchResults, searchFixturePlaces, type PlaceSearchResult } from "@weatheron/shared";
import {
  DEFAULT_OPEN_METEO_FORECAST_URL,
  DEFAULT_OPEN_METEO_GEOCODING_URL,
  DEFAULT_WEATHER_TIMEOUT_MS,
  getWeatherRuntimeConfig,
  isLocalWeatherProxyUrl,
} from "../config/weatherEnv";
import { normalizePlaceSearchResultCategory } from "../utils/destination-visual-resolver";
import { fetchJsonWithTimeout, normalizeBaseUrl, PROXY_TOKEN_HEADER } from "../utils/httpJson";

export type SearchPlacesParams = {
  query: string;
  countryCode?: "KR" | "JP" | "GLOBAL";
  locale?: string;
  origin?: {
    latitude: number;
    longitude: number;
  };
};

export type PlaceSearchClient = {
  searchPlaces: (params: SearchPlacesParams) => Promise<PlaceSearchResult[]>;
};

export type ProxyPlaceSearchClientOptions = {
  apiBaseUrl: string;
  apiToken?: string;
  timezoneLookupUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export type OpenMeteoPlaceSearchClientOptions = {
  geocodingUrl?: string;
  timezoneLookupUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

type RawPlaceSearchResult = Omit<PlaceSearchResult, "timezone"> & {
  timezone?: string;
};

type OpenMeteoTimezoneResult = {
  timezone?: string;
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
    return localizePlaceSearchResults(filterPlacesByCountryCode(searchFixturePlaces(params.query), params.countryCode), params.locale);
  },
};

export function createProxyPlaceSearchClient(options: ProxyPlaceSearchClientOptions): PlaceSearchClient {
  const timeoutMs = options.timeoutMs ?? DEFAULT_WEATHER_TIMEOUT_MS;

  return {
    async searchPlaces(params) {
      const url = new URL("/places/search", normalizeBaseUrl(options.apiBaseUrl));
      url.searchParams.set("q", params.query);
      if (params.countryCode) url.searchParams.set("countryCode", params.countryCode);
      if (params.origin) {
        url.searchParams.set("latitude", String(params.origin.latitude));
        url.searchParams.set("longitude", String(params.origin.longitude));
      }
      const language = getSearchLanguage(params.locale);
      url.searchParams.set("language", language);
      const headers = options.apiToken ? { [PROXY_TOKEN_HEADER]: options.apiToken } : undefined;
      const remoteResults = await fetchJson<RawPlaceSearchResult[]>(url, timeoutMs, options.fetchImpl, headers);
      const timezoneSafeResults = await ensurePlaceTimezones(remoteResults, {
        lookupUrl: options.timezoneLookupUrl,
        timeoutMs,
        fetchImpl: options.fetchImpl,
      });
      return localizePlaceSearchResults(
        normalizeDestinationCategories(mergePlaceSearchResults(getCuratedPlaceMatches(params.query, params.countryCode, language), timezoneSafeResults)),
        language,
      );
    },
  };
}

export function createOpenMeteoPlaceSearchClient(options: OpenMeteoPlaceSearchClientOptions = {}): PlaceSearchClient {
  const timeoutMs = options.timeoutMs ?? DEFAULT_WEATHER_TIMEOUT_MS;

  return {
    async searchPlaces(params) {
      const query = params.query.trim();
      if (query.length < 2) return [];
      const language = getSearchLanguage(params.locale);
      const url = new URL(options.geocodingUrl ?? DEFAULT_OPEN_METEO_GEOCODING_URL);
      url.searchParams.set("name", getPlaceSearchQueryAlias(query));
      url.searchParams.set("count", "8");
      url.searchParams.set("language", language);
      url.searchParams.set("format", "json");
      if (params.countryCode && params.countryCode !== "GLOBAL") {
        url.searchParams.set("countryCode", params.countryCode);
      }
      const curatedResults = getCuratedPlaceMatches(query, params.countryCode, language);
      try {
        const payload = await fetchJson<OpenMeteoGeocodingResponse>(url, timeoutMs, options.fetchImpl);
        const normalizedResults = normalizeOpenMeteoPlaces(payload.results ?? [], params.countryCode);
        const timezoneSafeResults = await ensurePlaceTimezones(normalizedResults, {
          lookupUrl: options.timezoneLookupUrl,
          timeoutMs,
          fetchImpl: options.fetchImpl,
        });
        return localizePlaceSearchResults(
          normalizeDestinationCategories(mergePlaceSearchResults(curatedResults, timezoneSafeResults)),
          language,
        );
      } catch (error) {
        if (curatedResults.length > 0) return normalizeDestinationCategories(curatedResults);
        throw error;
      }
    },
  };
}

export function createRuntimePlaceSearchClient(): PlaceSearchClient {
  const config = getWeatherRuntimeConfig();
  const openMeteoClient = createOpenMeteoPlaceSearchClient({
    geocodingUrl: config.openMeteoGeocodingUrl,
    timezoneLookupUrl: config.openMeteoForecastUrl,
    timeoutMs: config.timeoutMs,
  });
  if (config.clientMode === "openmeteo") {
    return openMeteoClient;
  }
  if (config.clientMode === "proxy" && config.weatherApiBaseUrl) {
    if (isLocalWeatherProxyUrl(config.weatherApiBaseUrl) && !config.allowLocalProxy) return openMeteoClient;
    return createProxyPlaceSearchClient({
      apiBaseUrl: config.weatherApiBaseUrl,
      apiToken: config.weatherApiToken,
      timezoneLookupUrl: config.openMeteoForecastUrl,
      timeoutMs: config.timeoutMs,
    });
  }
  return fixturePlaceSearchClient;
}

export const runtimePlaceSearchClient = createRuntimePlaceSearchClient();

export async function resolveTimezoneFromCoordinate(
  coordinate: PlaceSearchResult["coordinate"],
  options: OpenMeteoPlaceSearchClientOptions = {},
): Promise<string | null> {
  const config = getWeatherRuntimeConfig();
  const [resolved] = await ensurePlaceTimezones([
    {
      id: `timezone-${getTimezoneCoordinateKey(coordinate.latitude, coordinate.longitude)}`,
      name: "좌표 시간대",
      address: "",
      category: "custom",
      countryCode: "GLOBAL",
      coordinate,
      provider: "openmeteo",
    },
  ], {
    lookupUrl: options.timezoneLookupUrl ?? config.openMeteoForecastUrl,
    timeoutMs: options.timeoutMs ?? config.timeoutMs,
    fetchImpl: options.fetchImpl,
  });
  return resolved?.timezone ?? null;
}

function fetchJson<T>(url: URL, timeoutMs: number, fetchImpl?: typeof fetch, headers?: Record<string, string>): Promise<T> {
  return fetchJsonWithTimeout<T>(url, { timeoutMs, errorLabel: "Place API", fetchImpl, headers });
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

function getCuratedPlaceMatches(query: string, countryCode?: SearchPlacesParams["countryCode"], localeOrLanguage?: string): PlaceSearchResult[] {
  return localizePlaceSearchResults(filterPlacesByCountryCode(searchFixturePlaces(query), countryCode), localeOrLanguage);
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

function normalizeDestinationCategories(places: PlaceSearchResult[]): PlaceSearchResult[] {
  return places.map(normalizePlaceSearchResultCategory);
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
): RawPlaceSearchResult[] {
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
        timezone: place.timezone,
        provider: "openmeteo",
      } satisfies RawPlaceSearchResult;
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

function inferPlaceCategory(place: OpenMeteoGeocodingPlace): PlaceSearchResult["category"] {
  const value = `${place.name ?? ""} ${place.feature_code ?? ""}`.toLowerCase();
  if (value.includes("airport") || value.includes("공항")) return "airport";
  if (value.includes("beach") || value.includes("해변")) return "beach";
  if (value.includes("mount") || value.includes("산")) return "mountain";
  return "custom";
}

const TIMEZONE_CACHE_MAX_ENTRIES = 500;
const TIMEZONE_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const timezoneLookupCache = new Map<string, { timezone: string; resolvedAt: number }>();

type TimezoneLookupOptions = {
  lookupUrl?: string;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
};

async function ensurePlaceTimezones(
  places: RawPlaceSearchResult[],
  options: TimezoneLookupOptions,
): Promise<PlaceSearchResult[]> {
  const resolvedTimezones = new Map<number, string>();
  const unresolved: Array<{ index: number; place: RawPlaceSearchResult; cacheKey: string }> = [];

  places.forEach((place, index) => {
    if (!Number.isFinite(place.coordinate?.latitude) || !Number.isFinite(place.coordinate?.longitude)) return;
    if (isUsablePlaceTimezone(place.timezone, place.countryCode)) {
      resolvedTimezones.set(index, place.timezone);
      return;
    }
    const cacheKey = getTimezoneCoordinateKey(place.coordinate.latitude, place.coordinate.longitude);
    const cached = timezoneLookupCache.get(cacheKey);
    if (cached && Date.now() - cached.resolvedAt <= TIMEZONE_CACHE_TTL_MS) {
      resolvedTimezones.set(index, cached.timezone);
      return;
    }
    if (cached) timezoneLookupCache.delete(cacheKey);
    unresolved.push({ index, place, cacheKey });
  });

  if (unresolved.length > 0) {
    try {
      const lookupUrl = new URL(options.lookupUrl ?? DEFAULT_OPEN_METEO_FORECAST_URL);
      lookupUrl.searchParams.set("latitude", unresolved.map(({ place }) => place.coordinate.latitude).join(","));
      lookupUrl.searchParams.set("longitude", unresolved.map(({ place }) => place.coordinate.longitude).join(","));
      lookupUrl.searchParams.set("timezone", "auto");
      lookupUrl.searchParams.set("forecast_days", "0");
      const payload = await fetchJson<OpenMeteoTimezoneResult | OpenMeteoTimezoneResult[]>(
        lookupUrl,
        options.timeoutMs,
        options.fetchImpl,
      );
      const results = Array.isArray(payload) ? payload : [payload];
      unresolved.forEach(({ index, cacheKey }, resultIndex) => {
        const timezone = results[resultIndex]?.timezone;
        if (!isValidIanaTimeZone(timezone)) return;
        resolvedTimezones.set(index, timezone);
        timezoneLookupCache.set(cacheKey, { timezone, resolvedAt: Date.now() });
      });
      enforceTimezoneCacheLimit();
    } catch {
      // 시간대가 확정되지 않은 장소는 UTC로 오표시하지 않고 아래에서 제외한다.
    }
  }

  return places.flatMap((place, index) => {
    const timezone = resolvedTimezones.get(index);
    return timezone ? [{ ...place, timezone } satisfies PlaceSearchResult] : [];
  });
}

function isUsablePlaceTimezone(value: string | undefined, countryCode: PlaceSearchResult["countryCode"]): value is string {
  if (!isValidIanaTimeZone(value)) return false;
  // 과거 GLOBAL 검색이 시간대 누락 시 저장하던 UTC는 실제 좌표 시간대로 다시 확인한다.
  return countryCode !== "GLOBAL" || value !== "UTC";
}

function getTimezoneCoordinateKey(latitude: number, longitude: number): string {
  return `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
}

function enforceTimezoneCacheLimit() {
  while (timezoneLookupCache.size > TIMEZONE_CACHE_MAX_ENTRIES) {
    const oldestKey = timezoneLookupCache.keys().next().value;
    if (oldestKey === undefined) break;
    timezoneLookupCache.delete(oldestKey);
  }
}
