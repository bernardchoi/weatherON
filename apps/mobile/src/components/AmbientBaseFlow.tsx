import React from "react";
import { Animated, StyleSheet } from "../localization/react-native";
import { AmbientSurfaceTexture } from "./AmbientSurfaceTexture";

// Cyclic displacement of the surface, not a claim about measured wind bearing.
// Narrower diffuse shoulders retain depth instead of a broad white wash.
// Endpoints match; one long native clock keeps reading content stationary.
export function AmbientBaseFlow({ phase, dark, visible, onPowerState }: {
  phase: Animated.Value; dark: boolean; visible: boolean;
  onPowerState?: React.ComponentProps<typeof AmbientSurfaceTexture>["onPowerState"];
}) {
  return <Animated.View testID="ambient-base-flow" style={[StyleSheet.absoluteFill, {
    top: -80, bottom: -80, left: -60, right: -60,
    experimental_backgroundImage: dark
      ? "radial-gradient(ellipse 250% 140% at -20% -40%, #8CABCA00 55%, #8CABCA0C 58%, #8CABCA42 60%, #8CABCA18 62%, #8CABCA00 68%), radial-gradient(ellipse 185% 120% at 140% 125%, #8CABCA00 38%, #8CABCA20 45%, #8CABCA0C 49%, #8CABCA00 57%)"
      : "radial-gradient(ellipse 250% 140% at -20% -40%, #FFFFFF00 55%, #FFFFFF18 58%, #FFFFFFD0 60%, #FFFFFF44 62%, #FFFFFF00 68%), radial-gradient(ellipse 185% 120% at 140% 125%, #FFFFFF00 38%, #FFFFFF70 45%, #FFFFFF28 49%, #FFFFFF00 57%)",
    opacity: visible ? phase.interpolate({ inputRange: [0, .3, .7, 1], outputRange: dark ? [.34, .40, .36, .34] : [.50, .70, .58, .50] }) : 0,
    transform: [
      { translateX: phase.interpolate({ inputRange: [0, .25, .6, .85, 1], outputRange: [-24, 42, 12, -38, -24] }) },
      { translateY: phase.interpolate({ inputRange: [0, .25, .6, .85, 1], outputRange: [0, 46, 18, -28, 0] }) },
    ],
  }]}>
    <AmbientSurfaceTexture isDarkTheme={dark} onPowerState={onPowerState} style={[StyleSheet.absoluteFill, { opacity: dark ? .08 : .28 }]} />
  </Animated.View>;
}
