import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import { outfitImageAssets } from "../assets";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";
import { formatOutfitTags, getOutfitSlotLabel, getOutfitVariantLabel } from "../utils/outfitLabels";

const AI_RECOMPOSE_VISIBLE = false;

export function OutfitDetailScreen({
  state,
  accountLinked,
  termsRequiredAccepted,
  outfitSaved,
  accountGateResult,
  wardrobeItems,
  onNavigate,
  onRequireAccount,
  onGoBack,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const items = Object.entries(state.outfit.items).filter((entry) => Boolean(entry[1]));
  const heroItems = items.filter(([slot]) => slot !== "accessory").slice(0, 4);
  const ownedItemCount = wardrobeItems.filter((item) => item.owned).length;
  const canSaveDirectly = accountLinked && termsRequiredAccepted;
  const needsTerms = accountLinked && !termsRequiredAccepted;

  return (
    <AppScreen title="코디 상세" subtitle={state.outfit.decisionText} badge={`${state.outfit.matchPct}%`} onBack={onGoBack}>
      <Section title="오늘 입을 세트" caption="착장 구성과 추천 근거를 함께 확인" accent="clear">
        <View style={styles.heroGrid}>
          {heroItems.map(([slot, item]) =>
            item ? (
              <View key={slot} style={[styles.heroTile, { backgroundColor: theme.cardMuted }]}>
                {item.imageUrl && outfitImageAssets[item.imageUrl] ? (
                  <Image source={outfitImageAssets[item.imageUrl]} style={styles.heroImage} resizeMode="contain" />
                ) : (
                  <Text style={[styles.thumbText, { color: theme.clear }]}>{getOutfitSlotLabel(slot)}</Text>
                )}
              </View>
            ) : null,
          )}
        </View>
        <View style={[styles.itemList, { borderTopColor: theme.border }]}>
          {items.map(([slot, item]) =>
            item ? (
              <View key={slot} style={[styles.itemRow, { borderBottomColor: theme.border }]}>
                <View style={[styles.thumb, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
                  {item.imageUrl && outfitImageAssets[item.imageUrl] ? (
                    <Image source={outfitImageAssets[item.imageUrl]} style={styles.thumbImage} resizeMode="contain" />
                  ) : (
                    <Text style={[styles.thumbText, { color: theme.clear }]}>{getOutfitSlotLabel(slot)}</Text>
                  )}
                </View>
                <View style={styles.itemCopy}>
                  <Text style={[styles.itemSlot, { color: theme.clear }]}>{getOutfitSlotLabel(slot)}</Text>
                  <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                  <Text style={[styles.itemMeta, { color: theme.muted }]} numberOfLines={1}>
                    {formatOutfitTags(item.purposes)} · {formatOutfitTags(item.weatherTags)}
                  </Text>
                </View>
              </View>
            ) : null,
          )}
        </View>
        <View style={styles.timeChipRow}>
          {state.outfit.timeAdvice.slice(0, 3).map((item) => (
            <View key={item.time} style={[styles.timeChip, { backgroundColor: theme.cardMuted }]}>
              <Text style={[styles.timeChipTime, { color: theme.gold }]}>{formatAdviceTime(item.time)}</Text>
              <Text numberOfLines={1} style={[styles.timeChipText, { color: theme.text }]}>{item.text}</Text>
            </View>
          ))}
        </View>
        <View style={styles.pillRow}>
          <StatusPill label={getOutfitVariantLabel(state.outfit.variant)} tone="clear" />
          <StatusPill label={formatTempLabel(state.weather.current.tempC, state.weather.current.feelsLikeC)} tone="sky" />
          <StatusPill label={state.weather.current.rainProbabilityPct > 0 ? "비 신호" : "비 없음"} tone="gold" />
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

      <Section title="추천 근거" caption={`매칭률 ${state.outfit.matchPct}%`} accent="gold">
        {state.outfit.reasons.map((reason) => (
          <Text key={reason} style={[styles.reason, { color: theme.muted }]}>· {reason}</Text>
        ))}
      </Section>

      <Section title="내 옷장" caption={`보유 ${ownedItemCount}개 · 추천에 반영됨`} accent="clear">
        <View style={styles.actions}>
          <AppButton label="내 옷장 보기" onPress={() => onNavigate("C2")} tone="secondary" />
          <AppButton label="아이템 추가" onPress={() => onNavigate("C3")} tone="warning" />
        </View>
      </Section>

      <Section title="저장 흐름" caption={outfitSaved ? "코디가 저장됐어요. 코디 탭에서 계속 확인할 수 있어요" : "저장하려면 계정 연결이 필요해요"} accent="warm">
        {accountGateResult?.returnTo === "C4" && accountGateResult.pendingAction === "save-outfit" ? (
          <View style={[styles.resultBox, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
            <Text style={[styles.resultTitle, { color: theme.clear }]}>{accountGateResult.message}</Text>
            <Text style={[styles.resultCopy, { color: theme.muted }]}>계정 연결과 약관 동의를 확인했어요</Text>
          </View>
        ) : null}
        <View style={styles.pillRow}>
          <StatusPill label={accountLinked ? "계정 연결됨" : "계정 필요"} tone={accountLinked ? "clear" : "gold"} />
          <StatusPill label={termsRequiredAccepted ? "약관 완료" : "약관 필요"} tone={termsRequiredAccepted ? "clear" : "warm"} />
          <StatusPill label={outfitSaved ? "저장 완료" : "저장 가능"} tone={outfitSaved ? "clear" : "sky"} />
        </View>
        <View style={[styles.actions, styles.saveActions]}>
          <AppButton
            label={outfitSaved ? "저장 완료" : canSaveDirectly ? "코디 저장" : needsTerms ? "약관 동의 후 저장" : "계정 연결 후 저장"}
            onPress={() => onRequireAccount("save-outfit", "C4")}
            tone={outfitSaved ? "secondary" : "warning"}
            disabled={outfitSaved}
          />
          <AppButton label="코디로 돌아가기" onPress={() => onNavigate("C1")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  heroTile: {
    width: "48%",
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  heroImage: {
    width: "88%",
    height: 86,
  },
  timeChipRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  timeChip: {
    flex: 1,
    minHeight: 48,
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
    fontSize: 11,
    fontWeight: "900",
  },
  itemList: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  thumb: {
    width: 64,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  thumbImage: {
    width: "88%",
    height: 52,
  },
  thumbText: {
    fontSize: 11,
    fontWeight: "900",
  },
  itemCopy: {
    flex: 1,
  },
  itemSlot: {
    fontSize: 11,
    fontWeight: "900",
  },
  itemName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  itemMeta: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  reason: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
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
  saveActions: {
    paddingBottom: spacing.lg,
  },
});

function formatAdviceTime(value: string) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return `${String(parsed.getHours()).padStart(2, "0")}:00`;
  }
  const match = value.match(/T(\d{2})/);
  return match ? `${match[1]}:00` : value;
}

function formatTempLabel(tempC: number, feelsLikeC: number) {
  const temp = Math.round(tempC);
  const feelsLike = Math.round(feelsLikeC);
  return temp === feelsLike ? `${temp}도` : `${temp}도 · 체감 ${feelsLike}도`;
}
