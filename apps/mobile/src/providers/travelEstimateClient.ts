import {
  DEFAULT_WEATHER_TIMEOUT_MS,
  getWeatherRuntimeConfig,
  isLocalWeatherProxyUrl,
} from "../config/weatherEnv";

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
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export const fallbackTravelEstimateClient: TravelEstimateClient = {
  async estimateRoute(params) {
    return {
      ...estimateFallbackRoute(params.origin, params.destination),
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
      const result = await fetchJson<Omit<TravelEstimateResult, "updatedAt">>(url, timeoutMs, options.fetchImpl);
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
      timeoutMs: config.timeoutMs,
    });
  }
  return fallbackTravelEstimateClient;
}

export const runtimeTravelEstimateClient = createRuntimeTravelEstimateClient();

async function fetchJson<T>(url: URL, timeoutMs: number, fetchImpl = globalThis.fetch): Promise<T> {
  if (!fetchImpl) throw new Error("fetch is not available");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url.toString(), { signal: controller.signal });
    const bodyText = await response.text();
    if (!response.ok) throw new Error(`Route API request failed: ${response.status} ${bodyText.slice(0, 240)}`);
    return JSON.parse(bodyText) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function estimateFallbackRoute(origin: TravelEstimateCoordinate, destination: TravelEstimateCoordinate): Omit<TravelEstimateResult, "updatedAt"> {
  const directDistanceMeters = getDistanceMeters(origin, destination);
  const distanceMeters = Math.round(directDistanceMeters * 1.35);
  return {
    provider: "fallback",
    status: "fallback",
    travelMinutes: Math.max(15, Math.ceil((distanceMeters / 1000 / 32) * 60)),
    distanceMeters,
    message: "좌표 거리 기반 추정",
  };
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

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}
