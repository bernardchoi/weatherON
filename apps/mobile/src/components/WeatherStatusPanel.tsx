import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { WeatherProviderMode } from "../providers/weatherProvider";
import { appColors, radius, spacing } from "../theme/tokens";

type WeatherStatusPanelProps = {
  status: WeatherProviderMode;
  message: string;
  retryable: boolean;
  loading: boolean;
  onSetMode: (mode: WeatherProviderMode) => void;
  onRetry: () => void;
};

const modeOptions: Array<{ mode: WeatherProviderMode; label: string }> = [
  { mode: "ready", label: "정상" },
  { mode: "stale", label: "캐시" },
  { mode: "fallback", label: "기본" },
  { mode: "error", label: "오류" },
];

export function WeatherStatusPanel({ status, message, retryable, loading, onSetMode, onRetry }: WeatherStatusPanelProps) {
  const isHealthy = status === "ready" && !loading;
  const statusLabel = loading ? "LOADING" : status.toUpperCase();
  return (
    <View style={[styles.panel, isHealthy ? styles.readyPanel : styles.warningPanel]}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.title}>{loading ? "날씨 갱신 중" : getTitle(status)}</Text>
          <Text style={styles.message}>{loading ? "최신 날씨를 불러오는 중" : message}</Text>
        </View>
        <Text style={[styles.status, isHealthy ? styles.readyText : styles.warningText]}>{statusLabel}</Text>
      </View>

      {!isHealthy ? (
        <View style={styles.ctaRow}>
          <Pressable accessibilityRole="button" disabled={loading} onPress={onRetry} style={[styles.cta, loading ? styles.disabled : null]}>
            <Text style={styles.ctaText}>{retryable ? "다시 시도" : "갱신"}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={() => onSetMode("fallback")}
            style={[styles.secondaryCta, loading ? styles.disabled : null]}
          >
            <Text style={styles.secondaryText}>수동 위치 검색</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.modeRow}>
        {modeOptions.map((item) => {
          const active = item.mode === status;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              disabled={loading}
              key={item.mode}
              onPress={() => onSetMode(item.mode)}
              style={[styles.modeButton, active ? styles.modeActive : null, loading ? styles.disabled : null]}
            >
              <Text style={[styles.modeText, active ? styles.modeTextActive : null]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function getTitle(status: WeatherProviderMode): string {
  if (status === "ready") return "날씨 연결 정상";
  if (status === "stale") return "최근 기준 추천";
  if (status === "fallback") return "기본 위치 기준";
  return "날씨 갱신 실패";
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  readyPanel: {
    backgroundColor: "rgba(103,232,208,0.10)",
    borderColor: "rgba(103,232,208,0.28)",
  },
  warningPanel: {
    backgroundColor: "rgba(244,182,63,0.12)",
    borderColor: "rgba(244,182,63,0.34)",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  message: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  status: {
    fontSize: 11,
    fontWeight: "900",
  },
  readyText: {
    color: appColors.clear,
  },
  warningText: {
    color: appColors.gold,
  },
  ctaRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  cta: {
    minHeight: 40,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: appColors.gold,
  },
  ctaText: {
    color: appColors.navy,
    fontSize: 13,
    fontWeight: "900",
  },
  secondaryCta: {
    minHeight: 40,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: appColors.border,
  },
  secondaryText: {
    color: appColors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.58,
  },
  modeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  modeButton: {
    minHeight: 32,
    flex: 1,
    minWidth: 62,
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
    fontSize: 12,
    fontWeight: "900",
  },
  modeTextActive: {
    color: appColors.clear,
  },
});
