import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { OutfitGrid } from "../components/OutfitGrid";
import { LocationModePanel } from "../components/LocationModePanel";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import { WeatherSummary } from "../components/WeatherSummary";
import { WeatherStatusPanel } from "../components/WeatherStatusPanel";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, spacing } from "../theme/tokens";

export function HomeScreen({
  state,
  useDestinationWeather,
  umbrellaReviewed,
  smartCareEnabled,
  weatherProviderMode,
  weatherLocationMode,
  deviceLocationState,
  locationReady,
  isWeatherLoading,
  onNavigate,
  onToggleWeather,
  onReviewUmbrella,
  onSetWeatherProviderMode,
  onSetWeatherLocationMode,
  onRequestCurrentLocation,
  onRefreshWeather,
}: P0ScreenProps) {
  const activeNotifications = state.notifications.filter((item) => item.active);

  return (
    <AppScreen title="오늘 준비 5초 완결" badge="Guest 홈">
      <WeatherSummary weather={state.weather} useDestinationWeather={useDestinationWeather} onToggleWeather={onToggleWeather} />
      <LocationModePanel
        mode={weatherLocationMode}
        deviceLocationState={deviceLocationState}
        locationReady={locationReady}
        onSetMode={onSetWeatherLocationMode}
        onRequestCurrentLocation={onRequestCurrentLocation}
      />
      <WeatherStatusPanel
        status={weatherProviderMode}
        message={state.weatherProvider.message}
        retryable={state.weatherProvider.retryable}
        loading={isWeatherLoading}
        onSetMode={onSetWeatherProviderMode}
        onRetry={onRefreshWeather}
      />

      <Section title="오늘 코디" caption={state.outfit.decisionText}>
        <OutfitGrid outfit={state.outfit} />
        <Text style={styles.reason}>{state.outfit.reasons.join(" · ")}</Text>
        <View style={styles.actions}>
          <AppButton label="코디 보기" onPress={() => onNavigate("C1")} />
          <AppButton label="상세" onPress={() => onNavigate("C4")} tone="secondary" />
        </View>
      </Section>

      {!umbrellaReviewed && state.umbrella.level !== "none" ? (
        <Section title={state.umbrella.title} caption={state.umbrella.reason}>
          <View style={styles.actionRow}>
            <StatusPill label={state.umbrella.level === "required" ? "필수" : "추천"} tone="sky" />
            <AppButton label="우산 상세" onPress={() => onNavigate("H4")} />
            <AppButton label="확인" onPress={onReviewUmbrella} tone="secondary" />
          </View>
        </Section>
      ) : null}

      <Section title="목적지 알림" caption={state.destinationCare.nextAlertText}>
        <View style={styles.destinationRow}>
          <View style={styles.destinationCopy}>
            <Text style={styles.destinationName}>{state.destinationCare.name}</Text>
            <Text style={styles.meta}>
              {state.destinationCare.departureAdvice?.targetArrivalTime} 도착 · 이동{" "}
              {state.destinationCare.departureAdvice?.travelMinutes}분
            </Text>
          </View>
          <StatusPill label={state.destinationCare.careOn ? "ON" : "OFF"} tone="clear" />
        </View>
        <View style={styles.actions}>
          <AppButton label="목적지 케어" onPress={() => onNavigate("G2")} />
          <AppButton label="목적지 목록" onPress={() => onNavigate("G1")} tone="secondary" />
        </View>
      </Section>

      <Section
        title="알림 센터"
        caption={`${activeNotifications.length}개 자동 케어 활성 · ${smartCareEnabled ? "켜짐" : "꺼짐"} · ${
          state.weatherProvider.fallbackUsed ? "fallback" : "adapter"
        }`}
      >
        {activeNotifications.slice(0, 3).map((item) => (
          <View key={item.id} style={styles.notificationRow}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationReason}>{item.reason}</Text>
          </View>
        ))}
        <View style={styles.actions}>
          <AppButton label="알림 센터" onPress={() => onNavigate("H3")} />
          <AppButton label="강수 보기" onPress={() => onNavigate("H5")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  reason: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  destinationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  destinationCopy: {
    flex: 1,
  },
  destinationName: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  meta: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  notificationRow: {
    gap: 3,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  notificationTitle: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  notificationReason: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
});
