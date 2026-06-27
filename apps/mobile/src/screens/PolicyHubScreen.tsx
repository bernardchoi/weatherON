import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, radius, spacing } from "../theme/tokens";

export function PolicyHubScreen({ adConsentMode, onNavigate, onOpenPolicyDocument }: P0ScreenProps) {
  return (
    <AppScreen title="정책 허브" subtitle="개인정보, 약관, 광고 설정을 R1에서 모아 관리" badge="R1">
      <Section title="문서" caption="법무 전문 확정 전 앱 내 접근 경로 먼저 구현">
        <PolicyRow title="개인정보 처리방침" body="광고 SDK, 위치정보, 이용자 권리" actionLabel="보기" onPress={() => onOpenPolicyDocument("privacy")} />
        <PolicyRow title="이용약관" body="회원/게스트, 서비스 범위, 면책" actionLabel="보기" onPress={() => onOpenPolicyDocument("terms")} />
        <PolicyRow title="위치기반서비스 약관" body="현재 위치, 목적지, 동의 철회" actionLabel="보기" onPress={() => onOpenPolicyDocument("location")} />
        <PolicyRow title="오픈소스 라이선스" body="SDK와 패키지 라이선스 고지" actionLabel="보기" onPress={() => onOpenPolicyDocument("open-source")} />
      </Section>

      <Section title="광고" caption="AdMob 준비 구조와 동의 상태 확인">
        <View style={styles.adCard}>
          <View style={styles.copy}>
            <Text style={styles.title}>{getAdConsentLabel(adConsentMode)}</Text>
            <Text style={styles.body}>R3 동의 관리와 R4 배치 기준으로 분리</Text>
          </View>
          <StatusPill label="ADMOB 준비" tone="gold" />
        </View>
        <View style={styles.actions}>
          <AppButton label="광고 동의" onPress={() => onNavigate("R3")} />
          <AppButton label="광고 배치" onPress={() => onNavigate("R4")} tone="secondary" />
        </View>
      </Section>

      <Section title="복귀" caption="설정 허브로 돌아가기">
        <AppButton label="M3 복귀" onPress={() => onNavigate("M3")} tone="secondary" />
      </Section>
    </AppScreen>
  );
}

function PolicyRow({ title, body, actionLabel, onPress }: { title: string; body: string; actionLabel: string; onPress: () => void }) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
      <AppButton label={actionLabel} onPress={onPress} tone="secondary" />
    </View>
  );
}

function getAdConsentLabel(mode: P0ScreenProps["adConsentMode"]) {
  if (mode === "personalized") return "맞춤 광고 동의";
  if (mode === "non-personalized") return "비개인화 광고";
  return "광고 동의 대기";
}

const styles = StyleSheet.create({
  row: {
    minHeight: 74,
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
    fontSize: 15,
    fontWeight: "900",
  },
  body: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  adCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(244,182,63,0.12)",
    borderWidth: 1,
    borderColor: "rgba(244,182,63,0.24)",
  },
  actions: {
    gap: spacing.sm,
  },
});
