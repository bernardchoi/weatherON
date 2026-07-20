import { getKmaForecastBaseDateTime, kmaForecastFixture, openMeteoFixture } from "@weatheron/shared";
import type { KmaForecastItem, KmaForecastResponse, OpenMeteoResponse } from "@weatheron/shared";
import {
  DEFAULT_KMA_FORECAST_URL,
  DEFAULT_OPEN_METEO_FORECAST_URL,
  DEFAULT_WEATHER_TIMEOUT_MS,
  getWeatherRuntimeConfig,
  isLocalWeatherProxyUrl,
} from "../config/weatherEnv";
import { fetchJsonWithTimeout, normalizeBaseUrl, PROXY_TOKEN_HEADER } from "../utils/httpJson";

export type FetchKmaForecastParams = {
  nx: number;
  ny: number;
  baseDate?: string;
  baseTime?: string;
};

export type FetchOpenMeteoForecastParams = {
  latitude: number;
  longitude: number;
  timezone?: string;
};

export type WeatherClient = {
  fetchKmaForecast: (params: FetchKmaForecastParams) => Promise<KmaForecastResponse | KmaForecastItem[]>;
  fetchOpenMeteoForecast: (params: FetchOpenMeteoForecastParams) => Promise<OpenMeteoResponse>;
};

export type HttpWeatherClientOptions = {
  kmaServiceKey?: string;
  kmaForecastUrl?: string;
  openMeteoForecastUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export type ProxyWeatherClientOptions = {
  weatherApiBaseUrl: string;
  apiToken?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export type OpenMeteoWeatherClientOptions = {
  openMeteoForecastUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export const fixtureWeatherClient: WeatherClient = {
  async fetchKmaForecast() {
    return kmaForecastFixture;
  },
  async fetchOpenMeteoForecast() {
    return openMeteoFixture;
  },
};

export function createHttpWeatherClient(options: HttpWeatherClientOptions = {}): WeatherClient {
  const timeoutMs = options.timeoutMs ?? DEFAULT_WEATHER_TIMEOUT_MS;

  return {
    async fetchKmaForecast(params) {
      if (!options.kmaServiceKey) {
        throw new Error("KMA service key is not configured");
      }
      const url = new URL(options.kmaForecastUrl ?? DEFAULT_KMA_FORECAST_URL);
      url.searchParams.set("serviceKey", normalizeKmaServiceKey(options.kmaServiceKey));
      url.searchParams.set("pageNo", "1");
      url.searchParams.set("numOfRows", "1000");
      url.searchParams.set("dataType", "JSON");
      const base = getKmaForecastBaseDateTime();
      url.searchParams.set("base_date", params.baseDate ?? base.baseDate);
      url.searchParams.set("base_time", params.baseTime ?? base.baseTime);
      url.searchParams.set("nx", String(params.nx));
      url.searchParams.set("ny", String(params.ny));
      const payload = await fetchJson<KmaForecastResponse>(url, timeoutMs, options.fetchImpl);
      const items = payload.response?.body?.items?.item;
      if (!items?.length) throw new Error("KMA forecast response is empty");
      return payload;
    },
    async fetchOpenMeteoForecast(params) {
      const url = new URL(options.openMeteoForecastUrl ?? DEFAULT_OPEN_METEO_FORECAST_URL);
      url.searchParams.set("latitude", String(params.latitude));
      url.searchParams.set("longitude", String(params.longitude));
      url.searchParams.set("timezone", params.timezone ?? "Asia/Seoul");
      url.searchParams.set(
        "current",
        [
          "temperature_2m",
          "apparent_temperature",
          "precipitation",
          "rain",
          "showers",
          "snowfall",
          "weather_code",
          "wind_speed_10m",
          "relative_humidity_2m",
          "uv_index",
        ].join(","),
      );
      url.searchParams.set(
        "hourly",
        [
          "temperature_2m",
          "apparent_temperature",
          "precipitation_probability",
          "precipitation",
          "weather_code",
          "wind_speed_10m",
          "relative_humidity_2m",
          "uv_index",
        ].join(","),
      );
      url.searchParams.set(
        "daily",
        [
          "weather_code",
          "temperature_2m_max",
          "temperature_2m_min",
          "precipitation_probability_max",
          "precipitation_sum",
          "wind_speed_10m_max",
        ].join(","),
      );
      url.searchParams.set("forecast_days", "7");
      const payload = await fetchJson<OpenMeteoResponse>(url, timeoutMs, options.fetchImpl);
      if (!payload.current) throw new Error("Open-Meteo forecast response is empty");
      return payload;
    },
  };
}

export function createOpenMeteoWeatherClient(options: OpenMeteoWeatherClientOptions = {}): WeatherClient {
  const httpClient = createHttpWeatherClient({
    openMeteoForecastUrl: options.openMeteoForecastUrl,
    timeoutMs: options.timeoutMs,
    fetchImpl: options.fetchImpl,
  });

  return {
    async fetchKmaForecast() {
      throw new Error("KMA forecast is disabled in Open-Meteo weather mode");
    },
    fetchOpenMeteoForecast: httpClient.fetchOpenMeteoForecast,
  };
}

export function createProxyWeatherClient(options: ProxyWeatherClientOptions): WeatherClient {
  const timeoutMs = options.timeoutMs ?? DEFAULT_WEATHER_TIMEOUT_MS;
  const headers = getProxyAuthHeaders(options.apiToken);

  return {
    async fetchKmaForecast(params) {
      const url = new URL("/weather/kma", normalizeBaseUrl(options.weatherApiBaseUrl));
      url.searchParams.set("nx", String(params.nx));
      url.searchParams.set("ny", String(params.ny));
      if (params.baseDate) url.searchParams.set("baseDate", params.baseDate);
      if (params.baseTime) url.searchParams.set("baseTime", params.baseTime);
      const payload = await fetchJson<KmaForecastResponse>(url, timeoutMs, options.fetchImpl, headers);
      const items = payload.response?.body?.items?.item;
      if (!items?.length) throw new Error("KMA forecast response is empty");
      return payload;
    },
    async fetchOpenMeteoForecast(params) {
      const url = new URL("/weather/openmeteo", normalizeBaseUrl(options.weatherApiBaseUrl));
      url.searchParams.set("latitude", String(params.latitude));
      url.searchParams.set("longitude", String(params.longitude));
      url.searchParams.set("timezone", params.timezone ?? "Asia/Seoul");
      const payload = await fetchJson<OpenMeteoResponse>(url, timeoutMs, options.fetchImpl, headers);
      if (!payload.current) throw new Error("Open-Meteo forecast response is empty");
      return payload;
    },
  };
}

export function createRuntimeWeatherClient(): WeatherClient {
  const config = getWeatherRuntimeConfig();
  const openMeteoClient = createOpenMeteoWeatherClient({
    openMeteoForecastUrl: config.openMeteoForecastUrl,
    timeoutMs: config.timeoutMs,
  });
  if (config.clientMode === "openmeteo") {
    return openMeteoClient;
  }
  if (config.clientMode === "proxy" && config.weatherApiBaseUrl) {
    if (isLocalWeatherProxyUrl(config.weatherApiBaseUrl) && !config.allowLocalProxy) {
      return openMeteoClient;
    }
    return createProxyWeatherClient({
      weatherApiBaseUrl: config.weatherApiBaseUrl,
      apiToken: config.weatherApiToken,
      timeoutMs: config.timeoutMs,
    });
  }
  return fixtureWeatherClient;
}

export const runtimeWeatherClient = createRuntimeWeatherClient();
export const fetchKmaForecast = runtimeWeatherClient.fetchKmaForecast;
export const fetchOpenMeteoForecast = runtimeWeatherClient.fetchOpenMeteoForecast;

function fetchJson<T>(url: URL, timeoutMs: number, fetchImpl?: typeof fetch, headers?: Record<string, string>): Promise<T> {
  return fetchJsonWithTimeout<T>(url, { timeoutMs, errorLabel: "Weather API", fetchImpl, headers });
}

function getProxyAuthHeaders(apiToken?: string): Record<string, string> | undefined {
  return apiToken ? { [PROXY_TOKEN_HEADER]: apiToken } : undefined;
}

// 기존 사용처(스크립트 포함) 호환을 위해 shared 구현을 그대로 재노출한다.
export { getKmaForecastBaseDateTime };

function normalizeKmaServiceKey(serviceKey: string): string {
  try {
    return serviceKey.includes("%") ? decodeURIComponent(serviceKey) : serviceKey;
  } catch {
    return serviceKey;
  }
}
