import React from "react";
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";
import { recommendOutfit, recommendUmbrella, type DailyWeather, type UserPreferenceProfile, type WeatherSnapshot } from "@weatheron/shared";
import { brandAssets, outfitImageAssets, uiIconAssets } from "../assets";
import { BackButton } from "../components/BackButton";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";
import { getDisplayLocationName } from "../utils/locationDisplay";
import { formatTemperature } from "../utils/units";
import { getOutfitSlotLabel } from "../utils/outfitLabels";

export function TomorrowBriefScreen({
  state,
  wardrobeItems,
  styleGender,
  ageBand,
  fitPreference,
  selectedStyles,
  smartCareScenario,
  temperatureUnit,
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
  const weatherTone = getConditionColor(tomorrow.weather.current.condition, theme);
  const rainTone = getRainTone(tomorrow.summary.rainProbabilityPct, theme);
  const weatherHeadline = getTomorrowWeatherHeadline(tomorrow.summary.rainProbabilityPct, tomorrow.weather.current.condition);
  const umbrellaAction = getUmbrellaActionShort(umbrella.level);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <BackButton onPress={onGoBack} />
        <View style={styles.headerCopy}>
          <View style={styles.headerTitleRow}>
            <Image source={theme.name === "light" ? brandAssets.wordmarkLight : brandAssets.wordmarkDark} style={styles.wordmark} resizeMode="contain" />
            <View style={[styles.schedulePill, { backgroundColor: `${theme.gold}18`, borderColor: `${theme.gold}48` }]}>
              <View style={[styles.scheduleDot, { backgroundColor: theme.gold }]} />
              <Text style={[styles.scheduleText, { color: theme.gold }]}>21:00</Text>
            </View>
          </View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>내일 브리핑</Text>
          <Text style={[styles.headerMeta, { color: theme.muted }]} numberOfLines={1}>
            {tomorrow.dateLabel} · {getDisplayLocationName(tomorrow.weather.locationName)}
          </Text>
        </View>
      </View>

      <View style={[styles.weatherCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.weatherTopRow}>
          <View style={[styles.weatherIconFrame, { backgroundColor: `${weatherTone}18` }]}>
            <Image source={getConditionIcon(tomorrow.weather.current.condition)} style={[styles.weatherIcon, { tintColor: weatherTone }]} resizeMode="contain" />
          </View>
          <View style={styles.weatherCopy}>
            <Text style={[styles.weatherEyebrow, { color: weatherTone }]}>내일 날씨</Text>
            <Text style={[styles.weatherCondition, { color: theme.text }]} numberOfLines={1}>{weatherHeadline}</Text>
            <Text style={[styles.weatherRange, { color: theme.muted }]}>
              {formatTemperature(tomorrow.summary.minTempC, temperatureUnit)} ~ {formatTemperature(tomorrow.summary.maxTempC, temperatureUnit)}
            </Text>
          </View>
          <View style={styles.rainSummary}>
            <Text style={[styles.rainPct, { color: rainTone }]}>{tomorrow.summary.rainProbabilityPct}%</Text>
            <Text style={[styles.rainLabel, { color: theme.subtle }]}>비 올 확률</Text>
          </View>
        </View>
        <View style={styles.factRow} accessibilityLabel="내일 핵심 예보">
          <BriefFact icon={uiIconAssets.rain} label="예상 강수" value={tomorrow.summary.precipitationMm > 0 ? `${tomorrow.summary.precipitationMm.toFixed(1)}mm` : "비 없음"} color={theme.sky} theme={theme} />
          <BriefFact icon={uiIconAssets.wind} label="최대 바람" value={`${tomorrow.summary.windMs.toFixed(1)}m/s`} color={theme.clear} theme={theme} />
          <BriefFact icon={uiIconAssets.clock} label="비 시작" value={hourlyRain ? formatHour(hourlyRain.time) : "하루 종일"} color={theme.gold} theme={theme} />
        </View>
      </View>

      <View style={[styles.outfitCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.outfitTitleRow}>
          <View style={[styles.outfitTitleIcon, { backgroundColor: `${theme.gold}18` }]}>
            <Image source={uiIconAssets.shirt} style={[styles.outfitTitleIconImage, { tintColor: theme.gold }]} resizeMode="contain" />
          </View>
          <View style={styles.outfitTitleCopy}>
            <Text style={[styles.outfitEyebrow, { color: theme.gold }]}>내일 코디</Text>
            <Text style={[styles.outfitTitle, { color: theme.text }]}>이렇게 입으면 준비 끝</Text>
          </View>
          <Text style={[styles.matchPct, { color: theme.gold }]}>{outfit.matchPct}%</Text>
        </View>
        <View style={[styles.outfitHero, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
          <View style={[styles.outfitImageFrame, { backgroundColor: theme.card }]}>
            {outfitPreview?.imageUrl && outfitImageAssets[outfitPreview.imageUrl] ? (
              <Image source={outfitImageAssets[outfitPreview.imageUrl]} style={styles.outfitImage} resizeMode="contain" />
            ) : (
              <Image source={uiIconAssets.shirt} style={[styles.outfitFallbackIcon, { tintColor: theme.gold }]} resizeMode="contain" />
            )}
          </View>
          <View style={styles.outfitCopy}>
            <Text style={[styles.outfitDecision, { color: theme.text }]} numberOfLines={1}>{toFriendlyOutfitHeadline(outfitDecision)}</Text>
            <Text style={[styles.outfitReason, { color: theme.muted }]} numberOfLines={1}>{outfitReason}</Text>
          </View>
        </View>
        <View style={styles.outfitItems} accessibilityLabel="추천 코디 구성">
          {outfitItems.slice(0, 4).map(([slot, item]) => (
            <View key={slot} style={[styles.outfitItem, { backgroundColor: theme.cardMuted }]}>
              <View style={[styles.outfitMiniImageFrame, { backgroundColor: theme.card }]}>
                {item.imageUrl && outfitImageAssets[item.imageUrl] ? (
                  <Image source={outfitImageAssets[item.imageUrl]} style={styles.outfitMiniImage} resizeMode="contain" />
                ) : null}
              </View>
              <Text style={[styles.outfitSlot, { color: theme.gold }]} numberOfLines={1}>{getOutfitSlotLabel(slot)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.readyStrip, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
        <View style={[styles.umbrellaIconFrame, { backgroundColor: `${umbrella.level === "none" ? theme.clear : theme.sky}18` }]}>
          <Image source={uiIconAssets.umbrella} style={[styles.umbrellaIcon, { tintColor: umbrella.level === "none" ? theme.clear : theme.sky }]} resizeMode="contain" />
        </View>
        <View style={styles.umbrellaCopy}>
          <Text style={[styles.umbrellaTitle, { color: theme.text }]}>{umbrellaAction}</Text>
          <Text style={[styles.umbrellaBody, { color: theme.muted }]} numberOfLines={1}>{umbrella.reason}</Text>
        </View>
      </View>
    </View>
  );
}

function BriefFact({ icon, label, value, color, theme }: { icon: ImageSourcePropType; label: string; value: string; color: string; theme: ReturnType<typeof useAppTheme> }) {
  return (
    <View style={[styles.fact, { backgroundColor: theme.cardMuted }]} accessibilityLabel={`${label} ${value}`}>
      <Image source={icon} style={[styles.factIcon, { tintColor: color }]} resizeMode="contain" />
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

function getRainTone(rainProbabilityPct: number, theme: ReturnType<typeof useAppTheme>) {
  return rainProbabilityPct >= 60 ? theme.sky : rainProbabilityPct >= 30 ? theme.gold : theme.clear;
}

function getUmbrellaActionShort(level: ReturnType<typeof recommendUmbrella>["level"]) {
  if (level === "none") return "우산 없이 가볍게 출발";
  if (level === "notice") return "작은 우산 하나면 충분";
  if (level === "recommended") return "가방에 우산을 쏙";
  return "우산과 방수 아우터 챙겨요";
}

function getTomorrowWeatherHeadline(rainProbabilityPct: number, condition: string) {
  if (rainProbabilityPct >= 60) return "우산이 필요한 하루예요";
  if (rainProbabilityPct >= 30) return "가벼운 우산이 있으면 좋아요";
  if (condition === "clear") return "햇살 좋은 외출 날이에요";
  if (condition === "cloud") return "구름 사이로 편하게 나가요";
  if (condition === "dust") return "마스크 챙기면 더 편해요";
  return "날씨에 맞춰 가볍게 준비해요";
}

function toFriendlyOutfitHeadline(value: string) {
  if (/비|방수/u.test(value)) return "비 와도 산뜻하게 나가요";
  if (/추위|한파|두꺼운/u.test(value)) return "따뜻하게 챙겨 입어요";
  if (/더위|시원/u.test(value)) return "가볍고 시원하게 입어요";
  return "내일 날씨에 딱 맞는 조합";
}

function toTomorrowCopy(value: string) {
  return value.replaceAll("오늘", "내일");
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  wordmark: {
    width: 78,
    height: 16,
  },
  schedulePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  scheduleDot: {
    width: 5,
    height: 5,
    borderRadius: radius.pill,
  },
  scheduleText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
  },
  headerMeta: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  weatherCard: {
    gap: 8,
    padding: 10,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  weatherTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  weatherIconFrame: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
  },
  weatherIcon: {
    width: 30,
    height: 30,
  },
  weatherCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  weatherEyebrow: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  weatherCondition: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  weatherRange: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
  },
  rainSummary: {
    alignItems: "flex-end",
  },
  rainPct: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  rainLabel: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "800",
  },
  factRow: {
    flexDirection: "row",
    gap: 6,
  },
  fact: {
    flex: 1,
    minWidth: 0,
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 4,
    borderRadius: radius.sm,
  },
  factIcon: {
    width: 14,
    height: 14,
  },
  factValue: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  outfitCard: {
    gap: 7,
    padding: 10,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  outfitTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  outfitTitleIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  outfitTitleIconImage: {
    width: 16,
    height: 16,
  },
  outfitTitleCopy: {
    flex: 1,
    minWidth: 0,
    gap: 0,
  },
  outfitEyebrow: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
  },
  outfitTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  matchPct: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  outfitHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 7,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  outfitImageFrame: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    overflow: "hidden",
  },
  outfitImage: {
    width: 50,
    height: 50,
  },
  outfitFallbackIcon: {
    width: 26,
    height: 26,
  },
  outfitCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  outfitDecision: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  outfitReason: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
  },
  outfitItems: {
    flexDirection: "row",
    gap: 6,
  },
  outfitItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minHeight: 42,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  outfitMiniImageFrame: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  outfitMiniImage: {
    width: 22,
    height: 22,
  },
  outfitSlot: {
    maxWidth: "100%",
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "900",
  },
  readyStrip: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  umbrellaIconFrame: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  umbrellaIcon: {
    width: 18,
    height: 18,
  },
  umbrellaCopy: {
    flex: 1,
    minWidth: 0,
    gap: 0,
  },
  umbrellaTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  umbrellaBody: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
  },
});
