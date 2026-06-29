import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import type { SmartCareScenario } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

const scenarios: { value: SmartCareScenario; title: string; body: string }[] = [
  { value: "commute", title: "출근·등교", body: "아침 외출 전 우산·신발·코디 알림" },
  { value: "outing", title: "일상 외출", body: "강수 변화와 체감 온도 중심 자동 케어" },
  { value: "travel", title: "여행·출장", body: "목적지 등록 시 급변 알림과 준비 가이드 확장" },
];

export function SmartCareOnboardingScreen({ smartCareEnabled, smartCareScenario, onSetSmartCareScenario, onCompleteSmartCareOnboarding, onNavigate }: P0ScreenProps) {
  const theme = useAppTheme();
  const selectedScenario = scenarios.find((item) => item.value === smartCareScenario) ?? scenarios[0];
  return (
    <AppScreen title="알림이 알아서 챙기게 할까요?" subtitle="기준만 고르면 상황에 맞춰 알림 시간을 조정함" badge="2 / 3">
      <Section title="알아서 챙기기" caption="날씨 변화와 이동 패턴에 맞춰 자동 보정" accent="gold">
        <View style={[styles.statusCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
          <View style={styles.copy}>
            <Text style={[styles.kicker, { color: theme.gold }]}>알아서 챙기기</Text>
            <Text style={[styles.title, { color: theme.text }]}>{smartCareEnabled ? "날씨 변화와 이동 패턴에 맞춰 자동 보정" : "스마트 알림 준비"}</Text>
            <View style={styles.pillRow}>
              <StatusPill label={selectedScenario.title} tone="gold" />
              <StatusPill label="필수 날씨 켬" tone="sky" />
              <StatusPill label="목적지 확장 예정" tone="clear" />
            </View>
          </View>
          <View style={[styles.bellMark, { borderColor: theme.gold }]}>
            <Text style={[styles.bellMarkText, { color: theme.gold }]}>!</Text>
          </View>
        </View>
      </Section>

      <Section title="주 사용 상황" caption="상황 1개만 선택하면 기본 알림 묶음을 적용" accent="clear">
        <View style={styles.segmentRow}>
          {scenarios.map((item) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: item.value === smartCareScenario }}
              key={item.value}
              onPress={() => onSetSmartCareScenario(item.value)}
              style={[
                styles.segment,
                {
                  backgroundColor: item.value === smartCareScenario ? theme.gold : theme.cardMuted,
                  borderColor: item.value === smartCareScenario ? theme.gold : theme.border,
                },
              ]}
            >
              <Text style={[styles.segmentText, { color: item.value === smartCareScenario ? theme.onAccent : theme.text }]}>{item.title}</Text>
            </Pressable>
          ))}
        </View>
        {scenarios.map((item) => (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: item.value === smartCareScenario }}
            key={item.value}
            onPress={() => onSetSmartCareScenario(item.value)}
            style={[
              styles.scenarioRow,
              {
                backgroundColor: item.value === smartCareScenario ? theme.cardStrong : theme.cardMuted,
                borderColor: item.value === smartCareScenario ? theme.clear : theme.border,
              },
            ]}
          >
            <View style={styles.copy}>
              <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.body, { color: theme.muted }]}>{item.body}</Text>
            </View>
            <StatusPill label={item.value === smartCareScenario ? "선택" : "옵션"} tone={item.value === smartCareScenario ? "clear" : "sky"} />
          </Pressable>
        ))}
      </Section>

      <Section title="작동 방식" caption="하루 최대 3건으로 묶고 수면 시간대에는 긴급 날씨만 보냄" accent="sky">
        <View style={[styles.ruleSummary, { backgroundColor: theme.cardStrong }]}>
          <Text style={[styles.ruleText, { color: theme.text }]}>강수·기상특보는 필수 알림</Text>
          <Text style={[styles.ruleText, { color: theme.text }]}>출근 준비 알림은 첫 이동 전 1회</Text>
        </View>
      </Section>

      <Section title="다음 단계" caption="목적지 등록은 선택이며 나중에 해도 자동 케어 유지" accent="gold">
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
    minHeight: 126,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "900",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  bellMark: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 23,
    borderWidth: 2,
  },
  bellMarkText: {
    fontSize: 26,
    fontWeight: "900",
  },
  segmentRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "900",
  },
  scenarioRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  body: {
    fontSize: 12,
    lineHeight: 18,
  },
  ruleSummary: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  ruleText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  actions: {
    gap: spacing.sm,
  },
});
