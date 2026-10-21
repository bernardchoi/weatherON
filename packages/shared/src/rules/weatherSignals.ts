import type { HourlyWeather, WeatherSnapshot } from "../types/weather";
import type { OutfitVariant } from "../types/recommendation";
import type { Season } from "../types/wardrobe";
import { getForecastLocalDate, isValidIanaTimeZone } from "../weather/timezone";

export type ThermalProfile = "hot" | "warm" | "mild" | "cool" | "cold";

export type WeatherSignals = {
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
  const temps = hours.filter(hour => hour.available?.temp !== false).map(hour => hour.tempC);
  // A scoped forecast keeps its daily extremes even when hourly coverage is missing.
  const date = isValidIanaTimeZone(snapshot.timezone) ? getForecastLocalDate(snapshot.observedAt, snapshot.timezone) : "";
  const day = snapshot.daily?.find(day => day.date === date);
  if (day && day.available?.minTemp !== false) temps.push(day.minTempC);
  if (day && day.available?.maxTemp !== false) temps.push(day.maxTempC);
  if (snapshot.current.tempAvailable !== false) temps.push(snapshot.current.tempC);
  const validTemps = temps.filter(Number.isFinite);
  const minTempC = validTemps.length ? Math.min(...validTemps) : NaN;
  const maxTempC = validTemps.length ? Math.max(...validTemps) : NaN;
  const tempC = snapshot.current.tempAvailable === false ? NaN : snapshot.current.tempC;
  const feelsLikeC = snapshot.current.feelsLikeAvailable === false ? tempC : snapshot.current.feelsLikeC;
  const tempSwingC = maxTempC - minTempC;
  const rainyHours = hours.filter((hour) => hour.rainProbabilityPct >= 60 || hour.precipitationMm >= 1);
  const maxPrecipitation = Math.max(snapshot.current.precipitationMm, ...hours.map((hour) => hour.precipitationMm));
  const maxRainProbability = Math.max(snapshot.current.rainProbabilityPct, ...hours.map((hour) => hour.rainProbabilityPct));
  const maxWind = Math.max(snapshot.current.windMs, ...hours.map((hour) => hour.windMs));
  const uvIndex = snapshot.current.uvIndex;
  const pm10 = snapshot.current.pm10;
  const pm25 = snapshot.current.pm25;
  const isRainy = ["rain", "storm", "sleet", "hail", "storm-hail", "mixed"].includes(snapshot.current.condition) || maxRainProbability >= 60 || maxPrecipitation >= 1;
  const isHeavyRain = maxPrecipitation >= 5;
  const isWindy = maxWind >= 7;
  const isHighUv = typeof uvIndex === "number" && uvIndex >= 6;
  const isPoorAirQuality =
    snapshot.current.condition === "dust" ||
    (typeof pm10 === "number" && pm10 > 80) ||
    (typeof pm25 === "number" && pm25 > 35);
  const isHumid = snapshot.current.humidityPct >= 70;
  const isHot =
    feelsLikeC >= 27 ||
    tempC >= 29 ||
    (maxTempC >= 31 && feelsLikeC >= 22) ||
    (isHumid && feelsLikeC >= 26);
  const isCold = feelsLikeC <= 8 || maxTempC <= 12 || (minTempC <= 8 && maxTempC <= 18);
  const thermalProfile = getThermalProfile(feelsLikeC, minTempC, maxTempC, isHot, isCold);
  const recommendedSeasons = getRecommendedSeasons(thermalProfile);
  const needsLightLayer =
    !isHot &&
    (isCold ||
      feelsLikeC <= 18 ||
      (maxTempC < 29 && minTempC <= 17 && tempSwingC >= 7) ||
      (isWindy && feelsLikeC < 24));

  return {
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
    tempC: snapshot.current.tempAvailable === false ? NaN : snapshot.current.tempC,
    rainProbabilityPct: snapshot.current.rainProbabilityPct,
    precipitationMm: snapshot.current.precipitationMm,
    windMs: snapshot.current.windMs,
    condition: snapshot.current.condition,
  };
}
