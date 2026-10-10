import React from "react";
import { Animated, StyleSheet } from "../localization/react-native";
import { AmbientSurfaceTexture } from "./AmbientSurfaceTexture";

// Cyclic displacement of the surface, not a claim about measured wind bearing.
// Endpoints match; one long native clock keeps reading content stationary.
export function AmbientBaseFlow({ phase, dark, visible, onPowerState }: {
  phase: Animated.Value; dark: boolean; visible: boolean;
  onPowerState?: React.ComponentProps<typeof AmbientSurfaceTexture>["onPowerState"];
}) {
  return <Animated.View testID="ambient-base-flow" style={[StyleSheet.absoluteFill, {
    top: -80, bottom: -80, left: -60, right: -60,
    experimental_backgroundImage: dark
      ? "radial-gradient(ellipse 250% 115% at -35% -25%, #8CABCA00 46%, #8CABCA14 52%, #8CABCA42 55%, #8CABCA14 59%, #8CABCA00 67%), radial-gradient(ellipse 210% 130% at 145% 130%, #8CABCA00 38%, #8CABCA20 47%, #8CABCA00 58%)"
      : "radial-gradient(ellipse 250% 115% at -35% -25%, #FFFFFF00 46%, #FFFFFF22 52%, #FFFFFFC0 55%, #FFFFFF22 59%, #FFFFFF00 67%), radial-gradient(ellipse 210% 130% at 145% 130%, #FFFFFF00 38%, #FFFFFF66 47%, #FFFFFF00 58%)",
    opacity: visible ? phase.interpolate({ inputRange: [0, .3, .7, 1], outputRange: dark ? [.34, .40, .36, .34] : [.50, .70, .58, .50] }) : 0,
    transform: [
      { translateX: phase.interpolate({ inputRange: [0, .25, .6, .85, 1], outputRange: [-18, 30, 8, -32, -18] }) },
      { translateY: phase.interpolate({ inputRange: [0, .25, .6, .85, 1], outputRange: [0, 42, 18, -24, 0] }) },
    ],
  }]}>
    <AmbientSurfaceTexture isDarkTheme={dark} onPowerState={onPowerState} style={[StyleSheet.absoluteFill, { opacity: dark ? .08 : .45 }]} />
  </Animated.View>;
}
