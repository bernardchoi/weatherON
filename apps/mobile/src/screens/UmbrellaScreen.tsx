import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import { WeatherSummary } from "../components/WeatherSummary";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, radius, spacing } from "../theme/tokens";

export function UmbrellaScreen({
  state,
  useDestinationWeather,
  umbrellaReviewed,
  onToggleWeather,
  onReviewUmbrella,
  onNavigate,
  onOpenAlertSettings,
}: P0ScreenProps) {
  return (
    <AppScreen title="우산 추천" subtitle="H1 카드는 확인 후 숨기고, H3/M2 이력은 유지하는 기준" badge="H4">
      <WeatherSummary weather={state.weather} useDestinationWeather={useDestinationWeather} onToggleWeather={onToggleWeather} />

      <Section title={state.umbrella.title} caption={state.umbrella.reason}>
        <View style={styles.heroCard}>
          <Text style={styles.level}>{state.umbrella.level.toUpperCase()}</Text>
          <Text style={styles.copy}>
            강수량 {state.weather.current.precipitationMm}mm · 강수확률 {state.weather.current.rainProbabilityPct}% · 바람{" "}
            {state.weather.current.windMs.toFixed(1)}m/s
          </Text>
        </View>
        <View style={styles.actions}>
          <AppButton label={umbrellaReviewed ? "확인됨" : "확인 완료"} onPress={onReviewUmbrella} />
          <AppButton label="강수 타임라인" onPress={() => onNavigate("H5")} tone="secondary" />
        </View>
      </Section>

      <Section title="알림 연결" caption="필요 시 M2에서 우산·강수 알림 기준을 조정함">
        <View style={styles.pillRow}>
          <StatusPill label="H1 카드 숨김" tone={umbrellaReviewed ? "clear" : "warm"} />
          <StatusPill label="H5 딥링크" tone="sky" />
        </View>
        <AppButton label="알림 설정으로 이동" onPress={() => onOpenAlertSettings("H4", "umbrella")} tone="secondary" />
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  level: {
    color: appColors.clear,
    fontSize: 22,
    fontWeight: "900",
  },
  copy: {
    color: appColors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
