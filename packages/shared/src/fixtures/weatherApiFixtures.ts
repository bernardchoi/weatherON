import type { KmaForecastItem, OpenMeteoResponse, WeatherKitResponse } from "../weather/types";

export const kmaForecastFixture: KmaForecastItem[] = [
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "0800", category: "TMP", fcstValue: "23" },
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "0800", category: "SKY", fcstValue: "4" },
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "0800", category: "PTY", fcstValue: "1" },
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "0800", category: "POP", fcstValue: "70" },
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "0800", category: "PCP", fcstValue: "2.0mm" },
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "0800", category: "WSD", fcstValue: "5.4" },
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "0800", category: "REH", fcstValue: "84" },
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "0900", category: "TMP", fcstValue: "24" },
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "0900", category: "SKY", fcstValue: "4" },
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "0900", category: "PTY", fcstValue: "1" },
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "0900", category: "POP", fcstValue: "65" },
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "0900", category: "PCP", fcstValue: "1mm 미만" },
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "0900", category: "WSD", fcstValue: "5.8" },
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "1200", category: "TMP", fcstValue: "26" },
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "1200", category: "SKY", fcstValue: "3" },
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "1200", category: "PTY", fcstValue: "0" },
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "1200", category: "POP", fcstValue: "35" },
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "1200", category: "PCP", fcstValue: "강수없음" },
  { baseDate: "20260626", baseTime: "0500", fcstDate: "20260626", fcstTime: "1200", category: "WSD", fcstValue: "4.1" },
];

export const openMeteoFixture: OpenMeteoResponse = {
  current: {
    time: "2026-06-26T08:00",
    temperature_2m: 28,
    apparent_temperature: 31,
    precipitation: 0,
    weather_code: 0,
    wind_speed_10m: 11.5,
    relative_humidity_2m: 70,
    uv_index: 7,
  },
  hourly: {
    time: ["2026-06-26T10:00", "2026-06-26T13:00", "2026-06-26T17:00"],
    temperature_2m: [29, 31, 28],
    apparent_temperature: [31, 34, 30],
    precipitation_probability: [18, 21, 24],
    precipitation: [0, 0, 0],
    weather_code: [0, 1, 3],
    wind_speed_10m: [11.2, 17.3, 18.7],
    relative_humidity_2m: [69, 66, 72],
    uv_index: [7, 8, 4],
  },
  daily: {
    time: ["2026-06-26", "2026-06-27", "2026-06-28", "2026-06-29", "2026-06-30", "2026-07-01", "2026-07-02"],
    temperature_2m_max: [31, 29, 28, 30, 27, 28, 30],
    temperature_2m_min: [24, 23, 22, 23, 22, 21, 23],
    precipitation_probability_max: [24, 35, 58, 42, 20, 18, 30],
    precipitation_sum: [0, 0.4, 3.1, 1.2, 0, 0, 0.3],
    weather_code: [1, 3, 61, 80, 2, 0, 3],
    wind_speed_10m_max: [18.7, 16.2, 20.4, 14.8, 12.1, 11.7, 15.2],
  },
};

export const weatherKitFixture: WeatherKitResponse = {
  currentWeather: {
    metadata: {
      readTime: "2026-06-26T08:00:00Z",
      reportedTime: "2026-06-26T08:00:00Z",
    },
    asOf: "2026-06-26T08:00:00Z",
    conditionCode: "MostlyCloudy",
    humidity: 0.7,
    precipitationIntensity: 0,
    temperature: 27,
    temperatureApparent: 30,
    uvIndex: 7,
    windSpeed: 10.8,
  },
  forecastHourly: {
    hours: [
      {
        forecastStart: "2026-06-26T09:00:00Z",
        conditionCode: "MostlyCloudy",
        humidity: 0.72,
        precipitationAmount: 0,
        precipitationChance: 0.2,
        temperature: 28,
        temperatureApparent: 31,
        uvIndex: 7,
        windSpeed: 11.5,
      },
      {
        forecastStart: "2026-06-26T10:00:00Z",
        conditionCode: "Rain",
        humidity: 0.78,
        precipitationAmount: 1.2,
        precipitationChance: 0.65,
        temperature: 27,
        temperatureApparent: 30,
        uvIndex: 5,
        windSpeed: 14.4,
      },
    ],
  },
  forecastDaily: {
    days: [
      {
        forecastStart: "2026-06-26T00:00:00Z",
        conditionCode: "Rain",
        precipitationAmount: 2.8,
        precipitationChance: 0.65,
        temperatureMax: 30,
        temperatureMin: 23,
        maxUvIndex: 7,
        windSpeedAvg: 12.6,
      },
    ],
  },
};
