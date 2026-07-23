import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { FeedbackPressable } from "../components/FeedbackPressable";
import { OutfitGrid } from "../components/OutfitGrid";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing } from "../theme/tokens";
import { getOutfitVariantLabel } from "../utils/outfitLabels";
import { getConditionLabel } from "../utils/weatherPresentation";

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
      ? `내 옷장 ${ownedItemCount}개 반영 · 오늘 추천 중 ${ownedRecommendedCount}/${recommendedItems.length}개 보유`
      : "기본 옷장으로 먼저 골랐어요 · 내 옷을 더하면 추천이 더 나다워져요";
  return (
    <AppScreen
      title="코디"
      subtitle={getWeatherLine(state.weather.current.feelsLikeC, state.weather.current.condition)}
      badge={`${state.outfit.matchPct}%`}
      showWordmark={false}
    >
      <View style={[styles.criteriaCard, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow(theme)]}>
        <View style={styles.criteriaHeader}>
          <View style={styles.criteriaCopy}>
            <Text style={[styles.criteriaLabel, { color: theme.subtle }]}>나만의 코디 기준</Text>
            <Text style={[styles.criteriaTitle, { color: theme.text }]}>오늘 날씨에 맞춰 골랐어요</Text>
          </View>
          <FeedbackPressable
            accessibilityLabel="코디 스타일 기준 수정"
            accessibilityRole="button"
            onPress={() => onNavigate("O4")}
            style={[styles.criteriaEditButton, { backgroundColor: `${theme.gold}14`, borderColor: `${theme.gold}36` }]}
          >
            <Image source={uiIconAssets.settings} style={[styles.criteriaEditIcon, { tintColor: theme.gold }]} resizeMode="contain" />
            <Text style={[styles.criteriaEditText, { color: theme.gold }]}>기준 수정</Text>
          </FeedbackPressable>
        </View>
        <Text style={[styles.criteriaBody, { color: theme.muted }]} numberOfLines={1}>{wardrobeCaption}</Text>
        <View style={styles.criteriaStats}>
          <FeedbackPressable
            accessibilityLabel={`내 옷장 ${ownedItemCount}개 반영, 내 옷장 보기`}
            accessibilityRole="button"
            onPress={() => onNavigate("C2")}
            style={[styles.criteriaStat, { backgroundColor: theme.cardMuted }]}
          >
            <Image source={uiIconAssets.shirt} style={[styles.criteriaStatIcon, { tintColor: theme.clear }]} resizeMode="contain" />
            <Text style={[styles.criteriaStatValue, { color: theme.text }]}>{ownedItemCount}개 반영</Text>
          </FeedbackPressable>
          <FeedbackPressable
            accessibilityLabel={`스타일 기준 ${styleProfileSaved ? "수정" : "설정"}`}
            accessibilityRole="button"
            onPress={() => onNavigate("O4")}
            style={[styles.criteriaStat, { backgroundColor: theme.cardMuted }]}
          >
            <Image source={uiIconAssets.settings} style={[styles.criteriaStatIcon, { tintColor: theme.clear }]} resizeMode="contain" />
            <Text style={[styles.criteriaStatValue, { color: theme.text }]}>{styleProfileSaved ? selectedStyles[0] ?? "저장됨" : "미설정"}</Text>
          </FeedbackPressable>
          <FeedbackPressable
            accessibilityLabel={outfitSaved ? "저장한 코디 상세 보기" : "코디 상세에서 저장하기"}
            accessibilityRole="button"
            onPress={() => onNavigate("C4")}
            style={[styles.criteriaStat, { backgroundColor: theme.cardMuted }]}
          >
            <Image source={uiIconAssets.check} style={[styles.criteriaStatIcon, { tintColor: outfitSaved ? theme.clear : theme.subtle }]} resizeMode="contain" />
            <Text style={[styles.criteriaStatValue, { color: theme.text }]}>{outfitSaved ? "완료" : "계정 필요"}</Text>
          </FeedbackPressable>
        </View>
      </View>

      <Section title="오늘 입기 좋은 조합" caption={state.outfit.decisionText} accent="clear">
        <OutfitGrid outfit={state.outfit} maxItems={4} dense onItemPress={() => onNavigate("C4")} />
        <View style={styles.pillRow}>
          <StatusPill
            label={getOutfitVariantLabel(state.outfit.variant)}
            tone="clear"
            accessibilityLabel="코디 스타일 기준 수정"
            onPress={() => onNavigate("O4")}
          />
          <StatusPill
            label={state.weather.current.rainProbabilityPct > 0 ? "비 신호" : "비 없음"}
            tone="clear"
            accessibilityLabel="강수 타임라인 보기"
            onPress={() => onNavigate("H5")}
          />
          <StatusPill
            label={outfitSaved ? "내 코디에 담김" : "마음에 들면 저장"}
            tone="clear"
            accessibilityLabel={outfitSaved ? "저장한 코디 상세 보기" : "코디 저장으로 이동"}
            onPress={() => onNavigate("C4")}
          />
        </View>
        {state.outfit.reasons.slice(0, 1).map((reason) => (
          <View key={reason} style={styles.reasonRow}>
            <Image source={uiIconAssets.check} style={[styles.reasonIcon, { tintColor: theme.clear }]} resizeMode="contain" />
            <Text style={[styles.reason, { color: theme.muted }]} numberOfLines={1}>{reason}</Text>
          </View>
        ))}
        <FeedbackPressable
          accessibilityLabel="시간별 코디 조언 상세 보기"
          accessibilityRole="button"
          onPress={() => onNavigate("C4")}
          style={[styles.advicePreview, { backgroundColor: theme.cardMuted }]}
        >
          {state.outfit.timeAdvice.slice(0, 1).map((item) => (
            <View key={item.time} style={styles.advicePreviewRow}>
              <Text style={[styles.advicePreviewTime, { color: theme.clear }]}>{formatAdviceTime(item.time)}</Text>
              <Text style={[styles.advicePreviewText, { color: theme.text }]} numberOfLines={1}>{item.text}</Text>
            </View>
          ))}
        </FeedbackPressable>
        <View style={styles.actions}>
          <AppButton label="코디 자세히 보기" onPress={() => onNavigate("C4")} />
          <AppButton label="우산도 확인" onPress={() => onNavigate("H4")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

function getWeatherLine(feelsLikeC: number, condition: string) {
  return `${Math.round(feelsLikeC)}도 · ${getConditionLabel(condition)} · 오늘 몸이 느낄 날씨 기준`;
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
    gap: 12,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  criteriaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  criteriaCopy: {
    flex: 1,
    minWidth: 0,
  },
  criteriaLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  criteriaTitle: {
    marginTop: 2,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
  },
  criteriaBody: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  criteriaStats: {
    flexDirection: "row",
    gap: 7,
  },
  criteriaStat: {
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 10,
    borderRadius: radius.md,
  },
  criteriaStatIcon: {
    width: 16,
    height: 16,
  },
  criteriaStatValue: {
    fontSize: 13,
    fontWeight: "900",
  },
  criteriaEditButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  criteriaEditIcon: {
    width: 16,
    height: 16,
  },
  criteriaEditText: {
    fontSize: 13,
    lineHeight: 17,
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
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
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
    gap: spacing.xs,
  },
});
