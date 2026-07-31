import type { TemperatureUnit } from "../state/useWeatherOnAppState";
import { formatTemperatureDelta } from "./units";

type FeelsLikeMessageInput = {
  feelsLikeC: number;
  tempC: number;
  humidityPct: number;
  temperatureUnit: TemperatureUnit;
};

export function getFeelsLikeMessage({
  feelsLikeC,
  tempC,
  humidityPct,
  temperatureUnit,
}: FeelsLikeMessageInput) {
  const deltaC = feelsLikeC - tempC;
  const roundedDelta = temperatureUnit === "fahrenheit" ? Math.round((deltaC * 9) / 5) : Math.round(deltaC);
  const deltaLabel = formatTemperatureDelta(deltaC, temperatureUnit);
  const isSummerLike = tempC >= 23 || feelsLikeC >= 25 || (humidityPct >= 65 && tempC >= 20);
  const hotterComparison = getHotterComparison(deltaC);

  if (feelsLikeC >= 33) {
    if (humidityPct >= 70 && roundedDelta > 0) return `습도까지 높아 실제보다 ${hotterComparison} 느껴져요. (${deltaLabel})`;
    return humidityPct >= 70 ? "매우 덥고 습해요." : "매우 덥게 느껴져요.";
  }
  if (feelsLikeC >= 30) {
    if (roundedDelta > 0) {
      return humidityPct >= 70
        ? `습도 때문에 실제보다 ${hotterComparison} 느껴져요. (${deltaLabel})`
        : `실제보다 ${hotterComparison} 느껴져요. (${deltaLabel})`;
    }
    return humidityPct >= 70 ? "덥고 습해요." : "덥게 느껴져요.";
  }
  if (feelsLikeC >= 27) {
    if (roundedDelta > 0) return `실제보다 ${hotterComparison} 느껴져요. (${deltaLabel})`;
    return humidityPct >= 70 ? "후덥지근해요." : "다소 덥게 느껴져요.";
  }
  if (feelsLikeC <= 0) return "매우 춥게 느껴져요.";
  if (feelsLikeC <= 8) return "춥게 느껴져요.";
  if (feelsLikeC <= 15) return "쌀쌀하게 느껴져요.";

  if (roundedDelta > 0) {
    return isSummerLike
      ? `실제보다 ${hotterComparison} 느껴져요. (${deltaLabel})`
      : `실제보다 따뜻하게 느껴져요. (${deltaLabel})`;
  }
  if (roundedDelta < 0) {
    return isSummerLike
      ? `실제보다 조금 선선하게 느껴져요. (${deltaLabel})`
      : `실제보다 서늘하게 느껴져요. (${deltaLabel})`;
  }
  return "실제 기온과 비슷하게 느껴져요.";
}

function getHotterComparison(deltaC: number) {
  if (deltaC >= 5) return "훨씬 덥게";
  if (deltaC >= 3) return "더 덥게";
  return "조금 더 덥게";
}
