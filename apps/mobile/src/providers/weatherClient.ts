import { kmaForecastFixture, openMeteoFixture } from "@weatheron/shared";
import type { KmaForecastItem, KmaForecastResponse, OpenMeteoResponse } from "@weatheron/shared";
import {
  DEFAULT_KMA_FORECAST_URL,
  DEFAULT_OPEN_METEO_FORECAST_URL,
  DEFAULT_WEATHER_TIMEOUT_MS,
  getWeatherRuntimeConfig,
  isLocalWeatherProxyUrl,
} from "../config/weatherEnv";

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
      url.searchParams.set("forecast_days", "1");
      const payload = await fetchJson<OpenMeteoResponse>(url, timeoutMs, options.fetchImpl);
      if (!payload.current) throw new Error("Open-Meteo forecast response is empty");
      return payload;
    },
  };
}

export function createProxyWeatherClient(options: ProxyWeatherClientOptions): WeatherClient {
  const timeoutMs = options.timeoutMs ?? DEFAULT_WEATHER_TIMEOUT_MS;

  return {
    async fetchKmaForecast(params) {
      const url = new URL("/weather/kma", normalizeBaseUrl(options.weatherApiBaseUrl));
      url.searchParams.set("nx", String(params.nx));
      url.searchParams.set("ny", String(params.ny));
      if (params.baseDate) url.searchParams.set("baseDate", params.baseDate);
      if (params.baseTime) url.searchParams.set("baseTime", params.baseTime);
      const payload = await fetchJson<KmaForecastResponse>(url, timeoutMs, options.fetchImpl);
      const items = payload.response?.body?.items?.item;
      if (!items?.length) throw new Error("KMA forecast response is empty");
      return payload;
    },
    async fetchOpenMeteoForecast(params) {
      const url = new URL("/weather/openmeteo", normalizeBaseUrl(options.weatherApiBaseUrl));
      url.searchParams.set("latitude", String(params.latitude));
      url.searchParams.set("longitude", String(params.longitude));
      url.searchParams.set("timezone", params.timezone ?? "Asia/Seoul");
      const payload = await fetchJson<OpenMeteoResponse>(url, timeoutMs, options.fetchImpl);
      if (!payload.current) throw new Error("Open-Meteo forecast response is empty");
      return payload;
    },
  };
}

export function createRuntimeWeatherClient(): WeatherClient {
  const config = getWeatherRuntimeConfig();
  if (config.clientMode === "proxy" && config.weatherApiBaseUrl) {
    if (isLocalWeatherProxyUrl(config.weatherApiBaseUrl) && !config.allowLocalProxy) {
      return fixtureWeatherClient;
    }
    return createProxyWeatherClient({
      weatherApiBaseUrl: config.weatherApiBaseUrl,
      timeoutMs: config.timeoutMs,
    });
  }
  return fixtureWeatherClient;
}

export const runtimeWeatherClient = createRuntimeWeatherClient();
export const fetchKmaForecast = runtimeWeatherClient.fetchKmaForecast;
export const fetchOpenMeteoForecast = runtimeWeatherClient.fetchOpenMeteoForecast;

async function fetchJson<T>(url: URL, timeoutMs: number, fetchImpl = globalThis.fetch): Promise<T> {
  if (!fetchImpl) throw new Error("fetch is not available");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url.toString(), { signal: controller.signal });
    const bodyText = await response.text();
    if (!response.ok) {
      throw new Error(`Weather API request failed: ${response.status} ${bodyText.slice(0, 240)}`);
    }
    return JSON.parse(bodyText) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeKmaServiceKey(serviceKey: string): string {
  try {
    return serviceKey.includes("%") ? decodeURIComponent(serviceKey) : serviceKey;
  } catch {
    return serviceKey;
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

export function getKmaForecastBaseDateTime(now = new Date()): { baseDate: string; baseTime: string } {
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
  const candidate = new Date(now.getTime());
  let selectedHour: number | undefined;
  for (const hour of baseTimes) {
    if (now.getHours() > hour || (now.getHours() === hour && now.getMinutes() >= 10)) selectedHour = hour;
  }
  if (selectedHour == null) {
    candidate.setDate(candidate.getDate() - 1);
    selectedHour = 23;
  }
  candidate.setHours(selectedHour, 0, 0, 0);
  return {
    baseDate: formatKmaDate(candidate),
    baseTime: `${String(selectedHour).padStart(2, "0")}00`,
  };
}

function formatKmaDate(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}
