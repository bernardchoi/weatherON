import React from "react";
import { Platform, UIManager, requireNativeComponent, type ViewProps } from "react-native";

type NativeSurfaceProps = ViewProps & {
  activeIndex: number;
  onSelect: (event: { nativeEvent: { index: number } }) => void;
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
  onSelect: (event: { nativeEvent: { index: number } }) => void;
  isDarkTheme: boolean;
};

// iOS 26 캡슐 재질·누름·드래그는 UIKit이 함께 처리한다.
// 이전 iOS와 이미 배포된 바이너리에서는 BottomNav의 JS 활성 탭 캡슐을 사용한다.
export function LiquidGlassNavigationSurface({ activeIndex, onSelect, isDarkTheme }: LiquidGlassNavigationSurfaceProps) {
  if (Platform.OS !== "ios") return null;

  if (NativeLiquidGlassSurface) {
    return (
      <NativeLiquidGlassSurface
        isDarkTheme={isDarkTheme}
        activeIndex={activeIndex}
        onSelect={onSelect}
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
