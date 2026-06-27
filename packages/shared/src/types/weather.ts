export type CountryCode = "KR" | "JP" | "GLOBAL";

export type WeatherCondition = "clear" | "cloud" | "rain" | "snow" | "storm" | "dust";

export type WeatherSource = "kma" | "openmeteo" | "cache" | "fallback";

export type HourlyWeather = {
  time: string;
  tempC: number;
  rainProbabilityPct: number;
  precipitationMm: number;
  windMs: number;
  condition: WeatherCondition | string;
};

export type WeatherSnapshot = {
  id?: string;
  locationId: string;
  locationName: string;
  countryCode: CountryCode;
  observedAt: string;
  current: {
    tempC: number;
    feelsLikeC: number;
    condition: WeatherCondition;
    precipitationMm: number;
    rainProbabilityPct: number;
    windMs: number;
    humidityPct: number;
    uvIndex?: number;
  };
  hourly: HourlyWeather[];
  source: WeatherSource;
  stale: boolean;
};
