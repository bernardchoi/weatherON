import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import { AppScreen } from "../components/AppScreen";
import { OnboardingFooter } from "../components/OnboardingFooter";
import { OnboardingVisualStrip } from "../components/OnboardingVisualStrip";
import { OutfitGrid } from "../components/OutfitGrid";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing } from "../theme/tokens";
import { getOutfitVariantLabel } from "../utils/outfitLabels";

export function OnboardingOutfitScreen({ state, locationReady, onNavigate, onRequestCurrentLocation, onCompleteOnboarding }: P0ScreenProps) {
  const theme = useAppTheme();
  const outfitItems = Object.values(state.outfit.items).filter(Boolean);
  const [locationRequestHandled, setLocationRequestHandled] = useState(false);
  const locationSetupComplete = locationReady || locationRequestHandled;
  const locationSkipped = locationRequestHandled && !locationReady;

  const requestCurrentLocation = async () => {
    await onRequestCurrentLocation();
    setLocationRequestHandled(true);
  };

  return (
    <AppScreen
      title="오늘, 뭐 입을지 고민 끝"
      subtitle="체감온도와 비에 맞춰 차림을 골라드림"
      badge="2 / 4"
      showWordmark={false}
      footer={
        <OnboardingFooter
          primaryLabel={locationSetupComplete ? "다음" : "현재 위치 사용"}
          primaryAccessibilityLabel={locationSetupComplete ? "알림 안내 단계로 이동" : "현재 위치 권한 요청"}
          onPrimary={() => (locationSetupComplete ? onNavigate("O5") : void requestCurrentLocation())}
          secondaryLabel={locationSetupComplete ? "건너뛰기" : "나중에"}
          secondaryAccessibilityLabel={
            locationSetupComplete
              ? "온보딩을 건너뛰고 홈으로 이동"
              : "위치 권한을 나중에 설정하고 알림 안내 단계로 이동"
          }
          onSecondary={() => (locationSetupComplete ? onCompleteOnboarding("H1") : onNavigate("O5"))}
        />
      }
    >
      <View style={[styles.progressTrack, { backgroundColor: theme.cardMuted }]}>
        <View style={[styles.progressFill, { backgroundColor: theme.gold }]} />
      </View>

      <OnboardingVisualStrip
        items={[
          { label: "체감", value: `${Math.round(state.weather.current.feelsLikeC)}°`, icon: uiIconAssets.clearNight, tone: "clear" },
          { label: "강수", value: `${state.weather.current.rainProbabilityPct}%`, icon: uiIconAssets.rain, tone: "sky" },
          { label: "추천", value: `${outfitItems.length}개`, icon: uiIconAssets.shirt, tone: "gold" },
        ]}
      />

      <View style={[styles.outfitPreview, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow(theme)]}>
        <View style={styles.previewHeader}>
          <View style={[styles.iconFrame, { backgroundColor: `${theme.clear}18` }]}>
            <Image source={uiIconAssets.shirt} style={[styles.heroIcon, { tintColor: theme.clear }]} resizeMode="contain" />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.previewLabel, { color: theme.clear }]}>오늘 입기 좋은 조합</Text>
            <Text style={[styles.previewTitle, { color: theme.text }]}>{state.outfit.decisionText}</Text>
          </View>
        </View>
        <OutfitGrid outfit={state.outfit} maxItems={2} compact />
        <View style={styles.pillRow}>
          <StatusPill label={getOutfitVariantLabel(state.outfit.variant)} tone="clear" />
          <StatusPill label={state.weather.current.rainProbabilityPct > 0 ? "비 대비" : "강수 없음"} tone="sky" />
        </View>
      </View>

      <View style={[styles.locationPrompt, { backgroundColor: theme.cardStrong, borderColor: locationReady ? theme.clear : theme.border }, cardShadow(theme)]}>
        <View style={[styles.locationIconFrame, { backgroundColor: `${theme.sky}22` }]}>
          <Image source={uiIconAssets.pin} style={[styles.locationIcon, { tintColor: theme.sky }]} resizeMode="contain" />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.locationTitle, { color: theme.text }]}>{locationReady ? "지금 있는 곳에 맞춰 준비했어요" : locationSkipped ? "지역은 나중에 골라도 괜찮아요" : "지금 있는 곳을 알면 더 잘 챙겨드려요"}</Text>
          <Text style={[styles.locationBody, { color: theme.muted }]}>{locationReady ? "기온과 비 변화까지 오늘 추천에 담았어요" : locationSkipped ? "홈에서 원하는 지역을 직접 고를 수 있어요" : "현재 날씨를 반영해 코디와 준비물을 골라드려요"}</Text>
        </View>
        <StatusPill label={locationReady ? "사용 중" : locationSkipped ? "보류" : "선택"} tone={locationReady ? "clear" : locationSkipped ? "gold" : "sky"} />
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
    width: "50%",
    height: "100%",
  },
  outfitPreview: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  locationPrompt: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  locationIconFrame: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  locationIcon: {
    width: 23,
    height: 23,
  },
  locationTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900",
  },
  locationBody: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconFrame: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  heroIcon: {
    width: 24,
    height: 24,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  previewLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  previewTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
});
