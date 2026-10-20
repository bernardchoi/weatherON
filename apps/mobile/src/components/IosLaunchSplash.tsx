import React, { useCallback, useEffect, useRef } from "react";
import { Animated, AppState, Easing, StyleSheet, View } from "../localization/react-native";
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";
import parts from "../../../../assets/splash/ios-brand-02/parts.json";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useAppTheme } from "../theme/AppThemeContext";
import { IosHomeWordmark } from "./IosHomeWordmark";
import { iosSplashTimeline as timing } from "./iosSplashTimeline";

export function IosLaunchSplash({ started, onReady, onFinish }: {
  started: boolean; onReady: () => void; onFinish: () => void;
}) {
  const theme = useAppTheme();
  const reduced = useReducedMotion();
  const [appIsActive, setAppIsActive] = React.useState(() => AppState.currentState === "active");
  const [accessibilityTimedOut, setAccessibilityTimedOut] = React.useState(false);
  const cloud = useRef(new Animated.Value(0)).current;
  const sun = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const reveal = useRef(new Animated.Value(0)).current;
  const brandOpacity = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const played = useRef(false), finished = useRef(false), ready = useRef(false);
  const mounted = useRef(true), backgrounded = useRef(false);
  const hasBeenActive = useRef(AppState.currentState === "active");
  const animation = useRef<Animated.CompositeAnimation | null>(null);
  const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbacks = useRef({ onReady, onFinish });
  callbacks.current = { onReady, onFinish };

  const signalReady = useCallback(() => {
    if (ready.current || !mounted.current) return;
    ready.current = true;
    callbacks.current.onReady();
  }, []);
  const finish = useCallback(() => {
    if (finished.current || !mounted.current) return;
    finished.current = true;
    animation.current?.stop();
    if (watchdog.current) clearTimeout(watchdog.current);
    opacity.setValue(0);
    callbacks.current.onFinish();
  }, [opacity]);

  useEffect(() => {
    mounted.current = true;
    // iOS commonly reports `inactive` while the app is still starting. Only a
    // real background transition should permanently consume this one-shot view.
    if (AppState.currentState === "background") backgrounded.current = true;
    // Strict effect remounts must not replay or strand a cancelled launch.
    if (played.current && !finished.current) finish();
    const layout = setTimeout(signalReady, timing.readyFallback);
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") {
        hasBeenActive.current = true;
        setAppIsActive(true);
        return;
      }
      setAppIsActive(false);
      if (state === "background") {
        backgrounded.current = true;
        if (played.current) finish();
      } else if (state === "inactive" && hasBeenActive.current && played.current) {
        // A later interruption is safe to dismiss, but launch-time inactive is
        // not evidence that the app was backgrounded.
        finish();
      }
    });
    return () => {
      mounted.current = false;
      clearTimeout(layout);
      if (watchdog.current) clearTimeout(watchdog.current);
      animation.current?.stop(); subscription.remove();
    };
  }, [finish, signalReady]);

  useEffect(() => {
    if (reduced !== null) return;
    // A broken native query must not hold the launch view forever. This is
    // deliberately much longer than the old 200ms shortcut and falls back to
    // the same non-geometric presentation used for confirmed Reduce Motion.
    const fallback = setTimeout(() => setAccessibilityTimedOut(true), timing.accessibilityFallback);
    return () => clearTimeout(fallback);
  }, [reduced]);

  useEffect(() => {
    // Do not make a fast accessibility guess: wait for a confirmed setting or
    // the bounded accessibility-safe fallback, then play once while active.
    const useReducedPresentation = reduced === true || (reduced === null && accessibilityTimedOut);
    if (!started || !appIsActive || played.current || (reduced === null && !accessibilityTimedOut)) return;
    played.current = true;
    if (backgrounded.current) { finish(); return; }
    const ease = Easing.out(Easing.cubic);
    const run = (value: Animated.Value, duration: number, native = true) => Animated.timing(value, {
      toValue: 1, duration, easing: ease, useNativeDriver: native, isInteraction: false,
    });
    if (useReducedPresentation) {
      // A short opacity-only substitute, not a second geometry animation.
      brandOpacity.setValue(0); cloud.setValue(1); sun.setValue(1); reveal.setValue(1);
      animation.current = Animated.sequence([
        run(brandOpacity, timing.reducedFadeIn),
        Animated.delay(timing.reducedHold),
        Animated.timing(opacity, { toValue: 0, duration: timing.reducedFadeOut, useNativeDriver: true, isInteraction: false }),
      ]);
    } else {
      animation.current = Animated.parallel([
        run(cloud, timing.cloud.duration),
        Animated.sequence([Animated.delay(timing.sun.start), run(sun, timing.sun.duration)]),
        Animated.sequence([Animated.delay(timing.glow.start), run(glow, timing.glow.duration)]),
        // Only the clipping window changes width. Inner vector geometry stays fixed.
        Animated.sequence([Animated.delay(timing.wordmark.start), run(reveal, timing.wordmark.duration, false)]),
        Animated.sequence([Animated.delay(timing.exit.start), Animated.timing(opacity, {
          toValue: 0, duration: timing.exit.duration, useNativeDriver: true, isInteraction: false,
        })]),
      ]);
    }
    watchdog.current = setTimeout(finish, timing.watchdog);
    animation.current.start(({ finished: completed }) => { if (completed) finish(); });
    // Ownership cleanup is separate: theme/callback changes never restart the scene.
  }, [started, appIsActive, reduced, accessibilityTimedOut, theme.reducedTransparency, cloud, sun, glow, reveal, opacity, brandOpacity, finish]);

  const dark = theme.name === "dark";
  const sunColor = parts.sun[theme.name];
  return <Animated.View testID="ios-brand-splash" onLayout={signalReady} accessible accessibilityLabel="WeatherON 시작 중" accessibilityRole="text"
    style={[styles.root, { backgroundColor: theme.background, opacity }]}>
    <Animated.View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.brand, { opacity: brandOpacity }]}>
      <View style={styles.scene}>
        {!theme.reducedTransparency ? <Animated.View testID="splash-sun-glow" style={[styles.layer, { opacity: Animated.multiply(glow, dark ? 0.10 : 0.16) }]}>
          <Svg width={180} height={124} viewBox={parts.viewBox}>
            <Defs><RadialGradient id="splash-sun-light"><Stop offset="0" stopColor={sunColor} stopOpacity={0.65} /><Stop offset="1" stopColor={sunColor} stopOpacity={0} /></RadialGradient></Defs>
            <Circle cx={620} cy={350} r={250} fill="url(#splash-sun-light)" />
          </Svg>
        </Animated.View> : null}
        <Animated.View testID="splash-sun" style={[styles.layer, { opacity: sun, transform: [{ translateY: sun.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>
          <Svg width={180} height={124} viewBox={parts.viewBox}><Path d={parts.sun.path} fill={sunColor} /></Svg>
        </Animated.View>
        <Animated.View testID="splash-cloud" style={[styles.layer, {
          opacity: cloud.interpolate({ inputRange: [0, 1], outputRange: [parts.initialCloudOpacity, 1] }),
          transform: [{ translateY: cloud.interpolate({ inputRange: [0, 1], outputRange: [parts.initialCloudY, 0] }) }],
        }]}><Svg width={180} height={124} viewBox={parts.viewBox}><Path d={parts.cloud.path} fill={parts.cloud[theme.name]} /></Svg></Animated.View>
      </View>
      <View style={styles.name}>
        <Animated.View testID="splash-wordmark-mask" style={[styles.mask, { width: reveal.interpolate({ inputRange: [0, 1], outputRange: [0, 180] }) }]}>
          <View style={styles.fixedWordmark}><IosHomeWordmark theme={theme} /></View>
        </Animated.View>
      </View>
    </Animated.View>
  </Animated.View>;
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", zIndex: 100 },
  brand: { width: 180, height: 182 },
  scene: { width: 180, height: 124 },
  layer: { ...StyleSheet.absoluteFill },
  name: { marginTop: 28, width: 180, height: 30 },
  mask: { height: 30, overflow: "hidden" },
  fixedWordmark: { position: "absolute", left: 0, top: 0, width: 180, height: 30 },
});
