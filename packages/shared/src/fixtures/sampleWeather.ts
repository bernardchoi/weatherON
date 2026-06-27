import type { WeatherSnapshot } from "../types/weather";

export const seongsuRainSnapshot: WeatherSnapshot = {
  id: "weather-seongsu-rain",
  locationId: "kr-seoul-seongsu",
  locationName: "서울 성수동",
  countryCode: "KR",
  observedAt: "2026-06-26T08:00:00+09:00",
  current: {
    tempC: 23,
    feelsLikeC: 24,
    condition: "rain",
    precipitationMm: 2.8,
    rainProbabilityPct: 72,
    windMs: 5.4,
    humidityPct: 84,
    uvIndex: 2,
  },
  hourly: [
    { time: "08:00", tempC: 23, rainProbabilityPct: 72, precipitationMm: 1.2, windMs: 5.4, condition: "rain" },
    { time: "09:00", tempC: 24, rainProbabilityPct: 68, precipitationMm: 0.9, windMs: 5.8, condition: "rain" },
    { time: "12:00", tempC: 26, rainProbabilityPct: 42, precipitationMm: 0.2, windMs: 4.1, condition: "cloud" },
    { time: "18:00", tempC: 22, rainProbabilityPct: 61, precipitationMm: 1.5, windMs: 6.2, condition: "rain" },
  ],
  source: "fallback",
  stale: false,
};

export const gangneungClearSnapshot: WeatherSnapshot = {
  id: "weather-gangneung-clear",
  locationId: "kr-gangneung-beach",
  locationName: "강릉 안목해변",
  countryCode: "KR",
  observedAt: "2026-06-26T08:00:00+09:00",
  current: {
    tempC: 28,
    feelsLikeC: 31,
    condition: "clear",
    precipitationMm: 0,
    rainProbabilityPct: 18,
    windMs: 3.2,
    humidityPct: 70,
    uvIndex: 7,
  },
  hourly: [
    { time: "10:00", tempC: 29, rainProbabilityPct: 18, precipitationMm: 0, windMs: 3.1, condition: "clear" },
    { time: "13:00", tempC: 31, rainProbabilityPct: 21, precipitationMm: 0, windMs: 4.8, condition: "clear" },
    { time: "17:00", tempC: 28, rainProbabilityPct: 24, precipitationMm: 0, windMs: 5.2, condition: "cloud" },
  ],
  source: "fallback",
  stale: false,
};
