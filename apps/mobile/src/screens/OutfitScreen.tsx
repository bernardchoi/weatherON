import React from "react";
import { Image, Platform, StyleSheet, Text, View, useWindowDimensions } from "../localization/react-native";
import { ambientUiIcons } from "../ambientAssets";
import { AmbientControlSurface } from "../components/AmbientControlSurface";
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
  const ambient = Platform.OS === "ios";
  const layout = useResponsiveLayout();
  const { fontScale } = useWindowDimensions();
  const ownedItemCount = wardrobeItems.filter((item) => item.owned).length;
  const recommendedItems = Object.values(state.outfit.items).filter(Boolean);
  const ownedRecommendedCount = recommendedItems.filter((item) => item?.owned).length;
  const wardrobeCaption =
    state.outfitContext && !state.outfitContext.currentAvailable ? "온도를 확인한 뒤 옷차림을 추천해요"
      : ownedItemCount > 0
      ? `내 옷장 ${ownedItemCount}개 반영 · 오늘 추천 중 ${ownedRecommendedCount}/${recommendedItems.length}개 보유`
      : "기본 옷장으로 먼저 골랐어요 · 내 옷을 더하면 추천이 더 나다워져요";
  const weatherLine = !state.outfitContext ? getWeatherLine(state.weather.current.feelsLikeC, state.weather.current.condition)
    : !state.outfitContext.currentAvailable ? `온도 확인 필요 · ${getConditionLabel(state.weather.current.condition)}`
    : state.outfitContext.reliable ? `현재 · ${Math.round(state.outfitContext.temperature!.value)}도 · ${getConditionLabel(state.weather.current.condition)}`
    : `최근 관측 · ${Math.round(state.outfitContext.temperature!.value)}도 · ${getConditionLabel(state.weather.current.condition)}`;
  return (
      <AppScreen title="코디" subtitle={state.outfitContext?.temperature?.basis === "air" ? `${weatherLine} · 현재 기온 기준` : weatherLine} showWordmark={false} compactHeader contentGap={ambient ? 12 : layout.destinationContentGap} contentPaddingTop={layout.weatherTopPadding + (44 - pageStyles.title.lineHeight) / 2} contentPaddingBottom={8}>
        <View style={{ gap: 12 }}>
          {state.outfitContext ? <Text style={[pageStyles.compactCaption, { color: theme.muted }]}>{state.outfitContext.status}{state.outfitContext.observedLabel ? <Text>{` · 관측 ${state.outfitContext.observedLabel}`}</Text> : null}</Text> : null}
          <Text style={[pageStyles.body, { color: theme.text }, ambient && { fontSize: 23, lineHeight: 32, fontWeight: "700", marginVertical: 4 }]}>{state.outfit.decisionText}</Text>
          <OutfitGrid outfit={state.outfit} maxItems={4} dense singleRow={!ambient && layout.isShort} onItemPress={() => onNavigate("C4")} />
          <Text style={[pageStyles.compactCaption, { color: theme.muted }]}>{wardrobeCaption}</Text>
          <AmbientControlSurface>
          {state.outfit.timeAdvice.slice(0, 1).map((item) => (
            <FeedbackPressable key={item.time} accessibilityRole="button" accessibilityLabel="시간별 코디 조언 상세 보기" onPress={() => onNavigate("C4")} style={[styles.advicePreview, { minHeight: 44, backgroundColor: ambient ? "transparent" : theme.card, borderBottomWidth: ambient ? StyleSheet.hairlineWidth : 0, borderColor: theme.border }]}>
              <View style={[styles.advicePreviewRow, ambient && fontScale > 1.3 && { flexWrap: "wrap" }]}>
                {ambient ? <Image source={ambientUiIcons.time} style={{ width: 24, height: 24, tintColor: theme.muted }} /> : null}
                <Text style={[pageStyles.compactCaption, { color: theme.clear }]}>{formatAdviceTime(item.time)}</Text>
                <Text style={[pageStyles.compactCaption, { color: theme.text, flex: 1 }]}>{item.text}</Text>
              </View>
            </FeedbackPressable>
          ))}
          <View style={[styles.actions, ambient && { alignItems: "center", justifyContent: "space-between", borderTopWidth: StyleSheet.hairlineWidth, borderColor: theme.border }]}>
            {ambient ? <>
              <FeedbackPressable accessibilityRole="button" accessibilityLabel="코디 자세히 보기" onPress={() => onNavigate("C4")} style={styles.readingAction}>
                <Image source={ambientUiIcons.tabOutfit} style={{ width: 26, height: 26, tintColor: theme.clear }} />
                <Text style={[pageStyles.body, { color: theme.clear, fontWeight: "700", flexShrink: 1 }]}>코디 자세히 보기</Text>
              </FeedbackPressable>
              <FeedbackPressable accessibilityRole="button" accessibilityLabel="우산 추천" onPress={() => onNavigate("H4")} style={styles.readingAction}>
                <Image source={ambientUiIcons.umbrella} style={{ width: 24, height: 24, tintColor: theme.muted }} />
                <Text style={[pageStyles.body, { color: theme.text, flexShrink: 1 }]}>우산 추천</Text>
              </FeedbackPressable>
            </> : <>
              <AppButton label="코디 자세히 보기" onPress={() => onNavigate("C4")} size="sm" />
              <AppButton label="우산 추천" onPress={() => onNavigate("H4")} tone="secondary" size="sm" />
            </>}
          </View>
          </AmbientControlSurface>
        </View>
        <View style={[styles.criteriaStats, { gap: 8 }, ambient && fontScale > 1.3 && { flexDirection: "column" }]}>
          <FeedbackPressable accessibilityRole="button" accessibilityLabel={`내 옷장 ${ownedItemCount}개 보기`} onPress={() => onNavigate("C2")} style={[styles.criteriaStat, { backgroundColor: ambient ? "transparent" : theme.card, minHeight: 60, borderTopWidth: ambient ? StyleSheet.hairlineWidth : 0, borderColor: theme.border }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>{ambient ? <Image source={ambientUiIcons.wardrobe} style={{ width: 26, height: 26, tintColor: theme.muted }} /> : null}<Text style={[pageStyles.body, { color: theme.text }]}>내 옷장</Text></View>
            <Text style={[pageStyles.compactCaption, { color: theme.muted }]}>{ownedItemCount}개 보유</Text>
          </FeedbackPressable>
          <FeedbackPressable accessibilityRole="button" accessibilityLabel="코디 스타일 기준 수정" onPress={() => onNavigate("O4")} style={[styles.criteriaStat, { backgroundColor: ambient ? "transparent" : theme.card, minHeight: 60, borderTopWidth: ambient ? StyleSheet.hairlineWidth : 0, borderColor: theme.border }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>{ambient ? <Image source={ambientUiIcons.style} style={{ width: 26, height: 26, tintColor: theme.muted }} /> : null}<Text style={[pageStyles.body, { color: theme.text }]}>스타일 기준</Text></View>
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
  readingAction: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 2, paddingVertical: 8, flexShrink: 1 },
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
