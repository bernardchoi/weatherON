import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { WeatherSnapshot } from "@weatheron/shared";
import { uiIconAssets } from "../assets";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

type WeatherSummaryProps = {
  weather: WeatherSnapshot;
  useDestinationWeather: boolean;
  onToggleWeather: () => void;
};

export function WeatherSummary({ weather, useDestinationWeather, onToggleWeather }: WeatherSummaryProps) {
  const theme = useAppTheme();
  const summary = getWeatherSummaryMetrics(weather);
  return (
    <View style={[styles.weatherCard, { backgroundColor: theme.cardStrong, borderColor: theme.border, shadowColor: theme.shadow }]}>
      <View style={[styles.weatherGlow, { backgroundColor: getConditionAccent(weather.current.condition, theme.gold, theme.sky) }]} />
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={[styles.location, { color: theme.text }]}>{weather.locationName}</Text>
          <Text style={[styles.source, { color: theme.subtle }]}>{getSourceLabel(weather.source, weather.stale)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onToggleWeather}
          style={[styles.switchButton, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}
        >
          <Text style={[styles.switchText, { color: theme.text }]}>{useDestinationWeather ? "현재 위치" : "목적지"}</Text>
        </Pressable>
      </View>
      <View style={styles.sunWrap}>
        <WeatherGlyph condition={weather.current.condition} color={getConditionAccent(weather.current.condition, theme.gold, theme.sky)} />
      </View>
      <View style={styles.currentRow}>
        <Text style={[styles.temp, { color: theme.text }]}>{Math.round(weather.current.feelsLikeC)}도</Text>
      </View>
      <Text style={[styles.condition, { color: theme.text }]}>{getConditionLabel(weather.current.condition)}</Text>
      <Text style={[styles.conditionMeta, { color: theme.muted }]}>
        체감 {Math.round(weather.current.feelsLikeC)}도 · 최고 {Math.round(summary.maxTempC)}도 · 최저 {Math.round(summary.minTempC)}도
      </Text>
      <View style={styles.metricRow}>
        <Metric icon={uiIconAssets.drop} label="오늘 강수" value={`${summary.maxRainProbabilityPct}%`} color={theme.sky} />
        <Metric icon={uiIconAssets.wind} label="최대 바람" value={`${summary.maxWindMs.toFixed(1)}m/s`} color={theme.clear} />
        <Metric icon={uiIconAssets.humidity} label="습도" value={`${weather.current.humidityPct}%`} color={theme.gold} />
      </View>
    </View>
  );
}

function Metric({ icon, label, value, color }: { icon: number; label: string; value: string; color: string }) {
  const theme = useAppTheme();
  return (
    <View style={[styles.metric, { backgroundColor: theme.cardMuted }]}>
      <Image source={icon} style={[styles.metricIcon, { tintColor: color }]} resizeMode="contain" />
      <Text style={[styles.metricLabel, { color: theme.subtle }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function WeatherGlyph({ condition, color }: { condition: WeatherSnapshot["current"]["condition"]; color: string }) {
  const icon = condition === "rain" || condition === "storm" ? uiIconAssets.rain : uiIconAssets.uv;
  return (
    <View style={[styles.weatherIconFrame, { backgroundColor: color }]}>
      <Image source={icon} style={[styles.weatherIconImage, { tintColor: "#ffffff" }]} resizeMode="contain" />
    </View>
  );
}

function getConditionLabel(condition: WeatherSnapshot["current"]["condition"]): string {
  if (condition === "clear") return "맑음";
  if (condition === "cloud") return "흐림";
  if (condition === "rain") return "비";
  if (condition === "snow") return "눈";
  if (condition === "storm") return "강한 비";
  if (condition === "dust") return "먼지";
  return "날씨";
}

function getConditionAccent(condition: WeatherSnapshot["current"]["condition"], gold: string, sky: string) {
  if (condition === "rain" || condition === "storm" || condition === "snow") return sky;
  return gold;
}

function getSourceLabel(source: WeatherSnapshot["source"], stale: boolean): string {
  if (stale) return "최근 예보 기준";
  if (source === "kma") return "기상청 예보 연결";
  if (source === "openmeteo") return "해외 예보 연결";
  if (source === "cache") return "최근 예보 기준";
  return "기본 예보 기준";
}

function getWeatherSummaryMetrics(weather: WeatherSnapshot) {
  const hourly = weather.hourly.length ? weather.hourly : [];
  return {
    maxRainProbabilityPct: Math.max(weather.current.rainProbabilityPct, ...hourly.map((item) => item.rainProbabilityPct)),
    maxWindMs: Math.max(weather.current.windMs, ...hourly.map((item) => item.windMs)),
    maxTempC: Math.max(weather.current.tempC, ...hourly.map((item) => item.tempC)),
    minTempC: Math.min(weather.current.tempC, ...hourly.map((item) => item.tempC)),
  };
}

const styles = StyleSheet.create({
  weatherCard: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  weatherGlow: {
    position: "absolute",
    right: -52,
    top: 40,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.12,
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
  location: {
    fontSize: 20,
    fontWeight: "900",
  },
  source: {
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4,
  },
  currentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  temp: {
    fontSize: 68,
    lineHeight: 70,
    fontWeight: "900",
  },
  condition: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "900",
  },
  conditionMeta: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800",
  },
  sunWrap: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  weatherIconFrame: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  weatherIconImage: {
    width: 30,
    height: 30,
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    justifyContent: "center",
  },
  metric: {
    minHeight: 32,
    minWidth: 94,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  metricIcon: {
    width: 14,
    height: 14,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "800",
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "900",
  },
  switchButton: {
    minHeight: 32,
    minWidth: 82,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  switchText: {
    fontSize: 13,
    fontWeight: "900",
  },
});
