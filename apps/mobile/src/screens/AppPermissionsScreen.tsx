import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

export function AppPermissionsScreen({
  locationReady,
  weatherLocationMode,
  permissionReady,
  smartCareEnabled,
  onNavigate,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const locationCopy = getLocationPermissionCopy(locationReady, weatherLocationMode);
  const notificationCopy = getNotificationPermissionCopy(permissionReady, smartCareEnabled);

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <Pressable accessibilityLabel="뒤로" accessibilityRole="button" onPress={() => onNavigate("M1")} style={[styles.backButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <ChevronLeft color={theme.muted} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>앱 권한 관리</Text>
        </View>

        <View style={[styles.permissionCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
          <Text style={[styles.sectionLabel, { color: theme.muted }]}>권한 상태</Text>
          <PermissionRow
            label="위치 권한"
            body={locationCopy.body}
            status={locationCopy.status}
            tone={locationCopy.tone}
            onPress={() => onNavigate("H2")}
            theme={theme}
          />
          <PermissionRow
            label="알림 권한"
            body={notificationCopy.body}
            status={notificationCopy.status}
            tone={notificationCopy.tone}
            onPress={() => onNavigate("M2")}
            theme={theme}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function PermissionRow({
  label,
  body,
  status,
  tone,
  onPress,
  theme,
}: {
  label: string;
  body: string;
  status: string;
  tone: "clear" | "gold" | "warm";
  onPress: () => void;
  theme: AppTheme;
}) {
  const color = tone === "clear" ? theme.clear : tone === "gold" ? theme.gold : theme.warm;
  return (
    <Pressable
      accessibilityLabel={`${label}, ${status}`}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.permissionRow, { backgroundColor: theme.card, borderColor: theme.border }]}
    >
      <View style={[styles.permissionDot, { backgroundColor: color }]} />
      <View style={styles.permissionCopy}>
        <Text style={[styles.permissionLabel, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.permissionBody, { color: theme.subtle }]} numberOfLines={2}>{body}</Text>
      </View>
      <View style={[styles.permissionStatus, { backgroundColor: `${color}22` }]}>
        <Text style={[styles.permissionStatusText, { color }]}>{status}</Text>
      </View>
    </Pressable>
  );
}

function ChevronLeft({ color }: { color: string }) {
  return (
    <View style={styles.chevronLeft} accessibilityElementsHidden>
      <View style={[styles.chevronLeftTop, { backgroundColor: color }]} />
      <View style={[styles.chevronLeftBottom, { backgroundColor: color }]} />
    </View>
  );
}

function getLocationPermissionCopy(
  locationReady: boolean,
  weatherLocationMode: P0ScreenProps["weatherLocationMode"],
): { body: string; status: string; tone: "clear" | "gold" | "warm" } {
  if (locationReady && weatherLocationMode === "auto") {
    return { body: "현재 위치 기준 홈 날씨 반영 중", status: "허용됨", tone: "clear" };
  }
  if (weatherLocationMode === "manual") {
    return { body: "수동 위치 기준으로 홈 날씨 유지", status: "수동", tone: "gold" };
  }
  return { body: "현재 위치 또는 수동 위치 설정 필요", status: "확인", tone: "warm" };
}

function getNotificationPermissionCopy(
  permissionReady: boolean,
  smartCareEnabled: boolean,
): { body: string; status: string; tone: "clear" | "gold" | "warm" } {
  if (!smartCareEnabled) return { body: "스마트 알림 꺼짐 · 앱 안 판단은 유지", status: "중지", tone: "gold" };
  if (permissionReady) return { body: "비·출발 알림 받을 수 있음", status: "허용됨", tone: "clear" };
  return { body: "푸시 권한을 켜면 강수·출발 알림 수신", status: "확인", tone: "warm" };
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
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
  permissionRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
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
  sectionLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  chevronLeft: {
    width: 18,
    height: 18,
    justifyContent: "center",
  },
  chevronLeftTop: {
    width: 10,
    height: 2,
    borderRadius: radius.pill,
    transform: [{ rotate: "-45deg" }, { translateY: -2 }],
  },
  chevronLeftBottom: {
    width: 10,
    height: 2,
    borderRadius: radius.pill,
    transform: [{ rotate: "45deg" }, { translateY: 2 }],
  },
  bottomSpacer: {
    height: 42,
  },
});
