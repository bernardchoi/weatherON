declare const process: {
  env: Record<string, string | undefined>;
};

export type WeatherClientMode = "fixture" | "proxy";

export type WeatherRuntimeConfig = {
  clientMode: WeatherClientMode;
  weatherApiBaseUrl?: string;
  kmaForecastUrl?: string;
  openMeteoForecastUrl?: string;
  timeoutMs: number;
};

export const DEFAULT_KMA_FORECAST_URL = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";
export const DEFAULT_OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
export const DEFAULT_WEATHER_TIMEOUT_MS = 8000;

export function getWeatherRuntimeConfig(): WeatherRuntimeConfig {
  return {
    clientMode: getWeatherClientMode(process.env.EXPO_PUBLIC_WEATHER_CLIENT),
    weatherApiBaseUrl: process.env.EXPO_PUBLIC_WEATHER_API_BASE_URL,
    kmaForecastUrl: process.env.EXPO_PUBLIC_KMA_FORECAST_URL,
    openMeteoForecastUrl: process.env.EXPO_PUBLIC_OPEN_METEO_FORECAST_URL,
    timeoutMs: Number(process.env.EXPO_PUBLIC_WEATHER_TIMEOUT_MS) || DEFAULT_WEATHER_TIMEOUT_MS,
  };
}

function getWeatherClientMode(value?: string): WeatherClientMode {
  if (value === "proxy") return "proxy";
  return "fixture";
}
