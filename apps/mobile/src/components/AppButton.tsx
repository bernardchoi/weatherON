import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
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
  const backgroundColor = tone === "primary" ? theme.clear : tone === "warning" ? theme.gold : theme.cardMuted;
  const borderColor = tone === "primary" ? theme.clear : theme.border;
  const color = tone === "primary" || tone === "warning" ? theme.onAccent : theme.text;
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor, borderColor, opacity: disabled ? 0.48 : pressed ? 0.86 : 1 }]}
    >
      <Text style={[styles.label, { color }]}>{label}</Text>
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
