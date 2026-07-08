import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  tone?: "primary" | "secondary" | "warning";
  accessibilityLabel?: string;
  disabled?: boolean;
};

export function AppButton({ label, onPress, tone = "primary", accessibilityLabel, disabled = false }: AppButtonProps) {
  const theme = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const backgroundColor = tone === "primary" ? theme.clear : tone === "warning" ? theme.gold : theme.cardMuted;
  const borderColor = tone === "primary" ? theme.clear : theme.border;
  const color = tone === "primary" || tone === "warning" ? theme.onAccent : theme.text;

  const animateTo = (toValue: number) => {
    Animated.timing(scale, { toValue, duration: 110, useNativeDriver: true }).start();
  };
  const pressOpacity = scale.interpolate({ inputRange: [0.97, 1], outputRange: [0.88, 1] });

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => animateTo(0.97)}
      onPressOut={() => animateTo(1)}
    >
      <Animated.View
        style={[
          styles.button,
          { backgroundColor, borderColor, opacity: disabled ? 0.48 : pressOpacity, transform: [{ scale }] },
        ]}
      >
        <Text style={[styles.label, { color }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "900",
  },
});
