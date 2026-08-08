import React, { useEffect, useState } from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import type { AccountAuthStatus, AccountGateState } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { cardShadow, radius, spacing, type AppTheme } from "../theme/tokens";

type AccountConnectScreenProps = {
  gate: AccountGateState | null;
  authStatus: AccountAuthStatus;
  authMessage: string | null;
  onSignInWithApple: () => Promise<void>;
  onCancel: () => void;
};

type ProviderTone = "kakao" | "naver" | "line" | "google" | "apple" | "email";

const extraProviders: { id: ProviderTone; label: string }[] = [
  { id: "kakao", label: "카카오 로그인 · 준비 중" },
  { id: "naver", label: "네이버 로그인 · 준비 중" },
  { id: "line", label: "LINE 로그인 · 준비 중" },
  { id: "google", label: "Google 로그인 · 준비 중" },
  { id: "email", label: "이메일 로그인 · 준비 중" },
];

export function AccountConnectScreen({ gate, authStatus, authMessage, onSignInWithApple, onCancel }: AccountConnectScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const [showOtherMethods, setShowOtherMethods] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const resumeLabel = gate?.resumeLabel ?? "준비 설정";
  const destinationName = gate?.selectedDestinationName;
  const isSigningIn = authStatus === "signing-in";

  useEffect(() => {
    let active = true;
    if (Platform.OS !== "ios") return;
    void AppleAuthentication.isAvailableAsync().then((available) => {
      if (active) setAppleAvailable(available);
    });
    return () => {
      active = false;
    };
  }, []);

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

        <View
          style={[
            styles.heroCard,
            {
              minHeight: layout.accountHeroMinHeight,
              padding: layout.accountPanelPadding,
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            cardShadow(theme),
          ]}
        >
          <View style={styles.heroTop}>
            <View style={[styles.heroIcon, { backgroundColor: theme.cardStrong }]}>
              <ConnectGlyph color={theme.sky} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroKicker, { color: theme.sky }]}>안전한 계정 연결</Text>
              <Text style={[styles.heroTitle, { color: theme.text }]}>Apple로 계속</Text>
            </View>
          </View>

          {destinationName ? (
            <View style={[styles.contextStrip, { backgroundColor: theme.cardStrong }]}>
              <Text style={[styles.contextKicker, { color: theme.gold }]} numberOfLines={1}>{resumeLabel}</Text>
              <Text style={[styles.contextTitle, { color: theme.text }]} numberOfLines={1}>{destinationName}</Text>
            </View>
          ) : null}

          <View style={styles.providerList}>
            {appleAvailable ? (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                buttonStyle={theme.name === "dark" ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={radius.md}
                style={[styles.appleButton, { height: layout.accountProviderMinHeight + 12, opacity: isSigningIn ? 0.6 : 1 }]}
                onPress={() => {
                  if (!isSigningIn) void onSignInWithApple();
                }}
              />
            ) : (
              <View style={[styles.unavailablePanel, { minHeight: layout.accountProviderMinHeight + 12, backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
                <Text style={[styles.unavailableText, { color: theme.muted }]}>Apple 로그인은 iOS 실기기 빌드에서 사용할 수 있어요</Text>
              </View>
            )}
            {isSigningIn ? <Text style={[styles.authStatus, { color: theme.sky }]}>Apple 계정 확인 중</Text> : null}
            {authMessage ? <Text style={[styles.authStatus, { color: authStatus === "error" ? theme.alert : theme.muted }]}>{authMessage}</Text> : null}
          </View>
        </View>

        {showOtherMethods ? (
          <View style={styles.providerList}>
            {extraProviders.map((provider) => <ProviderButton key={provider.id} provider={provider} minHeight={layout.accountProviderMinHeight} theme={theme} disabled />)}
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => setShowOtherMethods((current) => !current)}
          style={[styles.otherButton, { borderColor: theme.border, backgroundColor: showOtherMethods ? theme.cardStrong : "transparent" }]}
        >
          <Text style={[styles.otherText, { color: theme.muted }]}>{showOtherMethods ? "다른 방법 접기" : "다른 계정으로 연결"}</Text>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={onCancel} style={styles.laterButton}>
          <Text style={[styles.laterText, { color: theme.subtle }]}>나중에 할래요</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function ProviderButton({
  provider,
  minHeight,
  onPress,
  theme,
  featured = false,
  disabled = false,
}: {
  provider: { id: ProviderTone; label: string };
  minHeight: number;
  onPress?: () => void;
  theme: AppTheme;
  featured?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.providerButton,
        disabled ? styles.providerButtonDisabled : null,
        {
          minHeight,
          backgroundColor: featured ? theme.cardMuted : theme.cardStrong,
          borderColor: featured ? theme.sky : "transparent",
        },
      ]}
    >
      <View style={[styles.providerIcon, featured ? styles.providerIconFeatured : null, { backgroundColor: getProviderColor(provider.id, theme) }]}>
        <Text style={[styles.providerIconText, { color: getProviderTextColor(provider.id) }]}>{getProviderMark(provider.id)}</Text>
      </View>
      <Text style={[styles.providerLabel, featured ? styles.providerLabelFeatured : null, { color: theme.text }]}>{provider.label}</Text>
      <ChevronRight color={theme.subtle} />
    </Pressable>
  );
}

function ConnectGlyph({ color }: { color: string }) {
  return (
    <View style={styles.connectGlyph} accessibilityElementsHidden>
      <View style={[styles.connectNode, styles.connectNodeLeft, { borderColor: color }]} />
      <View style={[styles.connectNode, styles.connectNodeRight, { borderColor: color }]} />
      <View style={[styles.connectLine, { backgroundColor: color }]} />
    </View>
  );
}

function ChevronRight({ color }: { color: string }) {
  return <Text style={[styles.chevron, { color }]} accessibilityElementsHidden>›</Text>;
}

function getProviderColor(providerId: ProviderTone, theme: AppTheme) {
  if (providerId === "kakao") return "#FEE500";
  if (providerId === "naver") return "#03C75A";
  if (providerId === "line") return "#4CC764";
  if (providerId === "google") return "#F8FBFF";
  if (providerId === "apple") return "#111827";
  return theme.sky;
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
    minHeight: "100%",
    paddingBottom: 28,
    alignSelf: "center",
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
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  heroIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  heroCopy: {
    flex: 1,
    gap: 2,
  },
  heroKicker: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "900",
  },
  contextStrip: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  contextKicker: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  contextTitle: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  providerList: {
    gap: spacing.sm,
  },
  providerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  providerButtonDisabled: {
    opacity: 0.56,
  },
  appleButton: {
    width: "100%",
  },
  unavailablePanel: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  unavailableText: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  authStatus: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  providerIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  providerIconFeatured: {
    width: 34,
    height: 34,
  },
  providerIconText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "900",
  },
  providerLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  providerLabelFeatured: {
    fontSize: 16,
    lineHeight: 20,
  },
  otherButton: {
    minHeight: 44,
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
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  laterText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  connectGlyph: {
    width: 38,
    height: 26,
  },
  connectNode: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  connectNodeLeft: {
    left: 1,
    top: 4,
  },
  connectNodeRight: {
    right: 1,
    top: 4,
  },
  connectLine: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 12,
    height: 2,
    borderRadius: radius.pill,
  },
  chevron: {
    fontSize: 30,
    lineHeight: 32,
    fontWeight: "700",
  },
});
