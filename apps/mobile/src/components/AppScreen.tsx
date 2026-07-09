import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { brandAssets } from "../assets";
import { BackButton } from "./BackButton";
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
  // 스크롤 밖에 고정하는 하단 영역. 저장/취소처럼 화면 어디서든 바로 눌러야 하는 주요 액션을 담는다 —
  // children으로 넣으면 콘텐츠가 많은 화면에서 스크롤 맨 끝까지 가야만 보이는 문제가 생긴다.
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export function AppScreen({ title, subtitle, badge, heroAction, onBack, footer, children }: AppScreenProps) {
  const theme = useAppTheme();
  return (
    <View style={styles.shell}>
      <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />
        <View style={styles.hero}>
          {onBack ? (
            <View style={styles.backButtonSlot}>
              <BackButton onPress={onBack} />
            </View>
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
      {footer ? <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
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
  backButtonSlot: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
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
