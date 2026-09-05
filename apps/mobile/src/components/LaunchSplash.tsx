import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { brandAssets } from "../assets";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useAppTheme } from "../theme/AppThemeContext";
import { AnimatedBrandMark } from "./AnimatedBrandMark";

export function LaunchSplash({ started, onReady, onFinish }: {
  started: boolean;
  onReady: () => void;
  onFinish: () => void;
}) {
  const theme = useAppTheme();
  const reduceMotion = useReducedMotion();
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [laidOut, setLaidOut] = React.useState(false);
  const [iconReady, setIconReady] = React.useState(false);

  useEffect(() => {
    if (laidOut && iconReady) onReady();
  }, [laidOut, iconReady, onReady]);

  useEffect(() => {
    if (!started || reduceMotion === null) return;
    if (reduceMotion || theme.reducedTransparency) { onFinish(); return; }
    const animation = Animated.sequence([
      Animated.delay(100),
      Animated.timing(nameOpacity, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.delay(360),
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]);
    animation.start(({ finished }) => { if (finished) onFinish(); });
    return () => animation.stop();
  }, [started, reduceMotion, theme.reducedTransparency, nameOpacity, opacity, onFinish]);

  return (
    <Animated.View onLayout={() => setLaidOut(true)} accessibilityLabel="WeatherON 시작 중" accessibilityRole="text" style={[styles.root, { backgroundColor: theme.background, opacity }]}>
      <AnimatedBrandMark size={108} animate={started} onLoadEnd={() => setIconReady(true)} />
      <View style={styles.name}>
        <Animated.Image source={theme.name === "light" ? brandAssets.wordmarkLight : brandAssets.wordmarkDark} resizeMode="contain" style={[styles.wordmark, { opacity: nameOpacity }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center", zIndex: 100 },
  name: { position: "absolute", top: "50%", marginTop: 76, alignItems: "center" },
  wordmark: { width: 180, height: 44 },
});
