import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0RouteId } from "../navigation/routes";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, radius, spacing } from "../theme/tokens";

export function NotificationCenterScreen({
  state,
  readNotificationIds,
  notificationHistory,
  smartCareEnabled,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onClearNotificationHistory,
  onEditNotificationCondition,
  onOpenNotificationDeepLink,
  onNavigate,
}: P0ScreenProps) {
  const unreadCount = state.notifications.filter((item) => item.active && !readNotificationIds.includes(item.id)).length;

  return (
    <AppScreen title="알림 센터" subtitle="예정/완료와 읽음 상태를 유지하고 관련 화면으로 딥링크" badge="H3">
      <Section title="오늘 알림" caption={`${unreadCount}개 미읽음 · 스마트 케어 ${smartCareEnabled ? "켜짐" : "꺼짐"}`}>
        {state.notifications.map((item) => {
          const read = !item.active || readNotificationIds.includes(item.id);
          const targetRoute = item.deepLink as P0RouteId;
          return (
            <View key={item.id} style={[styles.notificationCard, item.active ? styles.activeCard : null]}>
              <View style={styles.cardHeader}>
                <View style={styles.copy}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.reason}>{smartCareEnabled ? item.reason : "스마트 알림 꺼짐. 앱 내 이력만 유지"}</Text>
                </View>
                <View style={styles.pillStack}>
                  <StatusPill label={item.active ? "예정" : "대기"} tone={item.active ? "clear" : "warm"} />
                  <StatusPill label={read ? "읽음" : "미읽음"} tone={read ? "sky" : "gold"} />
                </View>
              </View>
              <View style={styles.footer}>
                <Text style={styles.deepLink}>딥링크 {targetRoute}</Text>
                <View style={styles.cardActions}>
                  <AppButton label="이동" onPress={() => onOpenNotificationDeepLink(item.id, targetRoute)} />
                  <AppButton label="조건" onPress={() => onEditNotificationCondition(item.id, targetRoute)} tone="secondary" />
                  <AppButton label="읽음" onPress={() => onMarkNotificationRead(item.id)} tone="secondary" />
                </View>
              </View>
            </View>
          );
        })}
      </Section>

      <Section
        title="최근 알림 이력"
        caption={notificationHistory.length > 0 ? `${notificationHistory.length}개 저장됨` : "읽음 또는 이동 후 여기에 기록"}
      >
        <View style={styles.historyActions}>
          <AppButton label="모두 읽음" onPress={onMarkAllNotificationsRead} tone="secondary" />
          <AppButton label="이력 지우기" onPress={onClearNotificationHistory} tone="secondary" />
        </View>
        {notificationHistory.length > 0 ? (
          notificationHistory.map((item) => (
            <View key={item.id} style={styles.historyRow}>
              <View style={styles.copy}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.reason}>{item.statusLabel}</Text>
              </View>
              <StatusPill label={item.action === "open" ? "이동" : "읽음"} tone={item.action === "open" ? "clear" : "sky"} />
            </View>
          ))
        ) : (
          <Text style={styles.emptyHistory}>아직 저장된 알림 이력 없음</Text>
        )}
      </Section>

      <Section title="알림 관리" caption="권한이 없어도 H1/H3 앱 내 알림 안내는 유지됨">
        <View style={styles.actions}>
          <AppButton label="알림 설정" onPress={() => onNavigate("M2")} />
          <AppButton label="홈" onPress={() => onNavigate("H1")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  notificationCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  activeCard: {
    borderColor: "rgba(103,232,208,0.34)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  reason: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  pillStack: {
    gap: spacing.xs,
    alignItems: "flex-end",
  },
  footer: {
    gap: spacing.sm,
  },
  cardActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  historyRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  historyActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  emptyHistory: {
    color: appColors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  deepLink: {
    color: appColors.subtle,
    fontSize: 12,
    fontWeight: "900",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
