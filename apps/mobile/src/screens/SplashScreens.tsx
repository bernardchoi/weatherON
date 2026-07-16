import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { brandAssets } from "../assets";
import { OnboardingFooter } from "../components/OnboardingFooter";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

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
      description="오늘의 외출, 미리 준비하세요"
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
        <View style={[styles.iconHalo, { backgroundColor: theme.cardStrong, shadowColor: theme.shadow }]}>
          <Image source={brandAssets.iconPrimary} style={styles.icon} resizeMode="contain" />
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
  iconHalo: {
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    shadowOpacity: 0.28,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  icon: {
    width: 76,
    height: 76,
  },
  wordmark: {
    width: 150,
    height: 32,
    marginTop: spacing.md,
  },
  description: {
    maxWidth: 250,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "800",
  },
  bottom: {
    gap: spacing.md,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
});
