import React, { useEffect, useMemo, useState } from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import { listAvailableAccountProviders, type AccountProvider, type AccountProviderAvailability } from "../providers/accountAuth";
import { getAccountRegionLabel, orderProvidersForRegion, resolveAccountRegion } from "../providers/accountRegion";
import type { AccountAuthStatus, AccountGateState } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { cardShadow, radius, spacing, type AppTheme } from "../theme/tokens";

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
  line: "LINE으로 로그인",
  google: "Google로 계속",
};

const brandAssets = {
  kakao: require("../../../../assets/auth-providers/kakao-login-ko.png"),
  naver: require("../../../../assets/auth-providers/naver-icon.png"),
  line: require("../../../../assets/auth-providers/line-icon.png"),
  google: require("../../../../assets/auth-providers/google-icon-ios.png"),
} as const;

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
    if (Platform.OS !== "ios") return;
    void Promise.all([AppleAuthentication.isAvailableAsync().catch(() => false), listAvailableAccountProviders()]).then(([apple, providers]) => {
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
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            width: "100%",
            maxWidth: layout.contentMaxWidth,
            gap: layout.accountContentGap,
            paddingHorizontal: layout.screenHorizontalPadding,
            paddingTop: layout.weatherTopPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />
        <View style={[styles.header, { minHeight: layout.accountHeaderMinHeight }]}>
          <BackButton onPress={onCancel} />
          <Text style={[styles.title, { color: theme.text, fontSize: layout.screenTitleFontSize, lineHeight: layout.screenTitleLineHeight }]}>계정 연결</Text>
        </View>

        <View style={[styles.heroCard, { padding: layout.accountPanelPadding, backgroundColor: theme.card, borderColor: theme.border }, cardShadow(theme)]}>
          <View style={styles.heroCopy}>
            <Text style={[styles.heroKicker, { color: theme.sky }]}>추천 로그인 방법</Text>
            <Text style={[styles.heroTitle, { color: theme.text }]}>사용할 계정 방식을 선택</Text>
            <Text style={[styles.heroBody, { color: theme.muted }]}>{getAccountRegionLabel(region)}</Text>
          </View>

          {destinationName ? (
            <View style={[styles.contextStrip, { backgroundColor: theme.cardStrong }]}>
              <Text style={[styles.contextKicker, { color: theme.gold }]} numberOfLines={1}>{resumeLabel}</Text>
              <Text style={[styles.contextTitle, { color: theme.text }]} numberOfLines={1}>{destinationName}</Text>
            </View>
          ) : null}

          <View style={styles.providerList}>
            {recommendedProviders.map((provider) => (
              <ProviderButton key={provider} provider={provider} minHeight={Math.max(48, layout.accountProviderMinHeight)} disabled={isSigningIn} onPress={() => void onSignIn(provider)} theme={theme} />
            ))}
            {recommendedProviders.length === 0 ? (
              <View style={[styles.unavailablePanel, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
                <Text style={[styles.unavailableText, { color: theme.muted }]}>
                  {providerCheckComplete ? "현재 사용할 수 있는 로그인 방식이 없어요" : "사용 가능한 로그인 방식을 확인하고 있어요"}
                </Text>
              </View>
            ) : null}
          </View>

          {isSigningIn ? <Text style={[styles.authStatus, { color: theme.sky }]}>계정 확인 중</Text> : null}
          {authMessage ? <Text style={[styles.authStatus, { color: authStatus === "error" ? theme.alert : theme.muted }]}>{authMessage}</Text> : null}
        </View>

        {showOtherMethods && otherProviders.length > 0 ? (
          <View style={styles.providerList}>
            {otherProviders.map((provider) => (
              <ProviderButton key={provider} provider={provider} minHeight={Math.max(48, layout.accountProviderMinHeight)} disabled={isSigningIn} onPress={() => void onSignIn(provider)} theme={theme} />
            ))}
          </View>
        ) : null}

        {otherProviders.length > 0 ? (
          <Pressable accessibilityRole="button" onPress={() => setShowOtherMethods((current) => !current)} style={[styles.otherButton, { borderColor: theme.border, backgroundColor: showOtherMethods ? theme.cardStrong : "transparent" }]}>
            <Text style={[styles.otherText, { color: theme.muted }]}>{showOtherMethods ? "다른 방법 접기" : "다른 방법으로 계속"}</Text>
          </Pressable>
        ) : null}

        <View style={[styles.nextStep, { borderColor: theme.border, backgroundColor: theme.cardStrong }]}>
          <Text style={[styles.nextStepTitle, { color: theme.text }]}>다음 단계</Text>
          <Text style={[styles.nextStepBody, { color: theme.muted }]}>약관 확인 후 원래 화면으로 돌아감</Text>
          <Text style={[styles.nextStepBody, { color: theme.subtle }]}>위치·알림 권한은 계정과 별도</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onCancel} style={styles.laterButton}>
          <Text style={[styles.laterText, { color: theme.subtle }]}>나중에 하기</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function ProviderButton({ provider, minHeight, onPress, theme, disabled }: { provider: AccountProvider; minHeight: number; onPress: () => void; theme: AppTheme; disabled: boolean }) {
  if (provider === "apple") {
    return (
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={theme.name === "dark" ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={radius.md}
        style={[styles.appleButton, { height: minHeight, opacity: disabled ? 0.55 : 1 }]}
        onPress={() => {
          if (!disabled) onPress();
        }}
      />
    );
  }
  if (provider === "kakao") {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={providerLabels[provider]} disabled={disabled} onPress={onPress} style={[styles.brandImageButton, { minHeight, opacity: disabled ? 0.55 : 1 }]}>
        <Image source={brandAssets.kakao} resizeMode="contain" style={styles.fullBrandImage} accessibilityIgnoresInvertColors />
      </Pressable>
    );
  }
  const palette = getProviderPalette(provider, theme);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={providerLabels[provider]} disabled={disabled} onPress={onPress} style={[styles.providerButton, { minHeight, opacity: disabled ? 0.55 : 1, backgroundColor: palette.background, borderColor: palette.border }]}>
      <Image source={brandAssets[provider]} resizeMode="contain" style={styles.providerIcon} accessibilityIgnoresInvertColors />
      <Text style={[styles.providerLabel, { color: palette.text }]}>{providerLabels[provider]}</Text>
    </Pressable>
  );
}

function getProviderPalette(provider: Exclude<AccountProvider, "apple" | "kakao">, _theme: AppTheme) {
  if (provider === "naver") return { background: "#03A94D", border: "#03A94D", text: "#FFFFFF" };
  if (provider === "line") return { background: "#06C755", border: "#06C755", text: "#FFFFFF" };
  return { background: "#FFFFFF", border: "#747775", text: "#1F1F1F" };
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  scroll: { flex: 1 },
  content: { minHeight: "100%", paddingBottom: 28, alignSelf: "center" },
  atmosphere: { position: "absolute", left: 0, right: 0, top: 420, height: 480, opacity: 0.44, borderRadius: 80 },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  title: { fontWeight: "900" },
  heroCard: { gap: spacing.md, borderRadius: radius.xl, borderWidth: 1 },
  heroCopy: { gap: 3 },
  heroKicker: { fontSize: 12, lineHeight: 16, fontWeight: "900" },
  heroTitle: { fontSize: 22, lineHeight: 28, fontWeight: "900" },
  heroBody: { fontSize: 12, lineHeight: 17, fontWeight: "700" },
  contextStrip: { minHeight: 36, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.pill },
  contextKicker: { fontSize: 11, lineHeight: 15, fontWeight: "900" },
  contextTitle: { flex: 1, fontSize: 12, lineHeight: 16, fontWeight: "900" },
  providerList: { gap: spacing.sm },
  appleButton: { width: "100%" },
  brandImageButton: { width: "100%", alignItems: "center", justifyContent: "center" },
  fullBrandImage: { width: "100%", height: "100%" },
  providerButton: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16 },
  providerIcon: { width: 28, height: 28 },
  providerLabel: { fontSize: 14, lineHeight: 20, fontWeight: "800" },
  unavailablePanel: { minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md },
  unavailableText: { textAlign: "center", fontSize: 12, lineHeight: 17, fontWeight: "800" },
  authStatus: { textAlign: "center", fontSize: 12, lineHeight: 17, fontWeight: "800" },
  otherButton: { minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: radius.md, borderWidth: 1 },
  otherText: { fontSize: 12, lineHeight: 15, fontWeight: "900" },
  nextStep: { gap: 3, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1 },
  nextStepTitle: { fontSize: 13, lineHeight: 18, fontWeight: "900" },
  nextStepBody: { fontSize: 11, lineHeight: 16, fontWeight: "700" },
  laterButton: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  laterText: { fontSize: 12, lineHeight: 16, fontWeight: "800" },
});
