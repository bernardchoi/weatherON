export type CountryCode = "KR" | "JP" | "GLOBAL";

// These are presentation-safe, provider-neutral states. Do not collapse frozen or
// unknown precipitation into rain/snow: the distinction changes footwear and
// trip-preparation guidance.
export type WeatherCondition = "clear" | "cloud" | "rain" | "snow" | "sleet" | "hail" | "storm-hail" | "mixed" | "storm" | "dust" | "unknown";

export type WeatherSource = "kma" | "openmeteo" | "weatherkit" | "cache" | "fallback";

export type HourlyWeather = {
  /** Provider field presence, separate from legacy numeric fallback values. */
  available?: { temp: boolean; rainProbability: boolean; precipitation: boolean; wind: boolean; condition?: boolean };
  time: string;
  /** 일반 기온 예보. 공급자 feels-like/기상청 체감온도와 구분한다. */
  tempC: number;
  rainProbabilityPct: number;
  precipitationMm: number;
  windMs: number;
  condition: WeatherCondition | string;
};

export type DailyWeather = {
  /** Field presence; numeric legacy fallbacks remain separate. */
  available?: { minTemp: boolean; maxTemp: boolean; rainProbability: boolean };
  date: string;
  minTempC: number;
  /** 일최고 일반 기온 예보. 일최고 체감온도가 아님. */
  maxTempC: number;
  rainProbabilityPct: number;
  precipitationMm: number;
  windMs: number;
  /** Daily peak UV forecast when the provider supplies it. */
  maxUvIndex?: number;
  condition: WeatherCondition | string;
};

export type WeatherSnapshot = {
  id?: string;
  /** A relabelled fallback does not establish weather at the requested place. */
  locationUnverified?: boolean;
  locationId: string;
  locationName: string;
  countryCode: CountryCode;
  observedAt: string;
  timezone?: string;
  current: {
    /** Optional fresh-provider evidence for ambient rendering; never inferred from theme. */
    atmosphere?: { kind?: "fog" | "thunder"; conditionAvailable: boolean; precipitationMm?: number };
    tempC: number;
    feelsLikeC: number;
    feelsLikeAvailable?: boolean;
    tempAvailable?: boolean;
    humidityAvailable?: boolean;
    rainProbabilityAvailable?: boolean;
    windAvailable?: boolean;
    condition: WeatherCondition;
    precipitationMm: number;
    rainProbabilityPct: number;
    windMs: number;
    /** Omitted when a synthesized forecast has no humidity prediction. */
    humidityPct?: number;
    uvIndex?: number;
    pm10?: number;
    pm25?: number;
  };
  hourly: HourlyWeather[];
  daily?: DailyWeather[];
  source: WeatherSource;
  stale: boolean;
};
