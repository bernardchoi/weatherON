import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Image, PanResponder, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { uiIconAssets } from "../assets";
import { StatusPill } from "../components/StatusPill";
import type { P0RouteId } from "../navigation/routes";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing, type AppTheme } from "../theme/tokens";

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
  onGoBack,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const panelTranslateX = useRef(new Animated.Value(36)).current;
  const panelOpacity = useRef(new Animated.Value(0.98)).current;
  const closingRef = useRef(false);
  const [bulkDismissing, setBulkDismissing] = useState(false);
  const activeNotifications = state.notifications.filter((item) => item.active).slice(0, 6);
  const previewOnly = !permissionReady;
  const effectiveReadNotificationIds = previewOnly ? activeNotifications.map((item) => item.id) : readNotificationIds;
  const unreadCount = activeNotifications.filter((item) => !effectiveReadNotificationIds.includes(item.id)).length;
  const visibleNotifications = previewOnly
    ? activeNotifications
    : activeNotifications.filter((item) => !effectiveReadNotificationIds.includes(item.id));
  const hasUnread = unreadCount > 0;
  const hasHistory = notificationHistory.length > 0;
  const receivedAtByNotificationId = useMemo(() => {
    const records = new Map<string, string>();
    notificationHistory.forEach((item) => {
      if (item.action !== "received" || !item.occurredAt || records.has(item.notificationId)) return;
      records.set(item.notificationId, item.occurredAt);
    });
    return records;
  }, [notificationHistory]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(panelTranslateX, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(panelOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [panelOpacity, panelTranslateX]);

  const resetPanelPosition = () => {
    Animated.parallel([
      Animated.spring(panelTranslateX, {
        toValue: 0,
        damping: 18,
        stiffness: 180,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(panelOpacity, {
        toValue: 1,
        duration: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closePanel = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    Animated.parallel([
      Animated.timing(panelTranslateX, {
        toValue: Math.max(width, 360),
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(panelOpacity, {
        toValue: 0.88,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onGoBack();
        return;
      }
      closingRef.current = false;
    });
  };

  const panelPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => gesture.dx > 14 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
        onMoveShouldSetPanResponderCapture: (_, gesture) => gesture.dx > 14 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, gesture) => {
          const dx = Math.max(0, gesture.dx);
          panelTranslateX.setValue(dx);
          panelOpacity.setValue(Math.max(0.88, 1 - dx / Math.max(width * 1.8, 1)));
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > 92 || gesture.vx > 0.55) {
            closePanel();
            return;
          }
          resetPanelPosition();
        },
        onPanResponderTerminate: resetPanelPosition,
      }),
    [panelOpacity, panelTranslateX, width],
  );

  const handleMarkAllRead = () => {
    if (!hasUnread || bulkDismissing) return;
    setBulkDismissing(true);
    setTimeout(() => {
      onMarkAllNotificationsRead();
      setBulkDismissing(false);
    }, 260);
  };

  return (
    <Animated.View
      {...panelPanResponder.panHandlers}
      style={[styles.shell, { backgroundColor: theme.background, opacity: panelOpacity, transform: [{ translateX: panelTranslateX }] }]}
    >
      <ScrollView style={styles.panelScroll} contentContainerStyle={styles.panelContent}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>알림 센터</Text>
            <Text style={[styles.unread, { color: theme.subtle }]}>
              {previewOnly ? "권한 켜기 전 예시" : `${activeNotifications.length}개 활성 · 읽지 않음 ${unreadCount}개`}
            </Text>
          </View>
        </View>

        <View style={[styles.summaryBox, { backgroundColor: theme.cardStrong, borderColor: hasUnread ? theme.sky : theme.border }, cardShadow(theme)]}>
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
              onPress={handleMarkAllRead}
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
          {visibleNotifications.map((item, displayIndex) => {
            const route = item.deepLink as P0RouteId;
            const meta = getNotificationPresentation(displayIndex, route, item.title);
            const read = previewOnly || effectiveReadNotificationIds.includes(item.id);
            const receivedAt = receivedAtByNotificationId.get(item.id);
            const timestamp = receivedAt ?? item.scheduledAt ?? state.weatherProvider.currentObservedAt;
            const timestampLabel = receivedAt ? "푸시됨" : item.scheduledAt ? "예약됨" : "조건 감지";
            return (
              <NotificationCard
                key={item.id}
                meta={meta}
                read={read}
                previewOnly={previewOnly}
                reason={smartCareEnabled ? item.reason : "스마트 알림 꺼짐"}
                targetLabel={getNotificationTargetLabel(route)}
                timestamp={timestamp}
                timestampLabel={timestampLabel}
                onOpen={() => onOpenNotificationDeepLink(item.id, route)}
                onRead={() => onMarkNotificationRead(item.id)}
                bulkDismissing={bulkDismissing}
                dismissDelay={displayIndex * 28}
                theme={theme}
              />
            );
          })}
          {visibleNotifications.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow(theme)]}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>{activeNotifications.length === 0 ? "활성 알림 없음" : "새 알림 없음"}</Text>
              <Text style={[styles.emptyBody, { color: theme.muted }]}>
                {activeNotifications.length === 0 ? "알림 조건을 켜면 여기에서 바로 열어볼 수 있음" : "읽음 처리한 알림은 최근 처리에 남음"}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.historyBox, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow(theme)]}>
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
        </View>
      </ScrollView>
    </Animated.View>
  );
}

type NotificationPresentation = {
  icon: keyof typeof uiIconAssets;
  title: string;
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
  timestamp,
  timestampLabel,
  onOpen,
  onRead,
  bulkDismissing,
  dismissDelay,
  theme,
}: {
  meta: NotificationPresentation;
  read: boolean;
  previewOnly?: boolean;
  reason: string;
  targetLabel: string;
  timestamp?: string;
  timestampLabel: string;
  onOpen: () => void;
  onRead: () => void;
  bulkDismissing: boolean;
  dismissDelay: number;
  theme: AppTheme;
}) {
  const toneColor = getToneColor(theme, meta.tone);
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(read ? 0.72 : 1)).current;
  const dismissedRef = useRef(false);

  const animateDismiss = (commit = true) => {
    if (previewOnly || dismissedRef.current) return;
    dismissedRef.current = true;
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -420,
        duration: 230,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 210,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && commit) onRead();
    });
  };

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: read ? 0.72 : 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [opacity, read]);

  useEffect(() => {
    if (!bulkDismissing || previewOnly) return;
    const timeout = setTimeout(() => animateDismiss(false), dismissDelay);
    return () => clearTimeout(timeout);
  }, [bulkDismissing, dismissDelay, previewOnly]);

  const cardPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          !previewOnly && gesture.dx < -12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25,
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          !previewOnly && gesture.dx < -12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, gesture) => {
          const dx = Math.min(0, gesture.dx);
          translateX.setValue(dx);
          opacity.setValue(Math.max(0.72, 1 + dx / 460));
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx < -78 || gesture.vx < -0.55) {
            animateDismiss();
            return;
          }
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              damping: 18,
              stiffness: 190,
              mass: 0.8,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: read ? 0.72 : 1,
              duration: 160,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start();
        },
      }),
    [opacity, previewOnly, read, translateX],
  );

  return (
    <View style={styles.swipeShell}>
      <View style={[styles.swipeDeleteBackground, { backgroundColor: theme.warm }]}>
        <Text style={[styles.swipeDeleteText, { color: theme.background }]}>삭제</Text>
      </View>
      <Animated.View
        {...cardPanResponder.panHandlers}
        accessibilityLabel={`${meta.title}, ${timestampLabel} ${formatNotificationDateTime(timestamp)}, ${read ? "읽음" : "읽지 않음"}, ${targetLabel}로 이동 가능`}
        style={[
          styles.notificationCard,
          {
            backgroundColor: theme.card,
            borderColor: read ? theme.border : toneColor,
            opacity,
            transform: [{ translateX }],
          },
          cardShadow(theme),
        ]}
      >
        <View style={[styles.cardAccent, { backgroundColor: toneColor }]} />
        <View style={[styles.iconBox, { backgroundColor: theme.cardStrong }]}>
          <Image source={uiIconAssets[meta.icon]} style={[styles.iconImage, { tintColor: toneColor }]} resizeMode="contain" />
        </View>
        <View style={styles.copy}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{meta.title}</Text>
          </View>
          <Text style={[styles.cardTime, { color: theme.subtle }]}>{timestampLabel} · {formatNotificationDateTime(timestamp)}</Text>
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
            onPress={() => animateDismiss()}
            style={[styles.miniHit, { opacity: read ? 0.45 : 1 }]}
          >
            <Text style={[styles.miniText, { color: theme.subtle }]}>읽음</Text>
          </Pressable>
        </View>
      </Animated.View>
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
  const label = item.action === "open" ? "열림" : item.action === "sent" ? "발송" : item.action === "received" ? "수신" : "읽음";
  const dotColor = item.action === "open" ? theme.clear : item.action === "sent" || item.action === "received" ? theme.sky : theme.subtle;
  return (
    <View style={styles.historyRow}>
      <View style={[styles.historyDot, { backgroundColor: dotColor }]} />
      <View style={styles.historyCopy}>
        <Text style={[styles.historyItemTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.historyItemMeta, { color: theme.subtle }]}>
          {label} · {item.statusLabel}{item.occurredAt ? ` · ${formatNotificationDateTime(item.occurredAt)}` : ""}
        </Text>
      </View>
    </View>
  );
}

function getNotificationTargetLabel(route: P0RouteId): string {
  if (route === "H4") return "오늘 준비";
  if (route === "H5") return "강수 타임라인";
  if (route === "H7") return "내일 브리핑";
  if (route === "G2") return "목적지 케어";
  if (route === "M2") return "알림 설정";
  return "홈";
}

function getNotificationPresentation(index: number, route: P0RouteId, fallbackTitle: string): NotificationPresentation {
  if (route === "G2") {
    return {
      icon: "depart",
      title: fallbackTitle || "목적지 알림",
      detail: "출발 전 목적지 날씨 다시 확인",
      highlight: "목적지 케어 열기",
      tone: "clear",
    };
  }
  if (route === "H5") {
    return {
      icon: "rain",
      title: fallbackTitle || "비 예보 사전 알림",
      detail: "18시 시작 · 시간당 4mm · 21시 완화",
      highlight: "강수 타임라인 보기",
      tone: "sky",
    };
  }
  if (route === "H7") {
    return {
      icon: "clock",
      title: fallbackTitle || "내일 브리핑",
      detail: "내일 날씨·코디·우산 준비 확인",
      highlight: "내일 브리핑 열기",
      tone: "warm",
    };
  }
  if (route === "H4") {
    return {
      icon: "uv",
      title: fallbackTitle || "오늘 준비 알림",
      detail: "오늘 외출 전 준비 상태 확인",
      highlight: "오늘 준비 열기",
      tone: "sky",
    };
  }
  if (index === 0) {
    return {
      icon: "uv",
      title: "오늘의 아침 준비",
      detail: "21° 맑음 · 날씨 확인",
      highlight: "준비 상태 정상",
      tone: "clear",
    };
  }
  if (index === 1) {
    return {
      icon: "rain",
      title: "비 예보 사전 알림",
      detail: "18시 시작 · 시간당 4mm · 21시 완화",
      highlight: "강수 타임라인 보기",
      tone: "sky",
    };
  }
  if (index === 2) {
    return {
      icon: "depart",
      title: "목적지 변화",
      detail: "출발 10분 전 · 목적지 날씨 다시 확인",
      highlight: "목적지 기준 확인",
      tone: "clear",
    };
  }
  return {
    icon: "clock",
    title: "출발 알림",
    detail: "지금 출발하면 9:00 도착",
    highlight: "판교 · 40분 소요",
    tone: "warm",
  };
}

function formatNotificationDateTime(value?: string) {
  const timestamp = value ? Date.parse(value) : Number.NaN;
  if (!Number.isFinite(timestamp)) return "시각 확인 중";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(timestamp));
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
    justifyContent: "flex-start",
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
  swipeShell: {
    position: "relative",
    overflow: "hidden",
    borderRadius: radius.md,
  },
  swipeDeleteBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 92,
    alignItems: "center",
    justifyContent: "center",
  },
  swipeDeleteText: {
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
