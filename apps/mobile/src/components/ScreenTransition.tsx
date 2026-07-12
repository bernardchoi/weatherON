import React, { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, PanResponder, Platform, StyleSheet, useWindowDimensions } from "react-native";

const EDGE_ACTIVATION_WIDTH = 24;
const SWIPE_COMPLETE_DISTANCE_RATIO = 0.3;
const SWIPE_COMPLETE_VELOCITY = 0.5;

// 라우트가 바뀔 때마다 부모가 key={route}로 이 컴포넌트를 리마운트한다.
// 리마운트 = 새 인스턴스이므로 매 전환마다 0에서 시작해 페이드/슬라이드 인 애니메이션이 자연스럽게 재생된다.
export function ScreenTransition({
  children,
  canGoBack = false,
  onGoBack,
}: {
  children: React.ReactNode;
  canGoBack?: boolean;
  onGoBack?: () => void;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const swipeX = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduceMotionEnabled(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotionEnabled);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: reduceMotionEnabled ? 0 : 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, reduceMotionEnabled]);

  // iOS 표준 동작인 좌측 가장자리 스와이프로 뒤로가기를 재현한다.
  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gesture) =>
        Platform.OS === "ios" &&
        canGoBack &&
        gesture.x0 <= EDGE_ACTIVATION_WIDTH &&
        gesture.dx > 8 &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx > 0) swipeX.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        const shouldComplete =
          gesture.dx > width * SWIPE_COMPLETE_DISTANCE_RATIO || gesture.vx > SWIPE_COMPLETE_VELOCITY;
        if (shouldComplete) {
          Animated.timing(swipeX, {
            toValue: width,
            duration: reduceMotionEnabled ? 0 : 220,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start(() => onGoBack?.());
        } else if (reduceMotionEnabled) {
          swipeX.setValue(0);
        } else {
          Animated.spring(swipeX, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
        }
      },
      onPanResponderTerminate: () => {
        if (reduceMotionEnabled) swipeX.setValue(0);
        else Animated.spring(swipeX, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
      },
    }),
    [canGoBack, onGoBack, reduceMotionEnabled, swipeX, width],
  );

  const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [reduceMotionEnabled ? 1 : 0.96, 1] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [reduceMotionEnabled ? 0 : 10, 0] });

  return (
    <Animated.View
      style={[styles.fill, { opacity, transform: [{ translateY }, { translateX: swipeX }] }]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
