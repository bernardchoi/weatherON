/** Presentation only: never creates forecasts, advice or weather alerts. */
export type HomeMascotWeather = "neutral" | "clear" | "cloud" | "rain" | "snow" | "storm" | "fog";
export type HomeMascotState = {
  weather: HomeMascotWeather;
  daylight: "day" | "night" | "twilight" | "unknown";
  thermal: "normal" | "cold" | "hot";
  asset: "base" | "rain" | "cold" | "heat";
  clothing?: import("./mascotOutfit").MascotClothing;
};
export function resolveHomeMascotState(input: {
  condition: string;
  reliable: boolean;
  pending?: boolean;
  tempC: number;
  tempAvailable?: boolean;
  daylight: HomeMascotState["daylight"];
}): HomeMascotState {
  const neutral: HomeMascotState = { weather: "neutral", daylight: "unknown", thermal: "normal", asset: "base" };
  if (!input.reliable || input.pending) return neutral;
  const conditions: Record<string, HomeMascotWeather> = {
    clear: "clear", "partly-cloudy": "cloud", cloud: "cloud", rain: "rain",
    snow: "snow", storm: "storm", thunder: "storm", fog: "fog", dust: "fog",
  };
  const weather = conditions[input.condition];
  if (!weather) return neutral;
  // Heat pose follows the existing art bible (35°C), not an official alert.
  // No new cold-temperature threshold: only verified snow selects cold clothing.
  const thermal = weather === "snow" ? "cold"
    : input.tempAvailable !== false && Number.isFinite(input.tempC) && input.tempC >= 35 ? "hot" : "normal";
  return { weather, thermal, daylight: input.daylight,
    asset: weather === "rain" || weather === "storm" ? "rain" : weather === "snow" || thermal === "cold" ? "cold" : thermal === "hot" ? "heat" : "base" };
}
export function canAnimateHomeMascot(input: {
  active: boolean; appActive: boolean; visible: boolean;
  reducedMotion: boolean | null; lowPowerMode: boolean; scrolling?: boolean;
}) {
  return input.active && input.appActive && input.visible && input.reducedMotion === false && !input.lowPowerMode && !input.scrolling;
}
export function homeMascotMotion(state: HomeMascotState) {
  if (state.weather === "neutral") return { duration: 4800, lift: 0, tilt: 0 };
  if (state.weather === "storm") return { duration: 4200, lift: 0.4, tilt: 0.6 };
  if (state.weather === "rain") return { duration: 4200, lift: 0.6, tilt: 0.4 };
  if (state.daylight === "night") return { duration: 5600, lift: 0.5, tilt: 0 };
  if (state.weather === "snow" || state.thermal === "cold") return { duration: 4600, lift: 0.4, tilt: 0.25 };
  return { duration: state.thermal === "hot" ? 5600 : 4400, lift: state.weather === "clear" ? 1 : 0.5, tilt: 0 };
}

// A continuous decorative cue, not a new threshold for a strong-wind warning.
export function homeMascotWind(windMs: number, available: boolean) {
  return available && Number.isFinite(windMs) ? Math.min(1, Math.max(0, windMs) / 12) : 0;
}
