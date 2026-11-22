import React from "react";
import { Platform, Image, StyleSheet, Text, View } from "../localization/react-native";
import { onboardingAssets, uiIconAssets } from "../assets";
import { ambientScreenIconOverrides } from "../ambientAssets";
import { OnboardingAmbientScene } from "../components/OnboardingAmbientScene";
import { AppScreen } from "../components/AppScreen";
import { OnboardingFooter } from "../components/OnboardingFooter";
import { OnboardingVisualStrip } from "../components/OnboardingVisualStrip";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { cardShadow, radius, spacing } from "../theme/tokens";

const screenIcons = Platform.OS === "ios" ? { ...uiIconAssets, ...ambientScreenIconOverrides } : uiIconAssets;

export function OnboardingIntroScreen({ onNavigate, onCompleteOnboarding }: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();

  return (
    <AppScreen
      title="날씨 보고, 가볍게 나가요"
      subtitle={Platform.OS === "ios" ? "옷차림부터 나설 시간까지 한눈에 확인해요" : "오늘 챙길 것만 한눈에 보여드림"}
      badge="1 / 4"
      contentGap={Platform.OS === "ios" ? 12 : undefined}
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
      {Platform.OS === "ios" ? (
        <View style={[styles.briefing, { backgroundColor: theme.cardMuted }]}>
          <OnboardingAmbientScene />
          <View style={styles.briefingCopy}>
            <Text style={{ color: theme.muted, fontSize: 15, fontWeight: "600" }}>외출 브리핑 예시</Text>
            <Text style={{ color: theme.text, fontSize: layout.isShort ? 22 : 28, fontWeight: "700" }}>비 오는 아침, 이렇게 나가요</Text>
          </View>
          <View style={[styles.briefingItems, { borderColor: theme.border }]}>
            <OnboardingVisualStrip intro items={[
              { label: "코디", value: "가벼운 겉옷", icon: screenIcons.shirt, tone: "clear" },
              { label: "준비물", value: "접이식 우산", icon: screenIcons.umbrella, tone: "sky" },
              { label: "출발", value: "08:10", icon: screenIcons.depart, tone: "gold" },
            ]} />
          </View>
        </View>
      ) : (
        <>
          <View style={[styles.brandHero, {
            backgroundColor: theme.cardStrong, borderColor: theme.border,
            padding: layout.isShort || layout.isNarrow ? spacing.xs : spacing.sm,
          }, cardShadow(theme)]}>
            <View style={styles.brandTop}>
              <Text style={[styles.heroCopy, { color: theme.muted }]}>5초 외출 브리핑</Text>
            </View>
            <Image source={onboardingAssets.ready} style={[styles.heroVisual, { height: layout.onboardingHeroVisualHeight }]}
              resizeMode="cover" accessibilityLabel="날씨에 맞춘 코디, 우산, 출발 알림을 보여주는 일러스트" />
          </View>

          <OnboardingVisualStrip
            items={[
              { label: "코디", value: "날씨에 딱 맞게", icon: screenIcons.shirt, tone: "clear" },
              { label: "비 준비", value: "우산·신발까지", icon: screenIcons.umbrella, tone: "sky" },
              { label: "출발 예시", value: "08:10", icon: screenIcons.depart, tone: "gold" },
            ]}
          />
        </>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  briefing: { borderRadius: 20, overflow: "hidden" },
  briefingCopy: { gap: 6, paddingHorizontal: 18, paddingVertical: 14 },
  briefingItems: { borderTopWidth: StyleSheet.hairlineWidth, marginHorizontal: 12, paddingVertical: 14 },
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
