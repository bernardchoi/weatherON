import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { DailyWeather, HourlyWeather } from "@weatheron/shared";
import { uiIconAssets } from "../assets";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";
import { getDisplayLocationName } from "../utils/locationDisplay";
import { formatTemperature } from "../utils/units";

export function WeatherDetailScreen({ state, temperatureUnit, onGoBack }: P0ScreenProps) {
  const theme = useAppTheme();
  const weather = state.destinationCare.originWeather;
  const current = weather.current;
  const hourly = getHourlyForecast(weather);
  const daily = getDailyForecast(weather.daily, weather.hourly);
  const rainyHour = hourly.find((item) => item.rainProbabilityPct >= 50 || item.precipitationMm > 0);
  const weeklyPeak = daily.reduce<DailyWeather | null>((peak, item) => {
    if (!peak) return item;
    return item.rainProbabilityPct > peak.rainProbabilityPct ? item : peak;
  }, null);

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <Pressable accessibilityLabel="뒤로" accessibilityRole="button" onPress={onGoBack} style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.backGlyph, { color: theme.text }]}>‹</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: theme.text }]}>날씨 상세</Text>
            <Text style={[styles.subtitle, { color: theme.subtle }]} numberOfLines={1}>{getDisplayLocationName(weather.locationName)}</Text>
          </View>
        </View>

        <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.heroMain}>
            <View style={[styles.weatherIconBox, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
              <Image source={getConditionIcon(current.condition)} style={[styles.weatherIcon, { tintColor: getConditionColor(current.condition, theme) }]} resizeMode="contain" />
            </View>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroTemp, { color: theme.text }]}>{formatTemperature(current.feelsLikeC, temperatureUnit)}</Text>
              <Text style={[styles.heroCondition, { color: theme.muted }]}>
                {getConditionLabel(current.condition)} · 현재 {formatTemperature(current.tempC, temperatureUnit)}
              </Text>
            </View>
          </View>
          <View style={styles.factGrid}>
            <WeatherFact icon={uiIconAssets.drop} label="강수" value={`${current.rainProbabilityPct}%`} color={theme.sky} theme={theme} />
            <WeatherFact icon={uiIconAssets.wind} label="바람" value={`${current.windMs.toFixed(1)}m/s`} color={theme.clear} theme={theme} />
            <WeatherFact icon={uiIconAssets.humidity} label="습도" value={`${current.humidityPct}%`} color={theme.gold} theme={theme} />
          </View>
        </View>

        <ForecastPanel
          title="시간별 예보"
          meta={rainyHour ? `${formatTimeLabel(rainyHour.time)} 강수 ${rainyHour.rainProbabilityPct}%` : "강수 신호 낮음"}
          theme={theme}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyList}>
            {hourly.slice(0, 12).map((item) => (
              <HourlyCard key={item.time} item={item} temperatureUnit={temperatureUnit} theme={theme} />
            ))}
          </ScrollView>
        </ForecastPanel>

        <ForecastPanel
          title="주간 예보"
          meta={weeklyPeak ? `${formatDateLabel(weeklyPeak.date)} 강수 ${weeklyPeak.rainProbabilityPct}%` : "일별 데이터 확인 중"}
          theme={theme}
        >
          <View style={styles.dailyList}>
            {daily.slice(0, 7).map((item) => (
              <DailyRow key={item.date} item={item} temperatureUnit={temperatureUnit} theme={theme} />
            ))}
          </View>
        </ForecastPanel>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function WeatherFact({ icon, label, value, color, theme }: { icon: number; label: string; value: string; color: string; theme: AppTheme }) {
  return (
    <View style={[styles.factCard, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
      <Image source={icon} style={[styles.factIcon, { tintColor: color }]} resizeMode="contain" />
      <Text style={[styles.factLabel, { color }]}>{label}</Text>
      <Text style={[styles.factValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function ForecastPanel({ title, meta, theme, children }: { title: string; meta: string; theme: AppTheme; children: React.ReactNode }) {
  return (
    <View style={[styles.panel, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.panelHeader}>
        <Text style={[styles.panelTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.panelMeta, { color: theme.subtle }]}>{meta}</Text>
      </View>
      {children}
    </View>
  );
}

function HourlyCard({ item, temperatureUnit, theme }: { item: HourlyWeather; temperatureUnit: P0ScreenProps["temperatureUnit"]; theme: AppTheme }) {
  const color = getConditionColor(item.condition, theme);
  return (
    <View style={[styles.hourlyCard, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
      <Text style={[styles.hourlyTime, { color: theme.subtle }]}>{formatTimeLabel(item.time)}</Text>
      <Image source={getConditionIcon(item.condition)} style={[styles.hourlyIcon, { tintColor: color }]} resizeMode="contain" />
      <Text style={[styles.hourlyTemp, { color: theme.text }]}>{formatTemperature(item.tempC, temperatureUnit)}</Text>
      <Text style={[styles.hourlyRain, { color }]}>{item.rainProbabilityPct}%</Text>
    </View>
  );
}

function DailyRow({ item, temperatureUnit, theme }: { item: DailyWeather; temperatureUnit: P0ScreenProps["temperatureUnit"]; theme: AppTheme }) {
  const color = getConditionColor(item.condition, theme);
  return (
    <View style={[styles.dailyRow, { borderColor: theme.border }]}>
      <View style={styles.dailyDay}>
        <Image source={getConditionIcon(item.condition)} style={[styles.dailyIcon, { tintColor: color }]} resizeMode="contain" />
        <Text style={[styles.dailyDate, { color: theme.text }]}>{formatDateLabel(item.date)}</Text>
      </View>
      <Text style={[styles.dailyCondition, { color: theme.muted }]}>{getConditionLabel(item.condition)}</Text>
      <Text style={[styles.dailyTemp, { color: theme.text }]}>
        {formatTemperature(item.minTempC, temperatureUnit)} / {formatTemperature(item.maxTempC, temperatureUnit)}
      </Text>
      <Text style={[styles.dailyRain, { color }]}>{item.rainProbabilityPct}%</Text>
    </View>
  );
}

function getHourlyForecast(weather: P0ScreenProps["state"]["destinationCare"]["originWeather"]): HourlyWeather[] {
  if (weather.hourly.length > 0) return weather.hourly;
  return [{
    time: weather.observedAt,
    tempC: weather.current.tempC,
    rainProbabilityPct: weather.current.rainProbabilityPct,
    precipitationMm: weather.current.precipitationMm,
    windMs: weather.current.windMs,
    condition: weather.current.condition,
  }];
}

function getDailyForecast(daily: DailyWeather[] | undefined, hourly: HourlyWeather[]): DailyWeather[] {
  if (daily && daily.length > 0) return daily;
  const grouped = hourly.reduce<Record<string, HourlyWeather[]>>((acc, item) => {
    const date = item.time.includes("T") ? item.time.slice(0, 10) : "오늘";
    acc[date] = acc[date] ?? [];
    acc[date].push(item);
    return acc;
  }, {});
  return Object.entries(grouped).map(([date, items]) => ({
    date,
    minTempC: Math.min(...items.map((item) => item.tempC)),
    maxTempC: Math.max(...items.map((item) => item.tempC)),
    rainProbabilityPct: Math.max(...items.map((item) => item.rainProbabilityPct)),
    precipitationMm: Number(items.reduce((sum, item) => sum + item.precipitationMm, 0).toFixed(1)),
    windMs: Math.max(...items.map((item) => item.windMs)),
    condition: selectCondition(items),
  }));
}

function selectCondition(items: HourlyWeather[]) {
  const priority = ["storm", "snow", "rain", "dust", "cloud", "clear"];
  return priority.find((condition) => items.some((item) => item.condition === condition)) ?? items[0]?.condition ?? "cloud";
}

function getConditionIcon(condition: string) {
  if (condition === "rain" || condition === "storm" || condition === "snow") return uiIconAssets.rain;
  if (condition === "dust") return uiIconAssets.wind;
  return uiIconAssets.uv;
}

function getConditionColor(condition: string, theme: AppTheme) {
  if (condition === "rain" || condition === "storm" || condition === "snow") return theme.sky;
  if (condition === "dust" || condition === "cloud") return theme.clear;
  return theme.gold;
}

function getConditionLabel(condition: string) {
  if (condition === "clear") return "맑음";
  if (condition === "cloud") return "흐림";
  if (condition === "rain") return "비";
  if (condition === "snow") return "눈";
  if (condition === "storm") return "강한 비";
  if (condition === "dust") return "먼지";
  return "날씨";
}

function formatTimeLabel(value: string) {
  const match = value.match(/T?(\d{2}):(\d{2})/);
  if (match) return `${match[1]}:${match[2]}`;
  return "현재";
}

function formatDateLabel(value: string) {
  if (value === "오늘") return value;
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  return `${Number(match[2])}/${Number(match[3])}`;
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    minHeight: "100%",
    gap: spacing.sm,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 112,
  },
  atmosphere: {
    position: "absolute",
    left: -32,
    right: -32,
    top: 0,
    height: 300,
    opacity: 0.54,
  },
  header: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  backGlyph: {
    marginTop: -2,
    fontSize: 30,
    lineHeight: 30,
    fontWeight: "300",
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: 0,
  },
  subtitle: {
    marginTop: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  heroCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  heroMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  weatherIconBox: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  weatherIcon: {
    width: 38,
    height: 38,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroTemp: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    letterSpacing: 0,
  },
  heroCondition: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  factGrid: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  factCard: {
    flex: 1,
    minHeight: 66,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  factIcon: {
    width: 16,
    height: 16,
  },
  factLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  factValue: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  panel: {
    gap: spacing.sm,
    padding: 15,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  panelTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  panelMeta: {
    flex: 1,
    minWidth: 0,
    textAlign: "right",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  hourlyList: {
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  hourlyCard: {
    width: 70,
    minHeight: 112,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  hourlyTime: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  hourlyIcon: {
    width: 24,
    height: 24,
  },
  hourlyTemp: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },
  hourlyRain: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  dailyList: {
    gap: 0,
  },
  dailyRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderTopWidth: 1,
  },
  dailyDay: {
    width: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dailyIcon: {
    width: 18,
    height: 18,
  },
  dailyDate: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  dailyCondition: {
    width: 42,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  dailyTemp: {
    flex: 1,
    minWidth: 0,
    textAlign: "right",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  dailyRain: {
    width: 38,
    textAlign: "right",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  bottomSpacer: {
    height: 10,
  },
});
