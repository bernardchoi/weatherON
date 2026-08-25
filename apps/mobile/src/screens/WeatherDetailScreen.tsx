import React from "react";
import { Image, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import type { DailyWeather, HourlyWeather } from "@weatheron/shared";
import { uiIconAssets } from "../assets";
import { BackButton } from "../components/BackButton";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { cardShadow, radius, spacing, type AppTheme, type ToneColor } from "../theme/tokens";
import { getDisplayLocationName } from "../utils/locationDisplay";
import { formatTemperature } from "../utils/units";
import { isNightAtWeatherTime, type WeatherDaylightContext } from "../utils/weatherDaylight";
import { getConditionColor, getConditionIcon, getConditionLabel } from "../utils/weatherPresentation";

export function WeatherDetailScreen({ state, temperatureUnit, placeSearchOrigin, onGoBack }: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const [currentTimeMs, setCurrentTimeMs] = React.useState(() => Date.now());
  const weather = state.destinationCare.originWeather;
  const current = weather.current;
  const hourly = getHourlyForecast(weather);
  const daylightContext: WeatherDaylightContext = {
    coordinate: placeSearchOrigin?.coordinate,
    timeZone: placeSearchOrigin?.timezone ?? getWeatherFallbackTimeZone(weather.countryCode),
  };
  const currentIsNight = isNightAtWeatherTime(new Date(currentTimeMs).toISOString(), daylightContext);
  const daily = getDailyForecast(weather.daily, weather.hourly);
  const rainyHour = hourly.find((item) => item.rainProbabilityPct >= 50 || item.precipitationMm > 0);
  const uvIndex = getUvIndexSummary(current.uvIndex);
  const airQualityIndices = getAirQualityIndices(current, Platform.OS);
  const weeklyPeak = daily.reduce<DailyWeather | null>((peak, item) => {
    if (!peak) return item;
    return item.rainProbabilityPct > peak.rainProbabilityPct ? item : peak;
  }, null);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTimeMs(Date.now()), 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            maxWidth: layout.contentMaxWidth,
            gap: layout.weatherContentGap,
            paddingHorizontal: layout.screenHorizontalPadding,
            paddingTop: layout.weatherTopPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt, height: layout.weatherAtmosphereHeight }]} />

        <View style={styles.header}>
          <BackButton onPress={onGoBack} />
          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: theme.text }]}>날씨 상세</Text>
            <Text style={[styles.subtitle, { color: theme.subtle }]} numberOfLines={1}>{getDisplayLocationName(weather.locationName)}</Text>
          </View>
        </View>

        <View
          style={[
            styles.heroCard,
            {
              padding: layout.weatherPanelPadding,
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            cardShadow(theme),
          ]}
        >
          <View style={styles.heroMain}>
            <View style={[styles.weatherIconBox, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
              <Image
                source={getConditionIcon(current.condition, currentIsNight)}
                style={[styles.weatherIcon, { tintColor: getConditionColor(current.condition, theme, currentIsNight) }]}
                resizeMode="contain"
              />
            </View>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroTemp, { color: theme.text }]}>{formatTemperature(current.tempC, temperatureUnit)}</Text>
              <Text style={[styles.heroCondition, { color: theme.muted }]} numberOfLines={1}>
                {getConditionLabel(current.condition)} · 체감 {formatTemperature(current.feelsLikeC, temperatureUnit)}
              </Text>
            </View>
            <UvSummaryBadge item={uvIndex} theme={theme} />
          </View>
          <View style={styles.factGrid}>
            <WeatherFact icon={uiIconAssets.drop} label="강수" value={`${current.rainProbabilityPct}%`} color={theme.sky} theme={theme} />
            <WeatherFact icon={uiIconAssets.wind} label="바람" value={`${current.windMs.toFixed(1)}m/s`} color={theme.clear} theme={theme} />
            <WeatherFact icon={uiIconAssets.humidity} label="습도" value={`${current.humidityPct}%`} color={theme.gold} theme={theme} />
          </View>
        </View>

        {airQualityIndices.length > 0 ? (
          <ForecastPanel
            title="대기질"
            meta={getLifestyleIndexMeta(airQualityIndices)}
            theme={theme}
          >
            <View style={styles.indexGrid}>
              {airQualityIndices.map((item) => (
                <LifestyleIndexCard key={item.id} item={item} compact={false} theme={theme} />
              ))}
            </View>
          </ForecastPanel>
        ) : null}

        <ForecastPanel
          title="시간별 예보"
          meta={rainyHour ? `${formatTimeLabel(rainyHour.time)} 강수 ${rainyHour.rainProbabilityPct}%` : "강수 신호 낮음"}
          theme={theme}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyList}>
            {hourly.slice(0, 12).map((item) => {
              const isNight = isNightAtWeatherTime(item.time, daylightContext, weather.observedAt);
              return <HourlyCard key={item.time} item={item} isNight={isNight} temperatureUnit={temperatureUnit} theme={theme} />;
            })}
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

type LifestyleIndexItem = {
  id: string;
  icon: number;
  label: string;
  value: string;
  grade: string;
  description: string;
  tone: ToneColor;
};

function WeatherFact({ icon, label, value, color, theme }: { icon: number; label: string; value: string; color: string; theme: AppTheme }) {
  return (
    <View style={[styles.factCard, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
      <Image source={icon} style={[styles.factIcon, { tintColor: color }]} resizeMode="contain" />
      <Text style={[styles.factLabel, { color }]}>{label}</Text>
      <Text style={[styles.factValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function UvSummaryBadge({ item, theme }: { item: LifestyleIndexItem; theme: AppTheme }) {
  const color = getTone(theme, item.tone);
  return (
    <View
      style={[styles.uvBadge, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}
      accessibilityLabel={`자외선 지수 ${item.value}, ${item.grade}`}
    >
      <View style={styles.uvBadgeLabelRow}>
        <Image source={item.icon} style={[styles.uvBadgeIcon, { tintColor: color }]} resizeMode="contain" />
        <Text style={[styles.uvBadgeLabel, { color: theme.subtle }]}>자외선</Text>
      </View>
      <Text style={[styles.uvBadgeValue, { color: theme.text }]}>{item.value}</Text>
      <Text style={[styles.uvBadgeGrade, { color }]} numberOfLines={1}>{item.grade}</Text>
    </View>
  );
}

function LifestyleIndexCard({ item, compact, theme }: { item: LifestyleIndexItem; compact: boolean; theme: AppTheme }) {
  const color = getTone(theme, item.tone);
  if (compact) {
    return (
      <View
        style={[styles.indexCard, styles.indexCardCompact, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}
        accessibilityLabel={`${item.label} ${item.value}, ${item.grade}, ${item.description}`}
      >
        <View style={styles.indexCompactLabel}>
          <Image source={item.icon} style={[styles.indexIcon, { tintColor: color }]} resizeMode="contain" />
          <Text style={[styles.indexLabel, { color: theme.subtle }]} numberOfLines={1}>{item.label}</Text>
        </View>
        <Text style={[styles.indexValue, styles.indexValueCompact, { color: theme.text }]} numberOfLines={1}>{item.value}</Text>
        <Text style={[styles.indexGrade, styles.indexGradeCompact, { color }]} numberOfLines={1}>{item.grade}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.indexCard, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
      <View style={styles.indexTopRow}>
        <Image source={item.icon} style={[styles.indexIcon, { tintColor: color }]} resizeMode="contain" />
        <Text style={[styles.indexGrade, { color }]} numberOfLines={1}>{item.grade}</Text>
      </View>
      <Text style={[styles.indexLabel, { color: theme.subtle }]} numberOfLines={1}>{item.label}</Text>
      <Text style={[styles.indexValue, { color: theme.text }]} numberOfLines={1}>{item.value}</Text>
      <Text style={[styles.indexDescription, { color: theme.muted }]} numberOfLines={2}>{item.description}</Text>
    </View>
  );
}

function ForecastPanel({ title, meta, theme, children }: { title: string; meta: string; theme: AppTheme; children: React.ReactNode }) {
  const layout = useResponsiveLayout();
  return (
    <View
      style={[
        styles.panel,
        {
          padding: layout.weatherPanelPadding,
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        cardShadow(theme),
      ]}
    >
      <View style={styles.panelHeader}>
        <Text style={[styles.panelTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.panelMeta, { color: theme.subtle }]}>{meta}</Text>
      </View>
      {children}
    </View>
  );
}

function getUvIndexSummary(value?: number): LifestyleIndexItem {
  return {
    id: "uv",
    icon: uiIconAssets.uv,
    label: "자외선",
    value: typeof value === "number" ? `${Math.round(value)}` : "—",
    ...getUvIndexGrade(value),
  };
}

function getAirQualityIndices(
  current: P0ScreenProps["state"]["destinationCare"]["originWeather"]["current"],
  platform: typeof Platform.OS,
): LifestyleIndexItem[] {
  if (platform !== "ios") {
    return [
      {
        id: "pm10",
        icon: uiIconAssets.wind,
        label: "미세먼지",
        value: typeof current.pm10 === "number" ? `${Math.round(current.pm10)}µg/m³` : "확인 중",
        ...getPm10Grade(current.pm10),
      },
      {
        id: "pm25",
        icon: uiIconAssets.drop,
        label: "초미세먼지",
        value: typeof current.pm25 === "number" ? `${Math.round(current.pm25)}µg/m³` : "확인 중",
        ...getPm25Grade(current.pm25),
      },
    ];
  }
  return [];
}

function getLifestyleIndexMeta(items: LifestyleIndexItem[]): string {
  const risky = items.find((item) => item.tone === "warm" || item.tone === "gold");
  return risky ? `${risky.label} ${risky.grade}` : "외출 부담 낮음";
}

function getUvIndexGrade(value?: number): Pick<LifestyleIndexItem, "grade" | "description" | "tone"> {
  if (typeof value !== "number") return { grade: "대기", description: "관측값 확인 중", tone: "sky" };
  if (value >= 8) return { grade: "매우 높음", description: "모자와 선크림 필요", tone: "warm" };
  if (value >= 6) return { grade: "높음", description: "햇빛 차단 준비", tone: "gold" };
  if (value >= 3) return { grade: "보통", description: "긴 외출은 차단 권장", tone: "sky" };
  return { grade: "낮음", description: "외출 부담 낮음", tone: "clear" };
}

function getPm10Grade(value?: number): Pick<LifestyleIndexItem, "grade" | "description" | "tone"> {
  if (typeof value !== "number") return { grade: "대기", description: "관측값 확인 중", tone: "sky" };
  if (value > 150) return { grade: "매우 나쁨", description: "마스크 권장", tone: "warm" };
  if (value > 80) return { grade: "나쁨", description: "민감하면 마스크", tone: "gold" };
  if (value > 30) return { grade: "보통", description: "장시간 외출만 주의", tone: "sky" };
  return { grade: "좋음", description: "외출 부담 낮음", tone: "clear" };
}

function getPm25Grade(value?: number): Pick<LifestyleIndexItem, "grade" | "description" | "tone"> {
  if (typeof value !== "number") return { grade: "대기", description: "관측값 확인 중", tone: "sky" };
  if (value > 75) return { grade: "매우 나쁨", description: "마스크 권장", tone: "warm" };
  if (value > 35) return { grade: "나쁨", description: "민감하면 마스크", tone: "gold" };
  if (value > 15) return { grade: "보통", description: "장시간 외출만 주의", tone: "sky" };
  return { grade: "좋음", description: "외출 부담 낮음", tone: "clear" };
}

function getTone(theme: AppTheme, tone: ToneColor): string {
  if (tone === "gold") return theme.gold;
  if (tone === "sky") return theme.sky;
  if (tone === "warm") return theme.warm;
  return theme.clear;
}

function HourlyCard({ item, isNight, temperatureUnit, theme }: { item: HourlyWeather; isNight: boolean; temperatureUnit: P0ScreenProps["temperatureUnit"]; theme: AppTheme }) {
  const color = getConditionColor(item.condition, theme, isNight);
  const layout = useResponsiveLayout();
  return (
    <View
      style={[
        styles.hourlyCard,
        {
          width: layout.isShort ? 64 : layout.isRegular ? 74 : 70,
          minHeight: layout.isShort ? 102 : layout.isRegular ? 118 : 112,
          backgroundColor: theme.cardMuted,
          borderColor: theme.border,
        },
      ]}
    >
      <Text style={[styles.hourlyTime, { color: theme.subtle }]}>{formatTimeLabel(item.time)}</Text>
      <Image source={getConditionIcon(item.condition, isNight)} style={[styles.hourlyIcon, { tintColor: color }]} resizeMode="contain" />
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

function getWeatherFallbackTimeZone(countryCode: P0ScreenProps["state"]["destinationCare"]["originWeather"]["countryCode"]) {
  if (countryCode === "KR") return "Asia/Seoul";
  if (countryCode === "JP") return "Asia/Tokyo";
  return undefined;
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
    paddingBottom: spacing.xl,
    width: "100%",
    alignSelf: "center",
  },
  atmosphere: {
    position: "absolute",
    left: -32,
    right: -32,
    top: 0,
    opacity: 0.54,
  },
  header: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
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
  uvBadge: {
    width: 70,
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: 7,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  uvBadgeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  uvBadgeIcon: {
    width: 13,
    height: 13,
  },
  uvBadgeLabel: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
  },
  uvBadgeValue: {
    fontSize: 19,
    lineHeight: 22,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  uvBadgeGrade: {
    maxWidth: "100%",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
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
  indexGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  indexCard: {
    flexGrow: 1,
    flexBasis: 96,
    minHeight: 104,
    justifyContent: "space-between",
    gap: 4,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  indexCardCompact: {
    minHeight: 56,
    flexBasis: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  indexCompactLabel: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  indexTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  indexIcon: {
    width: 17,
    height: 17,
  },
  indexGrade: {
    flex: 1,
    minWidth: 0,
    textAlign: "right",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  indexGradeCompact: {
    flex: 1,
    textAlign: "right",
    fontSize: 11,
    lineHeight: 15,
  },
  indexLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  indexValue: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },
  indexValueCompact: {
    minWidth: 40,
    textAlign: "center",
    fontSize: 18,
    lineHeight: 22,
  },
  indexDescription: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
  },
  panel: {
    gap: spacing.sm,
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
