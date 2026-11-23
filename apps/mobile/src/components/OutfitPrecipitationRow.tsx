import React from "react";
import { Image, StyleSheet, Text, View } from "../localization/react-native";
import { ambientUiIcons, ambientWeatherIcon } from "../ambientAssets";
import type { AppTheme } from "../theme/tokens";

export function OutfitPrecipitationRow({ forecast, theme, testID }: {
  forecast?: string;
  theme: AppTheme;
  testID: string;
}) {
  if (!forecast) return null;
  const forecastKinds = ["강수 가능", "눈 예보", "비 예보", "얼음·혼합 강수 예보"];
  const [when, kind] = forecast.split(" 무렵 ");
  const clock = when?.match(/^오늘 (\d{1,2}:\d{2})$/u)?.[1];
  const forecastKind = forecastKinds.find(value => value === kind);
  const condition = forecastKind === "눈 예보" ? "snow" : forecastKind === "얼음·혼합 강수 예보" ? "mixed" : null;
  const weatherIcon = condition ? ambientWeatherIcon(condition, false, theme) : undefined;
  return (
    <View testID={testID} style={[styles.row, { borderColor: theme.border }]}>
      <Image accessible={false} source={weatherIcon ? weatherIcon.source : ambientUiIcons.droplet} style={{ width: 14, height: 16, tintColor: weatherIcon ? weatherIcon.tintColor : theme.muted }} />
      {clock && forecastKind
        ? <Text style={[styles.copy, { color: theme.muted }]}>오늘 {clock} 무렵 {forecastKind}</Text>
        : <Text style={[styles.copy, { color: theme.muted }]}>{forecast}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 5, marginTop: 3 },
  copy: { fontSize: 14, lineHeight: 20, flexShrink: 1, fontVariant: ["tabular-nums"] },
});
