import React from "react";
import { Animated } from "../localization/react-native";
import type { AmbientReadRegion } from "../utils/ambientSky";

export function AmbientTouchLayer({ point, strength, phase, dark, night, readingAreas, scrollOffset }: {
  point: Animated.ValueXY; strength: Animated.Value; phase: Animated.Value;
  dark: boolean; night: boolean; readingAreas: AmbientReadRegion[]; scrollOffset?: Animated.Value;
}) {
  let readingWeight: Animated.Value | Animated.AnimatedMultiplication<number> = strength;
  for (const area of readingAreas) {
    const x = point.x.interpolate({ inputRange: [area.x - 12, area.x, area.x + area.width, area.x + area.width + 12], outputRange: [0, 1, 1, 0], extrapolate: "clamp" });
    const y = (scrollOffset ? Animated.add(point.y, scrollOffset) : point.y).interpolate({ inputRange: [area.y - 12, area.y, area.y + area.height, area.y + area.height + 12], outputRange: [0, 1, 1, 0], extrapolate: "clamp" });
    readingWeight = Animated.multiply(readingWeight, Animated.subtract(1, Animated.multiply(.9, Animated.multiply(x, y))));
  }
  return <Animated.View testID="ambient-touch-layer" style={{ position: "absolute", left: -74, top: -74, width: 148, height: 148, opacity: readingWeight, transform: point.getTranslateTransform() }}>
    <Animated.View style={{ position: "absolute", inset: 0,
      experimental_backgroundImage: dark
        ? "radial-gradient(ellipse 58% 46% at center, #8CABCA 0%, #8CABCA66 34%, #8CABCA00 70%)"
        : "radial-gradient(ellipse 58% 46% at center, #FFFFFF 0%, #FFFFFF66 34%, #FFFFFF00 70%)",
      opacity: dark ? .10 : .28,
      transform: [{ translateX: phase.interpolate({ inputRange: [0, .5, 1], outputRange: [-5, 6, -5] }) }],
    }} />
    {night ? Array.from({ length: 7 }, (_, i) => <Animated.View key={i} style={{ position: "absolute", left: 35 + (i * 23) % 78, top: 31 + (i * 37) % 84, width: i % 3 === 0 ? 2.5 : 1.5, height: i % 3 === 0 ? 2.5 : 1.5, borderRadius: 2, backgroundColor: dark ? "#E4F2FF" : "#274A70", opacity: dark ? .65 : .72, transform: [{ translateX: phase.interpolate({ inputRange: [0, .3, .7, 1], outputRange: [-4 + i, 7 + i, -2 + i, -4 + i] }) }, { translateY: phase.interpolate({ inputRange: [0, .5, 1], outputRange: [0, 8 - i, 0] }) }] }} />) : null}
  </Animated.View>;
}
