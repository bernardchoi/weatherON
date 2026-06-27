import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, radius, spacing } from "../theme/tokens";

const featureCards = [
  { title: "Weather ON", body: "현재 위치와 목적지 날씨를 한 화면에서 비교", tone: "sky" as const },
  { title: "Outfit ON", body: "날씨·체감·강수 기준으로 오늘 코디 제안", tone: "clear" as const },
  { title: "Go ON", body: "우산·강수·목적지 케어를 자동 알림으로 연결", tone: "gold" as const },
];

export function OnboardingIntroScreen({ onNavigate, onRequestPermissionGate, locationReady }: P0ScreenProps) {
  return (
    <AppScreen title="온보딩 소개" subtitle="회원가입 없이 개인화 기준만 빠르게 맞추는 선택형 플로우" badge="O2">
      <Section title="핵심 기능" caption="추천 기준 설정 전 4대 기능을 한눈에 확인">
        {featureCards.map((item) => (
          <View key={item.title} style={styles.featureRow}>
            <View style={styles.copy}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
            <StatusPill label="ON" tone={item.tone} />
          </View>
        ))}
      </Section>

      <Section title="다음 단계" caption="기능 소개를 건너뛰어도 권한 확인 후 추천 기준으로 진행">
        <View style={styles.actions}>
          <AppButton label="추천 기준 설정하기" onPress={() => onRequestPermissionGate("location", "O4")} />
          <AppButton label={locationReady ? "권한 건너뛰고 스타일 설정" : "기능 소개 건너뛰기"} onPress={() => onNavigate("O4")} tone="secondary" />
          <AppButton label="홈으로" onPress={() => onNavigate("H1")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  featureRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  title: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  body: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    gap: spacing.sm,
  },
});
