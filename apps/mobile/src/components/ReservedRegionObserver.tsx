import React from "react";
import { Platform, UIManager, requireNativeComponent, type ViewProps } from "../localization/react-native";
import type { ReservedRegion } from "../theme/reservedRegionLayout";

type NativeReservedRegionObserverProps = ViewProps & {
  onRegionsChange: (event: { nativeEvent: { regions: ReservedRegion[] } }) => void;
};

const nativeComponentName = "ReservedRegionObserverView";
const NativeReservedRegionObserver = Platform.OS === "ios" && UIManager.getViewManagerConfig(nativeComponentName)
  ? requireNativeComponent<NativeReservedRegionObserverProps>(nativeComponentName)
  : null;

export function ReservedRegionObserver({ onRegionsChange }: { onRegionsChange: (regions: ReservedRegion[]) => void }) {
  if (!NativeReservedRegionObserver) return null;
  return (
    <NativeReservedRegionObserver
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onRegionsChange={({ nativeEvent }) => onRegionsChange(nativeEvent.regions)}
      style={styles.fill}
    />
  );
}

const styles = {
  fill: {
    position: "absolute" as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
};
