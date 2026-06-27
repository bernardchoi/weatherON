import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DeviceLocationState } from "../providers/deviceLocation";
import type { WeatherLocationMode } from "../state/useWeatherOnAppState";
import { appColors, radius, spacing } from "../theme/tokens";

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
  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>위치 기준</Text>
        <Text style={styles.status}>{getLocationStatusText(mode, deviceLocationState)} · {locationReady ? "READY" : "대기"}</Text>
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
              style={[styles.modeButton, active ? styles.modeActive : null]}
            >
              <Text style={[styles.modeText, active ? styles.modeTextActive : null]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.locationMessage}>{deviceLocationState.message}</Text>
    </View>
  );
}

function getLocationStatusText(mode: WeatherLocationMode, state: DeviceLocationState): string {
  if (mode === "manual") return "수동 위치";
  if (state.status === "granted") return "권한 위치";
  if (state.status === "requesting") return "확인 중";
  if (state.status === "denied") return "권한 거부";
  if (state.status === "unavailable") return "서비스 꺼짐";
  if (state.status === "error") return "대체 위치";
  return "권한 대기";
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  status: {
    color: appColors.clear,
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
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  modeActive: {
    borderColor: appColors.clear,
    backgroundColor: "rgba(103,232,208,0.14)",
  },
  modeText: {
    color: appColors.muted,
    fontSize: 13,
    fontWeight: "900",
  },
  modeTextActive: {
    color: appColors.clear,
  },
  locationMessage: {
    color: appColors.muted,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
});
