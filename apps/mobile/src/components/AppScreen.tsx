import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { brandAssets } from "../assets";
import { StatusPill } from "./StatusPill";
import { useAppTheme } from "../theme/AppThemeContext";
import { spacing } from "../theme/tokens";

// 실기기 QA 기준: 공통 AppScreen은 하단 탭바와 함께 쓰이는 화면이 많아
// 스크롤 끝 콘텐츠가 탭바 아래로 물리지 않도록 탭바 높이+마진만큼 안전 여백을 둔다.
const navClearancePadding = 112;

type AppScreenProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  heroAction?: React.ReactNode;
  onBack?: () => void;
  children: React.ReactNode;
};

export function AppScreen({ title, subtitle, badge, heroAction, onBack, children }: AppScreenProps) {
  const theme = useAppTheme();
  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />
      <View style={styles.hero}>
        {onBack ? (
          <Pressable
            accessibilityLabel="뒤로"
            accessibilityRole="button"
            onPress={onBack}
            style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <Text style={[styles.backGlyph, { color: theme.text }]}>‹</Text>
          </Pressable>
        ) : null}
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
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    borderRadius: 18,
    borderWidth: 1,
  },
  backGlyph: {
    marginTop: -2,
    fontSize: 29,
    lineHeight: 31,
    fontWeight: "800",
  },
  heroText: {
    flex: 1,
    minWidth: 0,
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
