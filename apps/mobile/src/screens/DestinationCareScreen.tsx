import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, radius, spacing } from "../theme/tokens";

export function DestinationCareScreen({
  state,
  accountGateResult,
  permissionReady,
  permissionGateResult,
  destinationSaved,
  destinationCareEnabled,
  selectedDestinationAlertCondition,
  onNavigate,
  onOpenAlertSettings,
  onToggleDestinationCare,
  onCycleDestinationAlertCondition,
}: P0ScreenProps) {
  const care = state.destinationCare;
  const tempDiff = Math.round((care.destinationWeather.current.feelsLikeC - care.originWeather.current.feelsLikeC) * 10) / 10;

  return (
    <AppScreen title="목적지 케어" subtitle="출발지와 목적지 날씨를 비교해 우산·신발·출발 준비를 묶어 표시" badge="G2">
      <Section title={care.name} caption={care.nextAlertText}>
        <View style={styles.compareRow}>
          <WeatherBox label="출발지" name={care.originWeather.locationName} temp={care.originWeather.current.feelsLikeC} />
          <WeatherBox label="목적지" name={care.destinationWeather.locationName} temp={care.destinationWeather.current.feelsLikeC} />
        </View>
        <Text style={styles.diffText}>
          체감온도 차이 {tempDiff > 0 ? "+" : ""}
          {tempDiff}도 · 목적지 강수확률 {care.destinationWeather.current.rainProbabilityPct}%
        </Text>
      </Section>

      <Section title="준비 판단" caption={`${care.departureAdvice?.targetArrivalTime} 도착 기준 · 이동 ${care.departureAdvice?.travelMinutes}분`}>
        <AdviceRow title={care.umbrellaAdvice.title} reason={care.umbrellaAdvice.reason} level={care.umbrellaAdvice.level} />
        <AdviceRow title={care.shoesAdvice.title} reason={care.shoesAdvice.reason} level={care.shoesAdvice.level} />
      </Section>

      <Section title="목적지 알림" caption={destinationSaved ? "계정 연결 목적지 상태 공유 중" : "저장 전 Guest 미리보기 상태"}>
        {accountGateResult?.returnTo === "G2" && accountGateResult.pendingAction === "destination-care" ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>{accountGateResult.message}</Text>
            <Text style={styles.switchMeta}>계정/약관 완료 후 같은 목적지 케어 상태로 복귀함</Text>
          </View>
        ) : null}
        {permissionGateResult?.returnTo === "G2" && permissionGateResult.reason === "destination-care" ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>{permissionGateResult.message}</Text>
            <Text style={styles.switchMeta}>O3 권한 확인 후 같은 목적지 케어 상태로 복귀함</Text>
          </View>
        ) : null}
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: destinationCareEnabled }}
          onPress={onToggleDestinationCare}
          style={styles.switchRow}
        >
          <View style={styles.switchCopy}>
            <Text style={styles.switchTitle}>{destinationCareEnabled ? "목적지 케어 ON" : "목적지 케어 OFF"}</Text>
            <Text style={styles.switchMeta}>저장/알림 ON은 계정 연결 후 유지됨</Text>
          </View>
          <StatusPill label={destinationCareEnabled ? "ON" : "OFF"} tone={destinationCareEnabled ? "clear" : "warm"} />
        </Pressable>
        <View style={styles.permissionLine}>
          <Text style={styles.switchMeta}>알림 권한</Text>
          <StatusPill label={permissionReady ? "READY" : "O3 필요"} tone={permissionReady ? "clear" : "warm"} />
        </View>
        <View style={styles.actions}>
          <AppButton label="준비 가이드" onPress={() => onNavigate("P2")} />
          <AppButton label="알림 설정" onPress={() => onOpenAlertSettings("G2", "destination")} tone="secondary" />
        </View>
      </Section>

      <Section title="알림 조건" caption="목적지별 기준을 저장 상태와 함께 유지">
        <ConditionRow
          title="강수 기준"
          value={`${selectedDestinationAlertCondition.rainThresholdPct}% 이상`}
          onChange={() => onCycleDestinationAlertCondition("rainThresholdPct")}
        />
        <ConditionRow
          title="출발 전 알림"
          value={`${selectedDestinationAlertCondition.leadTimeMinutes}분 전`}
          onChange={() => onCycleDestinationAlertCondition("leadTimeMinutes")}
        />
        <ConditionRow
          title="바람 기준"
          value={`${selectedDestinationAlertCondition.windThresholdMs}m/s 이상`}
          onChange={() => onCycleDestinationAlertCondition("windThresholdMs")}
        />
      </Section>
    </AppScreen>
  );
}

function WeatherBox({ label, name, temp }: { label: string; name: string; temp: number }) {
  return (
    <View style={styles.weatherBox}>
      <Text style={styles.boxLabel}>{label}</Text>
      <Text style={styles.boxName}>{name}</Text>
      <Text style={styles.boxTemp}>{temp}도</Text>
    </View>
  );
}

function AdviceRow({ title, reason, level }: { title: string; reason: string; level: string }) {
  return (
    <View style={styles.adviceRow}>
      <View style={styles.switchCopy}>
        <Text style={styles.adviceTitle}>{title}</Text>
        <Text style={styles.switchMeta}>{reason}</Text>
      </View>
      <StatusPill label={level === "none" ? "대기" : level.toUpperCase()} tone={level === "required" ? "warm" : "sky"} />
    </View>
  );
}

function ConditionRow({ title, value, onChange }: { title: string; value: string; onChange: () => void }) {
  return (
    <View style={styles.conditionRow}>
      <View style={styles.switchCopy}>
        <Text style={styles.adviceTitle}>{title}</Text>
        <Text style={styles.conditionValue}>{value}</Text>
      </View>
      <AppButton label="변경" onPress={onChange} tone="secondary" />
    </View>
  );
}

const styles = StyleSheet.create({
  compareRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  weatherBox: {
    flex: 1,
    minHeight: 112,
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  boxLabel: {
    color: appColors.clear,
    fontSize: 12,
    fontWeight: "900",
  },
  boxName: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  boxTemp: {
    color: appColors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  diffText: {
    color: appColors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  adviceRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  resultBox: {
    gap: 4,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(103,232,208,0.12)",
    borderWidth: 1,
    borderColor: "rgba(103,232,208,0.26)",
  },
  resultTitle: {
    color: appColors.clear,
    fontSize: 14,
    fontWeight: "900",
  },
  conditionRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  conditionValue: {
    color: appColors.clear,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 18,
    marginTop: 3,
  },
  adviceTitle: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  switchRow: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  permissionLine: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  switchCopy: {
    flex: 1,
  },
  switchTitle: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  switchMeta: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
