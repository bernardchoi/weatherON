import React, { useEffect, useRef, useState } from "react";
import { Animated, AppState, Easing, Platform, StyleSheet, View, useWindowDimensions } from "../localization/react-native";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { ambientPalette } from "../theme/ambientSurface";
import { AmbientBaseFlow } from "./AmbientBaseFlow";
import { AmbientTouchLayer } from "./AmbientTouchLayer";
import type { AmbientReadRegion } from "../utils/ambientSky";
import { ambientWeatherMotion } from "../utils/ambientWeatherMotion";
import type { AmbientContact } from "../utils/ambientTouch";
import { AmbientWeatherLayer, type AmbientWeatherRegion } from "./AmbientWeatherLayer";
import type { AmbientDaylight } from "../utils/weatherDaylight";
import type { AppTheme } from "../theme/tokens";

type Props = { onScreen?: boolean; contentOrigin?: { x: number; y: number }; scrollOffset?: Animated.Value; meteorScrollY?: number; scrolling?: boolean; readingAreas?: AmbientReadRegion[]; daylight?: AmbientDaylight; weatherRegion?: AmbientWeatherRegion; theme: AppTheme; condition: string; windMs: number; precipitationMm: number; reliable: boolean; touchPulse: number; touchPosition?: { x: number; y: number }; touchContact?: AmbientContact; touchPoint?: Animated.ValueXY; lowPowerMode?: boolean; onLowPowerChange?: (enabled: boolean) => void };

// Wind changes the pace of an undirected surface breath: this provider has no wind bearing.
// Rain density comes only from current precipitation, never future probability.
export function AmbientSurfaceBackground({ onScreen = true, theme, condition, windMs, precipitationMm, reliable, touchPulse, touchPosition, touchContact, touchPoint, lowPowerMode = true, onLowPowerChange, daylight, weatherRegion, contentOrigin = { x: 0, y: 0 }, readingAreas = [], scrollOffset, meteorScrollY = 0, scrolling = false }: Props) {
  const p = ambientPalette(theme);
  const { width, height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const [baseOnly, setBaseOnly] = useState(false);
  const [surfaceSize, setSurfaceSize] = useState({ width, height });
  const [active, setActive] = useState(AppState.currentState === "active");
  const breath = useRef(new Animated.Value(0)).current;
  const touch = useRef(new Animated.Value(0)).current;
  const canceledContact = useRef<number | null>(null);
  const weather = ambientWeatherMotion(condition, reliable, windMs, precipitationMm);
  const moving = onScreen && active && (Platform.OS === "ios" || reliable) && reducedMotion === false && (Platform.OS !== "ios" || (!theme.reducedTransparency && !lowPowerMode));
  const wind = Number.isFinite(windMs) ? Math.max(0, Math.min(12, windMs)) : 0;
  const raining = condition === "rain" || condition === "storm";
  const rainCount = reliable && raining ? 8 + Math.round(Math.min(16, Math.max(0, precipitationMm || 0) * 2)) : 0;

  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => setActive(state === "active"));
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    breath.stopAnimation();
    breath.setValue(0);
    if (!moving || (Platform.OS !== "ios" && wind === 0)) return;
    const duration = Platform.OS === "ios" ? weather.duration : 14000 - wind * 650;
    const animation = Animated.loop(Platform.OS === "ios" ? Animated.timing(breath, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true, isInteraction: false }) : Animated.sequence([
      Animated.timing(breath, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(breath, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [moving, wind, weather.duration, breath]);
  useEffect(() => { canceledContact.current = null; }, [touchPoint]);
  useEffect(() => {
    touch.stopAnimation();
    if (Platform.OS === "ios") {
      if (!onScreen || !active || !touchContact || touchContact.phase === "cancel") { if (touchContact) canceledContact.current = touchContact.id; touch.setValue(0); return; }
      if (touchContact.phase === "down" && canceledContact.current === touchContact.id) { touch.setValue(0); return; }
      const target = touchContact.phase === "down" ? 1 : 0;
      if (reducedMotion !== false || theme.reducedTransparency || lowPowerMode) { touch.setValue(target); return; }
      const animation = Animated.timing(touch, { toValue: target, duration: target ? 110 : 620, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false });
      animation.start();
      return () => animation.stop();
    }
    touch.setValue(0);
    if (!active || reducedMotion !== false || theme.reducedTransparency || touchPulse === 0) return;
    const animation = Animated.sequence([
      Animated.timing(touch, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(touch, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [touchContact?.id, touchContact?.phase, touchPulse, touchPoint, onScreen, active, reducedMotion, theme.reducedTransparency, lowPowerMode, touch]);
  const fieldVisible = !theme.reducedTransparency;


  return <View onLayout={event => { const { width: w, height: h } = event.nativeEvent.layout; setSurfaceSize(old => old.width === w && old.height === h ? old : { width: w, height: h }); }} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, { overflow: "hidden", opacity: onScreen ? 1 : 0, backgroundColor: p.background }]}>
    {Platform.OS === "ios" ? <>
    <View style={[StyleSheet.absoluteFill, {
      // Keep the reading surface stable; only the faint wind field breathes.
      experimental_backgroundImage: theme.name === "dark"
        ? "radial-gradient(ellipse at 70% 44%, #153053 0%, #0F2948 44%, #0C223D 100%)"
        : "radial-gradient(ellipse at 86% 8%, #C6DDF5 0%, #CCE1F6 24%, #D8EAFB 52%, #DDEFFC 75%, #EAF6FF 100%)",
    }]} />
    <AmbientBaseFlow renderingEnabled={onScreen && active && !theme.reducedTransparency} phase={breath} dark={theme.name === "dark"} visible={fieldVisible} onPowerState={event => {
      onLowPowerChange?.(event.nativeEvent.lowPower);
      if (__DEV__) setBaseOnly(event.nativeEvent.baseOnly === true);
    }} />
    {!theme.reducedTransparency && !baseOnly ? <AmbientWeatherLayer kind={weather.kind} particles={weather.particles} phase={breath} moving={moving} daylight={daylight} region={weatherRegion} skyRegion={{ x: 0, y: 0, ...surfaceSize }} readingAreas={readingAreas.map(area => ({ ...area, x: area.x + contentOrigin.x, y: area.y + contentOrigin.y }))} scrollOffset={scrollOffset} meteorScrollY={meteorScrollY} scrolling={scrolling} dark={theme.name === "dark"} /> : null}
    </> : <>
    <Animated.View style={{ position: "absolute", width: width * 2.4, height: height * 0.65, left: -width * 0.7, top: -height * 0.21,
      borderRadius: width * 1.4, backgroundColor: theme.name === "dark" ? "#23476D" : "#D5EBFF",
      borderBottomWidth: 1, borderColor: p.border, opacity: breath.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.7] }),
      transform: [{ scale: breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] }) }] }} />
    <View style={{ position: "absolute", width: width * 2.2, height: height * 0.48, left: -width * 0.5, top: height * 0.1,
      borderRadius: width, backgroundColor: theme.name === "dark" ? "#1B3858" : "#E1F2FF", opacity: 0.34, borderBottomWidth: 1, borderColor: p.border }} />
    </>}
    {Platform.OS !== "ios" ? Array.from({ length: rainCount }, (_, i) => <Animated.View key={i} style={{ position: "absolute", right: 12 + (i * 37) % Math.max(40, width * 0.6), top: 18 + (i * 53) % Math.max(100, height * 0.5),
      width: 1, height: 12 + (i % 4) * 9, backgroundColor: p.muted, opacity: breath.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.22] }) }} />) : null}
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { left: contentOrigin.x, top: contentOrigin.y }]}>
    {Platform.OS === "ios" && theme.reducedTransparency && touchContact?.phase === "down" && touchPoint ? <Animated.View style={{ position: "absolute", top: -16, left: -16, width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: p.muted, transform: touchPoint.getTranslateTransform() }} /> : null}
    {Platform.OS === "ios" && !baseOnly && !theme.reducedTransparency && touchPoint ? <AmbientTouchLayer point={touchPoint} strength={touch} phase={breath} dark={theme.name === "dark"} night={weather.kind === "clear" && daylight?.phase === "night"} readingAreas={readingAreas} scrollOffset={scrollOffset} /> : null}
    </View>
    {Platform.OS !== "ios" && !theme.reducedTransparency ? <Animated.View style={{ position: "absolute", top: 40, right: -30, width: 240, height: 240, borderRadius: 140,
      backgroundColor: theme.name === "dark" ? "#557AA0" : "#FFFFFF",
      opacity: touch.interpolate({ inputRange: [0, 1], outputRange: [0, 0.16] }) }} /> : null}
  </View>;
}
