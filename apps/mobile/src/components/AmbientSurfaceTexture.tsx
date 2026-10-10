import React from "react";
import { File, Paths } from "expo-file-system";
import { Platform, UIManager, requireNativeComponent, type ViewProps } from "../localization/react-native";

type Props = ViewProps & { renderingEnabled?: boolean; isDarkTheme: boolean; onPowerState?: (event: { nativeEvent: { lowPower: boolean; renderingEnabled?: boolean; textureGenerationCount?: number; baseOnly?: boolean; textureWidth?: number; textureHeight?: number; textureViewWidth?: number; textureViewHeight?: number; textureRenderMs?: number; thermalState?: number } }) => void };
const name = "AmbientSurfaceTextureView";
const NativeTexture = Platform.OS === "ios" && UIManager.getViewManagerConfig(name)
  ? requireNativeComponent<Props>(name) : null;

// Existing binaries/unsupported native rendering keep the bounded gradient field.
export function AmbientSurfaceTexture(props: Props) {
  return NativeTexture ? <NativeTexture {...props} onPowerState={event => {
    if (__DEV__ && typeof event.nativeEvent.textureWidth === "number") {
      const { renderingEnabled, textureGenerationCount, textureWidth, textureHeight, textureViewWidth, textureViewHeight, textureRenderMs, thermalState } = event.nativeEvent;
      try { new File(Paths.cache, "ambient-home-texture-debug-20261010.json").write(JSON.stringify({ renderingEnabled, textureGenerationCount, textureWidth, textureHeight, textureViewWidth, textureViewHeight, textureRenderMs, thermalState })); } catch { /* Numeric QA must never interrupt rendering. */ }
    }
    props.onPowerState?.(event);
  }} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" /> : null;
}
