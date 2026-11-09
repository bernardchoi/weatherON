import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, View } from "../localization/react-native";
import contract from "../../assets/characters/heat-fan-contract.json";
import { homeCharacterAssets } from "../characterAssets";

/** Reconstructed underlay stays fixed. Registered arm/fan and fan-front layers share one animation; head occludes shoulder. */
export function HomeMascotFanRig({ size, moving }: { size: number; moving: boolean }) {
  const angle = useRef(new Animated.Value(0)).current;
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    angle.stopAnimation(); angle.setValue(0);
    if (!moving || failed) return;
    const step = (toValue: number, duration: number) => Animated.timing(angle, {
      toValue, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false,
    });
    // Two gentle 1.5s cycles, return to neutral, then a quiet four-second pause.
    const animation = Animated.loop(Animated.sequence([
      step(5, 375), step(-5, 750), step(5, 750), step(-5, 750), step(0, 375), step(0, 4000),
    ]));
    animation.start();
    return () => { animation.stop(); angle.stopAnimation(); };
  }, [angle, moving, failed]);
  const frame = { width: size, height: size };
  // One interpolation object and pivot for both layers prevents relative drift.
  const movingStyle = { transformOrigin: [contract.rotationOrigin[0] * size / 1024, contract.rotationOrigin[1] * size / 1024, 0] as [number, number, number],
    transform: [{ rotate: angle.interpolate({ inputRange: [-5, 5], outputRange: moving ? ["-5deg", "5deg"] : ["0deg", "0deg"] }) }] };
  if (failed) return <Image testID="home-mascot-fan-fallback" source={homeCharacterAssets.heat} resizeMode="contain" style={frame} />;
  return <View testID="home-mascot-fan-rig" style={frame}>
    <Image testID="home-mascot-fan-body" source={require("../../assets/characters/heat-fan-underlay.png")}
      onError={() => setFailed(true)} fadeDuration={0} resizeMode="contain" accessibilityIgnoresInvertColors style={[StyleSheet.absoluteFill, frame]} />
    <Animated.Image testID="home-mascot-fan-part" source={require("../../assets/characters/heat-fan-sprite.png")}
      onError={() => setFailed(true)} fadeDuration={0} resizeMode="contain" accessibilityIgnoresInvertColors
      style={[StyleSheet.absoluteFill, frame, movingStyle]} />
    <Image testID="home-mascot-fan-head" source={require("../../assets/characters/heat-head-front.png")}
      onError={() => setFailed(true)} fadeDuration={0} resizeMode="contain" accessibilityIgnoresInvertColors style={[StyleSheet.absoluteFill, frame]} />
    <Animated.Image testID="home-mascot-fan-front" source={require("../../assets/characters/heat-fan-front.png")}
      onError={() => setFailed(true)} fadeDuration={0} resizeMode="contain" accessibilityIgnoresInvertColors
      style={[StyleSheet.absoluteFill, frame, movingStyle]} />
  </View>;
}
