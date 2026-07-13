import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { recommendOutfit, recommendUmbrella, type DailyWeather, type UserPreferenceProfile, type WeatherSnapshot } from "@weatheron/shared";
import { outfitImageAssets, uiIconAssets } from "../assets";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";
import { getDisplayLocationName } from "../utils/locationDisplay";
import { formatTemperature } from "../utils/units";
import { formatOutfitTags, getOutfitSlotLabel } from "../utils/outfitLabels";

export function TomorrowBriefScreen({
  state,
  wardrobeItems,
  styleGender,
  ageBand,
  fitPreference,
  selectedStyles,
  smartCareScenario,
  temperatureUnit,
  onNavigate,
  onGoBack,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const tomorrow = buildTomorrowWeather(state.weather);
  const outfit = recommendOutfit(tomorrow.weather, getPreferenceProfile({ styleGender, ageBand, fitPreference, selectedStyles, smartCareScenario }), wardrobeItems);
  const outfitDecision = toTomorrowCopy(outfit.decisionText);
  const outfitReason = toTomorrowCopy(outfit.reasons[0] ?? "내일 예보 기준 기본 코디 추천");
  const umbrella = recommendUmbrella(tomorrow.weather);
  const hourlyRain = tomorrow.weather.hourly.find((hour) => hour.rainProbabilityPct >= 50 || hour.precipitationMm > 0);
  const outfitItems = Object.entries(outfit.items).filter((entry): entry is [string, NonNullable<typeof entry[1]>] => Boolean(entry[1]));
  const outfitPreview = outfitItems.find(([, item]) => Boolean(item.imageUrl))?.[1];

  return (
    <AppScreen
      title="내일 브리핑"
      subtitle={`${tomorrow.dateLabel} · ${getDisplayLocationName(tomorrow.weather.locationName)}`}
      badge="21:00"
      onBack={onGoBack}
      footer={
        <View style={styles.footerActions}>
          <AppButton label="오늘 홈으로" onPress={() => onNavigate("H1")} tone="warning" />
          <AppButton label="알림 설정" onPress={() => onNavigate("M2")} tone="secondary" />
        </View>
      }
    >
      <Section title="내일 날씨" caption={tomorrow.fallback ? "일별 예보 데이터가 없어 현재 예보 기반으로 표시" : "외출 전 확인할 핵심 예보"} accent="sky">
        <View style={[styles.weatherHero, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
          <View style={[styles.weatherIconFrame, { backgroundColor: `${getConditionColor(tomorrow.weather.current.condition, theme)}20` }]}>
            <Image source={getConditionIcon(tomorrow.weather.current.condition)} style={[styles.weatherIcon, { tintColor: getConditionColor(tomorrow.weather.current.condition, theme) }]} resizeMode="contain" />
          </View>
          <View style={styles.weatherCopy}>
            <Text style={[styles.weatherCondition, { color: theme.text }]}>{getConditionLabel(tomorrow.weather.current.condition)}</Text>
            <Text style={[styles.weatherRange, { color: theme.muted }]}>
              최고 {formatTemperature(tomorrow.summary.maxTempC, temperatureUnit)} · 최저 {formatTemperature(tomorrow.summary.minTempC, temperatureUnit)}
            </Text>
          </View>
          <View style={styles.rainSummary}>
            <Text style={[styles.rainPct, { color: getRainTone(tomorrow.summary.rainProbabilityPct, theme) }]}>{tomorrow.summary.rainProbabilityPct}%</Text>
            <Text style={[styles.rainLabel, { color: theme.subtle }]}>강수 확률</Text>
          </View>
        </View>
        <View style={styles.factRow}>
          <BriefFact label="예상 강수" value={tomorrow.summary.precipitationMm > 0 ? `${tomorrow.summary.precipitationMm.toFixed(1)}mm` : "없음"} color={theme.sky} theme={theme} />
          <BriefFact label="최대 바람" value={`${tomorrow.summary.windMs.toFixed(1)}m/s`} color={theme.clear} theme={theme} />
          <BriefFact label="비 시각" value={hourlyRain ? formatHour(hourlyRain.time) : "없음"} color={theme.gold} theme={theme} />
        </View>
      </Section>

      <Section title="내일 코디" caption={`매칭 ${outfit.matchPct}% · ${outfitDecision}`} accent="gold">
        <View style={[styles.outfitHero, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
          <View style={[styles.outfitImageFrame, { backgroundColor: theme.card }]}>
            {outfitPreview?.imageUrl && outfitImageAssets[outfitPreview.imageUrl] ? (
              <Image source={outfitImageAssets[outfitPreview.imageUrl]} style={styles.outfitImage} resizeMode="contain" />
            ) : (
              <Image source={uiIconAssets.shirt} style={[styles.outfitFallbackIcon, { tintColor: theme.gold }]} resizeMode="contain" />
            )}
          </View>
          <View style={styles.outfitCopy}>
            <Text style={[styles.outfitDecision, { color: theme.text }]}>{outfitDecision}</Text>
            <Text style={[styles.outfitReason, { color: theme.muted }]} numberOfLines={2}>{outfitReason}</Text>
          </View>
        </View>
        <View style={styles.outfitItems}>
          {outfitItems.slice(0, 4).map(([slot, item]) => (
            <View key={slot} style={[styles.outfitItem, { borderBottomColor: theme.border }]}>
              <Text style={[styles.outfitSlot, { color: theme.gold }]}>{getOutfitSlotLabel(slot)}</Text>
              <Text style={[styles.outfitName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.outfitTags, { color: theme.subtle }]} numberOfLines={1}>{formatOutfitTags(item.weatherTags)}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="우산 준비" caption={umbrella.reason} accent={umbrella.level === "none" ? "clear" : "warm"}>
        <View style={[styles.umbrellaRow, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
          <View style={[styles.umbrellaIconFrame, { backgroundColor: `${umbrella.level === "none" ? theme.clear : theme.sky}20` }]}>
            <Image source={uiIconAssets.umbrella} style={[styles.umbrellaIcon, { tintColor: umbrella.level === "none" ? theme.clear : theme.sky }]} resizeMode="contain" />
          </View>
          <View style={styles.umbrellaCopy}>
            <Text style={[styles.umbrellaTitle, { color: theme.text }]}>{umbrella.title}</Text>
            <Text style={[styles.umbrellaBody, { color: theme.muted }]}>{getUmbrellaAction(umbrella.level)}</Text>
          </View>
          <StatusPill label={umbrella.level === "none" ? "불필요" : umbrella.level === "notice" ? "선택" : "챙김"} tone={umbrella.level === "none" ? "clear" : "sky"} />
        </View>
      </Section>
    </AppScreen>
  );
}

function BriefFact({ label, value, color, theme }: { label: string; value: string; color: string; theme: ReturnType<typeof useAppTheme> }) {
  return (
    <View style={[styles.fact, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
      <Text style={[styles.factLabel, { color: theme.subtle }]}>{label}</Text>
      <Text style={[styles.factValue, { color }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function buildTomorrowWeather(weather: WeatherSnapshot): { weather: WeatherSnapshot; summary: DailyWeather; dateLabel: string; fallback: boolean } {
  const observedDate = getDateKey(weather.observedAt);
  const sortedDaily = [...(weather.daily ?? [])].sort((left, right) => left.date.localeCompare(right.date));
  const summary = sortedDaily.find((item) => item.date > observedDate) ?? sortedDaily[1] ?? sortedDaily[0];
  if (!summary) {
    return {
      weather,
      summary: {
        date: observedDate,
        minTempC: weather.current.tempC,
        maxTempC: weather.current.tempC,
        rainProbabilityPct: weather.current.rainProbabilityPct,
        precipitationMm: weather.current.precipitationMm,
        windMs: weather.current.windMs,
        condition: weather.current.condition,
      },
      dateLabel: "내일 예보 갱신 중",
      fallback: true,
    };
  }

  const matchingHours = weather.hourly.filter((item) => getDateKey(item.time) === summary.date);
  const hourly = matchingHours.length > 0 ? matchingHours : buildDailyHours(summary);
  const midpointTemperature = Math.round((summary.minTempC + summary.maxTempC) / 2);
  return {
    weather: {
      ...weather,
      observedAt: `${summary.date}T09:00:00`,
      current: {
        ...weather.current,
        tempC: midpointTemperature,
        feelsLikeC: midpointTemperature,
        condition: toCondition(summary.condition),
        precipitationMm: summary.precipitationMm,
        rainProbabilityPct: summary.rainProbabilityPct,
        windMs: summary.windMs,
      },
      hourly,
      daily: [summary],
    },
    summary,
    dateLabel: formatTomorrowDate(summary.date),
    fallback: false,
  };
}

function buildDailyHours(summary: DailyWeather): WeatherSnapshot["hourly"] {
  return ["09:00", "14:00", "20:00"].map((time) => ({
    time: `${summary.date}T${time}:00`,
    tempC: Math.round((summary.minTempC + summary.maxTempC) / 2),
    rainProbabilityPct: summary.rainProbabilityPct,
    precipitationMm: Number((summary.precipitationMm / 3).toFixed(1)),
    windMs: summary.windMs,
    condition: summary.condition,
  }));
}

function getPreferenceProfile(values: Pick<P0ScreenProps, "styleGender" | "ageBand" | "fitPreference" | "selectedStyles" | "smartCareScenario">): UserPreferenceProfile {
  return {
    gender: values.styleGender === "men" ? "male" : values.styleGender === "women" ? "female" : "any",
    ageBand: values.ageBand,
    styleTags: values.selectedStyles,
    fit: values.fitPreference,
    routine: values.smartCareScenario === "travel" ? "travel" : values.smartCareScenario === "outing" ? "free" : "commute",
    alertMode: "auto-care",
  };
}

function getDateKey(value: string) {
  const match = value.match(/\d{4}-\d{2}-\d{2}/);
  return match?.[0] ?? "";
}

function formatTomorrowDate(value: string) {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "내일";
  return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "short" }).format(parsed);
}

function formatHour(value: string) {
  const match = value.match(/T?(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : "확인 중";
}

function toCondition(value: string): WeatherSnapshot["current"]["condition"] {
  if (value === "clear" || value === "cloud" || value === "rain" || value === "snow" || value === "storm" || value === "dust") return value;
  return "cloud";
}

function getConditionIcon(condition: string) {
  if (condition === "rain" || condition === "storm" || condition === "snow") return uiIconAssets.rain;
  if (condition === "dust") return uiIconAssets.wind;
  return uiIconAssets.uv;
}

function getConditionColor(condition: string, theme: ReturnType<typeof useAppTheme>) {
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

function getRainTone(rainProbabilityPct: number, theme: ReturnType<typeof useAppTheme>) {
  return rainProbabilityPct >= 60 ? theme.sky : rainProbabilityPct >= 30 ? theme.gold : theme.clear;
}

function getUmbrellaAction(level: ReturnType<typeof recommendUmbrella>["level"]) {
  if (level === "none") return "별도 우산 준비 없이 기본 외출 가능";
  if (level === "notice") return "가벼운 소형 우산 선택 권장";
  if (level === "recommended") return "가방에 3단 우산 넣기";
  return "방수 아우터와 큰 우산 우선 준비";
}

function toTomorrowCopy(value: string) {
  return value.replaceAll("오늘", "내일");
}

const styles = StyleSheet.create({
  footerActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  weatherHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  weatherIconFrame: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
  },
  weatherIcon: {
    width: 35,
    height: 35,
  },
  weatherCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  weatherCondition: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
  },
  weatherRange: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  rainSummary: {
    alignItems: "flex-end",
  },
  rainPct: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  rainLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
  },
  factRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  fact: {
    flex: 1,
    minWidth: 0,
    gap: 3,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  factLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
  },
  factValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  outfitHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  outfitImageFrame: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    overflow: "hidden",
  },
  outfitImage: {
    width: 62,
    height: 62,
  },
  outfitFallbackIcon: {
    width: 32,
    height: 32,
  },
  outfitCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  outfitDecision: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900",
  },
  outfitReason: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  outfitItems: {
    gap: 0,
  },
  outfitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  outfitSlot: {
    width: 42,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",
  },
  outfitName: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  outfitTags: {
    maxWidth: 70,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
  },
  umbrellaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  umbrellaIconFrame: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  umbrellaIcon: {
    width: 24,
    height: 24,
  },
  umbrellaCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  umbrellaTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  umbrellaBody: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
});
