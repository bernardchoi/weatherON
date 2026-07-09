import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { brandAssets } from "../assets";
import { StatusPill } from "./StatusPill";
import { useAppTheme } from "../theme/AppThemeContext";
import { spacing } from "../theme/tokens";

// 탭바는 스크롤 영역과 겹치지 않는 별도 레이아웃(플렉스 형제)이라 탭바를 가릴 걱정 없이
// 스크롤 끝의 시각적 여유만 담당하면 된다. 176은 다른 화면의 padding 값을 그대로 복사해 온
// 값으로, 실제로는 탭바와 스크롤 콘텐츠 사이에 필요 이상의 빈 스크롤 구간을 만들었다.
const navClearancePadding = 24;

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
