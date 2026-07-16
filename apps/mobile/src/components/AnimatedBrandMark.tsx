import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, View } from "react-native";
import { brandAssets } from "../assets";
import { useAppTheme } from "../theme/AppThemeContext";

type AnimatedBrandMarkProps = {
  size: number;
};

// 원본 마크를 바탕으로 구름·토글 영역만 덮어 그린다.
// 구름은 원본 PNG를 같은 좌표에서 잘라 이동하므로 원본 형태와 겹치지 않는다.
export function AnimatedBrandMark({ size }: AnimatedBrandMarkProps) {
  const theme = useAppTheme();
  const cloudProgress = useRef(new Animated.Value(0)).current;
  const toggleProgress = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const unit = size / 100;

  useEffect(() => {
    cloudProgress.stopAnimation();
    toggleProgress.stopAnimation();
    if (theme.reducedTransparency) {
      cloudProgress.setValue(0);
      toggleProgress.setValue(1);
      setIsAnimating(false);
      return;
    }

    let active = true;
    let animationFrame: number | null = null;
    setIsAnimating(true);
    cloudProgress.setValue(0);
    toggleProgress.setValue(0);
    const cloudAnimation = Animated.sequence([
      Animated.delay(520),
      Animated.timing(cloudProgress, { toValue: 1, duration: 980, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(cloudProgress, { toValue: 0, duration: 980, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]);
    const toggleAnimation = Animated.sequence([
      Animated.delay(720),
      Animated.timing(toggleProgress, { toValue: 1, duration: 980, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]);
    animationFrame = requestAnimationFrame(() => {
      cloudAnimation.start(({ finished }) => {
        if (finished && active) {
          setIsAnimating(false);
        }
      });
      toggleAnimation.start();
    });
    return () => {
      active = false;
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
      cloudAnimation.stop();
      toggleAnimation.stop();
    };
  }, [cloudProgress, theme.reducedTransparency, toggleProgress]);

  const cloudTranslateX = cloudProgress.interpolate({ inputRange: [0, 1], outputRange: [-2 * unit, 3 * unit] });
  const cloudTranslateY = cloudProgress.interpolate({ inputRange: [0, 1], outputRange: [1 * unit, -1 * unit] });
  const sunTranslateX = toggleProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 37 * unit] });
  const rayOpacity = toggleProgress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 0.35, 1] });

  return (
    <View accessibilityElementsHidden style={[styles.mark, { width: size, height: size }]}>
      <Image source={brandAssets.iconPrimary} style={styles.baseImage} resizeMode="contain" />
      {isAnimating ? (
        <>
          <View renderToHardwareTextureAndroid style={[styles.cloudMask, { left: 7 * unit, top: 4 * unit, width: 46 * unit, height: 29 * unit }]}>
            <Animated.View
              renderToHardwareTextureAndroid
              style={[
                styles.cloudSource,
                {
                  width: size,
                  height: size,
                  left: -7 * unit,
                  top: -4 * unit,
                  transform: [{ translateX: cloudTranslateX }, { translateY: cloudTranslateY }],
                },
              ]}
            >
              <Image source={brandAssets.iconPrimary} style={styles.cloudImage} resizeMode="contain" />
            </Animated.View>
          </View>
          <View style={[styles.raysMask, { left: 54 * unit, top: 23 * unit, width: 39 * unit, height: 16 * unit }]} />
          <View style={[styles.toggleTrack, { left: 10 * unit, top: 38 * unit, width: 80 * unit, height: 32 * unit, borderRadius: 16 * unit }]}>
            <View style={[styles.toggleOffMark, { width: 2 * unit, height: 13 * unit, borderRadius: 2 * unit, left: 15 * unit, top: 10 * unit }]} />
          </View>
          <Animated.View renderToHardwareTextureAndroid needsOffscreenAlphaCompositing style={[styles.sunRays, { opacity: rayOpacity }]}>
            <View style={[styles.ray, { width: 2 * unit, height: 11 * unit, borderRadius: 2 * unit, left: 73 * unit, top: 25 * unit }]} />
            <View style={[styles.ray, { width: 2 * unit, height: 11 * unit, borderRadius: 2 * unit, left: 60 * unit, top: 29 * unit, transform: [{ rotate: "-37deg" }] }]} />
            <View style={[styles.ray, { width: 2 * unit, height: 11 * unit, borderRadius: 2 * unit, left: 85 * unit, top: 29 * unit, transform: [{ rotate: "37deg" }] }]} />
          </Animated.View>
          <Animated.View renderToHardwareTextureAndroid style={[styles.sun, { width: 30 * unit, height: 30 * unit, borderRadius: 15 * unit, left: 22 * unit, top: 39 * unit, transform: [{ translateX: sunTranslateX }] }]} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    overflow: "hidden",
  },
  baseImage: {
    width: "100%",
    height: "100%",
  },
  cloudMask: {
    position: "absolute",
    overflow: "hidden",
    backgroundColor: "#0C1F3F",
  },
  cloudSource: {
    position: "absolute",
  },
  cloudImage: {
    width: "100%",
    height: "100%",
  },
  raysMask: {
    position: "absolute",
    backgroundColor: "#0C1F3F",
  },
  toggleTrack: {
    position: "absolute",
    backgroundColor: "#FDF6EB",
  },
  toggleOffMark: {
    position: "absolute",
    backgroundColor: "#0C1F3F",
  },
  sun: {
    position: "absolute",
    backgroundColor: "#F0A020",
  },
  sunRays: {
    position: "absolute",
  },
  ray: {
    position: "absolute",
    backgroundColor: "#F0A020",
  },
});
