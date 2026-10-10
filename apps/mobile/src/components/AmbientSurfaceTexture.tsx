import React from "react";
import { Platform, UIManager, requireNativeComponent, type ViewProps } from "../localization/react-native";

type Props = ViewProps & { isDarkTheme: boolean; onPowerState?: (event: { nativeEvent: { lowPower: boolean; baseOnly?: boolean } }) => void };
const name = "AmbientSurfaceTextureView";
const NativeTexture = Platform.OS === "ios" && UIManager.getViewManagerConfig(name)
  ? requireNativeComponent<Props>(name) : null;

// Existing binaries/unsupported native rendering keep the bounded gradient field.
export function AmbientSurfaceTexture(props: Props) {
  return NativeTexture ? <NativeTexture {...props} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" /> : null;
}
