import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Animated, AppState, Easing, StyleSheet, View } from "../localization/react-native";
import { HomeMascotClothing } from "./HomeMascotClothing";
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
  darkMode?: boolean;
};
/** Decorative only. The adjacent weather icon and text remain authoritative. */
export function HomeWeatherMascot({ state, size, wind = 0, darkMode = false, accentColor = "#4B9EAD", ...policy }: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  const previousState = useRef(state);
  const transitionRunning = useRef(false);
  const transitionGeneration = useRef(0);
  const [outgoing, setOutgoing] = useState<HomeMascotState | null>(null);
  const phase = useRef(new Animated.Value(0)).current;
  const [appActive, setAppActive] = useState(AppState.currentState === "active");
  const [eyeFrame, setEyeFrame] = useState<MascotEyeFrame>("open");
  const moving = canAnimateHomeMascot({ ...policy, appActive });
  // Only visual asset changes dissolve. Rapid replacements settle immediately so
  // an obsolete forecast never reappears, and policy changes cancel the dissolve.
  useLayoutEffect(() => {
    const previous = previousState.current;
    previousState.current = state;
    const interrupted = transitionRunning.current;
    const generation = ++transitionGeneration.current;
    fade.stopAnimation();
    transitionRunning.current = false;
    if (!moving || (previous.asset === state.asset && previous.clothing === state.clothing) || interrupted || state.weather === "neutral") {
      fade.setValue(0);
      setOutgoing(null);
      return;
    }
    setOutgoing(previous);
    fade.setValue(1);
    transitionRunning.current = true;
    const animation = Animated.timing(fade, { toValue: 0, duration: 180,
      easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false });
    animation.start(({ finished }) => {
      if (generation !== transitionGeneration.current) return;
      transitionRunning.current = false;
      if (finished) setOutgoing(null);
    });
    return () => { ++transitionGeneration.current; animation.stop(); fade.stopAnimation(); };
  }, [state.asset, state.clothing, state.weather === "neutral", moving, fade]);
  useEffect(() => {
    setEyeFrame("open");
    if (!moving || state.asset !== "base" || state.weather === "neutral") return;
    return scheduleMascotBlink(setEyeFrame, undefined, state.daylight === "night" ? "night" : "day");
  }, [moving, state.asset, state.weather, state.daylight]);
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
    {darkMode ? <View testID="home-mascot-dark-contrast" style={{ position: "absolute", left: size * .19, top: size * .30,
      width: size * .62, height: size * .62, borderRadius: size * .31, backgroundColor: "rgba(255,245,216,0.07)" }} /> : null}
    {wind > 0 ? <Animated.View testID="home-mascot-wind" style={{ position: "absolute", left: size * .04, top: size * .35,
      opacity: Math.min(0.5, wind * 0.5), transform: [{ translateX: phase.interpolate({ inputRange: [0, 1], outputRange: [0, moving ? 2 : 0] }) }] }}>
      {(size <= 64 ? [0.23] : [0.18, 0.23, 0.14]).map((width, index) => <View key={index} style={{ width: size * width, height: size * .06,
        marginBottom: 2, borderTopWidth: 1, borderRightWidth: 1, borderTopRightRadius: 8, borderBottomRightRadius: 8, borderColor: accentColor }} />)}
    </Animated.View> : null}
    <Animated.View testID="home-mascot-current" style={[StyleSheet.absoluteFill, { opacity: outgoing && moving ? fade.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) : 1 }]}>
    {state.asset === "rain" ? <HomeMascotRainRig size={size} phase={phase} moving={moving} clothing={state.clothing} /> : state.asset === "heat" ? <HomeMascotFanRig size={size} moving={moving} clothing={state.clothing} /> :
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [
        { translateY: phase.interpolate({ inputRange: [0, 1], outputRange: [0, moving ? -lift : 0] }) },
        { rotate: phase.interpolate({ inputRange: [0, 1], outputRange: moving ? [`${-tilt / 2}deg`, `${tilt / 2}deg`] : ["0deg", "0deg"] }) },
      ] }]}>
        <Animated.Image source={homeCharacterAssets[state.asset]} resizeMode="contain" accessibilityIgnoresInvertColors fadeDuration={0}
          style={[StyleSheet.absoluteFill, { width: size, height: size }]} />
        <HomeMascotClothing size={size} clothing={state.clothing} />
        {moving && state.asset === "base" && eyeFrame !== "open" ? <Animated.Image testID="home-mascot-eye-part"
          source={eyeFrame === "half" ? require("../../assets/characters/eye-half-overlay.png") : require("../../assets/characters/eye-closed-overlay.png")}
          resizeMode="contain" accessibilityIgnoresInvertColors fadeDuration={0} style={[StyleSheet.absoluteFill, { width: size, height: size }]} /> : null}
      </Animated.View>}
    </Animated.View>
    {outgoing && moving ? <Animated.View testID="home-mascot-outgoing" style={[StyleSheet.absoluteFill, { opacity: fade }]}>
      {outgoing.asset === "rain" ? <HomeMascotRainRig size={size} phase={phase} moving={false} clothing={outgoing.clothing} />
        : outgoing.asset === "heat" ? <HomeMascotFanRig size={size} moving={false} clothing={outgoing.clothing} />
        : <><Animated.Image source={homeCharacterAssets[outgoing.asset]} resizeMode="contain" accessibilityIgnoresInvertColors fadeDuration={0}
          style={[StyleSheet.absoluteFill, { width: size, height: size }]} /><HomeMascotClothing size={size} clothing={outgoing.clothing} /></>}
    </Animated.View> : null}
  </View>;
}
