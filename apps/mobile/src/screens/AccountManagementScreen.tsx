import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, radius, spacing } from "../theme/tokens";

export function AccountManagementScreen({
  accountLinked,
  termsRequiredAccepted,
  savedDestinations,
  outfitSaved,
  onNavigate,
  onRequireAccount,
  onSignOutAccount,
}: P0ScreenProps) {
  return (
    <AppScreen title="계정 관리" subtitle="연결 계정, 저장 데이터, 위험 액션을 A4에서 분리 관리" badge="A4">
      <Section title="연결 상태" caption="A2/A3 gate 결과와 저장 기능 상태">
        <View style={styles.accountCard}>
          <View style={styles.copy}>
            <Text style={styles.title}>{accountLinked ? "WeatherON 계정 연결됨" : "Guest 계정"}</Text>
            <Text style={styles.body}>{termsRequiredAccepted ? "필수 약관 동의 완료" : "계정 연결 시 필수 약관 확인 필요"}</Text>
          </View>
          <StatusPill label={accountLinked ? "LINKED" : "GUEST"} tone={accountLinked ? "clear" : "gold"} />
        </View>
        <View style={styles.actions}>
          {!accountLinked ? <AppButton label="계정 연결 시작" onPress={() => onRequireAccount("notification", "M1")} /> : null}
          <AppButton label="MY 복귀" onPress={() => onNavigate("M1")} tone="secondary" />
        </View>
      </Section>

      <Section title="저장 데이터" caption="계정 기반 데이터 범위 확인">
        <DataRow label="저장 목적지" value={`${savedDestinations.length}개`} />
        <DataRow label="저장 코디" value={outfitSaved ? "1건" : "0건"} />
        <DataRow label="데이터 내보내기" value="Phase 3" />
      </Section>

      <Section title="위험 액션" caption="로그아웃은 계정 기반 저장 상태를 초기화">
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>로그아웃</Text>
          <Text style={styles.body}>계정 연결, 약관 완료, 저장 코디, 저장 목적지 상태를 초기화함</Text>
        </View>
        <AppButton label="로그아웃" onPress={onSignOutAccount} tone="warning" />
      </Section>
    </AppScreen>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <StatusPill label={value} tone="sky" />
    </View>
  );
}

const styles = StyleSheet.create({
  accountCard: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  title: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  body: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  dataRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  dataLabel: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  warningBox: {
    gap: 5,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,179,124,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,179,124,0.28)",
  },
  warningTitle: {
    color: appColors.warm,
    fontSize: 15,
    fontWeight: "900",
  },
  actions: {
    gap: spacing.sm,
  },
});
