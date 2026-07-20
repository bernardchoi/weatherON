import {
  DEFAULT_WEATHER_TIMEOUT_MS,
  getWeatherRuntimeConfig,
  isLocalWeatherProxyUrl,
} from "../config/weatherEnv";
import { fetchJsonWithTimeout, normalizeBaseUrl, PROXY_TOKEN_HEADER } from "../utils/httpJson";

export type TravelEstimateProvider = "kakao" | "google" | "fallback";
export type TravelEstimateStatus = "idle" | "loading" | "ready" | "fallback" | "error";

export type TravelEstimateCoordinate = {
  latitude: number;
  longitude: number;
};

export type TravelEstimateParams = {
  origin: TravelEstimateCoordinate;
  destination: TravelEstimateCoordinate;
  originName?: string;
  destinationName?: string;
  originCountryCode?: "KR" | "JP" | "GLOBAL";
  destinationCountryCode?: "KR" | "JP" | "GLOBAL";
};

export type TravelEstimateResult = {
  provider: TravelEstimateProvider;
  status: TravelEstimateStatus;
  travelMinutes: number;
  distanceMeters: number;
  message: string;
  updatedAt: string;
};

export type TravelEstimateClient = {
  estimateRoute: (params: TravelEstimateParams) => Promise<TravelEstimateResult>;
};

export type ProxyTravelEstimateClientOptions = {
  apiBaseUrl: string;
  apiToken?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export const fallbackTravelEstimateClient: TravelEstimateClient = {
  async estimateRoute(params) {
    return {
      ...estimateFallbackRoute(params),
      updatedAt: new Date().toISOString(),
    };
  },
};

export function createProxyTravelEstimateClient(options: ProxyTravelEstimateClientOptions): TravelEstimateClient {
  const timeoutMs = options.timeoutMs ?? DEFAULT_WEATHER_TIMEOUT_MS;

  return {
    async estimateRoute(params) {
      const url = new URL("/routes/estimate", normalizeBaseUrl(options.apiBaseUrl));
      url.searchParams.set("origin", formatCoordinate(params.origin));
      url.searchParams.set("destination", formatCoordinate(params.destination));
      if (params.originName) url.searchParams.set("originName", params.originName);
      if (params.destinationName) url.searchParams.set("destinationName", params.destinationName);
      if (params.originCountryCode) url.searchParams.set("originCountryCode", params.originCountryCode);
      if (params.destinationCountryCode) url.searchParams.set("destinationCountryCode", params.destinationCountryCode);
      const headers = options.apiToken ? { [PROXY_TOKEN_HEADER]: options.apiToken } : undefined;
      const result = await fetchJson<Omit<TravelEstimateResult, "updatedAt">>(url, timeoutMs, options.fetchImpl, headers);
      return {
        ...result,
        updatedAt: new Date().toISOString(),
      };
    },
  };
}

export function createRuntimeTravelEstimateClient(): TravelEstimateClient {
  const config = getWeatherRuntimeConfig();
  if (config.clientMode === "proxy" && config.weatherApiBaseUrl) {
    if (isLocalWeatherProxyUrl(config.weatherApiBaseUrl) && !config.allowLocalProxy) return fallbackTravelEstimateClient;
    return createProxyTravelEstimateClient({
      apiBaseUrl: config.weatherApiBaseUrl,
      apiToken: config.weatherApiToken,
      timeoutMs: config.timeoutMs,
    });
  }
  return fallbackTravelEstimateClient;
}

export const runtimeTravelEstimateClient = createRuntimeTravelEstimateClient();

function fetchJson<T>(url: URL, timeoutMs: number, fetchImpl?: typeof fetch, headers?: Record<string, string>): Promise<T> {
  return fetchJsonWithTimeout<T>(url, { timeoutMs, errorLabel: "Route API", fetchImpl, headers });
}

function estimateFallbackRoute(params: TravelEstimateParams): Omit<TravelEstimateResult, "updatedAt"> {
  const destinationCountryCode = params.destinationCountryCode ?? "KR";
  const directDistanceMeters = getDistanceMeters(params.origin, params.destination);
  const distanceMeters = Math.round(directDistanceMeters * (destinationCountryCode === "KR" ? 1.35 : 1));
  const travelMinutes =
    destinationCountryCode === "KR"
      ? Math.max(15, Math.ceil((distanceMeters / 1000 / 32) * 60))
      : getInternationalFallbackTravelMinutes(destinationCountryCode);
  return {
    provider: "fallback",
    status: "fallback",
    travelMinutes,
    distanceMeters,
    message: destinationCountryCode === "KR" ? "좌표 거리 기반 추정" : "해외 목적지 기본 이동시간",
  };
}

function getInternationalFallbackTravelMinutes(countryCode: TravelEstimateParams["destinationCountryCode"]): number {
  if (countryCode === "JP") return 150;
  return 180;
}

function getDistanceMeters(origin: TravelEstimateCoordinate, destination: TravelEstimateCoordinate): number {
  const radiusMeters = 6371000;
  const fromLat = toRadians(origin.latitude);
  const toLat = toRadians(destination.latitude);
  const deltaLat = toRadians(destination.latitude - origin.latitude);
  const deltaLon = toRadians(destination.longitude - origin.longitude);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLon / 2) ** 2;
  return radiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatCoordinate(coordinate: TravelEstimateCoordinate): string {
  return `${coordinate.latitude},${coordinate.longitude}`;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}
