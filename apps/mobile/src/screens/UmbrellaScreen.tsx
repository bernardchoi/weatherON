import React, { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

export function UmbrellaScreen({ state, umbrellaReviewed, onReviewUmbrella, onNavigate, onOpenAlertSettings }: P0ScreenProps) {
  const theme = useAppTheme();
  const usesMockupRainBars = state.weather.hourly.length < 7;
  const rainBars = buildRainBars(state.weather.hourly);
  const peakWindow = usesMockupRainBars ? "18시~21시" : getPeakRainWindow(state.weather.hourly);
  const peakAmount = usesMockupRainBars ? "4" : getPeakRainAmount(state.weather.hourly);
  const windSpeed = state.weather.current.windMs;

  useEffect(() => {
    if (!umbrellaReviewed) onReviewUmbrella();
  }, [umbrellaReviewed, onReviewUmbrella]);

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => onNavigate("H1")} style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.backGlyph, { color: theme.text }]}>‹</Text>
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>우산 추천</Text>
        </View>

        <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.sky }]}>
          <UmbrellaGlyph color={theme.text} />
          <Text style={[styles.heroTitle, { color: theme.text }]}>오늘은 3단 우산</Text>
          <View style={styles.chipRow}>
            <InfoChip label={getRainIntensityLabel(peakAmount)} theme={theme} />
            <InfoChip label={getWindLabel(windSpeed)} theme={theme} />
            <InfoChip label="휴대성 우선" theme={theme} />
          </View>
        </View>

        <Panel title="추천 이유" theme={theme}>
          <ReasonRow icon="◷" text={`${peakWindow} 비 예보`} theme={theme} />
          <ReasonRow icon="⌁" text={`시간당 ${peakAmount}mm · 보통 강도`} theme={theme} />
          <ReasonRow icon="≋" text={`풍속 초속 ${windSpeed.toFixed(0)}m - 3단 우산으로 충분`} theme={theme} />
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
                            backgroundColor: hour.rainProbabilityPct >= 70 ? "#51ACE6" : theme.cardSoft,
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
            {getUmbrellaOptions().map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item.title}
                onPress={() => onNavigate(item.recommended ? "H5" : "M2")}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: item.recommended ? theme.cardStrong : "rgba(16,36,63,0.34)",
                    borderColor: item.recommended ? theme.sky : theme.border,
                  },
                ]}
              >
                <View style={styles.optionIcon}>
                  <SmallUmbrellaGlyph color={item.recommended ? theme.sky : theme.subtle} />
                </View>
                <View style={styles.optionCopy}>
                  <View style={styles.optionTitleRow}>
                    <Text style={[styles.optionTitle, { color: theme.text }]}>{item.title}</Text>
                    {item.recommended ? <Text style={[styles.recommendMark, { color: theme.sky }]}>추천</Text> : null}
                  </View>
                  <Text style={[styles.optionMeta, { color: item.recommended ? theme.sky : theme.subtle }]}>{item.meta}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Panel>

        <View style={[styles.statePanel, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
          <Text style={[styles.stateLabel, { color: theme.gold }]}>UMBRELLA</Text>
          <Text style={[styles.stateText, { color: theme.muted }]}>3단 우산 추천 · {peakWindow} 강수 · 알림 설정 전</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.ctaWrap} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          onPress={() => onOpenAlertSettings("H4", "umbrella")}
          style={({ pressed }) => [styles.cta, { backgroundColor: pressed ? "#F2A92E" : theme.gold }]}
        >
          <Text style={[styles.ctaText, { color: theme.onAccent }]}>우산 알림 시간 설정</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Panel({ title, theme, children }: { title: string; theme: AppTheme; children: React.ReactNode }) {
  return (
    <View style={[styles.panel, { backgroundColor: theme.card }]}>
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

function ReasonRow({ icon, text, theme }: { icon: string; text: string; theme: AppTheme }) {
  return (
    <View style={styles.reasonRow}>
      <Text style={[styles.reasonIcon, { color: theme.sky }]}>{icon}</Text>
      <Text style={[styles.reasonText, { color: theme.text }]}>{text}</Text>
    </View>
  );
}

function UmbrellaGlyph({ color }: { color: string }) {
  return (
    <View style={styles.umbrellaGlyph} accessibilityElementsHidden>
      <View style={[styles.umbrellaCanopy, { borderColor: color }]} />
      <View style={[styles.umbrellaStem, { backgroundColor: color }]} />
      <View style={[styles.umbrellaHook, { borderColor: color }]} />
    </View>
  );
}

function SmallUmbrellaGlyph({ color }: { color: string }) {
  return (
    <View style={styles.smallGlyph} accessibilityElementsHidden>
      <View style={[styles.smallCanopy, { borderColor: color }]} />
      <View style={[styles.smallStem, { backgroundColor: color }]} />
      <View style={[styles.smallHook, { borderColor: color }]} />
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

function getUmbrellaOptions() {
  return [
    { title: "1단 장우산", meta: "강풍·장시간", recommended: false },
    { title: "2단 우산", meta: "균형·범용", recommended: false },
    { title: "3단 우산", meta: "추천 · 휴대성·보통강도", recommended: true },
    { title: "장우산", meta: "폭우·전신 커버", recommended: false },
  ];
}

function buildRainBars(hourly: P0ScreenProps["state"]["weather"]["hourly"]) {
  if (hourly.length >= 7) return hourly.slice(0, 7);
  const fallback = [
    { time: "15:00", rainProbabilityPct: 10, precipitationMm: 0.2 },
    { time: "16:00", rainProbabilityPct: 15, precipitationMm: 0.5 },
    { time: "17:00", rainProbabilityPct: 40, precipitationMm: 1.8 },
    { time: "18:00", rainProbabilityPct: 80, precipitationMm: 3.5 },
    { time: "19:00", rainProbabilityPct: 85, precipitationMm: 4.0 },
    { time: "20:00", rainProbabilityPct: 60, precipitationMm: 2.5 },
    { time: "21:00", rainProbabilityPct: 20, precipitationMm: 1.0 },
  ];
  return fallback;
}

function getPeakRainWindow(hourly: P0ScreenProps["state"]["weather"]["hourly"]) {
  const peakIndex = hourly.reduce((bestIndex, item, index) => (item.rainProbabilityPct > hourly[bestIndex].rainProbabilityPct ? index : bestIndex), 0);
  const start = hourly[Math.max(0, peakIndex - 1)]?.time ?? hourly[peakIndex]?.time ?? "18:00";
  const end = hourly[Math.min(hourly.length - 1, peakIndex + 1)]?.time ?? "21:00";
  return `${formatHour(start)}~${formatHour(end)}`;
}

function getPeakRainAmount(hourly: P0ScreenProps["state"]["weather"]["hourly"]) {
  return Math.max(...hourly.map((item) => item.precipitationMm)).toFixed(0);
}

function formatHour(value: string) {
  const match = value.match(/T(\d{2}):\d{2}/);
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
  umbrellaGlyph: {
    width: 46,
    height: 34,
    alignItems: "center",
  },
  umbrellaCanopy: {
    position: "absolute",
    top: 0,
    width: 32,
    height: 17,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  umbrellaStem: {
    position: "absolute",
    top: 15,
    width: 2,
    height: 18,
    borderRadius: 2,
  },
  umbrellaHook: {
    position: "absolute",
    bottom: 1,
    left: 22,
    width: 9,
    height: 8,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderBottomRightRadius: 7,
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
  reasonIcon: {
    width: 16,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
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
  smallGlyph: {
    width: 22,
    height: 21,
    alignItems: "center",
  },
  smallCanopy: {
    position: "absolute",
    top: 1,
    width: 18,
    height: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  smallStem: {
    position: "absolute",
    top: 10,
    width: 2,
    height: 10,
    borderRadius: 2,
  },
  smallHook: {
    position: "absolute",
    bottom: 0,
    left: 11,
    width: 6,
    height: 6,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderBottomRightRadius: 5,
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
