import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusPill } from "./StatusPill";
import { appColors, spacing } from "../theme/tokens";

type AppScreenProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
};

export function AppScreen({ title, subtitle, badge, children }: AppScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.logo}>WeatherON</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {badge ? <StatusPill label={badge} tone="gold" /> : null}
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: 112,
    backgroundColor: appColors.navy,
  },
  hero: {
    minHeight: 124,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.lg,
    paddingTop: spacing.xl,
  },
  heroText: {
    flex: 1,
  },
  logo: {
    color: appColors.gold,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: spacing.sm,
  },
  title: {
    color: appColors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
  },
  subtitle: {
    color: appColors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
});
