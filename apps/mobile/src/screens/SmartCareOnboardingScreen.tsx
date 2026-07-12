import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { FeedbackPressable } from "../components/FeedbackPressable";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import type { P0ScreenProps } from "../navigation/types";
import type { SmartCareScenario } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing } from "../theme/tokens";

const scenarios: { value: SmartCareScenario; title: string; body: string }[] = [
  { value: "commute", title: "출근·등교", body: "아침 외출 전 출발시간과 비 알림 중심" },
  { value: "outing", title: "일상 외출", body: "강수 변화와 체감 온도 중심" },
  { value: "travel", title: "여행·출장", body: "목적지 등록 시 급변 알림 확장" },
];

export function SmartCareOnboardingScreen({
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
    <AppScreen title="알림을 간단히 켤까요?" subtitle="상황만 고르면 필요한 날씨만 자동으로 알려줌" badge="2 / 3">
      <View style={[styles.progressTrack, { backgroundColor: theme.cardMuted }]}>
        <View style={[styles.progressFill, { backgroundColor: theme.gold }]} />
      </View>

      {permissionFeedback ? (
        <View style={[styles.feedbackCard, { backgroundColor: theme.cardStrong, borderColor: permissionFeedback.tone === "clear" ? theme.clear : theme.gold }, cardShadow(theme)]}>
          <View style={[styles.feedbackDot, { backgroundColor: permissionFeedback.tone === "clear" ? theme.clear : theme.gold }]} />
          <View style={styles.copy}>
            <Text style={[styles.feedbackTitle, { color: theme.text }]}>{permissionFeedback.title}</Text>
            <Text style={[styles.feedbackBody, { color: theme.muted }]}>{permissionFeedback.body}</Text>
          </View>
        </View>
      ) : null}

      <Section title="사용 상황" caption="하나만 고르면 기본 알림이 적용됨" accent="clear">
        <View style={styles.segmentRow}>
          {scenarios.map((item) => (
            <FeedbackPressable
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
            </FeedbackPressable>
          ))}
        </View>
        <View style={[styles.scenarioRow, { backgroundColor: theme.cardStrong, borderColor: theme.clear }, cardShadow(theme)]}>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: theme.text }]}>{selectedScenario.title}</Text>
            <Text style={[styles.body, { color: theme.muted }]}>{selectedScenario.body}</Text>
          </View>
          <Text style={[styles.selectedLabel, { color: theme.clear }]}>선택됨</Text>
        </View>
      </Section>

      <View style={[styles.autoSummary, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}>
        <Text style={[styles.autoTitle, { color: theme.text }]}>자동으로 조정됨</Text>
        <Text style={[styles.autoBody, { color: theme.muted }]}>
          강수·기상특보는 우선 알림, 출발 준비는 첫 이동 전 1회만 보냄
        </Text>
        <View style={styles.autoPillRow}>
          <View style={[styles.autoPill, { backgroundColor: `${theme.gold}22` }]}>
            <Text style={[styles.autoPillText, { color: theme.gold }]}>{selectedScenario.title}</Text>
          </View>
          <View style={[styles.autoPill, { backgroundColor: `${theme.sky}22` }]}>
            <Text style={[styles.autoPillText, { color: theme.sky }]}>필수 날씨</Text>
          </View>
        </View>
      </View>

      <Section title="다음 단계" caption="목적지 등록은 선택이며 나중에 해도 자동 케어 유지" accent="gold">
        <View style={styles.actions}>
          <AppButton label="목적지 선택으로" accessibilityLabel="목적지 선택 단계로 이동" onPress={onCompleteSmartCareOnboarding} />
          <AppButton label="나중에 할게요" accessibilityLabel="목적지 선택을 건너뛰고 홈으로 이동" onPress={() => onCompleteOnboarding("H1")} tone="secondary" />
        </View>
      </Section>

      <View style={styles.safeBottomPad} />
    </AppScreen>
  );
}

function getPermissionFeedback(permissionGateResult: P0ScreenProps["permissionGateResult"]): { title: string; body: string; tone: "clear" | "gold" } | null {
  if (!permissionGateResult || permissionGateResult.returnTo !== "H1") return null;
  if (permissionGateResult.reason !== "location") return null;
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
  selectedLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
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
  autoSummary: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  autoTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  autoBody: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  autoPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  autoPill: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  autoPillText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  actions: {
    gap: spacing.sm,
  },
  safeBottomPad: {
    height: spacing.lg,
  },
});
