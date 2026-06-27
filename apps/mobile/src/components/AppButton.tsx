import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { appColors, radius, spacing } from "../theme/tokens";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  tone?: "primary" | "secondary" | "warning";
};

export function AppButton({ label, onPress, tone = "primary" }: AppButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.button, styles[tone]]}>
      <Text style={[styles.label, tone === "primary" ? styles.primaryLabel : styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
  },
  primary: {
    backgroundColor: appColors.clear,
  },
  secondary: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: appColors.border,
  },
  warning: {
    backgroundColor: appColors.gold,
  },
  label: {
    fontSize: 14,
    fontWeight: "900",
  },
  primaryLabel: {
    color: appColors.navy,
  },
  secondaryLabel: {
    color: appColors.text,
  },
});
