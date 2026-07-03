import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

export function RainTimelineScreen({ state, onGoBack, onNavigate }: P0ScreenProps) {
  const theme = useAppTheme();
  const [rainEndAlertEnabled, setRainEndAlertEnabled] = useState(false);
  const rainBars = useMemo(() => buildRainBars(state.weather), [state.weather]);
  const chartColors = getRainChartColors(theme);
  const toggleColors = getRainToggleColors(theme, rainEndAlertEnabled);
  const peakAmount = getPeakRainAmount(rainBars);
  const rainWindow = getRainWindow(rainBars);
  const rainStart = rainWindow.start;
  const rainEnd = rainWindow.end;
  const umbrella = state.umbrella;

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <Pressable accessibilityLabel="뒤로" accessibilityRole="button" onPress={onGoBack} style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.backGlyph, { color: theme.text }]}>‹</Text>
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>강수 타임라인</Text>
        </View>

        <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.sky }]}>
          <View style={styles.heroTop}>
            <View style={[styles.rainIconFrame, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
              <Image source={uiIconAssets.rain} style={[styles.rainIconImage, { tintColor: theme.sky }]} resizeMode="contain" />
            </View>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroTitle, { color: theme.text }]}>{rainWindow.title}</Text>
              <Text style={[styles.heroMeta, { color: theme.muted }]}>시간당 최대 {peakAmount}mm · {rainWindow.body}</Text>
            </View>
          </View>
          <View style={styles.rainDecisionStrip}>
            <RainFact icon={uiIconAssets.clock} label="시작" value={rainStart} color={theme.sky} theme={theme} />
            <RainFact icon={uiIconAssets.drop} label="최대" value={`${peakAmount}mm`} color={theme.warm} theme={theme} />
            <RainFact icon={uiIconAssets.check} label="그침" value={rainEnd} color={theme.clear} theme={theme} />
          </View>
        </View>

        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: rainEndAlertEnabled }}
          onPress={() => setRainEndAlertEnabled((value) => !value)}
          style={[styles.togglePanel, { backgroundColor: toggleColors.panel, borderColor: toggleColors.border }]}
        >
          <View style={styles.toggleCopy}>
            <Text style={[styles.toggleLabel, { color: toggleColors.accent }]}>그침 알림</Text>
            <Text style={[styles.toggleTitle, { color: theme.text }]}>비 그치면 알려줘</Text>
            <Text style={[styles.toggleMeta, { color: theme.muted }]}>{rainEnd} 전후로 그침 알림을 받을지 선택</Text>
          </View>
          <View style={[styles.toggleTrack, { backgroundColor: toggleColors.track, borderColor: toggleColors.trackBorder }]}>
            <View style={[styles.toggleKnob, { backgroundColor: toggleColors.knob, marginLeft: rainEndAlertEnabled ? 22 : 3 }]} />
          </View>
        </Pressable>

        <Panel title="30분 단위 강수량" theme={theme}>
          <View style={styles.chart}>
            <View style={styles.amountBars}>
              {rainBars.map((item) => {
                const height = Math.max(6, Math.min((item.amount / 4.2) * 100, 100));
                return (
                  <View key={`${item.time}:${item.amount}`} style={styles.amountColumn}>
                    <Text style={[styles.amountLabel, { color: item.amount >= 3 ? theme.text : theme.subtle }]}>{item.amount > 0 ? trimAmount(item.amount) : ""}</Text>
                    <View
                      style={[
                        styles.amountBar,
                        {
                          height: `${height}%`,
                          backgroundColor: getRainBarColor(item.amount, chartColors),
                          borderColor: chartColors.barBorder,
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </View>
            <View style={styles.timeAxis}>
              {getAxisLabels(rainBars).map((label) => (
                <Text key={label} style={[styles.axisText, { color: theme.subtle }]}>{label}</Text>
              ))}
            </View>
            <View style={styles.legend}>
              <LegendSwatch label="약함" color={chartColors.weak} theme={theme} />
              <LegendSwatch label="보통" color={chartColors.medium} theme={theme} />
              <LegendSwatch label="강함" color={chartColors.strong} theme={theme} />
            </View>
          </View>
        </Panel>

        <Panel title="외출 가이드" theme={theme} accentColor={theme.clear}>
          <GuideRow icon={uiIconAssets.check} text={getDepartureGuideText(rainStart, umbrella)} color={theme.clear} theme={theme} />
          <GuideRow icon={uiIconAssets.umbrella} text={getUmbrellaGuideText(rainStart, umbrella)} color={theme.sky} theme={theme} />
          <GuideRow icon={uiIconAssets.clock} text={getRainEndGuideText(rainEnd)} color={theme.subtle} theme={theme} />
        </Panel>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`우산 추천 보기, ${umbrella.title}`}
          onPress={() => onNavigate("H4")}
          style={[styles.umbrellaCard, { backgroundColor: theme.cardStrong, borderColor: getUmbrellaCardColor(umbrella.level, theme) }]}
        >
          <View style={[styles.umbrellaIconBox, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
            <Image source={uiIconAssets.umbrella} style={[styles.umbrellaIcon, { tintColor: getUmbrellaCardColor(umbrella.level, theme) }]} resizeMode="contain" />
          </View>
          <View style={styles.umbrellaCopy}>
            <Text style={[styles.umbrellaLabel, { color: getUmbrellaCardColor(umbrella.level, theme) }]}>우산 추천</Text>
            <Text style={[styles.umbrellaTitle, { color: theme.text }]}>{umbrella.title}</Text>
            <Text style={[styles.umbrellaBody, { color: theme.muted }]} numberOfLines={2}>{umbrella.reason}</Text>
          </View>
          <Text style={[styles.umbrellaChevron, { color: theme.subtle }]}>›</Text>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function RainFact({ icon, label, value, color, theme }: { icon: number; label: string; value: string; color: string; theme: AppTheme }) {
  return (
    <View style={[styles.rainFact, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
      <View style={styles.rainFactTop}>
        <Image source={icon} style={[styles.rainFactIcon, { tintColor: color }]} resizeMode="contain" />
        <Text style={[styles.rainFactLabel, { color }]}>{label}</Text>
      </View>
      <Text style={[styles.rainFactValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function Panel({
  title,
  theme,
  accentColor,
  children,
}: {
  title: string;
  theme: AppTheme;
  accentColor?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.panel, { backgroundColor: theme.card, borderLeftColor: accentColor ?? "transparent" }, accentColor ? styles.panelAccent : null]}>
      <Text style={[styles.panelTitle, { color: theme.muted }]}>{title}</Text>
      {children}
    </View>
  );
}

function GuideRow({ icon, text, color, theme }: { icon: number; text: string; color: string; theme: AppTheme }) {
  return (
    <View style={styles.guideRow}>
      <Image source={icon} style={[styles.guideIcon, { tintColor: color }]} resizeMode="contain" />
      <Text style={[styles.guideText, { color: theme.text }]}>{text}</Text>
    </View>
  );
}

function LegendSwatch({ label, color, theme }: { label: string; color: string; theme: AppTheme }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendBox, { backgroundColor: color }]} />
      <Text style={[styles.legendText, { color: theme.subtle }]}>{label}</Text>
    </View>
  );
}

function getRainChartColors(theme: AppTheme) {
  if (theme.name === "light") {
    return {
      weak: "#B8D6EA",
      medium: "#4F95C8",
      strong: "#0F6FA8",
      barBorder: "rgba(20,32,51,0.12)",
    };
  }
  return {
    weak: "rgba(74,163,223,0.28)",
    medium: "#4AA3DF",
    strong: "#67E8D0",
    barBorder: "rgba(248,251,255,0.12)",
  };
}

function getRainBarColor(amount: number, colors: ReturnType<typeof getRainChartColors>) {
  if (amount >= 3) return colors.strong;
  if (amount >= 1) return colors.medium;
  return colors.weak;
}

function getRainToggleColors(theme: AppTheme, enabled: boolean) {
  if (theme.name === "light") {
    return {
      panel: enabled ? "#E8F3FB" : "#FFFFFF",
      border: enabled ? "#237BBD" : "rgba(31,78,121,0.22)",
      track: enabled ? "#237BBD" : "#D7EAF7",
      trackBorder: enabled ? "#237BBD" : "rgba(31,78,121,0.24)",
      knob: enabled ? "#FFFFFF" : "#237BBD",
      accent: "#237BBD",
    };
  }
  return {
    panel: enabled ? "rgba(74,163,223,0.18)" : theme.card,
    border: enabled ? theme.sky : theme.border,
    track: enabled ? theme.sky : theme.cardMuted,
    trackBorder: enabled ? theme.sky : theme.border,
    knob: enabled ? theme.text : theme.muted,
    accent: theme.sky,
  };
}

type RainBar = {
  time: string;
  amount: number;
};

function buildRainBars(weather: P0ScreenProps["state"]["weather"]): RainBar[] {
  if (weather.hourly.length > 0) {
    return weather.hourly.slice(0, 8).map((item) => ({ time: item.time, amount: item.precipitationMm }));
  }
  return [{ time: weather.observedAt, amount: weather.current.precipitationMm }];
}

function getPeakRainAmount(items: RainBar[]) {
  return Math.max(0, ...items.map((item) => item.amount)).toFixed(1).replace(/\.0$/, "");
}

function trimAmount(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getRainWindow(items: RainBar[]) {
  const rainyItems = items.filter((item) => item.amount > 0);
  if (rainyItems.length === 0) {
    return {
      start: "대기",
      end: "대기",
      title: "뚜렷한 비 예보 없음",
      body: "강수 신호 낮음",
    };
  }
  const start = formatTimeLabel(rainyItems[0].time);
  const end = formatTimeLabel(rainyItems[rainyItems.length - 1].time);
  return {
    start,
    end,
    title: start === end ? `${start} 전후 비 가능` : `${start} 시작, ${end} 완화`,
    body: end === "대기" ? "강수 신호 낮음" : `${end} 이후 외출 부담 낮음`,
  };
}

function getAxisLabels(items: RainBar[]) {
  if (items.length <= 1) return [formatTimeLabel(items[0]?.time ?? "")];
  const middle = items[Math.floor(items.length / 2)]?.time;
  const labels = [items[0]?.time, middle, items[items.length - 1]?.time]
    .filter((value): value is string => Boolean(value))
    .map(formatTimeLabel);
  return Array.from(new Set(labels));
}

function formatTimeLabel(value: string) {
  const match = value.match(/T(\d{2}):(\d{2})/);
  if (match) return `${match[1]}:${match[2]}`;
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return "현재";
}

function getUmbrellaCardColor(level: P0ScreenProps["state"]["umbrella"]["level"], theme: AppTheme) {
  if (level === "required") return theme.warm;
  if (level === "recommended") return theme.sky;
  if (level === "notice") return theme.gold;
  return theme.clear;
}

function getUmbrellaGuideText(start: string, umbrella: P0ScreenProps["state"]["umbrella"]) {
  if (umbrella.level === "none") return "우산 없이 이동 가능";
  if (start === "대기") return umbrella.title;
  return `${start} 이후 외출 시 ${umbrella.title}`;
}

function getDepartureGuideText(start: string, umbrella: P0ScreenProps["state"]["umbrella"]) {
  if (umbrella.level === "none") return "현재 강수 신호 낮음";
  if (start === "대기") return "외출 전 최신 강수 확인";
  return `${start} 전 이동 여유 확인`;
}

function getRainEndGuideText(end: string) {
  if (end === "대기") return "강수 신호 낮음";
  return `${end} 이후 강수 완화 예상`;
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.sm,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 96,
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
  title: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: 0,
  },
  heroCard: {
    minHeight: 122,
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderLeftWidth: 2,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  rainIconFrame: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  rainIconImage: {
    width: 27,
    height: 27,
  },
  heroTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: 0,
  },
  heroMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  rainDecisionStrip: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  rainFact: {
    flex: 1,
    minHeight: 50,
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  rainFactTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  rainFactIcon: {
    width: 13,
    height: 13,
  },
  rainFactLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  rainFactValue: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  panel: {
    gap: spacing.sm,
    padding: 15,
    borderRadius: radius.lg,
    borderLeftWidth: 0,
  },
  panelAccent: {
    borderLeftWidth: 2,
  },
  panelTitle: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    letterSpacing: 0,
  },
  chart: {
    gap: 6,
  },
  amountBars: {
    height: 94,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 5,
  },
  amountColumn: {
    flex: 1,
    height: 88,
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 3,
  },
  amountLabel: {
    height: 12,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 0,
  },
  amountBar: {
    width: "100%",
    minHeight: 5,
    borderTopLeftRadius: radius.xs,
    borderTopRightRadius: radius.xs,
    borderWidth: 1,
  },
  timeAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  axisText: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "800",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "800",
  },
  guideRow: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  guideIcon: {
    width: 14,
    height: 14,
  },
  guideText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800",
    letterSpacing: 0,
  },
  umbrellaCard: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  umbrellaIconBox: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  umbrellaIcon: {
    width: 24,
    height: 24,
  },
  umbrellaCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  umbrellaLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  umbrellaTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
    letterSpacing: 0,
  },
  umbrellaBody: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    letterSpacing: 0,
  },
  umbrellaChevron: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
  },
  togglePanel: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: 16,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  toggleCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  toggleTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
    letterSpacing: 0,
  },
  toggleLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  toggleMeta: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  toggleTrack: {
    width: 48,
    height: 28,
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
  },
  bottomSpacer: {
    height: 12,
  },
});
