import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { CompletionStatus } from "../components/CompletionStatus";
import { Section } from "../components/Section";
import { getOutfitImageSource, uiIconAssets } from "../assets";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { pageStyles } from "../theme/pageStyles";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { radius, spacing } from "../theme/tokens";
import { getOutfitSlotLabel, getOutfitVariantLabel } from "../utils/outfitLabels";
import { outfitSaveCompletionDurationMs, shouldShowOutfitSaveCompletion } from "../utils/outfitSaveCompletion";

const AI_RECOMPOSE_VISIBLE = false;

export function OutfitDetailScreen({
  state,
  accountLinked,
  termsRequiredAccepted,
  outfitSaved,
  wardrobeItems,
  accountGateResult,
  onNavigate,
  onOpenWardrobeAdd,
  onRequireAccount,
  onDismissAccountGateResult,
  onGoBack,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const items = Object.entries(state.outfit.items).filter((entry) => Boolean(entry[1]));
  const usesWrappedItemGrid = items.length > 3;
  const weatherReasons = buildWeatherReasons(state, theme);
  const ownedItemCount = wardrobeItems.filter((item) => item.owned).length;
  const canSaveDirectly = accountLinked && termsRequiredAccepted;
  const needsTerms = accountLinked && !termsRequiredAccepted;
  const [saveCompletionVisible, setSaveCompletionVisible] = React.useState(false);
  const wasSavedRef = React.useRef(outfitSaved);

  React.useEffect(() => {
    const returnedFromSaveFlow =
      accountGateResult?.pendingAction === "save-outfit"
      && accountGateResult.returnTo === "C4";
    if (shouldShowOutfitSaveCompletion(wasSavedRef.current, outfitSaved, accountGateResult)) {
      setSaveCompletionVisible(true);
    }
    wasSavedRef.current = outfitSaved;
    if (returnedFromSaveFlow) onDismissAccountGateResult();
  }, [accountGateResult, onDismissAccountGateResult, outfitSaved]);

  React.useEffect(() => {
    if (!saveCompletionVisible) return undefined;
    const timer = setTimeout(() => setSaveCompletionVisible(false), outfitSaveCompletionDurationMs);
    return () => clearTimeout(timer);
  }, [saveCompletionVisible]);

  return (
    <AppScreen
      title="코디 상세"
      badge={`${state.outfit.matchPct}%`}
      onBack={onGoBack}
      showWordmark={false}
      compactHeader
      contentPaddingTop={layout.weatherTopPadding + spacing.sm}
      contentGap={layout.destinationContentGap}
      contentPaddingBottom={0}
      footer={
        <View style={styles.footer}>
          <CompletionStatus
            visible={saveCompletionVisible}
            compact
            title="코디 저장 완료"
            message="저장한 코디는 코디 탭에서 계속 확인할 수 있어요"
          />
          <View style={[styles.actions, styles.saveActions]}>
            <AppButton
              label={outfitSaved ? "저장 완료" : canSaveDirectly ? "코디 저장" : needsTerms ? "약관 동의 후 저장" : "계정 연결 후 저장"}
              onPress={() => onRequireAccount("save-outfit", "C4")}
              tone={outfitSaved ? "secondary" : "warning"}
              size="sm"
              disabled={outfitSaved}
            />
            <AppButton label="코디로 돌아가기" onPress={() => onNavigate("C1")} tone="secondary" size="sm" />
          </View>
        </View>
      }
    >
      <Section title="오늘 입기 좋은 세트" caption={state.outfit.decisionText} accent="clear">
        <View style={styles.outfitRail}>
          {items.map(([slot, item]) => {
            const imageSource = getOutfitImageSource(item?.imageUrl);
            return item ? (
              <View
                key={slot}
                accessible
                accessibilityLabel={`${getOutfitSlotLabel(slot)} ${item.name}`}
                style={[
                  styles.outfitMiniTile,
                  usesWrappedItemGrid
                    ? [styles.outfitMiniTileGrid, { width: layout.wardrobeGridItemWidth }]
                    : styles.outfitMiniTileFlexible,
                  {
                    minHeight: layout.outfitDetailCardMinHeight,
                    backgroundColor: theme.cardMuted,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.outfitImageFrame,
                    { height: layout.outfitDetailImageHeight, backgroundColor: theme.card },
                  ]}
                >
                  {imageSource ? (
                    <Image
                      source={imageSource}
                      style={[styles.outfitImage, { height: Math.max(40, layout.outfitDetailImageHeight - 4) }]}
                      resizeMode="contain"
                    />
                  ) : (
                    <Image source={uiIconAssets.shirt} style={[styles.outfitFallbackIcon, { tintColor: theme.clear }]} resizeMode="contain" />
                  )}
                </View>
                <Text style={[styles.itemSlot, pageStyles.compactCaption, { color: theme.clear }]} numberOfLines={1}>{getOutfitSlotLabel(slot)}</Text>
              </View>
            ) : null;
          })}
        </View>
        <View style={styles.detailHeading}>
          <Text style={[styles.detailTitle, { color: theme.text }]}>이 시간엔 이렇게 입어요</Text>
          <Text style={[styles.detailCaption, pageStyles.compactCaption, { color: theme.muted }]}>앞으로 3시간</Text>
        </View>
        <View style={styles.timeAdviceRow}>
          {state.outfit.timeAdvice.slice(0, 3).map((item) => {
            const presentation = getTimeAdvicePresentation(item.text, theme);
            return (
              <View
                key={item.time}
                accessible
                accessibilityLabel={`${formatAdviceTime(item.time)} ${presentation.copy}`}
                style={[styles.timeAdviceCard, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}
              >
                <View style={styles.timeAdviceHeader}>
                  <Image source={presentation.icon} style={[styles.timeAdviceIcon, { tintColor: presentation.color }]} resizeMode="contain" />
                  <Text style={[styles.timeAdviceTime, pageStyles.compactCaption, { color: theme.gold }]}>{formatAdviceTime(item.time)}</Text>
                </View>
                <Text style={[pageStyles.compactCaption, styles.timeAdviceCopy, { color: theme.text }]}>{presentation.copy}</Text>
              </View>
            );
          })}
        </View>

        <View style={[styles.recommendationPanel, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
          <View style={styles.recommendationHeader}>
            <View style={[styles.recommendationIconWrap, { backgroundColor: theme.cardStrong }]}>
              <Image source={uiIconAssets.check} style={[styles.recommendationIcon, { tintColor: theme.clear }]} resizeMode="contain" />
            </View>
            <View style={styles.recommendationCopy}>
              <Text style={[styles.recommendationTitle, { color: theme.text }]}>오늘 날씨에 {state.outfit.matchPct}% 잘 맞아요</Text>
              <Text numberOfLines={1} style={[styles.recommendationCaption, pageStyles.compactCaption, { color: theme.muted }]}>{getOutfitVariantLabel(state.outfit.variant)} 중심으로 골랐어요</Text>
            </View>
          </View>
          <View style={styles.reasonGrid}>
            {weatherReasons.map((reason) => (
              <View key={reason.label} style={[styles.reasonTile, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.reasonLabelRow}>
                  <Image source={reason.icon} style={[styles.reasonIcon, { tintColor: reason.color }]} resizeMode="contain" />
                  <Text numberOfLines={1} style={[styles.reasonLabel, pageStyles.compactCaption, { color: theme.subtle }]}>{reason.label}</Text>
                </View>
                <Text style={[styles.reasonValue, { color: theme.text }]} numberOfLines={1}>{reason.value}</Text>
                <Text style={[pageStyles.compactCaption, styles.reasonDetail, { color: theme.muted }]}>{reason.detail}</Text>
              </View>
            ))}
          </View>
        </View>
      </Section>

      {AI_RECOMPOSE_VISIBLE ? (
        <Section title="AI 추천 변경" caption="대화형 재구성 기능 준비 영역" accent="sky">
          <View style={[styles.resultBox, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
            <Text style={[styles.resultTitle, { color: theme.clear }]}>원하는 방향을 말하면 추천 구성을 다시 제안</Text>
            <Text style={[styles.resultCopy, { color: theme.muted }]}>출시 전 검증까지 숨김 처리</Text>
          </View>
        </Section>
      ) : null}

      <Section title="내 옷장" caption={`보유 ${ownedItemCount}개 · 추천에 반영됨`} accent="clear">
        <View style={styles.actions}>
          <AppButton label="내 옷장 보기" onPress={() => onNavigate("C2")} tone="secondary" />
          <AppButton label="아이템 추가" onPress={onOpenWardrobeAdd} tone="warning" />
        </View>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  detailHeading: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  detailTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  detailCaption: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
  },
  timeAdviceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  timeAdviceCard: {
    minWidth: 88,
    minHeight: 74,
    flex: 1,
    justifyContent: "center",
    gap: 7,
    padding: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  timeAdviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeAdviceIcon: {
    width: 15,
    height: 15,
  },
  timeAdviceTime: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  timeAdviceCopy: {
    minHeight: 34,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  outfitRail: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: spacing.sm,
    rowGap: spacing.sm,
  },
  outfitMiniTile: {
    minWidth: 0,
    minHeight: 86,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  outfitMiniTileFlexible: {
    flex: 1,
  },
  outfitMiniTileGrid: {
    width: "30.8%",
  },
  outfitImageFrame: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  outfitImage: {
    width: "92%",
  },
  outfitFallbackIcon: {
    width: 24,
    height: 24,
  },
  itemSlot: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  recommendationPanel: {
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  recommendationIconWrap: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  recommendationIcon: {
    width: 19,
    height: 19,
  },
  recommendationCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  recommendationTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  recommendationCaption: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  reasonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  reasonTile: {
    minWidth: 88,
    minHeight: 82,
    flex: 1,
    gap: 3,
    padding: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  reasonLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reasonIcon: {
    width: 14,
    height: 14,
  },
  reasonLabel: {
    minWidth: 0,
    flex: 1,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  reasonValue: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  reasonDetail: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  resultBox: {
    gap: 4,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
  resultCopy: {
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  footer: {
    gap: spacing.xs,
  },
  saveActions: {
    paddingBottom: spacing.sm,
  },
});

function buildWeatherReasons(state: P0ScreenProps["state"], theme: ReturnType<typeof useAppTheme>) {
  const rainProbability = getRainSignalPct(state);
  const windSpeed = state.weather.current.windMs;
  const feelsLikeDelta = Math.round(state.weather.current.feelsLikeC - state.weather.current.tempC);
  return [
    {
      label: "체감 온도",
      value: `${Math.round(state.weather.current.feelsLikeC)}도`,
      detail: feelsLikeDelta === 0
        ? "딱 쾌적해요"
        : feelsLikeDelta > 0
          ? `${feelsLikeDelta}도 더 더워요`
          : `${Math.abs(feelsLikeDelta)}도 더 선선해요`,
      icon: uiIconAssets.uv,
      color: theme.gold,
    },
    {
      label: "비 가능성",
      value: rainProbability > 0 ? `최대 ${Math.round(rainProbability)}%` : "비 없음",
      detail: rainProbability >= 50 ? "우산 챙겨요" : rainProbability > 0 ? "가벼운 비예요" : "비 걱정 없어요",
      icon: uiIconAssets.rain,
      color: rainProbability >= 50 ? theme.sky : theme.clear,
    },
    {
      label: "바람",
      value: `${formatWindSpeed(windSpeed)}m/s`,
      detail: windSpeed >= 8 ? "바람이 세요" : windSpeed >= 4 ? "산들바람이에요" : "바람이 잔잔해요",
      icon: uiIconAssets.wind,
      color: windSpeed >= 8 ? theme.gold : theme.sky,
    },
  ];
}

function getRainSignalPct(state: P0ScreenProps["state"]) {
  return Math.round(
    Math.max(
      state.weather.current.rainProbabilityPct,
      ...state.weather.hourly.map((item) => item.rainProbabilityPct),
    ),
  );
}

function formatAdviceTime(value: string) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return `${String(parsed.getHours()).padStart(2, "0")}:00`;
  }
  const match = value.match(/T(\d{2})/);
  return match ? `${match[1]}:00` : value;
}

function getTimeAdvicePresentation(value: string, theme: ReturnType<typeof useAppTheme>) {
  if (value.includes("우산") || value.includes("비")) {
    return { copy: "우산·방수 챙겨요", icon: uiIconAssets.rain, color: theme.sky };
  }
  if (value.includes("겉옷") || value.includes("쌀쌀")) {
    return { copy: "겉옷을 더해요", icon: uiIconAssets.shirt, color: theme.gold };
  }
  if (value.includes("그대로") || value.includes("좋아요")) {
    return { copy: "지금 세트 그대로", icon: uiIconAssets.check, color: theme.clear };
  }
  return { copy: "날씨를 확인해요", icon: uiIconAssets.check, color: theme.clear };
}

function formatWindSpeed(value: number) {
  return value >= 10 ? Math.round(value).toString() : value.toFixed(1);
}
