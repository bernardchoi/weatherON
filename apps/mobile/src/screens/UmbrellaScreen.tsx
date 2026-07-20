import React, { useEffect } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import { BackButton } from "../components/BackButton";
import { CompletionStatus } from "../components/CompletionStatus";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, semanticColor, spacing, type AppTheme } from "../theme/tokens";

export function UmbrellaScreen({ state, umbrellaReviewed, onReviewUmbrella, onGoBack, onOpenAlertSettings }: P0ScreenProps) {
  const theme = useAppTheme();
  const umbrella = state.umbrella;
  const rainBars = buildRainBars(state.weather);
  const peakWindow = getPeakRainWindow(rainBars);
  const peakAmount = getPeakRainAmount(state.weather);
  const peakRainProbability = getPeakRainProbability(state.weather);
  const windSpeed = state.weather.current.windMs;
  const umbrellaOptions = getUmbrellaOptions(umbrella.title, umbrella.level);

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

        <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.sky }, cardShadow(theme)]}>
          <Image source={uiIconAssets.umbrella} style={[styles.umbrellaIcon, { tintColor: theme.text }]} resizeMode="contain" />
          <Text style={[styles.heroTitle, { color: theme.text }]}>{umbrella.title}</Text>
          <View style={styles.chipRow}>
            <InfoChip label={getUmbrellaLevelLabel(umbrella.level)} theme={theme} />
            <InfoChip label={getRainIntensityLabel(peakAmount)} theme={theme} />
            <InfoChip label={getWindLabel(windSpeed)} theme={theme} />
          </View>
        </View>

        <CompletionStatus
          visible={umbrellaReviewed}
          title="우산 준비 완료"
          message={`${peakWindow} 출발 전 알림 시간을 설정하면 놓치지 않아요`}
        />

        <Panel title="추천 이유" theme={theme}>
          <ReasonRow icon="clock" text={`${peakWindow} 강수 가능성 최대 ${peakRainProbability}%`} theme={theme} />
          <ReasonRow icon="drop" text={`시간당 최대 ${peakAmount}mm · ${getRainIntensityLabel(peakAmount)}`} theme={theme} />
          <ReasonRow icon="wind" text={`풍속 초속 ${windSpeed.toFixed(0)}m · ${umbrella.reason}`} theme={theme} />
        </Panel>

        <Panel title="시간대별 강수확률" theme={theme}>
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
                    <Text style={[styles.barValue, { color: theme.subtle }]}>{hour.rainProbabilityPct}%</Text>
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
                    {item.recommended ? <Text style={[styles.recommendMark, { color: theme.sky }]}>추천</Text> : null}
                  </View>
                  <Text style={[styles.optionMeta, { color: item.recommended ? theme.sky : theme.subtle }]}>{item.meta}</Text>
                </View>
              </View>
            ))}
          </View>
        </Panel>

        <View style={[styles.statePanel, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}>
          <Text style={[styles.stateLabel, { color: theme.gold }]}>UMBRELLA</Text>
          <Text style={[styles.stateText, { color: theme.muted }]}>{umbrella.title} · {peakWindow} · {umbrella.reason}</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.ctaWrap} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          onPress={() => onOpenAlertSettings("H4", "umbrella")}
          style={({ pressed }) => [styles.cta, { backgroundColor: theme.gold, opacity: pressed ? 0.86 : 1 }]}
        >
          <Text style={[styles.ctaText, { color: theme.onAccent }]}>우산 알림 시간 설정</Text>
        </Pressable>
      </View>
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

function InfoChip({ label, theme }: { label: string; theme: AppTheme }) {
  return (
    <View style={[styles.chip, { backgroundColor: theme.cardStrong }]}>
      <Text style={[styles.chipText, { color: theme.text }]}>{label}</Text>
    </View>
  );
}

function ReasonRow({ icon, text, theme }: { icon: "clock" | "drop" | "wind"; text: string; theme: AppTheme }) {
  return (
    <View style={styles.reasonRow}>
      <View style={styles.reasonIconBox}>
        <ReasonGlyph type={icon} color={theme.sky} />
      </View>
      <Text style={[styles.reasonText, { color: theme.text }]}>{text}</Text>
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

function getRainIntensityLabel(peakAmount: string) {
  const amount = Number(peakAmount);
  if (amount >= 10) return "강수량 강함";
  if (amount >= 1) return "강수량 보통";
  return "강수량 약함";
}

function getWindLabel(windSpeed: number) {
  if (windSpeed >= 8) return "바람 강함";
  if (windSpeed >= 4) return "바람 보통";
  return "바람 약함";
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

function buildRainBars(weather: P0ScreenProps["state"]["weather"]) {
  if (weather.hourly.length > 0) return weather.hourly.slice(0, 7);
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

function getPeakRainAmount(weather: P0ScreenProps["state"]["weather"]) {
  return Math.max(weather.current.precipitationMm, ...weather.hourly.map((item) => item.precipitationMm)).toFixed(1).replace(/\.0$/, "");
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
    gap: 9,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 74,
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
    minHeight: 128,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderLeftWidth: 2,
  },
  umbrellaIcon: {
    width: 42,
    height: 42,
  },
  heroTitle: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
    letterSpacing: 0,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
  },
  chip: {
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  chipText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 0,
  },
  panel: {
    gap: 8,
    padding: 14,
    borderRadius: radius.lg,
  },
  panelTitle: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    letterSpacing: 0,
  },
  reasonRow: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  reasonIconBox: {
    width: 16,
    alignItems: "center",
    justifyContent: "center",
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
  reasonText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
    letterSpacing: 0,
  },
  chart: {
    gap: spacing.xs,
  },
  chartBars: {
    height: 66,
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
    height: 50,
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
    gap: spacing.sm,
  },
  optionCard: {
    width: "48%",
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  optionIcon: {
    width: 22,
    alignItems: "center",
  },
  optionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  optionTitle: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
    letterSpacing: 0,
  },
  recommendMark: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
  },
  optionMeta: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 0,
  },
  smallUmbrellaIcon: {
    width: 20,
    height: 20,
  },
  statePanel: {
    gap: 2,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  stateLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  stateText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  bottomSpacer: {
    height: 64,
  },
  ctaWrap: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 10,
  },
  cta: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  ctaText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    letterSpacing: 0,
  },
});
