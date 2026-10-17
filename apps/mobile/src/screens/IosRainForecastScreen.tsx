import React from "react";
import { Image, Platform, StyleSheet, Text, View } from "../localization/react-native";
import { AppScreen } from "../components/AppScreen";
import { FeedbackPressable } from "../components/FeedbackPressable";
import { uiIconAssets } from "../assets";
import { ambientUiIcons } from "../ambientAssets";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { useForecastNow } from "../hooks/useForecastNow";
import { buildRainForecast, forecastTime, resolveRainWeather } from "../utils/homeOuting";
import { getDisplayLocationName } from "../utils/locationDisplay";
import { IosRainForecastChart } from "./IosRainForecastChart";

export function IosRainForecastScreen({ state, rainForecastContext, onGoBack, alertPreferences, onToggleAlertPreference, permissionReady, smartCareEnabled, onRequestPermissionGate }: P0ScreenProps) {
  const theme = useAppTheme();
  const now = useForecastNow();
  const weather = resolveRainWeather(rainForecastContext, state.destinationCare.originWeather, state.destinationWeatherById, state.weather);
  const forecast = buildRainForecast(weather, rainForecastContext, now);
  const enabled = alertPreferences.rainDetail;
  return <AppScreen title="강수 예보" subtitle={weather ? getDisplayLocationName(weather.locationName) : "위치 확인 필요"} onBack={onGoBack} compactHeader contentGap={16}>
    <View style={{ gap: 6 }}>
      <Text style={{ color: theme.muted }}>{rainForecastContext?.basisLabel ?? "현재 선택 위치"}{rainForecastContext?.targetAt ? ` · ${forecastTime(Date.parse(rainForecastContext.targetAt), weather)}` : ""}</Text>
      <Text style={{ color: theme.text, fontSize: 22, lineHeight: 30, fontWeight: "600" }}>{forecast.title}</Text>
      <Text style={{ color: theme.muted, fontSize: 12 }}>확인 구간 · {forecast.range}</Text>
      {forecast.missing ? <Text style={{ color: theme.muted }}>일부 시간 예보 없음 · 빈 구간은 강수 없음이 아니에요</Text> : null}
      {!forecast.bars.length && weather && forecast.usable ? <Text style={{ color: theme.muted }}>{forecastTime(Date.parse(weather.observedAt), weather)} 현재 날씨 기준 · 시간별 미래 예보가 아니에요</Text> : null}
    </View>
    {weather ? <IosRainForecastChart key={`${weather.locationId}:${rainForecastContext?.targetAt ?? "current"}`} weather={weather} context={rainForecastContext} now={now} forecast={forecast} /> : null}
    <FeedbackPressable testID="rain-alert-toggle" accessibilityRole="switch" accessibilityState={{ checked: enabled }} accessibilityLabel="강수 예보 알림" onPress={() => {
      onToggleAlertPreference("rainDetail");
      if (!enabled && !permissionReady) onRequestPermissionGate("notification", "H5", "rain");
    }} style={[styles.toggle, { borderColor: theme.border }]}>
      <View style={styles.toggleHeading}>
        <Image source={Platform.OS === "ios" ? ambientUiIcons.notifications : uiIconAssets.myAlerts} style={{ width: 22, height: 22, tintColor: theme.text }} accessibilityElementsHidden importantForAccessibility="no" />
        <Text style={{ color: theme.text, flex: 1, fontSize: 16 }}>강수 예보 알림</Text>
        <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.track, { borderColor: theme.muted, backgroundColor: enabled ? theme.gold : theme.card }]}>
          <View style={[styles.knob, { backgroundColor: enabled ? theme.onAccent : theme.text, alignSelf: enabled ? "flex-end" : "flex-start" }]} />
        </View>
      </View>
      <Text style={{ color: theme.muted, fontSize: 12 }}>{enabled ? "켜짐" : "꺼짐"} · {!permissionReady ? "알림 권한이 필요해요" : !smartCareEnabled ? "알림 설정에서 스마트 알림을 켜 주세요" : "앱에서 확인한 예보로 예약해요. 비 그침 알림은 지원하지 않아요."}</Text>
    </FeedbackPressable>
    <View style={{ gap: 6 }}>
      <Text style={{ color: theme.muted, fontSize: 12 }}>표시된 시간대의 예보예요. 이후 비 그침은 확인되지 않았어요.</Text>
      {weather ? <Text style={{ color: theme.muted, fontSize: 12 }}>{forecastTime(Date.parse(weather.observedAt), weather)} 자료 기준</Text> : null}
    </View>
  </AppScreen>;
}
const styles = StyleSheet.create({
  toggle: { minHeight: 44, gap: 8, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth },
  toggleHeading: { flexDirection: "row", gap: 10, alignItems: "center" },
  track: { width: 50, height: 30, borderWidth: 1, borderRadius: 15, padding: 3, justifyContent: "center" },
  knob: { width: 22, height: 22, borderRadius: 11 },
});
