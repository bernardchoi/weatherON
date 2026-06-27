import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { OutfitGrid } from "../components/OutfitGrid";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import { WeatherSummary } from "../components/WeatherSummary";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, spacing } from "../theme/tokens";

export function OutfitScreen({
  state,
  useDestinationWeather,
  outfitSaved,
  styleProfileSaved,
  selectedStyles,
  wardrobeItems,
  onToggleWeather,
  onNavigate,
}: P0ScreenProps) {
  const ownedItemCount = wardrobeItems.filter((item) => item.owned).length;
  return (
    <AppScreen title="오늘 코디" subtitle="날씨 룰엔진 기준으로 지금 입을 세트를 먼저 제안함" badge={`${state.outfit.matchPct}%`}>
      <WeatherSummary weather={state.weather} useDestinationWeather={useDestinationWeather} onToggleWeather={onToggleWeather} />

      <Section title={state.outfit.decisionText} caption={`룰 버전 ${state.outfit.ruleVersion}`}>
        <OutfitGrid outfit={state.outfit} />
        <View style={styles.pillRow}>
          <StatusPill label={state.outfit.variant.toUpperCase()} tone="clear" />
          <StatusPill
            label={ownedItemCount > 0 ? "내 옷장 반영됨" : "기본 프리셋 기준"}
            tone={ownedItemCount > 0 ? "clear" : "gold"}
          />
          <StatusPill label={outfitSaved ? "저장 완료" : "저장 전"} tone={outfitSaved ? "clear" : "sky"} />
        </View>
        {state.outfit.reasons.map((reason) => (
          <Text key={reason} style={styles.reason}>· {reason}</Text>
        ))}
        <View style={styles.actions}>
          <AppButton label="상세 보기" onPress={() => onNavigate("C4")} />
          <AppButton label="우산 확인" onPress={() => onNavigate("H4")} tone="secondary" />
        </View>
      </Section>

      <Section title="시간대 판단" caption="현재는 fallback 샘플 데이터 기준">
        {state.outfit.timeAdvice.map((item) => (
          <View key={item.time} style={styles.timelineRow}>
            <Text style={styles.time}>{item.time}</Text>
            <Text style={styles.timelineText}>{item.text}</Text>
          </View>
        ))}
      </Section>

      <Section title="스타일 기준" caption={styleProfileSaved ? selectedStyles.join(" · ") : "O4에서 추천 기준 저장 필요"}>
        <View style={styles.actions}>
          <AppButton label="스타일 기준 수정" onPress={() => onNavigate("O4")} />
          <AppButton label="MY" onPress={() => onNavigate("M1")} tone="secondary" />
          <AppButton label="옷장" onPress={() => onNavigate("C2")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  reason: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  time: {
    width: 58,
    color: appColors.clear,
    fontSize: 13,
    fontWeight: "900",
  },
  timelineText: {
    flex: 1,
    color: appColors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
});
