export function ambientWeatherMotion(condition: string, reliable: boolean, windMs: number, precipitationMm: number) {
  const wind = reliable && Number.isFinite(windMs) ? Math.max(0, Math.min(12, windMs)) : 0;
  const precipitation = reliable && Number.isFinite(precipitationMm) ? Math.max(0, Math.min(8, precipitationMm)) : 0;
  const known = ["clear", "partly-cloudy", "cloud", "rain", "snow", "storm", "fog", "dust"].includes(condition);
  const kind = reliable && known ? condition : "none";
  return {
    kind, wind,
    particles: kind === "rain" || kind === "storm" ? 8 + Math.round(precipitation * 2) : kind === "snow" ? 12 + Math.round(precipitation) : 0,
    duration: 44000 - wind * 650 - precipitation * 180,
  };
}
