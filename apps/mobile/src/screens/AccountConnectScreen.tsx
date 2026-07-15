import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import type { AccountGateState } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing, type AppTheme } from "../theme/tokens";

type AccountConnectScreenProps = {
  gate: AccountGateState | null;
  onComplete: () => void;
  onCancel: () => void;
};

type ProviderTone = "kakao" | "naver" | "line" | "google" | "apple" | "email";

const primaryProviders: { id: ProviderTone; label: string; caption: string }[] = [
  { id: "kakao", label: "카카오로 계속", caption: "간편하게 연결" },
  { id: "naver", label: "네이버로 계속", caption: "자주 쓰는 계정으로 연결" },
];

const extraProviders: { id: ProviderTone; label: string; caption: string }[] = [
  { id: "line", label: "LINE으로 계속", caption: "해외 계정으로 연결" },
  { id: "google", label: "Google로 계속", caption: "공용 계정으로 연결" },
  { id: "apple", label: "Apple로 계속", caption: "이메일 숨기기 지원" },
  { id: "email", label: "이메일 코드로 계속", caption: "이메일로 계정 연결" },
];

export function AccountConnectScreen({ gate, onComplete, onCancel }: AccountConnectScreenProps) {
  const theme = useAppTheme();
  const [showOtherMethods, setShowOtherMethods] = useState(false);
  const resumeLabel = gate?.resumeLabel ?? "준비 설정";
  const destinationName = gate?.selectedDestinationName;

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <BackButton onPress={onCancel} />
          <Text style={[styles.title, { color: theme.text }]}>계정 연결</Text>
        </View>

        <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow(theme)]}>
          <Text style={[styles.heroTitle, { color: theme.text }]}>계정 상태를 연결하면{"\n"}준비 설정을 이어갈 수 있어요</Text>
          <Text style={[styles.heroBody, { color: theme.muted }]}>
            계정을 연결하면 저장·동기화 상태를{"\n"}이어서 사용할 수 있어요
          </Text>
        </View>

        <View style={[styles.stepNotice, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}>
          <Text style={[styles.stepKicker, { color: theme.gold }]}>다음 단계</Text>
          <Text style={[styles.stepTitle, { color: theme.text }]}>약관 확인 후 원래 화면으로 돌아감</Text>
          <Text style={[styles.stepBody, { color: theme.subtle }]}>위치·알림 권한은 계정과 별도이며 MY에서 따로 켤 수 있음</Text>
        </View>

        {destinationName ? (
          <View style={[styles.contextCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}>
            <Text style={[styles.contextKicker, { color: theme.gold }]}>{resumeLabel}</Text>
            <Text style={[styles.contextTitle, { color: theme.text }]}>{destinationName}</Text>
            <Text style={[styles.contextBody, { color: theme.muted }]}>계정 연결 후 이 목적지의 날씨 비교와 출발 알림을 이어서 저장해요</Text>
          </View>
        ) : null}

        <View style={styles.recommendBlock}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>연결 방법</Text>
          <Text style={[styles.sectionCaption, { color: theme.subtle }]}>사용할 계정 방식을 선택</Text>

          <View style={styles.intentTabs}>
            <View style={[styles.intentTab, { backgroundColor: theme.cardStrong }]}>
              <Text style={[styles.intentText, { color: theme.text }]}>{destinationName ? "목적지 유지" : "설정 이어보기"}</Text>
            </View>
            <View style={[styles.intentTab, { backgroundColor: theme.cardStrong }]}>
              <Text style={[styles.intentText, { color: theme.text }]}>{resumeLabel}</Text>
            </View>
          </View>

          <View style={styles.providerList}>
            {primaryProviders.map((provider) => (
              <ProviderButton key={provider.id} provider={provider} onPress={onComplete} theme={theme} />
            ))}
            {showOtherMethods
              ? extraProviders.map((provider) => <ProviderButton key={provider.id} provider={provider} onPress={onComplete} theme={theme} />)
              : null}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => setShowOtherMethods((current) => !current)}
            style={[styles.otherButton, { borderColor: theme.border, backgroundColor: showOtherMethods ? theme.cardStrong : "transparent" }]}
          >
            <Text style={[styles.otherText, { color: theme.muted }]}>{showOtherMethods ? "다른 방법 접기" : "다른 방법 보기"}</Text>
          </Pressable>
        </View>

        <Pressable accessibilityRole="button" onPress={onCancel} style={styles.laterButton}>
          <Text style={[styles.laterText, { color: theme.subtle }]}>나중에 할래요</Text>
        </Pressable>

        <Text style={[styles.footer, { color: theme.subtle }]}>약관 확인 후 저장 상태가 연결됨</Text>
      </ScrollView>
    </View>
  );
}

function ProviderButton({
  provider,
  onPress,
  theme,
}: {
  provider: { id: ProviderTone; label: string; caption: string };
  onPress: () => void;
  theme: AppTheme;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.providerButton, { backgroundColor: theme.cardStrong }]}>
      <View style={[styles.providerIcon, { backgroundColor: getProviderColor(provider.id) }]}>
        <Text style={[styles.providerIconText, { color: getProviderTextColor(provider.id) }]}>{getProviderMark(provider.id)}</Text>
      </View>
      <View style={styles.providerCopy}>
        <Text style={[styles.providerLabel, { color: theme.text }]}>{provider.label}</Text>
        <Text style={[styles.providerCaption, { color: theme.subtle }]}>{provider.caption}</Text>
      </View>
    </Pressable>
  );
}

function getProviderColor(providerId: ProviderTone) {
  if (providerId === "kakao") return "#FEE500";
  if (providerId === "naver") return "#03C75A";
  if (providerId === "line") return "#4CC764";
  if (providerId === "google") return "#F8FBFF";
  if (providerId === "apple") return "#111827";
  return "#3D87B5";
}

function getProviderTextColor(providerId: ProviderTone) {
  if (providerId === "apple" || providerId === "email") return "#F8FBFF";
  return "#123858";
}

function getProviderMark(providerId: ProviderTone) {
  if (providerId === "kakao") return "●";
  if (providerId === "naver") return "N";
  if (providerId === "line") return "L";
  if (providerId === "google") return "G";
  if (providerId === "apple") return "A";
  return "@";
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    minHeight: "100%",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
  },
  atmosphere: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 450,
    height: 480,
    opacity: 0.48,
    borderRadius: 80,
  },
  header: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  title: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: 0,
  },
  heroCard: {
    minHeight: 156,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: 20,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  heroTitle: {
    textAlign: "center",
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "900",
  },
  heroBody: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "700",
  },
  contextCard: {
    gap: 5,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderLeftWidth: 2,
  },
  contextKicker: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  contextTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
  },
  contextBody: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  stepNotice: {
    gap: 4,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  stepKicker: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  stepTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  stepBody: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  recommendBlock: {
    gap: spacing.sm,
    alignItems: "stretch",
  },
  sectionTitle: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  sectionCaption: {
    textAlign: "center",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  intentTabs: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: 2,
  },
  intentTab: {
    flex: 1,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  intentText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  providerList: {
    gap: spacing.sm,
  },
  providerButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 16,
    borderRadius: radius.md,
  },
  providerIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  providerIconText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "900",
  },
  providerCopy: {
    flex: 1,
    gap: 2,
  },
  providerLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  providerCaption: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
  },
  otherButton: {
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  otherText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
  },
  laterButton: {
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  laterText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  footer: {
    marginTop: "auto",
    textAlign: "center",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "700",
  },
});
