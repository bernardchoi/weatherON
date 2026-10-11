import React, { createContext, useContext } from "react";
import { StyleSheet, View } from "../localization/react-native";
import type { AppTheme } from "../theme/tokens";
import { ambientBaseGradient } from "../theme/ambientSurface";

export const AmbientReadingContext = createContext(false);
export const useAmbientReadingSurface = () => useContext(AmbientReadingContext);

// Same full-window Home base on every reading route. Quiet folds only: no weather,
// Home content, clock, native animation, or touch capture is mounted here.
export function AmbientReadingSurface({ theme, viewport }: { theme: AppTheme; viewport?: { top: number; height: number }; routeId?: string }) {
  return <View testID="ambient-reading-base" pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={[StyleSheet.absoluteFill, { backgroundColor: theme.background, overflow: "hidden" },
      { experimental_backgroundImage: ambientBaseGradient(theme) },
      viewport && { top: viewport.top, height: viewport.height, bottom: undefined }]}>
    {!theme.reducedTransparency ? <View testID="ambient-reading-folds" style={[StyleSheet.absoluteFill, {
      top: -80, bottom: -80, left: -60, right: -60,
      opacity: theme.name === "dark" ? .34 : .50,
      experimental_backgroundImage: theme.name === "dark"
        ? "radial-gradient(ellipse 250% 140% at -20% -40%, #8CABCA00 55%, #8CABCA0C 58%, #8CABCA42 60%, #8CABCA18 62%, #8CABCA00 68%), radial-gradient(ellipse 185% 120% at 140% 125%, #8CABCA00 38%, #8CABCA20 45%, #8CABCA0C 49%, #8CABCA00 57%)"
        : "radial-gradient(ellipse 250% 140% at -20% -40%, #FFFFFF00 55%, #FFFFFF18 58%, #FFFFFFD0 60%, #FFFFFF44 62%, #FFFFFF00 68%), radial-gradient(ellipse 185% 120% at 140% 125%, #FFFFFF00 38%, #FFFFFF70 45%, #FFFFFF28 49%, #FFFFFF00 57%)",
    }]} /> : null}
  </View>;
}
