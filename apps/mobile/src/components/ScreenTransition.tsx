import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";

// 라우트가 바뀔 때마다 부모가 key={route}로 이 컴포넌트를 리마운트한다.
// 리마운트 = 새 인스턴스이므로 매 전환마다 0에서 시작해 페이드/슬라이드 인 애니메이션이 자연스럽게 재생된다.
export function ScreenTransition({ children }: { children: React.ReactNode }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });

  return (
    <Animated.View style={[styles.fill, { opacity: progress, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
