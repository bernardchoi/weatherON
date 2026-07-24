import React from "react";
import { Platform, UIManager, requireNativeComponent, type ViewProps } from "react-native";

type NativeSurfaceProps = ViewProps & {
  activeIndex: number;
  isDarkTheme: boolean;
};

const nativeComponentName = "LiquidGlassNavigationView";
const supportsNativeLiquidGlass = Platform.OS === "ios" && Number.parseInt(String(Platform.Version), 10) >= 26;
const NativeLiquidGlassSurface =
  supportsNativeLiquidGlass && UIManager.getViewManagerConfig(nativeComponentName)
    ? requireNativeComponent<NativeSurfaceProps>(nativeComponentName)
    : null;

export const hasNativeLiquidGlassNavigationSurface = NativeLiquidGlassSurface !== null;

type LiquidGlassNavigationSurfaceProps = {
  activeIndex: number;
  isDarkTheme: boolean;
};

// iOS 26에서는 활성 탭에만 SwiftUI glassEffect/GlassEffectContainer를 쓴다.
// 이전 iOS와 이미 배포된 바이너리에서는 BottomNav의 JS 활성 탭 캡슐을 사용한다.
export function LiquidGlassNavigationSurface({ activeIndex, isDarkTheme }: LiquidGlassNavigationSurfaceProps) {
  if (Platform.OS !== "ios") return null;

  if (NativeLiquidGlassSurface) {
    return (
      <NativeLiquidGlassSurface
        activeIndex={activeIndex}
        isDarkTheme={isDarkTheme}
        pointerEvents="none"
        style={styles.fill}
      />
    );
  }

  return null;
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
