import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusPill } from "../components/StatusPill";
import type { P0RouteId } from "../navigation/routes";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

export function NotificationCenterScreen({
  state,
  readNotificationIds,
  notificationHistory,
  smartCareEnabled,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onEditNotificationCondition,
  onOpenNotificationDeepLink,
  onNavigate,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const activeNotifications = state.notifications.filter((item) => item.active).slice(0, 4);
  const visibleNotifications = buildVisibleNotifications(activeNotifications);
  const unreadCount = activeNotifications.filter((item) => !readNotificationIds.includes(item.id)).length;
  const displayUnreadCount = unreadCount > 0 ? Math.min(2, unreadCount) : 0;
  const selectedNotification = activeNotifications[1] ?? activeNotifications[0];

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <View style={[styles.leftRail, { backgroundColor: theme.nav }]}>
        <Text style={[styles.time, { color: theme.subtle }]}>9:41</Text>
        <View style={styles.railCenter}>
          <Text style={[styles.railText, { color: theme.subtle }]}>홈</Text>
          <Text style={[styles.railSub, { color: theme.subtle }]}>화면</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => onNavigate("H1")} style={[styles.railHome, { backgroundColor: theme.background }]}>
          <Text style={[styles.railHomeIcon, { color: theme.gold }]}>⌂</Text>
          <Text style={[styles.railHomeText, { color: theme.gold }]}>홈</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.panelScroll} contentContainerStyle={styles.panelContent}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>알림</Text>
            <Text style={[styles.unread, { color: theme.subtle }]}>읽지 않음 {displayUnreadCount}개</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => onNavigate("H1")} style={[styles.closeButton, { borderColor: theme.border }]}>
            <Text style={[styles.closeText, { color: theme.text }]}>닫기</Text>
          </Pressable>
        </View>

        <View style={styles.notificationList}>
          {visibleNotifications.map(({ item, displayIndex }) => {
            const route = item.deepLink as P0RouteId;
            const meta = getNotificationPresentation(displayIndex, route, item.title);
            const read = readNotificationIds.includes(item.id);
            return (
              <NotificationCard
                key={`${item.id}:${displayIndex}`}
                meta={meta}
                read={read}
                reason={smartCareEnabled ? item.reason : "스마트 알림 꺼짐"}
                onOpen={() => onOpenNotificationDeepLink(item.id, route)}
                onRead={() => onMarkNotificationRead(item.id)}
                onEdit={() => onEditNotificationCondition(item.id, route)}
                theme={theme}
              />
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => selectedNotification && onOpenNotificationDeepLink(selectedNotification.id, selectedNotification.deepLink as P0RouteId)}
          style={[styles.selectedBox, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
        >
          <Text style={[styles.selectedLabel, { color: theme.gold }]}>알림</Text>
          <Text style={[styles.selectedText, { color: theme.muted }]}>
            선택 알림 · {selectedNotification ? getNotificationTargetLabel(selectedNotification.deepLink as P0RouteId) : "오늘 준비"}
          </Text>
        </Pressable>

        <View style={styles.footerActions}>
          <Pressable accessibilityRole="button" onPress={onMarkAllNotificationsRead}>
            <Text style={[styles.footerAction, { color: theme.subtle }]}>읽음 처리</Text>
          </Pressable>
          <Text style={[styles.footerDot, { color: theme.subtle }]}>·</Text>
          <Text style={[styles.footerAction, { color: theme.subtle }]}>
            최근 {notificationHistory.length > 0 ? notificationHistory.length : 7}일 보관
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function buildVisibleNotifications<T>(items: T[]): { item: T; displayIndex: number }[] {
  if (items.length === 0) return [];
  const visible = items.map((item, displayIndex) => ({ item, displayIndex }));
  while (visible.length < 4) {
    visible.push({ item: items[items.length - 1], displayIndex: visible.length });
  }
  return visible.slice(0, 4);
}

type NotificationPresentation = {
  icon: string;
  title: string;
  time: string;
  detail: string;
  highlight: string;
  tone: "clear" | "gold" | "sky" | "warm";
};

function NotificationCard({
  meta,
  read,
  reason,
  onOpen,
  onRead,
  onEdit,
  theme,
}: {
  meta: NotificationPresentation;
  read: boolean;
  reason: string;
  onOpen: () => void;
  onRead: () => void;
  onEdit: () => void;
  theme: AppTheme;
}) {
  const toneColor = getToneColor(theme, meta.tone);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onOpen}
      style={({ pressed }) => [
        styles.notificationCard,
        {
          backgroundColor: pressed ? theme.cardSoft : theme.card,
          borderColor: read ? theme.border : toneColor,
          opacity: read ? 0.72 : 1,
        },
      ]}
    >
      <View style={[styles.cardAccent, { backgroundColor: toneColor }]} />
      <View style={[styles.iconBox, { backgroundColor: theme.cardStrong }]}>
        <Text style={[styles.iconText, { color: toneColor }]}>{meta.icon}</Text>
      </View>
      <View style={styles.copy}>
        <View style={styles.cardTitleRow}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{meta.title}</Text>
          <Text style={[styles.cardTime, { color: theme.subtle }]}>{meta.time}</Text>
        </View>
        <Text style={[styles.reason, { color: theme.muted }]}>{meta.detail || reason}</Text>
        <Text style={[styles.highlight, { color: toneColor }]}>{meta.highlight}</Text>
      </View>
      <View style={styles.cardMeta}>
        <View style={[styles.unreadDot, { backgroundColor: read ? theme.border : toneColor }]} />
        <Pressable accessibilityRole="button" onPress={onRead} style={styles.miniHit}>
          <Text style={[styles.miniText, { color: theme.subtle }]}>읽음</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onEdit} style={styles.miniHit}>
          <Text style={[styles.miniText, { color: theme.subtle }]}>조건</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function getNotificationTargetLabel(route: P0RouteId): string {
  if (route === "H4") return "우산 추천";
  if (route === "H5") return "강수 타임라인";
  if (route === "G2") return "목적지 케어";
  if (route === "M2") return "알림 설정";
  return "홈";
}

function getNotificationPresentation(index: number, route: P0RouteId, fallbackTitle: string): NotificationPresentation {
  if (index === 0) {
    return {
      icon: "☼",
      title: "오늘의 외출 준비",
      time: "07:30",
      detail: "21° 맑음 · 추천 코디: 반팔 + 얇은 가디건",
      highlight: "우산 필요없음",
      tone: "gold",
    };
  }
  if (route === "H5" || index === 1) {
    return {
      icon: "☂",
      title: "비 예보 사전 알림",
      time: "14:00",
      detail: "18시 시작 · 시간당 4mm · 21시 그침",
      highlight: "변하면 강수 타임라인(H5)",
      tone: "sky",
    };
  }
  if (route === "H4" || index === 2) {
    return {
      icon: "▱",
      title: "신발 추천",
      time: "08:20",
      detail: "출발 10분 전 · 오늘은 방수 신발 권장",
      highlight: "노면 습도 높음",
      tone: "clear",
    };
  }
  return {
    icon: "⌁",
    title: "출발 알림",
    time: "08:30",
    detail: "지금 출발하면 9:00 도착",
    highlight: "판교 · 40분 소요",
    tone: "warm",
  };
}

function getToneColor(theme: AppTheme, tone: NotificationPresentation["tone"]) {
  if (tone === "gold") return theme.gold;
  if (tone === "sky") return theme.sky;
  if (tone === "warm") return theme.warm;
  return theme.clear;
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: "row",
  },
  leftRail: {
    width: 110,
    minHeight: "100%",
    justifyContent: "space-between",
    paddingTop: 38,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  time: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  railCenter: {
    alignItems: "center",
    gap: 4,
  },
  railText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  railSub: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  railHome: {
    minHeight: 64,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  railHomeIcon: {
    fontSize: 24,
    lineHeight: 26,
    fontWeight: "900",
  },
  railHomeText: {
    fontSize: 11,
    fontWeight: "900",
  },
  panelScroll: {
    flex: 1,
  },
  panelContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: 70,
    paddingBottom: 34,
  },
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "900",
  },
  unread: {
    marginTop: spacing.md,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  closeButton: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  closeText: {
    fontSize: 14,
    fontWeight: "800",
  },
  notificationList: {
    gap: spacing.sm,
  },
  notificationCard: {
    minHeight: 84,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconBox: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  iconText: {
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "900",
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  cardTitle: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },
  cardTime: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
  },
  reason: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  highlight: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
    fontWeight: "900",
  },
  cardMeta: {
    alignItems: "flex-end",
    gap: 7,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  miniHit: {
    minHeight: 22,
    justifyContent: "center",
  },
  miniText: {
    fontSize: 10,
    fontWeight: "700",
  },
  selectedBox: {
    gap: 6,
    marginTop: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  selectedLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  selectedText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  footerAction: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  footerDot: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
});
