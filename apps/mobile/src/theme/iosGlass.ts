import { Platform, type ViewStyle } from "react-native";
import type { AppTheme } from "./tokens";

type IosGlassRole = "bar" | "button" | "sheet" | "weather" | "tabItem" | "sheetHeader" | "grabber";

export function iosGlassSurface(theme: AppTheme, role: IosGlassRole): ViewStyle | null {
  if (Platform.OS !== "ios") return null;

  const backgroundColor = getBackgroundColor(theme, role);
  const borderColor = getBorderColor(theme, role);
  const shadowOpacity = getShadowOpacity(theme, role);
  const shadowRadius = role === "button" || role === "tabItem" ? 16 : role === "sheet" ? 32 : 22;
  const shadowHeight = role === "sheet" ? -10 : role === "button" || role === "tabItem" ? 7 : 11;

  return {
    backgroundColor,
    borderColor,
    shadowColor: "#000000",
    shadowOpacity,
    shadowRadius,
    shadowOffset: { width: 0, height: shadowHeight },
  };
}

function getBackgroundColor(theme: AppTheme, role: IosGlassRole): string {
  if (theme.reducedTransparency) {
    return theme.name === "light" ? "#FFFFFF" : theme.cardStrong;
  }

  if (theme.name === "light") {
    if (role === "tabItem") return "rgba(255,255,255,0.48)";
    if (role === "sheetHeader") return "rgba(255,255,255,0.62)";
    if (role === "grabber") return "rgba(255,255,255,0.72)";
    if (role === "weather") return "rgba(255,255,255,0.74)";
    if (role === "button") return "rgba(255,255,255,0.58)";
    if (role === "sheet") return "rgba(255,255,255,0.72)";
    return "rgba(255,255,255,0.64)";
  }

  if (role === "tabItem") return "rgba(223,245,255,0.16)";
  if (role === "sheetHeader") return "rgba(223,245,255,0.14)";
  if (role === "grabber") return "rgba(223,245,255,0.58)";
  if (role === "weather") return "rgba(16,61,95,0.74)";
  if (role === "button") return "rgba(223,245,255,0.12)";
  if (role === "sheet") return "rgba(17,64,98,0.74)";
  return "rgba(17,64,98,0.68)";
}

function getBorderColor(theme: AppTheme, role: IosGlassRole): string {
  if (theme.name === "light") {
    if (role === "tabItem" || role === "button" || role === "sheetHeader") return "rgba(255,255,255,0.58)";
    return "rgba(31,78,121,0.22)";
  }

  if (role === "tabItem" || role === "button" || role === "sheetHeader") return "rgba(248,251,255,0.34)";
  if (role === "grabber") return "rgba(248,251,255,0.44)";
  return "rgba(248,251,255,0.24)";
}

function getShadowOpacity(theme: AppTheme, role: IosGlassRole): number {
  if (role === "grabber") return 0;
  if (theme.name === "light") return role === "button" || role === "tabItem" ? 0.18 : 0.16;
  return role === "button" || role === "tabItem" ? 0.34 : 0.3;
}
