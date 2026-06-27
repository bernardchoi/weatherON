import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { appColors, radius, spacing } from "../theme/tokens";

type StatusPillProps = {
  label: string;
  tone?: "clear" | "gold" | "sky" | "warm";
};

export function StatusPill({ label, tone = "clear" }: StatusPillProps) {
  return (
    <View style={[styles.pill, { borderColor: toneColor[tone] }]}>
      <Text style={[styles.label, { color: toneColor[tone] }]}>{label}</Text>
    </View>
  );
}

const toneColor = {
  clear: appColors.clear,
  gold: appColors.gold,
  sky: appColors.sky,
  warm: appColors.warm,
};

const styles = StyleSheet.create({
  pill: {
    minHeight: 30,
    alignSelf: "flex-start",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
  },
});
