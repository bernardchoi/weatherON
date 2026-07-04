import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { WeatherProviderMode } from "../providers/weatherProvider";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

type WeatherStatusPanelProps = {
  status: WeatherProviderMode;
  message: string;
  retryable: boolean;
  loading: boolean;
  onSetMode: (mode: WeatherProviderMode) => void;
  onRetry: () => void;
};

export function WeatherStatusPanel({ status, message, retryable, loading, onSetMode, onRetry }: WeatherStatusPanelProps) {
  const theme = useAppTheme();
  const isHealthy = status === "ready" && !loading;
  const statusLabel = loading ? "갱신 중" : getStatusLabel(status);
  const showFallbackAction = !loading && status !== "ready" && status !== "fallback";
  const panelTone = getPanelTone(theme, status, loading);
  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: `${panelTone}1A`,
          borderColor: `${panelTone}55`,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.text }]}>{loading ? "날씨 갱신 중" : getTitle(status)}</Text>
          <Text style={[styles.message, { color: theme.muted }]}>{loading ? "최신 날씨를 불러오는 중" : getMessage(status, message)}</Text>
        </View>
        <Text style={[styles.status, { color: panelTone }]}>{statusLabel}</Text>
      </View>

      {!isHealthy && !loading ? (
        <View style={styles.ctaRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={getRetryAccessibilityLabel(status, retryable)}
            disabled={loading}
            onPress={onRetry}
            style={[styles.cta, { backgroundColor: theme.gold }, loading ? styles.disabled : null]}
          >
            <Text style={[styles.ctaText, { color: theme.onAccent }]}>{getRetryLabel(status, retryable)}</Text>
          </Pressable>
          {showFallbackAction ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="기본 예보로 보기"
              disabled={loading}
              onPress={() => onSetMode("fallback")}
              style={[styles.secondaryCta, { backgroundColor: theme.cardMuted, borderColor: theme.border }, loading ? styles.disabled : null]}
            >
              <Text style={[styles.secondaryText, { color: theme.text }]}>기본 예보로 보기</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function getPanelTone(theme: AppTheme, status: WeatherProviderMode, loading: boolean): string {
  if (loading) return theme.skyLite;
  if (status === "ready") return theme.clear;
  if (status === "error") return theme.alert;
  return theme.skyLite;
}

function getTitle(status: WeatherProviderMode): string {
  if (status === "ready") return "날씨 연결됨";
  if (status === "stale") return "최근 예보로 유지 중";
  if (status === "fallback") return "기본 예보 기준";
  return "날씨 갱신 실패";
}

function getMessage(status: WeatherProviderMode, message: string): string {
  if (status === "ready") return "최신 예보 기준으로 준비 완료";
  if (status === "stale") return "연결 전까지 마지막 예보로 판단 유지";
  if (status === "fallback") return "실시간 연결 전까지 기본 위치 예보로 판단";
  return message;
}

function getStatusLabel(status: WeatherProviderMode): string {
  if (status === "ready") return "연결됨";
  if (status === "stale") return "최근 예보";
  if (status === "fallback") return "기본 예보";
  return "재시도 필요";
}

function getRetryLabel(status: WeatherProviderMode, retryable: boolean): string {
  if (status === "fallback") return "실시간 다시 시도";
  return retryable ? "다시 시도" : "갱신";
}

function getRetryAccessibilityLabel(status: WeatherProviderMode, retryable: boolean): string {
  if (status === "fallback") return "실시간 날씨 다시 시도";
  return retryable ? "날씨 다시 시도" : "날씨 갱신";
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
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
    fontSize: 16,
    fontWeight: "900",
  },
  message: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  status: {
    fontSize: 11,
    fontWeight: "900",
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
  },
  ctaText: {
    fontSize: 13,
    fontWeight: "900",
  },
  secondaryCta: {
    minHeight: 40,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.58,
  },
});
