import { searchFixturePlaces, type PlaceSearchResult } from "@weatheron/shared";
import { DEFAULT_WEATHER_TIMEOUT_MS, getWeatherRuntimeConfig, isLocalWeatherProxyUrl } from "../config/weatherEnv";

export type SearchPlacesParams = {
  query: string;
  countryCode?: "KR" | "JP" | "GLOBAL";
};

export type PlaceSearchClient = {
  searchPlaces: (params: SearchPlacesParams) => Promise<PlaceSearchResult[]>;
};

export type ProxyPlaceSearchClientOptions = {
  apiBaseUrl: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export const fixturePlaceSearchClient: PlaceSearchClient = {
  async searchPlaces(params) {
    return searchFixturePlaces(params.query);
  },
};

export function createProxyPlaceSearchClient(options: ProxyPlaceSearchClientOptions): PlaceSearchClient {
  const timeoutMs = options.timeoutMs ?? DEFAULT_WEATHER_TIMEOUT_MS;

  return {
    async searchPlaces(params) {
      const url = new URL("/places/search", normalizeBaseUrl(options.apiBaseUrl));
      url.searchParams.set("q", params.query);
      if (params.countryCode) url.searchParams.set("countryCode", params.countryCode);
      return fetchJson<PlaceSearchResult[]>(url, timeoutMs, options.fetchImpl);
    },
  };
}

export function createRuntimePlaceSearchClient(): PlaceSearchClient {
  const config = getWeatherRuntimeConfig();
  if (config.clientMode === "proxy" && config.weatherApiBaseUrl) {
    if (isLocalWeatherProxyUrl(config.weatherApiBaseUrl) && !config.allowLocalProxy) return fixturePlaceSearchClient;
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
