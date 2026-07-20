import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import { AppScreen } from "../components/AppScreen";
import { OnboardingFooter } from "../components/OnboardingFooter";
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
      title="오늘 날씨에 맞는 코디"
      subtitle="옷과 준비물을 함께 추천"
      badge="2 / 4"
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

      <View style={[styles.outfitPreview, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow(theme)]}>
        <View style={styles.previewHeader}>
          <View style={[styles.iconFrame, { backgroundColor: `${theme.clear}18` }]}>
            <Image source={uiIconAssets.shirt} style={[styles.heroIcon, { tintColor: theme.clear }]} resizeMode="contain" />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.previewLabel, { color: theme.clear }]}>오늘의 추천</Text>
            <Text style={[styles.previewTitle, { color: theme.text }]}>{state.outfit.decisionText}</Text>
          </View>
        </View>
        <OutfitGrid outfit={state.outfit} maxItems={2} compact />
        <View style={styles.pillRow}>
          <StatusPill label={getOutfitVariantLabel(state.outfit.variant)} tone="clear" />
          <StatusPill label={state.weather.current.rainProbabilityPct > 0 ? "비 대비" : "강수 없음"} tone="sky" />
          <StatusPill label={`${outfitItems.length}개 아이템`} tone="gold" />
        </View>
      </View>

      <View style={[styles.locationPrompt, { backgroundColor: theme.cardStrong, borderColor: locationReady ? theme.clear : theme.border }, cardShadow(theme)]}>
        <View style={[styles.locationIconFrame, { backgroundColor: `${theme.sky}22` }]}>
          <Image source={uiIconAssets.pin} style={[styles.locationIcon, { tintColor: theme.sky }]} resizeMode="contain" />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.locationTitle, { color: theme.text }]}>{locationReady ? "현재 위치 기준 추천 준비됨" : locationSkipped ? "지역은 나중에 선택 가능" : "현재 위치로 더 정확하게 추천"}</Text>
          <Text style={[styles.locationBody, { color: theme.muted }]}>{locationReady ? "기온과 강수 변화가 오늘 추천에 반영됨" : locationSkipped ? "홈에서 지역을 직접 선택할 수 있음" : "현재 날씨를 반영해 코디와 준비물을 추천함"}</Text>
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
