import { Platform } from "../localization/react-native";
import { brandPalettes } from "./brandPalette";
import type { AppTheme } from "./tokens";

// Final core v3 / Final v1 icons. The subdued ON color belongs only to the home wordmark.
export function ambientPalette(theme: AppTheme) {
  if (Platform.OS === "ios") {
    const p = brandPalettes[theme.name];
    return { background: p.background, surface: p.surface, text: p.text, muted: p.muted,
      border: p.border, accent: p.action, accentLabel: p.actionLabel,
      selected: p.selected, wordmarkOn: p.wordmarkOn };
  }
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
  if (Platform.OS === "ios") return theme;
  const p = ambientPalette(theme);
  return { ...theme, success: p.accent, actionFill: p.accent, wordmarkOn: p.wordmarkOn, materialTint: theme.skyLite, background: p.background, card: p.surface, cardStrong: p.surface,
    cardSoft: p.surface, text: p.text, muted: iosReadingSurface && theme.name === "light" ? "#475477" : p.muted, subtle: iosReadingSurface && theme.name === "light" ? "#475477" : p.muted, border: p.border,
    clear: iosReadingSurface && theme.name === "light" ? "#DA3622" : p.accent, gold: iosReadingSurface ? theme.name === "light" ? "#AA2C1F" : "#FFD17A" : p.accentLabel, onAccent: theme.name === "dark" ? p.background : "#FFFFFF" };
}

// Approved reading routes share these tokens; Home retains its existing material.
export function ambientReadingTheme(theme: AppTheme): AppTheme {
  if (Platform.OS === "ios") return theme;
  const base = ambientHomeTheme(theme, true);
  return { ...base, cardMuted: base.card, sky: base.muted, skyLite: base.muted,
    warm: base.gold, clear: base.gold, success: base.gold, actionFill: base.gold, materialTint: base.muted };
}

export const ambientReadingRouteIds: readonly string[] = ["C1", "C2", "C3", "C4", "M1", "G1", "P1", "G2", "H2", "H3", "H4", "H5", "H6", "H7", "M2", "M3", "M4", "A1", "A2", "A3", "A4", "R1", "R2", "O1", "O2", "O3", "O4", "O5", "O6", "O7"];

// Approved Home base: shared color temperature, independent of weather/interaction layers.
export function ambientBaseGradient(theme: AppTheme) {
  if (Platform.OS === "ios") return theme.name === "dark"
    ? "radial-gradient(ellipse at 70% 44%, #21414C 0%, #173642 44%, #102B38 100%)"
    : "radial-gradient(ellipse at 86% 8%, #D5EAEC 0%, #D9EEF0 24%, #DDEFF2 52%, #E4F3F5 75%, #E9F6F8 100%)";
  return theme.name === "dark"
    ? "radial-gradient(ellipse at 70% 44%, #153053 0%, #0F2948 44%, #0C223D 100%)"
    : "radial-gradient(ellipse at 86% 8%, #C6DDF5 0%, #CCE1F6 24%, #D8EAFB 52%, #DDEFFC 75%, #EAF6FF 100%)";
}
