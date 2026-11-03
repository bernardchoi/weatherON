// Product clothing heuristics, not official weather alerts or medical limits.
// All inputs use Celsius and m/s; convert display units only after judging.
export function validTemperature(value: number, available = true): number {
  return available && Number.isFinite(value) && value >= -100 && value <= 70 ? value : NaN;
}
export function validMeasure(value: number, available = true, max = Infinity): number {
  return available && Number.isFinite(value) && value >= 0 && value <= max ? value : NaN;
}
export function judgeThermal(input: { air: number; apparent: number; min: number; max: number; humid?: boolean; wind: number }) {
  const { air, apparent, min, max, humid, wind } = input;
  const temperature = Number.isFinite(apparent) ? apparent : air;
  const cold = temperature <= 8 || air <= 8 || max <= 12 || min <= 8;
  // Conflicting cold/hot signals retain insulation; warming hours are secondary.
  const hot = !cold && (temperature >= 27 || air >= 29 || (max >= 31 && temperature >= 22) || (humid === true && temperature >= 26));
  const freezing = cold && (temperature < 0 || air < 0 || min < 0 || max < 0);
  const swing = max - min;
  const lightLayer = !hot && (cold || temperature <= 18 || (max < 29 && min <= 17 && swing >= 7) || (wind >= 7 && temperature < 24));
  return { temperature, cold, hot, freezing, swing, lightLayer, hotPeriod: cold && max >= 31 };
}

// Stable alternatives share the same action. No render-time randomness, address,
// coordinates or account data enter the selector.
const thermalCopy = {
  freezing: ["영하의 추위에 대비해요.\n두툼한 겉옷과 목도리를 챙겨요.", "기온이 많이 낮아요.\n보온 겉옷과 목도리로 준비해요."],
  cold: ["공기가 차가워요.\n보온성 있는 겉옷과 따뜻한 상의를 챙겨요.", "추운 날씨에 맞춰요.\n따뜻한 상의와 보온 겉옷을 준비해요."],
  hot: ["더위에 대비해요.\n통풍 좋은 옷과 물을 챙겨 쉬어가요.", "더운 날씨예요.\n바람 잘 통하는 차림에 물을 챙겨요."],
  swing: ["시간대별 기온 차가 커요.\n벗고 입기 편한 겉옷을 챙겨요.", "서늘한 시간도 있어요.\n입고 벗을 겉옷을 준비해요."],
  cool: ["선선한 공기예요.\n가볍게 걸칠 한 겹을 챙겨요.", "서늘할 수 있어요.\n가벼운 겉옷 한 겹을 준비해요."],
  mild: ["온화한 기온이에요.\n활동하기 편한 차림으로 준비해요.", "온화한 날씨에 맞춰요.\n움직이기 편한 옷을 골라요."],
  unknown: ["옷차림을 정하기 전에,\n기온 정보를 다시 확인해요.", "기온 정보가 부족해요.\n최신 날씨를 확인하고 준비해요."],
} as const;
export function thermalPreparation(judgment: ReturnType<typeof judgeThermal>, stableKey = "") {
  const kind = judgment.freezing ? "freezing" : judgment.cold ? "cold" : judgment.hot ? "hot" : !Number.isFinite(judgment.temperature) ? "unknown" : judgment.lightLayer && judgment.swing >= 7 ? "swing" : judgment.lightLayer ? "cool" : "mild";
  let hash = 0;
  for (const character of stableKey) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  const copy = thermalCopy[kind][Math.abs(hash) % 2];
  return { kind, copy: judgment.hotPeriod ? `${copy}\n더운 시간에는 겉옷을 벗고 물을 챙겨요.` : copy };
}

export function judgePreparationConditions(input: { conditions: readonly string[]; wind: number; probability: number; precipitation: number }) {
  const { conditions, wind, probability, precipitation } = input;
  const phase: "hail" | "ice" | "snow" | "rain" | "possible" = conditions.some(c => c === "hail" || c === "storm-hail") ? "hail"
    : conditions.some(c => c === "sleet" || c === "mixed") ? "ice"
    : conditions.includes("snow") ? "snow"
    : conditions.some(c => c === "rain" || c === "storm") ? "rain" : "possible";
  const wet = phase !== "possible" || probability >= 50 || precipitation > 0;
  return { phase, wet, windy: wind >= 7, windAndWet: wet && wind >= 8 };
}
