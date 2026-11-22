import React from "react";
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { Platform, Image, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "../localization/react-native";
import { ambientHeroWeather } from "../ambientAssets";
import { brandAssets } from "../assets";
import { AnimatedBrandMark } from "../components/AnimatedBrandMark";
import { OnboardingFooter } from "../components/OnboardingFooter";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { spacing } from "../theme/tokens";

export function AppEntrySplashScreen({ onCompleteOnboarding, onNavigate }: P0ScreenProps) {
  return (
    <SplashFrame
      description="오늘 입을 옷과 나갈 시간을 빠르게 정해드려요"
      primaryLabel="바로 시작하기"
      onPrimary={() => onCompleteOnboarding("H1")}
      footer="계정 없이 먼저 확인할 수 있어요"
      secondaryLabel="앱 소개"
      onSecondary={() => onNavigate("O1")}
    />
  );
}

export function OnboardingSplashScreen({ onCompleteOnboarding, onNavigate }: P0ScreenProps) {
  if (Platform.OS === "ios") {
    return <IosWelcome onNext={() => onNavigate("O2")} onSkip={() => onCompleteOnboarding("H1")} />;
  }
  return (
    <SplashFrame
      description="오늘 나갈 준비, WeatherON이 가볍게 챙겨드려요"
      primaryLabel="다음"
      onPrimary={() => onNavigate("O2")}
      secondaryLabel="건너뛰기"
      onSecondary={() => onCompleteOnboarding("H1")}
    />
  );
}

function IosWelcome({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const { fontScale } = useWindowDimensions();
  const artHeight = Math.min(layout.height * (fontScale > 1.4 ? 0.22 : 0.33), 300);
  const iconSize = artHeight * 0.66;
  return (
    <View style={[styles.root, { paddingHorizontal: layout.screenHorizontalPadding }]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.welcomeBody}>
        <View accessible={false} accessibilityElementsHidden style={[styles.welcomeSky, { height: artHeight }]}>
          <Svg width="100%" height="100%" viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet" style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="dawn" cx="50%" cy="55%" rx="50%" ry="50%">
                <Stop offset="0" stopColor={theme.gold} stopOpacity={0.29} />
                <Stop offset="0.58" stopColor={theme.sky} stopOpacity={0.13} />
                <Stop offset="1" stopColor={theme.sky} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width="360" height="240" fill="url(#dawn)" />
            <Path d="M38 164 Q158 -12 322 104" fill="none" stroke={theme.gold} strokeOpacity={0.4} strokeWidth={1.2} strokeDasharray="2 5" />
            <Circle cx={38} cy={164} r={3} fill={theme.gold} />
            <Circle cx={322} cy={104} r={3} fill={theme.gold} />
            <Path d="M18 193 Q100 151 184 185 T342 172" fill="none" stroke={theme.sky} strokeOpacity={0.38} />
            <Path d="M46 201 Q130 169 208 196 T323 191" fill="none" stroke={theme.sky} strokeOpacity={0.2} />
          </Svg>
          <Image accessible={false} source={ambientHeroWeather[theme.name]["partly-cloudy"]}
            style={{ width: iconSize, height: iconSize }} resizeMode="contain" />
        </View>
        <Text accessibilityLabel="WeatherON" maxFontSizeMultiplier={1.3} style={[styles.welcomeBrand, { color: theme.muted }]}>Weather<Text style={{ color: theme.gold }}>ON</Text></Text>
        <Text accessibilityRole="header" lineBreakStrategyIOS="hangul-word" style={[styles.welcomeTitle, { color: theme.text, fontSize: fontScale > 1.4 ? 24 : 32 }]}>오늘의 외출 준비</Text>
        <Text lineBreakStrategyIOS="hangul-word" style={[styles.welcomeSubtitle, { color: theme.muted }]}>옷차림부터 출발 시간까지</Text>
      </ScrollView>
      <View style={[styles.bottom, { maxWidth: layout.splashContentMaxWidth }]}>
        <OnboardingFooter primaryLabel="다음" onPrimary={onNext} secondaryLabel="건너뛰기" onSecondary={onSkip} />
      </View>
    </View>
  );
}

type SplashFrameProps = {
  description: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  footer?: string;
};

function SplashFrame({ description, primaryLabel, onPrimary, secondaryLabel, onSecondary, footer }: SplashFrameProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: Platform.OS === "ios" ? "transparent" : theme.background,
          paddingHorizontal: layout.screenHorizontalPadding,
        },
      ]}
    >
      <View
        style={[
          styles.skyGlow,
          Platform.OS === "ios" && { display: "none" },
          {
            backgroundColor: theme.backgroundAlt,
            bottom: layout.splashGlowBottom,
            height: layout.splashGlowHeight,
            borderTopLeftRadius: layout.splashGlowRadius,
            borderTopRightRadius: layout.splashGlowRadius,
          },
        ]}
      />

      <View style={[styles.center, { maxWidth: layout.splashContentMaxWidth, gap: layout.isShort || layout.isNarrow ? spacing.sm : spacing.md }]}>
        <View style={[styles.iconShadow, { shadowColor: theme.shadow }]}>
          {Platform.OS === "ios" ? <Image accessible={false} source={ambientHeroWeather[theme.name]["partly-cloudy"]} style={{ width: layout.splashIconSize, height: layout.splashIconSize }} resizeMode="contain" /> : <AnimatedBrandMark size={layout.splashIconSize} />}
        </View>
        <Image
          source={theme.name === "light" ? brandAssets.wordmarkLight : brandAssets.wordmarkDark}
          style={{
            display: Platform.OS === "ios" ? "none" : "flex",
            width: layout.splashWordmarkWidth,
            height: layout.splashWordmarkHeight,
            marginTop: layout.isShort || layout.isNarrow ? spacing.sm : spacing.md,
          }}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.description,
            {
              color: theme.muted,
              maxWidth: layout.splashDescriptionMaxWidth,
              fontSize: layout.splashDescriptionFontSize,
              lineHeight: layout.splashDescriptionLineHeight,
            },
          ]}
        >
          {description}
        </Text>
      </View>

      <View style={[styles.bottom, { maxWidth: layout.splashContentMaxWidth }]}>
        <OnboardingFooter primaryLabel={primaryLabel} onPrimary={onPrimary} secondaryLabel={secondaryLabel} onSecondary={onSecondary} />
        {footer ? <Text style={[styles.footer, { color: theme.subtle }]}>{footer}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 26,
    paddingBottom: spacing.md,
    overflow: "hidden",
  },
  welcomeBody: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing.md },
  welcomeSky: { width: "100%", maxWidth: 440, alignItems: "center", justifyContent: "center" },
  welcomeBrand: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  welcomeTitle: { fontWeight: "700", marginTop: 10, textAlign: "center" },
  welcomeSubtitle: { fontSize: 17, marginTop: 6, textAlign: "center" },
  skyGlow: {
    position: "absolute",
    left: -80,
    right: -80,
    opacity: 0.92,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    alignSelf: "center",
  },
  iconShadow: {
    shadowOpacity: 0.28,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  description: {
    textAlign: "center",
    fontWeight: "800",
  },
  bottom: {
    gap: spacing.md,
    width: "100%",
    alignSelf: "center",
  },
  footer: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
});
