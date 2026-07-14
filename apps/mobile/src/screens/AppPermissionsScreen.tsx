import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing, type AppTheme } from "../theme/tokens";

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
  const locationCopy = getLocationPermissionCopy(locationReady, weatherLocationMode, deviceLocationState);
  const notificationCopy = getNotificationPermissionCopy(permissionReady, smartCareEnabled, permissionGateResult);
  const resultCopy = getPermissionResultCopy(permissionGateResult);

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <BackButton onPress={() => onNavigate("M1")} />
          <Text style={[styles.title, { color: theme.text }]}>앱 권한 관리</Text>
        </View>

        <View style={[styles.permissionCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}>
          <Text style={[styles.sectionLabel, { color: theme.muted }]}>권한 상태</Text>
          {resultCopy ? (
            <View style={[styles.resultStrip, { backgroundColor: theme.card, borderColor: resultCopy.tone === "warm" ? theme.warm : theme.clear }]}>
              <Text style={[styles.resultTitle, { color: resultCopy.tone === "warm" ? theme.warm : theme.clear }]}>{resultCopy.title}</Text>
              <Text style={[styles.resultBody, { color: theme.subtle }]}>{resultCopy.body}</Text>
            </View>
          ) : null}
          <PermissionCard
            label="위치 권한"
            body={locationCopy.body}
            helper={locationCopy.helper}
            primaryLabel={locationCopy.primaryLabel}
            secondaryLabel="위치 선택"
            status={locationCopy.status}
            tone={locationCopy.tone}
            onPrimaryPress={() => (locationCopy.canRequest ? onRequestCurrentLocation() : onNavigate("H2"))}
            onSecondaryPress={() => onNavigate("H2")}
            theme={theme}
          />
          <PermissionCard
            label="알림 권한"
            body={notificationCopy.body}
            helper={notificationCopy.helper}
            primaryLabel={notificationCopy.primaryLabel}
            secondaryLabel="알림 설정"
            status={notificationCopy.status}
            tone={notificationCopy.tone}
            onPrimaryPress={() => (notificationCopy.canRequest ? onRequestPermissionGate("notification", "M4", "general") : onNavigate("M2"))}
            onSecondaryPress={() => onNavigate("M2")}
            theme={theme}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function PermissionCard({
  label,
  body,
  helper,
  primaryLabel,
  secondaryLabel,
  status,
  tone,
  onPrimaryPress,
  onSecondaryPress,
  theme,
}: {
  label: string;
  body: string;
  helper: string;
  primaryLabel: string;
  secondaryLabel: string;
  status: string;
  tone: "clear" | "gold" | "warm";
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
  theme: AppTheme;
}) {
  const color = tone === "clear" ? theme.clear : tone === "gold" ? theme.gold : theme.warm;
  return (
    <View style={[styles.permissionPanel, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.permissionHeader}>
        <View style={[styles.permissionDot, { backgroundColor: color }]} />
        <View style={styles.permissionCopy}>
          <Text style={[styles.permissionLabel, { color: theme.text }]}>{label}</Text>
          <Text style={[styles.permissionBody, { color: theme.subtle }]} numberOfLines={2}>{body}</Text>
        </View>
        <View style={[styles.permissionStatus, { backgroundColor: `${color}22` }]}>
          <Text style={[styles.permissionStatusText, { color }]}>{status}</Text>
        </View>
      </View>
      <Text style={[styles.permissionHelper, { color: theme.muted }]}>{helper}</Text>
      <View style={styles.permissionActions}>
        <Pressable accessibilityLabel={`${label} ${primaryLabel}`} accessibilityRole="button" onPress={onPrimaryPress} style={[styles.primaryAction, { backgroundColor: `${color}22` }]}>
          <Text style={[styles.primaryActionText, { color }]}>{primaryLabel}</Text>
        </Pressable>
        <Pressable accessibilityLabel={`${label} ${secondaryLabel}`} accessibilityRole="button" onPress={onSecondaryPress} style={[styles.secondaryAction, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
          <Text style={[styles.secondaryActionText, { color: theme.text }]}>{secondaryLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function getLocationPermissionCopy(
  locationReady: boolean,
  weatherLocationMode: P0ScreenProps["weatherLocationMode"],
  deviceLocationState: P0ScreenProps["deviceLocationState"],
): { body: string; helper: string; primaryLabel: string; status: string; tone: "clear" | "gold" | "warm"; canRequest: boolean } {
  if (deviceLocationState.status === "requesting") {
    return {
      body: "위치 권한과 현재 위치 확인 중",
      helper: "권한을 허용하면 현재 위치가 홈 날씨에 바로 반영됨",
      primaryLabel: "확인 중",
      status: "확인 중",
      tone: "gold",
      canRequest: true,
    };
  }
  if (deviceLocationState.status === "denied") {
    return {
      body: "현재 위치 자동화는 대기 중",
      helper: "수동 위치와 목적지 검색은 계속 사용할 수 있음",
      primaryLabel: "위치 권한 복구",
      status: "보류",
      tone: "warm",
      canRequest: true,
    };
  }
  if (locationReady && weatherLocationMode === "auto") {
    return {
      body: "현재 위치 기준 홈 날씨 반영 중",
      helper: "지역명 표시와 출발 판단에 현재 위치를 사용함",
      primaryLabel: "위치 관리",
      status: "허용됨",
      tone: "clear",
      canRequest: false,
    };
  }
  if (weatherLocationMode === "manual") {
    return {
      body: "수동 위치 기준으로 홈 날씨 유지",
      helper: "현재 위치 권한 없이도 선택한 지역 날씨는 계속 표시됨",
      primaryLabel: "위치 권한 복구",
      status: "수동",
      tone: "gold",
      canRequest: true,
    };
  }
  return {
    body: "현재 위치 또는 수동 위치 설정 필요",
    helper: "권한을 허용하거나 위치 선택 화면에서 지역을 고를 수 있음",
    primaryLabel: "위치 권한 복구",
    status: "확인",
    tone: "warm",
    canRequest: true,
  };
}

function getNotificationPermissionCopy(
  permissionReady: boolean,
  smartCareEnabled: boolean,
  permissionGateResult: P0ScreenProps["permissionGateResult"],
): { body: string; helper: string; primaryLabel: string; status: string; tone: "clear" | "gold" | "warm"; canRequest: boolean } {
  const returnedFromNotificationGate = permissionGateResult?.returnTo === "M4" && permissionGateResult.reason === "notification";
  const skipped = returnedFromNotificationGate && permissionGateResult.message.includes("나중에");
  if (skipped) {
    return {
      body: "푸시 알림은 대기 중",
      helper: "홈·출발 판단은 유지되며 실제 푸시만 제한됨",
      primaryLabel: "알림 권한 복구",
      status: "보류",
      tone: "warm",
      canRequest: true,
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
    };
  }
  return {
    body: "푸시 권한을 켜면 강수·출발 알림 수신",
    helper: "권한은 계정 연결과 별도이며 나중에 변경 가능",
    primaryLabel: "알림 권한 복구",
    status: "확인",
    tone: "warm",
    canRequest: true,
  };
}

function getPermissionResultCopy(
  permissionGateResult: P0ScreenProps["permissionGateResult"],
): { title: string; body: string; tone: "clear" | "warm" } | null {
  if (!permissionGateResult || permissionGateResult.returnTo !== "M4") return null;
  const skipped = permissionGateResult.message.includes("나중에");
  if (permissionGateResult.reason === "notification") {
    return {
      title: skipped ? "알림 권한 보류" : "알림 권한 확인됨",
      body: skipped ? "푸시 수신만 대기. 홈·출발 판단은 앱 안에서 계속 사용할 수 있음" : "확인 알림으로 실제 수신을 한 번 더 확인해야 함",
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
    gap: spacing.sm,
    minHeight: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 116,
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
    minHeight: 78,
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
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  permissionPanel: {
    gap: spacing.sm,
    padding: 12,
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
    gap: spacing.sm,
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
