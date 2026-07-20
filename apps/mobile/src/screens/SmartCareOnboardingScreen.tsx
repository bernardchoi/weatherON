import React, { useState } from "react";
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
  permissionReady,
  onSetSmartCareScenario,
  onCompleteSmartCareOnboarding,
  onRequestNotificationPermission,
  onCompleteOnboarding,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const selectedScenario = scenarios.find((item) => item.value === smartCareScenario) ?? scenarios[0];
  const [notificationRequestHandled, setNotificationRequestHandled] = useState(false);
  const notificationSetupComplete = permissionReady || notificationRequestHandled;
  const notificationSkipped = notificationRequestHandled && !permissionReady;

  const requestNotificationPermission = async () => {
    await onRequestNotificationPermission();
    setNotificationRequestHandled(true);
  };
  return (
    <AppScreen
      title="필요한 알림만 받기"
      subtitle="사용 상황 하나만 선택"
      badge="3 / 4"
      footer={
        <OnboardingFooter
          primaryLabel={notificationSetupComplete ? "다음" : "알림 켜기"}
          primaryAccessibilityLabel={notificationSetupComplete ? "목적지 안내 단계로 이동" : "알림 권한 요청"}
          onPrimary={() => (notificationSetupComplete ? onCompleteSmartCareOnboarding() : void requestNotificationPermission())}
          secondaryLabel={notificationSetupComplete ? "건너뛰기" : "나중에"}
          secondaryAccessibilityLabel={
            notificationSetupComplete
              ? "알림 설정을 건너뛰고 홈으로 이동"
              : "알림 권한을 나중에 설정하고 목적지 안내 단계로 이동"
          }
          onSecondary={() => (notificationSetupComplete ? onCompleteOnboarding("H1") : onCompleteSmartCareOnboarding())}
        />
      }
    >
      <View style={[styles.progressTrack, { backgroundColor: theme.cardMuted }]}>
        <View style={[styles.progressFill, { backgroundColor: theme.gold }]} />
      </View>

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

      <View style={[styles.notificationPrompt, { backgroundColor: theme.cardStrong, borderColor: permissionReady ? theme.clear : theme.border }, cardShadow(theme)]}>
        <View style={[styles.notificationIconFrame, { backgroundColor: `${theme.gold}22` }]}>
          <Image source={uiIconAssets.myAlerts} style={[styles.notificationIcon, { tintColor: theme.gold }]} resizeMode="contain" />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.notificationTitle, { color: theme.text }]}>{permissionReady ? "선택한 알림을 받을 준비 완료" : notificationSkipped ? "알림은 나중에 켤 수 있음" : "비와 출발 시점을 알려드려요"}</Text>
          <Text style={[styles.notificationBody, { color: theme.muted }]}>{permissionReady ? "중요한 변화만 한 번씩 안내함" : notificationSkipped ? "알림 설정에서 언제든 변경 가능" : "선택한 상황에 맞춰 필요한 알림만 전달함"}</Text>
        </View>
        <Text style={[styles.notificationStatus, { color: permissionReady ? theme.clear : notificationSkipped ? theme.gold : theme.sky }]}>{permissionReady ? "켜짐" : notificationSkipped ? "보류" : "선택"}</Text>
      </View>

    </AppScreen>
  );
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
  notificationPrompt: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  notificationIconFrame: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  notificationIcon: {
    width: 23,
    height: 23,
  },
  notificationTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900",
  },
  notificationBody: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  notificationStatus: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
});
