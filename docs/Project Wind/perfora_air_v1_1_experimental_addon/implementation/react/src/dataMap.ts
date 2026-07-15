export type PerforaState = 'calm' | 'normal' | 'live' | 'alert' | 'critical';
export type SurfaceToken = 'still' | 'air' | 'signal' | 'veil' | 'nocturne';
export type DensityToken = 'calm' | 'normal' | 'live' | 'alert' | 'critical';
export type LumenToken = 'whisper' | 'soft' | 'notice' | 'alert' | 'critical';
export type FlowToken = 'still' | 'drift' | 'slow' | 'medium' | 'gust';

export type WeatherInput = {
  temperatureC: number;
  feelsLikeC?: number;
  humidityPct: number;
  windSpeedMs: number;
  windDirectionDeg: number;
  precipProbabilityPct?: number;
  uvIndex?: number;
  aqi: number;
  pm25: number;
};

export type HomeAirInput = {
  co2ppm?: number;
  indoorHumidityPct?: number;
  purifierMode?: 'off' | 'auto' | 'low' | 'high';
  deviceAlerts?: number;
  windowOpen?: boolean;
};

export type DayContextInput = {
  eventsNext12h?: number;
  focusBlocks?: number;
  nextDeadlineHours?: number;
  notificationUrgency?: 0 | 1 | 2 | 3;
};

export type UserContextInput = {
  reducedMotion?: boolean;
  reducedTransparency?: boolean;
  highContrast?: boolean;
  lowPower?: boolean;
};

export type AtmosphereInput = {
  weather: WeatherInput;
  homeAir?: HomeAirInput;
  dayContext?: DayContextInput;
  userContext?: UserContextInput;
};

export type AtmosphereResult = {
  state: PerforaState;
  surface: SurfaceToken;
  density: DensityToken;
  lumen: LumenToken;
  flow: FlowToken;
  pressure: {
    airWeight: number;
    flowEnergy: number;
    airPurityPressure: number;
    schedulePressure: number;
    actionUrgency: number;
  };
  recommendation: {
    action: 'ventilate' | 'dehumidify' | 'purify' | 'focus_plan' | 'maintain';
    label: string;
  };
  summary: string;
  accessibleSummary: string;
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

function scoreHumidity(humidityPct: number): number {
  if (humidityPct < 35) return clamp((35 - humidityPct) * 1.2, 0, 40);
  if (humidityPct <= 60) return 12;
  if (humidityPct <= 74) return 35;
  if (humidityPct <= 84) return 68;
  return 88;
}

function scoreAirPurity(aqi: number, pm25: number, co2ppm = 650): number {
  const aqiScore = aqi <= 30 ? 10 : aqi <= 50 ? 30 : aqi <= 100 ? 65 : 90;
  const pmScore = pm25 <= 15 ? 10 : pm25 <= 35 ? 32 : pm25 <= 75 ? 68 : 92;
  const co2Score = co2ppm < 800 ? 10 : co2ppm < 1000 ? 35 : co2ppm < 1500 ? 72 : 94;
  return Math.max(aqiScore, pmScore, co2Score);
}

function scoreSchedule(eventsNext12h = 0, nextDeadlineHours = 999, notificationUrgency = 0): number {
  const eventScore = eventsNext12h <= 2 ? 15 : eventsNext12h <= 4 ? 35 : eventsNext12h <= 7 ? 70 : 90;
  const deadlineScore = nextDeadlineHours > 24 ? 10 : nextDeadlineHours > 8 ? 30 : nextDeadlineHours > 2 ? 70 : 92;
  const notificationScore = notificationUrgency * 25;
  return Math.max(eventScore, deadlineScore, notificationScore);
}

function stateFromScore(score: number): PerforaState {
  if (score < 25) return 'calm';
  if (score < 45) return 'normal';
  if (score < 65) return 'live';
  if (score < 85) return 'alert';
  return 'critical';
}

function tokensFromState(state: PerforaState, userContext?: UserContextInput): Pick<AtmosphereResult, 'surface' | 'density' | 'lumen' | 'flow'> {
  const table: Record<PerforaState, Pick<AtmosphereResult, 'surface' | 'density' | 'lumen' | 'flow'>> = {
    calm: { surface: 'still', density: 'calm', lumen: 'whisper', flow: 'still' },
    normal: { surface: 'air', density: 'normal', lumen: 'soft', flow: 'drift' },
    live: { surface: 'air', density: 'live', lumen: 'notice', flow: 'slow' },
    alert: { surface: 'signal', density: 'alert', lumen: 'alert', flow: 'gust' },
    critical: { surface: 'signal', density: 'critical', lumen: 'critical', flow: 'gust' }
  };
  const base = table[state];
  return {
    ...base,
    flow: userContext?.reducedMotion || userContext?.lowPower ? 'still' : base.flow,
    surface: userContext?.reducedTransparency ? 'still' : base.surface
  };
}

function pickRecommendation(input: AtmosphereInput): AtmosphereResult['recommendation'] {
  const home = input.homeAir ?? {};
  const day = input.dayContext ?? {};
  const weather = input.weather;
  if ((home.co2ppm ?? 0) >= 1000) return { action: 'ventilate', label: '10분 환기를 먼저 권장합니다.' };
  if ((home.indoorHumidityPct ?? weather.humidityPct) >= 75) return { action: 'dehumidify', label: '제습을 먼저 켜는 편이 좋습니다.' };
  if (weather.pm25 >= 36 || weather.aqi >= 51) return { action: 'purify', label: '공기청정 모드를 높여 주세요.' };
  if ((day.eventsNext12h ?? 0) >= 5) return { action: 'focus_plan', label: '집중 시간을 먼저 확보하세요.' };
  return { action: 'maintain', label: '현재 상태를 유지해도 좋습니다.' };
}

export function evaluateAtmosphere(input: AtmosphereInput): AtmosphereResult {
  const { weather, homeAir, dayContext, userContext } = input;
  const airWeight = Math.max(scoreHumidity(weather.humidityPct), weather.temperatureC >= 30 ? 55 : 15);
  const flowEnergy = clamp(weather.windSpeedMs * 10, 0, 100);
  const airPurityPressure = scoreAirPurity(weather.aqi, weather.pm25, homeAir?.co2ppm);
  const schedulePressure = scoreSchedule(dayContext?.eventsNext12h, dayContext?.nextDeadlineHours, dayContext?.notificationUrgency);
  const actionUrgency = Math.max(airWeight, airPurityPressure, schedulePressure);
  const state = stateFromScore(actionUrgency);
  const tokens = tokensFromState(state, userContext);
  const recommendation = pickRecommendation(input);

  const stateCopy: Record<PerforaState, string> = {
    calm: '공기가 안정적입니다.',
    normal: '공기가 살짝 습하지만 안정적입니다.',
    live: '공기와 일정 흐름이 조금 활발합니다.',
    alert: '확인할 공기 상태가 늘었습니다.',
    critical: '즉시 확인이 필요한 상태입니다.'
  };

  const summary = `${stateCopy[state]} ${recommendation.label}`;
  const accessibleSummary = `오늘의 공기 시각 요약: ${stateCopy[state]} ${weather.temperatureC}도, 습도 ${weather.humidityPct}%, 풍속 ${weather.windSpeedMs}미터 매초, AQI ${weather.aqi}, PM2.5 ${weather.pm25}입니다. ${recommendation.label}`;

  return {
    state,
    ...tokens,
    pressure: { airWeight, flowEnergy, airPurityPressure, schedulePressure, actionUrgency },
    recommendation,
    summary,
    accessibleSummary
  };
}
