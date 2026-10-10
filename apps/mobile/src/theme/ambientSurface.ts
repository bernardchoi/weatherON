import type { AppTheme } from "./tokens";

// Final core v3 / Final v1 icons. The subdued ON color belongs only to the home wordmark.
export function ambientPalette(theme: AppTheme) {
  return theme.name === "dark" ? {
    background: "#0C2035", surface: "#142D46", text: "#F6F8FF", muted: "#B9CDEF",
    border: "#324B67", accent: "#FFB52E", accentLabel: "#FFB52E", selected: "#433A27", wordmarkOn: "#E6B98D",
  } : {
    background: "#EFF9FF", surface: "#E4F2FC", text: "#111738", muted: "#626A91",
    border: "#CDDFEE", accent: "#E53C24", accentLabel: "#B63121", selected: "#FFE5DE", wordmarkOn: "#A96D50",
  };
}

// Scoped to migrated screens; later screens keep their existing provider and presentation.
export function ambientHomeTheme(theme: AppTheme, iosReadingSurface = false): AppTheme {
  const p = ambientPalette(theme);
  return { ...theme, background: p.background, card: p.surface, cardStrong: p.surface,
    cardSoft: p.surface, text: p.text, muted: iosReadingSurface && theme.name === "light" ? "#475477" : p.muted, subtle: iosReadingSurface && theme.name === "light" ? "#475477" : p.muted, border: p.border,
    clear: p.accent, gold: iosReadingSurface && theme.name === "light" ? "#B12F21" : p.accentLabel, onAccent: theme.name === "dark" ? p.background : "#FFFFFF" };
}
