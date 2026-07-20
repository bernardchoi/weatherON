import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { brandAssets } from "../assets";
import { AnimatedBrandMark } from "../components/AnimatedBrandMark";
import { OnboardingFooter } from "../components/OnboardingFooter";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
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
  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.skyGlow, { backgroundColor: theme.backgroundAlt }]} />

      <View style={styles.center}>
        <View style={[styles.iconShadow, { shadowColor: theme.shadow }]}>
          <AnimatedBrandMark size={102} />
        </View>
        <Image source={theme.name === "light" ? brandAssets.wordmarkLight : brandAssets.wordmarkDark} style={styles.wordmark} resizeMode="contain" />
        <Text style={[styles.description, { color: theme.muted }]}>{description}</Text>
      </View>

      <View style={styles.bottom}>
        <OnboardingFooter primaryLabel={primaryLabel} onPrimary={onPrimary} secondaryLabel={secondaryLabel} onSecondary={onSecondary} />
        {footer ? <Text style={[styles.footer, { color: theme.subtle }]}>{footer}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 26,
    paddingBottom: spacing.md,
    overflow: "hidden",
  },
  skyGlow: {
    position: "absolute",
    left: -80,
    right: -80,
    bottom: -120,
    height: 520,
    borderTopLeftRadius: 260,
    borderTopRightRadius: 260,
    opacity: 0.92,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  iconShadow: {
    shadowOpacity: 0.28,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  wordmark: {
    width: 172,
    height: 38,
    marginTop: spacing.md,
  },
  description: {
    maxWidth: 290,
    textAlign: "center",
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "800",
  },
  bottom: {
    gap: spacing.md,
  },
  footer: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
});
