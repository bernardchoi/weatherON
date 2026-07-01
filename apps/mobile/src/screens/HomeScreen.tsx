import React, { useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { WeatherStatusPanel } from "../components/WeatherStatusPanel";
import { WeatherSummary } from "../components/WeatherSummary";
import type { P0RouteId } from "../navigation/routes";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

export function HomeScreen({
  state,
  readNotificationIds,
  notificationHistory,
  smartCareEnabled,
  isWeatherLoading,
  permissionReady,
  onNavigate,
  onSetWeatherProviderMode,
  onRefreshWeather,
  onMarkAllNotificationsRead,
  onOpenNotificationDeepLink,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const [notificationSidebarOpen, setNotificationSidebarOpen] = useState(false);
  const activeNotifications = state.notifications.filter((item) => item.active);
  const unreadNotificationCount = activeNotifications.filter((item) => !readNotificationIds.includes(item.id)).length;
  const destinationReady = state.hasDestination && state.destinationCare.name !== "목적지 미등록";
  const homeDecision = buildHomeDecision(state.destinationCare, destinationReady);

  return (
    <View style={styles.screenWrap}>
      <AppScreen
        title="나가기 전 5초 판단"
        subtitle="언제 나갈지, 목적지는 다른지, 비는 언제 그치는지 먼저 확인"
        heroAction={
          <NotificationBellButton
            unreadCount={unreadNotificationCount}
            smartCareEnabled={smartCareEnabled}
            theme={theme}
            onPress={() => setNotificationSidebarOpen(true)}
          />
        }
      >
        <WeatherSummary
          originWeather={state.destinationCare.originWeather}
          destinationWeather={state.destinationCare.destinationWeather}
          destinationName={state.destinationCare.name}
          sourceLabel={buildWeatherSourceLabel(
            state.weatherProvider.currentSource,
            state.weatherProvider.destinationSource,
            state.weatherProvider.fallbackUsed,
          )}
          updatedAtLabel={buildWeatherUpdatedAtLabel(state.weatherProvider.currentObservedAt, state.weatherProvider.destinationObservedAt)}
          loading={isWeatherLoading}
          destinationReady={destinationReady}
          onRefresh={onRefreshWeather}
          onAddDestination={() => onNavigate("P1")}
        />
        <WeatherStatusPanel
          status={state.weatherProvider.status}
          message={state.weatherProvider.message}
          retryable={state.weatherProvider.retryable}
          loading={isWeatherLoading}
          onSetMode={onSetWeatherProviderMode}
          onRetry={onRefreshWeather}
        />

        <Section title="오늘 바로 결정" caption="나가기 전 먼저 볼 세 가지" accent="gold">
          <View style={styles.priorityGrid}>
            <PriorityCard
              index="01"
              label="언제 나가야 함"
              title={`${homeDecision.departureTime} 출발`}
              body={homeDecision.departureBody}
              accent={theme.gold}
              icon={uiIconAssets.depart}
              theme={theme}
              actionLabel="출발"
              accessibilityLabel="출발 탭에서 출발 시간 확인"
              onPress={() => onNavigate("G1")}
            />
            <PriorityCard
              index="02"
              label="목적지는 다른가"
              title={homeDecision.destinationTitle}
              body={homeDecision.destinationBody}
              accent={theme.sky}
              icon={uiIconAssets.pin}
              theme={theme}
              actionLabel={destinationReady ? "비교" : "추가"}
              accessibilityLabel={destinationReady ? "목적지 날씨 비교 보기" : "목적지 추가하기"}
              onPress={() => onNavigate(destinationReady ? "G2" : "P1")}
            />
            <PriorityCard
              index="03"
              label="비는 언제 그침"
              title={homeDecision.rainTitle}
              body={homeDecision.rainBody}
              accent={theme.clear}
              icon={uiIconAssets.rain}
              theme={theme}
              actionLabel="강수"
              accessibilityLabel="강수 타임라인 보기"
              onPress={() => onNavigate("H5")}
            />
          </View>
        </Section>
      </AppScreen>

      <NotificationSidebar
        visible={notificationSidebarOpen}
        notifications={activeNotifications}
        readNotificationIds={readNotificationIds}
        notificationHistory={notificationHistory}
        smartCareEnabled={smartCareEnabled}
        permissionReady={permissionReady}
        theme={theme}
        onClose={() => setNotificationSidebarOpen(false)}
        onMarkAllNotificationsRead={onMarkAllNotificationsRead}
        onOpenSettings={() => {
          setNotificationSidebarOpen(false);
          onNavigate("M2");
        }}
        onOpen={(id, route) => {
          onOpenNotificationDeepLink(id, route);
          setNotificationSidebarOpen(false);
        }}
      />
    </View>
  );
}

function buildHomeDecision(care: P0ScreenProps["state"]["destinationCare"], destinationReady: boolean) {
  const targetArrivalTime = care.departureAdvice?.targetArrivalTime ?? "13:00";
  const travelMinutes = care.departureAdvice?.travelMinutes ?? 40;
  const bufferMinutes = care.departureAdvice?.bufferMinutes ?? 10;
  const departureTime = care.departureAdvice?.recommendedDepartureTime ?? subtractMinutes(targetArrivalTime, travelMinutes + bufferMinutes);
  const destinationDiff = destinationReady
    ? buildDestinationDiff(care)
    : {
        title: "목적지 없음",
        body: "목적지 추가하면 출발시간까지 계산",
      };
  const rainWindow = destinationReady
    ? buildRainWindow(care)
    : {
        title: "목적지 추가 후 계산",
        body: "저장한 목적지 기준으로 강수 시작과 완화 시점을 계산",
      };

  return {
    departureTime,
    departureBody: destinationReady ? `${targetArrivalTime} 도착 · 이동 ${travelMinutes}분 · 여유 ${bufferMinutes}분 반영` : "현재 위치 예보 연결됨 · 목적지 추가하면 출발시간까지 계산",
    destinationTitle: destinationDiff.title,
    destinationBody: destinationReady ? `${care.name} · ${destinationDiff.body}` : destinationDiff.body,
    rainTitle: rainWindow.title,
    rainBody: destinationReady ? rainWindow.body : rainWindow.body,
  };
}

function buildDestinationDiff(care: P0ScreenProps["state"]["destinationCare"]) {
  const origin = care.originWeather.current;
  const destination = care.destinationWeather.current;
  const tempDiff = Math.round(destination.tempC - origin.tempC);
  const rainDiff = Math.round(destination.rainProbabilityPct - origin.rainProbabilityPct);
  const windDiff = Number((destination.windMs - origin.windMs).toFixed(1));
  const titleParts = [
    tempDiff === 0 ? "±0°" : `${tempDiff > 0 ? "+" : ""}${tempDiff}°`,
    `${destination.rainProbabilityPct}%`,
  ];
  const diffParts = [
    rainDiff === 0 ? "강수 차이 없음" : `강수 ${rainDiff > 0 ? "+" : ""}${rainDiff}%`,
    windDiff === 0 ? "바람 차이 없음" : `바람 ${windDiff > 0 ? "+" : ""}${windDiff}m/s`,
  ];
  return {
    title: titleParts.join(" · "),
    body: `${care.originWeather.locationName} 대비 ${diffParts.join(" · ")} · 목적지 기준 준비`,
  };
}

function buildRainWindow(care: P0ScreenProps["state"]["destinationCare"]) {
  const threshold = care.alertCondition?.rainThresholdPct ?? 50;
  const rainyHours = care.destinationWeather.hourly.filter((hour) => hour.rainProbabilityPct >= threshold || hour.precipitationMm > 0);
  if (rainyHours.length === 0) {
    const maxRain = Math.max(care.destinationWeather.current.rainProbabilityPct, ...care.destinationWeather.hourly.map((hour) => hour.rainProbabilityPct));
    return {
      title: `최대 강수 ${Math.round(maxRain)}%`,
      body: `${care.name} 기준 ${threshold}% 미만 · 강수 알림은 조용히 대기`,
    };
  }
  const firstRain = rainyHours[0];
  const lastRain = rainyHours[rainyHours.length - 1];
  return {
    title: `${formatHour(firstRain.time)} 시작 · ${formatHour(lastRain.time)} 완화`,
    body: `${care.name} 강수 ${threshold}% 기준 · 타임라인에서 그침 알림 조정 가능`,
  };
}

function subtractMinutes(time: string, minutes: number) {
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return time;
  const dayMinutes = 24 * 60;
  const total = ((hour * 60 + minute - minutes) % dayMinutes + dayMinutes) % dayMinutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function formatHour(value: string) {
  const directTime = value.match(/(\d{1,2}):(\d{2})/);
  if (directTime) return `${directTime[1].padStart(2, "0")}:${directTime[2]}`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${String(date.getHours()).padStart(2, "0")}:00`;
}

function buildWeatherSourceLabel(
  currentSource: P0ScreenProps["state"]["weatherProvider"]["currentSource"],
  destinationSource: P0ScreenProps["state"]["weatherProvider"]["destinationSource"],
  fallbackUsed: boolean,
) {
  if (fallbackUsed || currentSource === "fallback" || destinationSource === "fallback") return "기본 예보";
  if (currentSource === "kma" || destinationSource === "kma") return "기상청 예보";
  if (currentSource === "openmeteo" || destinationSource === "openmeteo") return "실시간 예보";
  if (currentSource === "cache" || destinationSource === "cache") return "최근 예보";
  return "예보 연결";
}

function buildWeatherUpdatedAtLabel(currentObservedAt: string, destinationObservedAt: string) {
  const currentTime = new Date(currentObservedAt).getTime();
  const destinationTime = new Date(destinationObservedAt).getTime();
  const latestTime = Math.max(
    Number.isFinite(currentTime) ? currentTime : 0,
    Number.isFinite(destinationTime) ? destinationTime : 0,
  );
  if (!latestTime) return "갱신 시각 확인 중";
  const latest = new Date(latestTime);
  return `갱신 ${String(latest.getHours()).padStart(2, "0")}:${String(latest.getMinutes()).padStart(2, "0")}`;
}

function PriorityCard({
  index,
  label,
  title,
  body,
  accent,
  icon,
  theme,
  actionLabel,
  accessibilityLabel,
  onPress,
}: {
  index: string;
  label: string;
  title: string;
  body: string;
  accent: string;
  icon: number;
  theme: AppTheme;
  actionLabel: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.priorityItem, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}
    >
      <View style={[styles.priorityRail, { backgroundColor: accent }]} />
      <View style={styles.priorityLeading}>
        <View style={[styles.priorityIconBox, { borderColor: `${accent}66`, backgroundColor: theme.cardSoft }]}>
          <Image source={icon} style={[styles.priorityIcon, { tintColor: accent }]} resizeMode="contain" />
        </View>
        <Text style={[styles.priorityIndex, { color: accent }]}>{index}</Text>
      </View>
      <View style={styles.priorityCopy}>
        <Text style={[styles.priorityKicker, { color: accent }]}>{label}</Text>
        <Text style={[styles.priorityTitle, { color: theme.text }]} numberOfLines={1}>{title}</Text>
        <Text style={[styles.priorityBody, { color: theme.muted }]} numberOfLines={1}>{body}</Text>
      </View>
      <View style={[styles.priorityActionPill, { backgroundColor: theme.cardSoft }]}>
        <Text style={[styles.priorityActionText, { color: theme.text }]}>{actionLabel}</Text>
      </View>
    </Pressable>
  );
}

function NotificationBellButton({
  unreadCount,
  smartCareEnabled,
  onPress,
  theme,
}: {
  unreadCount: number;
  smartCareEnabled: boolean;
  onPress: () => void;
  theme: AppTheme;
}) {
  const label = smartCareEnabled ? `알림 열기, 읽지 않음 ${unreadCount}개` : "알림 열기, 스마트 케어 꺼짐";
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.bellButton, { backgroundColor: theme.cardStrong, borderColor: unreadCount > 0 ? theme.gold : theme.border }]}
    >
      <BellGlyph color={theme.text} />
      {unreadCount > 0 ? (
        <View style={[styles.bellBadge, { backgroundColor: theme.alert }]}>
          <Text style={[styles.bellBadgeText, { color: theme.onAccent }]}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function NotificationSidebar({
  visible,
  notifications,
  readNotificationIds,
  notificationHistory,
  smartCareEnabled,
  permissionReady,
  onClose,
  onMarkAllNotificationsRead,
  onOpenSettings,
  onOpen,
  theme,
}: {
  visible: boolean;
  notifications: P0ScreenProps["state"]["notifications"];
  readNotificationIds: string[];
  notificationHistory: P0ScreenProps["notificationHistory"];
  smartCareEnabled: boolean;
  permissionReady: boolean;
  onClose: () => void;
  onMarkAllNotificationsRead: () => void;
  onOpenSettings: () => void;
  onOpen: (id: string, route: P0RouteId) => void;
  theme: AppTheme;
}) {
  if (!visible) return null;

  const unreadCount = notifications.filter((item) => !readNotificationIds.includes(item.id)).length;
  const hasUnread = unreadCount > 0;
  const groups = buildSidebarGroups(notifications.slice(0, 6), readNotificationIds);
  const recentHistory = notificationHistory.slice(0, 3);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.sidebarLayer}>
        <Pressable
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          onPress={onClose}
          style={styles.sidebarScrim}
        />
        <View style={[styles.sidebarPanel, { backgroundColor: theme.cardStrong, borderColor: theme.border, shadowColor: theme.shadow }]}>
          <View style={styles.sidebarHeader}>
            <View style={styles.sidebarTitleGroup}>
              <Text style={[styles.sidebarKicker, { color: hasUnread ? theme.gold : theme.clear }]}>
                {smartCareEnabled ? "스마트 알림" : "알림 꺼짐"}
              </Text>
              <Text style={[styles.sidebarTitle, { color: theme.text }]}>알림</Text>
              <Text style={[styles.sidebarMeta, { color: theme.subtle }]}>
                {notifications.length}개 활성 · 읽지 않음 {unreadCount}개
              </Text>
            </View>
            <Pressable accessibilityLabel="알림 사이드바 닫기" accessibilityRole="button" onPress={onClose} style={[styles.closeIconButton, { borderColor: theme.border }]}>
              <Text style={[styles.closeIconText, { color: theme.text }]}>닫기</Text>
            </Pressable>
          </View>

          {!permissionReady ? (
            <View style={[styles.sidebarPermissionCard, { backgroundColor: theme.card, borderColor: theme.warm }]}>
              <View style={styles.sidebarPermissionCopy}>
                <Text style={[styles.sidebarPermissionTitle, { color: theme.warm }]}>푸시 알림 대기</Text>
                <Text style={[styles.sidebarPermissionBody, { color: theme.muted }]}>홈·출발 판단은 유지됨 · 권한을 켜면 조건 알림 발송</Text>
              </View>
            </View>
          ) : null}

          <Pressable
            accessibilityLabel="모든 알림 읽음 처리"
            accessibilityRole="button"
            accessibilityState={{ disabled: !hasUnread }}
            disabled={!hasUnread}
            onPress={onMarkAllNotificationsRead}
            style={[styles.markAllButton, { backgroundColor: theme.cardMuted, borderColor: hasUnread ? theme.gold : theme.border, opacity: hasUnread ? 1 : 0.54 }]}
          >
            <Text style={[styles.markAllText, { color: hasUnread ? theme.gold : theme.subtle }]}>전체 읽음</Text>
          </Pressable>

          <ScrollView style={styles.sidebarScroll} contentContainerStyle={styles.sidebarList} showsVerticalScrollIndicator={false}>
            {groups.map((group) => (
              <SidebarNotificationGroup
                key={group.title}
                group={group}
                readNotificationIds={readNotificationIds}
                smartCareEnabled={smartCareEnabled}
                onOpen={onOpen}
                theme={theme}
              />
            ))}
            <View style={[styles.sidebarHistoryBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View>
                <Text style={[styles.sidebarGroupTitle, { color: theme.text }]}>최근 완료</Text>
                <Text style={[styles.sidebarGroupMeta, { color: theme.subtle }]}>
                  {recentHistory.length > 0 ? `${recentHistory.length}건 완료` : "아직 완료된 알림 없음"}
                </Text>
              </View>
              {recentHistory.length > 0 ? recentHistory.map((item) => <SidebarHistoryRow key={item.id} item={item} theme={theme} />) : null}
            </View>
            {notifications.length === 0 ? (
              <View style={[styles.sidebarEmpty, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.sidebarEmptyTitle, { color: theme.text }]}>활성 알림 없음</Text>
                <Text style={[styles.sidebarEmptyBody, { color: theme.muted }]}>조건을 켜면 여기에서 바로 확인 가능</Text>
              </View>
            ) : null}
          </ScrollView>

          <Pressable
            accessibilityLabel="알림 설정으로 이동"
            accessibilityRole="button"
            onPress={onOpenSettings}
            style={[styles.sidebarSettingsButton, { backgroundColor: theme.gold, borderColor: theme.gold }]}
          >
            <Text style={[styles.sidebarSettingsText, { color: theme.onAccent }]}>알림 설정으로 이동</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

type SidebarGroup = {
  title: "주의 필요" | "오늘 예정";
  meta: string;
  items: P0ScreenProps["state"]["notifications"];
};

function buildSidebarGroups(notifications: P0ScreenProps["state"]["notifications"], readNotificationIds: string[]): SidebarGroup[] {
  const warningItems = notifications.filter((item, index) => {
    const route = item.deepLink as P0RouteId;
    return !readNotificationIds.includes(item.id) || route === "H5" || index === 0;
  });
  const warningIds = new Set(warningItems.map((item) => item.id));
  const todayItems = notifications.filter((item) => !warningIds.has(item.id));
  return [
    { title: "주의 필요", meta: "읽지 않은 강수·출발 알림", items: warningItems },
    { title: "오늘 예정", meta: "오늘 기준으로 준비할 알림", items: todayItems },
  ];
}

function SidebarNotificationGroup({
  group,
  readNotificationIds,
  smartCareEnabled,
  onOpen,
  theme,
}: {
  group: SidebarGroup;
  readNotificationIds: string[];
  smartCareEnabled: boolean;
  onOpen: (id: string, route: P0RouteId) => void;
  theme: AppTheme;
}) {
  return (
    <View style={styles.sidebarGroup}>
      <View>
        <Text style={[styles.sidebarGroupTitle, { color: theme.text }]}>{group.title}</Text>
        <Text style={[styles.sidebarGroupMeta, { color: theme.subtle }]}>{group.items.length > 0 ? group.meta : "해당 알림 없음"}</Text>
      </View>
      {group.items.map((item, index) => {
        const route = item.deepLink as P0RouteId;
        const read = readNotificationIds.includes(item.id);
        const color = getNotificationTone(theme, index, route);
        return (
          <Pressable
            key={item.id}
            accessibilityLabel={`${item.title} 열기`}
            accessibilityRole="button"
            onPress={() => onOpen(item.id, route)}
            style={[styles.sidebarItem, { backgroundColor: theme.card, borderColor: read ? theme.border : color }]}
          >
            <View style={styles.sidebarItemMain}>
              <View style={[styles.sidebarItemDot, { backgroundColor: read ? theme.border : color }]} />
              <View style={styles.sidebarItemCopy}>
                <Text style={[styles.sidebarItemTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.sidebarItemBody, { color: theme.muted }]}>{smartCareEnabled ? item.reason : "스마트 알림 꺼짐"}</Text>
                <Text style={[styles.sidebarItemTarget, { color }]}>{getNotificationTargetLabel(route)}</Text>
              </View>
            </View>
            <Text style={[styles.sidebarOpenHint, { color: read ? theme.subtle : theme.text }]}>
              {read ? "확인됨" : "눌러서 확인"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SidebarHistoryRow({ item, theme }: { item: P0ScreenProps["notificationHistory"][number]; theme: AppTheme }) {
  const label = item.action === "open" ? "열림" : item.action === "sent" ? "발송" : "읽음";
  return (
    <View style={styles.sidebarHistoryRow}>
      <View style={[styles.sidebarItemDot, { backgroundColor: theme.clear }]} />
      <View style={styles.sidebarItemCopy}>
        <Text style={[styles.sidebarHistoryTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.sidebarHistoryMeta, { color: theme.subtle }]}>{label} · {item.statusLabel}</Text>
      </View>
    </View>
  );
}

function BellGlyph({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.bellCup, { borderColor: color }]} />
      <View style={[styles.bellBase, { backgroundColor: color }]} />
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

function getNotificationTone(theme: AppTheme, index: number, route: P0RouteId): string {
  if (route === "H5" || index === 1) return theme.sky;
  if (route === "G2" || route === "H4" || index === 2) return theme.clear;
  if (index === 0) return theme.gold;
  return theme.warm;
}

const styles = StyleSheet.create({
  screenWrap: {
    flex: 1,
  },
  priorityGrid: {
    gap: 6,
  },
  priorityItem: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    paddingLeft: 10,
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  priorityRail: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  priorityLeading: {
    width: 30,
    alignItems: "center",
    gap: 3,
  },
  priorityIndex: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
  },
  priorityIconBox: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  priorityIcon: {
    width: 14,
    height: 14,
  },
  priorityKicker: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  priorityCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  priorityTitle: {
    fontSize: 14,
    lineHeight: 17,
    fontWeight: "900",
  },
  priorityBody: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
  },
  priorityActionPill: {
    minWidth: 46,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  priorityActionText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  reportRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  bellButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  bellBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    minWidth: 17,
    height: 17,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderRadius: radius.pill,
  },
  bellBadgeText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
  },
  sidebarLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    elevation: 40,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  sidebarScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 14, 24, 0.48)",
  },
  sidebarPanel: {
    width: "86%",
    maxWidth: 340,
    height: "100%",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: 30,
    paddingBottom: 118,
    borderLeftWidth: 1,
    shadowOffset: { width: -10, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sidebarTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  sidebarKicker: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  sidebarTitle: {
    marginTop: 2,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
  },
  sidebarMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  closeIconButton: {
    minWidth: 48,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  closeIconText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  sidebarPermissionCard: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  sidebarPermissionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  sidebarPermissionTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  sidebarPermissionBody: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  sidebarPermissionPill: {
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  sidebarPermissionPillText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  markAllButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  markAllText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarList: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  sidebarGroup: {
    gap: spacing.xs,
  },
  sidebarGroupTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  sidebarGroupMeta: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  sidebarItem: {
    minHeight: 92,
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  sidebarItemMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  sidebarItemDot: {
    width: 8,
    height: 8,
    marginTop: 5,
    borderRadius: radius.pill,
  },
  sidebarItemCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  sidebarItemTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  sidebarItemBody: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  sidebarItemTarget: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  sidebarItemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  sidebarOpenHint: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  sidebarConditionButton: {
    minWidth: 54,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  sidebarConditionText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
  },
  sidebarHistoryBox: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  sidebarHistoryRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sidebarHistoryTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  sidebarHistoryMeta: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
  },
  sidebarSettingsButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  sidebarSettingsText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  sidebarEmpty: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  sidebarEmptyTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  sidebarEmptyBody: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  iconFrame: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  bellCup: {
    width: 14,
    height: 13,
    borderWidth: 1.8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 0,
  },
  bellBase: {
    width: 13,
    height: 2,
    marginTop: 1,
    borderRadius: 2,
  },
});
