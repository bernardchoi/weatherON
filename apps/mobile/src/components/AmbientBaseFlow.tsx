import React from "react";
import { Animated, StyleSheet, View } from "../localization/react-native";
import { ambientSurfaceDeformation, type AmbientSurfaceContact } from "./AmbientTouchLayer";
import { AmbientSurfaceTexture } from "./AmbientSurfaceTexture";

// Independent light and shadow planes: child opacity must not be multiplied by a faint parent.
// All endpoints match. The shared clock survives route changes; content never moves.
export function AmbientBaseFlow({ phase, dark, visible, onPowerState, renderingEnabled = true, wind = 0, contact }: {
  renderingEnabled?: boolean; wind?: number; contact?: AmbientSurfaceContact;
  phase: Animated.Value; dark: boolean; visible: boolean;
  onPowerState?: React.ComponentProps<typeof AmbientSurfaceTexture>["onPowerState"];
}) {
  const drift = 1 + Math.min(12, wind) / 30;
  return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: visible ? 1 : 0 }]}>
    <Animated.View testID="ambient-base-flow" style={[StyleSheet.absoluteFill, {
      top: -220, bottom: -220, left: -210, right: -210,
      experimental_backgroundImage: dark
        ? "radial-gradient(ellipse 125% 68% at 5% -4%, #8CABCA00 46%, #8CABCA06 51%, #8CABCA20 55%, #8CABCA08 61%, #8CABCA00 69%)"
        : "radial-gradient(ellipse 125% 68% at 5% -4%, #FFFFFF00 46%, #FFFFFF28 51%, #FFFFFFD0 55%, #FFFFFF48 61%, #FFFFFF00 69%)",
      opacity: dark ? .72 : .78,
      transform: [
        ...ambientSurfaceDeformation(contact, "light"),
        { translateX: phase.interpolate({ inputRange: [0, .25, .5, .75, 1], outputRange: [-65, 72, 55, -78, -65].map(value => value * drift) }) },
        { translateY: phase.interpolate({ inputRange: [0, .25, .5, .75, 1], outputRange: [-45, 62, 100, -20, -45] }) },
      ],
    }]} />
    <Animated.View testID="ambient-depth-shoulder" style={[StyleSheet.absoluteFill, {
      top: -210, bottom: -210, left: -200, right: -200,
      experimental_backgroundImage: dark
        ? "radial-gradient(ellipse 105% 46% at 78% 62%, #01081500 24%, #0108159C 46%, #01081562 57%, #01081500 78%), radial-gradient(ellipse 110% 50% at 77% 62%, #92B6DD00 57%, #92B6DD10 63%, #92B6DD00 73%)"
        : "radial-gradient(ellipse 105% 46% at 78% 62%, #FFFFFF00 24%, #FFFFFF98 46%, #FFFFFF48 57%, #FFFFFF00 78%), radial-gradient(ellipse 110% 50% at 77% 62%, #5586B800 57%, #5586B810 63%, #5586B800 73%)",
      opacity: dark ? .72 : .55,
      transform: [...ambientSurfaceDeformation(contact, "depth"), { translateX: phase.interpolate({ inputRange: [0, .25, .5, .75, 1], outputRange: [65, -72, -38, 80, 65].map(value => value * drift) }) }, { translateY: phase.interpolate({ inputRange: [0, .25, .5, .75, 1], outputRange: [40, -65, -90, 25, 40] }) }],
    }]} />
    <AmbientSurfaceTexture renderingEnabled={renderingEnabled} isDarkTheme={dark} onPowerState={onPowerState} style={[StyleSheet.absoluteFill, { opacity: dark ? .025 : .15 }]} />
  </View>;
}
