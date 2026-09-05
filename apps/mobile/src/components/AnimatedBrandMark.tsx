import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet } from "react-native";
import { brandAssets } from "../assets";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useAppTheme } from "../theme/AppThemeContext";

export function AnimatedBrandMark({ size, animate = true, onLoadEnd }: {
  size: number;
  animate?: boolean;
  onLoadEnd?: () => void;
}) {
  const theme = useAppTheme();
  const reduceMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    if (!animate || reduceMotion !== false || theme.reducedTransparency) return;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration: 520, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(progress, { toValue: 0, duration: 580, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.delay(400),
    ]));
    animation.start();
    return () => animation.stop();
  }, [animate, progress, reduceMotion, theme.reducedTransparency]);

  return (
    <Animated.View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{
      width: size, height: size,
      transform: [
        { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) },
        { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] }) },
      ],
    }}>
      <Image source={theme.name === "light" ? brandAssets.iconLight : brandAssets.iconDark} style={styles.image} resizeMode="contain" onLoadEnd={onLoadEnd} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({ image: { width: "100%", height: "100%" } });
