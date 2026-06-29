import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

type StatusPillProps = {
  label: string;
  tone?: "clear" | "gold" | "sky" | "warm";
};

export function StatusPill({ label, tone = "clear" }: StatusPillProps) {
  const theme = useAppTheme();
  const color = getToneColor(theme, tone);
  return (
    <View style={[styles.pill, { borderColor: `${color}55`, backgroundColor: theme.cardMuted }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

function getToneColor(theme: AppTheme, tone: NonNullable<StatusPillProps["tone"]>) {
  if (tone === "gold") return theme.gold;
  if (tone === "sky") return theme.sky;
  if (tone === "warm") return theme.warm;
  return theme.clear;
}

const styles = StyleSheet.create({
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
