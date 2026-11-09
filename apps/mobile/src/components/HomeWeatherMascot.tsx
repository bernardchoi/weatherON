import React, { useEffect, useRef, useState } from "react";
import { Animated, AppState, Easing, StyleSheet, View } from "../localization/react-native";
import { HomeMascotFanRig } from "./HomeMascotFanRig";
import { HomeMascotRainRig } from "./HomeMascotRainRig";
import { scheduleMascotBlink, type MascotEyeFrame } from "../utils/mascotBlink";
import { homeCharacterAssets } from "../characterAssets";
import { canAnimateHomeMascot, homeMascotMotion, type HomeMascotState } from "../utils/homeMascotState";

type Props = {
  state: HomeMascotState;
  size: number;
  active: boolean;
  visible: boolean;
  reducedMotion: boolean | null;
  lowPowerMode: boolean;
  scrolling?: boolean;
  wind?: number;
  accentColor?: string;
};
/** Decorative only. The adjacent weather icon and text remain authoritative. */
export function HomeWeatherMascot({ state, size, wind = 0, accentColor = "#4B9EAD", ...policy }: Props) {
  const phase = useRef(new Animated.Value(0)).current;
  const [appActive, setAppActive] = useState(AppState.currentState === "active");
  const [eyeFrame, setEyeFrame] = useState<MascotEyeFrame>("open");
  const moving = canAnimateHomeMascot({ ...policy, appActive });
  useEffect(() => {
    setEyeFrame("open");
    if (!moving || state.asset !== "base" || state.weather === "neutral") return;
    return scheduleMascotBlink(setEyeFrame);
  }, [moving, state.asset, state.weather]);
  const { duration, lift, tilt } = homeMascotMotion(state);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", value => setAppActive(value === "active"));
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    phase.stopAnimation();
    phase.setValue(0);
    if (!moving || (lift === 0 && tilt === 0)) return;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(phase, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(phase, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    animation.start();
    return () => { animation.stop(); phase.stopAnimation(); };
  }, [phase, moving, duration, lift, tilt, state.asset]);
  return <View testID="home-weather-mascot" pointerEvents="none" accessible={false}
    accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={{ width: size, height: size, flexShrink: 0 }}>
    {wind > 0 ? <Animated.View testID="home-mascot-wind" style={{ position: "absolute", left: size * .04, top: size * .35,
      opacity: Math.min(0.5, wind * 0.5), transform: [{ translateX: phase.interpolate({ inputRange: [0, 1], outputRange: [0, moving ? 2 : 0] }) }] }}>
      {[0.18, 0.23, 0.14].map((width, index) => <View key={index} style={{ width: size * width, height: size * .06,
        marginBottom: 2, borderTopWidth: 1, borderRightWidth: 1, borderTopRightRadius: 8, borderBottomRightRadius: 8, borderColor: accentColor }} />)}
    </Animated.View> : null}
    {state.asset === "rain" ? <HomeMascotRainRig size={size} phase={phase} moving={moving} /> : state.asset === "heat" ? <HomeMascotFanRig size={size} moving={moving} /> :
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [
        { translateY: phase.interpolate({ inputRange: [0, 1], outputRange: [0, moving ? -lift : 0] }) },
        { rotate: phase.interpolate({ inputRange: [0, 1], outputRange: moving ? [`${-tilt / 2}deg`, `${tilt / 2}deg`] : ["0deg", "0deg"] }) },
      ] }]}>
        <Animated.Image source={homeCharacterAssets[state.asset]} resizeMode="contain" accessibilityIgnoresInvertColors fadeDuration={0}
          style={[StyleSheet.absoluteFill, { width: size, height: size }]} />
        {moving && state.asset === "base" && eyeFrame !== "open" ? <Animated.Image testID="home-mascot-eye-part"
          source={eyeFrame === "half" ? require("../../assets/characters/eye-half-overlay.png") : require("../../assets/characters/eye-closed-overlay.png")}
          resizeMode="contain" accessibilityIgnoresInvertColors fadeDuration={0} style={[StyleSheet.absoluteFill, { width: size, height: size }]} /> : null}
      </Animated.View>}
  </View>;
}
