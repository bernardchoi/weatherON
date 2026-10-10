import React, { useState } from "react";
import { Platform, Image, StyleSheet, Text, View } from "../localization/react-native";
import { uiIconAssets } from "../assets";
import { ambientUiIcons } from "../ambientAssets";
import { FeedbackPressable } from "../components/FeedbackPressable";
import { AppScreen } from "../components/AppScreen";
import { OnboardingFooter } from "../components/OnboardingFooter";
import { OnboardingVisualStrip } from "../components/OnboardingVisualStrip";
import { Section } from "../components/Section";
import type { P0ScreenProps } from "../navigation/types";
import type { SmartCareScenario } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { cardShadow, radius, spacing } from "../theme/tokens";

const screenIcons = Platform.OS === "ios" ? { ...uiIconAssets, uv: ambientUiIcons.temperature, clearNight: ambientUiIcons.temperature, pin: ambientUiIcons.location, shirt: ambientUiIcons.tabOutfit, depart: ambientUiIcons.tabDepart, rain: ambientUiIcons.umbrella, umbrella: ambientUiIcons.umbrella, myAlerts: ambientUiIcons.notifications, myDisplay: ambientUiIcons.settings, settings: ambientUiIcons.settings, tabMy: ambientUiIcons.tabMy, check: ambientUiIcons.check } : uiIconAssets;

const scenarios: { value: SmartCareScenario; title: string; body: string; icon: number }[] = [
  { value: "commute", title: "출근·등교", body: "아침에 나설 시간과 비 소식부터 챙겨드림", icon: screenIcons.depart },
  { value: "outing", title: "일상 외출", body: "체감온도와 비 변화를 알맞게 알려드림", icon: screenIcons.rain },
  { value: "travel", title: "여행·출장", body: "가는 곳 날씨가 달라지면 먼저 알려드림", icon: screenIcons.pin },
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
  const layout = useResponsiveLayout();
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
      title="필요한 순간에만 알려드릴게요"
      subtitle="외출 스타일에 맞춰 알림을 가볍게 맞춰드림"
      badge="3 / 4"
      showWordmark={false}
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
              style={[[
                styles.segment,
                {
                  backgroundColor: item.value === smartCareScenario ? theme.gold : theme.cardMuted,
                  borderColor: item.value === smartCareScenario ? theme.gold : theme.border,
                  minHeight: layout.onboardingSegmentMinHeight,
                },
              ], Platform.OS === "ios" && ambientVisual.segment]}
            >
              <Image source={item.icon} style={[[styles.segmentIcon, { tintColor: item.value === smartCareScenario ? theme.onAccent : theme.clear }], Platform.OS === "ios" && ambientVisual.segmentIcon]} resizeMode="contain" />
              <Text style={[[styles.segmentText, { color: item.value === smartCareScenario ? theme.onAccent : theme.text }], Platform.OS === "ios" && ambientVisual.segmentText]}>{item.title}</Text>
            </FeedbackPressable>
          ))}
        </View>
        <View
          style={[[
            styles.scenarioRow,
            {
              backgroundColor: theme.cardStrong,
              borderColor: theme.clear,
              minHeight: layout.onboardingCompactRowMinHeight,
              padding: layout.onboardingPanelPadding,
            },
            cardShadow(theme),
          ], Platform.OS === "ios" && ambientVisual.scenarioRow]}
        >
          <View style={[[styles.scenarioIconFrame, { backgroundColor: `${theme.clear}18` }], Platform.OS === "ios" && ambientVisual.scenarioIconFrame]}>
            <Image source={selectedScenario.icon} style={[styles.scenarioIcon, { tintColor: theme.clear }]} resizeMode="contain" />
          </View>
          <View style={styles.copy}>
            <Text style={[[styles.title, { color: theme.text }], Platform.OS === "ios" && ambientVisual.title]}>{selectedScenario.title}</Text>
            <Text style={[[styles.body, { color: theme.muted }], Platform.OS === "ios" && ambientVisual.body]}>{selectedScenario.body}</Text>
          </View>
          <Text style={[[styles.selectedLabel, { color: theme.clear }], Platform.OS === "ios" && ambientVisual.selectedLabel]}>선택됨</Text>
        </View>
      </Section>

      <OnboardingVisualStrip
        items={[
          { label: "비 변화", value: "시작 전", icon: screenIcons.rain, tone: "sky" },
          { label: "출발", value: "맞춤 시각", icon: screenIcons.depart, tone: "gold" },
          { label: "목적지", value: "급변만", icon: screenIcons.pin, tone: "clear" },
        ]}
      />

      <View
        style={[[
          styles.notificationPrompt,
          {
            backgroundColor: theme.cardStrong,
            borderColor: permissionReady ? theme.clear : theme.border,
            minHeight: layout.onboardingCompactRowMinHeight,
            padding: layout.isShort || layout.isNarrow ? spacing.xs : spacing.sm,
          },
          cardShadow(theme),
        ], Platform.OS === "ios" && ambientVisual.notificationPrompt]}
      >
        <View style={[[styles.notificationIconFrame, { backgroundColor: `${theme.gold}22` }], Platform.OS === "ios" && ambientVisual.notificationIconFrame]}>
          <Image source={screenIcons.myAlerts} style={[styles.notificationIcon, { tintColor: theme.gold }]} resizeMode="contain" />
        </View>
        <View style={styles.copy}>
          <Text style={[[styles.notificationTitle, { color: theme.text }], Platform.OS === "ios" && ambientVisual.notificationTitle]}>{permissionReady ? "필요한 알림을 받을 준비 끝" : notificationSkipped ? "알림은 원할 때 켤 수 있어요" : "비 오기 전, 나서기 전에 알려드릴게요"}</Text>
          <Text style={[[styles.notificationBody, { color: theme.muted }], Platform.OS === "ios" && ambientVisual.notificationBody]}>{permissionReady ? "중요한 변화만 한 번씩 가볍게 알려드려요" : notificationSkipped ? "알림 설정에서 언제든 바꿀 수 있어요" : "선택한 상황에 맞춰 꼭 필요한 소식만 전해드려요"}</Text>
        </View>
        <Text style={[[styles.notificationStatus, { color: permissionReady ? theme.clear : notificationSkipped ? theme.gold : theme.sky }], Platform.OS === "ios" && ambientVisual.notificationStatus]}>{permissionReady ? "켜짐" : notificationSkipped ? "보류" : "선택"}</Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
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

// Approved iOS Ambient hierarchy; Android retains its existing presentation.
const ambientVisual = StyleSheet.create({
  "scenarioRow": {
    "backgroundColor": "transparent",
    "borderWidth": 0,
    "borderRadius": 0,
    "shadowOpacity": 0,
    "elevation": 0,
    "paddingHorizontal": 0,
    "paddingVertical": 18,
    "gap": 16
  },
  "scenarioIconFrame": {
    "backgroundColor": "transparent",
    "borderWidth": 0,
    "shadowOpacity": 0
  },
  "title": {
    "fontSize": 21,
    "lineHeight": 28,
    "fontWeight": "700"
  },
  "body": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  },
  "selectedLabel": {
    "fontSize": 14,
    "lineHeight": 21,
    "fontWeight": "400"
  },
  "notificationPrompt": {
    "backgroundColor": "transparent",
    "borderWidth": 0,
    "borderRadius": 0,
    "shadowOpacity": 0,
    "elevation": 0,
    "paddingHorizontal": 0,
    "paddingVertical": 18,
    "gap": 16
  },
  "notificationIconFrame": {
    "backgroundColor": "transparent",
    "borderWidth": 0,
    "shadowOpacity": 0
  },
  "notificationTitle": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  },
  "notificationBody": {
    "fontSize": 14,
    "lineHeight": 21,
    "fontWeight": "400"
  },
  "notificationStatus": {
    "fontSize": 14,
    "lineHeight": 21,
    "fontWeight": "400"
  },
  "segmentText": {
    "fontSize": 15,
    "lineHeight": 21,
    "fontWeight": "600"
  },
  "segment": {
    "paddingVertical": 16,
    "borderRadius": 18
  },
  "segmentIcon": {
    "width": 32,
    "height": 32
  }
});
