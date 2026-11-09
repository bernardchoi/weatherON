import React from "react";
import { Platform, UIManager, View, requireNativeComponent, StyleSheet, type ViewProps } from "../localization/react-native";
import type { AppTheme } from "../theme/tokens";

const supported = Platform.OS === "ios" && Number.parseInt(String(Platform.Version), 10) >= 26;
const NativeMaterial = supported && UIManager.getViewManagerConfig("HomePlanGlassView")
  ? requireNativeComponent<ViewProps & { isDarkTheme: boolean; materialCornerRadius: number }>("HomePlanGlassView") : null;

// One functional destination/time/forecast surface. Outfit content stays tonal.
// No custom blur, animated glass, touch interception or decorative glass copies.
export function HomePlanMaterial({ theme, cornerRadius = 24 }: { theme: AppTheme; cornerRadius?: number }) {
  if (Platform.OS !== "ios") return null;
  if (NativeMaterial && !theme.reducedTransparency) return <NativeMaterial testID="home-plan-native-glass" pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" isDarkTheme={theme.name === "dark"} materialCornerRadius={cornerRadius} style={[styles.fill, { borderRadius: cornerRadius }]} />;
  return <View testID="home-plan-tonal-fallback" pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.fill, { borderRadius: cornerRadius, backgroundColor: theme.card }]} />;
}
const styles = StyleSheet.create({ fill: { ...StyleSheet.absoluteFill, borderRadius: 24 } });
