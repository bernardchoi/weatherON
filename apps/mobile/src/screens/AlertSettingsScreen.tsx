import { pageStyles } from "../theme/pageStyles";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import { isNotificationQaBuild } from "../config/buildVariant";
import type { P0RouteId } from "../navigation/routes";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { cardShadow, getToneColor, radius, semanticColor, spacing, type AppTheme } from "../theme/tokens";

type AlertTone = "clear" | "gold" | "sky" | "warm";
const testRouteTargets: Array<{ route: P0RouteId; label: string; tone: AlertTone }> = [
  { route: "H7", label: "내일 브리핑", tone: "warm" },
  { route: "H3", label: "알림함", tone: "sky" },
  { route: "H5", label: "강수", tone: "clear" },
  { route: "G2", label: "목적지", tone: "gold" },
];

export function AlertSettingsScreen({
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
  onSendTestNotification,
  onRequestPermissionGate,
  onReturnFromAlertSettings,
  onNavigate,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const focusMeta = getAlertFocusMeta(alertSettingsRouteState?.focus ?? "general", alertSettingsRouteState?.returnTo);
  const destinationReady = savedDestinations.length > 0;
  const deliveryReady = smartCareEnabled && permissionReady;
  const notificationResult = getNotificationPermissionResult(permissionGateResult);
  const advancedEnabledCount = [
    permissionReady && alertPreferences.rainDetail,
    deliveryReady && alertPreferences.weatherAlerts,
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
    isNotificationQaBuild,
  );
  const deliveryStatus = getNotificationDeliveryCopy(notificationDeliveryStatus, smartCareEnabled, permissionReady);
  const deliveryStatusLabel = deliveryReady ? (testNotificationOpened ? "탭 확인" : testNotificationReceived ? "수신 확인" : "수신 확인 전") : "푸시 대기";
  const testNotificationBody = getTestNotificationBody(permissionReady, latestTestNotification?.statusLabel, testNotificationReceived, testNotificationOpened);
  const testNotificationActionLabel = permissionReady ? (latestTestNotification ? "테스트 다시 보내기" : "테스트 알림 보내기") : "권한 켜기";

  const goBack = () => {
    if (alertSettingsRouteState) onReturnFromAlertSettings();
    else onNavigate("M1");
  };

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            width: "100%",
            maxWidth: layout.contentMaxWidth,
            gap: layout.settingsContentGap,
            paddingHorizontal: layout.screenHorizontalPadding,
            paddingTop: layout.weatherTopPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >

        <View style={[styles.header, { minHeight: layout.settingsHeaderMinHeight }, pageStyles.header]}>
          <BackButton onPress={goBack} />
          <View style={styles.headerCopy}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.text,
                  fontSize: layout.screenTitleFontSize,
                  lineHeight: layout.screenTitleLineHeight,
                },
                pageStyles.title,
              ]}
              numberOfLines={1}
            >
              스마트 알림 설정
            </Text>
            <Text style={[styles.subtitle, pageStyles.compactCaption, { color: theme.subtle }]} numberOfLines={1}>필요한 순간만 알아서 챙겨드려요</Text>
          </View>
        </View>

        {alertSettingsRouteState ? (
          <View style={[styles.contextStrip, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme), pageStyles.card]}>
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
          <View style={[styles.editNotice, { backgroundColor: theme.card, borderColor: getToneColor(theme, focusMeta.tone) }, cardShadow(theme), pageStyles.card]}>
            <Text style={[styles.editNoticeTitle, { color: getToneColor(theme, focusMeta.tone) }]}>고급 알림 기준</Text>
            <Text style={[styles.editNoticeBody, { color: theme.muted }]}>{focusMeta.editBody}</Text>
          </View>
        ) : null}

        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.cardStrong,
              borderColor: smartCareEnabled ? semanticColor(theme, "accentBorder") : theme.border,
            },
            cardShadow(theme),
            pageStyles.card,
          ]}
        >
          <Pressable
            accessibilityLabel={smartCareEnabled ? "스마트 알림 끄기" : "스마트 알림 켜기"}
            accessibilityRole="switch"
            accessibilityState={{ checked: smartCareEnabled }}
            onPress={onToggleSmartCare}
            style={[styles.heroToggleRow, { padding: layout.settingsPanelPadding }]}
          >
            <View style={[styles.heroIcon, { borderColor: `${theme.gold}55`, backgroundColor: theme.cardMuted }]}>
              <BellGlyph color={theme.gold} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroKicker, { color: theme.gold }]}>내 일상에 맞춰</Text>
              <Text style={[styles.heroTitle, { color: theme.text }]} numberOfLines={1}>{alertReadiness.title}</Text>
              <Text style={[styles.heroBody, pageStyles.compactCaption, { color: theme.muted }]} numberOfLines={1}>{alertReadiness.body}</Text>
            </View>
            <View style={[styles.switchTrack, { backgroundColor: smartCareEnabled ? theme.gold : theme.cardMuted }]}>
              <View style={[styles.switchKnob, { backgroundColor: smartCareEnabled ? theme.onAccent : theme.text }, smartCareEnabled ? styles.switchKnobOn : null]} />
            </View>
          </Pressable>
          <View style={[styles.heroStatus, { borderTopColor: theme.border }]}>
            <DeliveryLine label="권한" value={permissionReady ? "알림 받을 준비 완료" : "권한 켜기 필요"} tone={permissionReady ? "clear" : "warm"} theme={theme} />
            <DeliveryLine label="예약" value={`${deliveryStatus.statusLabel} · ${deliveryStatus.countLabel}`} tone={deliveryStatus.statusLabel === "예약 완료" ? "clear" : "gold"} theme={theme} />
            {!permissionReady ? (
              <Pressable accessibilityLabel="알림 권한 켜기" accessibilityRole="button" onPress={() => onRequestPermissionGate("notification", "M2", "general")} style={[styles.deliveryAction, { backgroundColor: `${theme.warm}22` }]}>
                <Text style={[styles.deliveryActionText, { color: theme.warm }]}>알림 권한 켜기</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {permissionGateResult?.returnTo === "M2" ? (
          <View style={[styles.resultStrip, { backgroundColor: theme.cardStrong, borderColor: theme.clear }, cardShadow(theme), pageStyles.card]}>
            <Text style={[styles.resultTitle, { color: theme.text }]}>{permissionGateResult.message}</Text>
          </View>
        ) : null}

        <View style={[styles.settingsCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme), pageStyles.card]}>
          <Text style={[styles.groupLabel, { color: theme.subtle }]}>어떤 순간을 챙길까요?</Text>
          <View style={[styles.alertList, { borderTopColor: theme.border, borderBottomColor: theme.border }]}>
          <AlertSummaryRow
            icon="rain"
            title="비·특보 미리보기"
            body={permissionReady ? "비와 위험 날씨를 미리 알려드려요" : "권한을 켜면 바로 알려드려요"}
            status={permissionReady ? "항상" : "권한 필요"}
            tone={permissionReady ? "sky" : "clear"}
            theme={theme}
          />
          <AlertSummaryRow
            icon="sun"
            title="하루 준비"
            body={smartCareEnabled ? "외출 전과 자기 전에 챙겨드려요" : "스마트 알림이 쉬고 있어요"}
            status={deliveryReady ? "자동" : smartCareEnabled ? "권한 필요" : "중지"}
            tone="gold"
            theme={theme}
          />
          <AlertSummaryRow
            icon="route"
            title="출발 타이밍"
            body={destinationReady ? `${savedDestinations.length}곳의 출발 시간을 챙겨드려요` : "목적지를 추가하면 출발을 챙겨요"}
            onPress={destinationReady ? undefined : () => onNavigate("P1")}
            status={deliveryReady ? (destinationReady ? "준비" : "목적지 필요") : smartCareEnabled ? "권한 필요" : "중지"}
            tone="clear"
            theme={theme}
          />
          </View>

          <Pressable accessibilityLabel={advancedOpen ? "세부 알림 닫기" : "세부 알림 열기"} accessibilityRole="button" onPress={() => setAdvancedOpen((current) => !current)} style={[styles.advancedButton, { borderTopColor: theme.border }]}>
            <Text style={[styles.advancedTitle, { color: theme.text }]}>세부 알림 맞추기</Text>
            <Text style={[styles.advancedCount, pageStyles.compactCaption, { color: theme.subtle }]}>{advancedEnabledCount}/6 사용 중</Text>
            <ChevronDown color={theme.subtle} open={advancedOpen} />
          </Pressable>

          {advancedOpen ? (
            <View style={styles.advancedPanel}>
            <AdvancedToggleRow
              title="강수 상세"
              body={`비 오기 전과 그칠 때 알려드려요 · ${selectedDestinationAlertCondition.rainThresholdPct}%`}
              enabled={alertPreferences.rainDetail}
              disabled={!permissionReady}
              onToggle={() => onToggleAlertPreference("rainDetail")}
              theme={theme}
            />
            <AdvancedToggleRow
              title="기상특보 기준"
              body="위험한 날씨가 오기 전에 알려드려요"
              enabled={alertPreferences.weatherAlerts}
              disabled={!deliveryReady}
              onToggle={() => onToggleAlertPreference("weatherAlerts")}
              theme={theme}
            />
            <AdvancedToggleRow
              title="아침 준비"
              body="우산과 옷차림을 아침에 챙겨드려요"
              enabled={alertPreferences.routine}
              disabled={!deliveryReady}
              onToggle={() => onToggleAlertPreference("routine")}
              theme={theme}
            />
            <AdvancedToggleRow
              title="자기 전 체크"
              body="내일 날씨와 코디를 밤 9시쯤 알려드려요"
              enabled={alertPreferences.bedtime}
              disabled={!deliveryReady}
              onToggle={() => onToggleAlertPreference("bedtime")}
              theme={theme}
            />
            <AdvancedToggleRow
              title="목적지 출발"
              body={`늦지 않도록 ${selectedDestinationAlertCondition.leadTimeMinutes}분 전에 알려드려요`}
              enabled={alertPreferences.destination}
              disabled={!deliveryReady || !destinationReady}
              onToggle={() => onToggleAlertPreference("destination")}
              theme={theme}
            />
            <AdvancedToggleRow
              title="방해 줄이기"
              body="꼭 필요한 알림만 하루 3번까지 보내요"
              enabled={alertPreferences.quietHours}
              disabled={!deliveryReady}
              onToggle={() => onToggleAlertPreference("quietHours")}
              theme={theme}
            />
            {isNotificationQaBuild ? (
              <NotificationQaPanel
                enabled={permissionReady}
                testBody={testNotificationBody}
                testStatusLabel={deliveryStatusLabel}
                actionLabel={testNotificationActionLabel}
                onSend={onSendTestNotification}
                onRequestPermission={() => onRequestPermissionGate("notification", "M2", "general")}
                theme={theme}
              />
            ) : null}
            <View style={[styles.historyLine, { borderTopColor: theme.border }]}>
              <Text style={[styles.advancedLineTitle, { color: theme.text }]}>최근 이력</Text>
              <Text style={[styles.advancedLineBody, pageStyles.compactCaption, { color: theme.subtle }]} numberOfLines={1}>{notificationHistory[0]?.title ?? "아직 확인한 알림이 없어요"}</Text>
            </View>
            </View>
          ) : null}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function NotificationQaPanel({
  enabled,
  testBody,
  testStatusLabel,
  actionLabel,
  onSend,
  onRequestPermission,
  theme,
}: {
  enabled: boolean;
  testBody: string;
  testStatusLabel: string;
  actionLabel: string;
  onSend: (route: P0RouteId) => void;
  onRequestPermission: () => void;
  theme: AppTheme;
}) {
  return (
    <View style={[styles.routeTestPanel, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme), pageStyles.card]}>
      <View style={styles.routeTestHeader}>
        <Text style={[styles.routeTestTitle, { color: theme.text }]}>개발용 알림 QA</Text>
        <Text style={[styles.routeTestMeta, { color: enabled ? theme.sky : theme.warm }]}>{enabled ? "발송 가능" : "권한 필요"}</Text>
      </View>
      <Text style={[styles.deliveryBody, { color: theme.subtle }]}>{`${testStatusLabel} · ${testBody}`}</Text>
      <Pressable accessibilityLabel={actionLabel} accessibilityRole="button" onPress={enabled ? () => onSend("M2") : onRequestPermission} style={[styles.deliveryAction, { backgroundColor: enabled ? `${theme.sky}22` : `${theme.warm}22` }]}>
        <Text style={[styles.deliveryActionText, { color: enabled ? theme.sky : theme.warm }]}>{actionLabel}</Text>
      </Pressable>
      <View style={styles.routeTestGrid}>
        {testRouteTargets.map((item) => {
          const color = getToneColor(theme, item.tone);
          return (
            <Pressable
              accessibilityLabel={`${item.label} 확인 알림 보내기`}
              accessibilityRole="button"
              key={item.route}
              onPress={enabled ? () => onSend(item.route) : onRequestPermission}
              style={[styles.routeTestButton, { backgroundColor: `${color}1f`, borderColor: `${color}55` }]}
            >
              <Text style={[styles.routeTestButtonText, { color }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function DeliveryLine({ label, value, tone, theme }: { label: string; value: string; tone: AlertTone; theme: AppTheme }) {
  const color = getToneColor(theme, tone);
  return (
    <View style={styles.deliveryLine}>
      <Text style={[styles.deliveryLineLabel, { color: theme.subtle }]}>{label}</Text>
      <Text style={[styles.deliveryLineValue, { color: theme.text }]} numberOfLines={1}>{value}</Text>
      <View style={[styles.deliveryDot, { backgroundColor: color }]} />
    </View>
  );
}

function AlertSummaryRow({
  icon,
  onPress,
  title,
  body,
  status,
  tone,
  theme,
}: {
  icon: "rain" | "sun" | "route";
  onPress?: () => void;
  title: string;
  body: string;
  status: string;
  tone: AlertTone;
  theme: AppTheme;
}) {
  const color = getToneColor(theme, tone);
  const Container = onPress ? Pressable : View;
  return (
    <Container
      accessible
      accessibilityLabel={`${title}, ${status}, ${body}`}
      accessibilityRole={onPress ? "button" : undefined}
      onPress={onPress}
      style={[styles.alertSummaryRow, { borderBottomColor: theme.border }]}
    >
      <View style={[styles.alertSummaryIcon, { backgroundColor: `${color}16` }]}>
        <AlertIcon type={icon} color={color} />
      </View>
      <View style={styles.alertSummaryCopy}>
        <Text style={[styles.alertSummaryTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.alertSummaryBody, { color: theme.subtle }]} numberOfLines={1}>{body}</Text>
      </View>
      <View style={[styles.alertSummaryStatus, { backgroundColor: `${color}20` }]}>
        <Text style={[styles.statusPillText, { color }]}>{status}</Text>
      </View>
    </Container>
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
        <Text style={[styles.advancedLineBody, pageStyles.compactCaption, { color: theme.subtle }]} numberOfLines={1}>{body}</Text>
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

function ChevronDown({ color, open }: { color: string; open: boolean }) {
  return (
    <View style={[styles.chevronDown, open ? styles.chevronDownOpen : null]} accessibilityElementsHidden>
      <View style={[styles.chevronDownLeft, { backgroundColor: color }]} />
      <View style={[styles.chevronDownRight, { backgroundColor: color }]} />
    </View>
  );
}

function getNotificationPermissionResult(permissionGateResult: P0ScreenProps["permissionGateResult"]) {
  if (permissionGateResult?.returnTo !== "M2" || permissionGateResult.reason !== "notification") return "none";
  return permissionGateResult.denied || permissionGateResult.message.includes("나중에") ? "skipped" : "allowed";
}

function getNotificationDeliveryCopy(
  deliveryStatus: P0ScreenProps["notificationDeliveryStatus"],
  smartCareEnabled: boolean,
  permissionReady: boolean,
) {
  if (deliveryStatus.status === "cancelled") {
    return { statusLabel: "중지", countLabel: "예약 0건" };
  }
  if (!smartCareEnabled) {
    return deliveryStatus.status === "verification-failed"
      ? { statusLabel: "중지 확인 실패", countLabel: `남은 예약 ${deliveryStatus.scheduledCount}건` }
      : { statusLabel: "중지 확인 중", countLabel: "기기 예약 확인 중" };
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
  return { statusLabel: "기기 확인 필요", countLabel: "기기 확인 전" };
}

function getTestNotificationBody(permissionReady: boolean, statusLabel?: string, received?: boolean, opened?: boolean) {
  if (!permissionReady) return "권한 켜고 수신 확인";
  if (opened) return "수신·탭 확인됨";
  if (received) return "수신 확인됨";
  if (statusLabel === "예약 확인 실패") return "예약 확인 실패 · 기기 확인 필요";
  if (statusLabel === "5초 뒤 발송 예약됨") return "발송 예약됨 · 잠시 뒤 도착";
  if (statusLabel) return `최근 ${statusLabel}`;
  return "5초 뒤 확인 알림 발송";
}

function getAlertReadinessCopy(
  smartCareEnabled: boolean,
  permissionReady: boolean,
  skippedPermission: boolean,
  testNotificationVerified: boolean,
  testNotificationOpened: boolean,
  notificationQaEnabled: boolean,
) {
  if (!smartCareEnabled) {
    return {
      title: "알림이 잠시 쉬고 있어요",
      body: "다시 켜면 필요한 순간부터 챙겨드려요",
      resultBody: "스마트 알림을 켜면 필요한 날씨와 일정을 다시 알려드려요",
      gateTitle: "알림 쉬는 중",
      gateBody: "언제든 다시 켤 수 있어요",
    };
  }
  if (permissionReady) {
    if (!notificationQaEnabled) {
      return {
        title: "알림 준비 끝",
        body: "필요한 때만 가볍게 알려드려요",
        resultBody: "날씨와 일정에 맞춰 필요한 순간만 알려드려요",
        gateTitle: "알림 준비 완료",
        gateBody: "필요한 순간을 챙겨드려요",
      };
    }
    if (testNotificationVerified) {
      return {
        title: "알림이 잘 도착하고 있어요",
        body: testNotificationOpened ? "수신과 화면 이동까지 확인했어요" : "알림 수신을 확인했어요",
        resultBody: testNotificationOpened ? "알림 수신과 설정 화면 이동까지 확인했어요" : "알림이 정상적으로 도착했어요",
        gateTitle: "알림 준비 완료",
        gateBody: "정상적으로 도착하고 있어요",
      };
    }
    return {
      title: "알림 도착을 확인해볼까요?",
      body: "확인 알림으로 한 번 점검해요",
      resultBody: "권한은 준비됐어요. 확인 알림으로 실제 도착을 점검해요",
      gateTitle: "알림 준비 완료",
      gateBody: "확인 알림으로 점검해요",
    };
  }
  return {
    title: skippedPermission ? "알림은 나중에 받아도 돼요" : "알림 받을 준비가 필요해요",
    body: skippedPermission ? "앱 안의 날씨 판단은 계속돼요" : "권한만 켜면 바로 시작할 수 있어요",
    resultBody: skippedPermission ? "푸시 없이도 홈과 출발 판단은 계속 이용할 수 있어요" : "권한을 켜면 설정 화면으로 돌아와요",
    gateTitle: skippedPermission ? "알림은 나중에" : "알림 권한이 필요해요",
    gateBody: skippedPermission ? "앱 기능은 계속 이용할 수 있어요" : "권한을 켜면 바로 시작해요",
  };
}

function getAlertFocusMeta(focus: NonNullable<P0ScreenProps["alertSettingsRouteState"]>["focus"], returnTo?: P0RouteId) {
  const returnLabel = getRouteLabel(returnTo);
  if (focus === "umbrella") return { title: "우산 알림 맞추기", caption: "우산 추천에서 왔어요", returnLabel, tone: "sky" as const, editBody: "우산이 필요한 순간을 놓치지 않게 챙겨드려요" };
  if (focus === "rain") return { title: "비 알림 맞추기", caption: "강수 화면에서 왔어요", returnLabel, tone: "clear" as const, editBody: "비가 오기 전과 그칠 때를 골라 알려드려요" };
  if (focus === "destination") return { title: "출발 알림 맞추기", caption: "목적지 케어에서 왔어요", returnLabel, tone: "gold" as const, editBody: "늦지 않도록 날씨와 이동 시간을 함께 챙겨드려요" };
  return { title: "알림 맞추기", caption: "홈 알림에서 왔어요", returnLabel, tone: "warm" as const, editBody: "원하는 알림만 편하게 골라보세요" };
}

function getRouteLabel(route?: P0RouteId) {
  if (route === "H4") return "우산";
  if (route === "H5") return "강수";
  if (route === "H7") return "내일 브리핑";
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
    minHeight: "100%",
    paddingBottom: spacing.xl,
    alignSelf: "center",
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
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  heroToggleRow: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  heroStatus: {
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
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
    fontSize: 13,
    lineHeight: 18,
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
  deliveryBody: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  deliveryLine: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  deliveryLineLabel: {
    width: 50,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  deliveryLineValue: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  deliveryDot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
  },
  deliveryAction: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  deliveryActionText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  routeTestPanel: {
    gap: spacing.sm,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  routeTestHeader: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  routeTestTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  routeTestMeta: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  routeTestGrid: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  routeTestButton: {
    minHeight: 42,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  routeTestButtonText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  alertSummaryIcon: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  alertSummaryCopy: {
    flex: 1,
    gap: 2,
  },
  alertSummaryTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  alertSummaryBody: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  groupLabel: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  settingsCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  alertList: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  alertSummaryRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 16,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  alertSummaryStatus: {
    minHeight: 24,
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: 8,
  },
  statusPill: {
    minHeight: 28,
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
  },
  statusPillText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  advancedButton: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  advancedTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  advancedCount: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  advancedPanel: {
    paddingHorizontal: 16,
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
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  advancedLineBody: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
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
