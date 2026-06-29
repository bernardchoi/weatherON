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
  alertSettingsRouteState,
  selectedDestinationAlertCondition,
  onToggleSmartCare,
  onEditNotificationCondition,
  onRequestPermissionGate,
  onRequireAccount,
  onReturnFromAlertSettings,
  onNavigate,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const activeCount = state.notifications.filter((item) => item.active).length;
  const focusMeta = getAlertFocusMeta(alertSettingsRouteState?.focus ?? "general", alertSettingsRouteState?.returnTo);
  const destinationReady = savedDestinations.length > 0;

  const goBack = () => {
    if (alertSettingsRouteState) onReturnFromAlertSettings();
    else onNavigate("M1");
  };

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.statusBar}>
          <Text style={[styles.statusText, { color: theme.text }]}>9:41</Text>
          <Text style={[styles.statusText, { color: theme.subtle }]}>••• 5G</Text>
        </View>

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
              <Text style={[styles.statusPillText, { color: getToneColor(theme, focusMeta.tone) }]}>{focusMeta.returnLabel} 복귀</Text>
            </View>
          </View>
        ) : null}

        <Pressable
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
            <Text style={[styles.heroTitle, { color: theme.text }]}>{permissionReady ? "스마트 알림 켜짐" : "알림 권한 확인 필요"}</Text>
            <Text style={[styles.heroBody, { color: theme.muted }]}>
              {permissionReady ? "필수 날씨와 생활 루틴 자동 적용" : "권한을 켜면 준비 알림 자동 적용"}
            </Text>
          </View>
          <View style={[styles.switchTrack, { backgroundColor: smartCareEnabled ? theme.gold : theme.cardMuted }]}>
            <View style={[styles.switchKnob, { backgroundColor: smartCareEnabled ? theme.onAccent : theme.text }, smartCareEnabled ? styles.switchKnobOn : null]} />
          </View>
          <View style={styles.heroMetrics}>
            <Metric label={permissionReady ? "권한 정상" : "권한 필요"} value={permissionReady ? "적용 중" : "대기 중"} theme={theme} />
            <Metric label="활성 알림" value={`${activeCount}개`} theme={theme} />
            <Metric label="하루 최대" value="3건" theme={theme} />
          </View>
        </Pressable>

        {permissionGateResult?.returnTo === "M2" ? (
          <View style={[styles.resultStrip, { backgroundColor: theme.cardStrong, borderColor: theme.clear }]}>
            <Text style={[styles.resultTitle, { color: theme.text }]}>{permissionGateResult.message}</Text>
            <Text style={[styles.resultBody, { color: theme.subtle }]}>권한 확인 후 알림 설정으로 복귀함</Text>
          </View>
        ) : null}

        <GateCard
          icon="bell"
          title={permissionReady ? "알림 권한 정상" : "알림 권한 확인 필요"}
          body={permissionReady ? "기기 권한 정상 · 필수 알림 적용 가능" : "권한이 꺼지면 모든 알림이 중단됨"}
          actionLabel={permissionReady ? "권한 확인" : "권한 관리"}
          tone={permissionReady ? "clear" : "warm"}
          onPress={() => onRequestPermissionGate("notification", "M2", "general")}
          theme={theme}
        />

        <GateCard
          icon="route"
          title="목적지 알림 조건"
          body={
            destinationReady
              ? `${savedDestinations.length}개 목적지 · 강수 ${selectedDestinationAlertCondition.rainThresholdPct}%부터 알림`
              : "목적지 조회 가능 · 알림 저장은 계정 연결 후 적용"
          }
          actionLabel={destinationReady ? "조건 관리" : "계정 연결"}
          tone={destinationReady ? "clear" : "gold"}
          onPress={() => (destinationReady ? onNavigate("P3") : onRequireAccount("destination-care", "M2"))}
          theme={theme}
        />

        <Text style={[styles.groupLabel, { color: theme.subtle }]}>적용 중인 알림</Text>

        <View style={styles.alertList}>
          <AlertRow
            icon="rain"
            title="필수 날씨"
            body={permissionReady ? "강수 임박 · 폭염/한파/강풍 특보" : "권한 확인 전까지 앱 안에서만 확인"}
            status={permissionReady ? "항상" : "권한 필요"}
            tone={permissionReady ? "sky" : "clear"}
            onPress={() => onEditNotificationCondition(state.notifications[0]?.id ?? "rain", state.notifications[0]?.deepLink as P0RouteId)}
            theme={theme}
          />
          <AlertRow
            icon="sun"
            title="생활 루틴"
            body={smartCareEnabled ? "출근·외출 준비 + 자기 전 내일 체크" : "스마트 알림을 켜면 자동 적용"}
            status={permissionReady ? "자동" : "권한 필요"}
            tone="gold"
            onPress={() => onEditNotificationCondition(state.notifications[1]?.id ?? "daily", state.notifications[1]?.deepLink as P0RouteId)}
            theme={theme}
          />
          <AlertRow
            icon="route"
            title="목적지·여행"
            body={destinationReady ? "저장 목적지 변화 알림 적용" : "계정 연결 후 목적지 알림 저장"}
            status={destinationReady ? "준비" : "계정 필요"}
            tone="clear"
            onPress={() => (destinationReady ? onNavigate("P3") : onRequireAccount("destination-care", "M2"))}
            theme={theme}
          />
        </View>

        <Pressable accessibilityRole="button" onPress={() => setAdvancedOpen((current) => !current)} style={[styles.advancedButton, { backgroundColor: theme.cardStrong }]}>
          <Text style={[styles.advancedTitle, { color: theme.text }]}>고급 설정</Text>
          <ChevronDown color={theme.subtle} open={advancedOpen} />
        </Pressable>

        {advancedOpen ? (
          <View style={[styles.advancedPanel, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <AdvancedLine title="강수 알림" body={`강수 ${selectedDestinationAlertCondition.rainThresholdPct}% · ${selectedDestinationAlertCondition.leadTimeMinutes}분 전`} theme={theme} />
            <AdvancedLine title="목적지 바람" body={`${selectedDestinationAlertCondition.windThresholdMs}m/s 이상일 때 안내`} theme={theme} />
            <AdvancedLine title="최근 이력" body={notificationHistory[0]?.title ?? "아직 읽은 알림 없음"} theme={theme} />
          </View>
        ) : null}

        <View style={[styles.fatigueCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
          <Text style={[styles.fatigueKicker, { color: theme.clear }]}>피로도 제어</Text>
          <Text style={[styles.fatigueText, { color: theme.text }]}>하루 최대 3건 · 수면 시간대는 긴급 날씨만 허용</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function Metric({ label, value, theme }: { label: string; value: string; theme: AppTheme }) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricLabel, { color: theme.gold }]} numberOfLines={1}>{label}</Text>
      <Text style={[styles.metricValue, { color: theme.text }]} numberOfLines={1}>{value}</Text>
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
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.gateCard, { backgroundColor: theme.card, borderColor: `${color}55` }]}>
      <View style={[styles.rowIcon, { backgroundColor: theme.cardStrong, borderColor: `${color}55` }]}>
        <AlertIcon type={icon} color={color} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.rowBody, { color: theme.muted }]} numberOfLines={2}>{body}</Text>
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
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.alertRow, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
      <View style={[styles.rowIcon, { backgroundColor: theme.cardMuted, borderColor: `${color}44` }]}>
        <AlertIcon type={icon} color={color} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.rowBody, { color: theme.subtle }]} numberOfLines={2}>{body}</Text>
      </View>
      <View style={[styles.statusPill, { backgroundColor: `${color}22` }]}>
        <Text style={[styles.statusPillText, { color }]}>{status}</Text>
      </View>
    </Pressable>
  );
}

function AdvancedLine({ title, body, theme }: { title: string; body: string; theme: AppTheme }) {
  return (
    <View style={[styles.advancedLine, { borderBottomColor: theme.border }]}>
      <Text style={[styles.advancedLineTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.advancedLineBody, { color: theme.subtle }]}>{body}</Text>
    </View>
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

function getAlertFocusMeta(focus: NonNullable<P0ScreenProps["alertSettingsRouteState"]>["focus"], returnTo?: P0RouteId) {
  const returnLabel = getRouteLabel(returnTo);
  if (focus === "umbrella") return { title: "우산 알림 기준 조정", caption: "우산 추천에서 들어옴", returnLabel, tone: "sky" as const };
  if (focus === "rain") return { title: "강수 알림 기준 조정", caption: "강수 타임라인에서 들어옴", returnLabel, tone: "clear" as const };
  if (focus === "destination") return { title: "목적지 알림 기준 조정", caption: "목적지 케어에서 들어옴", returnLabel, tone: "gold" as const };
  return { title: "알림 기준 조정", caption: "일반 설정 진입", returnLabel, tone: "warm" as const };
}

function getRouteLabel(route?: P0RouteId) {
  if (route === "H4") return "우산";
  if (route === "H5") return "강수";
  if (route === "G2") return "목적지";
  if (route === "H3") return "알림";
  if (route === "M1") return "MY";
  if (route === "M3") return "설정";
  return "홈";
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
  statusBar: {
    minHeight: 23,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    letterSpacing: 0,
  },
  header: {
    minHeight: 46,
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
  heroMetrics: {
    width: "100%",
    flexDirection: "row",
    gap: spacing.xs,
    paddingTop: 4,
  },
  metric: {
    flex: 1,
    gap: 4,
  },
  metricLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  metricValue: {
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
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
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
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  advancedPanel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  advancedLine: {
    gap: 4,
    paddingVertical: 12,
    borderBottomWidth: 1,
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
