import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import type { AdConsentMode } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing } from "../theme/tokens";

const consentOptions: { mode: AdConsentMode; title: string; body: string; badge: string }[] = [
  { mode: "personalized", title: "동의", body: "날씨·위치 맥락을 활용해 더 관련성 높은 광고를 표시", badge: "맞춤" },
  { mode: "non-personalized", title: "동의하지 않음", body: "개인화 없이 일반 광고만 표시", badge: "비개인화" },
  { mode: "pending", title: "나중에 선택", body: "광고 SDK 연동 전까지 선택 대기 상태 유지", badge: "대기" },
];

export function AdConsentScreen({ adConsentMode, onSetAdConsentMode, onNavigate }: P0ScreenProps) {
  const theme = useAppTheme();
  return (
    <AppScreen title="광고 개인화 설정" subtitle="사용자가 언제든 변경할 수 있는 광고 동의 상태" badge="광고">
      <View style={[styles.weatherPreview, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}>
        <Text style={[styles.previewLocation, { color: theme.muted }]}>서울 마포구 합정동</Text>
        <Text style={[styles.previewTemp, { color: theme.text }]}>22°</Text>
        <Text style={[styles.previewCondition, { color: theme.muted }]}>맑음</Text>
        <View style={[styles.nativeAdSlot, { borderColor: theme.border, backgroundColor: theme.cardMuted }]}>
          <Text style={[styles.slotText, { color: theme.subtle }]}>광고 · 네이티브 광고</Text>
        </View>
      </View>

      <View style={[styles.consentPanel, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}>
        <View style={styles.handle} />
        <Text style={[styles.panelTitle, { color: theme.text }]}>광고 개인화 설정</Text>
        <Text style={[styles.panelBody, { color: theme.muted }]}>동의하지 않아도 광고는 계속 표시됩니다.</Text>
        <View style={styles.optionStack}>
          {consentOptions.map((option) => {
            const selected = option.mode === adConsentMode;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                key={option.mode}
                onPress={() => onSetAdConsentMode(option.mode)}
                style={[
                  styles.optionRow,
                  { backgroundColor: selected ? theme.cardMuted : theme.card, borderColor: selected ? theme.gold : theme.border },
                ]}
              >
                <View style={styles.copy}>
                  <Text style={[styles.title, { color: theme.text }]}>{option.title}</Text>
                  <Text style={[styles.body, { color: theme.muted }]}>{option.body}</Text>
                </View>
                <StatusPill label={option.badge} tone={selected ? "gold" : "sky"} />
              </Pressable>
            );
          })}
        </View>
      </View>

      <Section title="동의 상태" caption={`${getAdConsentLabel(adConsentMode)} · 설정에서 재변경 가능`} accent="gold">
        <View style={styles.actions}>
          <AppButton label="정책 허브" onPress={() => onNavigate("R1")} />
          <AppButton label="광고 배치" onPress={() => onNavigate("R4")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

function getAdConsentLabel(mode: AdConsentMode) {
  if (mode === "personalized") return "동의 대기에서 맞춤 광고 동의로 변경됨";
  if (mode === "non-personalized") return "비개인화 광고 선택됨";
  return "동의 대기";
}

const styles = StyleSheet.create({
  weatherPreview: {
    minHeight: 230,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  previewLocation: {
    fontSize: 13,
    fontWeight: "900",
  },
  previewTemp: {
    fontSize: 58,
    lineHeight: 66,
    fontWeight: "900",
  },
  previewCondition: {
    fontSize: 14,
    fontWeight: "900",
  },
  nativeAdSlot: {
    width: "100%",
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  slotText: {
    fontSize: 12,
    fontWeight: "800",
  },
  consentPanel: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(180,205,230,0.55)",
  },
  panelTitle: {
    textAlign: "center",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },
  panelBody: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "800",
  },
  optionStack: {
    gap: spacing.sm,
  },
  optionRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  body: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
