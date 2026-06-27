import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import type { PolicyDocumentType } from "../state/useWeatherOnAppState";
import { appColors, radius, spacing } from "../theme/tokens";

const policyDocuments: Record<PolicyDocumentType, { title: string; badge: string; summary: string; points: string[] }> = {
  privacy: {
    title: "개인정보 처리방침",
    badge: "개인정보",
    summary: "날씨·위치·목적지·알림 설정 데이터 처리 기준",
    points: ["현재 위치는 날씨 조회와 권한 상태 표시에 사용", "목적지와 알림 조건은 저장·동기화 기능에 사용", "API 키와 외부 provider 인증 정보는 서버 환경변수에만 보관"],
  },
  terms: {
    title: "이용약관",
    badge: "약관",
    summary: "WeatherON 사용, 계정 연결, 저장 기능 기준",
    points: ["Guest는 조회와 미리보기 가능", "저장·동기화·목적지 케어는 계정 연결 후 사용", "외부 날씨·장소 provider 장애 시 fixture 또는 캐시 기준으로 안내"],
  },
  location: {
    title: "위치기반서비스 약관",
    badge: "위치",
    summary: "현재 위치와 목적지 기반 날씨 제공 기준",
    points: ["현재 위치 권한은 O3에서 허용 또는 나중에 설정 가능", "권한 미허용 시 수동 위치 기준으로 홈 날씨 표시", "목적지 좌표는 목적지 날씨와 출발 전 알림 조건에 사용"],
  },
  "open-source": {
    title: "오픈소스 라이선스",
    badge: "OSS",
    summary: "앱 빌드와 런타임 의존성 고지 기준",
    points: ["React Native·Expo·Vite 계열 의존성 고지 필요", "배포 전 자동 라이선스 목록 생성 단계 추가", "라이선스 전문은 릴리즈 문서와 앱 내 R2 화면에서 접근"],
  },
};

export function PolicyDocumentScreen({ selectedPolicyDocument, onReturnFromPolicyDocument, onNavigate }: P0ScreenProps) {
  const document = policyDocuments[selectedPolicyDocument];

  return (
    <AppScreen title={document.title} subtitle={document.summary} badge="R2">
      <Section title="문서 상태" caption="M3 정책 문서 접근로 검증용 상세 화면">
        <View style={styles.statusCard}>
          <View style={styles.copy}>
            <Text style={styles.title}>{document.title}</Text>
            <Text style={styles.body}>현재 문서: {document.badge}</Text>
          </View>
          <StatusPill label="접근 가능" tone="clear" />
        </View>
      </Section>

      <Section title="핵심 고지" caption="정식 법무 문안 확정 전 MVP 요약">
        <View style={styles.pointList}>
          {document.points.map((point) => (
            <View key={point} style={styles.pointRow}>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="이동" caption="정책 허브와 전역 설정으로 복귀 가능">
        <View style={styles.actions}>
          <AppButton label="R1 복귀" onPress={onReturnFromPolicyDocument} />
          <AppButton label="M3 설정" onPress={() => onNavigate("M3")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    minHeight: 78,
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
  pointList: {
    gap: spacing.sm,
  },
  pointRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  dot: {
    color: appColors.gold,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
  },
  pointText: {
    flex: 1,
    color: appColors.text,
    fontSize: 13,
    lineHeight: 22,
    fontWeight: "700",
  },
  actions: {
    gap: spacing.sm,
  },
});
