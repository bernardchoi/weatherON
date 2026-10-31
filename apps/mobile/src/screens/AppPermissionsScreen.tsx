import { pageStyles } from "../theme/pageStyles";
import React from "react";
import { Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "../localization/react-native";
import { ambientUiIcons } from "../ambientAssets";
import { BackButton } from "../components/BackButton";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { cardShadow, radius, spacing, type AppTheme } from "../theme/tokens";
import { ambientPalette } from "../theme/ambientSurface";

export function AppPermissionsScreen({
  deviceLocationState,
  locationReady,
  weatherLocationMode,
  permissionReady,
  permissionGateResult,
  smartCareEnabled,
  onNavigate,
  onRequestCurrentLocation,
  onRequestPermissionGate,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const { fontScale } = useWindowDimensions();
  const stackHeader = Platform.OS === "ios" && (layout.width < 360 || fontScale > 1.15);
  const locationCopy = getLocationPermissionCopy(locationReady, weatherLocationMode, deviceLocationState, permissionGateResult);
  const notificationCopy = getNotificationPermissionCopy(permissionReady, smartCareEnabled, permissionGateResult);
  const resultCopy = getPermissionResultCopy(permissionGateResult);
  const handleLocationPrimaryPress = () => {
    if (locationCopy.requiresSettings && Platform.OS !== "web") {
      void Linking.openSettings();
      return;
    }
    if (locationCopy.canRequest && !locationReady) {
      onRequestPermissionGate("location", "M4", "general");
      return;
    }
    onRequestCurrentLocation();
  };
  const handleNotificationPrimaryPress = () => {
    if (notificationCopy.requiresSettings && Platform.OS !== "web") {
      void Linking.openSettings();
      return;
    }
    if (notificationCopy.canRequest) {
      onRequestPermissionGate("notification", "M4", "general");
      return;
    }
    onNavigate("M2");
  };

  return (
    <View style={[styles.shell, { backgroundColor: Platform.OS === "ios" ? "transparent" : theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            width: "100%",
            maxWidth: layout.contentMaxWidth,
            gap: Platform.OS === "ios" ? 12 : layout.settingsContentGap,
            paddingHorizontal: layout.screenHorizontalPadding,
            paddingTop: layout.weatherTopPadding,
            ...(Platform.OS === "ios" ? { paddingBottom: 16 } : {}),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >

        <View style={[styles.header, { minHeight: layout.settingsHeaderMinHeight }, pageStyles.header, stackHeader && { flexDirection: "column", alignItems: "flex-start", gap: 8 }]}>
          <BackButton onPress={() => onNavigate("M1")} />
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
                fontSize: layout.screenTitleFontSize,
                lineHeight: layout.screenTitleLineHeight,
              },
              pageStyles.title,
              Platform.OS === "ios" && ambientVisual.title,
            ]}
          >
            앱 권한 관리
          </Text>
        </View>

        <View
          style={[
            styles.permissionCard,
            { padding: layout.settingsPanelPadding, backgroundColor: theme.cardStrong, borderColor: theme.border },
            cardShadow(theme),
            { ...pageStyles.unboxed, padding: 0 },
          ]}
        >
          <Text style={[[styles.sectionLabel, { color: theme.muted }], Platform.OS === "ios" && ambientVisual.sectionLabel]}>권한 상태</Text>
          {resultCopy ? (
            <View style={[[styles.resultStrip, { backgroundColor: theme.card, borderColor: resultCopy.tone === "warm" ? theme.warm : theme.success }], Platform.OS === "ios" && ambientVisual.resultStrip]}>
              <Text style={[[styles.resultTitle, { color: resultCopy.tone === "warm" ? theme.warm : theme.success }], Platform.OS === "ios" && ambientVisual.resultTitle]}>{resultCopy.title}</Text>
              <Text style={[[styles.resultBody, { color: theme.subtle }], Platform.OS === "ios" && ambientVisual.resultBody]}>{resultCopy.body}</Text>
            </View>
          ) : null}
          <PermissionCard
            label="위치 권한"
            body={locationCopy.body}
            helper={locationCopy.helper}
            primaryLabel={locationCopy.primaryLabel}
            primaryDisabled={deviceLocationState.status === "requesting"}
            secondaryLabel="수동 위치 변경"
            status={locationCopy.status}
            tone={locationCopy.tone}
            onPrimaryPress={handleLocationPrimaryPress}
            onSecondaryPress={() => onNavigate("H2")}
            actionGap={layout.settingsActionGap}
            panelPadding={layout.settingsPanelPadding}
            theme={theme}
          />
          <PermissionCard
            label="알림 권한"
            body={notificationCopy.body}
            helper={notificationCopy.helper}
            primaryLabel={notificationCopy.primaryLabel}
            secondaryLabel={notificationCopy.canRequest || notificationCopy.requiresSettings ? "알림 항목 보기" : undefined}
            status={notificationCopy.status}
            tone={notificationCopy.tone}
            onPrimaryPress={handleNotificationPrimaryPress}
            onSecondaryPress={() => onNavigate("M2")}
            actionGap={layout.settingsActionGap}
            panelPadding={layout.settingsPanelPadding}
            theme={theme}
          />
        </View>

        <View style={[styles.bottomSpacer, Platform.OS === "ios" && { height: 0 }]} />
      </ScrollView>
    </View>
  );
}

function PermissionCard({
  label,
  body,
  helper,
  primaryLabel,
  primaryDisabled = false,
  secondaryLabel,
  status,
  tone,
  onPrimaryPress,
  onSecondaryPress,
  actionGap,
  panelPadding,
  theme,
}: {
  label: string;
  body: string;
  helper: string;
  primaryLabel: string;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  status: string;
  tone: "clear" | "gold" | "warm";
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
  actionGap: number;
  panelPadding: number;
  theme: AppTheme;
}) {
  const color = tone === "clear" ? theme.success : tone === "gold" ? theme.gold : theme.warm;
  const layout = useResponsiveLayout();
  const ambient = Platform.OS === "ios";
  const { fontScale } = useWindowDimensions();
  const wideCopy = ambient && (layout.width < 360 || fontScale > 1.15);
  const statusPill = <View style={[styles.permissionStatus, { backgroundColor: `${color}22` }, ambient && ambientVisual.permissionStatus]}>
    <Text style={[styles.permissionStatusText, { color }, ambient && ambientVisual.permissionStatusText]}>{status}</Text>
  </View>;
  return (
    <View style={[[styles.permissionPanel, pageStyles.card, { padding: panelPadding, backgroundColor: theme.card, borderColor: theme.border }], ambient && [ambientVisual.permissionPanel, { borderTopColor: theme.border }]]}>
      <View style={[styles.permissionHeader, ambient && ambientVisual.permissionHeader]}>
        {ambient ? <Image source={label === "위치 권한" ? ambientUiIcons.location : ambientUiIcons.notifications} accessible={false} style={{ width: 32, height: 32, tintColor: theme.text }} /> : <View style={[styles.permissionDot, { backgroundColor: color }]} />}
        <View style={styles.permissionCopy}>
          <Text style={[[styles.permissionLabel, pageStyles.sectionTitle, { color: theme.text }], Platform.OS === "ios" && ambientVisual.permissionLabel]}>{label}</Text>
          {!ambient ? <Text style={[styles.permissionBody, pageStyles.compactCaption, { color: theme.subtle }]} numberOfLines={1}>{body}</Text> : null}
        </View>
        {!wideCopy ? statusPill : null}
      </View>
      {wideCopy ? <View style={{ alignItems: "flex-start" }}>{statusPill}</View> : null}
      {ambient ? <View style={[ambientVisual.permissionDescription, { marginLeft: wideCopy ? 0 : 44 }]}>
        <Text style={[ambientVisual.permissionBody, { color: theme.text }]}>{body}</Text>
        <Text style={[ambientVisual.permissionHelper, { color: theme.muted }]}>{helper}</Text>
      </View> : <Text style={[styles.permissionHelper, pageStyles.compactCaption, { color: theme.muted }]} numberOfLines={1}>{helper}</Text>}
      <View style={[[styles.permissionActions, { gap: actionGap }], Platform.OS === "ios" && ambientVisual.permissionActions]}>
        <Pressable accessibilityLabel={`${label} ${primaryLabel}`} accessibilityRole="button" accessibilityState={{ disabled: primaryDisabled }} disabled={primaryDisabled} onPress={onPrimaryPress} style={({ pressed }) => [styles.primaryAction, { backgroundColor: ambient ? ambientPalette(theme).selected : `${color}22`, opacity: primaryDisabled ? 0.55 : ambient && pressed ? 0.72 : 1 }, ambient && ambientVisual.primaryAction]}>
          <Text style={[[styles.primaryActionText, { color }], Platform.OS === "ios" && ambientVisual.primaryActionText]}>{primaryLabel}</Text>
        </Pressable>
        {secondaryLabel ? (
          <Pressable accessibilityLabel={`${label} ${secondaryLabel}`} accessibilityRole="button" onPress={onSecondaryPress} style={({ pressed }) => [styles.secondaryAction, { backgroundColor: theme.cardStrong, borderColor: theme.border }, ambient && [ambientVisual.secondaryAction, { opacity: pressed ? 0.72 : 1 }]]}>
            <Text style={[[styles.secondaryActionText, { color: theme.text }], Platform.OS === "ios" && ambientVisual.secondaryActionText]}>{secondaryLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function getLocationPermissionCopy(
  locationReady: boolean,
  weatherLocationMode: P0ScreenProps["weatherLocationMode"],
  deviceLocationState: P0ScreenProps["deviceLocationState"],
  permissionGateResult: P0ScreenProps["permissionGateResult"],
): { body: string; helper: string; primaryLabel: string; status: string; tone: "clear" | "gold" | "warm"; canRequest: boolean; requiresSettings: boolean } {
  if (deviceLocationState.status === "requesting") {
    return {
      body: "위치 권한과 현재 위치 확인 중",
      helper: "권한을 허용하면 현재 위치가 홈 날씨에 바로 반영됨",
      primaryLabel: "확인 중",
      status: "확인 중",
      tone: "gold",
      canRequest: true,
      requiresSettings: false,
    };
  }
  const deniedBySystem = permissionGateResult?.returnTo === "M4" && permissionGateResult.reason === "location" && permissionGateResult.denied;
  if (deniedBySystem) {
    return {
      body: "기기에서 위치 권한이 거부됨",
      helper: "수동 위치와 목적지 검색은 계속 사용할 수 있음",
      primaryLabel: "기기 설정 열기",
      status: "거부됨",
      tone: "warm",
      canRequest: false,
      requiresSettings: true,
    };
  }
  if (locationReady && weatherLocationMode === "auto") {
    return {
      body: "현재 위치 기준 홈 날씨 반영 중",
      helper: "지역명 표시와 출발 판단에 현재 위치를 사용함",
      primaryLabel: "현재 위치 다시 확인",
      status: "허용됨",
      tone: "clear",
      canRequest: false,
      requiresSettings: false,
    };
  }
  if (weatherLocationMode === "manual") {
    return {
      body: "수동 위치 기준으로 홈 날씨 유지",
      helper: "현재 위치 권한 없이도 선택한 지역 날씨는 계속 표시됨",
      primaryLabel: "현재 위치 사용",
      status: "수동 사용 중",
      tone: "clear",
      canRequest: true,
      requiresSettings: false,
    };
  }
  return {
    body: "현재 위치 또는 수동 위치 설정 필요",
    helper: "권한을 허용하거나 위치 선택 화면에서 지역을 고를 수 있음",
    primaryLabel: "현재 위치 사용",
    status: "선택 필요",
    tone: "warm",
    canRequest: true,
    requiresSettings: false,
  };
}

function getNotificationPermissionCopy(
  permissionReady: boolean,
  smartCareEnabled: boolean,
  permissionGateResult: P0ScreenProps["permissionGateResult"],
): { body: string; helper: string; primaryLabel: string; status: string; tone: "clear" | "gold" | "warm"; canRequest: boolean; requiresSettings: boolean } {
  const returnedFromNotificationGate = permissionGateResult?.returnTo === "M4" && permissionGateResult.reason === "notification";
  const deniedBySystem = returnedFromNotificationGate && permissionGateResult.denied;
  if (deniedBySystem) {
    return {
      body: "기기에서 알림 권한이 거부됨",
      helper: "홈·출발 판단은 유지되며 실제 푸시만 제한됨",
      primaryLabel: "기기 설정 열기",
      status: "거부됨",
      tone: "warm",
      canRequest: false,
      requiresSettings: true,
    };
  }
  if (!smartCareEnabled) {
    return {
      body: "스마트 알림 꺼짐 · 앱 안 판단은 유지",
      helper: "스마트 알림을 켜면 권한과 수신 상태를 이어서 확인함",
      primaryLabel: "알림 설정",
      status: "중지",
      tone: "gold",
      canRequest: false,
      requiresSettings: false,
    };
  }
  if (permissionReady) {
    return {
      body: "비·출발 알림 받을 수 있음",
      helper: "알림 설정에서 실제 수신까지 확인 가능",
      primaryLabel: "수신 확인",
      status: "허용됨",
      tone: "clear",
      canRequest: false,
      requiresSettings: false,
    };
  }
  return {
    body: "푸시 권한을 켜면 강수·출발 알림 수신",
    helper: "권한은 계정 연결과 별도이며 나중에 변경 가능",
    primaryLabel: "알림 허용",
    status: "허용 필요",
    tone: "warm",
    canRequest: true,
    requiresSettings: false,
  };
}

function getPermissionResultCopy(
  permissionGateResult: P0ScreenProps["permissionGateResult"],
): { title: string; body: string; tone: "clear" | "warm" } | null {
  if (!permissionGateResult || permissionGateResult.returnTo !== "M4") return null;
  const skipped = permissionGateResult.outcome !== "allowed";
  if (permissionGateResult.reason === "notification") {
    return {
      title: skipped ? (permissionGateResult.denied ? "알림 권한이 거부됐어요" : "알림을 나중에 설정했어요") : "알림 권한을 허용했어요",
      body: skipped ? "푸시 수신은 꺼져 있고 홈·출발 판단은 앱 안에서 계속 사용할 수 있음" : "스마트 알림 설정에서 예약과 실제 수신 상태를 확인할 수 있음",
      tone: skipped ? "warm" : "clear",
    };
  }
  if (permissionGateResult.reason === "location") {
    return {
      title: skipped ? (permissionGateResult.denied ? "위치 권한이 거부됐어요" : "수동 위치를 사용 중이에요") : "현재 위치를 사용 중이에요",
      body: skipped ? "현재 위치 자동화는 꺼져 있고 수동 위치와 목적지 검색은 계속 사용할 수 있음" : "현재 위치 기준 홈 날씨를 다시 확인함",
      tone: skipped ? "warm" : "clear",
    };
  }
  return null;
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    minHeight: "100%",
    paddingBottom: spacing.xl,
    alignSelf: "center",
  },
  atmosphere: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 280,
    height: 500,
    opacity: 0.34,
    borderRadius: 78,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  title: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: 0,
  },
  permissionCard: {
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  permissionPanel: {
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  permissionHeader: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  resultStrip: {
    gap: 4,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  resultTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  resultBody: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  permissionDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  permissionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  permissionLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  permissionBody: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  permissionHelper: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  permissionStatus: {
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  permissionStatusText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  permissionActions: {
    flexDirection: "row",
  },
  primaryAction: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  primaryActionText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  secondaryAction: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  secondaryActionText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  bottomSpacer: {
    height: 42,
  },
});

// Approved iOS Ambient hierarchy; Android retains its existing presentation.
const ambientVisual = StyleSheet.create({
  title: { flex: 1, minWidth: 0, fontSize: 26, lineHeight: 34, fontWeight: "700" },
  permissionHeader: { flexWrap: "wrap", columnGap: 12, rowGap: 8 },
  permissionStatus: { minHeight: 28, paddingHorizontal: 10, maxWidth: "100%", flexShrink: 1 },
  permissionDescription: { gap: 4 },
  primaryAction: { flexGrow: 0, flexShrink: 0, flexBasis: "auto", minHeight: 48, paddingVertical: 10, borderRadius: radius.pill },
  secondaryAction: { flexGrow: 0, flexShrink: 0, flexBasis: "auto", minHeight: 48, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: "transparent" },
  "permissionPanel": {
    "backgroundColor": "transparent",
    "borderWidth": 0,
    "borderRadius": 0,
    "shadowOpacity": 0,
    "elevation": 0,
    "paddingHorizontal": 0,
    "paddingVertical": 20,
    "borderTopWidth": StyleSheet.hairlineWidth,
    "gap": 16
  },
  "permissionLabel": {
    "fontSize": 18,
    "lineHeight": 26,
    "fontWeight": "700"
  },
  "permissionBody": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "600"
  },
  "permissionHelper": {
    "fontSize": 14,
    "lineHeight": 21,
    "fontWeight": "400"
  },
  "permissionStatusText": {
    "fontSize": 14,
    "lineHeight": 21,
    "fontWeight": "400"
  },
  "resultStrip": {
    "backgroundColor": "transparent",
    "borderWidth": 0,
    "borderRadius": 0,
    "shadowOpacity": 0,
    "elevation": 0,
    "paddingHorizontal": 0,
    "paddingVertical": 18,
    "gap": 16
  },
  "resultTitle": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  },
  "resultBody": {
    "fontSize": 14,
    "lineHeight": 21,
    "fontWeight": "400"
  },
  "sectionLabel": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  },
  "permissionActions": {
    "flexDirection": "column",
    "gap": 10
  },
  "primaryActionText": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  },
  "secondaryActionText": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  }
});
