import React, { useEffect } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import { BackButton } from "../components/BackButton";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, semanticColor, spacing, type AppTheme } from "../theme/tokens";

export function UmbrellaScreen({ state, umbrellaReviewed, onReviewUmbrella, onGoBack, onOpenAlertSettings }: P0ScreenProps) {
  const theme = useAppTheme();
  const umbrella = state.umbrella;
  const rainBars = buildRainBars(state.weather);
  const peakWindow = getPeakRainWindow(rainBars);
  const peakRainProbability = getPeakRainProbability(state.weather);
  const windSpeed = state.weather.current.windMs;
  const umbrellaOptions = getUmbrellaOptions(umbrella.title, umbrella.level);
  const recommendedOption = umbrellaOptions.find((item) => item.recommended) ?? umbrellaOptions[0];

  useEffect(() => {
    if (!umbrellaReviewed) onReviewUmbrella();
  }, [umbrellaReviewed, onReviewUmbrella]);

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <BackButton onPress={onGoBack} />
          <Text style={[styles.title, { color: theme.text }]}>우산 추천</Text>
        </View>

        <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: getUmbrellaTone(umbrella.level, theme) }, cardShadow(theme)]}>
          <View style={[styles.heroIconFrame, { backgroundColor: `${getUmbrellaTone(umbrella.level, theme)}18` }]}>
            <Image source={uiIconAssets.umbrella} style={[styles.umbrellaIcon, { tintColor: getUmbrellaTone(umbrella.level, theme) }]} resizeMode="contain" />
          </View>
          <View style={styles.heroCopy}>
            <View style={styles.heroTopRow}>
              <Text style={[styles.heroKicker, { color: getUmbrellaTone(umbrella.level, theme) }]}>{getUmbrellaLevelLabel(umbrella.level)}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => onOpenAlertSettings("H4", "umbrella")}
                style={({ pressed }) => [
                  styles.alertLink,
                  {
                    backgroundColor: semanticColor(theme, "surfacePassive"),
                    borderColor: theme.border,
                    opacity: pressed ? 0.74 : 1,
                  },
                ]}
              >
                <Text style={[styles.alertLinkText, { color: theme.muted }]}>알림 기준</Text>
              </Pressable>
            </View>
            <Text style={[styles.heroTitle, { color: theme.text }]} numberOfLines={2}>{umbrella.title}</Text>
            <Text style={[styles.heroMeta, { color: theme.muted }]} numberOfLines={1}>{peakWindow} · {recommendedOption.title}</Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <MetricTile icon="clock" label="피크" value={peakWindow} theme={theme} tone={theme.sky} />
          <MetricTile icon="drop" label="확률" value={`${peakRainProbability}%`} theme={theme} tone={theme.sky} />
          <MetricTile icon="wind" label="바람" value={`초속 ${windSpeed.toFixed(0)}m`} theme={theme} tone={getWindTone(windSpeed, theme)} />
        </View>

        <Panel title="비 신호" theme={theme}>
          <View style={styles.chart}>
            <View style={styles.chartBars}>
              {rainBars.map((hour) => {
                const probability = Math.max(8, Math.min(hour.rainProbabilityPct, 100));
                return (
                  <View key={hour.time} style={styles.barColumn}>
                    <View style={[styles.barTrack, { backgroundColor: theme.cardStrong }]}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${probability}%`,
                            backgroundColor: hour.rainProbabilityPct >= 70 ? theme.sky : theme.cardSoft,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barValue, { color: hour.rainProbabilityPct >= 70 ? theme.sky : theme.subtle }]}>{hour.rainProbabilityPct}%</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.chartTimes}>
              <Text style={[styles.timeLabel, { color: theme.subtle }]}>{formatHourLabel(rainBars[0]?.time ?? "15:00")}</Text>
              <Text style={[styles.timeLabel, { color: theme.subtle }]}>{formatHourLabel(rainBars[rainBars.length - 1]?.time ?? "21:00")}</Text>
            </View>
          </View>
        </Panel>

        <Panel title="우산 종류 비교" theme={theme}>
          <View style={styles.optionGrid}>
            {umbrellaOptions.map((item) => (
              <View
                key={item.title}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: item.recommended ? theme.cardStrong : semanticColor(theme, "surfacePassive"),
                    borderColor: item.recommended ? theme.sky : theme.border,
                  },
                ]}
              >
                <View style={styles.optionIcon}>
                  <Image
                    source={uiIconAssets.umbrella}
                    style={[styles.smallUmbrellaIcon, { tintColor: item.recommended ? theme.sky : theme.subtle }]}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.optionCopy}>
                  <View style={styles.optionTitleRow}>
                    <Text style={[styles.optionTitle, { color: theme.text }]}>{item.title}</Text>
                  </View>
                  <View style={[styles.optionSignal, { backgroundColor: item.recommended ? theme.sky : theme.border }]} />
                </View>
              </View>
            ))}
          </View>
        </Panel>

      </ScrollView>
    </View>
  );
}

function Panel({ title, theme, children }: { title: string; theme: AppTheme; children: React.ReactNode }) {
  return (
    <View style={[styles.panel, { backgroundColor: theme.card }, cardShadow(theme)]}>
      <Text style={[styles.panelTitle, { color: theme.muted }]}>{title}</Text>
      {children}
    </View>
  );
}

function MetricTile({ icon, label, value, theme, tone }: { icon: "clock" | "drop" | "wind"; label: string; value: string; theme: AppTheme; tone: string }) {
  return (
    <View style={[styles.metricTile, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <ReasonGlyph type={icon} color={tone} />
      <Text style={[styles.metricLabel, { color: theme.subtle }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: theme.text }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function ReasonGlyph({ type, color }: { type: "clock" | "drop" | "wind"; color: string }) {
  if (type === "clock") {
    return (
      <View style={styles.clockGlyph} accessibilityElementsHidden>
        <View style={[styles.clockFace, { borderColor: color }]} />
        <View style={[styles.clockHandHour, { backgroundColor: color }]} />
        <View style={[styles.clockHandMinute, { backgroundColor: color }]} />
      </View>
    );
  }
  if (type === "drop") {
    return (
      <View style={styles.dropGlyph} accessibilityElementsHidden>
        <View style={[styles.dropShape, { borderColor: color }]} />
      </View>
    );
  }
  return (
    <View style={styles.windGlyph} accessibilityElementsHidden>
      <View style={[styles.windLine, styles.windLineA, { backgroundColor: color }]} />
      <View style={[styles.windLine, styles.windLineB, { backgroundColor: color }]} />
      <View style={[styles.windLine, styles.windLineC, { backgroundColor: color }]} />
    </View>
  );
}

function getUmbrellaLevelLabel(level: P0ScreenProps["state"]["umbrella"]["level"]) {
  if (level === "required") return "필수";
  if (level === "recommended") return "추천";
  if (level === "notice") return "가벼운 대비";
  return "불필요";
}

function getUmbrellaOptions(title: string, level: P0ScreenProps["state"]["umbrella"]["level"]) {
  const recommendedTitle = getRecommendedOptionTitle(title, level);
  const options = [
    { title: "우산 없이 이동", meta: "강수 낮음", key: "none" },
    { title: "소형 우산", meta: "약한 비·휴대성", key: "small" },
    { title: "3단 우산", meta: "보통 비·일상 외출", key: "compact" },
    { title: "큰 3단 우산", meta: "긴 비·넓은 커버", key: "large-compact" },
    { title: "장우산", meta: "강한 비·장시간", key: "long" },
    { title: "우비/방수 아우터", meta: "바람 강함", key: "rainwear" },
  ];
  return options.map((item) => ({
    title: item.title,
    meta: item.title === recommendedTitle ? `추천 · ${item.meta}` : item.meta,
    recommended: item.title === recommendedTitle,
  }));
}

function getRecommendedOptionTitle(title: string, level: P0ScreenProps["state"]["umbrella"]["level"]) {
  if (level === "none") return "우산 없이 이동";
  if (title.includes("우비") || title.includes("방수")) return "우비/방수 아우터";
  if (title.includes("장우산")) return "장우산";
  if (title.includes("큰 3단")) return "큰 3단 우산";
  if (title.includes("3단")) return "3단 우산";
  if (title.includes("소형")) return "소형 우산";
  return level === "required" ? "장우산" : "소형 우산";
}

function getUmbrellaTone(level: P0ScreenProps["state"]["umbrella"]["level"], theme: AppTheme) {
  if (level === "required") return theme.gold;
  if (level === "recommended") return theme.sky;
  if (level === "notice") return theme.clear;
  return theme.subtle;
}

function getWindTone(windSpeed: number, theme: AppTheme) {
  if (windSpeed >= 8) return theme.gold;
  if (windSpeed >= 4) return theme.sky;
  return theme.clear;
}

function buildRainBars(weather: P0ScreenProps["state"]["weather"]) {
  if (weather.hourly.length > 0) return weather.hourly.slice(0, 6);
  return [
    {
      time: weather.observedAt,
      tempC: weather.current.tempC,
      rainProbabilityPct: weather.current.rainProbabilityPct,
      precipitationMm: weather.current.precipitationMm,
      windMs: weather.current.windMs,
      condition: weather.current.condition,
    },
  ];
}

function getPeakRainWindow(items: P0ScreenProps["state"]["weather"]["hourly"]) {
  if (items.length === 0) return "현재";
  const peakIndex = items.reduce((bestIndex, item, index) => (item.rainProbabilityPct > items[bestIndex].rainProbabilityPct ? index : bestIndex), 0);
  const start = items[Math.max(0, peakIndex - 1)]?.time ?? items[peakIndex]?.time ?? "";
  const end = items[Math.min(items.length - 1, peakIndex + 1)]?.time ?? start;
  if (!start || start === end) return formatHour(start);
  return `${formatHour(start)}~${formatHour(end)}`;
}

function getPeakRainProbability(weather: P0ScreenProps["state"]["weather"]) {
  return Math.round(Math.max(weather.current.rainProbabilityPct, ...weather.hourly.map((item) => item.rainProbabilityPct)));
}

function formatHour(value: string) {
  const match = value.match(/T(\d{2}):\d{2}/);
  if (!value) return "현재";
  return match ? `${Number(match[1])}시` : `${Number(value.slice(0, 2))}시`;
}

function formatHourLabel(value: string) {
  return formatHour(value);
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    minHeight: "100%",
  },
  atmosphere: {
    position: "absolute",
    left: -32,
    right: -32,
    bottom: -110,
    height: 280,
    opacity: 0.72,
    borderTopLeftRadius: 160,
    borderTopRightRadius: 160,
  },
  header: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  title: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "900",
    letterSpacing: 0,
  },
  heroCard: {
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: 16,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
  },
  heroIconFrame: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
  },
  umbrellaIcon: {
    width: 34,
    height: 34,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  heroKicker: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    letterSpacing: 0,
  },
  alertLink: {
    minHeight: 26,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  alertLinkText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 0,
  },
  heroTitle: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900",
    letterSpacing: 0,
  },
  heroMeta: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
    letterSpacing: 0,
  },
  metricRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  metricTile: {
    flex: 1,
    minHeight: 70,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  metricLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  metricValue: {
    maxWidth: "100%",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
    letterSpacing: 0,
  },
  panel: {
    gap: 8,
    padding: 12,
    borderRadius: radius.lg,
  },
  panelTitle: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    letterSpacing: 0,
  },
  clockGlyph: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  clockFace: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.6,
  },
  clockHandHour: {
    position: "absolute",
    width: 1.6,
    height: 4,
    top: 4,
    borderRadius: 2,
  },
  clockHandMinute: {
    position: "absolute",
    width: 4,
    height: 1.6,
    top: 7,
    left: 8,
    borderRadius: 2,
  },
  dropGlyph: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dropShape: {
    width: 11,
    height: 11,
    borderWidth: 1.6,
    borderRadius: 6,
    borderTopLeftRadius: 0,
    transform: [{ rotate: "45deg" }],
  },
  windGlyph: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  windLine: {
    position: "absolute",
    height: 1.6,
    borderRadius: 2,
  },
  windLineA: {
    width: 13,
    top: 3,
  },
  windLineB: {
    width: 9,
    top: 7,
  },
  windLineC: {
    width: 11,
    top: 11,
  },
  chart: {
    gap: spacing.xs,
  },
  chartBars: {
    height: 58,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  barTrack: {
    width: "100%",
    height: 42,
    justifyContent: "flex-end",
    overflow: "hidden",
    borderRadius: radius.xs,
  },
  barFill: {
    width: "100%",
    borderRadius: radius.xs,
  },
  barValue: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 0,
  },
  chartTimes: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },
  optionCard: {
    width: "31.5%",
    minHeight: 74,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    padding: 7,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  optionIcon: {
    width: 26,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  optionCopy: {
    alignItems: "center",
    gap: 5,
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  optionTitle: {
    textAlign: "center",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  optionSignal: {
    width: 24,
    height: 4,
    borderRadius: radius.pill,
  },
  smallUmbrellaIcon: {
    width: 21,
    height: 21,
  },
});
