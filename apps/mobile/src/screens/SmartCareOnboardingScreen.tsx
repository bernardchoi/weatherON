import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import { FeedbackPressable } from "../components/FeedbackPressable";
import { AppScreen } from "../components/AppScreen";
import { OnboardingFooter } from "../components/OnboardingFooter";
import { Section } from "../components/Section";
import type { P0ScreenProps } from "../navigation/types";
import type { SmartCareScenario } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing } from "../theme/tokens";

const scenarios: { value: SmartCareScenario; title: string; body: string; icon: number }[] = [
  { value: "commute", title: "출근·등교", body: "아침 외출 전 출발시간과 비 알림 중심", icon: uiIconAssets.depart },
  { value: "outing", title: "일상 외출", body: "강수 변화와 체감 온도 중심", icon: uiIconAssets.rain },
  { value: "travel", title: "여행·출장", body: "목적지 등록 시 급변 알림 확장", icon: uiIconAssets.pin },
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
    <AppScreen
      title="필요한 알림만 받기"
      subtitle="사용 상황 하나만 선택"
      badge="3 / 4"
      footer={
        <OnboardingFooter
          primaryLabel="다음"
          primaryAccessibilityLabel="목적지 안내 단계로 이동"
          onPrimary={onCompleteSmartCareOnboarding}
          secondaryLabel="건너뛰기"
          secondaryAccessibilityLabel="알림 설정을 건너뛰고 홈으로 이동"
          onSecondary={() => onCompleteOnboarding("H1")}
        />
      }
    >
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

      <Section title="사용 상황" accent="clear">
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
              <Image source={item.icon} style={[styles.segmentIcon, { tintColor: item.value === smartCareScenario ? theme.onAccent : theme.clear }]} resizeMode="contain" />
              <Text style={[styles.segmentText, { color: item.value === smartCareScenario ? theme.onAccent : theme.text }]}>{item.title}</Text>
            </FeedbackPressable>
          ))}
        </View>
        <View style={[styles.scenarioRow, { backgroundColor: theme.cardStrong, borderColor: theme.clear }, cardShadow(theme)]}>
          <View style={[styles.scenarioIconFrame, { backgroundColor: `${theme.clear}18` }]}>
            <Image source={selectedScenario.icon} style={[styles.scenarioIcon, { tintColor: theme.clear }]} resizeMode="contain" />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: theme.text }]}>{selectedScenario.title}</Text>
            <Text style={[styles.body, { color: theme.muted }]}>{selectedScenario.body}</Text>
          </View>
          <Text style={[styles.selectedLabel, { color: theme.clear }]}>선택됨</Text>
        </View>
      </Section>

      <View style={[styles.autoSummary, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}>
        <Text style={[styles.autoBody, { color: theme.muted }]}>
          특보는 바로, 출발 준비는 한 번만 알림
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
    width: "75%",
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
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900",
  },
  feedbackBody: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  segmentRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    minHeight: 76,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 4,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
    textAlign: "center",
  },
  segmentIcon: {
    width: 24,
    height: 24,
  },
  scenarioRow: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  scenarioIconFrame: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  scenarioIcon: {
    width: 26,
    height: 26,
  },
  selectedLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "900",
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  autoSummary: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  autoBody: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  autoPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  autoPill: {
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  autoPillText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
});
