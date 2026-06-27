import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import type { SmartCareScenario } from "../state/useWeatherOnAppState";
import { appColors, radius, spacing } from "../theme/tokens";

const scenarios: { value: SmartCareScenario; title: string; body: string }[] = [
  { value: "commute", title: "출근·등교", body: "아침 외출 전 우산·신발·코디 알림" },
  { value: "outing", title: "일상 외출", body: "강수 변화와 체감 온도 중심 자동 케어" },
  { value: "travel", title: "여행·출장", body: "목적지 등록 시 급변 알림과 준비 가이드 확장" },
];

export function SmartCareOnboardingScreen({ smartCareEnabled, smartCareScenario, onSetSmartCareScenario, onCompleteSmartCareOnboarding, onNavigate }: P0ScreenProps) {
  return (
    <AppScreen title="알아서 챙기기" subtitle="세부 시간표보다 주 사용 상황 1개를 선택해 기본 알림 기준 적용" badge="O5">
      <Section title="기본 기준" caption="목적지 없어도 Mode A 자동 케어 작동">
        <View style={styles.statusCard}>
          <View style={styles.copy}>
            <Text style={styles.title}>{smartCareEnabled ? "스마트 알림 켜짐" : "스마트 알림 준비"}</Text>
            <Text style={styles.body}>날씨·코디·우산·신발 알림 기본값 적용</Text>
          </View>
          <StatusPill label={smartCareEnabled ? "ON" : "대기"} tone={smartCareEnabled ? "clear" : "gold"} />
        </View>
      </Section>

      <Section title="사용 상황" caption="세부 토글은 M2 고급 설정에서 관리">
        {scenarios.map((item) => (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: item.value === smartCareScenario }}
            key={item.value}
            onPress={() => onSetSmartCareScenario(item.value)}
            style={[styles.scenarioRow, item.value === smartCareScenario ? styles.scenarioSelected : null]}
          >
            <View style={styles.copy}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
            <StatusPill label={item.value === smartCareScenario ? "선택" : "옵션"} tone={item.value === smartCareScenario ? "clear" : "sky"} />
          </Pressable>
        ))}
      </Section>

      <Section title="다음 단계" caption="목적지 등록은 선택이며 나중에 해도 자동 케어 유지">
        <View style={styles.actions}>
          <AppButton label="목적지 등록으로" onPress={onCompleteSmartCareOnboarding} />
          <AppButton label="알림 설정 보기" onPress={() => onNavigate("M2")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  scenarioRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  scenarioSelected: {
    backgroundColor: "rgba(103,232,208,0.14)",
    borderColor: appColors.clear,
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
