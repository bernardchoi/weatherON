import React, { useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import { BackButton } from "../components/BackButton";
import type { P0RouteId } from "../navigation/routes";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { pageStyles } from "../theme/pageStyles";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { cardShadow, colorWithAlpha, radius, spacing, type AppTheme } from "../theme/tokens";

type InboxItem = { id: string; title: string; route?: P0RouteId; observedAt: string; receivedAt?: string; readAt?: string };

export function NotificationCenterScreen({
  state, savedDestinations, readNotificationIds, notificationHistory, permissionReady,
  onMarkNotificationRead, onMarkAllNotificationsRead, onClearNotificationHistory, onOpenNotificationDeepLink, onNavigate, onGoBack,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const inbox = useMemo(() => buildInbox(notificationHistory), [notificationHistory]);
  const readIds = useMemo(() => new Set(readNotificationIds), [readNotificationIds]);
  const unread = inbox.filter((item) => !readIds.has(item.id) && !item.readAt);
  const scheduled = state.notifications.filter((item) => item.active && item.scheduledAt && Date.parse(item.scheduledAt) > Date.now()).sort((a, b) => Date.parse(a.scheduledAt!) - Date.parse(b.scheduledAt!));
  const conditions = state.notifications.filter((item) => item.active && !item.scheduledAt);

  return <View style={[styles.shell, { backgroundColor: theme.background }]}>
    <ScrollView contentContainerStyle={[styles.content, { maxWidth: layout.contentMaxWidth, paddingHorizontal: layout.screenHorizontalPadding, paddingTop: layout.weatherTopPadding }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, pageStyles.header]}>
        <BackButton onPress={onGoBack} accessibilityLabel="알림센터 닫기" />
        <View style={styles.headerCopy}><Text style={[styles.title, pageStyles.title, { color: theme.text }]}>알림 센터</Text><Text style={[styles.subtitle, pageStyles.compactCaption, { color: theme.subtle }]}>{unread.length ? "읽지 않은 알림 " + unread.length + "개" : "새 알림 없음"}</Text></View>
        <Pressable accessibilityLabel="알림 설정" accessibilityRole="button" onPress={() => onNavigate("M2")} style={[styles.settingsButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}><Image source={uiIconAssets.settings} style={[styles.settingsIcon, { tintColor: theme.text }]} /></Pressable>
      </View>

      {!permissionReady ? <PermissionOff theme={theme} onPress={() => onNavigate("M2")} /> : null}
      {unread.length ? <View style={styles.markAllRow}><Pressable accessibilityLabel="모든 알림 읽음 표시" accessibilityRole="button" onPress={onMarkAllNotificationsRead} hitSlop={8}><Text style={[styles.markAll, { color: theme.sky }]}>모두 읽음</Text></Pressable></View> : null}
      {inbox.length === 0 ? <EmptyState theme={theme} permissionReady={permissionReady} /> : <View style={styles.inbox}>{groupByDate(inbox).map((group) => <View key={group.label} style={styles.dateGroup}><Text style={[styles.dateLabel, { color: theme.subtle }]}>{group.label}</Text>{group.items.map((item) => {
        const read = readIds.has(item.id) || Boolean(item.readAt);
        const targetExists = !isDestinationNotification(item.id) || savedDestinations.some((destination) => destination.place.id === getDestinationId(item.id));
        return <NotificationRow key={item.id} item={item} read={read} targetExists={targetExists} theme={theme} onOpen={() => item.route && onOpenNotificationDeepLink(item.id, item.route)} onRead={() => onMarkNotificationRead(item.id)} />;
      })}</View>)}</View>}
      {scheduled.length ? <CompactSection theme={theme} title="예정된 알림" detail={scheduled.length + "개"}>{scheduled.slice(0, 3).map((item) => <Text key={item.id} style={[styles.compactRow, { color: theme.muted }]} numberOfLines={2}>{item.title + " · " + formatDate(item.scheduledAt)}</Text>)}</CompactSection> : null}
      {(state.officialSpecialAlert.active || conditions.length > 0) ? <CompactSection theme={theme} title={state.officialSpecialAlert.active ? "현재 기상 특보" : "지금 확인할 날씨"} detail={state.officialSpecialAlert.active ? "공식 발표" : undefined}>{<Text style={[styles.compactRow, { color: theme.muted }]}>{state.officialSpecialAlert.active ? (state.officialSpecialAlert.title ?? "기상 특보") + " · " + (state.officialSpecialAlert.reason ?? "자세한 내용을 확인해 주세요") : conditions.map((item) => item.conditionSummary ?? item.reason).join(" · ")}</Text>}</CompactSection> : null}
      {notificationHistory.length ? <Pressable accessibilityLabel="알림 내역 모두 지우기" accessibilityRole="button" onPress={onClearNotificationHistory} hitSlop={8} style={styles.clearHistory}><Text style={[styles.clearHistoryText, { color: theme.subtle }]}>알림 내역 모두 지우기</Text></Pressable> : null}
    </ScrollView>
  </View>;
}

function NotificationRow({ item, read, targetExists, theme, onOpen, onRead }: { item: InboxItem; read: boolean; targetExists: boolean; theme: AppTheme; onOpen: () => void; onRead: () => void }) {
  const presentation = getPresentation(item, theme);
  const timestamp = item.receivedAt ?? item.observedAt;
  const past = timestamp ? isPast(timestamp) : false;
  const target = item.route ? targetExists ? getTargetLabel(item.route) : "목적지 목록" : "연결된 화면 없음";
  return <View style={[styles.row, { backgroundColor: theme.card, borderColor: read ? theme.border : colorWithAlpha(presentation.color, 0.48) }, cardShadow(theme)]}>
    <View style={[styles.iconBox, { backgroundColor: colorWithAlpha(presentation.color, theme.name === "light" ? 0.1 : 0.14) }]}><Image source={uiIconAssets[presentation.icon]} style={[styles.icon, { tintColor: presentation.color }]} resizeMode="contain" /></View>
    <View style={styles.rowCopy}>
      <Pressable accessibilityLabel={item.title + ", " + target + " 열기"} accessibilityRole="button" disabled={!item.route} onPress={onOpen} style={styles.rowMain}><View style={styles.titleLine}>{!read ? <View accessibilityLabel="읽지 않은 알림" style={[styles.unreadDot, { backgroundColor: theme.sky }]} /> : null}<Text style={[styles.rowTitle, { color: theme.text, opacity: past ? 0.78 : 1 }]} numberOfLines={2}>{item.title}</Text></View><Text style={[styles.rowMeta, { color: theme.subtle }]} numberOfLines={1}>{formatMeta(item.title, target, timestamp)}</Text>{past ? <Text style={[styles.pastLabel, { color: theme.subtle }]}>지난 알림</Text> : null}</Pressable>
      <View style={styles.rowActions}>{item.route ? <Text style={[styles.openHint, { color: presentation.color }]}>{targetExists ? "보기" : "목록 보기"}</Text> : null}{!read ? <Pressable accessibilityLabel={item.title + " 읽음 표시"} accessibilityRole="button" onPress={onRead} hitSlop={8}><Text style={[styles.readAction, { color: theme.subtle }]}>읽음 표시</Text></Pressable> : null}</View>
    </View>
  </View>;
}

function PermissionOff({ theme, onPress }: { theme: AppTheme; onPress: () => void }) { return <View style={[styles.permission, { backgroundColor: colorWithAlpha(theme.warm, theme.name === "light" ? 0.08 : 0.12), borderColor: colorWithAlpha(theme.warm, 0.34) }]}><View style={styles.permissionCopy}><Text style={[styles.permissionTitle, { color: theme.text }]}>기기 알림이 꺼져 있어요</Text><Text style={[styles.permissionBody, { color: theme.muted }]}>이전 알림은 계속 볼 수 있어요.</Text></View><Pressable accessibilityLabel="알림 설정 열기" accessibilityRole="button" onPress={onPress} hitSlop={8}><Text style={[styles.permissionAction, { color: theme.warm }]}>알림 설정</Text></Pressable></View>; }
function EmptyState({ theme, permissionReady }: { theme: AppTheme; permissionReady: boolean }) { return <View style={[styles.empty, { borderColor: theme.border }]}><Text style={[styles.emptyTitle, { color: theme.text }]}>{permissionReady ? "아직 받은 알림이 없어요" : "보관된 알림이 없어요"}</Text><Text style={[styles.emptyBody, { color: theme.muted }]}>{permissionReady ? "날씨나 출발 정보가 달라지면 알려드려요." : "기기 알림을 켜면 새로운 소식을 받을 수 있어요."}</Text></View>; }
function CompactSection({ title, detail, children, theme }: { title: string; detail?: string; children: React.ReactNode; theme: AppTheme }) { return <View style={[styles.compactSection, { borderTopColor: theme.border }]}><View style={styles.compactHead}><Text style={[styles.compactTitle, pageStyles.sectionTitle, { color: theme.text }]}>{title}</Text>{detail ? <Text style={[styles.compactDetail, { color: theme.sky }]}>{detail}</Text> : null}</View>{children}</View>; }

function buildInbox(history: P0ScreenProps["notificationHistory"]): InboxItem[] { const observed = history.filter((item) => item.action === "received" || item.action === "open"); return [...new Set(observed.map((item) => item.notificationId))].map((id) => { const events = history.filter((item) => item.notificationId === id); const eventTimes = (action: "received" | "read", latest = false) => { const matching = events.filter((item) => item.action === action).sort((a, b) => Date.parse(a.occurredAt ?? "") - Date.parse(b.occurredAt ?? "")); return matching[latest ? matching.length - 1 : 0]; }; const first = [...events.filter((item) => item.action === "received" || item.action === "open")].sort((a, b) => Date.parse(a.occurredAt ?? "") - Date.parse(b.occurredAt ?? ""))[0]!; return { id, title: first.title, route: first.route ?? events.find((item) => item.route)?.route, observedAt: first.occurredAt ?? "", receivedAt: eventTimes("received")?.occurredAt, readAt: eventTimes("read", true)?.occurredAt }; }); }
function groupByDate(items: InboxItem[]) { const groups = new Map<string, InboxItem[]>(); items.forEach((item) => { const label = dateLabel(item.observedAt); groups.set(label, [...(groups.get(label) ?? []), item]); }); return [...groups.entries()].map(([label, groupedItems]) => ({ label, items: groupedItems })); }
function dateLabel(value?: string) { const date = value ? new Date(value) : null; if (!date || Number.isNaN(date.getTime())) return "날짜 미상"; const today = new Date(); const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1); if (date.toDateString() === today.toDateString()) return "오늘"; if (date.toDateString() === yesterday.toDateString()) return "어제"; return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "short" }).format(date); }
function getPresentation(item: InboxItem, theme: AppTheme) { const text = (item.id + " " + item.title).toLowerCase(); if (text.includes("특보") || text.includes("경보") || text.includes("heatwave") || text.includes("heavy-rain")) return { icon: "uv" as const, color: theme.alert }; if (text.includes("비") || text.includes("rain") || item.route === "H5") return { icon: "rain" as const, color: theme.sky }; if (item.route === "G2" || item.route === "H7") return { icon: item.route === "G2" ? "depart" as const : "clock" as const, color: theme.gold }; return { icon: "cloud" as const, color: theme.clear }; }
function formatMeta(title: string, target: string, timestamp?: string) { const time = formatDate(timestamp); return target === title || target === "홈" || target === "연결된 화면 없음" ? time : target + " · " + time; }
function formatDate(value?: string) { const time = value ? Date.parse(value) : Number.NaN; return Number.isFinite(time) ? new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(time)) : "시각 미상"; }
function isPast(value: string) { const time = Date.parse(value); const today = new Date(); today.setHours(0, 0, 0, 0); return Number.isFinite(time) && time < today.getTime(); }
function getTargetLabel(route: P0RouteId) { return route === "G2" ? "목적지 케어" : route === "H5" ? "강수 타임라인" : route === "H7" ? "내일 브리핑" : route === "M2" ? "알림 설정" : "홈"; }
function getDestinationId(id: string) { return id.startsWith("destination-change:") ? id.slice("destination-change:".length) : ""; }
function isDestinationNotification(id: string) { return Boolean(getDestinationId(id)); }

const styles = StyleSheet.create({
  shell: { flex: 1 }, content: { width: "100%", paddingBottom: 40, gap: spacing.md }, header: { flexDirection: "row", alignItems: "center", gap: spacing.sm }, headerCopy: { flex: 1, minWidth: 0 }, title: { fontSize: 24 }, subtitle: { marginTop: 1 }, settingsButton: { width: 44, height: 44, borderRadius: radius.md, borderWidth: 1, justifyContent: "center", alignItems: "center" }, settingsIcon: { width: 19, height: 19 },
  markAllRow: { alignItems: "flex-end", marginTop: spacing.xs }, markAll: { minHeight: 36, paddingHorizontal: spacing.xs, textAlignVertical: "center", fontSize: 13, fontWeight: "700" }, inbox: { gap: spacing.lg }, dateGroup: { gap: spacing.sm }, dateLabel: { fontSize: 13, fontWeight: "700", marginLeft: spacing.xs },
  row: { minHeight: 86, flexDirection: "row", gap: spacing.sm, borderWidth: 1, borderRadius: radius.lg, padding: spacing.md }, iconBox: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center" }, icon: { width: 21, height: 21 }, rowCopy: { flex: 1, minWidth: 0, gap: 2 }, rowMain: { flex: 1, gap: 2, paddingRight: 58 }, titleLine: { flexDirection: "row", alignItems: "flex-start", gap: 7 }, unreadDot: { width: 7, height: 7, borderRadius: radius.pill, marginTop: 6, flexShrink: 0 }, rowTitle: { flex: 1, fontSize: 16, lineHeight: 22, fontWeight: "700" }, rowMeta: { fontSize: 13, lineHeight: 19 }, pastLabel: { fontSize: 12, lineHeight: 17 }, rowActions: { position: "absolute", right: 0, top: 0, alignItems: "flex-end", gap: spacing.xs }, openHint: { minHeight: 28, fontSize: 13, fontWeight: "700", textAlignVertical: "center" }, readAction: { minHeight: 28, fontSize: 12, textAlignVertical: "center" },
  empty: { paddingVertical: spacing.xl, paddingHorizontal: spacing.md, borderTopWidth: 1, borderBottomWidth: 1, gap: spacing.xs }, emptyTitle: { fontSize: 17, fontWeight: "700" }, emptyBody: { fontSize: 13, lineHeight: 19 }, permission: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm }, permissionCopy: { flex: 1 }, permissionTitle: { fontSize: 15, fontWeight: "700" }, permissionBody: { marginTop: 2, fontSize: 12, lineHeight: 17 }, permissionAction: { minHeight: 36, paddingHorizontal: spacing.xs, textAlignVertical: "center", fontSize: 13, fontWeight: "700" },
  compactSection: { borderTopWidth: 1, paddingTop: spacing.md, gap: spacing.xs }, compactHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: spacing.sm }, compactTitle: { fontSize: 16 }, compactDetail: { fontSize: 12, fontWeight: "700", textAlign: "right" }, compactRow: { fontSize: 13, lineHeight: 20 }, clearHistory: { alignSelf: "center", minHeight: 36, justifyContent: "center", paddingHorizontal: spacing.sm, marginTop: spacing.sm }, clearHistoryText: { fontSize: 12, textDecorationLine: "underline" },
});
