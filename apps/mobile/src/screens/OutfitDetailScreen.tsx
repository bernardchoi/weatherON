import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { CompletionStatus } from "../components/CompletionStatus";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import { outfitImageAssets, uiIconAssets } from "../assets";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";
import { getOutfitSlotLabel, getOutfitVariantLabel } from "../utils/outfitLabels";

const AI_RECOMPOSE_VISIBLE = false;

export function OutfitDetailScreen({
  state,
  accountLinked,
  termsRequiredAccepted,
  outfitSaved,
  wardrobeItems,
  onNavigate,
  onRequireAccount,
  onGoBack,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const items = Object.entries(state.outfit.items).filter((entry) => Boolean(entry[1]));
  const usesWrappedItemGrid = items.length > 3;
  const signalMetrics = buildSignalMetrics(state, theme);
  const rainSignalPct = getRainSignalPct(state);
  const ownedItemCount = wardrobeItems.filter((item) => item.owned).length;
  const canSaveDirectly = accountLinked && termsRequiredAccepted;
  const needsTerms = accountLinked && !termsRequiredAccepted;

  return (
    <AppScreen
      title="코디 상세"
      subtitle={state.outfit.decisionText}
      badge={`${state.outfit.matchPct}%`}
      onBack={onGoBack}
      showWordmark={false}
      compactHeader
      footer={
        <View style={styles.footer}>
          <CompletionStatus
            visible={outfitSaved}
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
      <Section title="오늘 입을 세트" caption="이미지로 확인" accent="clear">
        <View style={styles.outfitRail}>
          {items.map(([slot, item]) =>
            item ? (
              <View
                key={slot}
                accessible
                accessibilityLabel={`${getOutfitSlotLabel(slot)} ${item.name}`}
                style={[
                  styles.outfitMiniTile,
                  usesWrappedItemGrid ? styles.outfitMiniTileGrid : styles.outfitMiniTileFlexible,
                  { backgroundColor: theme.cardMuted, borderColor: theme.border },
                ]}
              >
                <View style={[styles.outfitImageFrame, { backgroundColor: theme.card }]}>
                  {item.imageUrl && outfitImageAssets[item.imageUrl] ? (
                    <Image source={outfitImageAssets[item.imageUrl]} style={styles.outfitImage} resizeMode="contain" />
                  ) : (
                    <Image source={uiIconAssets.shirt} style={[styles.outfitFallbackIcon, { tintColor: theme.clear }]} resizeMode="contain" />
                  )}
                </View>
                <Text style={[styles.itemSlot, { color: theme.clear }]} numberOfLines={1}>{getOutfitSlotLabel(slot)}</Text>
              </View>
            ) : null,
          )}
        </View>
        <View style={styles.timeChipRow}>
          {state.outfit.timeAdvice.slice(0, 3).map((item) => (
            <View key={item.time} style={[styles.timeChip, { backgroundColor: theme.cardMuted }]}>
              <Text style={[styles.timeChipTime, { color: theme.gold }]}>{formatAdviceTime(item.time)}</Text>
              <View style={[styles.timeSignal, { backgroundColor: theme.clear }]} />
              <Text numberOfLines={1} style={[styles.timeChipText, { color: theme.text }]}>{getTimeAdviceLabel(item.text)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.pillRow}>
          <StatusPill label={getOutfitVariantLabel(state.outfit.variant)} tone="clear" />
          <StatusPill label={formatTempLabel(state.weather.current.tempC, state.weather.current.feelsLikeC)} tone="sky" />
          <StatusPill label={rainSignalPct > 0 ? "비 신호" : "비 없음"} tone="gold" />
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

      <Section title="추천 근거" caption="신호 압축" accent="gold">
        <View style={styles.signalGrid}>
          {signalMetrics.map((metric) => (
            <View key={metric.label} style={[styles.signalTile, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
              <Image source={metric.icon} style={[styles.signalIcon, { tintColor: metric.color }]} resizeMode="contain" />
              <Text style={[styles.signalLabel, { color: theme.subtle }]}>{metric.label}</Text>
              <Text style={[styles.signalValue, { color: theme.text }]} numberOfLines={1}>{metric.value}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="내 옷장" caption={`보유 ${ownedItemCount}개 · 추천에 반영됨`} accent="clear">
        <View style={styles.actions}>
          <AppButton label="내 옷장 보기" onPress={() => onNavigate("C2")} tone="secondary" />
          <AppButton label="아이템 추가" onPress={() => onNavigate("C3")} tone="warning" />
        </View>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  timeChipRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  timeChip: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
  },
  timeChipTime: {
    fontSize: 11,
    fontWeight: "900",
  },
  timeChipText: {
    maxWidth: "100%",
    fontSize: 10,
    fontWeight: "900",
  },
  timeSignal: {
    width: 22,
    height: 4,
    borderRadius: radius.pill,
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
    width: "31.4%",
  },
  outfitImageFrame: {
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  outfitImage: {
    width: "92%",
    height: 46,
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
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
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
  signalGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signalTile: {
    width: "23.5%",
    minHeight: 68,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  signalIcon: {
    width: 18,
    height: 18,
  },
  signalLabel: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
  },
  signalValue: {
    maxWidth: "100%",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "900",
  },
});

function buildSignalMetrics(state: P0ScreenProps["state"], theme: ReturnType<typeof useAppTheme>) {
  const rainProbability = getRainSignalPct(state);
  const windSpeed = state.weather.current.windMs;
  const feelsLikeDelta = Math.round(state.weather.current.feelsLikeC - state.weather.current.tempC);
  return [
    {
      label: "매칭",
      value: `${state.outfit.matchPct}%`,
      icon: uiIconAssets.check,
      color: theme.clear,
    },
    {
      label: "체감",
      value: feelsLikeDelta === 0 ? "비슷" : feelsLikeDelta > 0 ? `+${feelsLikeDelta}도` : `${feelsLikeDelta}도`,
      icon: uiIconAssets.uv,
      color: theme.gold,
    },
    {
      label: "강수",
      value: rainProbability > 0 ? `${Math.round(rainProbability)}%` : "없음",
      icon: uiIconAssets.rain,
      color: rainProbability >= 50 ? theme.sky : theme.clear,
    },
    {
      label: "바람",
      value: windSpeed >= 8 ? "강함" : windSpeed >= 4 ? "보통" : "약함",
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

function getTimeAdviceLabel(value: string) {
  if (value.includes("우산") || value.includes("비")) return "비 대비";
  if (value.includes("겉옷") || value.includes("쌀쌀")) return "겉옷";
  if (value.includes("그대로") || value.includes("좋아요")) return "유지";
  return "확인";
}

function formatTempLabel(tempC: number, feelsLikeC: number) {
  const temp = Math.round(tempC);
  const feelsLike = Math.round(feelsLikeC);
  return temp === feelsLike ? `${temp}도` : `${temp}도 · 체감 ${feelsLike}도`;
}
