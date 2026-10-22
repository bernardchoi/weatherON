import { judgePreparationConditions, judgeThermal, validMeasure, validTemperature } from "./thermalJudgment";
import type { HourlyWeather, WeatherSnapshot } from "../types/weather";
import type { OutfitVariant } from "../types/recommendation";
import type { Season } from "../types/wardrobe";
import { getForecastLocalDate, isValidIanaTimeZone } from "../weather/timezone";

export type ThermalProfile = "hot" | "warm" | "mild" | "cool" | "cold";

export type WeatherSignals = {
  precipitationKind: "hail" | "ice" | "snow" | "rain" | "possible";
  thermal: ReturnType<typeof judgeThermal>;
  minTempC: number;
  maxTempC: number;
  tempSwingC: number;
  maxRainProbabilityPct: number;
  maxPrecipitationMm: number;
  maxWindMs: number;
  uvIndex?: number;
  pm10?: number;
  pm25?: number;
  isRainy: boolean;
  isHeavyRain: boolean;
  isLongRain: boolean;
  isWindy: boolean;
  isHighUv: boolean;
  isPoorAirQuality: boolean;
  isHot: boolean;
  isCold: boolean;
  isHumid: boolean;
  needsLightLayer: boolean;
  thermalProfile: ThermalProfile;
  recommendedSeasons: Season[];
  variant: OutfitVariant;
};

export function getWeatherSignals(snapshot: WeatherSnapshot): WeatherSignals {
  const hours = snapshot.hourly.length > 0 ? snapshot.hourly : [currentAsHour(snapshot)];
  const temps = hours.filter(hour => hour.available?.temp !== false && (snapshot.source !== "weatherkit" || hour.available?.temp === true)).map(hour => validTemperature(hour.tempC));
  // A scoped forecast keeps its daily extremes even when hourly coverage is missing.
  const date = isValidIanaTimeZone(snapshot.timezone) ? getForecastLocalDate(snapshot.observedAt, snapshot.timezone) : "";
  const day = snapshot.daily?.find(day => day.date === date);
  if (day && day.available?.minTemp !== false) temps.push(validTemperature(day.minTempC));
  if (day && day.available?.maxTemp !== false) temps.push(validTemperature(day.maxTempC));
  if (snapshot.current.tempAvailable !== false && (snapshot.source !== "weatherkit" || snapshot.current.tempAvailable === true)) temps.push(validTemperature(snapshot.current.tempC));
  const validTemps = temps.filter(Number.isFinite);
  const minTempC = validTemps.length ? Math.min(...validTemps) : NaN;
  const maxTempC = validTemps.length ? Math.max(...validTemps) : NaN;
  const tempC = validTemperature(snapshot.current.tempC, snapshot.current.tempAvailable !== false && (snapshot.source !== "weatherkit" || snapshot.current.tempAvailable === true));
  const feelsLikeC = validTemperature(snapshot.current.feelsLikeC, snapshot.current.feelsLikeAvailable !== false && (snapshot.source !== "weatherkit" || snapshot.current.feelsLikeAvailable === true));
  const tempSwingC = maxTempC - minTempC;
  const known = (field: "wind" | "rainProbability" | "precipitation", hour: HourlyWeather) => hour.available?.[field] !== false && (snapshot.source !== "weatherkit" || hour.available?.[field] === true);
  const maximum = (values: number[]) => values.some(Number.isFinite) ? Math.max(...values.filter(Number.isFinite)) : NaN;
  const rainyHours = hours.filter(hour => validMeasure(hour.rainProbabilityPct, known("rainProbability", hour), 100) >= 50 || validMeasure(hour.precipitationMm, known("precipitation", hour)) > 0);
  const maxPrecipitation = maximum([validMeasure(snapshot.current.precipitationMm), ...hours.map(hour => validMeasure(hour.precipitationMm, known("precipitation", hour)))]);
  const maxRainProbability = maximum([validMeasure(snapshot.current.rainProbabilityPct, snapshot.current.rainProbabilityAvailable !== false, 100), ...hours.map(hour => validMeasure(hour.rainProbabilityPct, known("rainProbability", hour), 100))]);
  const maxWind = maximum([validMeasure(snapshot.current.windMs, snapshot.current.windAvailable !== false && (snapshot.source !== "weatherkit" || snapshot.current.windAvailable === true)), ...hours.map(hour => validMeasure(hour.windMs, known("wind", hour)))]);
  const optionalMeasure = (value: number | undefined) => value !== undefined && Number.isFinite(validMeasure(value)) ? value : undefined;
  const uvIndex = optionalMeasure(snapshot.current.uvIndex);
  const pm10 = optionalMeasure(snapshot.current.pm10);
  const pm25 = optionalMeasure(snapshot.current.pm25);
  const conditions = [snapshot.current.condition, ...hours.filter(hour => hour.available?.condition !== false && (snapshot.source !== "weatherkit" || hour.available?.condition === true)).map(hour => hour.condition)];
  const conditionsJudgment = judgePreparationConditions({ conditions, wind: maxWind, probability: maxRainProbability, precipitation: maxPrecipitation });
  const precipitationKind = conditionsJudgment.phase;
  const isRainy = conditionsJudgment.wet;
  const isHeavyRain = maxPrecipitation >= 5;
  const isWindy = conditionsJudgment.windy;
  const isHighUv = typeof uvIndex === "number" && uvIndex >= 6;
  const isPoorAirQuality =
    snapshot.current.condition === "dust" ||
    (typeof pm10 === "number" && pm10 > 80) ||
    (typeof pm25 === "number" && pm25 > 35);
  const isHumid = snapshot.current.humidityAvailable !== false && validMeasure(snapshot.current.humidityPct, true, 100) >= 70;
  const thermal = judgeThermal({ air: tempC, apparent: feelsLikeC, min: minTempC, max: maxTempC, humid: isHumid, wind: maxWind });
  const isHot = thermal.hot;
  const isCold = thermal.cold;
  const thermalProfile = getThermalProfile(thermal.temperature, minTempC, maxTempC, isHot, isCold);
  const recommendedSeasons = getRecommendedSeasons(thermalProfile);
  const needsLightLayer = thermal.lightLayer;

  return {
    precipitationKind,
    thermal,
    minTempC,
    maxTempC,
    tempSwingC,
    maxRainProbabilityPct: maxRainProbability,
    maxPrecipitationMm: maxPrecipitation,
    maxWindMs: maxWind,
    uvIndex,
    pm10,
    pm25,
    isRainy,
    isHeavyRain,
    isLongRain: rainyHours.length >= 3,
    isWindy,
    isHighUv,
    isPoorAirQuality,
    isHot,
    isCold,
    isHumid,
    needsLightLayer,
    thermalProfile,
    recommendedSeasons,
    variant: isRainy ? "rain" : isCold ? "cold" : isHot ? "heat" : "default",
  };
}

function getThermalProfile(
  feelsLikeC: number,
  minTempC: number,
  maxTempC: number,
  isHot: boolean,
  isCold: boolean,
): ThermalProfile {
  if (isCold) return "cold";
  if (isHot) return "hot";
  if (feelsLikeC <= 16 || minTempC <= 10) return "cool";
  if (feelsLikeC >= 23 || maxTempC >= 27) return "warm";
  return "mild";
}

function getRecommendedSeasons(profile: ThermalProfile): Season[] {
  if (profile === "hot") return ["summer"];
  if (profile === "warm") return ["summer", "spring"];
  if (profile === "cool") return ["fall", "spring", "winter"];
  if (profile === "cold") return ["winter"];
  return ["spring", "fall"];
}

function currentAsHour(snapshot: WeatherSnapshot): HourlyWeather {
  return {
    time: snapshot.observedAt,
    tempC: validTemperature(snapshot.current.tempC, snapshot.current.tempAvailable !== false && (snapshot.source !== "weatherkit" || snapshot.current.tempAvailable === true)),
    rainProbabilityPct: snapshot.current.rainProbabilityPct,
    precipitationMm: snapshot.current.precipitationMm,
    windMs: snapshot.current.windMs,
    condition: snapshot.current.condition,
  };
}
