import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import type { PolicyDocumentType } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

const policyRows: { type: PolicyDocumentType; icon: string; title: string; body: string }[] = [
  { type: "privacy", icon: "방패", title: "개인정보처리방침", body: "위치·광고 식별자·앱 사용 데이터" },
  { type: "terms", icon: "문서", title: "이용약관", body: "게스트·계정 연결·저장 기능 기준" },
  { type: "location", icon: "위치", title: "위치기반서비스 이용약관", body: "현재 위치와 목적지 기반 안내" },
  { type: "open-source", icon: "OSS", title: "오픈소스 라이선스", body: "Expo·React Native·SDK 고지" },
];

export function PolicyHubScreen({ adConsentMode, onNavigate, onOpenPolicyDocument }: P0ScreenProps) {
  const theme = useAppTheme();
  return (
    <AppScreen title="설정" subtitle="정책 문서와 광고 설정을 한곳에서 관리" badge="정책">
      <View style={[styles.quickPanel, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
        <PolicyQuickItem title="알림 설정" body="스마트 케어와 푸시 조건" onPress={() => onNavigate("M2")} theme={theme} />
        <PolicyQuickItem title="계정 관리" body="로그아웃·연결 상태" onPress={() => onNavigate("A4")} theme={theme} />
        <PolicyQuickItem title="광고 및 맞춤 설정" body={getAdConsentLabel(adConsentMode)} onPress={() => onNavigate("R3")} theme={theme} />
      </View>

      <View style={[styles.documentPanel, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
        {policyRows.map((item, index) => (
          <Pressable
            accessibilityRole="button"
            key={item.type}
            onPress={() => onOpenPolicyDocument(item.type)}
            style={[styles.documentRow, index < policyRows.length - 1 ? { borderBottomColor: theme.border, borderBottomWidth: 1 } : null]}
          >
            <View style={[styles.iconBox, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
              <Text style={[styles.iconText, { color: theme.sky }]}>{item.icon}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.body, { color: theme.muted }]}>{item.body}</Text>
            </View>
            <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
          </Pressable>
        ))}
      </View>

      <Section title="정책" caption="M3에서 진입 · 선택 항목 정책 허브 대기 · AdMob 심사 문서 허브" accent="gold">
        <View style={styles.actions}>
          <AppButton label="광고 동의" onPress={() => onNavigate("R3")} />
          <AppButton label="광고 배치" onPress={() => onNavigate("R4")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

function PolicyQuickItem({ title, body, onPress, theme }: { title: string; body: string; onPress: () => void; theme: AppTheme }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.quickRow, { borderBottomColor: theme.border }]}>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.body, { color: theme.muted }]}>{body}</Text>
      </View>
      <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
    </Pressable>
  );
}

function getAdConsentLabel(mode: P0ScreenProps["adConsentMode"]) {
  if (mode === "personalized") return "맞춤 광고 동의됨";
  if (mode === "non-personalized") return "비개인화 광고 선택";
  return "동의 대기";
}

const styles = StyleSheet.create({
  quickPanel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  quickRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  documentPanel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  documentRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  iconBox: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  iconText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  body: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  chevron: {
    fontSize: 22,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
