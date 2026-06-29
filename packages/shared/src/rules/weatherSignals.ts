import type { HourlyWeather, WeatherSnapshot } from "../types/weather";
import type { OutfitVariant } from "../types/recommendation";

export type WeatherSignals = {
  minTempC: number;
  maxTempC: number;
  tempSwingC: number;
  maxRainProbabilityPct: number;
  maxPrecipitationMm: number;
  maxWindMs: number;
  isRainy: boolean;
  isHeavyRain: boolean;
  isLongRain: boolean;
  isWindy: boolean;
  isHot: boolean;
  isCold: boolean;
  variant: OutfitVariant;
};

export function getWeatherSignals(snapshot: WeatherSnapshot): WeatherSignals {
  const hours = snapshot.hourly.length > 0 ? snapshot.hourly : [currentAsHour(snapshot)];
  const temps = hours.map((hour) => hour.tempC);
  const rainyHours = hours.filter((hour) => hour.rainProbabilityPct >= 60 || hour.precipitationMm >= 1);
  const maxPrecipitation = Math.max(snapshot.current.precipitationMm, ...hours.map((hour) => hour.precipitationMm));
  const maxRainProbability = Math.max(snapshot.current.rainProbabilityPct, ...hours.map((hour) => hour.rainProbabilityPct));
  const maxWind = Math.max(snapshot.current.windMs, ...hours.map((hour) => hour.windMs));
  const isRainy = snapshot.current.condition === "rain" || maxRainProbability >= 60 || maxPrecipitation >= 1;
  const isHeavyRain = maxPrecipitation >= 5;
  const isWindy = maxWind >= 7;
  const isHot = snapshot.current.feelsLikeC >= 30;
  const isCold = snapshot.current.feelsLikeC <= 5;
  const minTempC = Math.min(snapshot.current.tempC, ...temps);
  const maxTempC = Math.max(snapshot.current.tempC, ...temps);
  const tempSwingC = maxTempC - minTempC;

  return {
    minTempC,
    maxTempC,
    tempSwingC,
    maxRainProbabilityPct: maxRainProbability,
    maxPrecipitationMm: maxPrecipitation,
    maxWindMs: maxWind,
    isRainy,
    isHeavyRain,
    isLongRain: rainyHours.length >= 3,
    isWindy,
    isHot,
    isCold,
    variant: isRainy ? "rain" : isCold ? "cold" : isHot ? "heat" : "default",
  };
}

function currentAsHour(snapshot: WeatherSnapshot): HourlyWeather {
  return {
    time: snapshot.observedAt,
    tempC: snapshot.current.tempC,
    rainProbabilityPct: snapshot.current.rainProbabilityPct,
    precipitationMm: snapshot.current.precipitationMm,
    windMs: snapshot.current.windMs,
    condition: snapshot.current.condition,
  };
}
