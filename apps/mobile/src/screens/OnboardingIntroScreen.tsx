import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { brandAssets, onboardingAssets, uiIconAssets } from "../assets";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

const featureCards = [
  { icon: uiIconAssets.shirt, title: "코디 추천", body: "현재 날씨와 시간대에 맞는 옷차림을 먼저 제안" },
  { icon: uiIconAssets.umbrella, title: "우산 판단", body: "비 시작 전 챙길지, 비 그친 뒤 나갈지 바로 확인" },
  { icon: uiIconAssets.shoe, title: "신발 추천", body: "목적지 비와 바람까지 보고 외출 전 선택을 줄임" },
  { icon: uiIconAssets.depart, title: "출발 알림", body: "도착 시간에서 이동 시간과 여유 시간을 빼서 출발 시간을 보여줌" },
];

export function OnboardingIntroScreen({ onNavigate, onRequestPermissionGate, locationReady }: P0ScreenProps) {
  const theme = useAppTheme();

  return (
    <AppScreen title="나가기 전 5초 판단" subtitle="출발시간, 목적지 날씨, 비 그침 알림만 먼저 확인" badge="MVP 0">
      <View style={[styles.brandHero, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
        <View style={styles.brandTop}>
          <Image source={brandAssets.iconPrimary} style={styles.brandIcon} resizeMode="contain" />
          <View style={styles.brandCopy}>
            <Image source={brandAssets.wordmarkDark} style={styles.wordmark} resizeMode="contain" />
            <Text style={[styles.heroCopy, { color: theme.muted }]}>처음 열면 바로 알아야 하는 세 가지</Text>
          </View>
        </View>
        <View style={styles.quickStrip}>
          <QuickFact label="출발" value="08:10" color={theme.gold} textColor={theme.text} surface={theme.cardMuted} />
          <QuickFact label="목적지" value="비 30%" color={theme.sky} textColor={theme.text} surface={theme.cardMuted} />
          <QuickFact label="그침" value="21:00" color={theme.clear} textColor={theme.text} surface={theme.cardMuted} />
        </View>
      </View>

      <View style={[styles.previewFrame, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Image source={onboardingAssets.ready} style={styles.previewImage} resizeMode="cover" />
      </View>

      <Section title="먼저 검증할 기능" caption="예쁜 기능보다 실제로 다시 쓸 이유부터 확인" accent="sky">
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

      <Section title="바로 확인하기" caption="목적지와 알림은 나중에 저장해도 됨" accent="gold">
        <View style={styles.actions}>
          <AppButton label="위치 기준 설정" onPress={() => onRequestPermissionGate("location", "O4")} tone="warning" />
          <AppButton label="홈에서 먼저 판단" onPress={() => onNavigate("H1")} />
          <AppButton label={locationReady ? "스타일은 나중에" : "위치 없이 시작"} onPress={() => onNavigate("O4")} tone="secondary" />
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
    minHeight: 154,
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  brandTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  brandIcon: {
    width: 66,
    height: 66,
  },
  brandCopy: {
    flex: 1,
    gap: 4,
  },
  wordmark: {
    width: 134,
    height: 30,
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
    minHeight: 54,
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
  previewFrame: {
    height: 142,
    overflow: "hidden",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  featureGrid: {
    gap: spacing.sm,
  },
  featureTile: {
    minHeight: 78,
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
  actions: {
    gap: spacing.sm,
  },
});
