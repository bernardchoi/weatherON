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
  { value: "commute", title: "출근·등교", body: "아침 외출 전 출발시간·강수 알림" },
  { value: "outing", title: "일상 외출", body: "강수 변화와 체감 온도 중심 자동 케어" },
  { value: "travel", title: "여행·출장", body: "목적지 등록 시 급변 알림과 준비 가이드 확장" },
];

export function SmartCareOnboardingScreen({
  smartCareEnabled,
  smartCareScenario,
  permissionGateResult,
  onSetSmartCareScenario,
  onCompleteSmartCareOnboarding,
  onCompleteOnboarding,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const selectedScenario = scenarios.find((item) => item.value === smartCareScenario) ?? scenarios[0];
  const permissionFeedback = getPermissionFeedback(permissionGateResult);
  return (
    <AppScreen title="알림이 알아서 챙기게 할까요?" subtitle="기준만 고르면 상황에 맞춰 알림 시간을 조정함" badge="2 / 3">
      <View style={[styles.progressTrack, { backgroundColor: theme.cardMuted }]}>
        <View style={[styles.progressFill, { backgroundColor: theme.gold }]} />
      </View>

      {permissionFeedback ? (
        <View style={[styles.feedbackCard, { backgroundColor: theme.cardStrong, borderColor: permissionFeedback.tone === "clear" ? theme.clear : theme.gold }]}>
          <View style={[styles.feedbackDot, { backgroundColor: permissionFeedback.tone === "clear" ? theme.clear : theme.gold }]} />
          <View style={styles.copy}>
            <Text style={[styles.feedbackTitle, { color: theme.text }]}>{permissionFeedback.title}</Text>
            <Text style={[styles.feedbackBody, { color: theme.muted }]}>{permissionFeedback.body}</Text>
          </View>
        </View>
      ) : null}

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
        <View style={[styles.scenarioRow, { backgroundColor: theme.cardStrong, borderColor: theme.clear }]}>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: theme.text }]}>{selectedScenario.title}</Text>
            <Text style={[styles.body, { color: theme.muted }]}>{selectedScenario.body}</Text>
          </View>
          <StatusPill label="선택" tone="clear" />
        </View>
      </Section>

      <Section title="작동 방식" caption="하루 최대 3건으로 묶고 수면 시간대에는 긴급 날씨만 보냄" accent="sky">
        <View style={[styles.ruleSummary, { backgroundColor: theme.cardStrong }]}>
          <Text style={[styles.ruleText, { color: theme.text }]}>강수·기상특보는 필수 알림</Text>
          <Text style={[styles.ruleText, { color: theme.text }]}>출발 준비 알림은 첫 이동 전 1회</Text>
        </View>
      </Section>

      <Section title="다음 단계" caption="목적지 등록은 선택이며 나중에 해도 자동 케어 유지" accent="gold">
        <View style={styles.actions}>
          <AppButton label="목적지 선택으로" accessibilityLabel="목적지 선택 단계로 이동" onPress={onCompleteSmartCareOnboarding} />
          <AppButton label="나중에 할게요" accessibilityLabel="목적지 선택을 건너뛰고 홈으로 이동" onPress={() => onCompleteOnboarding("H1")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

function getPermissionFeedback(permissionGateResult: P0ScreenProps["permissionGateResult"]): { title: string; body: string; tone: "clear" | "gold" } | null {
  if (!permissionGateResult || permissionGateResult.returnTo !== "H1") return null;
  if (permissionGateResult.reason !== "location" && permissionGateResult.reason !== "account-setup") return null;
  const skipped = permissionGateResult.message.includes("나중에");
  if (skipped) {
    return {
      title: "위치 권한은 나중에 설정",
      body: "기본 위치 기준으로 홈 판단을 먼저 보여줌",
      tone: "gold",
    };
  }
  return {
    title: "현재 위치 기준 홈 반영됨",
    body: "홈 날씨와 출발 판단이 현재 위치 기준으로 갱신됨",
    tone: "clear",
  };
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 4,
    overflow: "hidden",
    borderRadius: radius.pill,
  },
  progressFill: {
    width: "66%",
    height: "100%",
  },
  feedbackCard: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  feedbackDot: {
    width: 9,
    height: 9,
    borderRadius: radius.pill,
  },
  feedbackTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  feedbackBody: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
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
