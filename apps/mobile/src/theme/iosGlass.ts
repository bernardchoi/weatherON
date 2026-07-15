import { Platform, type ViewStyle } from "react-native";
import type { AppTheme } from "./tokens";

type IosGlassRole = "bar" | "button" | "sheet" | "weather";

export function iosGlassSurface(theme: AppTheme, role: IosGlassRole): ViewStyle | null {
  if (Platform.OS !== "ios") return null;

  const backgroundColor = getBackgroundColor(theme, role);
  const borderColor = theme.name === "light" ? "rgba(31,78,121,0.18)" : "rgba(248,251,255,0.18)";
  const shadowOpacity = theme.name === "light" ? 0.12 : 0.26;
  const shadowRadius = role === "button" ? 14 : role === "sheet" ? 26 : 20;
  const shadowHeight = role === "sheet" ? -8 : role === "button" ? 6 : 10;

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
    if (role === "weather") return "rgba(255,255,255,0.74)";
    if (role === "button") return "rgba(255,255,255,0.68)";
    return "rgba(255,255,255,0.78)";
  }

  if (role === "weather") return "rgba(43,113,157,0.68)";
  if (role === "button") return "rgba(39,106,150,0.58)";
  return "rgba(39,106,150,0.72)";
}
