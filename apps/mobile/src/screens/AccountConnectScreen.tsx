import React, { useEffect, useMemo, useState } from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "../components/AppScreen";
import { ProviderBrandIcon } from "../components/provider-brand-icon";
import { listAvailableAccountProviders, type AccountProvider, type AccountProviderAvailability } from "../providers/accountAuth";
import { getAccountRegionLabel, orderProvidersForRegion, resolveAccountRegion } from "../providers/accountRegion";
import type { AccountAuthStatus, AccountGateState } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { pageStyles } from "../theme/pageStyles";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { radius, spacing, type AppTheme } from "../theme/tokens";

type AccountConnectScreenProps = {
  gate: AccountGateState | null;
  authStatus: AccountAuthStatus;
  authMessage: string | null;
  onSignIn: (provider: AccountProvider) => Promise<void>;
  onCancel: () => void;
};

const providerLabels: Record<AccountProvider, string> = {
  apple: "Apple로 계속",
  kakao: "카카오 로그인",
  naver: "네이버로 계속",
  line: "LINE으로 계속",
  google: "Google로 계속",
};

export function AccountConnectScreen({ gate, authStatus, authMessage, onSignIn, onCancel }: AccountConnectScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const [showOtherMethods, setShowOtherMethods] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [availability, setAvailability] = useState<AccountProviderAvailability[]>([]);
  const [providerCheckComplete, setProviderCheckComplete] = useState(false);
  const region = useMemo(() => resolveAccountRegion(), []);
  const isSigningIn = authStatus === "signing-in";
  const destinationName = gate?.selectedDestinationName;
  const resumeLabel = gate?.resumeLabel ?? "준비 설정";

  useEffect(() => {
    let active = true;
    void Promise.all([
      Platform.OS === "ios" ? AppleAuthentication.isAvailableAsync().catch(() => false) : Promise.resolve(false),
      listAvailableAccountProviders(),
    ]).then(([apple, providers]) => {
      if (!active) return;
      setAppleAvailable(apple);
      setAvailability(providers);
      setProviderCheckComplete(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const orderedProviders = useMemo(() => {
    const available: AccountProvider[] = availability.filter((item) => item.available).map((item) => item.provider);
    if (appleAvailable) available.push("apple");
    return orderProvidersForRegion(region, available);
  }, [appleAvailable, availability, region]);
  const recommendedProviders = orderedProviders.slice(0, 3);
  const otherProviders = orderedProviders.slice(3);

  return (
    <AppScreen
      title="계정 연결"
      subtitle="사용할 계정 방식을 선택해 주세요"
      onBack={onCancel}
      compactHeader
      contentGap={layout.accountContentGap}
      contentPaddingTop={layout.weatherTopPadding}
    >
        <View style={[styles.hero, pageStyles.card, { minHeight: layout.accountHeroMinHeight, padding: layout.accountPanelPadding, backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.heroKicker, { color: theme.sky }]}>저장하고 이어보기</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>나만의 날씨 준비를{`\n`}다음에도 이어보세요</Text>
        </View>

        {destinationName ? (
          <View style={[styles.contextStrip, pageStyles.card, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <View style={[styles.contextDot, { backgroundColor: theme.gold }]} />
            <View style={styles.contextCopy}>
              <Text style={[styles.contextKicker, { color: theme.gold }]}>연결 후 바로 이어져요</Text>
              <Text style={[styles.contextTitle, { color: theme.text }]} numberOfLines={1}>{`${destinationName} · ${resumeLabel}`}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, pageStyles.sectionTitle, { color: theme.text }]}>추천 계정</Text>
          <Text style={[styles.sectionMeta, { color: theme.subtle }]}>{getAccountRegionLabel(region)}</Text>
        </View>

        <View style={styles.providerList}>
          {recommendedProviders.map((provider) => (
            <ProviderButton key={provider} provider={provider} minHeight={Math.max(48, layout.accountProviderMinHeight)} disabled={isSigningIn} onPress={() => void onSignIn(provider)} theme={theme} />
          ))}
          {recommendedProviders.length === 0 ? (
            <View style={[styles.unavailablePanel, pageStyles.card, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
              <Text style={[styles.unavailableText, { color: theme.muted }]}>
                {providerCheckComplete ? "간편 로그인을 불러오지 못했어요. 잠시 후 다시 시도해 주세요" : "간편 로그인을 준비하고 있어요"}
              </Text>
            </View>
          ) : null}
        </View>

        {isSigningIn ? <Text accessibilityLiveRegion="polite" style={[styles.authStatus, { color: theme.sky }]}>안전하게 계정을 연결하고 있어요</Text> : null}
        {authMessage ? <Text accessibilityLiveRegion="polite" selectable style={[styles.authStatus, { color: authStatus === "error" ? theme.alert : theme.muted }]}>{authMessage}</Text> : null}

        {showOtherMethods && otherProviders.length > 0 ? (
          <View style={styles.providerList}>
            {otherProviders.map((provider) => (
              <ProviderButton key={provider} provider={provider} minHeight={Math.max(48, layout.accountProviderMinHeight)} disabled={isSigningIn} onPress={() => void onSignIn(provider)} theme={theme} />
            ))}
          </View>
        ) : null}

        {otherProviders.length > 0 ? (
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: showOtherMethods }} onPress={() => setShowOtherMethods((current) => !current)} style={({ pressed }) => [styles.otherButton, pageStyles.card, { borderColor: theme.border, borderWidth: 1, backgroundColor: showOtherMethods ? theme.cardStrong : "transparent", opacity: pressed ? 0.72 : 1 }]}>
            <Text style={[styles.otherText, { color: theme.muted }]}>{showOtherMethods ? "계정 선택 줄이기" : "다른 계정으로 계속하기"}</Text>
          </Pressable>
        ) : null}

        <View style={[styles.nextStep, pageStyles.card, { backgroundColor: theme.cardMuted }]}>
          <Text style={[styles.nextStepTitle, { color: theme.text }]}>다음 단계</Text>
          <Text style={[styles.nextStepBody, { color: theme.muted }]}>약관을 확인하면 원래 화면으로 돌아가요</Text>
          <Text style={[styles.nextStepBody, { color: theme.subtle }]}>위치·알림 권한은 계정과 별도로 선택해요</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onCancel} style={({ pressed }) => [styles.laterButton, pageStyles.card, { borderColor: theme.border, borderWidth: 1, opacity: pressed ? 0.72 : 1 }]}>
          <Text style={[styles.laterText, { color: theme.subtle }]}>지금은 둘러보기</Text>
        </Pressable>
    </AppScreen>
  );
}

function ProviderButton({ provider, minHeight, onPress, theme, disabled }: { provider: AccountProvider; minHeight: number; onPress: () => void; theme: AppTheme; disabled: boolean }) {
  const palette = getProviderPalette(provider, theme);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={providerLabels[provider]} accessibilityState={{ busy: disabled, disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.providerButton, pageStyles.card, { height: minHeight, borderWidth: 1, opacity: disabled ? 0.55 : pressed ? 0.78 : 1, backgroundColor: palette.background, borderColor: palette.border }]}>
      <View style={styles.providerContent}>
        <View style={styles.providerIconSlot}>
          <ProviderBrandIcon provider={provider} size={22} appleColor={palette.text} />
        </View>
        <Text style={[styles.providerLabel, { color: palette.text }]}>{providerLabels[provider]}</Text>
      </View>
    </Pressable>
  );
}

function getProviderPalette(provider: AccountProvider, theme: AppTheme) {
  if (provider === "apple") {
    return theme.name === "dark"
      ? { background: "#FFFFFF", border: "#FFFFFF", text: "#000000" }
      : { background: "#000000", border: "#000000", text: "#FFFFFF" };
  }
  if (provider === "kakao") return { background: "#FEE500", border: "#FEE500", text: "#191919" };
  if (provider === "naver") return { background: "#03A94D", border: "#03A94D", text: "#FFFFFF" };
  if (provider === "line") return { background: "#06C755", border: "#06C755", text: "#FFFFFF" };
  return { background: "#FFFFFF", border: "#747775", text: "#1F1F1F" };
}

const styles = StyleSheet.create({
  hero: { justifyContent: "center", gap: spacing.xs, borderWidth: 1 },
  heroKicker: { fontSize: 12, lineHeight: 16, fontWeight: "900", letterSpacing: 0.2 },
  heroTitle: { fontSize: 26, lineHeight: 33, fontWeight: "900", letterSpacing: -0.4 },
  contextStrip: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.lg, borderWidth: 1 },
  contextDot: { width: 8, height: 8, borderRadius: radius.pill },
  contextCopy: { flex: 1, gap: 1 },
  contextKicker: { fontSize: 11, lineHeight: 15, fontWeight: "900" },
  contextTitle: { fontSize: 13, lineHeight: 18, fontWeight: "900" },
  sectionHeader: { gap: 2, marginTop: spacing.xs },
  sectionTitle: { fontSize: 16, lineHeight: 21, fontWeight: "900" },
  sectionMeta: { fontSize: 11, lineHeight: 16, fontWeight: "700" },
  providerList: { gap: spacing.sm },
  providerButton: { width: "100%", alignItems: "center", justifyContent: "center", borderRadius: radius.lg, borderWidth: 1, paddingHorizontal: 16 },
  providerContent: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  providerIconSlot: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  providerLabel: { fontSize: 16, lineHeight: 21, fontWeight: "800" },
  unavailablePanel: { minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md },
  unavailableText: { textAlign: "center", fontSize: 12, lineHeight: 17, fontWeight: "800" },
  authStatus: { textAlign: "center", fontSize: 12, lineHeight: 17, fontWeight: "800" },
  otherButton: { minHeight: 46, alignItems: "center", justifyContent: "center", borderRadius: radius.lg, borderWidth: 1 },
  otherText: { fontSize: 12, lineHeight: 15, fontWeight: "900" },
  nextStep: { gap: 3, padding: spacing.md, borderRadius: radius.lg },
  nextStepTitle: { fontSize: 13, lineHeight: 18, fontWeight: "900" },
  nextStepBody: { fontSize: 12, lineHeight: 17, fontWeight: "700" },
  laterButton: { minHeight: 46, alignItems: "center", justifyContent: "center", borderRadius: radius.lg, borderWidth: 1 },
  laterText: { fontSize: 13, lineHeight: 17, fontWeight: "800" },
});
