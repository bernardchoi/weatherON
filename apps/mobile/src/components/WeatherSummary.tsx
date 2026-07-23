import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { WeatherSnapshot } from "@weatheron/shared";
import { useAppTheme } from "../theme/AppThemeContext";
import { androidMaterialRipple, androidMaterialSurface } from "../theme/androidMaterial";
import { iosGlassSurface } from "../theme/iosGlass";
import { radius, spacing } from "../theme/tokens";
import { IosGlassBackdrop } from "./IosGlassBackdrop";
import type { TemperatureUnit } from "../state/useWeatherOnAppState";
import { getDisplayLocationName } from "../utils/locationDisplay";
import { formatTemperature, formatTemperatureDelta } from "../utils/units";
import { getConditionLabel } from "../utils/weatherPresentation";

type WeatherSummaryProps = {
  originWeather: WeatherSnapshot;
  destinationWeather: WeatherSnapshot;
  destinationName: string;
  sourceLabel: string;
  updatedAtLabel: string;
  loading: boolean;
  destinationReady: boolean;
  temperatureUnit: TemperatureUnit;
  onRefresh: () => void;
  onAddDestination: () => void;
};

export function WeatherSummary({
  originWeather,
  destinationWeather,
  destinationName,
  sourceLabel,
  updatedAtLabel,
  loading,
  destinationReady,
  temperatureUnit,
  onRefresh,
  onAddDestination,
}: WeatherSummaryProps) {
  const theme = useAppTheme();
  const comparison = destinationReady ? getWeatherComparison(originWeather, destinationWeather, temperatureUnit) : getMissingDestinationComparison();
  const weatherGlass = iosGlassSurface(theme, "weather", { nativeBackdrop: true });
  return (
    <View style={[styles.weatherCard, { backgroundColor: theme.cardStrong, borderColor: theme.border, shadowColor: theme.shadow }, androidMaterialSurface(theme, "weather"), weatherGlass]}>
      {weatherGlass ? <IosGlassBackdrop theme={theme} role="weather" style={styles.weatherBackdrop} /> : null}
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.text }]}>{destinationReady ? "출발지와 가는 곳 날씨" : "지금 있는 곳 날씨"}</Text>
          <Text style={[styles.source, { color: theme.subtle }]}>
            {destinationReady ? "나서기 전, 달라지는 것만 먼저 볼게요" : "가는 곳을 더하면 날씨 차이까지 보여드림"}
          </Text>
        </View>
        <View style={[styles.diffPill, { backgroundColor: comparison.tone === "warm" ? `${theme.warm}20` : `${theme.clear}20` }]}>
          <Text style={[styles.diffPillText, { color: comparison.tone === "warm" ? theme.warm : theme.clear }]}>{comparison.label}</Text>
        </View>
      </View>
      <View style={styles.sourceRow}>
        <Text style={[styles.sourceMeta, { color: theme.subtle }]} numberOfLines={1}>
          {loading ? "최신 날씨 불러오는 중" : `${sourceLabel} · ${updatedAtLabel}`}
        </Text>
        <Pressable
          accessibilityLabel="날씨 새로고침"
          accessibilityRole="button"
          android_ripple={androidMaterialRipple(theme)}
          disabled={loading}
          onPress={onRefresh}
          style={[styles.refreshButton, { backgroundColor: theme.cardMuted, borderColor: theme.border }, loading ? styles.disabled : null]}
        >
          <Text style={[styles.refreshText, { color: theme.text }]}>새로 보기</Text>
        </Pressable>
      </View>
      <View style={styles.compareGrid}>
        <WeatherMiniCard label="현재" weather={originWeather} toneColor={theme.gold} themeName={theme.name} temperatureUnit={temperatureUnit} />
        {destinationReady ? (
          <WeatherMiniCard label="목적지" locationName={destinationName} weather={destinationWeather} toneColor={theme.sky} themeName={theme.name} temperatureUnit={temperatureUnit} />
        ) : (
          <DestinationEmptyMiniCard onPress={onAddDestination} />
        )}
      </View>
      <View style={[styles.diffBar, { backgroundColor: theme.cardMuted }]}>
        <Text style={[styles.diffText, { color: theme.text }]}>{comparison.detail}</Text>
      </View>
    </View>
  );
}

function DestinationEmptyMiniCard({ onPress }: { onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityLabel="목적지 추가하기"
      accessibilityRole="button"
      android_ripple={androidMaterialRipple(theme)}
      onPress={onPress}
      style={[styles.miniCard, styles.emptyMiniCard, { backgroundColor: theme.cardMuted, borderColor: theme.gold }]}
    >
      <View style={styles.miniHeader}>
        <View style={[styles.dot, { backgroundColor: theme.sky }]} />
        <Text style={[styles.miniLabel, { color: theme.subtle }]}>목적지</Text>
      </View>
      <Text style={[styles.miniLocation, { color: theme.text }]} numberOfLines={1}>
          추가 필요
      </Text>
      <Text style={[styles.emptyMiniTitle, { color: theme.gold }]}>가는 곳 추가</Text>
      <Text style={[styles.miniMeta, { color: theme.subtle }]} numberOfLines={2}>
        가는 곳을 더하면 출발 시간까지 챙겨드림
      </Text>
    </Pressable>
  );
}

function WeatherMiniCard({
  label,
  locationName,
  weather,
  toneColor,
  themeName,
  temperatureUnit,
}: {
  label: string;
  locationName?: string;
  weather: WeatherSnapshot;
  toneColor: string;
  themeName: "dark" | "light";
  temperatureUnit: TemperatureUnit;
}) {
  const theme = useAppTheme();
  return (
    <View style={[styles.miniCard, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
      <View style={styles.miniHeader}>
        <View style={[styles.dot, { backgroundColor: toneColor }]} />
        <Text style={[styles.miniLabel, { color: theme.subtle }]}>{label}</Text>
      </View>
      <Text style={[styles.miniLocation, { color: theme.text }]} numberOfLines={1}>
        {locationName ?? getDisplayLocationName(weather.locationName)}
      </Text>
      <View style={styles.miniMain}>
        <Text style={[styles.miniTemp, { color: theme.text }]}>{formatTemperature(weather.current.feelsLikeC, temperatureUnit, { suffix: true })}</Text>
        <Text style={[styles.miniCondition, { color: themeName === "light" ? toneColor : theme.muted }]}>
          {getConditionLabel(weather.current.condition)}
        </Text>
      </View>
      <Text style={[styles.miniMeta, { color: theme.subtle }]} numberOfLines={1}>
        강수 {weather.current.rainProbabilityPct}% · 바람 {weather.current.windMs.toFixed(1)}
      </Text>
    </View>
  );
}

function getWeatherComparison(origin: WeatherSnapshot, destination: WeatherSnapshot, temperatureUnit: TemperatureUnit) {
  const rainDelta = destination.current.rainProbabilityPct - origin.current.rainProbabilityPct;
  const tempDelta = Math.round(destination.current.feelsLikeC - origin.current.feelsLikeC);
  const windDelta = destination.current.windMs - origin.current.windMs;

  if (rainDelta >= 15) {
    return {
      label: `강수 +${rainDelta}%`,
      detail: `가는 곳에 비 올 가능성 더 높음 · 우산은 목적지 기준으로 챙겨요`,
      tone: "warm" as const,
    };
  }
  if (tempDelta <= -2 || tempDelta >= 2) {
    return {
      label: `체감 ${formatTemperatureDelta(tempDelta, temperatureUnit)}`,
      detail: tempDelta > 0 ? "가는 곳이 더 더움 · 가볍게 입어도 좋아요" : "가는 곳이 더 서늘함 · 겉옷을 챙겨봐요",
      tone: "warm" as const,
    };
  }
  if (windDelta >= 2) {
    return {
      label: `바람 +${windDelta.toFixed(1)}`,
      detail: "가는 곳 바람이 더 강함 · 우산보다 방수 외투가 좋아요",
      tone: "warm" as const,
    };
  }
  return {
    label: "차이 작음",
    detail: "지금 있는 곳 기준으로 준비해도 괜찮아요",
    tone: "clear" as const,
  };
}

function getMissingDestinationComparison() {
  return {
    label: "가는 곳 추가",
    detail: "가는 곳을 더하면 날씨 비교와 출발 시간까지 챙겨드림",
    tone: "warm" as const,
  };
}

const styles = StyleSheet.create({
  weatherCard: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  weatherBackdrop: {
    borderRadius: radius.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  source: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  sourceRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  sourceMeta: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  refreshButton: {
    width: 52,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  refreshText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.58,
  },
  diffPill: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  diffPillText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  compareGrid: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  miniCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 100,
    gap: 4,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  miniHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
  },
  miniLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  miniLocation: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  miniMain: {
    gap: 2,
  },
  miniTemp: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
  },
  miniCondition: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  miniMeta: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  emptyMiniCard: {
    borderStyle: "dashed",
  },
  emptyMiniTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
  },
  diffBar: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  diffText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
});
