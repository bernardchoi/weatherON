import type { DestinationAlertCondition, DestinationCare, DestinationTransportMode } from "../types/recommendation";
import type { WeatherSnapshot } from "../types/weather";
import { recommendShoes } from "./shoes";
import { recommendUmbrella } from "./umbrella";

type DestinationCareInput = {
  destinationId: string;
  name: string;
  category: DestinationCare["category"];
  originWeather: WeatherSnapshot;
  destinationWeather: WeatherSnapshot;
  careOn?: boolean;
  alertCondition?: DestinationAlertCondition;
  travelMinutes?: number;
  targetArrivalTime?: string;
  bufferMinutes?: number;
  transportMode?: DestinationTransportMode;
  travelProvider?: "kakao" | "google" | "fallback";
  travelStatus?: "idle" | "loading" | "ready" | "fallback" | "error";
};

const defaultDestinationAlertCondition: DestinationAlertCondition = {
  rainThresholdPct: 50,
  leadTimeMinutes: 60,
  windThresholdMs: 8,
};

export function buildDestinationCare(input: DestinationCareInput): DestinationCare {
  const alertCondition = input.alertCondition ?? defaultDestinationAlertCondition;
  const umbrellaAdvice = recommendUmbrella(input.destinationWeather);
  const shoesAdvice = recommendShoes(input.destinationWeather, input.category);
  const nextAlertText = buildNextAlertText({
    alertCondition,
    careOn: input.careOn ?? true,
    locationName: input.destinationWeather.locationName,
    shoesLevel: shoesAdvice.level,
    umbrellaLevel: umbrellaAdvice.level,
    weather: input.destinationWeather,
  });

  return {
    destinationId: input.destinationId,
    name: input.name,
    category: input.category,
    originWeather: input.originWeather,
    destinationWeather: input.destinationWeather,
    departureAdvice: {
      targetArrivalTime: input.targetArrivalTime,
      recommendedDepartureTime: getRecommendedDepartureTime(input.targetArrivalTime, input.travelMinutes, input.bufferMinutes),
      travelMinutes: input.travelMinutes,
      bufferMinutes: input.bufferMinutes,
      transportMode: input.transportMode,
      travelProvider: input.travelProvider,
      travelStatus: input.travelStatus,
    },
    umbrellaAdvice,
    shoesAdvice,
    careOn: input.careOn ?? true,
    alertCondition,
    nextAlertText,
  };
}

function getRecommendedDepartureTime(targetArrivalTime?: string, travelMinutes?: number, bufferMinutes = 10): string | undefined {
  if (!targetArrivalTime || typeof travelMinutes !== "number") return undefined;
  return subtractMinutes(targetArrivalTime, travelMinutes + bufferMinutes);
}

function subtractMinutes(time: string, minutes: number): string {
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return time;
  const dayMinutes = 24 * 60;
  const totalMinutes = ((hour * 60 + minute - minutes) % dayMinutes + dayMinutes) % dayMinutes;
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
}

function buildNextAlertText(input: {
  alertCondition: DestinationAlertCondition;
  careOn: boolean;
  locationName: string;
  shoesLevel: DestinationCare["shoesAdvice"]["level"];
  umbrellaLevel: DestinationCare["umbrellaAdvice"]["level"];
  weather: WeatherSnapshot;
}): string {
  if (!input.careOn) return `${input.locationName} 목적지 케어 꺼짐`;

  const maxRainProbabilityPct = Math.max(input.weather.current.rainProbabilityPct, ...input.weather.hourly.map((hour) => hour.rainProbabilityPct));
  const maxWindMs = Math.max(input.weather.current.windMs, ...input.weather.hourly.map((hour) => hour.windMs));

  if (maxRainProbabilityPct >= input.alertCondition.rainThresholdPct || input.umbrellaLevel === "required") {
    return `${input.locationName} 강수 ${input.alertCondition.rainThresholdPct}% 기준. 출발 ${input.alertCondition.leadTimeMinutes}분 전 알림 예정`;
  }
  if (maxWindMs >= input.alertCondition.windThresholdMs) {
    return `${input.locationName} 바람 ${input.alertCondition.windThresholdMs}m/s 기준. 출발 ${input.alertCondition.leadTimeMinutes}분 전 알림 예정`;
  }
  if (input.shoesLevel === "recommended") return `${input.locationName} 신발 추천 변경 시 알림 예정`;
  return `${input.locationName} 기준 미만. 조용히 확인`;
}
