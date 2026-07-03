import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

const contentCards = [
  { label: "출발 판단", title: "10:50 출발", body: "목적지 13:00 도착 · 여유 10분" },
  { label: "비 그침", title: "21:00 완화", body: "강수 타임라인에서 알림 조정" },
  { label: "챙길 것", title: "우산 · 방수 신발", body: "비 신호 기준 준비" },
  { label: "확장 예정", title: "여행·AI·소셜", body: "MVP 검증 이후 노출 확대" },
];

export function AdPlacementScreen({ onNavigate }: P0ScreenProps) {
  const theme = useAppTheme();
  return (
    <AppScreen title="광고 배치 기준" subtitle="콘텐츠와 광고를 명확히 구분" badge="광고">
      <View style={[styles.homePreview, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
        <Text style={[styles.previewLocation, { color: theme.text }]}>서울 마포구 합정동</Text>
        <Text style={[styles.previewTemp, { color: theme.text }]}>22°</Text>
        <Text style={[styles.previewCondition, { color: theme.muted }]}>맑음</Text>
        <View style={[styles.recommendCard, { backgroundColor: theme.cardSoft, borderColor: theme.sky }]}>
          <Text style={[styles.smallLabel, { color: theme.sky }]}>출발 판단</Text>
          <Text style={[styles.cardTitle, { color: theme.text }]}>10:50 출발 · 21:00 비 완화</Text>
          <Text style={[styles.body, { color: theme.muted }]}>목적지 도착 시간과 강수 타임라인 기준</Text>
        </View>
        <View style={[styles.adSlot, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
          <Text style={[styles.slotText, { color: theme.subtle }]}>광고 · 네이티브 광고</Text>
        </View>
      </View>

      <View style={styles.contentStack}>
        {contentCards.slice(1).map((item) => (
          <View key={item.label} style={[styles.contentCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <View style={styles.copy}>
              <Text style={[styles.smallLabel, { color: item.label === "확장 예정" ? theme.subtle : theme.gold }]}>{item.label}</Text>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.body, { color: theme.muted }]}>{item.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <Section title="광고 상태" caption="네이티브 광고 1개 · 광고 라벨 표시 · 노출 대기" accent="gold">
        <View style={styles.ruleGrid}>
          <RulePill label="버튼 인접 배치 금지" />
          <RulePill label="푸시 내부 광고 금지" />
          <RulePill label="광고 라벨 유지" />
        </View>
        <View style={styles.actions}>
          <AppButton label="광고 동의" onPress={() => onNavigate("R3")} />
          <AppButton label="정책 허브" onPress={() => onNavigate("R1")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

function RulePill({ label }: { label: string }) {
  return (
    <View style={styles.rulePill}>
      <StatusPill label={label} tone="sky" />
    </View>
  );
}

const styles = StyleSheet.create({
  homePreview: {
    minHeight: 330,
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  previewLocation: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  previewTemp: {
    fontSize: 58,
    lineHeight: 64,
    fontWeight: "900",
  },
  previewCondition: {
    fontSize: 14,
    fontWeight: "900",
  },
  recommendCard: {
    width: "100%",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  adSlot: {
    width: "100%",
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  slotText: {
    fontSize: 12,
    fontWeight: "800",
  },
  contentStack: {
    gap: spacing.sm,
  },
  contentCard: {
    minHeight: 76,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  copy: {
    gap: spacing.xs,
  },
  smallLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
  },
  body: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  ruleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  rulePill: {
    minHeight: 30,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
