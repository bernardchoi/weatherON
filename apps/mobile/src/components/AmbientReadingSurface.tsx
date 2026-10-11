import React, { createContext, useContext } from "react";
import { Image, Platform, StyleSheet, View } from "../localization/react-native";
import type { AppTheme } from "../theme/tokens";

export const AmbientReadingContext = createContext(false);
export const useAmbientReadingSurface = () => useContext(AmbientReadingContext);
const accountFields = {
  light: require("../../../../assets/ambient-surface-runtime-v1/reading-account-light.png"),
  dark: require("../../../../assets/ambient-surface-runtime-v1/reading-account-dark.png"),
};

// Quiet shared material for reading routes. No weather meaning, clock or touch capture.
export function AmbientReadingSurface({ theme, viewport, routeId }: { theme: AppTheme; viewport?: { top: number; height: number }; routeId?: string }) {
  const accountField = Platform.OS === "ios" && ["M1", "M3", "M4", "A4", "C1", "C4", "G1"].includes(routeId ?? "");
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={[StyleSheet.absoluteFill, { backgroundColor: theme.background }, !theme.reducedTransparency && !accountField && {
      experimental_backgroundImage: theme.name === "dark"
        ? "radial-gradient(ellipse 140% 90% at 110% -20%, #B9CDEF12 0%, #B9CDEF00 75%), radial-gradient(ellipse 200% 125% at -30% -45%, #B9CDEF00 58%, #B9CDEF0A 63%, #B9CDEF00 70%)"
        : "radial-gradient(ellipse 140% 90% at 110% -20%, #FFFFFFCC 0%, #FFFFFF00 75%), radial-gradient(ellipse 200% 125% at -30% -45%, #FFFFFF00 58%, #FFFFFFBB 63%, #FFFFFF00 70%)",
    }, viewport && { top: viewport.top, height: viewport.height, bottom: undefined }]}>
    {accountField && !theme.reducedTransparency ? <Image testID="ambient-account-static-field" source={accountFields[theme.name]} style={StyleSheet.absoluteFill}
      resizeMode="stretch" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" /> : null}
  </View>;
}
