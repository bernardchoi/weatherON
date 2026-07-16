import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { brandAssets, uiIconAssets } from "../assets";
import { AppScreen } from "../components/AppScreen";
import { OnboardingFooter } from "../components/OnboardingFooter";
import { Section } from "../components/Section";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing } from "../theme/tokens";

const featureCards = [
  { icon: uiIconAssets.depart, title: "출발 시간", body: "도착 시간에 맞춰 계산" },
  { icon: uiIconAssets.pin, title: "목적지 날씨", body: "현재 위치와 바로 비교" },
  { icon: uiIconAssets.rain, title: "비 변화", body: "시작과 그칠 때 확인" },
];

export function OnboardingIntroScreen({ onNavigate, onCompleteOnboarding }: P0ScreenProps) {
  const theme = useAppTheme();

  return (
    <AppScreen
      title="나가기 전 필요한 것만"
      subtitle="출발·비·준비를 한 화면에서 확인"
      badge="1 / 4"
      footer={
        <OnboardingFooter
          primaryLabel="다음"
          primaryAccessibilityLabel="코디 안내 단계로 이동"
          onPrimary={() => onNavigate("O7")}
          secondaryLabel="건너뛰기"
          secondaryAccessibilityLabel="소개를 건너뛰고 홈으로 이동"
          onSecondary={() => onCompleteOnboarding("H1")}
        />
      }
    >
      <View style={[styles.brandHero, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}>
        <View style={styles.brandTop}>
          <Image source={brandAssets.iconPrimary} style={styles.brandIcon} resizeMode="contain" />
          <View style={styles.brandCopy}>
            <Image source={brandAssets.wordmarkDark} style={styles.wordmark} resizeMode="contain" />
            <Text style={[styles.heroCopy, { color: theme.muted }]}>오늘 외출을 한눈에</Text>
          </View>
        </View>
        <View style={styles.quickStrip}>
          <QuickFact label="출발" value="08:10" color={theme.gold} textColor={theme.text} surface={theme.cardMuted} />
          <QuickFact label="목적지" value="비 30%" color={theme.sky} textColor={theme.text} surface={theme.cardMuted} />
          <QuickFact label="완화" value="21:00" color={theme.clear} textColor={theme.text} surface={theme.cardMuted} />
        </View>
      </View>

      <Section title="핵심 정보" accent="sky">
        <View style={styles.featureGrid}>
          {featureCards.map((item) => (
            <View key={item.title} style={[styles.featureTile, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
              <View style={[styles.iconBox, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}>
                <Image source={item.icon} style={[styles.featureIcon, { tintColor: theme.sky }]} resizeMode="contain" />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.body, { color: theme.muted }]}>{item.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </Section>
    </AppScreen>
  );
}

function QuickFact({
  label,
  value,
  color,
  textColor,
  surface,
}: {
  label: string;
  value: string;
  color: string;
  textColor: string;
  surface: string;
}) {
  return (
    <View style={[styles.quickFact, { backgroundColor: surface }]}>
      <Text style={[styles.quickLabel, { color }]}>{label}</Text>
      <Text style={[styles.quickValue, { color: textColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brandHero: {
    minHeight: 212,
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  brandTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  brandIcon: {
    width: 58,
    height: 58,
  },
  brandCopy: {
    flex: 1,
    gap: 4,
  },
  wordmark: {
    width: 122,
    height: 28,
  },
  heroCopy: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  quickStrip: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  quickFact: {
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  quickLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  quickValue: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },
  featureGrid: {
    gap: spacing.sm,
  },
  featureTile: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  featureIcon: {
    width: 22,
    height: 22,
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 14,
    fontWeight: "900",
  },
  body: {
    fontSize: 11,
    lineHeight: 16,
  },
});
