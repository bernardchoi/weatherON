import React from "react";
import { BlurView, type BlurTint } from "expo-blur";
import { Platform, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { colorWithAlpha, type AppTheme } from "../theme/tokens";
import type { IosGlassRole } from "../theme/iosGlass";

type IosGlassBackdropProps = {
  theme: AppTheme;
  role: IosGlassRole;
  overlayColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function IosGlassBackdrop({ theme, role, overlayColor, style }: IosGlassBackdropProps) {
  if (Platform.OS !== "ios" || theme.reducedTransparency) return null;

  const tint: BlurTint = theme.name === "light" ? "systemThinMaterialLight" : "systemThinMaterialDark";
  return (
    <BlurView
      pointerEvents="none"
      intensity={getIntensity(role)}
      tint={tint}
      style={[styles.backdrop, style, { backgroundColor: overlayColor ?? getOverlayColor(theme, role) }]}
    />
  );
}

function getIntensity(role: IosGlassRole): number {
  if (role === "sheet" || role === "dock") return 66;
  if (role === "bar") return 58;
  if (role === "sheetHeader" || role === "grabber") return 44;
  return 52;
}

function getOverlayColor(theme: AppTheme, role: IosGlassRole): string {
  if (role === "buttonPrimary") return colorWithAlpha(theme.clear, theme.name === "light" ? 0.24 : 0.2);
  if (role === "buttonSecondary") return colorWithAlpha(theme.card, theme.name === "light" ? 0.12 : 0.08);
  if (role === "sheet") return colorWithAlpha(theme.card, theme.name === "light" ? 0.18 : 0.14);
  if (role === "dock" || role === "bar") return colorWithAlpha(theme.card, theme.name === "light" ? 0.14 : 0.1);
  return colorWithAlpha(theme.name === "light" ? theme.card : theme.skyLite, theme.name === "light" ? 0.12 : 0.09);
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
});
