import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0RouteId } from "../navigation/routes";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, radius, spacing } from "../theme/tokens";

export function AlertSettingsScreen({
  state,
  smartCareEnabled,
  permissionReady,
  permissionGateResult,
  savedDestinations,
  notificationHistory,
  alertSettingsRouteState,
  selectedDestinationPlace,
  selectedDestinationAlertCondition,
  onToggleSmartCare,
  onEditDestinationAlertCondition,
  onEditNotificationCondition,
  onRequestPermissionGate,
  onReturnFromAlertSettings,
  onNavigate,
}: P0ScreenProps) {
  const focusMeta = getAlertFocusMeta(alertSettingsRouteState?.focus ?? "general", alertSettingsRouteState?.returnTo);

  return (
    <AppScreen title="알림 설정" subtitle="세부 토글보다 현재 자동 케어 상태를 먼저 보여주는 M2 구조" badge="M2">
      {alertSettingsRouteState ? (
        <Section title="진입 맥락" caption={focusMeta.caption}>
          <View style={styles.focusCard}>
            <View style={styles.ruleCopy}>
              <Text style={styles.focusTitle}>{focusMeta.title}</Text>
              <Text style={styles.ruleReason}>설정 완료 후 {focusMeta.returnLabel} 화면으로 복귀 가능</Text>
            </View>
            <StatusPill label={focusMeta.pillLabel} tone={focusMeta.pillTone} />
          </View>
          <AppButton label={`${focusMeta.returnLabel} 복귀`} onPress={onReturnFromAlertSettings} tone="secondary" />
        </Section>
      ) : null}

      <Section title="알아서 챙기기" caption={smartCareEnabled ? "외출·강수·우산·신발·목적지 케어 활성" : "앱 내 안내만 유지"}>
        <Pressable accessibilityRole="switch" accessibilityState={{ checked: smartCareEnabled }} onPress={onToggleSmartCare} style={styles.switchRow}>
          <View>
            <Text style={styles.switchTitle}>{smartCareEnabled ? "스마트 알림 켜짐" : "스마트 알림 꺼짐"}</Text>
            <Text style={styles.switchCopy}>권한이 없어도 H1/H3 앱 내 안내는 유지됨</Text>
          </View>
          <View style={[styles.switchTrack, smartCareEnabled ? styles.switchOn : null]}>
            <View style={[styles.switchKnob, smartCareEnabled ? styles.knobOn : null]} />
          </View>
        </Pressable>
      </Section>

      <Section title="알림 권한" caption={permissionReady ? "푸시 알림 발송 준비 완료" : "앱 내 H1/H3 안내는 권한 없이 유지"}>
        {permissionGateResult?.returnTo === "M2" ? (
          <View style={styles.permissionResult}>
            <Text style={styles.ruleTitle}>{permissionGateResult.message}</Text>
            <Text style={styles.ruleReason}>권한 gate 후 M2 알림 설정 맥락으로 복귀함</Text>
          </View>
        ) : null}
        <View style={styles.permissionRow}>
          <View style={styles.ruleCopy}>
            <Text style={styles.ruleTitle}>{permissionReady ? "알림 권한 정상" : "알림 권한 확인 필요"}</Text>
            <Text style={styles.ruleReason}>목적지 케어 발송은 계정과 알림 권한이 모두 필요</Text>
          </View>
          <StatusPill label={permissionReady ? "READY" : "대기"} tone={permissionReady ? "clear" : "warm"} />
        </View>
        <AppButton label={permissionReady ? "권한 다시 확인" : "권한 관리"} onPress={() => onRequestPermissionGate("notification", "M2", "general")} tone="secondary" />
      </Section>

      <Section
        title="목적지별 조건"
        caption={savedDestinations.length > 0 ? `${savedDestinations.length}개 저장 목적지 기준 관리` : "저장 전 기본 조건 미리보기"}
      >
        <View style={styles.selectedCondition}>
          <View style={styles.ruleCopy}>
            <Text style={styles.ruleTitle}>{selectedDestinationPlace.name}</Text>
            <Text style={styles.ruleReason}>
              강수 {selectedDestinationAlertCondition.rainThresholdPct}% · {selectedDestinationAlertCondition.leadTimeMinutes}분 전 · 바람{" "}
              {selectedDestinationAlertCondition.windThresholdMs}m/s
            </Text>
          </View>
          <AppButton label="목적지 케어" onPress={() => onNavigate("G2")} tone="secondary" />
        </View>
        {savedDestinations.map((destination) => (
          <DestinationConditionRow
            key={destination.place.id}
            destination={destination}
            onEdit={() => onEditDestinationAlertCondition(destination.place.id)}
          />
        ))}
      </Section>

      <Section title="현재 활성 규칙" caption={`${state.notifications.filter((item) => item.active).length}개 조건 매칭`}>
        {state.notifications.map((item) => (
          <RuleRow
            key={item.id}
            title={item.title}
            reason={smartCareEnabled ? item.reason : "스마트 알림 꺼짐"}
            pillLabel={smartCareEnabled && item.active ? "ON" : "대기"}
            pillTone={smartCareEnabled && item.active ? "clear" : "warm"}
            onEdit={() => onEditNotificationCondition(item.id, item.deepLink as P0RouteId)}
          />
        ))}
      </Section>

      <Section
        title="최근 알림 이력"
        caption={notificationHistory.length > 0 ? "H3 읽음/이동 결과 공유 중" : "H3에서 읽음 또는 이동 후 기록"}
      >
        {notificationHistory.length > 0 ? (
          notificationHistory.slice(0, 4).map((item) => (
            <View key={item.id} style={styles.ruleRow}>
              <View style={styles.ruleCopy}>
                <Text style={styles.ruleTitle}>{item.title}</Text>
                <Text style={styles.ruleReason}>{item.statusLabel}</Text>
              </View>
              <StatusPill label={item.action === "open" ? "이동" : "읽음"} tone={item.action === "open" ? "clear" : "sky"} />
            </View>
          ))
        ) : (
          <Text style={styles.emptyHistory}>저장된 알림 이력 없음</Text>
        )}
      </Section>

      <Section title="딥링크 확인" caption="H4/H5에서 M2로 들어온 뒤 원래 기능으로 돌아갈 수 있어야 함">
        <View style={styles.actions}>
          <AppButton label="알림 센터" onPress={() => onNavigate("H3")} />
          <AppButton label="우산 추천" onPress={() => onNavigate("H4")} tone="secondary" />
          <AppButton label="강수 타임라인" onPress={() => onNavigate("H5")} tone="secondary" />
        </View>
      </Section>

      <Section title="권한·정책" caption="위치 권한, 알림 권한, 정책 문서는 M3에서 통합 관리">
        <View style={styles.actions}>
          <AppButton label="MY" onPress={() => onNavigate("M1")} />
          <AppButton label="권한·정책 설정" onPress={() => onNavigate("M3")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

function DestinationConditionRow({ destination, onEdit }: { destination: P0ScreenProps["savedDestinations"][number]; onEdit: () => void }) {
  return (
    <View style={styles.ruleRow}>
      <View style={styles.ruleCopy}>
        <Text style={styles.ruleTitle}>{destination.place.name}</Text>
        <Text style={styles.ruleReason}>
          강수 {destination.alertCondition.rainThresholdPct}% · {destination.alertCondition.leadTimeMinutes}분 전 · 바람{" "}
          {destination.alertCondition.windThresholdMs}m/s
        </Text>
      </View>
      <View style={styles.rowActions}>
        <StatusPill label={destination.careEnabled ? "케어 ON" : "케어 OFF"} tone={destination.careEnabled ? "clear" : "warm"} />
        <AppButton label="조건" onPress={onEdit} tone="secondary" />
      </View>
    </View>
  );
}

function RuleRow({
  title,
  reason,
  pillLabel,
  pillTone,
  onEdit,
}: {
  title: string;
  reason: string;
  pillLabel: string;
  pillTone: "clear" | "gold" | "sky" | "warm";
  onEdit: () => void;
}) {
  return (
    <View style={styles.ruleRow}>
      <View style={styles.ruleCopy}>
        <Text style={styles.ruleTitle}>{title}</Text>
        <Text style={styles.ruleReason}>{reason}</Text>
      </View>
      <View style={styles.rowActions}>
        <StatusPill label={pillLabel} tone={pillTone} />
        <AppButton label="조건" onPress={onEdit} tone="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  focusCard: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(110, 231, 183, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(110, 231, 183, 0.22)",
  },
  focusTitle: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  switchRow: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  switchTitle: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  switchCopy: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  switchTrack: {
    width: 54,
    height: 32,
    justifyContent: "center",
    padding: 3,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  switchOn: {
    backgroundColor: appColors.clear,
  },
  switchKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: appColors.text,
  },
  knobOn: {
    alignSelf: "flex-end",
    backgroundColor: appColors.navy,
  },
  selectedCondition: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  permissionRow: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  permissionResult: {
    gap: 4,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(103,232,208,0.12)",
    borderWidth: 1,
    borderColor: "rgba(103,232,208,0.26)",
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  ruleCopy: {
    flex: 1,
  },
  rowActions: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  ruleTitle: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  ruleReason: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  emptyHistory: {
    color: appColors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});

function getAlertFocusMeta(focus: NonNullable<P0ScreenProps["alertSettingsRouteState"]>["focus"], returnTo?: P0RouteId) {
  const returnLabel = getRouteLabel(returnTo);
  if (focus === "umbrella") {
    return {
      title: "우산 알림 기준 조정",
      caption: "H4 우산 추천에서 들어온 설정",
      pillLabel: "우산",
      pillTone: "sky" as const,
      returnLabel,
    };
  }
  if (focus === "rain") {
    return {
      title: "강수 알림 기준 조정",
      caption: "H5 강수 타임라인에서 들어온 설정",
      pillLabel: "강수",
      pillTone: "clear" as const,
      returnLabel,
    };
  }
  if (focus === "destination") {
    return {
      title: "목적지 알림 기준 조정",
      caption: "G2 목적지 케어에서 들어온 설정",
      pillLabel: "목적지",
      pillTone: "gold" as const,
      returnLabel,
    };
  }
  return {
    title: "알림 기준 조정",
    caption: "일반 알림 설정 진입",
    pillLabel: "일반",
    pillTone: "warm" as const,
    returnLabel,
  };
}

function getRouteLabel(route?: P0RouteId) {
  if (route === "H4") return "우산 추천";
  if (route === "H5") return "강수 타임라인";
  if (route === "G2") return "목적지 케어";
  if (route === "H3") return "알림 센터";
  if (route === "G1") return "목적지 목록";
  if (route === "M1") return "MY";
  if (route === "M2") return "알림 설정";
  if (route === "M3") return "권한·정책";
  return "홈";
}
