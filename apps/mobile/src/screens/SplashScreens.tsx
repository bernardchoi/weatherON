import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { brandAssets } from "../assets";
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
      secondaryLabel="온보딩 보기"
      onSecondary={() => onNavigate("O1")}
      progressIndex={0}
    />
  );
}

export function OnboardingSplashScreen({ onCompleteOnboarding, onNavigate }: P0ScreenProps) {
  return (
    <SplashFrame
      description="오늘의 외출, 미리 준비하세요"
      primaryLabel="온보딩 시작"
      onPrimary={() => onNavigate("O2")}
      secondaryLabel="홈으로"
      onSecondary={() => onCompleteOnboarding("H1")}
      progressIndex={1}
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
  progressIndex: number;
};

function SplashFrame({ description, primaryLabel, onPrimary, secondaryLabel, onSecondary, footer, progressIndex }: SplashFrameProps) {
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
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={onPrimary} style={[styles.primaryButton, { backgroundColor: theme.gold }]}>
            <Text style={[styles.primaryText, { color: theme.onAccent }]}>{primaryLabel}</Text>
          </Pressable>
          {secondaryLabel && onSecondary ? (
            <Pressable accessibilityRole="button" onPress={onSecondary} style={[styles.secondaryButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
              <Text style={[styles.secondaryText, { color: theme.text }]}>{secondaryLabel}</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.progress}>
          {[0, 1, 2].map((item) => (
            <View key={item} style={[styles.dot, { backgroundColor: item === progressIndex ? theme.gold : theme.cardMuted }]} />
          ))}
        </View>
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
    paddingBottom: 42,
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
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  primaryText: {
    fontSize: 14,
    fontWeight: "900",
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: "900",
  },
  progress: {
    height: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
});
