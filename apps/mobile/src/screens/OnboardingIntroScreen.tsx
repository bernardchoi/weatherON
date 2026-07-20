import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { onboardingAssets, uiIconAssets } from "../assets";
import { AppScreen } from "../components/AppScreen";
import { OnboardingFooter } from "../components/OnboardingFooter";
import { OnboardingVisualStrip } from "../components/OnboardingVisualStrip";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing } from "../theme/tokens";

export function OnboardingIntroScreen({ onNavigate, onCompleteOnboarding }: P0ScreenProps) {
  const theme = useAppTheme();

  return (
    <AppScreen
      title="날씨 보고, 가볍게 나가요"
      subtitle="오늘 챙길 것만 한눈에 보여드림"
      badge="1 / 4"
      showWordmark={false}
      footer={
        <OnboardingFooter
          primaryLabel="다음"
          primaryAccessibilityLabel="코디 안내 단계로 이동"
          onPrimary={() => onNavigate("O7")}
          secondaryLabel="건너뛰기"
          secondaryAccessibilityLabel="소개를 건너뛰고 홈으로 이동"
          onSecondary={() => onCompleteOnboarding("H1")}
        />
      }
    >
      <View style={[styles.brandHero, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}>
        <View style={styles.brandTop}>
          <Text style={[styles.heroCopy, { color: theme.muted }]}>5초 외출 브리핑</Text>
        </View>
        <Image source={onboardingAssets.ready} style={styles.heroVisual} resizeMode="cover" accessibilityLabel="날씨에 맞춘 코디, 우산, 출발 알림을 보여주는 일러스트" />
      </View>

      <OnboardingVisualStrip
        items={[
          { label: "코디", value: "날씨에 딱 맞게", icon: uiIconAssets.shirt, tone: "clear" },
          { label: "비 준비", value: "우산·신발까지", icon: uiIconAssets.umbrella, tone: "sky" },
          { label: "출발", value: "08:10", icon: uiIconAssets.depart, tone: "gold" },
        ]}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  brandHero: {
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  heroVisual: {
    width: "100%",
    height: 214,
    borderRadius: radius.md,
  },
  brandTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.sm,
    paddingHorizontal: 4,
  },
  heroCopy: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
});
