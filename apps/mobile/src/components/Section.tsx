import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

type SectionProps = {
  title: string;
  caption?: string;
  accent?: "clear" | "gold" | "sky" | "warm";
  children: React.ReactNode;
};

export function Section({ title, caption, accent, children }: SectionProps) {
  const theme = useAppTheme();
  const accentColor = accent ? getAccentColor(theme, accent) : undefined;
  return (
    <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
      {accentColor ? <View style={[styles.accent, { backgroundColor: accentColor }]} /> : null}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {caption ? <Text style={[styles.caption, { color: theme.muted }]}>{caption}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function getAccentColor(theme: ReturnType<typeof useAppTheme>, accent: NonNullable<SectionProps["accent"]>) {
  if (accent === "gold") return theme.gold;
  if (accent === "sky") return theme.skyLite;
  if (accent === "warm") return theme.warm;
  return theme.clear;
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  accent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  header: {
    gap: 5,
  },
  title: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900",
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
});
