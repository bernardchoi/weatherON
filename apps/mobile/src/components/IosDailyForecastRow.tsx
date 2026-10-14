import React from "react";
import { Image, StyleSheet, Text, View, useWindowDimensions } from "../localization/react-native";
import type { DailyWeather } from "@weatheron/shared";
import { ambientUiIcons, ambientWeatherIcon } from "../ambientAssets";
import type { AppTheme } from "../theme/tokens";
import { dailyTemperatureRange, dailyValueAvailable, type dailyTemperatureScale } from "../utils/iosDailyForecast";
import { formatTemperature } from "../utils/units";
import { getConditionIcon, getConditionLabel } from "../utils/weatherPresentation";
import type { P0ScreenProps } from "../navigation/types";

export function IosDailyForecastRow({ item, scale, temperatureUnit, theme, dateLabel }: {
  item: DailyWeather; scale: ReturnType<typeof dailyTemperatureScale>;
  temperatureUnit: P0ScreenProps["temperatureUnit"]; theme: AppTheme; dateLabel: string;
}) {
  const { fontScale } = useWindowDimensions();
  const expanded = fontScale > 1.3;
  const range = dailyTemperatureRange(item, scale);
  const min = dailyValueAvailable(item, "minTemp") ? formatTemperature(item.minTempC, temperatureUnit) : "—";
  const max = dailyValueAvailable(item, "maxTemp") ? formatTemperature(item.maxTempC, temperatureUnit) : "—";
  const rain = dailyValueAvailable(item, "rainProbability") ? `${Math.round(item.rainProbabilityPct)}%` : "—";
  const icon = ambientWeatherIcon(item.condition, false, theme);
  const rainNode = <View style={[styles.rain, expanded && styles.expandedRain]}>
      <Image source={ambientUiIcons.droplet} style={[styles.drop, { tintColor: theme.sky }]} resizeMode="contain" />
      <Text style={[styles.rainValue, { color: theme.muted }]}>{rain}</Text>
    </View>;
  return <View testID="ios-daily-forecast-row" accessible accessibilityRole="text"
    accessibilityLabel={`${dateLabel}, ${getConditionLabel(item.condition)}, 최저 ${min === "—" ? "확인 중" : min}, 최고 ${max === "—" ? "확인 중" : max}, 강수 확률 ${rain === "—" ? "확인 중" : rain}`}
    style={[styles.row, { borderColor: theme.border }, expanded && styles.expanded]}>
    <View style={[styles.day, expanded && styles.expandedDay]}>
      <Text style={[styles.date, { color: theme.text }]}>{dateLabel}</Text>
      <Image source={icon?.source ?? getConditionIcon(item.condition)} style={[styles.icon, { tintColor: icon?.tintColor }]} resizeMode="contain" />
    </View>
    {expanded ? rainNode : null}
    <View style={[styles.temperatures, expanded && styles.expandedTemperatures]}>
      <Text style={[styles.temperature, { color: theme.muted }]}>{min}</Text>
      <View testID="daily-temperature-track" style={[styles.track, { backgroundColor: theme.border }]}>
        {range ? <View testID="daily-temperature-range" style={[styles.range, { left: `${range.left}%`, width: `${range.width}%`, backgroundColor: theme.sky, transform: [{ translateX: range.width === 0 ? -1.5 : 0 }] }]} /> : null}
      </View>
      <Text style={[styles.temperature, { color: theme.text }]}>{max}</Text>
    </View>
    {!expanded ? rainNode : null}
  </View>;
}

const styles = StyleSheet.create({
  row: { minHeight: 48, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", gap: 8 },
  day: { width: 70, flexDirection: "row", alignItems: "center", gap: 6 },
  date: { fontSize: 14, lineHeight: 20, fontWeight: "500", fontVariant: ["tabular-nums"] },
  icon: { width: 22, height: 22, flexShrink: 0 },
  temperatures: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 5 },
  temperature: { minWidth: 30, textAlign: "center", fontSize: 14, lineHeight: 20, fontWeight: "500", fontVariant: ["tabular-nums"] },
  track: { flex: 1, minWidth: 16, height: 5, borderRadius: 3, overflow: "hidden" },
  range: { position: "absolute", top: 0, height: 5, minWidth: 3, borderRadius: 3 },
  rain: { width: 54, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 3 },
  drop: { width: 12, height: 14, flexShrink: 0 },
  rainValue: { fontSize: 14, lineHeight: 20, fontWeight: "400", fontVariant: ["tabular-nums"] },
  expanded: { flexWrap: "wrap", rowGap: 8 },
  expandedDay: { flex: 1, width: "auto" },
  expandedRain: { width: "auto", minWidth: 54 },
  expandedTemperatures: { flexBasis: "100%" },
});
