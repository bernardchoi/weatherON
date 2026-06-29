import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { WeatherProviderMode } from "../providers/weatherProvider";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

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
  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: isHealthy ? `${theme.clear}1A` : `${theme.gold}24`,
          borderColor: isHealthy ? `${theme.clear}55` : `${theme.gold}66`,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.text }]}>{loading ? "날씨 갱신 중" : getTitle(status)}</Text>
          <Text style={[styles.message, { color: theme.muted }]}>{loading ? "최신 날씨를 불러오는 중" : getMessage(status, message)}</Text>
        </View>
        <Text style={[styles.status, { color: isHealthy ? theme.clear : theme.gold }]}>{statusLabel}</Text>
      </View>

      {!isHealthy ? (
        <View style={styles.ctaRow}>
          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={onRetry}
            style={[styles.cta, { backgroundColor: theme.gold }, loading ? styles.disabled : null]}
          >
            <Text style={[styles.ctaText, { color: theme.onAccent }]}>{retryable ? "다시 시도" : "갱신"}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={() => onSetMode("fallback")}
            style={[styles.secondaryCta, { backgroundColor: theme.cardMuted, borderColor: theme.border }, loading ? styles.disabled : null]}
          >
            <Text style={[styles.secondaryText, { color: theme.text }]}>수동 위치 검색</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function getTitle(status: WeatherProviderMode): string {
  if (status === "ready") return "날씨 연결됨";
  if (status === "stale") return "최근 기준 추천";
  if (status === "fallback") return "기본 위치 기준";
  return "날씨 갱신 실패";
}

function getMessage(status: WeatherProviderMode, message: string): string {
  if (status === "ready") return "최신 예보 기준으로 준비 완료";
  if (status === "stale") return "최근 예보 기준으로 추천 유지";
  return message;
}

function getStatusLabel(status: WeatherProviderMode): string {
  if (status === "ready") return "연결됨";
  if (status === "stale") return "최근 예보";
  if (status === "fallback") return "기본 예보";
  return "확인 필요";
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
