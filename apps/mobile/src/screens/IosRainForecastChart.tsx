import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "../localization/react-native";
import type { WeatherSnapshot } from "@weatheron/shared";
import { uiIconAssets } from "../assets";
import { FeedbackPressable } from "../components/FeedbackPressable";
import { useAppTheme } from "../theme/AppThemeContext";
import { buildRainForecast, forecastHours, forecastTime, type ForecastHour, type RainForecastContext } from "../utils/homeOuting";

type Slot = { at: number; end: number; hour?: ForecastHour };
const HOUR = 3_600_000;

// Retain unavailable edge intervals and explicit breaks between supplied hours.
// A gap is one labelled break, never a zero-valued bar or a connected curve.
export function rainChartSlots(weather: WeatherSnapshot, context: RainForecastContext | null | undefined, now: number, forecast: ReturnType<typeof buildRainForecast>): Slot[] {
  if (!forecast.usable || !forecast.covered) return [];
  const target = context?.targetAt ? Date.parse(context.targetAt) : undefined;
  const hours = forecastHours(weather).filter(h => h.at + HOUR > now && (target === undefined || h.at + HOUR > target)).slice(0, 8);
  const slots: Slot[] = [];
  for (const h of hours) {
    const previous = slots[slots.length - 1];
    if (previous && h.at > previous.end) slots.push({ at: previous.end, end: h.at });
    slots.push({ at: h.at, end: h.at + HOUR, hour: forecast.bars.find(bar => bar.at === h.at) });
  }
  return slots;
}

export function rainAmountCeiling(maximum: number) {
  if (maximum <= 1) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(maximum));
  return [1, 2, 5, 10].map(n => n * magnitude).find(n => n >= maximum) ?? maximum;
}

export function IosRainForecastChart({ weather, context, now, forecast }: { weather: WeatherSnapshot; context?: RainForecastContext | null; now: number; forecast: ReturnType<typeof buildRainForecast> }) {
  const theme = useAppTheme();
  const { fontScale } = useWindowDimensions();
  const [selectedAt, setSelectedAt] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [plotWidth, setPlotWidth] = useState(0);
  const slots = rainChartSlots(weather, context, now, forecast);
  if (!slots.length) return null;
  const selected = slots.find(slot => slot.at === selectedAt) ?? slots[0];
  const ceiling = rainAmountCeiling(Math.max(0, ...forecast.bars.map(h => h.precipitationMm)));
  const minimumWidth = Math.max(44, Math.ceil(44 * fontScale));
  const visibleColumns = Math.max(1, Math.floor(plotWidth / minimumWidth));
  const columnWidth = plotWidth > 0 ? Math.max(minimumWidth, plotWidth / Math.min(slots.length, visibleColumns)) : minimumWidth;
  const amountHeight = Math.max(120, 80 * fontScale);
  const probabilityHeight = 40 * fontScale;
  const dateHeight = 26 * fontScale;
  const timeHeight = 34 * fontScale;
  const date = (at: number) => forecastTime(at, weather).split(" ")[0];
  const time = (at: number) => forecastTime(at, weather).split(" ")[1];
  const label = (slot: Slot) => slot.hour
    ? `${forecastTime(slot.at, weather)}, 강수확률 ${slot.hour.rainProbabilityPct}%, 시간당 강수량 ${slot.hour.precipitationMm}mm`
    : `${forecastTime(slot.at, weather)}–${forecastTime(slot.end, weather)}, 예보 미확인`;
  return <View style={styles.section}>
    <View style={styles.heading}>
      <Image source={uiIconAssets.drop} style={[styles.icon, { tintColor: theme.text }]} accessibilityElementsHidden importantForAccessibility="no" />
      <Text style={[styles.sectionTitle, { color: theme.text }]}>시간별 강수량</Text>
      <Text style={{ color: theme.muted }}>mm · 1시간</Text>
    </View>
    <Text style={{ color: theme.muted }}>{date(slots[0].at)} · 시간 선택 · 좌우로 이동</Text>
    <View style={styles.chartRow}>
      <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.axis, { width: Math.max(40, 34 * fontScale) }]}>
        <View style={{ height: dateHeight }} />
        <View style={{ height: amountHeight, justifyContent: "space-between" }}>
          {[ceiling, ceiling / 2, 0].map(n => <Text key={n} style={{ color: theme.muted, fontSize: 11 }}>{n}</Text>)}
        </View>
        <View style={{ height: timeHeight }} />
        <View style={{ height: probabilityHeight, justifyContent: "space-between" }}>
          <Text style={{ color: theme.muted, fontSize: 11 }}>100%</Text>
          <Text style={{ color: theme.muted, fontSize: 11 }}>0%</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator snapToInterval={columnWidth} decelerationRate="fast" onLayout={event => setPlotWidth(event.nativeEvent.layout.width)} contentContainerStyle={styles.columns} style={{ flex: 1 }}>
        {slots.map((slot, index) => {
          const active = slot.at === selected.at;
          const hour = slot.hour;
          const boundary = index > 0 && date(slot.at) !== date(slots[index - 1].at);
          return <FeedbackPressable key={slot.at} testID={`rain-hour-${slot.at}`} accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={label(slot)} accessibilityHint="선택한 시간의 정확한 예보를 표시합니다" hapticFeedback="none" onPress={() => setSelectedAt(slot.at)} style={{ width: columnWidth, alignItems: "stretch" }}>
            <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <View style={{ height: dateHeight, justifyContent: "center", alignItems: "center" }}><Text style={{ color: theme.muted, fontSize: 11 }}>{boundary ? date(slot.at) : ""}</Text></View>
              <View style={{ height: amountHeight, justifyContent: "flex-end", alignItems: "center", backgroundColor: active ? theme.card : "transparent" }}>
                {[0, 50, 100].map(n => <View key={n} style={{ position: "absolute", left: 0, right: 0, bottom: `${n}%`, borderTopWidth: StyleSheet.hairlineWidth, borderColor: theme.muted }} />)}
                {hour ? hour.precipitationMm > 0
                  ? <View style={{ width: "60%", height: `${hour.precipitationMm / ceiling * 100}%`, backgroundColor: theme.sky, borderTopLeftRadius: 6, borderTopRightRadius: 6, borderWidth: 1, borderColor: theme.text }} />
                  : <View style={{ width: 12, height: 2, backgroundColor: theme.text }} />
                  : <View style={[styles.missing, { borderColor: theme.muted }]}><Text style={{ color: theme.muted }}>╱</Text><Text style={{ color: theme.muted }}>?</Text><Text style={{ color: theme.muted }}>╱</Text></View>}
              </View>
              <View style={{ minHeight: timeHeight, justifyContent: "center", alignItems: "center", borderTopWidth: active ? 3 : 1, borderColor: active ? theme.gold : theme.muted }}><Text style={{ color: theme.text, fontSize: 12, fontWeight: active ? "700" : "400" }}>{slot.end - slot.at > HOUR ? "⋯" : time(slot.at)}</Text></View>
              <View style={{ height: probabilityHeight, justifyContent: "flex-end", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderColor: theme.muted, backgroundColor: active ? theme.card : "transparent" }}>
                {hour ? <View style={{ width: "45%", height: `${hour.rainProbabilityPct}%`, borderWidth: hour.rainProbabilityPct ? 1.5 : 0, borderColor: theme.text, backgroundColor: "transparent" }} /> : <Text style={{ color: theme.muted }}>?</Text>}
              </View>
            </View>
          </FeedbackPressable>;
        })}
      </ScrollView>
    </View>
    <View style={[styles.legend, { borderBottomColor: theme.border }]}>
      <Text style={{ color: theme.muted, fontSize: 12 }}>아래: 강수확률 · 0–100%</Text>
      {slots.some(s => !s.hour) ? <Text style={{ color: theme.muted, fontSize: 12 }}>╱ ? 예보 미확인 · ⋯ 시간 간격</Text> : null}
    </View>
    <View testID="rain-selected-detail" accessible accessibilityLiveRegion="polite" accessibilityLabel={label(selected)} style={[styles.selection, { borderColor: theme.border }]}>
      <Text style={{ color: theme.muted }}>{forecastTime(selected.at, weather)}{selected.end - selected.at > HOUR ? `–${forecastTime(selected.end, weather)}` : ""}</Text>
      {selected.hour ? <View style={styles.values}>
        <Text style={[styles.value, { color: theme.text }]}>{selected.hour.precipitationMm}<Text style={styles.unit}> mm / 1시간</Text></Text>
        <Text style={[styles.value, { color: theme.text }]}>{selected.hour.rainProbabilityPct}<Text style={styles.unit}> % 확률</Text></Text>
      </View> : <Text style={{ color: theme.text }}>예보 미확인 · 강수 없음이 아니에요</Text>}
    </View>
    <FeedbackPressable testID="rain-details-toggle" accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(!expanded)} style={styles.disclosure}>
      <Text style={{ color: theme.text }}>{expanded ? "시간별 수치 접기 −" : "시간별 수치 펼치기 +"}</Text>
    </FeedbackPressable>
    {expanded ? <View testID="rain-details-table" style={{ gap: 12 }}>{slots.map(slot => <View key={slot.at} accessible accessibilityLabel={label(slot)} style={[styles.detailRow, { borderBottomColor: theme.border }]}>
      <Text style={{ color: theme.muted }}>{forecastTime(slot.at, weather)}{slot.end - slot.at > HOUR ? `–${forecastTime(slot.end, weather)}` : ""}</Text>
      <Text style={{ color: theme.text }}>{slot.hour ? `${slot.hour.rainProbabilityPct}% · ${slot.hour.precipitationMm}mm` : "예보 미확인"}</Text>
    </View>)}</View> : null}
  </View>;
}

const styles = StyleSheet.create({
  section: { gap: 8 }, heading: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "600" }, icon: { width: 20, height: 20 },
  chartRow: { flexDirection: "row" }, axis: { alignItems: "flex-start" }, columns: { flexDirection: "row", paddingTop: 2, paddingBottom: 4 },
  missing: { height: "100%", width: "65%", borderWidth: 1, borderStyle: "dashed", alignItems: "center", justifyContent: "space-around" },
  legend: { gap: 4, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  selection: { gap: 6, paddingVertical: 6 }, values: { flexDirection: "row", flexWrap: "wrap", gap: 16, alignItems: "baseline" },
  value: { fontSize: 26, fontWeight: "600" }, unit: { fontSize: 13, fontWeight: "400" },
  disclosure: { minHeight: 44, justifyContent: "center" }, detailRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between", paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
});
