import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { useAppTheme } from "../theme/AppThemeContext";

type AnimatedBrandMarkProps = {
  size: number;
};

export function AnimatedBrandMark({ size }: AnimatedBrandMarkProps) {
  const theme = useAppTheme();
  const cloudProgress = useRef(new Animated.Value(0)).current;
  const toggleProgress = useRef(new Animated.Value(0)).current;
  const reducedMotion = theme.reducedTransparency;
  const unit = size / 100;

  useEffect(() => {
    cloudProgress.stopAnimation();
    toggleProgress.stopAnimation();
    if (reducedMotion) {
      cloudProgress.setValue(0);
      toggleProgress.setValue(1);
      return;
    }

    cloudProgress.setValue(0);
    toggleProgress.setValue(0);
    const cloudAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cloudProgress, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(cloudProgress, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const toggleAnimation = Animated.sequence([
      Animated.delay(180),
      Animated.timing(toggleProgress, {
        toValue: 1,
        duration: 760,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    cloudAnimation.start();
    toggleAnimation.start();
    return () => {
      cloudAnimation.stop();
      toggleAnimation.stop();
    };
  }, [cloudProgress, reducedMotion, toggleProgress]);

  const cloudTranslateX = cloudProgress.interpolate({ inputRange: [0, 1], outputRange: [-2 * unit, 3 * unit] });
  const cloudTranslateY = cloudProgress.interpolate({ inputRange: [0, 1], outputRange: [1 * unit, -1 * unit] });
  const sunTranslateX = toggleProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 34 * unit] });
  const rayOpacity = toggleProgress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 0.35, 1] });

  return (
    <View
      accessibilityElementsHidden
      style={[
        styles.mark,
        { width: size, height: size },
      ]}
    >
      <View style={[styles.artboard, { width: size, height: size, borderRadius: size * 0.22 }]}>
        <Animated.View style={[styles.cloud, { left: 12 * unit, top: 10 * unit, transform: [{ translateX: cloudTranslateX }, { translateY: cloudTranslateY }] }]}>
          <View style={[styles.cloudBase, { width: 38 * unit, height: 15 * unit, borderRadius: 8 * unit, top: 13 * unit }]} />
          <View style={[styles.cloudPuff, { width: 20 * unit, height: 20 * unit, borderRadius: 10 * unit, left: 5 * unit, top: 4 * unit }]} />
          <View style={[styles.cloudPuff, { width: 25 * unit, height: 25 * unit, borderRadius: 13 * unit, left: 16 * unit, top: 0 }]} />
        </Animated.View>
        <View style={[styles.toggleTrack, { left: 10 * unit, top: 46 * unit, width: 80 * unit, height: 32 * unit, borderRadius: 16 * unit }]}>
          <View style={[styles.toggleOffMark, { width: 3 * unit, height: 14 * unit, borderRadius: 2 * unit, left: 14 * unit }]} />
          <Animated.View style={[styles.sunRays, { opacity: rayOpacity, left: 49 * unit, top: 1 * unit, width: 28 * unit, height: 28 * unit }]}>
            <View style={[styles.ray, styles.rayTop, { width: 3 * unit, height: 8 * unit, borderRadius: 2 * unit }]} />
            <View style={[styles.ray, styles.rayLeft, { width: 8 * unit, height: 3 * unit, borderRadius: 2 * unit }]} />
            <View style={[styles.ray, styles.rayRight, { width: 8 * unit, height: 3 * unit, borderRadius: 2 * unit }]} />
          </Animated.View>
          <Animated.View style={[styles.sun, { width: 28 * unit, height: 28 * unit, borderRadius: 14 * unit, left: 11 * unit, transform: [{ translateX: sunTranslateX }] }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignItems: "center",
    justifyContent: "center",
  },
  artboard: {
    backgroundColor: "#10284B",
    overflow: "hidden",
  },
  cloud: {
    position: "absolute",
    width: 42,
    height: 28,
  },
  cloudBase: {
    position: "absolute",
    backgroundColor: "#F5F7FC",
  },
  cloudPuff: {
    position: "absolute",
    backgroundColor: "#F5F7FC",
  },
  toggleTrack: {
    position: "absolute",
    backgroundColor: "#FFF7EA",
  },
  toggleOffMark: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "#10284B",
  },
  sun: {
    position: "absolute",
    top: 2,
    backgroundColor: "#F7A51B",
  },
  sunRays: {
    position: "absolute",
  },
  ray: {
    position: "absolute",
    backgroundColor: "#F7A51B",
  },
  rayTop: {
    left: "50%",
    marginLeft: -1.5,
    top: -9,
  },
  rayLeft: {
    left: -9,
    top: 3,
    transform: [{ rotate: "-48deg" }],
  },
  rayRight: {
    right: -9,
    top: 3,
    transform: [{ rotate: "48deg" }],
  },
});
