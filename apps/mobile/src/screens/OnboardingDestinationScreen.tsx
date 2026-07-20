import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { onboardingAssets } from "../assets";
import { AppScreen } from "../components/AppScreen";
import { OnboardingFooter } from "../components/OnboardingFooter";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing } from "../theme/tokens";

export function OnboardingDestinationScreen({
  selectedDestinationPlace,
  destinationSelectionReady,
  savedDestinations,
  onSaveDestination,
  onNavigate,
  onCompleteOnboarding,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const saved = savedDestinations.some((item) => item.place.id === selectedDestinationPlace.id);
  const canUseSelection = saved || destinationSelectionReady;
  const primaryLabel = saved ? "홈으로 시작" : canUseSelection ? "등록하고 시작" : "장소 찾기";
  const handlePrimary = () => {
    if (saved) {
      onCompleteOnboarding("H1");
      return;
    }
    if (canUseSelection) {
      onSaveDestination("H1");
      return;
    }
    onNavigate("P1");
  };

  return (
    <AppScreen
      title="자주 가는 곳 추가"
      subtitle="목적지 날씨와 출발 시간을 함께 확인"
      badge="4 / 4"
      footer={
        <OnboardingFooter
          primaryLabel={primaryLabel}
          primaryAccessibilityLabel={saved ? "온보딩을 완료하고 홈으로 이동" : canUseSelection ? "목적지를 등록하고 홈으로 이동" : "목적지 장소 검색"}
          onPrimary={handlePrimary}
          secondaryLabel="나중에"
          secondaryAccessibilityLabel="목적지 등록 없이 홈으로 이동"
          onSecondary={() => onCompleteOnboarding("H1")}
        />
      }
    >
      <View style={[styles.progressTrack, { backgroundColor: theme.cardMuted }]}>
        <View style={[styles.progressFill, { backgroundColor: theme.gold }]} />
      </View>

      <Image source={onboardingAssets.destinationCare} style={styles.destinationVisual} resizeMode="cover" accessibilityLabel="목적지 날씨와 출발 시간 비교 예시" />

      <View
        accessibilityLabel={canUseSelection ? "선택한 목적지" : "목적지 선택"}
        style={[styles.destinationCard, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow(theme)]}
      >
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.text }]}>{canUseSelection ? selectedDestinationPlace.name : "장소 검색 후 선택"}</Text>
          <Text style={[styles.body, { color: theme.muted }]} numberOfLines={1}>
            {canUseSelection ? selectedDestinationPlace.address : "자주 가는 곳 하나만"}
          </Text>
        </View>
        <StatusPill label={saved ? "저장됨" : canUseSelection ? "선택" : "대기"} tone={saved ? "clear" : canUseSelection ? "gold" : "sky"} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 4,
    overflow: "hidden",
    borderRadius: radius.pill,
  },
  progressFill: {
    width: "100%",
    height: "100%",
  },
  destinationVisual: {
    width: "100%",
    height: 158,
    borderRadius: radius.lg,
  },
  destinationCard: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
});
