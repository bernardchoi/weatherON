import { Platform, type ViewStyle } from "react-native";
import type { AppTheme } from "./tokens";

type AndroidMaterialRole = "navigation" | "iconButton" | "sheet" | "weather" | "cta";

export function androidMaterialSurface(theme: AppTheme, role: AndroidMaterialRole): ViewStyle | null {
  if (Platform.OS !== "android") return null;

  return {
    backgroundColor: getSurfaceColor(theme, role),
    borderColor: getOutlineColor(theme, role),
    elevation: getElevation(role),
  };
}

export function androidMaterialActiveIndicator(theme: AppTheme, active: boolean): ViewStyle | null {
  if (Platform.OS !== "android" || !active) return null;

  return {
    backgroundColor: theme.name === "light" ? `${theme.gold}18` : `${theme.gold}22`,
  };
}

export function androidMaterialRipple(theme: AppTheme, tone: "primary" | "surface" = "surface") {
  if (Platform.OS !== "android") return undefined;

  const color = tone === "primary" ? theme.onAccent : theme.text;
  return {
    color: `${color}1F`,
    borderless: false,
  };
}

function getSurfaceColor(theme: AppTheme, role: AndroidMaterialRole): string {
  if (role === "cta") return theme.cardMuted;
  if (role === "iconButton") return theme.cardMuted;
  if (theme.name === "light") {
    if (role === "navigation") return "#F8FBFE";
    if (role === "sheet") return "#FFFFFF";
    if (role === "weather") return "#FFFFFF";
    return "#F9FCFF";
  }

  if (role === "navigation") return theme.card;
  if (role === "sheet") return theme.cardSoft;
  if (role === "weather") return theme.card;
  return theme.cardStrong;
}

function getOutlineColor(theme: AppTheme, role: AndroidMaterialRole): string {
  if (role === "iconButton") return "transparent";
  if (role === "cta") return theme.border;
  return theme.name === "light" ? "rgba(31,78,121,0.14)" : "rgba(248,251,255,0.14)";
}

function getElevation(role: AndroidMaterialRole): number {
  if (role === "iconButton" || role === "cta") return 0;
  if (role === "sheet") return 8;
  if (role === "navigation") return 3;
  if (role === "weather") return 3;
  return 0;
}
