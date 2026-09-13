import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { triggerImportantActionHaptic } from "../utils/interactionFeedback";

type FeedbackPressableProps = PressableProps & {
  feedbackColor?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function resolveFeedbackPressableStyle(
  style: PressableProps["style"],
  state: PressableStateCallbackType,
  scale: Animated.Value,
) {
  const resolvedStyle = typeof style === "function" ? style(state) : style;
  const transform = StyleSheet.flatten(resolvedStyle as StyleProp<ViewStyle>)?.transform ?? [];
  return [resolvedStyle, { transform: [...transform, { scale }] }];
}

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
  const [pressed, setPressed] = useState(false);
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
    setPressed(true);
    animateTo(0.985, 80);
    onPressIn?.(event);
  };
  const handlePressOut = (event: GestureResponderEvent) => {
    setPressed(false);
    animateTo(1, 140);
    onPressOut?.(event);
  };
  const handlePress = (event: GestureResponderEvent) => {
    triggerImportantActionHaptic(accessibilityLabel);
    onPress?.(event);
  };
  const resolvedStyle = resolveFeedbackPressableStyle(style, { pressed }, scale);

  return (
    <AnimatedPressable
      {...props}
      accessibilityLabel={accessibilityLabel}
      android_ripple={undefined}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={resolvedStyle as Animated.AnimatedProps<PressableProps>["style"]}
    />
  );
}
