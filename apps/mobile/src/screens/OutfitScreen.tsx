import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { FeedbackPressable } from "../components/FeedbackPressable";
import { OutfitGrid } from "../components/OutfitGrid";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { pageStyles } from "../theme/pageStyles";
import { radius, spacing } from "../theme/tokens";
import { getConditionLabel } from "../utils/weatherPresentation";

export function OutfitScreen({
  state,
  styleProfileSaved,
  selectedStyles,
  wardrobeItems,
  onNavigate,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const ownedItemCount = wardrobeItems.filter((item) => item.owned).length;
  const recommendedItems = Object.values(state.outfit.items).filter(Boolean);
  const ownedRecommendedCount = recommendedItems.filter((item) => item?.owned).length;
  const wardrobeCaption =
    ownedItemCount > 0
      ? `내 옷장 ${ownedItemCount}개 반영 · 오늘 추천 중 ${ownedRecommendedCount}/${recommendedItems.length}개 보유`
      : "기본 옷장으로 먼저 골랐어요 · 내 옷을 더하면 추천이 더 나다워져요";
  return (
      <AppScreen title="코디" subtitle={getWeatherLine(state.weather.current.feelsLikeC, state.weather.current.condition)} showWordmark={false} compactHeader contentGap={layout.destinationContentGap} contentPaddingTop={layout.weatherTopPadding + (44 - pageStyles.title.lineHeight) / 2} contentPaddingBottom={8}>
        <View style={{ gap: 12 }}>
          <Text style={[pageStyles.body, { color: theme.text }]}>{state.outfit.decisionText}</Text>
          <OutfitGrid outfit={state.outfit} maxItems={4} dense singleRow={layout.isShort} onItemPress={() => onNavigate("C4")} />
          <Text style={[pageStyles.compactCaption, { color: theme.muted }]}>{wardrobeCaption}</Text>
          {state.outfit.timeAdvice.slice(0, 1).map((item) => (
            <FeedbackPressable key={item.time} accessibilityRole="button" accessibilityLabel="시간별 코디 조언 상세 보기" onPress={() => onNavigate("C4")} style={[styles.advicePreview, { minHeight: 44, backgroundColor: theme.card }]}>
              <View style={styles.advicePreviewRow}>
                <Text style={[pageStyles.compactCaption, { color: theme.clear }]}>{formatAdviceTime(item.time)}</Text>
                <Text style={[pageStyles.compactCaption, { color: theme.text, flex: 1 }]}>{item.text}</Text>
              </View>
            </FeedbackPressable>
          ))}
          <View style={styles.actions}>
            <AppButton label="코디 자세히 보기" onPress={() => onNavigate("C4")} size="sm" />
            <AppButton label="우산도 확인" onPress={() => onNavigate("H4")} tone="secondary" size="sm" />
          </View>
        </View>
        <View style={[styles.criteriaStats, { gap: 8 }]}>
          <FeedbackPressable accessibilityRole="button" accessibilityLabel={`내 옷장 ${ownedItemCount}개 보기`} onPress={() => onNavigate("C2")} style={[styles.criteriaStat, { backgroundColor: theme.card, minHeight: 52 }]}>
            <Text style={[pageStyles.body, { color: theme.text }]}>내 옷장</Text>
            <Text style={[pageStyles.compactCaption, { color: theme.muted }]}>{ownedItemCount}개 보유</Text>
          </FeedbackPressable>
          <FeedbackPressable accessibilityRole="button" accessibilityLabel="코디 스타일 기준 수정" onPress={() => onNavigate("O4")} style={[styles.criteriaStat, { backgroundColor: theme.card, minHeight: 52 }]}>
            <Text style={[pageStyles.body, { color: theme.text }]}>스타일 기준</Text>
            <Text style={[pageStyles.compactCaption, { color: theme.muted }]}>{styleProfileSaved ? selectedStyles[0] ?? "수정하기" : "나에게 맞게 설정"}</Text>
          </FeedbackPressable>
        </View>
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
  criteriaStats: {
    flexDirection: "row",
    gap: 7,
  },
  criteriaStat: {
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  advicePreview: {
    minHeight: 44,
    justifyContent: "center",
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
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
});
