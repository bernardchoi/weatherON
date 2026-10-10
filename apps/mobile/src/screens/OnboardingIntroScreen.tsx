import React from "react";
import { Platform, Image, StyleSheet, Text, View } from "../localization/react-native";
import { onboardingAssets, uiIconAssets } from "../assets";
import { ambientUiIcons } from "../ambientAssets";
import { AppScreen } from "../components/AppScreen";
import { OnboardingFooter } from "../components/OnboardingFooter";
import { OnboardingVisualStrip } from "../components/OnboardingVisualStrip";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { cardShadow, radius, spacing } from "../theme/tokens";

const screenIcons = Platform.OS === "ios" ? { ...uiIconAssets, uv: ambientUiIcons.temperature, clearNight: ambientUiIcons.temperature, pin: ambientUiIcons.location, shirt: ambientUiIcons.tabOutfit, depart: ambientUiIcons.tabDepart, rain: ambientUiIcons.umbrella, umbrella: ambientUiIcons.umbrella, myAlerts: ambientUiIcons.notifications, myDisplay: ambientUiIcons.settings, settings: ambientUiIcons.settings, tabMy: ambientUiIcons.tabMy, check: ambientUiIcons.check } : uiIconAssets;

export function OnboardingIntroScreen({ onNavigate, onCompleteOnboarding }: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();

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
      <View
        style={[[
          styles.brandHero,
          {
            backgroundColor: theme.cardStrong,
            borderColor: theme.border,
            padding: layout.isShort || layout.isNarrow ? spacing.xs : spacing.sm,
          },
          cardShadow(theme),
        ], Platform.OS === "ios" && ambientVisual.brandHero]}
      >
        <View style={styles.brandTop}>
          <Text style={[[styles.heroCopy, { color: theme.muted }], Platform.OS === "ios" && ambientVisual.heroCopy]}>5초 외출 브리핑</Text>
        </View>
        <Image
          source={onboardingAssets.ready}
          style={[[styles.heroVisual, { height: layout.onboardingHeroVisualHeight }], Platform.OS === "ios" && ambientVisual.heroVisual]}
          resizeMode="cover"
          accessibilityLabel="날씨에 맞춘 코디, 우산, 출발 알림을 보여주는 일러스트"
        />
      </View>

      <OnboardingVisualStrip
        rows={Platform.OS === "ios"}
        items={[
          { label: "코디", value: "날씨에 딱 맞게", icon: screenIcons.shirt, tone: "clear" },
          { label: "비 준비", value: "우산·신발까지", icon: screenIcons.umbrella, tone: "sky" },
          { label: "출발", value: "08:10", icon: screenIcons.depart, tone: "gold" },
        ]}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  brandHero: {
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  heroVisual: {
    width: "100%",
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

// Approved iOS Ambient hierarchy; Android retains its existing presentation.
const ambientVisual = StyleSheet.create({
  "brandHero": {
    "backgroundColor": "transparent",
    "borderWidth": 0,
    "borderRadius": 0,
    "shadowOpacity": 0,
    "elevation": 0,
    "paddingHorizontal": 0,
    "paddingVertical": 18,
    "gap": 16
  },
  "heroVisual": {
    "borderRadius": 20
  },
  "heroCopy": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  }
});
