import React from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "../localization/react-native";
import type { AccountProvider } from "../providers/accountAuth";
import type { AccountButtonLanguage } from "../providers/accountRegion";
import type { AppTheme } from "../theme/tokens";
import { ProviderBrandIcon } from "./provider-brand-icon";

export const providerLabels: Record<AccountButtonLanguage, Record<AccountProvider, string>> = {
  ko: { apple: "Apple로 계속", kakao: "카카오 로그인", naver: "네이버 로그인", line: "LINE으로 로그인", google: "Google로 로그인" },
  ja: { apple: "Appleで続ける", kakao: "Login with Kakao", naver: "Log in with Naver", line: "LINEでログイン", google: "Googleでログイン" },
  en: { apple: "Continue with Apple", kakao: "Login with Kakao", naver: "Log in with Naver", line: "Log in with LINE", google: "Sign in with Google" },
};

type Props = {
  provider: AccountProvider;
  language: AccountButtonLanguage;
  minHeight: number;
  onPress: () => void;
  theme: AppTheme;
  disabled: boolean;
};

export function AccountProviderButton({ provider, language, minHeight, onPress, theme, disabled }: Props) {
  const { fontScale, width } = useWindowDimensions();
  // Keep one-line branded labels legible without allowing the fixed native Apple control
  // to become smaller than its peers. The rest of the screen retains full text scaling.
  const scale = Math.min(Math.max(fontScale, 1), 1.5);
  // The native Apple control and icon/button dimensions do not shrink below 1×.
  // Keep custom iOS labels at their specified base size under Small Dynamic Type,
  // while retaining native text scaling and the existing 1.5× upper bound.
  const labelScaleCompensation = Platform.OS === "ios" && fontScale > 0 && fontScale < 1 ? 1 / fontScale : 1;
  const height = Math.ceil(Math.max(54, minHeight) * scale);
  const label = providerLabels[language][provider];
  if (provider === "apple") {
    return <AppleAuthentication.AppleAuthenticationButton
      accessibilityLabel={label}
      accessibilityState={{ busy: disabled, disabled }}
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
      buttonStyle={theme.name === "dark" ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={12}
      onPress={() => { if (!disabled) onPress(); }}
      style={{ width: "100%", height, opacity: disabled ? 0.55 : 1 }}
    />;
  }
  const google = provider === "google";
  const line = provider === "line";
  const visibleLabel = line && fontScale > 1.2 && width < 430
    ? language === "ko" ? "로그인" : language === "ja" ? "ログイン" : "Log in"
    : label;
  const kakao = provider === "kakao";
  const background = kakao ? "#FEE500" : provider === "naver" ? "#03A94D" : line ? "#06C755" : theme.name === "dark" ? "#131314" : "#FFFFFF";
  const foreground = kakao ? "rgba(0,0,0,0.85)" : google ? theme.name === "dark" ? "#E3E3E3" : "#1F1F1F" : "#FFFFFF";
  const border = google ? theme.name === "dark" ? "#8E918F" : "#747775" : background;
  const markSize = (provider === "naver" ? 18 : 20) * scale;
  return (
    <Pressable
      needsOffscreenAlphaCompositing
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: disabled, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, {
        height,
        backgroundColor: line && disabled ? "#FFFFFF" : line && pressed ? "#048B3C" : background,
        borderColor: line && disabled ? "rgba(229,229,229,0.6)" : border,
        opacity: disabled && !line ? 0.55 : pressed && !line ? 0.8 : 1,
      }]}
    >
      <View style={line ? styles.lineGroup : styles.providerGroup}>
        {line ? (
          <View style={[styles.lineIcon, { width: height, borderRightColor: disabled ? "rgba(229,229,229,0.6)" : "rgba(0,0,0,0.08)" }]}>
            <ProviderBrandIcon provider={provider} size={markSize} disabled={disabled} />
          </View>
        ) : null}
        <View style={line ? [styles.lineContent, { paddingHorizontal: markSize }] : [styles.content, { paddingHorizontal: 16, gap: (google ? 12 : 8) * scale }]}>
          {!line ? <ProviderBrandIcon provider={provider} size={markSize} /> : null}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            maxFontSizeMultiplier={1.5}
            style={[styles.label, {
              color: line && disabled ? "rgba(30,30,30,0.2)" : foreground,
              fontFamily: google ? "GoogleSans" : Platform.OS === "ios" ? "System" : "sans-serif",
              fontSize: (google ? 14 : 16) * labelScaleCompensation,
              lineHeight: (google ? 20 : 22) * labelScaleCompensation,
              fontWeight: "500",
            }]}
          >{visibleLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  providerGroup: { flex: 1, flexDirection: "row", alignItems: "center" },
  lineGroup: { maxWidth: "100%", height: "100%", flexShrink: 1, flexDirection: "row", alignItems: "center" },
  // No flex shorthand here: native Yoga resolves inherited flex:1 + basis:auto to 0.
  lineContent: { minWidth: 0, flexShrink: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  content: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  label: { flexShrink: 1, textAlign: "center", includeFontPadding: false },
  lineIcon: { flexShrink: 0, height: "100%", alignItems: "center", justifyContent: "center", borderRightWidth: 1 },
});
