import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import type { AdConsentMode } from "../state/useWeatherOnAppState";
import { appColors, radius, spacing } from "../theme/tokens";

const consentOptions: { mode: AdConsentMode; title: string; body: string }[] = [
  { mode: "personalized", title: "맞춤 광고 동의", body: "날씨·위치 맥락 기반 광고 개인화 허용" },
  { mode: "non-personalized", title: "비개인화 광고", body: "개인화 없이 일반 광고만 허용" },
  { mode: "pending", title: "나중에 선택", body: "광고 SDK 연동 전까지 미설정 유지" },
];

export function AdConsentScreen({ adConsentMode, onSetAdConsentMode, onNavigate }: P0ScreenProps) {
  return (
    <AppScreen title="광고 동의 관리" subtitle="UMP 연동 전 맞춤/비개인화 광고 선택 상태를 앱에서 관리" badge="R3">
      <Section title="현재 상태" caption="정식 SDK 연동 전 로컬 상태 검증">
        <View style={styles.statusCard}>
          <Text style={styles.title}>{getAdConsentLabel(adConsentMode)}</Text>
          <StatusPill label={adConsentMode === "pending" ? "대기" : "설정됨"} tone={adConsentMode === "pending" ? "warm" : "clear"} />
        </View>
      </Section>

      <Section title="선택 옵션" caption="사용자는 언제든 R3에서 동의 상태를 변경 가능">
        {consentOptions.map((option) => (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: option.mode === adConsentMode }}
            key={option.mode}
            onPress={() => onSetAdConsentMode(option.mode)}
            style={[styles.optionRow, option.mode === adConsentMode ? styles.optionSelected : null]}
          >
            <View style={styles.radio}>{option.mode === adConsentMode ? <View style={styles.radioDot} /> : null}</View>
            <View style={styles.copy}>
              <Text style={styles.title}>{option.title}</Text>
              <Text style={styles.body}>{option.body}</Text>
            </View>
          </Pressable>
        ))}
      </Section>

      <Section title="이동" caption="정책 허브와 광고 배치 기준으로 이동">
        <View style={styles.actions}>
          <AppButton label="R1 복귀" onPress={() => onNavigate("R1")} />
          <AppButton label="광고 배치" onPress={() => onNavigate("R4")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

function getAdConsentLabel(mode: AdConsentMode) {
  if (mode === "personalized") return "맞춤 광고 동의";
  if (mode === "non-personalized") return "비개인화 광고";
  return "광고 동의 대기";
}

const styles = StyleSheet.create({
  statusCard: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  title: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  body: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  optionRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  optionSelected: {
    borderColor: appColors.clear,
    backgroundColor: "rgba(103,232,208,0.12)",
  },
  radio: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: appColors.clear,
  },
  actions: {
    gap: spacing.sm,
  },
});
