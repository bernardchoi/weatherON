import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "../components/AppScreen";
import { ProviderBrandIcon } from "../components/provider-brand-icon";
import { listAvailableAccountProviders, type AccountProvider, type AccountProviderAvailability } from "../providers/accountAuth";
import { getAccountRegionLabel, orderProvidersForRegion, resolveAccountButtonLanguage, resolveAccountRegion, type AccountButtonLanguage } from "../providers/accountRegion";
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

const providerLabels: Record<AccountButtonLanguage, Record<AccountProvider, string>> = {
  ko: {
    apple: "Apple로 계속",
    kakao: "카카오 로그인",
    naver: "네이버 로그인",
    line: "LINE으로 로그인",
    google: "Google 계정으로 로그인",
  },
  ja: {
    apple: "Appleで続ける",
    kakao: "Login with Kakao",
    naver: "Log in with Naver",
    line: "LINEでログイン",
    google: "Googleでログイン",
  },
  en: {
    apple: "Continue with Apple",
    kakao: "Login with Kakao",
    naver: "Log in with Naver",
    line: "Log in with LINE",
    google: "Sign in with Google",
  },
};

const kakaoButtonAssets = {
  ko: require("../../../../assets/auth-providers/kakao-login-ko.png"),
  en: require("../../../../assets/auth-providers/kakao-login-en.png"),
} as const;

export function AccountConnectScreen({ gate, authStatus, authMessage, onSignIn, onCancel }: AccountConnectScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const [showOtherMethods, setShowOtherMethods] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [availability, setAvailability] = useState<AccountProviderAvailability[]>([]);
  const [providerCheckComplete, setProviderCheckComplete] = useState(false);
  const region = useMemo(() => resolveAccountRegion(), []);
  const buttonLanguage = useMemo(() => resolveAccountButtonLanguage(), []);
  const isSigningIn = authStatus === "signing-in";
  const destinationName = gate?.selectedDestinationName;
  const resumeLabel = gate?.resumeLabel ?? "준비 설정";

  const loadProviders = useCallback(() => {
    let active = true;
    setProviderCheckComplete(false);
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

  useEffect(() => loadProviders(), [loadProviders]);

  const orderedProviders = useMemo(() => {
    const available: AccountProvider[] = availability.filter((item) => item.available).map((item) => item.provider);
    if (appleAvailable) available.push("apple");
    return orderProvidersForRegion(region, available);
  }, [appleAvailable, availability, region]);
  const recommendedProviders = orderedProviders.slice(0, 3);
  const otherProviders = orderedProviders.slice(3);
  const providerLoadFailed = providerCheckComplete && availability.length === 0;

  return (
    <AppScreen
      title="계정 연결"
      subtitle="사용할 계정 방식을 선택해 주세요"
      onBack={onCancel}
      compactHeader
      contentGap={layout.accountContentGap}
      contentPaddingTop={layout.weatherTopPadding}
    >
        <View style={[styles.hero, pageStyles.card, { padding: layout.accountPanelPadding, backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.heroKicker, { color: theme.sky }]}>계정 연결</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>저장 기능을 계속 사용해요</Text>
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
          <Text style={[styles.sectionTitle, pageStyles.sectionTitle, { color: theme.text }]}>로그인 방법</Text>
          <Text style={[styles.sectionMeta, { color: theme.subtle }]}>{getAccountRegionLabel(region)} 추천 순서</Text>
        </View>

        <View style={styles.providerList}>
          {recommendedProviders.map((provider) => (
            <ProviderButton key={provider} provider={provider} language={buttonLanguage} minHeight={Math.max(48, layout.accountProviderMinHeight)} disabled={isSigningIn} onPress={() => void onSignIn(provider)} theme={theme} />
          ))}
          {providerLoadFailed || !providerCheckComplete ? (
            <View style={[styles.unavailablePanel, pageStyles.card, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
              <Text style={[styles.unavailableText, { color: theme.muted }]}>
                {providerCheckComplete ? "간편 로그인을 불러오지 못했어요. 잠시 후 다시 시도해 주세요" : "간편 로그인을 준비하고 있어요"}
              </Text>
              {providerCheckComplete ? (
                <Pressable accessibilityRole="button" accessibilityLabel="로그인 방법 다시 불러오기" onPress={loadProviders} style={[styles.retryButton, { borderColor: theme.border }]}>
                  <Text style={[styles.retryText, { color: theme.text }]}>다시 시도</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>

        {isSigningIn ? <Text accessibilityLiveRegion="polite" style={[styles.authStatus, { color: theme.sky }]}>안전하게 계정을 연결하고 있어요</Text> : null}
        {authMessage ? <Text accessibilityLiveRegion="polite" selectable style={[styles.authStatus, { color: authStatus === "error" ? theme.alert : theme.muted }]}>{authMessage}</Text> : null}

        {showOtherMethods && otherProviders.length > 0 ? (
          <View style={styles.providerList}>
            {otherProviders.map((provider) => (
              <ProviderButton key={provider} provider={provider} language={buttonLanguage} minHeight={Math.max(48, layout.accountProviderMinHeight)} disabled={isSigningIn} onPress={() => void onSignIn(provider)} theme={theme} />
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

function ProviderButton({ provider, language, minHeight, onPress, theme, disabled }: { provider: AccountProvider; language: AccountButtonLanguage; minHeight: number; onPress: () => void; theme: AppTheme; disabled: boolean }) {
  const label = providerLabels[language][provider];
  if (provider === "apple") {
    return (
      <AppleAuthentication.AppleAuthenticationButton
        accessibilityLabel={label}
        accessibilityState={{ busy: disabled, disabled }}
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={theme.name === "dark" ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={12}
        onPress={() => {
          if (!disabled) onPress();
        }}
        style={[styles.appleButton, { height: minHeight, opacity: disabled ? 0.55 : 1 }]}
      />
    );
  }

  if (provider === "kakao") {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ busy: disabled, disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [styles.kakaoButton, { height: minHeight, opacity: disabled ? 0.55 : pressed ? 0.78 : 1 }]}
      >
        <Image
          source={kakaoButtonAssets[language === "ko" ? "ko" : "en"]}
          style={styles.kakaoButtonImage}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </Pressable>
    );
  }

  const palette = provider === "naver"
    ? { background: "#03A94D", border: "#03A94D", text: "#FFFFFF" }
    : provider === "line"
      ? { background: "#06C755", border: "#06C755", text: "#FFFFFF" }
      : theme.name === "dark"
        ? { background: "#131314", border: "#8E918F", text: "#E3E3E3" }
        : { background: "#FFFFFF", border: "#747775", text: "#1F1F1F" };
  const iconSize = provider === "line" ? 30 : provider === "naver" ? 28 : 30;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ busy: disabled, disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.providerButton, { height: minHeight, opacity: disabled ? 0.55 : pressed ? 0.78 : 1, backgroundColor: palette.background, borderColor: palette.border }]}>
      <View style={styles.providerContent}>
        <View style={styles.providerIconSlot}>
          <ProviderBrandIcon provider={provider} size={iconSize} />
        </View>
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={[styles.providerLabel, provider === "google" ? styles.googleProviderLabel : null, { color: palette.text }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { justifyContent: "center", gap: 3, borderWidth: 1 },
  heroKicker: { fontSize: 12, lineHeight: 16, fontWeight: "900", letterSpacing: 0.2 },
  heroTitle: { fontSize: 20, lineHeight: 26, fontWeight: "900", letterSpacing: -0.2 },
  contextStrip: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.lg, borderWidth: 1 },
  contextDot: { width: 8, height: 8, borderRadius: radius.pill },
  contextCopy: { flex: 1, gap: 1 },
  contextKicker: { fontSize: 11, lineHeight: 15, fontWeight: "900" },
  contextTitle: { fontSize: 13, lineHeight: 18, fontWeight: "900" },
  sectionHeader: { gap: 2, marginTop: spacing.xs },
  sectionTitle: { fontSize: 16, lineHeight: 21, fontWeight: "900" },
  sectionMeta: { fontSize: 11, lineHeight: 16, fontWeight: "700" },
  providerList: { gap: spacing.sm },
  appleButton: { width: "100%" },
  kakaoButton: { width: "100%", alignItems: "center", justifyContent: "center", borderRadius: 12, overflow: "hidden" },
  kakaoButtonImage: { width: "100%", height: "100%" },
  providerButton: { width: "100%", alignItems: "center", justifyContent: "center", borderRadius: 12, borderCurve: "continuous", borderWidth: 1, paddingHorizontal: 16 },
  providerContent: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center", paddingHorizontal: 44 },
  providerIconSlot: { position: "absolute", left: 2, width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  providerLabel: { maxWidth: "100%", textAlign: "center", fontSize: 16, lineHeight: 21, fontWeight: "800" },
  googleProviderLabel: { fontSize: 14, lineHeight: 20, fontWeight: "600" },
  unavailablePanel: { minHeight: 88, alignItems: "center", justifyContent: "center", gap: spacing.sm, borderRadius: radius.md, borderWidth: 1, padding: spacing.md },
  unavailableText: { textAlign: "center", fontSize: 12, lineHeight: 17, fontWeight: "800" },
  retryButton: { minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.lg },
  retryText: { fontSize: 13, lineHeight: 17, fontWeight: "900" },
  authStatus: { textAlign: "center", fontSize: 12, lineHeight: 17, fontWeight: "800" },
  otherButton: { minHeight: 46, alignItems: "center", justifyContent: "center", borderRadius: radius.lg, borderWidth: 1 },
  otherText: { fontSize: 12, lineHeight: 15, fontWeight: "900" },
  nextStep: { gap: 3, padding: spacing.md, borderRadius: radius.lg },
  nextStepTitle: { fontSize: 13, lineHeight: 18, fontWeight: "900" },
  nextStepBody: { fontSize: 12, lineHeight: 17, fontWeight: "700" },
  laterButton: { minHeight: 46, alignItems: "center", justifyContent: "center", borderRadius: radius.lg, borderWidth: 1 },
  laterText: { fontSize: 13, lineHeight: 17, fontWeight: "800" },
});
