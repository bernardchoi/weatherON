import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
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
  permissionReady,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onClearNotificationHistory,
  onOpenNotificationDeepLink,
  onNavigate,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const activeNotifications = state.notifications.filter((item) => item.active).slice(0, 6);
  const previewOnly = !permissionReady;
  const effectiveReadNotificationIds = previewOnly ? activeNotifications.map((item) => item.id) : readNotificationIds;
  const unreadCount = activeNotifications.filter((item) => !effectiveReadNotificationIds.includes(item.id)).length;
  const hasUnread = unreadCount > 0;
  const hasHistory = notificationHistory.length > 0;

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.panelScroll} contentContainerStyle={styles.panelContent}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>알림 센터</Text>
            <Text style={[styles.unread, { color: theme.subtle }]}>
              {previewOnly ? "권한 켜기 전 예시" : `${activeNotifications.length}개 활성 · 읽지 않음 ${unreadCount}개`}
            </Text>
          </View>
          <Pressable
            accessibilityLabel="알림 센터 닫기"
            accessibilityRole="button"
            onPress={() => onNavigate("H1")}
            style={[styles.closeButton, { borderColor: theme.border }]}
          >
            <Text style={[styles.closeText, { color: theme.text }]}>닫기</Text>
          </Pressable>
        </View>

        <View style={[styles.summaryBox, { backgroundColor: theme.cardStrong, borderColor: hasUnread ? theme.sky : theme.border }]}>
          <View style={styles.summaryCopy}>
            <Text style={[styles.summaryLabel, { color: hasUnread ? theme.skyLite : theme.clear }]}>
              {previewOnly ? "예시 알림" : hasUnread ? "확인 필요" : "새 알림 없음"}
            </Text>
            <Text style={[styles.summaryTitle, { color: theme.text }]}>
              {previewOnly ? "권한을 켜면 실제 알림으로 전환" : hasUnread ? `${unreadCount}개 알림을 먼저 확인` : "오늘 알림은 모두 읽음"}
            </Text>
            <Text style={[styles.summaryBody, { color: theme.muted }]}>
              {previewOnly ? "지금 보이는 항목은 예시라 읽지 않음 개수에 들어가지 않음" : "알림을 열면 관련 화면으로 이동하고 읽음 상태가 남음"}
            </Text>
          </View>
          <View style={styles.summaryActions}>
            <Pressable
              accessibilityLabel="모든 알림 읽음 처리"
              accessibilityRole="button"
              accessibilityState={{ disabled: !hasUnread }}
              disabled={!hasUnread}
              onPress={onMarkAllNotificationsRead}
              style={[styles.actionButton, { borderColor: theme.border, opacity: hasUnread ? 1 : 0.48 }]}
            >
              <Text style={[styles.actionButtonText, { color: theme.text }]}>전체 읽음</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="알림 조건 설정 열기"
              accessibilityRole="button"
              onPress={() => onNavigate("M2")}
              style={[styles.actionButton, { borderColor: theme.border }]}
            >
              <Text style={[styles.actionButtonText, { color: theme.text }]}>조건 설정</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.notificationList}>
          {activeNotifications.map((item, displayIndex) => {
            const route = item.deepLink as P0RouteId;
            const meta = getNotificationPresentation(displayIndex, route, item.title);
            const read = previewOnly || effectiveReadNotificationIds.includes(item.id);
            return (
              <NotificationCard
                key={item.id}
                meta={meta}
                read={read}
                previewOnly={previewOnly}
                reason={smartCareEnabled ? item.reason : "스마트 알림 꺼짐"}
                targetLabel={getNotificationTargetLabel(route)}
                onOpen={() => onOpenNotificationDeepLink(item.id, route)}
                onRead={() => onMarkNotificationRead(item.id)}
                theme={theme}
              />
            );
          })}
          {activeNotifications.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>활성 알림 없음</Text>
              <Text style={[styles.emptyBody, { color: theme.muted }]}>알림 조건을 켜면 여기에서 바로 열어볼 수 있음</Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.historyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.historyHeader}>
            <View>
              <Text style={[styles.historyTitle, { color: theme.text }]}>최근 처리</Text>
              <Text style={[styles.historyMeta, { color: theme.subtle }]}>
                {hasHistory ? `${notificationHistory.length}건 보관` : "아직 처리한 알림 없음"}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="알림 처리 이력 지우기"
              accessibilityRole="button"
              accessibilityState={{ disabled: !hasHistory }}
              disabled={!hasHistory}
              onPress={onClearNotificationHistory}
              style={[styles.historyClearButton, { borderColor: theme.border, opacity: hasHistory ? 1 : 0.48 }]}
            >
              <Text style={[styles.historyClearText, { color: theme.subtle }]}>이력 지우기</Text>
            </Pressable>
          </View>
          {hasHistory ? (
            <View style={styles.historyList}>
              {notificationHistory.slice(0, 4).map((item) => (
                <HistoryRow key={item.id} item={item} theme={theme} />
              ))}
            </View>
          ) : (
            <Text style={[styles.historyEmpty, { color: theme.muted }]}>읽음이나 열기 후 이력이 표시됨</Text>
          )}
        </View>

        <View style={styles.footerActions}>
          <Pressable accessibilityLabel="알림 설정 열기" accessibilityRole="button" onPress={() => onNavigate("M2")}>
            <Text style={[styles.footerAction, { color: theme.subtle }]}>알림 설정</Text>
          </Pressable>
          <Text style={[styles.footerDot, { color: theme.subtle }]}>·</Text>
          <Pressable accessibilityLabel="홈으로 돌아가기" accessibilityRole="button" onPress={() => onNavigate("H1")}>
            <Text style={[styles.footerAction, { color: theme.subtle }]}>홈으로</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

type NotificationPresentation = {
  icon: keyof typeof uiIconAssets;
  title: string;
  time: string;
  detail: string;
  highlight: string;
  tone: "clear" | "gold" | "sky" | "warm";
};

function NotificationCard({
  meta,
  read,
  previewOnly,
  reason,
  targetLabel,
  onOpen,
  onRead,
  theme,
}: {
  meta: NotificationPresentation;
  read: boolean;
  previewOnly?: boolean;
  reason: string;
  targetLabel: string;
  onOpen: () => void;
  onRead: () => void;
  theme: AppTheme;
}) {
  const toneColor = getToneColor(theme, meta.tone);
  return (
    <View
      accessibilityLabel={`${meta.title}, ${read ? "읽음" : "읽지 않음"}, ${targetLabel}로 이동 가능`}
      style={[
        styles.notificationCard,
        {
          backgroundColor: theme.card,
          borderColor: read ? theme.border : toneColor,
          opacity: read ? 0.72 : 1,
        },
      ]}
    >
      <View style={[styles.cardAccent, { backgroundColor: toneColor }]} />
      <View style={[styles.iconBox, { backgroundColor: theme.cardStrong }]}>
        <Image source={uiIconAssets[meta.icon]} style={[styles.iconImage, { tintColor: toneColor }]} resizeMode="contain" />
      </View>
      <View style={styles.copy}>
        <View style={styles.cardTitleRow}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{meta.title}</Text>
          <Text style={[styles.cardTime, { color: theme.subtle }]}>{meta.time}</Text>
        </View>
        <Text style={[styles.reason, { color: theme.muted }]}>{previewOnly ? "권한을 켜면 실제 푸시로 받음" : meta.detail || reason}</Text>
        <Text style={[styles.highlight, { color: toneColor }]}>{meta.highlight}</Text>
      </View>
      <View style={styles.cardMeta}>
        <View style={[styles.unreadDot, { backgroundColor: read ? theme.border : toneColor }]} />
        {previewOnly ? <Text style={[styles.miniText, { color: theme.subtle }]}>예시</Text> : null}
        <Pressable accessibilityLabel={`${meta.title} 열기`} accessibilityRole="button" onPress={onOpen} style={styles.miniHit}>
          <Text style={[styles.miniText, { color: theme.text }]}>열기</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={`${meta.title} 읽음 처리`}
          accessibilityRole="button"
          accessibilityState={{ disabled: read }}
          disabled={read}
          onPress={onRead}
          style={[styles.miniHit, { opacity: read ? 0.45 : 1 }]}
        >
          <Text style={[styles.miniText, { color: theme.subtle }]}>읽음</Text>
        </Pressable>
      </View>
    </View>
  );
}

function HistoryRow({
  item,
  theme,
}: {
  item: P0ScreenProps["notificationHistory"][number];
  theme: AppTheme;
}) {
  const label = item.action === "open" ? "열림" : item.action === "sent" ? "발송" : "읽음";
  const dotColor = item.action === "open" ? theme.clear : item.action === "sent" ? theme.sky : theme.subtle;
  return (
    <View style={styles.historyRow}>
      <View style={[styles.historyDot, { backgroundColor: dotColor }]} />
      <View style={styles.historyCopy}>
        <Text style={[styles.historyItemTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.historyItemMeta, { color: theme.subtle }]}>
          {label} · {item.statusLabel}
        </Text>
      </View>
    </View>
  );
}

function getNotificationTargetLabel(route: P0RouteId): string {
  if (route === "H4") return "오늘 준비";
  if (route === "H5") return "강수 타임라인";
  if (route === "G2") return "목적지 케어";
  if (route === "M2") return "알림 설정";
  return "홈";
}

function getNotificationPresentation(index: number, route: P0RouteId, fallbackTitle: string): NotificationPresentation {
  if (route === "G2") {
    return {
      icon: "depart",
      title: fallbackTitle || "목적지 알림",
      time: "08:20",
      detail: "출발 전 목적지 날씨 다시 확인",
      highlight: "목적지 케어 열기",
      tone: "clear",
    };
  }
  if (route === "H5") {
    return {
      icon: "rain",
      title: fallbackTitle || "비 예보 사전 알림",
      time: "14:00",
      detail: "18시 시작 · 시간당 4mm · 21시 완화",
      highlight: "강수 타임라인 보기",
      tone: "sky",
    };
  }
  if (route === "H4") {
    return {
      icon: "uv",
      title: fallbackTitle || "오늘 준비 알림",
      time: "07:30",
      detail: "오늘 외출 전 준비 상태 확인",
      highlight: "오늘 준비 열기",
      tone: "sky",
    };
  }
  if (index === 0) {
    return {
      icon: "uv",
      title: "오늘의 외출 준비",
      time: "07:30",
      detail: "21° 맑음 · 출발 전 날씨 확인",
      highlight: "준비 상태 정상",
      tone: "clear",
    };
  }
  if (index === 1) {
    return {
      icon: "rain",
      title: "비 예보 사전 알림",
      time: "14:00",
      detail: "18시 시작 · 시간당 4mm · 21시 완화",
      highlight: "강수 타임라인 보기",
      tone: "sky",
    };
  }
  if (index === 2) {
    return {
      icon: "depart",
      title: "목적지 변화",
      time: "08:20",
      detail: "출발 10분 전 · 목적지 날씨 다시 확인",
      highlight: "목적지 기준 확인",
      tone: "clear",
    };
  }
  return {
    icon: "clock",
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
  summaryBox: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  summaryLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  summaryTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  summaryBody: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  summaryActions: {
    gap: spacing.xs,
    justifyContent: "center",
  },
  actionButton: {
    minHeight: 32,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
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
  iconImage: {
    width: 18,
    height: 18,
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
  emptyBox: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  emptyBody: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  historyBox: {
    gap: spacing.sm,
    marginTop: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  historyTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  historyMeta: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  historyClearButton: {
    minHeight: 32,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  historyClearText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  historyList: {
    gap: spacing.xs,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  historyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  historyCopy: {
    flex: 1,
    minWidth: 0,
  },
  historyItemTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  historyItemMeta: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  historyEmpty: {
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
