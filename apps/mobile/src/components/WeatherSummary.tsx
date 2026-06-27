import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { WeatherSnapshot } from "@weatheron/shared";
import { appColors, radius, spacing } from "../theme/tokens";

type WeatherSummaryProps = {
  weather: WeatherSnapshot;
  useDestinationWeather: boolean;
  onToggleWeather: () => void;
};

export function WeatherSummary({ weather, useDestinationWeather, onToggleWeather }: WeatherSummaryProps) {
  return (
    <View style={styles.weatherLine}>
      <View style={styles.copy}>
        <Text style={styles.location}>{weather.locationName}</Text>
        <Text style={styles.meta}>
          체감 {weather.current.feelsLikeC}도 · 강수확률 {weather.current.rainProbabilityPct}% · 바람{" "}
          {weather.current.windMs.toFixed(1)}m/s
        </Text>
        <Text style={styles.source}>
          {weather.source.toUpperCase()} {weather.stale ? "· 최근 기준" : "· 정규화 완료"}
        </Text>
      </View>
      <Pressable accessibilityRole="button" onPress={onToggleWeather} style={styles.switchButton}>
        <Text style={styles.switchText}>{useDestinationWeather ? "현재 위치" : "목적지"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  weatherLine: {
    gap: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: appColors.navyDeep,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  copy: {
    flex: 1,
  },
  location: {
    color: appColors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  meta: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  source: {
    color: appColors.clear,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 4,
  },
  switchButton: {
    minHeight: 42,
    minWidth: 86,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: appColors.gold,
  },
  switchText: {
    color: appColors.navy,
    fontSize: 13,
    fontWeight: "900",
  },
});
