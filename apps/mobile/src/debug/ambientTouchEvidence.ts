import { File, Paths } from "expo-file-system";

type Counts = { down: number; move: number; up: number; cancel: number; measured: number };
let lastPolicy: { lowPowerMode: boolean; reducedMotion: boolean | null; reducedTransparency: boolean } | undefined;
// Exact authored diagnostic only: no touch positions, payloads or user records.
export function writeAmbientTouchEvidence(counts: Counts, phase: string, policy?: {
  lowPowerMode: boolean; reducedMotion: boolean | null; reducedTransparency: boolean;
}) {
  if (!__DEV__) return;
  if (policy) lastPolicy = policy;
  try {
    new File(Paths.cache, "ambient-home-touch-debug-20261010.json").write(JSON.stringify({
      down: counts.down, move: counts.move, up: counts.up, cancel: counts.cancel,
      measured: counts.measured, phase, ...(lastPolicy ?? {}),
    }));
  } catch { /* Diagnosis must not affect input or navigation. */ }
}
