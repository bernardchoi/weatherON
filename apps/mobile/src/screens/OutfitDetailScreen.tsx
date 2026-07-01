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

export function OutfitDetailScreen({ state, accountLinked, termsRequiredAccepted, outfitSaved, accountGateResult, onNavigate, onRequireAccount }: P0ScreenProps) {
  const theme = useAppTheme();
  const items = Object.entries(state.outfit.items).filter((entry) => Boolean(entry[1]));
  const heroItems = items.filter(([slot]) => slot !== "accessory").slice(0, 4);
  const canSaveDirectly = accountLinked && termsRequiredAccepted;
  const needsTerms = accountLinked && !termsRequiredAccepted;

  return (
    <AppScreen title="코디 상세" subtitle={state.outfit.decisionText} badge={`${state.outfit.matchPct}%`}>
      <Section title={state.outfit.decisionText} caption="아이템별 추천 근거와 시간대 판단" accent="clear">
        <View style={styles.heroGrid}>
          {heroItems.map(([slot, item]) =>
            item ? (
              <View key={slot} style={[styles.heroTile, { backgroundColor: theme.cardStrong }]}>
                {item.imageUrl && outfitImageAssets[item.imageUrl] ? (
                  <Image source={outfitImageAssets[item.imageUrl]} style={styles.heroImage} resizeMode="contain" />
                ) : (
                  <Text style={[styles.thumbText, { color: theme.clear }]}>{getOutfitSlotLabel(slot)}</Text>
                )}
              </View>
            ) : null,
          )}
        </View>
        <View style={styles.timeChipRow}>
          {state.outfit.timeAdvice.slice(0, 3).map((item) => (
            <View key={item.time} style={[styles.timeChip, { backgroundColor: theme.cardStrong }]}>
              <Text style={[styles.timeChipTime, { color: theme.gold }]}>{formatAdviceTime(item.time)}</Text>
              <Text numberOfLines={1} style={[styles.timeChipText, { color: theme.text }]}>{item.text}</Text>
            </View>
          ))}
        </View>
        <View style={styles.pillRow}>
          <StatusPill label={getOutfitVariantLabel(state.outfit.variant)} tone="clear" />
          <StatusPill label={`${Math.round(state.weather.current.tempC)}도~${Math.round(state.weather.current.feelsLikeC)}도`} tone="sky" />
          <StatusPill label={state.weather.current.rainProbabilityPct > 0 ? "비 신호" : "비 없음"} tone="gold" />
        </View>
      </Section>

      <Section title="착장 구성" caption="저장 전 각 아이템을 확인" accent="sky">
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
                <Text style={[styles.itemMeta, { color: theme.muted }]}>
                  {formatOutfitTags(item.purposes)} · {formatOutfitTags(item.weatherTags)}
                </Text>
              </View>
            </View>
          ) : null,
        )}
      </Section>

      <Section title="추천 근거" caption={`매칭률 ${state.outfit.matchPct}%`} accent="gold">
        {state.outfit.reasons.map((reason) => (
          <Text key={reason} style={[styles.reason, { color: theme.muted }]}>· {reason}</Text>
        ))}
      </Section>

      <Section title="저장 흐름" caption={outfitSaved ? "코디 저장 완료. 추천 목록과 상세가 같은 상태를 공유함" : "저장하려면 계정 연결 화면으로 이동해야 함"} accent="warm">
        {accountGateResult?.returnTo === "C4" && accountGateResult.pendingAction === "save-outfit" ? (
          <View style={[styles.resultBox, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
            <Text style={[styles.resultTitle, { color: theme.clear }]}>{accountGateResult.message}</Text>
            <Text style={[styles.resultCopy, { color: theme.muted }]}>계정 연결과 약관 동의 후 저장 상태로 복귀함</Text>
          </View>
        ) : null}
        <View style={styles.pillRow}>
          <StatusPill label={accountLinked ? "계정 연결됨" : "계정 필요"} tone={accountLinked ? "clear" : "gold"} />
          <StatusPill label={termsRequiredAccepted ? "약관 완료" : "약관 필요"} tone={termsRequiredAccepted ? "clear" : "warm"} />
          <StatusPill label={outfitSaved ? "저장 완료" : "저장 가능"} tone={outfitSaved ? "clear" : "sky"} />
        </View>
        <View style={styles.actions}>
          <AppButton
            label={outfitSaved ? "저장 완료" : canSaveDirectly ? "코디 저장" : needsTerms ? "약관 동의 후 저장" : "계정 연결 후 저장"}
            onPress={() => onRequireAccount("save-outfit", "C4")}
            tone={outfitSaved ? "secondary" : "warning"}
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
});

function formatAdviceTime(value: string) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return `${String(parsed.getHours()).padStart(2, "0")}:00`;
  }
  const match = value.match(/T(\d{2})/);
  return match ? `${match[1]}:00` : value;
}
