/**
 * Perfora Air Tokens v1.0 — TypeScript helper
 * Intent: map contextual data into surface, density, lumen, and flow tokens.
 */

export type PerforaSurface = 'still' | 'air' | 'signal' | 'veil' | 'nocturne';
export type PerforaDensity = 'calm' | 'normal' | 'live' | 'alert' | 'critical';
export type PerforaLumen = 'none' | 'whisper' | 'soft' | 'notice' | 'alert' | 'critical';
export type PerforaFlow = 'still' | 'drift' | 'slow' | 'medium' | 'gust';
export type PerforaMode = 'day' | 'dusk' | 'night' | 'rainy';
export type PerforaUrgency = 'calm' | 'normal' | 'live' | 'alert' | 'critical';

export type PerforaTokenState = {
  surface: PerforaSurface;
  density: PerforaDensity;
  lumen: PerforaLumen;
  flow: PerforaFlow;
  textFirst?: boolean;
};

export const perforaStates: Record<PerforaUrgency, PerforaTokenState> = {
  calm: {
    surface: 'still',
    density: 'calm',
    lumen: 'whisper',
    flow: 'still',
  },
  normal: {
    surface: 'air',
    density: 'normal',
    lumen: 'soft',
    flow: 'drift',
  },
  live: {
    surface: 'air',
    density: 'live',
    lumen: 'notice',
    flow: 'slow',
  },
  alert: {
    surface: 'signal',
    density: 'alert',
    lumen: 'alert',
    flow: 'gust',
    textFirst: true,
  },
  critical: {
    surface: 'signal',
    density: 'critical',
    lumen: 'critical',
    flow: 'gust',
    textFirst: true,
  },
};

export type WeatherContext = {
  windSpeedMs: number;
  windDirectionDeg?: number;
  humidityPercent: number;
  aqi?: number;
  precipitationMm?: number;
  uvIndex?: number;
  isNight?: boolean;
};

export function getWeatherUrgency(input: WeatherContext): PerforaUrgency {
  const aqi = input.aqi ?? 0;
  const rain = input.precipitationMm ?? 0;
  const humidity = input.humidityPercent;
  const wind = input.windSpeedMs;
  const uv = input.uvIndex ?? 0;

  if (aqi >= 151 || rain >= 30 || wind >= 17 || uv >= 9) return 'critical';
  if (aqi >= 101 || rain >= 10 || wind >= 11 || humidity >= 85 || uv >= 7) return 'alert';
  if (aqi >= 51 || rain >= 1 || wind >= 6 || humidity >= 75 || uv >= 5) return 'live';
  if (wind >= 2 || humidity >= 55) return 'normal';
  return 'calm';
}

export function mapWeatherToPerfora(input: WeatherContext): PerforaTokenState & {
  mode: PerforaMode;
  flowAngleDeg: number;
  veilMist: 'clear' | 'soft' | 'mist' | 'heavy';
} {
  const urgency = getWeatherUrgency(input);
  const base = perforaStates[urgency];

  const mode: PerforaMode =
    input.precipitationMm && input.precipitationMm > 0 ? 'rainy' :
    input.isNight ? 'night' :
    'day';

  const veilMist =
    input.humidityPercent >= 85 ? 'heavy' :
    input.humidityPercent >= 75 ? 'mist' :
    input.humidityPercent >= 62 ? 'soft' :
    'clear';

  return {
    ...base,
    mode,
    flowAngleDeg: input.windDirectionDeg ?? 120,
    veilMist,
  };
}

export type ScheduleContext = {
  eventCount: number;
  focusMinutesAvailable: number;
  hasConflict?: boolean;
  nextEventMinutes?: number;
};

export function mapScheduleToPerfora(input: ScheduleContext): PerforaTokenState {
  if (input.hasConflict) return perforaStates.alert;
  if ((input.nextEventMinutes ?? 999) <= 10) return perforaStates.live;
  if (input.eventCount >= 7 || input.focusMinutesAvailable < 30) return perforaStates.alert;
  if (input.eventCount >= 4 || input.focusMinutesAvailable < 90) return perforaStates.live;
  if (input.eventCount >= 1) return perforaStates.normal;
  return perforaStates.calm;
}

export type AirQualityContext = {
  co2ppm?: number;
  pm25?: number;
  humidityPercent?: number;
  vocIndex?: number;
};

export function mapIndoorAirToPerfora(input: AirQualityContext): PerforaTokenState {
  const co2 = input.co2ppm ?? 400;
  const pm25 = input.pm25 ?? 0;
  const voc = input.vocIndex ?? 0;
  const humidity = input.humidityPercent ?? 45;

  if (co2 >= 1500 || pm25 >= 75 || voc >= 5) return perforaStates.critical;
  if (co2 >= 1000 || pm25 >= 35 || humidity >= 75 || voc >= 4) return perforaStates.alert;
  if (co2 >= 800 || pm25 >= 15 || humidity >= 65 || voc >= 3) return perforaStates.live;
  if (co2 >= 650 || humidity >= 55) return perforaStates.normal;
  return perforaStates.calm;
}

/**
 * CSS variable resolver for component hooks.
 * Use this when a React component needs semantic state classes or data attributes.
 */
export function getPerforaAttributes(state: PerforaTokenState) {
  return {
    'data-pa-surface': state.surface,
    'data-pa-density': state.density,
    'data-pa-lumen': state.lumen,
    'data-pa-flow': state.flow,
    'data-pa-text-first': String(Boolean(state.textFirst)),
  };
}


export const PERFORA_AIR_VERSION = '1.0.0' as const;
