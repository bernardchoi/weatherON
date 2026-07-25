import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
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
          backgroundColor: theme.background,
          paddingHorizontal: layout.screenHorizontalPadding,
        },
      ]}
    >
      <View
        style={[
          styles.skyGlow,
          {
            backgroundColor: theme.backgroundAlt,
            bottom: layout.splashGlowBottom,
            height: layout.splashGlowHeight,
            borderTopLeftRadius: layout.splashGlowRadius,
            borderTopRightRadius: layout.splashGlowRadius,
          },
        ]}
      />

      <View style={[styles.center, { maxWidth: layout.splashContentMaxWidth, gap: layout.isShort ? spacing.sm : spacing.md }]}>
        <View style={[styles.iconShadow, { shadowColor: theme.shadow }]}>
          <AnimatedBrandMark size={layout.splashIconSize} />
        </View>
        <Image
          source={theme.name === "light" ? brandAssets.wordmarkLight : brandAssets.wordmarkDark}
          style={{
            width: layout.splashWordmarkWidth,
            height: layout.splashWordmarkHeight,
            marginTop: layout.isShort ? spacing.sm : spacing.md,
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
