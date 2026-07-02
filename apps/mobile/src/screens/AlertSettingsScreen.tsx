import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { P0RouteId } from "../navigation/routes";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

type AlertTone = "clear" | "gold" | "sky" | "warm";

export function AlertSettingsScreen({
  state,
  smartCareEnabled,
  permissionReady,
  permissionGateResult,
  savedDestinations,
  notificationHistory,
  alertPreferences,
  notificationDeliveryStatus,
  alertSettingsRouteState,
  selectedDestinationAlertCondition,
  onToggleSmartCare,
  onToggleAlertPreference,
  onEditNotificationCondition,
  onSendTestNotification,
  onRequestPermissionGate,
  onReturnFromAlertSettings,
  onNavigate,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const focusMeta = getAlertFocusMeta(alertSettingsRouteState?.focus ?? "general", alertSettingsRouteState?.returnTo);
  const destinationReady = savedDestinations.length > 0;
  const deliveryReady = smartCareEnabled && permissionReady;
  const notificationResult = getNotificationPermissionResult(permissionGateResult);
  const advancedEnabledCount = [
    permissionReady && alertPreferences.rainDetail,
    deliveryReady && alertPreferences.routine,
    deliveryReady && alertPreferences.bedtime,
    deliveryReady && destinationReady && alertPreferences.destination,
    deliveryReady && alertPreferences.quietHours,
  ].filter(Boolean).length;
  const latestTestNotification = notificationHistory.find((item) => item.notificationId === "local-test");
  const testNotificationReceived = notificationHistory.some((item) => item.notificationId === "local-test" && item.action === "received");
  const testNotificationOpened = notificationHistory.some((item) => item.notificationId === "local-test" && item.action === "open");
  const testNotificationVerified = testNotificationReceived || testNotificationOpened;
  const alertReadiness = getAlertReadinessCopy(
    smartCareEnabled,
    permissionReady,
    notificationResult === "skipped",
    testNotificationVerified,
    testNotificationOpened,
  );
  const deliveryStatus = getNotificationDeliveryCopy(notificationDeliveryStatus, smartCareEnabled, permissionReady);
  const deliveryStatusLabel = deliveryReady ? (testNotificationOpened ? "탭 확인" : testNotificationReceived ? "수신 확인" : "수신 QA 필요") : "푸시 대기";
  const testNotificationBody = getTestNotificationBody(permissionReady, latestTestNotification?.statusLabel, testNotificationReceived, testNotificationOpened);
  const testNotificationActionLabel = permissionReady ? (latestTestNotification ? "다시 보내기" : "보내기") : "권한 켜기";

  const goBack = () => {
    if (alertSettingsRouteState) onReturnFromAlertSettings();
    else onNavigate("M1");
  };

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <Pressable accessibilityLabel="뒤로" accessibilityRole="button" onPress={goBack} style={[styles.backButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <ChevronLeft color={theme.muted} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: theme.text }]}>스마트 알림 설정</Text>
            <Text style={[styles.subtitle, { color: theme.subtle }]} numberOfLines={1}>기본은 자동, 필요한 경우만 세부 조정</Text>
          </View>
        </View>

        {alertSettingsRouteState ? (
          <View style={[styles.contextStrip, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <View style={styles.contextCopy}>
              <Text style={[styles.contextKicker, { color: getToneColor(theme, focusMeta.tone) }]}>{focusMeta.caption}</Text>
              <Text style={[styles.contextTitle, { color: theme.text }]}>{focusMeta.title}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: `${getToneColor(theme, focusMeta.tone)}22` }]}>
              <Text style={[styles.statusPillText, { color: getToneColor(theme, focusMeta.tone) }]}>{withDirectionParticle(focusMeta.returnLabel)}</Text>
            </View>
          </View>
        ) : null}
        {alertSettingsRouteState ? (
          <View style={[styles.editNotice, { backgroundColor: theme.card, borderColor: getToneColor(theme, focusMeta.tone) }]}>
            <Text style={[styles.editNoticeTitle, { color: getToneColor(theme, focusMeta.tone) }]}>알림 기준 조정</Text>
            <Text style={[styles.editNoticeBody, { color: theme.muted }]}>{focusMeta.editBody}</Text>
          </View>
        ) : null}

        <Pressable
          accessibilityLabel={smartCareEnabled ? "스마트 알림 끄기" : "스마트 알림 켜기"}
          accessibilityRole="switch"
          accessibilityState={{ checked: smartCareEnabled }}
          onPress={onToggleSmartCare}
          style={[styles.heroCard, { backgroundColor: theme.cardStrong, borderColor: smartCareEnabled ? "rgba(244,182,63,0.40)" : theme.border }]}
        >
          <View style={[styles.heroIcon, { borderColor: `${theme.gold}55`, backgroundColor: theme.cardMuted }]}>
            <BellGlyph color={theme.gold} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={[styles.heroKicker, { color: theme.gold }]}>알아서 챙기기</Text>
            <Text style={[styles.heroTitle, { color: theme.text }]}>{alertReadiness.title}</Text>
            <Text style={[styles.heroBody, { color: theme.muted }]}>{alertReadiness.body}</Text>
          </View>
          <View style={[styles.switchTrack, { backgroundColor: smartCareEnabled ? theme.gold : theme.cardMuted }]}>
            <View style={[styles.switchKnob, { backgroundColor: smartCareEnabled ? theme.onAccent : theme.text }, smartCareEnabled ? styles.switchKnobOn : null]} />
          </View>
          <View style={styles.heroStatusRail}>
            <StatusTag label={permissionReady ? "권한 정상" : "권한 필요"} tone={permissionReady ? "clear" : "warm"} theme={theme} />
            <StatusTag label={deliveryStatusLabel} tone={testNotificationVerified ? "sky" : "gold"} theme={theme} />
          </View>
        </Pressable>

        {permissionGateResult?.returnTo === "M2" ? (
          <View style={[styles.resultStrip, { backgroundColor: theme.cardStrong, borderColor: theme.clear }]}>
            <Text style={[styles.resultTitle, { color: theme.text }]}>{permissionGateResult.message}</Text>
          </View>
        ) : null}

        <View style={styles.quickActions}>
          <GateCard
            icon="bell"
            title={alertReadiness.gateTitle}
            body={alertReadiness.gateBody}
            actionLabel={permissionReady ? "정상" : "켜기"}
            tone={permissionReady ? "clear" : "warm"}
            onPress={() => onRequestPermissionGate("notification", "M2", "general")}
            theme={theme}
          />
          <GateCard
            icon="bell"
            title="테스트 알림"
            body={testNotificationBody}
            actionLabel={testNotificationActionLabel}
            tone={permissionReady ? "sky" : "warm"}
            onPress={permissionReady ? onSendTestNotification : () => onRequestPermissionGate("notification", "M2", "general")}
            theme={theme}
          />
        </View>

        <Text style={[styles.groupLabel, { color: theme.subtle }]}>알림 종류</Text>

        <View style={styles.alertList}>
          <AlertRow
            icon="rain"
            title="필수 날씨"
            body={permissionReady ? "강수·기상특보" : "푸시만 대기"}
            status={permissionReady ? "항상" : "권한 필요"}
            tone={permissionReady ? "sky" : "clear"}
            onPress={() => onEditNotificationCondition(state.notifications[0]?.id ?? "rain", state.notifications[0]?.deepLink as P0RouteId)}
            theme={theme}
          />
          <AlertRow
            icon="sun"
            title="생활 루틴"
            body={smartCareEnabled ? "출발 준비·내일 체크" : "스마트 알림 꺼짐"}
            status={deliveryReady ? "자동" : smartCareEnabled ? "권한 필요" : "중지"}
            tone="gold"
            onPress={() => onEditNotificationCondition(state.notifications[1]?.id ?? "daily", state.notifications[1]?.deepLink as P0RouteId)}
            theme={theme}
          />
          <AlertRow
            icon="route"
            title="목적지 출발"
            body={destinationReady ? `${savedDestinations.length}개 목적지` : "목적지 추가 필요"}
            status={deliveryReady ? (destinationReady ? "준비" : "목적지 필요") : smartCareEnabled ? "권한 필요" : "중지"}
            tone="clear"
            onPress={() => onNavigate(destinationReady ? "G1" : "P1")}
            theme={theme}
          />
        </View>

        <Pressable accessibilityLabel={advancedOpen ? "고급 설정 닫기" : "고급 설정 열기"} accessibilityRole="button" onPress={() => setAdvancedOpen((current) => !current)} style={[styles.advancedButton, { backgroundColor: theme.cardStrong }]}>
          <Text style={[styles.advancedTitle, { color: theme.text }]}>고급 설정</Text>
          <Text style={[styles.advancedCount, { color: theme.subtle }]}>{advancedEnabledCount}/5 적용</Text>
          <ChevronDown color={theme.subtle} open={advancedOpen} />
        </Pressable>

        {advancedOpen ? (
          <View style={[styles.advancedPanel, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <AdvancedToggleRow
              title="강수 상세"
              body={`비 시작 전·그칠 시각 · 강수 ${selectedDestinationAlertCondition.rainThresholdPct}%`}
              enabled={alertPreferences.rainDetail}
              disabled={!permissionReady}
              onToggle={() => onToggleAlertPreference("rainDetail")}
              theme={theme}
            />
            <AdvancedToggleRow
              title="출발 준비"
              body="날씨·우산·신발 확인 알림"
              enabled={alertPreferences.routine}
              disabled={!deliveryReady}
              onToggle={() => onToggleAlertPreference("routine")}
              theme={theme}
            />
            <AdvancedToggleRow
              title="자기 전 체크"
              body="내일 날씨 미확인 시 1회"
              enabled={alertPreferences.bedtime}
              disabled={!deliveryReady}
              onToggle={() => onToggleAlertPreference("bedtime")}
              theme={theme}
            />
            <AdvancedToggleRow
              title="목적지 출발"
              body={`출발 ${selectedDestinationAlertCondition.leadTimeMinutes}분 전 · 바람 ${selectedDestinationAlertCondition.windThresholdMs}m/s`}
              enabled={alertPreferences.destination}
              disabled={!deliveryReady || !destinationReady}
              onToggle={() => onToggleAlertPreference("destination")}
              theme={theme}
            />
            <AdvancedToggleRow
              title="방해 줄이기"
              body="하루 최대 3건 · 수면 시간대 제한"
              enabled={alertPreferences.quietHours}
              disabled={!deliveryReady}
              onToggle={() => onToggleAlertPreference("quietHours")}
              theme={theme}
            />
            <View style={[styles.historyLine, { borderTopColor: theme.border }]}>
              <Text style={[styles.advancedLineTitle, { color: theme.text }]}>최근 이력</Text>
              <Text style={[styles.advancedLineBody, { color: theme.subtle }]}>{notificationHistory[0]?.title ?? "아직 읽은 알림 없음"}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function StatusTag({ label, tone, theme }: { label: string; tone: AlertTone; theme: AppTheme }) {
  const color = getToneColor(theme, tone);
  return (
    <View style={[styles.statusTag, { backgroundColor: `${color}22` }]}>
      <Text style={[styles.statusTagText, { color }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function GateCard({
  icon,
  title,
  body,
  actionLabel,
  tone,
  onPress,
  theme,
}: {
  icon: "bell" | "route";
  title: string;
  body: string;
  actionLabel: string;
  tone: AlertTone;
  onPress: () => void;
  theme: AppTheme;
}) {
  const color = getToneColor(theme, tone);
  return (
    <Pressable accessibilityLabel={`${title}, ${body}`} accessibilityRole="button" onPress={onPress} style={[styles.gateCard, { backgroundColor: theme.card, borderColor: `${color}55` }]}>
      <View style={[styles.rowIcon, { backgroundColor: theme.cardStrong, borderColor: `${color}55` }]}>
        <AlertIcon type={icon} color={color} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.rowBody, { color: theme.muted }]} numberOfLines={1}>{body}</Text>
      </View>
      <View style={[styles.actionPill, { backgroundColor: theme.nav }]}>
        <Text style={[styles.actionPillText, { color: theme.text }]}>{actionLabel}</Text>
      </View>
    </Pressable>
  );
}

function AlertRow({
  icon,
  title,
  body,
  status,
  tone,
  onPress,
  theme,
}: {
  icon: "rain" | "sun" | "route";
  title: string;
  body: string;
  status: string;
  tone: AlertTone;
  onPress: () => void;
  theme: AppTheme;
}) {
  const color = getToneColor(theme, tone);
  return (
    <Pressable accessibilityLabel={`${title}, ${status}, ${body}`} accessibilityRole="button" onPress={onPress} style={[styles.alertRow, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
      <View style={[styles.rowIcon, { backgroundColor: theme.cardMuted, borderColor: `${color}44` }]}>
        <AlertIcon type={icon} color={color} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.rowBody, { color: theme.subtle }]} numberOfLines={1}>{body}</Text>
      </View>
      <View style={[styles.statusPill, { backgroundColor: `${color}22` }]}>
        <Text style={[styles.statusPillText, { color }]}>{status}</Text>
      </View>
    </Pressable>
  );
}

function AdvancedToggleRow({
  title,
  body,
  enabled,
  disabled,
  onToggle,
  theme,
}: {
  title: string;
  body: string;
  enabled: boolean;
  disabled: boolean;
  onToggle: () => void;
  theme: AppTheme;
}) {
  const checked = enabled && !disabled;
  return (
    <Pressable
      accessibilityLabel={`${title}, ${disabled ? "사용 불가" : checked ? "켜짐" : "꺼짐"}`}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={onToggle}
      style={[styles.advancedLine, { borderBottomColor: theme.border, opacity: disabled ? 0.5 : 1 }]}
    >
      <View style={styles.advancedCopy}>
        <Text style={[styles.advancedLineTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.advancedLineBody, { color: theme.subtle }]}>{body}</Text>
      </View>
      <View style={[styles.smallSwitchTrack, { backgroundColor: checked ? theme.gold : theme.cardMuted }]}>
        <View style={[styles.smallSwitchKnob, { backgroundColor: checked ? theme.onAccent : theme.text }, checked ? styles.smallSwitchKnobOn : null]} />
      </View>
    </Pressable>
  );
}

function AlertIcon({ type, color }: { type: "bell" | "rain" | "sun" | "route"; color: string }) {
  if (type === "rain") return <RainGlyph color={color} />;
  if (type === "sun") return <SunGlyph color={color} />;
  if (type === "route") return <RouteGlyph color={color} />;
  return <BellGlyph color={color} />;
}

function BellGlyph({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.bellCup, { borderColor: color }]} />
      <View style={[styles.bellBase, { backgroundColor: color }]} />
    </View>
  );
}

function RainGlyph({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.cloud, { borderColor: color }]} />
      <View style={[styles.rainDrop, styles.rainDropA, { backgroundColor: color }]} />
      <View style={[styles.rainDrop, styles.rainDropB, { backgroundColor: color }]} />
    </View>
  );
}

function SunGlyph({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.sunCore, { borderColor: color }]} />
      <View style={[styles.sunRay, styles.sunRayA, { backgroundColor: color }]} />
      <View style={[styles.sunRay, styles.sunRayB, { backgroundColor: color }]} />
      <View style={[styles.sunRay, styles.sunRayC, { backgroundColor: color }]} />
      <View style={[styles.sunRay, styles.sunRayD, { backgroundColor: color }]} />
    </View>
  );
}

function RouteGlyph({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.routeDot, styles.routeDotA, { borderColor: color }]} />
      <View style={[styles.routeLine, { borderColor: color }]} />
      <View style={[styles.routeDot, styles.routeDotB, { borderColor: color }]} />
    </View>
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

function ChevronDown({ color, open }: { color: string; open: boolean }) {
  return (
    <View style={[styles.chevronDown, open ? styles.chevronDownOpen : null]} accessibilityElementsHidden>
      <View style={[styles.chevronDownLeft, { backgroundColor: color }]} />
      <View style={[styles.chevronDownRight, { backgroundColor: color }]} />
    </View>
  );
}

function getToneColor(theme: AppTheme, tone: AlertTone) {
  if (tone === "gold") return theme.gold;
  if (tone === "sky") return theme.sky;
  if (tone === "warm") return theme.warm;
  return theme.clear;
}

function getNotificationPermissionResult(permissionGateResult: P0ScreenProps["permissionGateResult"]) {
  if (permissionGateResult?.returnTo !== "M2" || permissionGateResult.reason !== "notification") return "none";
  return permissionGateResult.message.includes("나중에") ? "skipped" : "allowed";
}

function getNotificationDeliveryCopy(
  deliveryStatus: P0ScreenProps["notificationDeliveryStatus"],
  smartCareEnabled: boolean,
  permissionReady: boolean,
) {
  if (!smartCareEnabled || deliveryStatus.status === "cancelled") {
    return { statusLabel: "중지", countLabel: "예약 0건" };
  }
  if (!permissionReady || deliveryStatus.status === "permission-required") {
    return { statusLabel: "권한 대기", countLabel: "예약 0건" };
  }
  if (deliveryStatus.status === "scheduled") {
    if (deliveryStatus.scheduledCount === 0) return { statusLabel: "조건 대기", countLabel: "예약 0건" };
    return { statusLabel: "예약 완료", countLabel: `예약 ${deliveryStatus.scheduledCount}건` };
  }
  if (deliveryStatus.status === "verification-failed") {
    return { statusLabel: "확인 실패", countLabel: `예약 확인 ${deliveryStatus.scheduledCount}건` };
  }
  return { statusLabel: "기기 QA 필요", countLabel: "네이티브 확인 전" };
}

function getTestNotificationBody(permissionReady: boolean, statusLabel?: string, received?: boolean, opened?: boolean) {
  if (!permissionReady) return "권한 켜고 수신 확인";
  if (opened) return "수신·탭 확인됨";
  if (received) return "수신 확인됨";
  if (statusLabel === "예약 확인 실패") return "예약 목록 확인 실패 · 기기 QA 필요";
  if (statusLabel) return `최근 ${statusLabel}`;
  return "5초 뒤 발송 · 예약 목록 검증";
}

function getAlertReadinessCopy(
  smartCareEnabled: boolean,
  permissionReady: boolean,
  skippedPermission: boolean,
  testNotificationVerified: boolean,
  testNotificationOpened: boolean,
) {
  if (!smartCareEnabled) {
    return {
      title: "스마트 알림 일시 중지",
      body: "푸시 없이 앱 안 판단만 유지",
      resultBody: "스마트 알림이 꺼져 있어 권한 상태와 무관하게 푸시는 발송되지 않음",
      gateTitle: "스마트 알림 꺼짐",
      gateBody: "켜면 다시 적용",
    };
  }
  if (permissionReady) {
    if (testNotificationVerified) {
      return {
        title: "스마트 알림 확인됨",
        body: testNotificationOpened ? "테스트 알림 수신·탭 확인됨" : "테스트 알림 수신 확인됨",
        resultBody: testNotificationOpened ? "권한과 실제 수신, 설정 화면 이동까지 확인됨" : "권한과 실제 수신까지 확인됨",
        gateTitle: "알림 권한 정상",
        gateBody: "테스트 수신 확인됨",
      };
    }
    return {
      title: "스마트 알림 확인 중",
      body: "테스트 알림 수신 확인 전",
      resultBody: "권한은 켜짐. 테스트 알림과 예약 목록으로 실제 도착을 확인해야 함",
      gateTitle: "알림 권한 정상",
      gateBody: "테스트 발송으로 확인",
    };
  }
  return {
    title: skippedPermission ? "푸시 알림은 나중에" : "알림 권한 확인 필요",
    body: skippedPermission ? "앱 판단 유지 · 푸시 대기" : "권한 필요",
    resultBody: skippedPermission ? "푸시는 대기 상태이며 홈·출발 판단은 계속 사용할 수 있음" : "권한 확인 후 알림 설정으로 복귀함",
    gateTitle: skippedPermission ? "알림 권한 나중에 설정" : "알림 권한 확인 필요",
    gateBody: skippedPermission ? "푸시만 대기" : "권한 켜기 필요",
  };
}

function getAlertFocusMeta(focus: NonNullable<P0ScreenProps["alertSettingsRouteState"]>["focus"], returnTo?: P0RouteId) {
  const returnLabel = getRouteLabel(returnTo);
  if (focus === "umbrella") return { title: "우산 알림 기준", caption: "우산 추천에서 이동", returnLabel, tone: "sky" as const, editBody: "우산이 필요한 조건과 출발 준비 알림을 조정함" };
  if (focus === "rain") return { title: "강수 알림 기준", caption: "강수 타임라인에서 이동", returnLabel, tone: "clear" as const, editBody: "비 시작·그침 알림 조건을 조정함" };
  if (focus === "destination") return { title: "목적지 알림 기준", caption: "목적지 케어에서 이동", returnLabel, tone: "gold" as const, editBody: "목적지 출발 알림과 강수 기준을 조정함" };
  return { title: "알림 기준", caption: "홈 알림에서 이동", returnLabel, tone: "warm" as const, editBody: "홈 알림에서 선택한 조건을 조정함" };
}

function getRouteLabel(route?: P0RouteId) {
  if (route === "H4") return "우산";
  if (route === "H5") return "강수";
  if (route === "G2") return "목적지";
  if (route === "H3") return "알림";
  if (route === "M1") return "MY";
  if (route === "M3") return "표시";
  if (route === "M4") return "권한";
  return "홈";
}

function withDirectionParticle(label: string) {
  const lastChar = label.charCodeAt(label.length - 1);
  if (lastChar < 0xac00 || lastChar > 0xd7a3) return `${label}로`;
  return (lastChar - 0xac00) % 28 === 0 ? `${label}로` : `${label}으로`;
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
    top: 250,
    height: 500,
    opacity: 0.34,
    borderRadius: 78,
  },
  header: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  contextStrip: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  contextCopy: {
    flex: 1,
    gap: 3,
  },
  contextKicker: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  contextTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  heroCard: {
    minHeight: 138,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    padding: 14,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  heroIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  heroCopy: {
    flex: 1,
    minWidth: 170,
    gap: 4,
  },
  heroKicker: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  heroTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
  },
  heroBody: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  switchTrack: {
    width: 50,
    height: 30,
    justifyContent: "center",
    padding: 3,
    borderRadius: radius.pill,
  },
  switchKnob: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
  },
  switchKnobOn: {
    alignSelf: "flex-end",
  },
  heroStatusRail: {
    width: "100%",
    flexDirection: "row",
    gap: spacing.xs,
    paddingTop: 4,
  },
  statusTag: {
    maxWidth: "48%",
    minHeight: 28,
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
  },
  statusTagText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  resultStrip: {
    gap: 4,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  editNotice: {
    gap: 4,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  editNoticeTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  editNoticeBody: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  resultTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  resultBody: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  gateCard: {
    flex: 1,
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  rowIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  rowBody: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  actionPill: {
    minHeight: 32,
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: 12,
  },
  actionPillText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  groupLabel: {
    marginBottom: -6,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  alertList: {
    gap: 8,
  },
  alertRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  statusPill: {
    minHeight: 28,
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
  },
  statusPillText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  advancedButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderRadius: radius.lg,
  },
  advancedTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  advancedCount: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  advancedPanel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  advancedLine: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  advancedCopy: {
    flex: 1,
    gap: 4,
  },
  advancedLineTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  advancedLineBody: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  smallSwitchTrack: {
    width: 42,
    height: 26,
    justifyContent: "center",
    padding: 3,
    borderRadius: radius.pill,
  },
  smallSwitchKnob: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
  },
  smallSwitchKnobOn: {
    alignSelf: "flex-end",
  },
  historyLine: {
    gap: 4,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  fatigueCard: {
    gap: 6,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderLeftWidth: 2,
  },
  fatigueKicker: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  fatigueText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  bottomSpacer: {
    height: 12,
  },
  iconFrame: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  bellCup: {
    width: 13,
    height: 12,
    borderWidth: 1.7,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 0,
  },
  bellBase: {
    width: 12,
    height: 2,
    borderRadius: 2,
    marginTop: 1,
  },
  cloud: {
    width: 17,
    height: 11,
    borderWidth: 1.7,
    borderRadius: 9,
    borderBottomWidth: 1.2,
  },
  rainDrop: {
    position: "absolute",
    bottom: 0,
    width: 2,
    height: 5,
    borderRadius: 2,
  },
  rainDropA: {
    left: 6,
  },
  rainDropB: {
    right: 6,
  },
  sunCore: {
    width: 10,
    height: 10,
    borderWidth: 1.7,
    borderRadius: radius.pill,
  },
  sunRay: {
    position: "absolute",
    width: 2,
    height: 4,
    borderRadius: 2,
  },
  sunRayA: {
    top: 0,
  },
  sunRayB: {
    bottom: 0,
  },
  sunRayC: {
    left: 1,
    transform: [{ rotate: "90deg" }],
  },
  sunRayD: {
    right: 1,
    transform: [{ rotate: "90deg" }],
  },
  routeDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderWidth: 1.6,
    borderRadius: radius.pill,
  },
  routeDotA: {
    left: 2,
    top: 3,
  },
  routeDotB: {
    right: 2,
    bottom: 3,
  },
  routeLine: {
    width: 12,
    height: 12,
    borderLeftWidth: 1.6,
    borderBottomWidth: 1.6,
    borderRadius: 6,
    transform: [{ rotate: "-18deg" }],
  },
  chevronLeft: {
    width: 16,
    height: 16,
    justifyContent: "center",
  },
  chevronLeftTop: {
    position: "absolute",
    left: 4,
    width: 9,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }, { translateY: -3 }],
  },
  chevronLeftBottom: {
    position: "absolute",
    left: 4,
    width: 9,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }, { translateY: 3 }],
  },
  chevronDown: {
    width: 18,
    height: 18,
    justifyContent: "center",
  },
  chevronDownOpen: {
    transform: [{ rotate: "90deg" }],
  },
  chevronDownLeft: {
    position: "absolute",
    right: 4,
    width: 8,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }, { translateY: -3 }],
  },
  chevronDownRight: {
    position: "absolute",
    right: 4,
    width: 8,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }, { translateY: 3 }],
  },
});
