import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, spacing } from "../theme/tokens";

const guideItems = [
  { id: "rain", title: "비 대비", text: "해변 목적지는 바람과 체감온도까지 같이 확인" },
  { id: "shoes", title: "신발", text: "젖은 노면 가능성이 있으면 방수 스니커즈 우선" },
  { id: "departure", title: "출발", text: "도착 목표 13:00 기준, 이동 180분 전 준비 알림" },
];

export function DestinationGuideScreen({ state, onNavigate }: P0ScreenProps) {
  const care = state.destinationCare;

  return (
    <AppScreen title="준비 가이드" subtitle="목적지 카테고리별 행동 가이드. P2 범위" badge="P2">
      <Section title={`${care.name} 준비`} caption={care.nextAlertText}>
        {guideItems.map((item) => (
          <View key={item.id} style={styles.guideRow}>
            <View style={styles.copy}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.text}>{item.text}</Text>
            </View>
            <StatusPill label="확인" tone="sky" />
          </View>
        ))}
      </Section>

      <Section title="연결 화면" caption="G2 케어 판단과 P3 필터 허브로 이어짐">
        <View style={styles.actions}>
          <AppButton label="케어 보기" onPress={() => onNavigate("G2")} />
          <AppButton label="허브 보기" onPress={() => onNavigate("P3")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  guideRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  copy: {
    flex: 1,
  },
  title: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  text: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
