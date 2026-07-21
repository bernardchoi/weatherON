import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { BackButton } from "../components/BackButton";
import { Section } from "../components/Section";
import type { P0ScreenProps } from "../navigation/types";
import type { PolicyDocumentType } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing } from "../theme/tokens";

const policyDocuments: Record<PolicyDocumentType, { title: string; updated: string; summary: string; points: string[]; notice: string }> = {
  privacy: {
    title: "개인정보처리방침",
    updated: "2026.06.20",
    summary: "개인정보 수집·이용 고지",
    points: [
      "수집하는 개인정보 항목: 기기정보, 네트워크 기반 위치, 앱 사용 데이터",
      "제3자 제공: 법령상 의무 또는 사용자가 동의한 경우에만 제공",
      "위치 정보 안내: 기기 설정에서 언제든 권한을 변경할 수 있음",
      "보관기간 및 파기: 회원 탈퇴 시 즉시 파기",
      "이용자 권리: 개인정보 열람·정정·삭제 요청 가능",
      "개인정보 보호책임자: privacy@weatheron.kr",
    ],
    notice: "약관 동의 화면의 개인정보 수집·이용 동의 항목과 같은 기준임",
  },
  terms: {
    title: "이용약관",
    updated: "2026.06.20",
    summary: "WeatherON 사용, 계정 연결, 저장 기능 기준",
    points: [
      "게스트는 홈·목적지 미리보기 사용 가능",
      "저장·동기화·목적지 케어는 계정 연결 후 사용",
      "외부 날씨·장소 서비스 장애 시 최근 예보 또는 기본 위치 기준 안내",
      "사용자는 언제든 계정 연결을 해제할 수 있음",
    ],
    notice: "계정 연결 화면과 약관 동의 화면에서 같은 기준을 사용함",
  },
  location: {
    title: "위치기반서비스 이용약관",
    updated: "2026.06.20",
    summary: "현재 위치와 목적지 기반 날씨 제공 기준",
    points: [
      "현재 위치 권한은 허용 또는 나중에 설정 가능",
      "권한 미허용 시 수동 위치 기준으로 홈 날씨 표시",
      "목적지 좌표는 목적지 날씨와 출발 전 알림 조건에 사용",
      "위치 권한은 기기 설정에서 언제든 변경 가능",
    ],
    notice: "위치 변경, 권한 요청, 목적지 케어 화면과 같은 위치 기준을 사용함",
  },
  "open-source": {
    title: "오픈소스 라이선스",
    updated: "2026.06.20",
    summary: "앱 빌드와 런타임 의존성 고지 기준",
    points: [
      "React Native·Expo·Vite 계열 의존성 고지 필요",
      "지도·날씨 SDK 라이선스 고지 필요",
      "사용 중인 라이브러리의 저작권과 라이선스 조건 고지",
      "라이선스 전문은 앱 내 정책 화면에서 접근",
    ],
    notice: "라이선스 전문은 앱 업데이트 시 함께 갱신됨",
  },
};

export function PolicyDocumentScreen({ selectedPolicyDocument, onReturnFromPolicyDocument, onNavigate }: P0ScreenProps) {
  const theme = useAppTheme();
  const document = policyDocuments[selectedPolicyDocument];

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <BackButton accessibilityLabel="상단 정책 목록으로 돌아가기" onPress={onReturnFromPolicyDocument} />
          <Text style={[styles.screenTitle, { color: theme.text }]} numberOfLines={1}>{document.title}</Text>
        </View>

        <View style={[styles.heroDoc, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: theme.text }]}>{document.title}</Text>
            <Text style={[styles.body, { color: theme.muted }]}>{document.summary}</Text>
          </View>
        </View>

        <View style={styles.pointList}>
          {document.points.map((point, index) => (
            <View key={point} style={[styles.pointRow, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}>
              <Text style={[styles.stepNumber, { color: theme.gold }]}>{index + 1}.</Text>
              <Text style={[styles.pointText, { color: theme.text }]}>{point}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.noticeBox, { backgroundColor: theme.cardMuted }]}>
          <Text style={[styles.body, { color: theme.muted }]}>{document.notice}</Text>
        </View>

        <Section title="문서" caption={`${document.title} · ${document.points.length}개 섹션 · 약관 동의와 동일 기준`} accent="gold">
          <View style={styles.actions}>
            <AppButton label="정책 목록" accessibilityLabel="정책 목록으로 돌아가기" onPress={onReturnFromPolicyDocument} />
            <AppButton label="MY 설정" accessibilityLabel="MY에서 위치·알림 설정 확인" onPress={() => onNavigate("M1")} tone="secondary" />
          </View>
        </Section>
      </ScrollView>
    </View>
  );
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
    paddingBottom: spacing.xl,
  },
  atmosphere: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 280,
    height: 500,
    opacity: 0.34,
    borderRadius: 78,
  },
  header: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  screenTitle: {
    flex: 1,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: 0,
  },
  heroDoc: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
  },
  body: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  pointList: {
    gap: spacing.sm,
  },
  pointRow: {
    minHeight: 56,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  stepNumber: {
    width: 24,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "900",
  },
  pointText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 22,
    fontWeight: "800",
  },
  noticeBox: {
    padding: spacing.md,
    borderRadius: radius.md,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
