import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FeedbackPressable } from "./FeedbackPressable";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

type StatusPillProps = {
  label: string;
  tone?: "clear" | "gold" | "sky" | "warm";
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function StatusPill({ label, tone = "clear", onPress, accessibilityLabel }: StatusPillProps) {
  const theme = useAppTheme();
  const color = getToneColor(theme, tone);
  const content = (
    <View style={[styles.pill, { borderColor: `${color}55`, backgroundColor: theme.cardMuted }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <FeedbackPressable
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="button"
        onPress={onPress}
        style={styles.pressable}
      >
        {content}
      </FeedbackPressable>
    );
  }

  return content;
}

function getToneColor(theme: AppTheme, tone: NonNullable<StatusPillProps["tone"]>) {
  if (tone === "gold") return theme.gold;
  if (tone === "sky") return theme.skyLite;
  if (tone === "warm") return theme.warm;
  return theme.clear;
}

const styles = StyleSheet.create({
  pressable: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
  },
  pill: {
    minHeight: 32,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: "900",
  },
});
