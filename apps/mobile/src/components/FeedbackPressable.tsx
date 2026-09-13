import React, { useRef } from "react";
import { Animated, Easing, Pressable, type GestureResponderEvent, type PressableProps } from "react-native";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { triggerImportantActionHaptic } from "../utils/interactionFeedback";

type FeedbackPressableProps = PressableProps & {
  feedbackColor?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FeedbackPressable({
  feedbackColor,
  android_ripple,
  accessibilityLabel,
  onPress,
  onPressIn,
  onPressOut,
  style,
  ...props
}: FeedbackPressableProps) {
  const reducedMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  void feedbackColor;
  void android_ripple;

  const animateTo = (value: number, duration: number) => {
    scale.stopAnimation();
    if (reducedMotion !== false) return scale.setValue(1);
    Animated.timing(scale, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };
  const handlePressIn = (event: GestureResponderEvent) => {
    animateTo(0.985, 80);
    onPressIn?.(event);
  };
  const handlePressOut = (event: GestureResponderEvent) => {
    animateTo(1, 140);
    onPressOut?.(event);
  };
  const handlePress = (event: GestureResponderEvent) => {
    triggerImportantActionHaptic(accessibilityLabel);
    onPress?.(event);
  };

  return (
    <AnimatedPressable
      {...props}
      accessibilityLabel={accessibilityLabel}
      android_ripple={undefined}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={(state) => [typeof style === "function" ? style(state) : style, { transform: [{ scale }] }]}
    />
  );
}
