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
  { label: "AI 장소 추천", title: "오늘 이 날씨엔 합정동 카페 어때요?", body: "맑음 · 기온 22도 · 탭해서 더보기" },
  { label: "코디·우산·신발", title: "트렌치코트 + 슬랙스", body: "우산 불필요 · 로우컷 스니커즈" },
  { label: "출발 시각", title: "목적지 등록 시 10:50 출발 안내", body: "스마트 케어 알림과 연동" },
];

export function AdPlacementScreen({ onNavigate }: P0ScreenProps) {
  const theme = useAppTheme();
  return (
    <AppScreen title="광고 배치 기준" subtitle="콘텐츠와 광고를 명확히 구분하는 승인 전 점검" badge="광고">
      <View style={[styles.homePreview, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
        <Text style={[styles.previewLocation, { color: theme.text }]}>서울 마포구 합정동</Text>
        <Text style={[styles.previewTemp, { color: theme.text }]}>22°</Text>
        <Text style={[styles.previewCondition, { color: theme.muted }]}>맑음</Text>
        <View style={[styles.recommendCard, { backgroundColor: theme.cardSoft, borderColor: theme.sky }]}>
          <Text style={[styles.smallLabel, { color: theme.sky }]}>AI 장소 추천</Text>
          <Text style={[styles.cardTitle, { color: theme.text }]}>오늘 이 날씨엔 합정동 카페 어때요?</Text>
          <Text style={[styles.body, { color: theme.muted }]}>맑음 · 기온 22도 · 탭해서 더보기</Text>
        </View>
        <View style={[styles.adSlot, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
          <Text style={[styles.slotText, { color: theme.subtle }]}>광고 · 네이티브 광고</Text>
        </View>
      </View>

      <View style={styles.contentStack}>
        {contentCards.slice(1).map((item) => (
          <View key={item.label} style={[styles.contentCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <View style={styles.copy}>
              <Text style={[styles.smallLabel, { color: theme.gold }]}>{item.label}</Text>
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
