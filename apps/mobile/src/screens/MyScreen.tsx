import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, radius, spacing } from "../theme/tokens";

export function MyScreen({
  accountLinked,
  termsRequiredAccepted,
  locationReady,
  permissionReady,
  savedDestinations,
  notificationHistory,
  adConsentMode,
  styleProfileSaved,
  selectedStyles,
  fitPreference,
  onboardingCompleted,
  wardrobeItems,
  onNavigate,
}: P0ScreenProps) {
  const ownedWardrobeCount = wardrobeItems.filter((item) => item.owned).length;
  return (
    <AppScreen title="MY" subtitle="계정, 알림, 권한, 정책으로 이어지는 설정 허브" badge="M1">
      <Section title="계정 요약" caption="저장·동기화 기능은 계정 연결 후 확장">
        <View style={styles.summaryCard}>
          <View style={styles.copy}>
            <Text style={styles.title}>{accountLinked ? "계정 연결됨" : "Guest 모드"}</Text>
            <Text style={styles.body}>{termsRequiredAccepted ? "필수 약관 동의 완료" : "필요할 때 A2/A3 gate 호출"}</Text>
          </View>
          <StatusPill label={accountLinked ? "LINKED" : "GUEST"} tone={accountLinked ? "clear" : "gold"} />
        </View>
        <View style={styles.actions}>
          <AppButton label="계정 관리" onPress={() => onNavigate("A4")} />
          <AppButton label="권한·정책" onPress={() => onNavigate("M3")} tone="secondary" />
        </View>
      </Section>

      <Section title="케어 상태" caption="MY에서 현재 자동 케어 범위를 빠르게 확인">
        <MetricRow label="저장 목적지" value={`${savedDestinations.length}개`} tone="sky" />
        <MetricRow label="알림 이력" value={`${notificationHistory.length}건`} tone="gold" />
        <MetricRow label="위치 권한" value={locationReady ? "READY" : "대기"} tone={locationReady ? "clear" : "warm"} />
        <MetricRow label="알림 권한" value={permissionReady ? "READY" : "대기"} tone={permissionReady ? "clear" : "warm"} />
      </Section>

      <Section title="개인화 기준" caption="O4 스타일 기준과 선택 온보딩 상태">
        <View style={styles.summaryCard}>
          <View style={styles.copy}>
            <Text style={styles.title}>{styleProfileSaved ? "스타일 기준 저장됨" : "스타일 기준 미완료"}</Text>
            <Text style={styles.body}>
              {selectedStyles.join(" · ")} · {getFitLabel(fitPreference)} · 온보딩 {onboardingCompleted ? "완료" : "진행 전"}
            </Text>
          </View>
          <StatusPill label={styleProfileSaved ? "O4" : "필요"} tone={styleProfileSaved ? "clear" : "warm"} />
        </View>
        <View style={styles.actions}>
          <AppButton label="온보딩 시작" onPress={() => onNavigate("O2")} />
          <AppButton label="스타일 기준" onPress={() => onNavigate("O4")} tone="secondary" />
        </View>
      </Section>

      <Section title="옷장" caption={`${ownedWardrobeCount}개 보유`}>
        <View style={styles.summaryCard}>
          <View style={styles.copy}>
            <Text style={styles.title}>{ownedWardrobeCount > 0 ? "옷장 반영 중" : "옷장 미등록"}</Text>
            <Text style={styles.body}>C2에서 프리셋 추가/해제로 추천 매칭률 반영</Text>
          </View>
          <StatusPill label={ownedWardrobeCount > 0 ? "ACTIVE" : "READY"} tone={ownedWardrobeCount > 0 ? "clear" : "warm"} />
        </View>
        <View style={styles.actions}>
          <AppButton label="옷장 보기" onPress={() => onNavigate("C2")} />
        </View>
      </Section>

      <Section title="빠른 이동" caption="M2/M3/R1을 MY에서 진입">
        <View style={styles.actions}>
          <AppButton label="알림 설정" onPress={() => onNavigate("M2")} />
          <AppButton label="전역 설정" onPress={() => onNavigate("M3")} tone="secondary" />
          <AppButton label="정책 허브" onPress={() => onNavigate("R1")} tone="secondary" />
        </View>
      </Section>

      <Section title="광고 동의" caption="AdMob 도입 전 앱 내 접근로 우선 제공">
        <View style={styles.summaryCard}>
          <View style={styles.copy}>
            <Text style={styles.title}>{getAdConsentLabel(adConsentMode)}</Text>
            <Text style={styles.body}>R3에서 맞춤/비개인화 광고 옵션 관리</Text>
          </View>
          <AppButton label="관리" onPress={() => onNavigate("R3")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

function MetricRow({ label, value, tone }: { label: string; value: string; tone: "clear" | "gold" | "sky" | "warm" }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <StatusPill label={value} tone={tone} />
    </View>
  );
}

function getAdConsentLabel(mode: P0ScreenProps["adConsentMode"]) {
  if (mode === "personalized") return "맞춤 광고 동의";
  if (mode === "non-personalized") return "비개인화 광고";
  return "광고 동의 대기";
}

function getFitLabel(value: P0ScreenProps["fitPreference"]) {
  if (value === "relaxed") return "릴랙스";
  if (value === "formal") return "포멀";
  if (value === "outdoor") return "아웃도어";
  return "스탠다드";
}

const styles = StyleSheet.create({
  summaryCard: {
    minHeight: 82,
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
  actions: {
    gap: spacing.sm,
  },
  metricRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  metricLabel: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: "800",
  },
});
