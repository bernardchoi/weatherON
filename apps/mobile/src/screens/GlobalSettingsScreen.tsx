import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, radius, spacing } from "../theme/tokens";

export function GlobalSettingsScreen({
  locationReady,
  permissionReady,
  permissionGateResult,
  accountLinked,
  termsRequiredAccepted,
  adConsentMode,
  temperatureUnit,
  themeMode,
  reducedTransparency,
  onNavigate,
  onRequestPermissionGate,
  onSetTemperatureUnit,
  onSetThemeMode,
  onToggleReducedTransparency,
}: P0ScreenProps) {
  return (
    <AppScreen title="권한·정책" subtitle="위치·알림 권한과 필수 정책 문서 접근로를 한곳에서 관리함" badge="M3">
      {permissionGateResult?.returnTo === "M3" ? (
        <Section title="최근 권한 결과" caption="O3 권한 gate 후 M3로 복귀함">
          <View style={styles.resultCard}>
            <Text style={styles.rowTitle}>{permissionGateResult.message}</Text>
            <StatusPill label={permissionGateResult.reason === "location" ? "위치" : "알림"} tone="clear" />
          </View>
        </Section>
      ) : null}

      <Section title="전역 설정" caption="M3 단위·테마·시각 효과 설정">
        <SettingsRow
          title="온도 단위"
          body={temperatureUnit === "celsius" ? "섭씨 기준으로 표시" : "화씨 기준으로 표시"}
          pillLabel={temperatureUnit === "celsius" ? "°C" : "°F"}
          pillTone="sky"
          actionLabel={temperatureUnit === "celsius" ? "화씨로" : "섭씨로"}
          onAction={() => onSetTemperatureUnit(temperatureUnit === "celsius" ? "fahrenheit" : "celsius")}
        />
        <SettingsRow
          title="테마"
          body={getThemeModeBody(themeMode)}
          pillLabel={getThemeModeLabel(themeMode)}
          pillTone="gold"
          actionLabel="변경"
          onAction={() => onSetThemeMode(getNextThemeMode(themeMode))}
        />
        <SettingsRow
          title="투명 효과"
          body={reducedTransparency ? "저사양 기기용 투명 효과 축소" : "기본 투명 효과 사용"}
          pillLabel={reducedTransparency ? "줄임" : "기본"}
          pillTone={reducedTransparency ? "warm" : "clear"}
          actionLabel="토글"
          onAction={onToggleReducedTransparency}
        />
      </Section>

      <Section title="권한 상태" caption="현재 위치와 푸시 알림은 별도 권한으로 관리">
        <SettingsRow
          title={locationReady ? "위치 권한 허용됨" : "위치 권한 대기"}
          body={locationReady ? "현재 위치 기반 날씨 자동 갱신 가능" : "H1 현재 위치 사용 시 O3 권한 확인 필요"}
          pillLabel={locationReady ? "READY" : "대기"}
          pillTone={locationReady ? "clear" : "warm"}
          actionLabel={locationReady ? "위치 다시 확인" : "위치 권한"}
          onAction={() => onRequestPermissionGate("location", "M3")}
        />
        <SettingsRow
          title={permissionReady ? "알림 권한 허용됨" : "알림 권한 대기"}
          body={permissionReady ? "우산·강수·목적지 케어 발송 준비 완료" : "앱 내 H1/H3 안내는 권한 없이 유지"}
          pillLabel={permissionReady ? "READY" : "대기"}
          pillTone={permissionReady ? "clear" : "warm"}
          actionLabel={permissionReady ? "알림 다시 확인" : "알림 권한"}
          onAction={() => onRequestPermissionGate("notification", "M3", "general")}
        />
      </Section>

      <Section title="계정·동의" caption="저장·동기화·목적지 케어 확장 기준">
        <SettingsRow
          title={accountLinked ? "계정 연결됨" : "Guest 모드"}
          body={termsRequiredAccepted ? "필수 약관 동의 완료" : "저장 기능 사용 시 A2/A3 gate 호출"}
          pillLabel={termsRequiredAccepted ? "동의 완료" : "필요 시"}
          pillTone={termsRequiredAccepted ? "clear" : "sky"}
          actionLabel="계정 관리"
          onAction={() => onNavigate("A4")}
        />
      </Section>

      <Section title="정책·광고" caption="R1 허브에서 개인정보·약관·광고 동의·광고 배치 기준 확인">
        <View style={styles.resultCard}>
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>{getAdConsentLabel(adConsentMode)}</Text>
            <Text style={styles.rowBody}>정책 문서와 광고 설정은 R1/R3/R4에서 관리</Text>
          </View>
          <StatusPill label="R1" tone="gold" />
        </View>
        <View style={styles.documentGrid}>
          <AppButton label="정책 허브" onPress={() => onNavigate("R1")} />
          <AppButton label="광고 동의" onPress={() => onNavigate("R3")} tone="secondary" />
          <AppButton label="광고 배치" onPress={() => onNavigate("R4")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

type SettingsRowProps = {
  title: string;
  body: string;
  pillLabel: string;
  pillTone: "clear" | "gold" | "sky" | "warm";
  actionLabel: string;
  onAction: () => void;
};

function SettingsRow({ title, body, pillLabel, pillTone, actionLabel, onAction }: SettingsRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowBody}>{body}</Text>
      </View>
      <View style={styles.rowActions}>
        <StatusPill label={pillLabel} tone={pillTone} />
        <AppButton label={actionLabel} onPress={onAction} tone="secondary" />
      </View>
    </View>
  );
}

function getAdConsentLabel(mode: P0ScreenProps["adConsentMode"]) {
  if (mode === "personalized") return "맞춤 광고 동의";
  if (mode === "non-personalized") return "비개인화 광고";
  return "광고 동의 대기";
}

function getThemeModeLabel(mode: P0ScreenProps["themeMode"]) {
  if (mode === "light") return "라이트";
  if (mode === "dark") return "다크";
  return "시스템";
}

function getThemeModeBody(mode: P0ScreenProps["themeMode"]) {
  if (mode === "light") return "라이트 테마 고정";
  if (mode === "dark") return "다크 테마 고정";
  return "시스템 설정 자동 추종";
}

function getNextThemeMode(mode: P0ScreenProps["themeMode"]) {
  if (mode === "system") return "light";
  if (mode === "light") return "dark";
  return "system";
}

const styles = StyleSheet.create({
  resultCard: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(103,232,208,0.12)",
    borderWidth: 1,
    borderColor: "rgba(103,232,208,0.24)",
  },
  row: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  rowCopy: {
    flex: 1,
    gap: 5,
  },
  rowTitle: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  rowBody: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  rowActions: {
    minWidth: 118,
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  documentGrid: {
    gap: spacing.sm,
  },
});
