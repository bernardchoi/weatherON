import React from "react";
import { Platform, UIManager, View, requireNativeComponent, type ViewProps } from "react-native";
import { IosGlassBackdrop } from "./IosGlassBackdrop";
import type { AppTheme } from "../theme/tokens";

type NativeSurfaceProps = ViewProps & {
  activeIndex: number;
};

const nativeComponentName = "LiquidGlassNavigationView";
const NativeLiquidGlassSurface =
  Platform.OS === "ios" && UIManager.getViewManagerConfig(nativeComponentName)
    ? requireNativeComponent<NativeSurfaceProps>(nativeComponentName)
    : null;

type LiquidGlassNavigationSurfaceProps = {
  activeIndex: number;
  theme: AppTheme;
};

// iOS 26에서는 SwiftUI glassEffect/GlassEffectContainer를 쓰고,
// 이전 iOS와 이미 배포된 바이너리에서는 네이티브 material fallback을 유지한다.
export function LiquidGlassNavigationSurface({ activeIndex, theme }: LiquidGlassNavigationSurfaceProps) {
  if (NativeLiquidGlassSurface) {
    return <NativeLiquidGlassSurface activeIndex={activeIndex} pointerEvents="none" style={styles.fill} />;
  }

  if (Platform.OS === "ios") {
    return <IosGlassBackdrop theme={theme} role="dock" style={{ borderRadius: 32 }} />;
  }

  return <View pointerEvents="none" style={[styles.fill, { backgroundColor: theme.cardStrong }]} />;
}

const styles = {
  fill: {
    position: "absolute" as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 32,
  },
};
