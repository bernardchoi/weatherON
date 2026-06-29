import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DeviceLocationState } from "../providers/deviceLocation";
import type { WeatherLocationMode } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

type LocationModePanelProps = {
  mode: WeatherLocationMode;
  deviceLocationState: DeviceLocationState;
  locationReady: boolean;
  onSetMode: (mode: WeatherLocationMode) => void;
  onRequestCurrentLocation: () => void;
};

const locationOptions: Array<{ mode: WeatherLocationMode; label: string }> = [
  { mode: "auto", label: "현재 위치" },
  { mode: "manual", label: "수동 서울" },
];

export function LocationModePanel({ mode, deviceLocationState, locationReady, onSetMode, onRequestCurrentLocation }: LocationModePanelProps) {
  const theme = useAppTheme();
  return (
    <View style={[styles.panel, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>위치 기준</Text>
        <Text style={[styles.status, { color: theme.clear }]}>{getLocationStatusText(mode, deviceLocationState, locationReady)}</Text>
      </View>
      <View style={styles.modeRow}>
        {locationOptions.map((item) => {
          const active = mode === item.mode;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={item.mode}
              onPress={() => {
                if (item.mode === "auto") onRequestCurrentLocation();
                else onSetMode(item.mode);
              }}
              style={[
                styles.modeButton,
                { backgroundColor: theme.cardMuted, borderColor: theme.border },
                active ? { borderColor: theme.clear, backgroundColor: `${theme.clear}24` } : null,
              ]}
            >
              <Text style={[styles.modeText, { color: active ? theme.clear : theme.muted }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.locationMessage, { color: theme.muted }]}>{deviceLocationState.message}</Text>
    </View>
  );
}

function getLocationStatusText(mode: WeatherLocationMode, state: DeviceLocationState, locationReady: boolean): string {
  if (mode === "manual") return "수동 위치 사용 중";
  if (state.status === "granted" && locationReady) return "현재 위치 사용 중";
  if (state.status === "requesting") return "확인 중";
  if (state.status === "denied") return "위치 권한 확인 필요";
  if (state.status === "unavailable") return "위치 서비스 꺼짐";
  if (state.status === "error") return "기본 위치 사용 중";
  return "위치 설정 필요";
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: {
    fontSize: 15,
    fontWeight: "900",
  },
  status: {
    fontSize: 11,
    fontWeight: "900",
  },
  modeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  modeButton: {
    minHeight: 38,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  modeText: {
    fontSize: 13,
    fontWeight: "900",
  },
  locationMessage: {
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
});
