import React from "react";
import { StyleSheet, Text, View } from "../localization/react-native";
import { AppScreen } from "../components/AppScreen";
import { FeedbackPressable } from "../components/FeedbackPressable";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { useForecastNow } from "../hooks/useForecastNow";
import { buildRainForecast, forecastTime, resolveRainWeather } from "../utils/homeOuting";
import { getDisplayLocationName } from "../utils/locationDisplay";

export function IosRainForecastScreen({ state, rainForecastContext, onGoBack, alertPreferences, onToggleAlertPreference, permissionReady, smartCareEnabled, onRequestPermissionGate }: P0ScreenProps) {
  const theme = useAppTheme();
  const now = useForecastNow();
  const weather = resolveRainWeather(rainForecastContext, state.destinationCare.originWeather, state.destinationWeatherById, state.weather);
  const forecast = buildRainForecast(weather, rainForecastContext, now);
  const enabled = alertPreferences.rainDetail;
  return <AppScreen title="강수 예보" subtitle={weather ? getDisplayLocationName(weather.locationName) : "위치 확인 필요"} onBack={onGoBack} compactHeader>
    <View style={{ gap: 8 }}>
      <Text style={{ color: theme.muted }}>{rainForecastContext?.basisLabel ?? "현재 선택 위치"}{rainForecastContext?.targetAt ? ` · ${forecastTime(Date.parse(rainForecastContext.targetAt), weather)}` : ""}</Text>
      <Text style={{ color: theme.text, fontSize: 22, lineHeight: 30 }}>{forecast.title}</Text>
      <Text style={{ color: theme.muted }}>{forecast.range}</Text>
      {forecast.missing ? <Text style={{ color: theme.muted }}>일부 시간 예보 없음 · 빈 구간은 강수 없음이 아니에요</Text> : null}
      {!forecast.bars.length && weather && forecast.usable ? <Text style={{ color: theme.muted }}>{forecastTime(Date.parse(weather.observedAt), weather)} 현재 날씨 기준 · 시간별 미래 예보가 아니에요</Text> : null}
      {forecast.bars.map(hour => <View key={hour.at} style={[styles.row, { borderColor: theme.border }]} accessible accessibilityLabel={`${forecastTime(hour.at, weather)}, 강수확률 ${hour.rainProbabilityPct}%, 강수량 ${hour.precipitationMm}mm`}>
        <Text style={{ color: theme.text, flex: 1 }}>{forecastTime(hour.at, weather)}</Text>
        <Text style={{ color: theme.text }}>{hour.rainProbabilityPct}% · {hour.precipitationMm}mm</Text>
      </View>)}
      <Text style={{ color: theme.muted }}>표시된 시간대의 예보예요. 이후 비 그침은 확인되지 않았어요.</Text>
    </View>
    <FeedbackPressable accessibilityRole="switch" accessibilityState={{ checked: enabled }} accessibilityLabel="강수 예보 알림" onPress={() => {
      onToggleAlertPreference("rainDetail");
      if (!enabled && !permissionReady) onRequestPermissionGate("notification", "H5", "rain");
    }} style={[styles.toggle, { borderColor: theme.border }]}>
      <Text style={{ color: theme.text }}>강수 예보 알림 · {enabled ? "켜짐" : "꺼짐"}</Text>
      <Text style={{ color: theme.muted }}>{!permissionReady ? "알림 권한이 필요해요" : !smartCareEnabled ? "알림 설정에서 스마트 알림을 켜 주세요" : "앱에서 확인한 예보로 예약해요. 비 그침 알림은 지원하지 않아요."}</Text>
    </FeedbackPressable>
  </AppScreen>;
}
const styles = StyleSheet.create({ row: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth }, toggle: { minHeight: 44, gap: 6, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth } });
