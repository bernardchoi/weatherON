import React, { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, PanResponder, Platform, StyleSheet, useWindowDimensions } from "react-native";

const EDGE_ACTIVATION_WIDTH = 28;
const SWIPE_COMPLETE_DISTANCE_RATIO = 0.3;
const SWIPE_COMPLETE_VELOCITY = 0.5;

// 라우트가 바뀔 때마다 부모가 key={route}로 이 컴포넌트를 리마운트한다.
// 리마운트 = 새 인스턴스이므로 매 전환마다 0에서 시작해 페이드/슬라이드 인 애니메이션이 자연스럽게 재생된다.
export function ScreenTransition({
  children,
  canGoBack = false,
  onGoBack,
  variant = "detail",
}: {
  children: React.ReactNode;
  canGoBack?: boolean;
  onGoBack?: () => void;
  variant?: "tab" | "detail";
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const swipeX = useRef(new Animated.Value(0)).current;
  const edgeSwipeActiveRef = useRef(false);
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
      duration: reduceMotionEnabled ? 0 : variant === "tab" ? 140 : 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, reduceMotionEnabled, variant]);

  // iOS 표준 동작인 좌측 가장자리 스와이프로 뒤로가기를 재현한다.
  // release 시점에도 시작 지점을 확인해 중앙 스와이프 오작동을 막는다.
  const panResponder = useMemo(
    () => PanResponder.create({
      // ScrollView보다 먼저 시작 지점을 소유해야 iOS 실제 기기에서 가장자리 스와이프가
      // 하위 스크롤에 빼앗기지 않는다. 중앙 영역은 절대 responder를 갖지 않는다.
      // onStart 시점의 gesture.x0은 iOS에서 아직 0으로 초기화된 상태일 수 있다.
      // 실제 터치 좌표를 사용하지 않으면 화면 전체 탭을 좌측 가장자리 제스처로 오인해
      // 하위 Pressable의 onPress를 가로채게 된다.
      onStartShouldSetPanResponderCapture: (event) =>
        canGoBack && Platform.OS === "ios" && isEdgeSwipeStart(event.nativeEvent.pageX),
      onMoveShouldSetPanResponder: (_, gesture) => shouldActivateEdgeBackSwipe(canGoBack, gesture),
      onMoveShouldSetPanResponderCapture: (_, gesture) => shouldActivateEdgeBackSwipe(canGoBack, gesture),
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => {
        edgeSwipeActiveRef.current = isEdgeSwipeStart(event.nativeEvent.pageX);
      },
      onPanResponderMove: (_, gesture) => {
        if (edgeSwipeActiveRef.current && gesture.dx > 0) swipeX.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        if (!edgeSwipeActiveRef.current) {
          edgeSwipeActiveRef.current = false;
          swipeX.setValue(0);
          return;
        }
        edgeSwipeActiveRef.current = false;
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
        edgeSwipeActiveRef.current = false;
        if (reduceMotionEnabled) swipeX.setValue(0);
        else Animated.spring(swipeX, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
      },
    }),
    [canGoBack, onGoBack, reduceMotionEnabled, swipeX, width],
  );

  const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [reduceMotionEnabled ? 1 : variant === "tab" ? 0.985 : 0.96, 1] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [reduceMotionEnabled || variant === "tab" ? 0 : 10, 0] });

  return (
    <Animated.View
      style={[styles.fill, { opacity, transform: [{ translateY }, { translateX: swipeX }] }]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
}

function shouldActivateEdgeBackSwipe(canGoBack: boolean, gesture: { x0: number; dx: number; dy: number }) {
  return (
    Platform.OS === "ios" &&
    canGoBack &&
    isEdgeSwipeStart(gesture.x0) &&
    gesture.dx > 8 &&
    Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5
  );
}

function isEdgeSwipeStart(x: number) {
  return x >= 0 && x <= EDGE_ACTIVATION_WIDTH;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
