import React, { useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useAppTheme } from "../theme/AppThemeContext";

type FeedbackPressableProps = PressableProps & {
  feedbackColor?: string;
};

// 목업 BrandCard의 120ms state layer를 네이티브 화면 전반에서 공유한다.
// 기존 Pressable의 레이아웃·접근성 계약은 그대로 유지하고 시각 피드백만 얹는다.
export function FeedbackPressable({
  children,
  disabled,
  feedbackColor,
  android_ripple,
  onPressIn,
  onPressOut,
  style,
  ...props
}: FeedbackPressableProps) {
  const theme = useAppTheme();
  const feedback = useRef(new Animated.Value(0)).current;
  const usesNativeRipple = Platform.OS === "android" && Boolean(android_ripple);

  const animateTo = (toValue: number) => {
    feedback.stopAnimation();
    Animated.timing(feedback, {
      toValue,
      duration: 120,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = (event: GestureResponderEvent) => {
    if (!disabled && !usesNativeRipple) animateTo(0.12);
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    if (!usesNativeRipple) animateTo(0);
    onPressOut?.(event);
  };

  return (
    <Pressable
      {...props}
      android_ripple={android_ripple}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={style}
    >
      {(state) => {
        const resolvedStyle = typeof style === "function" ? style(state) : style;
        const flattenedStyle = StyleSheet.flatten(resolvedStyle as StyleProp<ViewStyle>);
        const feedbackRadius = {
          borderRadius: flattenedStyle?.borderRadius,
          borderTopLeftRadius: flattenedStyle?.borderTopLeftRadius,
          borderTopRightRadius: flattenedStyle?.borderTopRightRadius,
          borderBottomRightRadius: flattenedStyle?.borderBottomRightRadius,
          borderBottomLeftRadius: flattenedStyle?.borderBottomLeftRadius,
        };

        return (
          <>
            {typeof children === "function" ? children(state) : children}
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                styles.feedback,
                feedbackRadius,
                { backgroundColor: feedbackColor ?? theme.text, opacity: disabled || usesNativeRipple ? 0 : feedback },
              ]}
            />
          </>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  feedback: {
    zIndex: 20,
  },
});
