import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { OutfitGrid } from "../components/OutfitGrid";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing } from "../theme/tokens";
import { getOutfitVariantLabel } from "../utils/outfitLabels";

const benefits = [
  { icon: uiIconAssets.shirt, title: "날씨 기준 추천", body: "기온·체감 온도·강수에 맞춘 오늘 코디 제안" },
  { icon: uiIconAssets.umbrella, title: "챙길 것 함께 확인", body: "우산과 신발 등 외출 준비물도 같이 안내" },
  { icon: uiIconAssets.settings, title: "내 기준으로 조정", body: "스타일과 옷장은 코디 탭에서 나중에 수정 가능" },
];

export function OnboardingOutfitScreen({ state, onNavigate, onCompleteOnboarding }: P0ScreenProps) {
  const theme = useAppTheme();
  const outfitItems = Object.values(state.outfit.items).filter(Boolean);

  return (
    <AppScreen title="날씨에 맞는 코디를 바로 추천해드림" subtitle="외출 전 날씨와 준비물을 한 번에 판단" badge="2 / 4">
      <View style={[styles.progressTrack, { backgroundColor: theme.cardMuted }]}>
        <View style={[styles.progressFill, { backgroundColor: theme.gold }]} />
      </View>

      <View style={[styles.outfitPreview, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow(theme)]}>
        <View style={styles.previewHeader}>
          <View style={[styles.iconFrame, { backgroundColor: `${theme.clear}18` }]}>
            <Image source={uiIconAssets.shirt} style={[styles.heroIcon, { tintColor: theme.clear }]} resizeMode="contain" />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.previewLabel, { color: theme.clear }]}>오늘의 추천</Text>
            <Text style={[styles.previewTitle, { color: theme.text }]}>{state.outfit.decisionText}</Text>
          </View>
        </View>
        <OutfitGrid outfit={state.outfit} maxItems={2} compact />
        <View style={styles.pillRow}>
          <StatusPill label={getOutfitVariantLabel(state.outfit.variant)} tone="clear" />
          <StatusPill label={state.weather.current.rainProbabilityPct > 0 ? "비 대비" : "강수 없음"} tone="sky" />
          <StatusPill label={`${outfitItems.length}개 아이템`} tone="gold" />
        </View>
      </View>

      <Section title="코디 기능" caption="추천 이유를 보고 내 옷장 기준으로 이어서 관리" accent="clear">
        <View style={styles.benefitList}>
          {benefits.map((benefit) => (
            <View key={benefit.title} style={[styles.benefitRow, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
              <View style={[styles.benefitIconFrame, { backgroundColor: theme.cardSoft }]}>
                <Image source={benefit.icon} style={[styles.benefitIcon, { tintColor: theme.gold }]} resizeMode="contain" />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.benefitTitle, { color: theme.text }]}>{benefit.title}</Text>
                <Text style={[styles.benefitBody, { color: theme.muted }]}>{benefit.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </Section>

      <View style={styles.actions}>
        <AppButton label="다음" accessibilityLabel="스마트 알림 기준 단계로 계속" onPress={() => onNavigate("O5")} />
        <AppButton label="건너뛰고 홈으로" accessibilityLabel="온보딩을 건너뛰고 홈으로 이동" onPress={() => onCompleteOnboarding("H1")} tone="secondary" />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 4,
    overflow: "hidden",
    borderRadius: radius.pill,
  },
  progressFill: {
    width: "50%",
    height: "100%",
  },
  outfitPreview: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconFrame: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  heroIcon: {
    width: 24,
    height: 24,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  previewLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  previewTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  benefitList: {
    gap: spacing.sm,
  },
  benefitRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  benefitIconFrame: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  benefitIcon: {
    width: 20,
    height: 20,
  },
  benefitTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  benefitBody: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  actions: {
    gap: spacing.sm,
  },
});
