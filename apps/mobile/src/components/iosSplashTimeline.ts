// One launch choreography. Each interval overlaps; no loops or app/background clock.
export const iosSplashTimeline = {
  cloud: { start: 0, duration: 410 },
  sun: { start: 180, duration: 600 },
  glow: { start: 280, duration: 570 },
  wordmark: { start: 530, duration: 480 },
  exit: { start: 1280, duration: 220 },
  total: 1500,
  reducedFadeIn: 100,
  reducedHold: 40,
  reducedFadeOut: 120,
  policyFallback: 200,
  readyFallback: 500,
  watchdog: 2100,
} as const;
