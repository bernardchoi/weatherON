import { Animated } from "../localization/react-native";

export type AmbientSurfaceContact = {
  point: Animated.ValueXY;
  strength: Animated.Value;
  origin: { x: number; y: number };
  viewport: { width: number; height: number };
};

// Contact deforms the existing broad atmosphere planes. It creates no View,
// local gradient, circular rim, mask, or rectangular compositing boundary.
export function ambientSurfaceDeformation(contact: AmbientSurfaceContact | undefined, plane: "light" | "depth") {
  if (!contact) return [];
  const { point, strength, origin, viewport } = contact;
  const width = Math.max(1, viewport.width), height = Math.max(1, viewport.height);
  const x = Animated.add(point.x, origin.x);
  const y = Animated.add(point.y, origin.y);
  const proximity = y.interpolate({
    inputRange: [0, height * .3, height * .7, height],
    outputRange: plane === "light" ? [1, 1, .45, .18] : [.18, .45, 1, 1],
    extrapolate: "clamp",
  });
  const response = plane === "light" ? strength : strength.interpolate({ inputRange: [0, .35, 1], outputRange: [0, .12, 1] });
  const weight = Animated.multiply(response, proximity);
  const across = x.interpolate({ inputRange: [0, width], outputRange: [-1, 1], extrapolate: "clamp" });
  const along = y.interpolate({ inputRange: [0, height], outputRange: [-1, 1], extrapolate: "clamp" });
  const bend = Animated.multiply(weight, across);
  return [
    { translateX: Animated.multiply(bend, plane === "light" ? 58 : -38) },
    { translateY: Animated.multiply(weight, Animated.add(Animated.multiply(along, 48), plane === "light" ? -22 : 24)) },
    { rotate: bend.interpolate({ inputRange: [-1, 1], outputRange: plane === "light" ? ["-4deg", "4deg"] : ["2.5deg", "-2.5deg"] }) },
    { scaleX: Animated.add(1, Animated.multiply(weight, plane === "light" ? .075 : -.035)) },
    { scaleY: Animated.add(1, Animated.multiply(weight, plane === "light" ? -.025 : .055)) },
  ];
}
