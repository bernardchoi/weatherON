import React from "react";
import { Image, Platform, StyleSheet, Text, View, useWindowDimensions } from "../localization/react-native";
import { ambientUiIcons } from "../ambientAssets";
import { AmbientControlSurface } from "../components/AmbientControlSurface";
import { triggerConfirmedSelectionHaptic } from "../utils/confirmedInteractionFeedback";
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
import { formatDisplayClockTime } from "../localization/localization";

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
  const ambient = Platform.OS === "ios";
  const { fontScale } = useWindowDimensions();
  const layout = useResponsiveLayout();
  const items = Object.entries(state.outfit.items).filter((entry) => Boolean(entry[1]));
  const usesWrappedItemGrid = items.length > 3;
  const weatherReasons = buildWeatherReasons(state, theme);
  const ownedItemCount = wardrobeItems.filter((item) => item.owned).length;
  const canSaveDirectly = accountLinked && termsRequiredAccepted;
  const needsTerms = accountLinked && !termsRequiredAccepted;
  const [saveCompletionVisible, setSaveCompletionVisible] = React.useState(false);
  const wasSavedRef = React.useRef(outfitSaved);
  const saveRequestedRef = React.useRef(false);
  const handledSaveResult = React.useRef<typeof accountGateResult>(null);

  React.useEffect(() => {
    const returnedFromSaveFlow =
      accountGateResult?.pendingAction === "save-outfit"
      && accountGateResult.returnTo === "C4";
    if (shouldShowOutfitSaveCompletion(wasSavedRef.current, outfitSaved, accountGateResult)) {
      setSaveCompletionVisible(true);
      if (ambient && outfitSaved && ((saveRequestedRef.current && !wasSavedRef.current) || (returnedFromSaveFlow && handledSaveResult.current !== accountGateResult))) {
        saveRequestedRef.current = false;
        handledSaveResult.current = accountGateResult;
        triggerConfirmedSelectionHaptic();
      }
    }
    wasSavedRef.current = outfitSaved;
    if (returnedFromSaveFlow) onDismissAccountGateResult();
  }, [accountGateResult, onDismissAccountGateResult, outfitSaved]);

  React.useEffect(() => {
    if (!saveCompletionVisible) return undefined;
    const timer = setTimeout(() => setSaveCompletionVisible(false), outfitSaveCompletionDurationMs);
    return () => clearTimeout(timer);
  }, [saveCompletionVisible]);

  const ownershipSummary = <>
          <View style={styles.recommendationHeader}>
            <View style={[styles.recommendationIconWrap, { backgroundColor: theme.cardStrong }]}>
              <Image source={uiIconAssets.check} style={[styles.recommendationIcon, { tintColor: theme.clear }]} resizeMode="contain" />
            </View>
            <View style={styles.recommendationCopy}>
              <Text style={[styles.recommendationTitle, { color: theme.text }, ambient && pageStyles.body]}>추천 품목 {state.outfit.preparation.totalItemCount}개 중 {state.outfit.preparation.ownedItemCount}개 보유</Text>
              <Text style={[styles.recommendationCaption, pageStyles.compactCaption, { color: theme.muted }]}>{getOutfitVariantLabel(state.outfit.variant)} 중심의 규칙 기반 추천이에요. 보유 수는 날씨 적합도 점수가 아니에요.</Text>
            </View>
          </View>
          {state.outfit.preparation.missingItemNames.length > 0 ? (
            <Text style={[pageStyles.compactCaption, { color: theme.warm }]}>추가 준비: {state.outfit.preparation.missingItemNames.join(", ")}</Text>
          ) : null}
          {state.outfit.preparation.rainProtectionGaps.length > 0 ? (
            <Text style={[pageStyles.compactCaption, { color: theme.warm }]}>온열 조건에 맞는 비 대응 품목이 부족해요: {state.outfit.preparation.rainProtectionGaps.map(getOutfitSlotLabel).join(", ")}. 별도 비 대비가 필요해요.</Text>
          ) : null}
  </>;

  return (
    <AppScreen
      title="코디 상세"
      badge="추천 코디"
      onBack={onGoBack}
      showWordmark={false}
      compactHeader
      contentPaddingTop={layout.weatherTopPadding}
      contentGap={layout.destinationContentGap}
      contentPaddingBottom={0}
    >
      {state.outfitContext ? <Text style={[pageStyles.compactCaption, { color: theme.muted }]}>{state.outfitContext.status}{state.outfitContext.observedLabel ? <Text>{` · 관측 ${state.outfitContext.observedLabel}`}</Text> : null}</Text> : null}
      <Section title={ambient ? state.outfit.decisionText : "오늘 입기 좋은 세트"} caption={ambient ? undefined : state.outfit.decisionText} accent="clear">
        <View style={styles.outfitRail}>
          {items.map(([slot, item]) => {
            const imageSource = getOutfitImageSource(item?.imageUrl);
            return item ? (
              <View
                key={slot}
                accessible
                accessibilityLabel={`${getOutfitSlotLabel(slot)} ${item.name} · ${item.owned ? "보유" : "추가 준비"}`}
                style={[
                  styles.outfitMiniTile,
                  usesWrappedItemGrid
                    ? styles.outfitMiniTileGrid
                    : styles.outfitMiniTileFlexible,
                  {
                    minHeight: ambient ? 0 : layout.outfitDetailCardMinHeight,
                    backgroundColor: theme.cardMuted,
                    borderColor: theme.border,
                  },
                  ambient && { backgroundColor: "transparent", borderWidth: 0, padding: 0, justifyContent: "flex-start", width: fontScale > 1.5 ? "100%" : "47%", flex: 0 },
                ]}
              >
                <View
                  style={[
                    styles.outfitImageFrame,
                    { height: ambient ? 150 : layout.outfitDetailImageHeight, backgroundColor: ambient ? "transparent" : theme.card },
                  ]}
                >
                  {imageSource ? (
                    <Image
                      source={imageSource}
                      style={[styles.outfitImage, { height: ambient ? (slot === "shoes" ? 100 : 146) : Math.max(40, layout.outfitDetailImageHeight - 4) }]}
                      resizeMode="contain"
                    />
                  ) : (
                    <Image source={uiIconAssets.shirt} style={[styles.outfitFallbackIcon, { tintColor: theme.clear }]} resizeMode="contain" />
                  )}
                </View>
                <Text style={[styles.itemSlot, pageStyles.compactCaption, { color: theme.clear }]} numberOfLines={1}>{getOutfitSlotLabel(slot)}</Text>
                <Text style={[pageStyles.compactCaption, { color: theme.text }]}>{item.name}</Text>
                <View style={ambient ? { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 14, backgroundColor: theme.cardMuted, paddingHorizontal: 10, paddingVertical: 5 } : undefined}>
                  {ambient ? <Image source={item.owned ? ambientUiIcons.check : ambientUiIcons.add} style={{ width: 16, height: 16, tintColor: item.owned ? theme.muted : theme.warm }} /> : null}
                  <Text style={[pageStyles.compactCaption, { color: item.owned ? theme.muted : theme.warm }]}>{item.owned ? "보유" : "추가 준비"}</Text>
                </View>
              </View>
            ) : null;
          })}
        </View>
        {ambient ? <View style={{ gap: 12, paddingVertical: 12 }}>
          {ownershipSummary}
        </View> : null}
        <View style={[styles.detailHeading, ambient && { marginTop: 8 }]}>
          <Text style={[styles.detailTitle, { color: theme.text }, ambient && pageStyles.sectionTitle]}>이 시간엔 이렇게 입어요</Text>
          <Text style={[styles.detailCaption, pageStyles.compactCaption, { color: theme.muted }]}>앞으로 3시간</Text>
        </View>
        <View style={[styles.timeAdviceRow, ambient && { flexDirection: "column", flexWrap: "nowrap", alignItems: "stretch", width: "100%", gap: 0 }]}>
          {state.outfit.timeAdvice.slice(0, 3).map((item) => {
            const weatherHour = state.weather.hourly.find((hour) => hour.time === item.time);
            const presentation = getTimeAdvicePresentation(weatherHour?.rainProbabilityPct ?? 0, weatherHour?.tempC ?? state.weather.current.tempC, theme);
            return (
              <View
                key={item.time}
                accessible
                accessibilityLabel={`${formatAdviceTime(item.time)} ${ambient ? item.text : presentation.copy}`}
                style={[styles.timeAdviceCard, { backgroundColor: theme.cardMuted, borderColor: theme.border }, ambient && { flex: 0, width: "100%", backgroundColor: "transparent", borderWidth: 0, borderTopWidth: StyleSheet.hairlineWidth, borderRadius: 0, paddingVertical: 16, gap: 8 }]}
              >
                {ambient ? <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <Image source={presentation.icon === uiIconAssets.rain ? ambientUiIcons.umbrella : presentation.icon === uiIconAssets.shirt ? ambientUiIcons.tabOutfit : ambientUiIcons.check} style={{ width: 28, height: 28, tintColor: presentation.color }} resizeMode="contain" />
                  <Text style={[pageStyles.body, { color: theme.text, flex: 1 }]}>{item.text}</Text>
                  <Text style={[pageStyles.body, { color: theme.muted }]}>{formatAdviceTime(item.time)}</Text>
                </View> : <>
                <View style={styles.timeAdviceHeader}>
                  <Image source={presentation.icon} style={[styles.timeAdviceIcon, ambient && { width: 26, height: 26 }, { tintColor: presentation.color }]} resizeMode="contain" />
                  <Text style={[styles.timeAdviceTime, ambient ? pageStyles.body : pageStyles.compactCaption, { color: theme.gold }]}>{formatAdviceTime(item.time)}</Text>
                </View>
                <Text style={[pageStyles.compactCaption, styles.timeAdviceCopy, ambient && { ...pageStyles.body, minHeight: 0 }, { color: theme.text }]}>{presentation.copy}</Text>
                </>}
              </View>
            );
          })}
        </View>

        <View style={[styles.recommendationPanel, { backgroundColor: theme.cardMuted, borderColor: theme.border }, ambient && { backgroundColor: "transparent", borderWidth: 0, padding: 0, gap: 18 }]}>
          {!ambient ? <>
          {ownershipSummary}
          </> : <Text style={[pageStyles.sectionTitle, { color: theme.text }]}>날씨 근거</Text>}
          <View style={[styles.reasonGrid, ambient && { flexDirection: "column", flexWrap: "nowrap", alignItems: "stretch", width: "100%", gap: 0 }]}>
            {weatherReasons.map((reason) => (
              <View key={reason.label} style={[styles.reasonTile, { backgroundColor: theme.card, borderColor: theme.border }, ambient && { flex: 0, width: "100%", backgroundColor: "transparent", borderWidth: 0, borderTopWidth: StyleSheet.hairlineWidth, borderRadius: 0, paddingVertical: 16, gap: 8 }]}>
                {ambient ? <>
                  <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <Image source={ambientUiIcons[reason.kind]} style={{ width: 26, height: 26, tintColor: theme.muted }} resizeMode="contain" />
                    <Text style={[pageStyles.body, { color: theme.muted, flexGrow: 1 }]}>{reason.label}</Text>
                    <Text style={{ color: theme.text, fontSize: 23, lineHeight: 30, fontWeight: "600" }}>{reason.value}</Text>
                  </View>
                  <Text style={[pageStyles.caption, { color: theme.muted, paddingLeft: 38 }]}>{reason.detail}</Text>
                </> : <>
                <View style={styles.reasonLabelRow}>
                  <Image source={ambient ? ambientUiIcons[reason.kind] : reason.icon} style={[styles.reasonIcon, ambient && { width: 26, height: 26 }, { tintColor: reason.color }]} resizeMode="contain" />
                  <Text numberOfLines={1} style={[styles.reasonLabel, pageStyles.compactCaption, { color: theme.subtle }]}>{reason.label}</Text>
                </View>
                <Text style={[styles.reasonValue, { color: theme.text }, ambient && { fontSize: 23, lineHeight: 30, fontWeight: "600" }]} numberOfLines={1}>{reason.value}</Text>
                <Text style={[pageStyles.compactCaption, styles.reasonDetail, { color: theme.muted }]}>{reason.detail}</Text>
                </>}
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

      <AmbientControlSurface>
      <Section title="저장 및 내 옷장" caption={`보유 ${ownedItemCount}개 · 추천에 반영됨`} accent="clear" compact contentGap={spacing.xs}>
        <CompletionStatus
          visible={saveCompletionVisible}
          compact
          title="코디 저장 완료"
          message="저장한 코디는 코디 탭에서 계속 확인할 수 있어요"
        />
        <AppButton
          label={outfitSaved ? "저장 완료" : canSaveDirectly ? "코디 저장" : needsTerms ? "약관 동의 후 저장" : "계정 연결 후 저장"}
          hapticFeedback={ambient ? "none" : "automatic"}
          onPress={() => { saveRequestedRef.current = true; onRequireAccount("save-outfit", "C4"); }}
          tone={outfitSaved ? "secondary" : "warning"}
          disabled={outfitSaved}
          size="sm"
        />
        <View style={styles.actions}>
          <AppButton label="내 옷장 보기" onPress={() => onNavigate("C2")} tone="secondary" variant="outlined" size="sm" />
          <AppButton label="아이템 추가" onPress={onOpenWardrobeAdd} tone="secondary" variant="outlined" size="sm" />
        </View>
      </Section>
      </AmbientControlSurface>
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
    columnGap: spacing.xs,
    rowGap: spacing.xs,
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
    width: "23.5%",
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
    gap: spacing.xs,
    flexWrap: "wrap",
  },
});

function buildWeatherReasons(state: P0ScreenProps["state"], theme: ReturnType<typeof useAppTheme>) {
  const rainProbability = getRainSignalPct(state);
  const windSpeed = state.weather.current.windMs;
  const feelsLikeDelta = Math.round(state.weather.current.feelsLikeC - state.weather.current.tempC);
  return [
    {
      kind: "temperature" as const,
      label: state.outfitContext?.temperature?.basis === "air" ? "현재 기온" : "체감 온도",
      value: state.outfitContext ? state.outfitContext.temperature ? `${Math.round(state.outfitContext.temperature.value)}도` : "확인 필요" : `${Math.round(state.weather.current.feelsLikeC)}도`,
      detail: state.outfitContext ? !state.outfitContext.temperature ? "온도 정보 없음" : !state.outfitContext.reliable ? "최근 관측 기준" : state.outfitContext.temperature.basis === "air" ? "현재 기온 기준" : "현재 체감 기준" : feelsLikeDelta === 0
        ? "딱 쾌적해요"
        : feelsLikeDelta > 0
          ? `${feelsLikeDelta}도 더 더워요`
          : `${Math.abs(feelsLikeDelta)}도 더 선선해요`,
      icon: uiIconAssets.uv,
      color: theme.gold,
    },
    {
      kind: "umbrella" as const,
      label: "비 가능성",
      value: state.outfitContext && (!state.outfitContext.reliable || !state.outfitContext.complete) ? "예보 확인 필요" : rainProbability > 0 ? `최대 ${Math.round(rainProbability)}%` : "비 없음",
      detail: state.outfitContext ? state.outfitContext.status : rainProbability >= 50 ? "우산 챙겨요" : rainProbability > 0 ? "가벼운 비예요" : "비 걱정 없어요",
      icon: uiIconAssets.rain,
      color: rainProbability >= 50 ? theme.sky : theme.clear,
    },
    {
      kind: "wind" as const,
      label: "바람",
      value: `${formatWindSpeed(windSpeed)}m/s`,
      detail: windSpeed >= 8 ? "바람이 세요" : windSpeed >= 4 ? "산들바람이에요" : "바람이 잔잔해요",
      icon: uiIconAssets.wind,
      color: windSpeed >= 8 ? theme.gold : theme.sky,
    },
  ];
}

function getRainSignalPct(state: P0ScreenProps["state"]) {
  const weather = state.outfitContext?.weather ?? state.weather;
  return Math.round(
    Math.max(
      weather.current.rainProbabilityPct,
      ...weather.hourly.map((item) => item.rainProbabilityPct),
    ),
  );
}

function formatAdviceTime(value: string) {
  return formatDisplayClockTime(value);
}

function getTimeAdvicePresentation(rainProbabilityPct: number, tempC: number, theme: ReturnType<typeof useAppTheme>) {
  if (rainProbabilityPct >= 60) {
    return { copy: "우산·방수 챙겨요", icon: uiIconAssets.rain, color: theme.sky };
  }
  if (tempC < 18) {
    return { copy: "겉옷을 더해요", icon: uiIconAssets.shirt, color: theme.gold };
  }
  return { copy: "지금 세트 그대로", icon: uiIconAssets.check, color: theme.clear };
}

function formatWindSpeed(value: number) {
  return value >= 10 ? Math.round(value).toString() : value.toFixed(1);
}
