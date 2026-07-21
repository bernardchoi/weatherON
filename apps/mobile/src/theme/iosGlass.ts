import { Platform, type ViewStyle } from "react-native";
import { colorWithAlpha, semanticColor, type AppTheme } from "./tokens";

export type IosGlassRole =
  | "bar"
  | "dock"
  | "control"
  | "input"
  | "chip"
  | "sheet"
  | "weather"
  | "tabItem"
  | "sheetHeader"
  | "grabber"
  | "buttonPrimary"
  | "buttonSecondary";

type IosGlassSurfaceOptions = {
  nativeBackdrop?: boolean;
};

export function iosGlassSurface(theme: AppTheme, role: IosGlassRole, options: IosGlassSurfaceOptions = {}): ViewStyle | null {
  if (Platform.OS !== "ios") return null;

  const backgroundColor = options.nativeBackdrop && !theme.reducedTransparency ? "transparent" : getBackgroundColor(theme, role);
  const borderColor = getBorderColor(theme, role);
  const shadowOpacity = getShadowOpacity(theme, role);
  const isControl = role === "control" || role === "tabItem" || role === "buttonPrimary" || role === "buttonSecondary";
  const shadowRadius = isControl ? 18 : role === "dock" || role === "sheet" ? 32 : 20;
  const shadowHeight = role === "sheet" ? -10 : role === "dock" ? 12 : isControl ? 7 : 8;

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
    return theme.name === "light" ? theme.card : theme.cardStrong;
  }

  if (theme.name === "light") {
    if (role === "buttonPrimary") return colorWithAlpha(theme.clear, 0.32);
    if (role === "buttonSecondary") return colorWithAlpha(theme.card, 0.58);
    if (role === "dock") return colorWithAlpha(theme.card, 0.5);
    if (role === "tabItem") return colorWithAlpha(theme.card, 0.48);
    if (role === "chip") return colorWithAlpha(theme.card, 0.56);
    if (role === "input") return colorWithAlpha(theme.card, 0.54);
    if (role === "sheetHeader") return colorWithAlpha(theme.card, 0.62);
    if (role === "grabber") return colorWithAlpha(theme.card, 0.72);
    if (role === "weather") return colorWithAlpha(theme.card, 0.74);
    if (role === "control") return colorWithAlpha(theme.card, 0.58);
    if (role === "sheet") return colorWithAlpha(theme.card, 0.72);
    return colorWithAlpha(theme.card, 0.64);
  }

  if (role === "buttonPrimary") return colorWithAlpha(theme.clear, 0.26);
  if (role === "buttonSecondary") return colorWithAlpha(theme.skyLite, 0.16);
  if (role === "dock") return colorWithAlpha(theme.skyLite, 0.18);
  if (role === "tabItem") return colorWithAlpha(theme.skyLite, 0.19);
  if (role === "chip") return colorWithAlpha(theme.skyLite, 0.15);
  if (role === "input") return colorWithAlpha(theme.skyLite, 0.14);
  if (role === "sheetHeader") return colorWithAlpha(theme.skyLite, 0.14);
  if (role === "grabber") return colorWithAlpha(theme.skyLite, 0.58);
  if (role === "weather") return colorWithAlpha(theme.card, 0.74);
  if (role === "control") return colorWithAlpha(theme.skyLite, 0.16);
  if (role === "sheet") return colorWithAlpha(theme.card, 0.74);
  return colorWithAlpha(theme.card, 0.68);
}

function getBorderColor(theme: AppTheme, role: IosGlassRole): string {
  if (role === "dock" || role === "tabItem" || role === "control" || role === "input" || role === "chip" || role === "sheetHeader" || role === "buttonPrimary" || role === "buttonSecondary") return semanticColor(theme, "glassBorderStrong");
  if (role === "grabber") return colorWithAlpha(theme.text, 0.44);
  return semanticColor(theme, "glassBorder");
}

function getShadowOpacity(theme: AppTheme, role: IosGlassRole): number {
  if (role === "grabber") return 0;
  const isControl = role === "control" || role === "tabItem" || role === "dock" || role === "buttonPrimary" || role === "buttonSecondary";
  if (theme.name === "light") return isControl ? 0.18 : 0.16;
  return isControl ? 0.34 : 0.3;
}
