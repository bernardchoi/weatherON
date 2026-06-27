import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, radius, spacing } from "../theme/tokens";

export function RainTimelineScreen({ state, onNavigate, onOpenAlertSettings }: P0ScreenProps) {
  return (
    <AppScreen title="강수 타임라인" subtitle="시간별 강수 신호를 H4 우산 판단과 같은 데이터로 표시함" badge="H5">
      <Section title={state.weather.locationName} caption={`${state.weather.source} · ${state.weather.stale ? "최근 캐시" : "현재 기준"}`}>
        {state.weather.hourly.map((hour) => (
          <View key={hour.time} style={styles.hourRow}>
            <Text style={styles.time}>{hour.time}</Text>
            <View style={styles.track}>
              <View style={[styles.bar, { width: `${Math.max(8, Math.min(hour.rainProbabilityPct, 100))}%` }]} />
            </View>
            <Text style={styles.percent}>{hour.rainProbabilityPct}%</Text>
          </View>
        ))}
      </Section>

      <Section title="판단 연결" caption={state.umbrella.reason}>
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>{state.umbrella.title}</Text>
          <Text style={styles.summaryCopy}>강수량과 지속 시간을 기준으로 우산 크기와 우비 필요 여부를 판단함</Text>
        </View>
        <View style={styles.actions}>
          <AppButton label="우산 추천" onPress={() => onNavigate("H4")} />
          <AppButton label="알림 설정" onPress={() => onOpenAlertSettings("H5", "rain")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hourRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 40,
  },
  time: {
    width: 52,
    color: appColors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  track: {
    flex: 1,
    height: 10,
    overflow: "hidden",
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  bar: {
    height: "100%",
    borderRadius: radius.sm,
    backgroundColor: appColors.clear,
  },
  percent: {
    width: 42,
    color: appColors.muted,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
  },
  summary: {
    gap: 4,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  summaryTitle: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  summaryCopy: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
