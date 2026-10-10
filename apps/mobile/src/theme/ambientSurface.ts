import type { AppTheme } from "./tokens";

// Final core v3 / Final v1 icons. The subdued ON color belongs only to the home wordmark.
export function ambientPalette(theme: AppTheme) {
  return theme.name === "dark" ? {
    background: "#0C2035", surface: "#142D46", text: "#F6F8FF", muted: "#B9CDEF",
    border: "#324B67", accent: "#FFB52E", accentLabel: "#FFB52E", selected: "#433A27", wordmarkOn: "#E6B98D",
  } : {
    background: "#EFF9FF", surface: "#E4F2FC", text: "#111738", muted: "#626A91",
    border: "#CDDFEE", accent: "#E53C24", accentLabel: "#B63121", selected: "#FFE5DE", wordmarkOn: "#9E6449",
  };
}

// Scoped to migrated screens; later screens keep their existing provider and presentation.
export function ambientHomeTheme(theme: AppTheme, iosReadingSurface = false): AppTheme {
  const p = ambientPalette(theme);
  return { ...theme, background: p.background, card: p.surface, cardStrong: p.surface,
    cardSoft: p.surface, text: p.text, muted: iosReadingSurface && theme.name === "light" ? "#475477" : p.muted, subtle: iosReadingSurface && theme.name === "light" ? "#475477" : p.muted, border: p.border,
    clear: iosReadingSurface && theme.name === "light" ? "#DA3622" : p.accent, gold: iosReadingSurface ? theme.name === "light" ? "#AA2C1F" : "#FFD17A" : p.accentLabel, onAccent: theme.name === "dark" ? p.background : "#FFFFFF" };
}

// Approved reading routes share these tokens; Home retains its existing material.
export function ambientReadingTheme(theme: AppTheme): AppTheme {
  const base = ambientHomeTheme(theme, true);
  return { ...base, cardMuted: base.card, sky: base.muted, skyLite: base.muted,
    warm: base.gold, clear: base.gold };
}

export const ambientReadingRouteIds: readonly string[] = ["C1", "C2", "C3", "C4", "M1", "G1", "P1", "G2", "H2", "H3", "H4", "H5", "H6", "H7", "M2", "M3", "M4", "A1", "A2", "A3", "A4", "R1", "R2", "O1", "O2", "O3", "O4", "O5", "O6", "O7"];
