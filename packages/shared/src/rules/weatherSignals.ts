import type { HourlyWeather, WeatherSnapshot } from "../types/weather";
import type { OutfitVariant } from "../types/recommendation";
import type { Season } from "../types/wardrobe";

export type ThermalProfile = "hot" | "warm" | "mild" | "cool" | "cold";

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
  isHumid: boolean;
  needsLightLayer: boolean;
  thermalProfile: ThermalProfile;
  recommendedSeasons: Season[];
  variant: OutfitVariant;
};

export function getWeatherSignals(snapshot: WeatherSnapshot): WeatherSignals {
  const hours = snapshot.hourly.length > 0 ? snapshot.hourly : [currentAsHour(snapshot)];
  const temps = hours.map((hour) => hour.tempC);
  const minTempC = Math.min(snapshot.current.tempC, ...temps);
  const maxTempC = Math.max(snapshot.current.tempC, ...temps);
  const tempSwingC = maxTempC - minTempC;
  const rainyHours = hours.filter((hour) => hour.rainProbabilityPct >= 60 || hour.precipitationMm >= 1);
  const maxPrecipitation = Math.max(snapshot.current.precipitationMm, ...hours.map((hour) => hour.precipitationMm));
  const maxRainProbability = Math.max(snapshot.current.rainProbabilityPct, ...hours.map((hour) => hour.rainProbabilityPct));
  const maxWind = Math.max(snapshot.current.windMs, ...hours.map((hour) => hour.windMs));
  const isRainy = snapshot.current.condition === "rain" || maxRainProbability >= 60 || maxPrecipitation >= 1;
  const isHeavyRain = maxPrecipitation >= 5;
  const isWindy = maxWind >= 7;
  const isHumid = snapshot.current.humidityPct >= 70;
  const isHot =
    snapshot.current.feelsLikeC >= 27 ||
    snapshot.current.tempC >= 29 ||
    (maxTempC >= 31 && snapshot.current.feelsLikeC >= 22) ||
    (isHumid && snapshot.current.feelsLikeC >= 26);
  const isCold = snapshot.current.feelsLikeC <= 5;
  const thermalProfile = getThermalProfile(snapshot, minTempC, maxTempC, isHot, isCold);
  const recommendedSeasons = getRecommendedSeasons(thermalProfile);
  const needsLightLayer =
    !isHot &&
    (isCold ||
      snapshot.current.feelsLikeC <= 18 ||
      (maxTempC < 29 && minTempC <= 17 && tempSwingC >= 7) ||
      (isWindy && snapshot.current.feelsLikeC < 24));

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
    isHumid,
    needsLightLayer,
    thermalProfile,
    recommendedSeasons,
    variant: isRainy ? "rain" : isCold ? "cold" : isHot ? "heat" : "default",
  };
}

function getThermalProfile(
  snapshot: WeatherSnapshot,
  minTempC: number,
  maxTempC: number,
  isHot: boolean,
  isCold: boolean,
): ThermalProfile {
  if (isCold || maxTempC <= 10) return "cold";
  if (isHot) return "hot";
  if (snapshot.current.feelsLikeC <= 16 || minTempC <= 10) return "cool";
  if (snapshot.current.feelsLikeC >= 23 || maxTempC >= 27) return "warm";
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
    tempC: snapshot.current.tempC,
    rainProbabilityPct: snapshot.current.rainProbabilityPct,
    precipitationMm: snapshot.current.precipitationMm,
    windMs: snapshot.current.windMs,
    condition: snapshot.current.condition,
  };
}
