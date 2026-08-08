import { DEFAULT_WEATHER_TIMEOUT_MS, getWeatherRuntimeConfig } from "./weatherEnv";

declare const process: {
  env: Record<string, string | undefined>;
};

export type AccountRuntimeConfig = {
  apiBaseUrl?: string;
  timeoutMs: number;
};

export function getAccountRuntimeConfig(): AccountRuntimeConfig {
  const weatherConfig = getWeatherRuntimeConfig();
  return {
    apiBaseUrl: process.env.EXPO_PUBLIC_ACCOUNT_API_BASE_URL ?? weatherConfig.weatherApiBaseUrl,
    timeoutMs: Number(process.env.EXPO_PUBLIC_ACCOUNT_TIMEOUT_MS) || weatherConfig.timeoutMs || DEFAULT_WEATHER_TIMEOUT_MS,
  };
}
