import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

export function RainTimelineScreen({ state, onNavigate, onOpenAlertSettings }: P0ScreenProps) {
  const theme = useAppTheme();
  const [rainEndAlertEnabled, setRainEndAlertEnabled] = useState(false);
  const rainBars = useMemo(() => buildRainBars(state.weather.hourly), [state.weather.hourly]);
  const peakAmount = getPeakRainAmount(rainBars);
  const rainStart = "18:00";
  const rainEnd = "21:00";

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => onNavigate("H4")} style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
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
              <Text style={[styles.heroTitle, { color: theme.text }]}>{rainStart} 시작, {rainEnd} 그침</Text>
              <Text style={[styles.heroMeta, { color: theme.muted }]}>시간당 최대 {peakAmount}mm · 21시 이후 외출 부담 낮음</Text>
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
          style={[styles.togglePanel, { backgroundColor: theme.card, borderColor: rainEndAlertEnabled ? theme.sky : theme.border }]}
        >
          <View style={styles.toggleCopy}>
            <Text style={[styles.toggleLabel, { color: theme.sky }]}>알림 설정</Text>
            <Text style={[styles.toggleTitle, { color: theme.text }]}>비 그치면 알려줘</Text>
            <Text style={[styles.toggleMeta, { color: theme.muted }]}>21:00 전후로 그침 알림을 받을지 선택</Text>
          </View>
          <View style={[styles.toggleTrack, { backgroundColor: rainEndAlertEnabled ? theme.sky : theme.cardStrong }]}>
            <View style={[styles.toggleKnob, { backgroundColor: rainEndAlertEnabled ? theme.text : theme.subtle, marginLeft: rainEndAlertEnabled ? 22 : 3 }]} />
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
                          backgroundColor: item.amount >= 3 ? theme.sky : item.amount >= 1 ? theme.cardSoft : theme.cardStrong,
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </View>
            <View style={styles.timeAxis}>
              <Text style={[styles.axisText, { color: theme.subtle }]}>17:00</Text>
              <Text style={[styles.axisText, { color: theme.subtle }]}>18:00</Text>
              <Text style={[styles.axisText, { color: theme.subtle }]}>19:00</Text>
              <Text style={[styles.axisText, { color: theme.subtle }]}>20:00</Text>
              <Text style={[styles.axisText, { color: theme.subtle }]}>21:00</Text>
            </View>
            <View style={styles.legend}>
              <LegendSwatch label="약함" color={theme.cardSoft} theme={theme} />
              <LegendSwatch label="보통" color={theme.cardSoft} theme={theme} />
              <LegendSwatch label="강함" color={theme.sky} theme={theme} />
            </View>
          </View>
        </Panel>

        <Panel title="외출 가이드" theme={theme} accentColor={theme.clear}>
          <GuideRow icon={uiIconAssets.check} text="지금 나가면 비 전 도착 가능" color={theme.clear} theme={theme} />
          <GuideRow icon={uiIconAssets.umbrella} text="18시 이후 외출 시 우산 필수" color={theme.sky} theme={theme} />
          <GuideRow icon={uiIconAssets.clock} text="21시 이후는 비가 그칩니다" color={theme.subtle} theme={theme} />
        </Panel>

        <Pressable accessibilityRole="button" onPress={() => onOpenAlertSettings("H5", "rain")} style={[styles.secondaryCta, { backgroundColor: theme.cardStrong }]}>
          <Image source={uiIconAssets.settings} style={[styles.secondaryCtaIcon, { tintColor: theme.subtle }]} resizeMode="contain" />
          <Text style={[styles.secondaryCtaText, { color: theme.text }]}>비 알림 설정</Text>
        </Pressable>

        <View style={[styles.statePanel, { backgroundColor: theme.card }]}>
          <Text style={[styles.stateLabel, { color: theme.sky }]}>강수</Text>
          <Text style={[styles.stateText, { color: theme.text }]}>
            {rainStart} 시작 · {rainEnd} 종료 · 그침 알림 {rainEndAlertEnabled ? "ON" : "끔"}
          </Text>
        </View>

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

type RainBar = {
  time: string;
  amount: number;
};

function buildRainBars(hourly: P0ScreenProps["state"]["weather"]["hourly"]): RainBar[] {
  if (hourly.length >= 8) {
    return hourly.slice(0, 8).map((item) => ({ time: item.time, amount: item.precipitationMm }));
  }
  return [
    { time: "17:00", amount: 0.2 },
    { time: "17:30", amount: 0.5 },
    { time: "18:00", amount: 1.8 },
    { time: "18:30", amount: 3.5 },
    { time: "19:00", amount: 4.2 },
    { time: "19:30", amount: 3.8 },
    { time: "20:00", amount: 2.5 },
    { time: "20:30", amount: 1.0 },
    { time: "21:00", amount: 0.3 },
  ];
}

function getPeakRainAmount(items: RainBar[]) {
  return Math.max(...items.map((item) => item.amount)).toFixed(0);
}

function trimAmount(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
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
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
  },
  statePanel: {
    gap: 3,
    minHeight: 58,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: spacing.sm,
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
  secondaryCta: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radius.md,
  },
  secondaryCtaText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
    letterSpacing: 0,
  },
  secondaryCtaIcon: {
    width: 16,
    height: 16,
  },
  bottomSpacer: {
    height: 12,
  },
});
