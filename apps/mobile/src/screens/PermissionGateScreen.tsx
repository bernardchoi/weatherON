import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { PermissionGateState } from "../state/useWeatherOnAppState";
import { appColors, radius, spacing } from "../theme/tokens";

type PermissionGateScreenProps = {
  gate: PermissionGateState | null;
  locationReady: boolean;
  permissionReady: boolean;
  onComplete: () => void;
  onCancel: () => void;
};

export function PermissionGateScreen({ gate, locationReady, permissionReady, onComplete, onCancel }: PermissionGateScreenProps) {
  const gateLabel = gate?.resumeLabel ?? "알림 권한";
  const isLocationGate = gate?.reason === "location";

  return (
    <AppScreen title="권한 설정" subtitle="허용·나중에 모두 원래 화면으로 복귀하는 O3 권한 gate" badge="O3">
      <Section title="필요 권한" caption={`${gateLabel} 설정 후 ${gate?.returnTo ?? "H1"} 화면으로 돌아감`}>
        <View style={styles.permissionCard}>
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>ON</Text>
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>{gateLabel}</Text>
            <Text style={styles.meta}>{isLocationGate ? "위치 권한이 없어도 수동 위치와 앱 내 추천은 유지됨" : "푸시 권한이 없어도 H1/H3 앱 내 알림 안내는 계속 유지됨"}</Text>
          </View>
          <StatusPill label="권한 확인" tone="gold" />
        </View>
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>복귀 상태</Text>
          <Text style={styles.stateCopy}>복귀 화면 {gate?.returnTo ?? "H1"} · resume {gate?.reason ?? "notification"}</Text>
          {gate?.selectedDestinationName ? <Text style={styles.stateCopy}>선택 목적지 유지 · {gate.selectedDestinationName}</Text> : null}
        </View>
      </Section>

      <Section title="권한 결과" caption="시스템 권한 요청은 추후 네이티브 연동, 현재는 세션 상태로 검증">
        <View style={styles.pillRow}>
          <StatusPill label={`locationReady ${locationReady ? "완료" : isLocationGate ? "대기" : "유지"}`} tone={locationReady ? "clear" : "sky"} />
          <StatusPill label={`permissionReady ${permissionReady ? "완료" : isLocationGate ? "유지" : "대기"}`} tone={permissionReady ? "clear" : "warm"} />
        </View>
        <View style={styles.actions}>
          <AppButton label="권한 허용 완료" onPress={onComplete} />
          <AppButton label="나중에 설정" onPress={onCancel} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  permissionCard: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(103,232,208,0.12)",
    borderWidth: 1,
    borderColor: "rgba(103,232,208,0.26)",
  },
  iconBox: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: appColors.clear,
  },
  iconText: {
    color: appColors.navy,
    fontSize: 13,
    fontWeight: "900",
  },
  copy: {
    flex: 1,
  },
  title: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  meta: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  stateBox: {
    gap: 4,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  stateTitle: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  stateCopy: {
    color: appColors.muted,
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
    gap: spacing.sm,
  },
});
