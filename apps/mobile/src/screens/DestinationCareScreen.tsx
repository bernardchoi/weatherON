import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { uiIconAssets } from "../assets";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";
import { formatDistance, formatTemperature } from "../utils/units";

export function DestinationCareScreen({
  permissionReady,
  state,
  destinationCareEnabled,
  selectedDestinationAlertCondition,
  selectedDestinationSchedulePreference,
  selectedDestinationTravelEstimate,
  selectedDestinationPlace,
  temperatureUnit,
  distanceUnit,
  onNavigate,
  onOpenAlertSettings,
  onToggleDestinationCare,
  onCycleDestinationAlertCondition,
  onSetDestinationTargetArrivalTime,
  onSetDestinationTransportMode,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const care = state.destinationCare;
  const originWeather = care.originWeather;
  const destinationWeather = care.destinationWeather;
  const headerTitle = selectedDestinationPlace?.name ?? care.name;
  const departureTime = getRecommendedDepartureTime(care);
  const targetArrivalTime = care.departureAdvice?.targetArrivalTime ?? selectedDestinationSchedulePreference.targetArrivalTime;
  const travelMinutes = care.departureAdvice?.travelMinutes ?? selectedDestinationTravelEstimate.travelMinutes;
  const bufferMinutes = care.departureAdvice?.bufferMinutes ?? 10;
  const transportMode = care.departureAdvice?.transportMode ?? selectedDestinationSchedulePreference.transportMode;
  const [arrivalInput, setArrivalInput] = useState(targetArrivalTime);
  const [conditionControlsOpen, setConditionControlsOpen] = useState(false);
  const prepAlertTime = subtractMinutes(departureTime, 40);
  const rainAlertTime = subtractMinutes(departureTime, 10);
  const originRain = originWeather.current.rainProbabilityPct;
  const destinationRain = destinationWeather.current.rainProbabilityPct;
  const ctaLabel = getCareCtaLabel(permissionReady, destinationCareEnabled);

  useEffect(() => {
    setArrivalInput(targetArrivalTime);
  }, [targetArrivalTime]);

  const handleArrivalInputChange = (segment: ArrivalTimeSegment, value: string) => {
    const nextValue = getNextSegmentedArrivalInput(arrivalInput, segment, value);
    setArrivalInput(nextValue);
    if (isValidArrivalTime(nextValue)) onSetDestinationTargetArrivalTime(nextValue);
  };

  const handleArrivalInputBlur = () => {
    const nextValue = normalizeSegmentedArrivalInput(arrivalInput, targetArrivalTime);
    setArrivalInput(nextValue);
    if (isValidArrivalTime(nextValue)) onSetDestinationTargetArrivalTime(nextValue);
  };

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => onNavigate("G1")} style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.backGlyph, { color: theme.text }]}>‹</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <View style={styles.headerTitleRow}>
              <Image source={uiIconAssets.pin} style={[styles.headerIcon, { tintColor: theme.text }]} resizeMode="contain" />
              <Text style={[styles.title, { color: theme.text }]}>{headerTitle}</Text>
            </View>
            <Text style={[styles.subtitle, { color: theme.subtle }]}>목적지 기준 알림 미리보기</Text>
          </View>
        </View>

        <View style={[styles.decisionPanel, { backgroundColor: theme.card, borderColor: theme.gold }]}>
          <View style={styles.decisionHeader}>
            <View style={styles.decisionCopy}>
              <Text style={[styles.decisionEyebrow, { color: theme.gold }]}>출발시간 역산</Text>
              <Text style={[styles.decisionTitle, { color: theme.text }]}>{departureTime} 출발</Text>
              <Text style={[styles.decisionBody, { color: theme.muted }]}>
                {targetArrivalTime} 도착 · {getTransportModeLabel(transportMode)} {travelMinutes}분 · 자동 여유 {bufferMinutes}분
              </Text>
            </View>
            <View style={[styles.careStatePill, { backgroundColor: destinationCareEnabled ? "rgba(47,198,163,0.16)" : theme.cardStrong, borderColor: destinationCareEnabled ? theme.clear : theme.border }]}>
              <Text style={[styles.careStateText, { color: destinationCareEnabled ? theme.clear : theme.subtle }]}>
                {destinationCareEnabled ? "케어 ON" : "케어 OFF"}
              </Text>
            </View>
          </View>
          <Text style={[styles.decisionSummary, { color: theme.text }]}>
            목적지 날씨와 이동 시간을 기준으로 출발, 신발, 우산 알림을 조정함
          </Text>
          <View style={styles.arrivalControls}>
            <ArrivalInputControl
              label="도착 희망"
              value={arrivalInput}
              caption="숫자만 입력"
              onChangeText={handleArrivalInputChange}
              onBlur={handleArrivalInputBlur}
              theme={theme}
            />
            <ArrivalControl
              label="자동 여유"
              value={`${bufferMinutes}분`}
              caption="현재시각 기준"
              theme={theme}
            />
          </View>
          <View style={styles.transportGrid}>
            {transportOptions.map((option) => (
              <TransportOption
                key={option.mode}
                active={transportMode === option.mode}
                label={option.label}
                caption={option.caption}
                onPress={() => onSetDestinationTransportMode(option.mode)}
                theme={theme}
              />
            ))}
          </View>
          {transportMode === "transit" ? (
            <Text style={[styles.transportNotice, { color: theme.warm }]}>대중교통은 배차/환승 변동 가능</Text>
          ) : null}
          <View style={[styles.calculationStrip, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <Text style={[styles.calculationText, { color: theme.text }]}>
              {getDepartureFormulaCopy(targetArrivalTime, travelMinutes, bufferMinutes, selectedDestinationTravelEstimate.status)}
            </Text>
            <Text style={[styles.calculationMeta, { color: theme.subtle }]}>
              {getTravelEstimateCopy(selectedDestinationTravelEstimate.status, selectedDestinationTravelEstimate.provider, selectedDestinationTravelEstimate.distanceMeters, distanceUnit)}
            </Text>
          </View>
        </View>

        {!permissionReady ? (
          <InfoPanel tone="warm" title="푸시 알림 대기" pill="권한 필요" theme={theme}>
            <Text style={[styles.panelBody, { color: theme.text }]}>목적지 비교와 출발 시간은 사용 가능함. 알림을 받으려면 아래 버튼으로 권한을 켜야 함</Text>
          </InfoPanel>
        ) : null}

          <View style={[styles.comparePanel, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.muted }]}>현재 위치 · 목적지 날씨 비교</Text>
          <CompareRow label="기온" from={formatTemperature(originWeather.current.tempC, temperatureUnit)} to={formatTemperature(destinationWeather.current.tempC, temperatureUnit)} accent={theme.text} theme={theme} />
          <CompareRow label="날씨" from={getConditionLabel(originWeather.current.condition)} to={getConditionLabel(destinationWeather.current.condition)} accent={theme.text} theme={theme} />
          <CompareRow label="출발지" from={originWeather.locationName} to={selectedDestinationPlace?.name ?? destinationWeather.locationName} accent={theme.text} theme={theme} />
          <CompareRow label="강수" from={`${originRain}%`} to={`${destinationRain}%`} accent={destinationRain > originRain ? theme.warm : theme.clear} theme={theme} />
        </View>

        <View style={[styles.flowPanel, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.muted }]}>출발 전 알림 흐름</Text>
          <TimelineItem time={prepAlertTime} label="출발 준비 확인" icon={uiIconAssets.clock} color={theme.sky} active={false} theme={theme} />
          <TimelineItem time={rainAlertTime} label="목적지 강수 확인" icon={uiIconAssets.rain} color={theme.clear} active={false} theme={theme} />
          <TimelineItem time={departureTime} label="출발 시각 알림" icon={uiIconAssets.depart} color={theme.gold} active theme={theme} />
        </View>

        <View style={[styles.conditionPanel, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.conditionHeader}>
            <View style={styles.conditionCopy}>
              <Text style={[styles.sectionTitle, { color: theme.muted }]}>적용 중인 알림 조건</Text>
              <Text style={[styles.conditionSummary, { color: theme.text }]}>
                강수 {selectedDestinationAlertCondition.rainThresholdPct}% · 출발 {selectedDestinationAlertCondition.leadTimeMinutes}분 전 · 바람 {selectedDestinationAlertCondition.windThresholdMs}m/s
              </Text>
            </View>
            <Pressable
              accessibilityLabel="알림 전체 설정으로 이동"
              accessibilityRole="button"
              onPress={() => onOpenAlertSettings("G2", "destination")}
              style={[styles.detailButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
            >
              <Text style={[styles.detailButtonText, { color: theme.text }]}>전체 설정</Text>
            </Pressable>
          </View>

          <View style={styles.conditionSummaryGrid}>
            <ConditionSummaryPill label="강수 기준" value={`${selectedDestinationAlertCondition.rainThresholdPct}% 이상`} theme={theme} />
            <ConditionSummaryPill label="출발 알림" value={`${selectedDestinationAlertCondition.leadTimeMinutes}분 전`} theme={theme} />
            <ConditionSummaryPill label="바람 기준" value={`${selectedDestinationAlertCondition.windThresholdMs}m/s`} theme={theme} />
            <ConditionSummaryPill label="자동 여유" value={`${bufferMinutes}분`} theme={theme} />
            <ConditionSummaryPill label="이동수단" value={getTransportModeLabel(transportMode)} theme={theme} />
            {transportMode === "transit" ? <ConditionSummaryPill label="대중교통" value="배차/환승 변동 가능" tone="warm" theme={theme} /> : null}
          </View>

          <Pressable
            accessibilityLabel={conditionControlsOpen ? "알림 조건 직접 조정 닫기" : "알림 조건 직접 조정 열기"}
            accessibilityRole="button"
            onPress={() => setConditionControlsOpen((current) => !current)}
            style={[styles.conditionToggle, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
          >
            <Text style={[styles.conditionToggleText, { color: theme.text }]}>
              {conditionControlsOpen ? "조건 직접 조정 닫기" : "조건 직접 조정"}
            </Text>
            <Text style={[styles.conditionToggleIcon, { color: theme.gold }]}>{conditionControlsOpen ? "접기" : "열기"}</Text>
          </Pressable>

          {conditionControlsOpen ? (
            <View style={styles.conditionGrid}>
              <ConditionButton
                label="강수 기준"
                value={`${selectedDestinationAlertCondition.rainThresholdPct}%`}
                accessibilityLabel={`강수 기준 ${selectedDestinationAlertCondition.rainThresholdPct}%, 조정`}
                onPress={() => onCycleDestinationAlertCondition("rainThresholdPct")}
                theme={theme}
              />
              <ConditionButton
                label="출발 전"
                value={`${selectedDestinationAlertCondition.leadTimeMinutes}분`}
                accessibilityLabel={`출발 전 ${selectedDestinationAlertCondition.leadTimeMinutes}분, 조정`}
                onPress={() => onCycleDestinationAlertCondition("leadTimeMinutes")}
                theme={theme}
              />
              <ConditionButton
                label="바람 기준"
                value={`${selectedDestinationAlertCondition.windThresholdMs}m/s`}
                accessibilityLabel={`바람 기준 ${selectedDestinationAlertCondition.windThresholdMs}미터 매초, 조정`}
                onPress={() => onCycleDestinationAlertCondition("windThresholdMs")}
                theme={theme}
              />
            </View>
          ) : null}
        </View>

        <Pressable
          accessibilityLabel={ctaLabel}
          accessibilityRole="button"
          onPress={onToggleDestinationCare}
          style={({ pressed }) => [styles.cta, { backgroundColor: theme.gold, opacity: pressed ? 0.86 : 1 }]}
        >
          <Text style={[styles.ctaText, { color: theme.onAccent }]}>{ctaLabel}</Text>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function ConditionButton({
  label,
  value,
  accessibilityLabel,
  onPress,
  theme,
}: {
  label: string;
  value: string;
  accessibilityLabel: string;
  onPress?: () => void;
  theme: AppTheme;
}) {
  const content = (
    <>
      <Text style={[styles.conditionLabel, { color: theme.subtle }]}>{label}</Text>
      <Text style={[styles.conditionValue, { color: theme.gold }]}>{value}</Text>
    </>
  );
  if (!onPress) {
    return (
      <View accessibilityLabel={accessibilityLabel} style={[styles.conditionButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
        {content}
      </View>
    );
  }
  return (
    <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" onPress={onPress} style={[styles.conditionButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
      {content}
    </Pressable>
  );
}

function ConditionSummaryPill({
  label,
  value,
  tone = "default",
  theme,
}: {
  label: string;
  value: string;
  tone?: "default" | "warm";
  theme: AppTheme;
}) {
  const accent = tone === "warm" ? theme.warm : theme.gold;
  return (
    <View style={[styles.conditionSummaryPill, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
      <Text numberOfLines={1} style={[styles.conditionSummaryLabel, { color: theme.subtle }]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.conditionSummaryValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

function ArrivalInputControl({
  label,
  value,
  caption,
  onChangeText,
  onBlur,
  theme,
}: {
  label: string;
  value: string;
  caption: string;
  onChangeText: (segment: ArrivalTimeSegment, value: string) => void;
  onBlur: () => void;
  theme: AppTheme;
}) {
  const { hour, minute } = getArrivalInputParts(value);
  return (
    <View style={[styles.arrivalControl, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
      <View style={styles.arrivalControlCopy}>
        <Text style={[styles.arrivalControlLabel, { color: theme.subtle }]}>{label}</Text>
        <View style={styles.arrivalTimeRow}>
          <TextInput
            accessibilityLabel={`${label} 시 입력`}
            keyboardType="number-pad"
            maxLength={2}
            onBlur={onBlur}
            onChangeText={(nextValue) => onChangeText("hour", nextValue)}
            placeholder="시"
            placeholderTextColor={theme.subtle}
            style={[styles.arrivalTimeInput, { color: theme.text, borderColor: theme.border }]}
            value={hour}
          />
          <Text style={[styles.arrivalTimeColon, { color: theme.subtle }]}>:</Text>
          <TextInput
            accessibilityLabel={`${label} 분 입력`}
            keyboardType="number-pad"
            maxLength={2}
            onBlur={onBlur}
            onChangeText={(nextValue) => onChangeText("minute", nextValue)}
            placeholder="분"
            placeholderTextColor={theme.subtle}
            style={[styles.arrivalTimeInput, { color: theme.text, borderColor: theme.border }]}
            value={minute}
          />
        </View>
      </View>
      <Text style={[styles.arrivalControlCaption, { color: theme.gold }]}>{caption}</Text>
    </View>
  );
}

function ArrivalControl({
  label,
  value,
  caption,
  theme,
}: {
  label: string;
  value: string;
  caption: string;
  theme: AppTheme;
}) {
  return (
    <View style={[styles.arrivalControl, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
      <View style={styles.arrivalControlCopy}>
        <Text style={[styles.arrivalControlLabel, { color: theme.subtle }]}>{label}</Text>
        <Text style={[styles.arrivalControlValue, { color: theme.text }]}>{value}</Text>
      </View>
      <Text style={[styles.arrivalControlCaption, { color: theme.gold }]}>{caption}</Text>
    </View>
  );
}

const transportOptions: Array<{ mode: P0ScreenProps["selectedDestinationSchedulePreference"]["transportMode"]; label: string; caption: string }> = [
  { mode: "auto", label: "자동", caption: "기본 경로" },
  { mode: "walk", label: "도보", caption: "걷는 시간" },
  { mode: "drive", label: "자차", caption: "도로 기준" },
  { mode: "transit", label: "대중교통", caption: "배차 변동" },
];

type ArrivalTimeSegment = "hour" | "minute";

function TransportOption({
  active,
  label,
  caption,
  onPress,
  theme,
}: {
  active: boolean;
  label: string;
  caption: string;
  onPress: () => void;
  theme: AppTheme;
}) {
  return (
    <Pressable
      accessibilityLabel={`${label} 이동수단 선택`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.transportOption,
        {
          backgroundColor: active ? theme.cardStrong : theme.cardMuted,
          borderColor: active ? theme.gold : theme.border,
        },
      ]}
    >
      <Text style={[styles.transportLabel, { color: active ? theme.gold : theme.text }]}>{label}</Text>
      <Text style={[styles.transportCaption, { color: theme.subtle }]}>{caption}</Text>
    </Pressable>
  );
}

function InfoPanel({
  tone,
  title,
  pill,
  theme,
  children,
}: {
  tone: "clear" | "warm";
  title: string;
  pill?: string;
  theme: AppTheme;
  children: React.ReactNode;
}) {
  const accent = tone === "clear" ? theme.clear : theme.warm;
  return (
    <View style={[styles.infoPanel, { backgroundColor: theme.card, borderLeftColor: accent }]}>
      <View style={styles.infoHeader}>
        <Text style={[styles.infoTitle, { color: accent }]}>{title}</Text>
        {pill ? (
          <View style={[styles.infoPill, { backgroundColor: theme.cardStrong }]}>
            <Text style={[styles.infoPillText, { color: accent }]}>{pill}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function CompareRow({ label, from, to, accent, theme }: { label: string; from: string; to: string; accent: string; theme: AppTheme }) {
  return (
    <View style={styles.compareRow}>
      <Text style={[styles.compareLabel, { color: theme.subtle }]}>{label}</Text>
      <Text style={[styles.compareValue, { color: theme.text }]}>{from}</Text>
      <Text style={[styles.compareArrow, { color: theme.subtle }]}>→</Text>
      <Text style={[styles.compareValue, { color: accent }]}>{to}</Text>
    </View>
  );
}

function TimelineItem({
  time,
  label,
  icon,
  color,
  active,
  theme,
}: {
  time: string;
  label: string;
  icon: number;
  color: string;
  active: boolean;
  theme: AppTheme;
}) {
  const resolvedColor = active ? theme.gold : color;
  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineIcon, { backgroundColor: active ? theme.gold : theme.cardStrong, borderColor: resolvedColor }]}>
        <Image source={icon} style={[styles.timelineIconImage, { tintColor: active ? theme.onAccent : resolvedColor }]} resizeMode="contain" />
      </View>
      <Text style={[styles.timelineTime, { color: resolvedColor }]}>{time}</Text>
      <Text style={[styles.timelineLabel, { color: theme.text }]}>{label}</Text>
    </View>
  );
}

function getRecommendedDepartureTime(care: P0ScreenProps["state"]["destinationCare"]) {
  const targetArrivalTime = care.departureAdvice?.targetArrivalTime;
  const travelMinutes = care.departureAdvice?.travelMinutes;
  const bufferMinutes = care.departureAdvice?.bufferMinutes ?? 10;
  if (!targetArrivalTime || !travelMinutes) return care.departureAdvice?.recommendedDepartureTime ?? "08:10";
  return care.departureAdvice?.recommendedDepartureTime ?? subtractMinutes(targetArrivalTime, travelMinutes + bufferMinutes);
}

function getTravelEstimateCopy(
  status: P0ScreenProps["selectedDestinationTravelEstimate"]["status"],
  provider: P0ScreenProps["selectedDestinationTravelEstimate"]["provider"],
  distanceMeters: number,
  distanceUnit: P0ScreenProps["distanceUnit"],
) {
  const source = provider === "kakao" && status === "ready"
    ? "Kakao Directions"
    : provider === "google" && status === "ready"
      ? "Google Distance Matrix"
      : status === "error"
        ? "갱신 실패"
        : "경로 미검증";
  const distanceText = formatDistance(distanceMeters, distanceUnit);
  if (!distanceText) return source;
  return `${source} · ${distanceText}`;
}

function getTransportModeLabel(mode: P0ScreenProps["selectedDestinationSchedulePreference"]["transportMode"]) {
  if (mode === "walk") return "도보";
  if (mode === "drive") return "자차";
  if (mode === "transit") return "대중교통";
  return "자동";
}

function getDepartureFormulaCopy(
  targetArrivalTime: string,
  travelMinutes: number,
  bufferMinutes: number,
  status: P0ScreenProps["selectedDestinationTravelEstimate"]["status"],
) {
  const base = `${targetArrivalTime} - 이동 ${travelMinutes}분 - 여유 ${bufferMinutes}분`;
  if (status === "ready") return `계산식 ${base}`;
  if (status === "error") return `계산식 ${base} · 경로 갱신 실패`;
  return `데모 계산 ${base} · 실사용 전 경로 QA 필요`;
}

function isValidArrivalTime(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function getNextSegmentedArrivalInput(currentValue: string, segment: ArrivalTimeSegment, nextRawValue: string) {
  const { hour, minute } = getArrivalInputParts(currentValue);
  const nextValue = nextRawValue.replace(/\D/g, "").slice(0, 2);
  return segment === "hour" ? `${nextValue}:${minute}` : `${hour}:${nextValue}`;
}

function normalizeSegmentedArrivalInput(value: string, fallback: string) {
  const { hour, minute } = getArrivalInputParts(value);
  const normalizedHour = normalizeTimePart(hour, 23);
  const normalizedMinute = normalizeTimePart(minute, 59);
  if (!normalizedHour || !normalizedMinute) return fallback;
  return `${normalizedHour}:${normalizedMinute}`;
}

function normalizeTimePart(value: string, maxValue: number) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  const numberValue = Math.min(Number(digits), maxValue);
  if (!Number.isFinite(numberValue)) return null;
  return String(numberValue).padStart(2, "0");
}

function getArrivalInputParts(value: string) {
  const [rawHour = "", rawMinute = ""] = value.split(":");
  return {
    hour: rawHour.replace(/\D/g, "").slice(0, 2),
    minute: rawMinute.replace(/\D/g, "").slice(0, 2),
  };
}

function subtractMinutes(time: string, minutes: number) {
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return time;
  const dayMinutes = 24 * 60;
  const total = ((hour * 60 + minute - minutes) % dayMinutes + dayMinutes) % dayMinutes;
  const nextHour = Math.floor(total / 60);
  const nextMinute = total % 60;
  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
}

function getConditionLabel(condition: string) {
  if (condition === "clear") return "맑음";
  if (condition === "cloud") return "흐림";
  if (condition === "rain") return "비";
  if (condition === "snow") return "눈";
  if (condition === "storm") return "폭풍";
  if (condition === "dust") return "먼지";
  return condition;
}

function getCareCtaLabel(permissionReady: boolean, destinationCareEnabled: boolean) {
  if (destinationCareEnabled) return "목적지 케어 끄기";
  if (!permissionReady) return "알림 권한 켜고 케어 시작";
  return "목적지 케어 켜기";
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.sm,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 188,
    minHeight: "100%",
  },
  atmosphere: {
    position: "absolute",
    left: -32,
    right: -32,
    bottom: -110,
    height: 300,
    opacity: 0.72,
    borderTopLeftRadius: 160,
    borderTopRightRadius: 160,
  },
  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  backGlyph: {
    marginTop: -2,
    fontSize: 30,
    lineHeight: 30,
    fontWeight: "300",
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  headerIcon: {
    width: 17,
    height: 17,
  },
  title: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  decisionPanel: {
    gap: spacing.sm,
    padding: 16,
    borderRadius: radius.lg,
    borderLeftWidth: 2,
  },
  decisionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  decisionTop: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.md,
  },
  decisionCopy: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  decisionImageFrame: {
    width: 86,
    height: 104,
    overflow: "hidden",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  decisionImage: {
    width: "100%",
    height: "100%",
  },
  decisionEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  decisionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: 0,
  },
  decisionBody: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800",
  },
  careStatePill: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  careStateText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  decisionSummary: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
  },
  decisionStats: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  arrivalControls: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  arrivalControl: {
    flex: 1,
    minHeight: 62,
    justifyContent: "space-between",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 9,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  arrivalControlCopy: {
    gap: 2,
  },
  arrivalControlLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  arrivalControlValue: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  arrivalTimeRow: {
    minHeight: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  arrivalTimeInput: {
    width: 32,
    minHeight: 28,
    paddingHorizontal: 4,
    paddingVertical: 0,
    borderBottomWidth: 1,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  arrivalTimeColon: {
    width: 7,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  arrivalControlCaption: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  calculationStrip: {
    gap: 4,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  calculationText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  calculationMeta: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  decisionStat: {
    flex: 1,
    minHeight: 78,
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  decisionStatTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  decisionStatIcon: {
    width: 13,
    height: 13,
  },
  decisionStatLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  decisionStatValue: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  decisionStatMeta: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
  },
  infoPanel: {
    gap: 6,
    padding: 16,
    borderRadius: radius.lg,
    borderLeftWidth: 2,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  infoTitle: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  infoPill: {
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  infoPillText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  panelBody: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800",
  },
  comparePanel: {
    gap: spacing.sm,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    letterSpacing: 0,
  },
  compareRow: {
    minHeight: 23,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  compareLabel: {
    width: 42,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  compareValue: {
    minWidth: 42,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  compareArrow: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  departurePanel: {
    gap: spacing.sm,
    padding: 16,
    borderRadius: radius.lg,
    borderLeftWidth: 2,
  },
  departureMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  departureWarning: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  departureSource: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  departureFormula: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  departureTime: {
    marginTop: 2,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
  },
  departureSuffix: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  transportPanel: {
    gap: spacing.sm,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  transportGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  transportOption: {
    width: "48.7%",
    minHeight: 58,
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  transportLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  transportCaption: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  transportNotice: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
  },
  flowPanel: {
    gap: spacing.sm,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  conditionPanel: {
    gap: spacing.sm,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  conditionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  conditionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  conditionSummary: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "900",
  },
  conditionSummaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  conditionSummaryPill: {
    width: "48.7%",
    minHeight: 58,
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  conditionSummaryLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  conditionSummaryValue: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  detailButton: {
    minWidth: 54,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  detailButtonText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  conditionToggle: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  conditionToggleText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  conditionToggleIcon: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  conditionGrid: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  conditionButton: {
    flex: 1,
    minHeight: 62,
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  conditionLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  conditionValue: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  timelineItem: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  timelineIconImage: {
    width: 17,
    height: 17,
  },
  timelineTime: {
    width: 46,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
  },
  timelineLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  bottomSpacer: {
    height: 84,
  },
  ctaWrap: {
    paddingTop: spacing.xs,
  },
  cta: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  ctaText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    letterSpacing: 0,
  },
});
