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

export function OutfitScreen({
  state,
  outfitSaved,
  styleProfileSaved,
  selectedStyles,
  wardrobeItems,
  onNavigate,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const ownedItemCount = wardrobeItems.filter((item) => item.owned).length;
  const recommendedItems = Object.values(state.outfit.items).filter(Boolean);
  const ownedRecommendedCount = recommendedItems.filter((item) => item?.owned).length;
  const wardrobeCaption =
    ownedItemCount > 0
      ? `내 옷장 ${ownedItemCount}개 반영 · 추천 세트 ${ownedRecommendedCount}/${recommendedItems.length}개 보유`
      : "프리셋 기준 추천 · 옷장을 추가하면 내 보유 옷을 우선 반영";
  return (
    <AppScreen
      title="코디"
      subtitle={getWeatherLine(state.weather.current.feelsLikeC, state.weather.current.condition)}
      badge={`${state.outfit.matchPct}%`}
      showWordmark={false}
    >
      <View style={[styles.criteriaCard, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow(theme)]}>
        <View style={styles.criteriaHeader}>
          <View>
            <Text style={[styles.criteriaLabel, { color: theme.gold }]}>추천 기준</Text>
            <Text style={[styles.criteriaTitle, { color: theme.text }]}>기본 날씨 기준 추천</Text>
          </View>
          <AppButton label="기준 수정" onPress={() => onNavigate("O4")} tone="warning" />
        </View>
        <Text style={[styles.criteriaBody, { color: theme.muted }]} numberOfLines={1}>{wardrobeCaption}</Text>
        <View style={styles.criteriaStats}>
          <View style={[styles.criteriaStat, { backgroundColor: theme.cardMuted }]}>
            <Image source={uiIconAssets.shirt} style={[styles.criteriaStatIcon, { tintColor: theme.clear }]} resizeMode="contain" />
            <Text style={[styles.criteriaStatValue, { color: theme.clear }]}>{ownedItemCount}개 매칭</Text>
          </View>
          <View style={[styles.criteriaStat, { backgroundColor: theme.cardMuted }]}>
            <Image source={uiIconAssets.settings} style={[styles.criteriaStatIcon, { tintColor: theme.gold }]} resizeMode="contain" />
            <Text style={[styles.criteriaStatValue, { color: theme.gold }]}>{styleProfileSaved ? selectedStyles[0] ?? "저장됨" : "미설정"}</Text>
          </View>
          <View style={[styles.criteriaStat, { backgroundColor: theme.cardMuted }]}>
            <Image source={uiIconAssets.check} style={[styles.criteriaStatIcon, { tintColor: outfitSaved ? theme.clear : theme.sky }]} resizeMode="contain" />
            <Text style={[styles.criteriaStatValue, { color: outfitSaved ? theme.clear : theme.sky }]}>{outfitSaved ? "완료" : "계정 필요"}</Text>
          </View>
        </View>
      </View>

      <Section title="오늘 입을 세트" caption={state.outfit.decisionText} accent="clear">
        <OutfitGrid outfit={state.outfit} maxItems={4} compact />
        <View style={styles.pillRow}>
          <StatusPill label={getOutfitVariantLabel(state.outfit.variant)} tone="clear" />
          <StatusPill label={state.weather.current.rainProbabilityPct > 0 ? "비 신호" : "비 없음"} tone="sky" />
          <StatusPill label={outfitSaved ? "저장 완료" : "저장 가능"} tone={outfitSaved ? "clear" : "sky"} />
        </View>
        {state.outfit.reasons.slice(0, 1).map((reason) => (
          <View key={reason} style={styles.reasonRow}>
            <Image source={uiIconAssets.check} style={[styles.reasonIcon, { tintColor: theme.clear }]} resizeMode="contain" />
            <Text style={[styles.reason, { color: theme.muted }]} numberOfLines={1}>{reason}</Text>
          </View>
        ))}
        <View style={[styles.advicePreview, { backgroundColor: theme.cardMuted }]}>
          {state.outfit.timeAdvice.slice(0, 2).map((item) => (
            <View key={item.time} style={styles.advicePreviewRow}>
              <Text style={[styles.advicePreviewTime, { color: theme.gold }]}>{formatAdviceTime(item.time)}</Text>
              <Text style={[styles.advicePreviewText, { color: theme.text }]} numberOfLines={1}>{item.text}</Text>
            </View>
          ))}
        </View>
        <View style={styles.actions}>
          <AppButton label="상세 보기" onPress={() => onNavigate("C4")} />
          <AppButton label="우산 확인" onPress={() => onNavigate("H4")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

function getWeatherLine(feelsLikeC: number, condition: string) {
  const conditionLabel = condition === "clear" ? "맑음" : condition === "rain" ? "비" : condition === "storm" ? "강한 비" : "날씨";
  return `${Math.round(feelsLikeC)}도 · ${conditionLabel} · 일교차 기준 추천`;
}

function formatAdviceTime(value: string) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return `${String(parsed.getHours()).padStart(2, "0")}:00`;
  }
  const match = value.match(/T(\d{2})/);
  return match ? `${match[1]}:00` : value;
}

const styles = StyleSheet.create({
  criteriaCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  criteriaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  criteriaLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  criteriaTitle: {
    marginTop: 2,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  criteriaBody: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  criteriaStats: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  criteriaStat: {
    flex: 1,
    minHeight: 50,
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  criteriaStatIcon: {
    width: 16,
    height: 16,
  },
  criteriaStatValue: {
    fontSize: 12,
    fontWeight: "900",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  reason: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  reasonIcon: {
    width: 15,
    height: 15,
  },
  advicePreview: {
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  advicePreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  advicePreviewTime: {
    width: 44,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  advicePreviewText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
});
