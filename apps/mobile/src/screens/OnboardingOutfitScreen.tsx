import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import { AppScreen } from "../components/AppScreen";
import { OnboardingFooter } from "../components/OnboardingFooter";
import { OutfitGrid } from "../components/OutfitGrid";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing } from "../theme/tokens";
import { getOutfitVariantLabel } from "../utils/outfitLabels";

const benefits = [
  { icon: uiIconAssets.shirt, title: "기온·강수 기반 추천" },
  { icon: uiIconAssets.umbrella, title: "우산·신발 함께 확인" },
  { icon: uiIconAssets.settings, title: "코디 탭에서 내 기준 조정" },
];

export function OnboardingOutfitScreen({ state, onNavigate, onCompleteOnboarding }: P0ScreenProps) {
  const theme = useAppTheme();
  const outfitItems = Object.values(state.outfit.items).filter(Boolean);

  return (
    <AppScreen
      title="오늘 날씨에 맞는 코디"
      subtitle="옷과 준비물을 함께 추천"
      badge="2 / 4"
      footer={
        <OnboardingFooter
          primaryLabel="다음"
          primaryAccessibilityLabel="알림 안내 단계로 이동"
          onPrimary={() => onNavigate("O5")}
          secondaryLabel="건너뛰기"
          secondaryAccessibilityLabel="온보딩을 건너뛰고 홈으로 이동"
          onSecondary={() => onCompleteOnboarding("H1")}
        />
      }
    >
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

      <Section title="코디 추천" accent="clear">
        <View style={styles.benefitList}>
          {benefits.map((benefit) => (
            <View key={benefit.title} style={[styles.benefitRow, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
              <View style={[styles.benefitIconFrame, { backgroundColor: theme.cardSoft }]}>
                <Image source={benefit.icon} style={[styles.benefitIcon, { tintColor: theme.gold }]} resizeMode="contain" />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.benefitTitle, { color: theme.text }]}>{benefit.title}</Text>
              </View>
            </View>
          ))}
        </View>
      </Section>
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
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  previewTitle: {
    fontSize: 18,
    lineHeight: 24,
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
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  benefitIconFrame: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  benefitIcon: {
    width: 24,
    height: 24,
  },
  benefitTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900",
  },
});
