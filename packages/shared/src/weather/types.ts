import type { CountryCode, WeatherSnapshot } from "../types/weather";

export type WeatherLocationInput = {
  locationId: string;
  locationName: string;
  countryCode: CountryCode;
  timezone?: string;
};

export type WeatherNormalizeOptions = WeatherLocationInput & {
  observedAt?: string;
  stale?: boolean;
};

export type KmaForecastItem = {
  baseDate: string;
  baseTime: string;
  fcstDate: string;
  fcstTime: string;
  category: string;
  fcstValue: string | number;
};

export type KmaForecastResponse = {
  response?: {
    body?: {
      items?: {
        item?: KmaForecastItem[];
      };
    };
  };
};

export type OpenMeteoResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    precipitation?: number;
    rain?: number;
    showers?: number;
    snowfall?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    relative_humidity_2m?: number;
    uv_index?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    apparent_temperature?: number[];
    precipitation_probability?: number[];
    precipitation?: number[];
    weather_code?: number[];
    wind_speed_10m?: number[];
    relative_humidity_2m?: number[];
    uv_index?: number[];
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
    precipitation_sum?: number[];
    weather_code?: number[];
    wind_speed_10m_max?: number[];
  };
};

export type WeatherKitResponse = {
  currentWeather?: WeatherKitCurrentWeather;
  forecastHourly?: {
    hours?: WeatherKitHourWeather[];
  };
  forecastDaily?: {
    days?: WeatherKitDayWeather[];
  };
};

export type WeatherKitCurrentWeather = {
  metadata?: {
    readTime?: string;
    reportedTime?: string;
  };
  asOf?: string;
  conditionCode?: string;
  humidity?: number;
  precipitationIntensity?: number;
  temperature?: number;
  temperatureApparent?: number;
  uvIndex?: number;
  windSpeed?: number;
};

export type WeatherKitHourWeather = {
  forecastStart?: string;
  conditionCode?: string;
  humidity?: number;
  precipitationAmount?: number;
  precipitationChance?: number;
  temperature?: number;
  temperatureApparent?: number;
  uvIndex?: number;
  windSpeed?: number;
};

export type WeatherKitDayWeather = {
  forecastStart?: string;
  conditionCode?: string;
  precipitationAmount?: number;
  precipitationChance?: number;
  temperatureMax?: number;
  temperatureMin?: number;
  maxUvIndex?: number;
  windSpeedAvg?: number;
  windSpeed?: number;
};

export type WeatherAdapterResult = WeatherSnapshot;
