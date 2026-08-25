import type { HourlyWeather, WeatherSnapshot } from "@weatheron/shared";

export type UmbrellaRainSignal = HourlyWeather & {
  signalPercent: number;
};

export function buildUmbrellaRainSignals(weather: WeatherSnapshot, limit = 6): UmbrellaRainSignal[] {
  const hourly = weather.hourly.slice(0, limit).map((hour) => ({ ...hour }));
  const currentAsHour: HourlyWeather = {
    time: weather.observedAt,
    tempC: weather.current.tempC,
    rainProbabilityPct: weather.current.rainProbabilityPct,
    precipitationMm: weather.current.precipitationMm,
    windMs: weather.current.windMs,
    condition: weather.current.condition,
  };

  if (hourly.length === 0) return [withRainSignal(currentAsHour)];

  // 추천은 current와 hourly를 모두 보므로 첫 시간대에도 현재 관측 신호를 합쳐
  // 추천 카드와 그래프가 서로 다른 결론을 보여주지 않게 한다.
  const first = hourly[0];
  hourly[0] = {
    ...first,
    rainProbabilityPct: Math.max(first.rainProbabilityPct, currentAsHour.rainProbabilityPct),
    precipitationMm: Math.max(first.precipitationMm, currentAsHour.precipitationMm),
    windMs: Math.max(first.windMs, currentAsHour.windMs),
    condition: getStrongerCondition(first, currentAsHour),
  };

  return hourly.map(withRainSignal);
}

export function getUmbrellaPeakRainProbability(items: UmbrellaRainSignal[]): number {
  return Math.round(Math.max(0, ...items.map((item) => item.rainProbabilityPct)));
}

export function getUmbrellaPeakWindSpeed(items: UmbrellaRainSignal[]): number {
  return Math.max(0, ...items.map((item) => item.windMs));
}

export function getUmbrellaPeakIndex(items: UmbrellaRainSignal[]): number {
  if (items.length === 0) return 0;
  return items.reduce((bestIndex, item, index) => (item.signalPercent > items[bestIndex].signalPercent ? index : bestIndex), 0);
}

export function formatUmbrellaRainAmount(amount: number): string {
  if (amount <= 0) return "";
  return `${Number.isInteger(amount) ? amount : amount.toFixed(1)}mm`;
}

function withRainSignal(hour: HourlyWeather): UmbrellaRainSignal {
  return {
    ...hour,
    signalPercent: Math.max(clampPercent(hour.rainProbabilityPct), precipitationSignalPercent(hour.precipitationMm)),
  };
}

function precipitationSignalPercent(amount: number): number {
  if (amount >= 10) return 100;
  if (amount >= 5) return 80;
  if (amount >= 1) return 60;
  if (amount > 0) return 30;
  return 0;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(Math.round(value), 100));
}

function getStrongerCondition(first: HourlyWeather, current: HourlyWeather): HourlyWeather["condition"] {
  const currentHasStrongerRain =
    current.precipitationMm > first.precipitationMm ||
    current.rainProbabilityPct > first.rainProbabilityPct;
  return currentHasStrongerRain ? current.condition : first.condition;
}
