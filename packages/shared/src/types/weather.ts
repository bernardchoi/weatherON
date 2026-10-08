export type CountryCode = "KR" | "JP" | "GLOBAL";

export type WeatherCondition = "clear" | "cloud" | "rain" | "snow" | "storm" | "dust";

export type WeatherSource = "kma" | "openmeteo" | "weatherkit" | "cache" | "fallback";

export type HourlyWeather = {
  time: string;
  /** 일반 기온 예보. 공급자 feels-like/기상청 체감온도와 구분한다. */
  tempC: number;
  rainProbabilityPct: number;
  precipitationMm: number;
  windMs: number;
  condition: WeatherCondition | string;
};

export type DailyWeather = {
  date: string;
  minTempC: number;
  /** 일최고 일반 기온 예보. 일최고 체감온도가 아님. */
  maxTempC: number;
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
  timezone?: string;
  current: {
    tempC: number;
    feelsLikeC: number;
    condition: WeatherCondition;
    precipitationMm: number;
    rainProbabilityPct: number;
    windMs: number;
    humidityPct: number;
    uvIndex?: number;
    pm10?: number;
    pm25?: number;
  };
  hourly: HourlyWeather[];
  daily?: DailyWeather[];
  source: WeatherSource;
  stale: boolean;
};
