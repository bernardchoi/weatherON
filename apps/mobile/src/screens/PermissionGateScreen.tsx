import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import { getRouteLabel } from "../navigation/routeLabels";
import type { PermissionGateState } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

type PermissionGateScreenProps = {
  gate: PermissionGateState | null;
  locationReady: boolean;
  permissionReady: boolean;
  onComplete: () => void;
  onCancel: () => void;
};

export function PermissionGateScreen({ gate, locationReady, permissionReady, onComplete, onCancel }: PermissionGateScreenProps) {
  const theme = useAppTheme();
  const gateLabel = gate?.resumeLabel ?? "알림 권한";
  const isLocationGate = gate?.reason === "location";
  const returnLabel = getRouteLabel(gate?.returnTo);
  const readyCount = Number(locationReady) + Number(permissionReady);

  return (
    <AppScreen title="필요한 권한만 먼저 허용해 주세요" subtitle="나머지 알림 세부 설정은 다음 단계에서 정리" badge="권한">
      <View style={styles.segmentRow}>
        <View style={[styles.segmentActive, { backgroundColor: theme.gold }]}>
          <Text style={[styles.segmentText, { color: theme.onAccent }]}>권한 요청</Text>
        </View>
        <View style={[styles.segmentPassive, { borderColor: theme.border }]}>
          <Text style={[styles.segmentText, { color: theme.muted }]}>거부 상태</Text>
        </View>
      </View>

      <Section title="필요 권한" caption={`${gateLabel} 설정 후 ${returnLabel} 화면으로 돌아감`} accent="gold">
        <PermissionCard
          title="위치 권한"
          body="현재 위치 날씨·출발지 파악에 사용함"
          mark="위치"
          active={isLocationGate}
          ready={locationReady}
        />
        <PermissionCard
          title="알림 권한"
          body="강수·기상특보·외출 준비·여행·자기 전 확인 알림에 사용함"
          mark="알림"
          active={!isLocationGate}
          ready={permissionReady}
        />
        <View style={[styles.stateBox, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
          <View style={styles.stateHeader}>
            <Text style={[styles.stateTitle, { color: theme.gold }]}>권한 상태</Text>
            <StatusPill label={`${readyCount}/2`} tone={readyCount === 2 ? "clear" : "gold"} />
          </View>
          <Text style={[styles.stateCopy, { color: theme.muted }]}>허용하지 않아도 다음 단계 진행 가능</Text>
          {gate?.selectedDestinationName ? <Text style={[styles.stateCopy, { color: theme.muted }]}>선택 목적지 유지 · {gate.selectedDestinationName}</Text> : null}
        </View>
      </Section>

      <Section title="다음 단계" caption={`${returnLabel} 화면에서 ${getPermissionReasonLabel(gate?.reason)} 설정을 이어감`} accent="clear">
        <View style={styles.pillRow}>
          <StatusPill label={`위치 ${locationReady ? "허용됨" : isLocationGate ? "확인 중" : "나중에"}`} tone={locationReady ? "clear" : "sky"} />
          <StatusPill label={`알림 ${permissionReady ? "허용됨" : isLocationGate ? "나중에" : "확인 중"}`} tone={permissionReady ? "clear" : "warm"} />
        </View>
        <View style={styles.actions}>
          <AppButton label="권한 허용 완료" onPress={onComplete} />
          <AppButton label="나중에 설정" onPress={onCancel} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

function PermissionCard({ title, body, mark, active, ready }: { title: string; body: string; mark: string; active: boolean; ready: boolean }) {
  const theme = useAppTheme();
  return (
    <View style={[styles.permissionCard, { backgroundColor: theme.card, borderColor: active ? theme.sky : theme.gold }]}>
      <View style={[styles.iconBox, { backgroundColor: active ? theme.sky : theme.cardMuted }]}>
        <Text style={[styles.iconText, { color: active ? theme.onAccent : theme.gold }]}>{mark}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{body}</Text>
      </View>
      <StatusPill label={ready ? "허용됨" : active ? "허용" : "대기"} tone={ready ? "clear" : active ? "gold" : "sky"} />
    </View>
  );
}

function getPermissionReasonLabel(reason: PermissionGateState["reason"] | undefined) {
  if (reason === "location") return "위치";
  if (reason === "destination-care") return "목적지 케어";
  return "알림";
}

const styles = StyleSheet.create({
  segmentRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  segmentActive: {
    flex: 1,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  segmentPassive: {
    flex: 1,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "900",
  },
  permissionCard: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  iconBox: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  iconText: {
    fontSize: 12,
    fontWeight: "900",
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
  },
  meta: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  stateBox: {
    gap: 4,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  stateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  stateTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
  stateCopy: {
    fontSize: 12,
    lineHeight: 18,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
