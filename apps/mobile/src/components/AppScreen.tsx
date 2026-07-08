import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { brandAssets } from "../assets";
import { StatusPill } from "./StatusPill";
import { useAppTheme } from "../theme/AppThemeContext";
import { spacing } from "../theme/tokens";

// 2026-07-08 실기기 QA: 코디 탭 첫 진입 시 "오늘의 판단" 카드가 하단 탭바에 일부 가려짐 확인.
// 이전 140 → 176으로 확대해 탭바(64 + margin 24) 대비 여유를 넓힘.
const navClearancePadding = 176;

type AppScreenProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  heroAction?: React.ReactNode;
  children: React.ReactNode;
};

export function AppScreen({ title, subtitle, badge, heroAction, children }: AppScreenProps) {
  const theme = useAppTheme();
  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Image
            source={theme.name === "light" ? brandAssets.wordmarkLight : brandAssets.wordmarkDark}
            style={styles.wordmark}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text> : null}
        </View>
        {badge || heroAction ? (
          <View style={styles.heroMeta}>
            {badge ? <StatusPill label={badge} tone="gold" /> : null}
            {heroAction}
          </View>
        ) : null}
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: 20,
    paddingTop: spacing.sm,
    paddingBottom: navClearancePadding,
    minHeight: "100%",
  },
  atmosphere: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 420,
    opacity: 0.42,
  },
  hero: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  heroText: {
    flex: 1,
  },
  heroMeta: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  wordmark: {
    width: 118,
    height: 24,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 23,
    lineHeight: 28,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
});
