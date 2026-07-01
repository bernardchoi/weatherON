import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { onboardingAssets, uiIconAssets } from "../assets";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

export function DestinationCareScreen({
  permissionReady,
  state,
  destinationCareEnabled,
  selectedDestinationAlertCondition,
  selectedDestinationSchedulePreference,
  selectedDestinationTravelEstimate,
  selectedDestinationPlace,
  onNavigate,
  onOpenAlertSettings,
  onToggleDestinationCare,
  onCycleDestinationAlertCondition,
  onCycleDestinationSchedulePreference,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const care = state.destinationCare;
  const originWeather = care.originWeather;
  const destinationWeather = care.destinationWeather;
  const headerTitle = selectedDestinationPlace?.name ?? care.name;
  const departureTime = getRecommendedDepartureTime(care);
  const targetArrivalTime = care.departureAdvice?.targetArrivalTime ?? selectedDestinationSchedulePreference.targetArrivalTime;
  const travelMinutes = care.departureAdvice?.travelMinutes ?? selectedDestinationTravelEstimate.travelMinutes;
  const bufferMinutes = care.departureAdvice?.bufferMinutes ?? selectedDestinationSchedulePreference.bufferMinutes;
  const prepAlertTime = subtractMinutes(departureTime, 40);
  const rainAlertTime = subtractMinutes(departureTime, 10);
  const originRain = originWeather.current.rainProbabilityPct;
  const destinationRain = destinationWeather.current.rainProbabilityPct;
  const ctaLabel = getCareCtaLabel(permissionReady, destinationCareEnabled);

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
          <View style={styles.decisionTop}>
            <View style={styles.decisionCopy}>
              <Text style={[styles.decisionEyebrow, { color: theme.gold }]}>목적지에서 바로 판단</Text>
              <Text style={[styles.decisionTitle, { color: theme.text }]}>{departureTime}에 나가면 {targetArrivalTime} 도착</Text>
              <Text style={[styles.decisionBody, { color: theme.muted }]}>
                현재 위치와 목적지 날씨 차이를 보고 출발시간, 강수 변화, 비 그침 알림을 한 번에 맞춤
              </Text>
            </View>
            <View style={[styles.decisionImageFrame, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}>
              <Image source={onboardingAssets.destinationCare} style={styles.decisionImage} resizeMode="cover" />
            </View>
          </View>
          <View style={styles.decisionStats}>
            <DecisionStat icon={uiIconAssets.depart} label="출발" value={departureTime} meta={`이동 ${travelMinutes}분`} color={theme.gold} theme={theme} />
            <DecisionStat icon={uiIconAssets.drop} label="목적지 비" value={`${destinationRain}%`} meta={`출발지 ${originRain}%`} color={theme.sky} theme={theme} />
            <DecisionStat icon={uiIconAssets.clock} label="다음 알림" value={rainAlertTime} meta={destinationCareEnabled ? "알림 가능" : permissionReady ? "꺼짐" : "권한 필요"} color={theme.clear} theme={theme} />
          </View>
        </View>

        {!permissionReady ? (
          <InfoPanel tone="warm" title="푸시 알림 대기" pill="권한 필요" theme={theme}>
            <Text style={[styles.panelBody, { color: theme.text }]}>목적지 비교와 출발 시간은 사용 가능함. 알림을 받으려면 아래 버튼으로 권한을 켜야 함</Text>
          </InfoPanel>
        ) : null}

        <View style={[styles.comparePanel, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.muted }]}>현재 위치 · 목적지 날씨 비교</Text>
          <CompareRow label="기온" from={`${Math.round(originWeather.current.tempC)}°`} to={`${Math.round(destinationWeather.current.tempC)}°`} accent={theme.text} theme={theme} />
          <CompareRow label="날씨" from={getConditionLabel(originWeather.current.condition)} to={getConditionLabel(destinationWeather.current.condition)} accent={theme.text} theme={theme} />
          <CompareRow label="출발지" from={originWeather.locationName} to={selectedDestinationPlace?.name ?? destinationWeather.locationName} accent={theme.text} theme={theme} />
          <CompareRow label="강수" from={`${originRain}%`} to={`${destinationRain}%`} accent={destinationRain > originRain ? theme.warm : theme.clear} theme={theme} />
        </View>

        <View style={[styles.departurePanel, { backgroundColor: theme.card, borderLeftColor: theme.gold }]}>
          <Text style={[styles.sectionTitle, { color: theme.muted }]}>출발시간 역산</Text>
          <Text style={[styles.departureMeta, { color: theme.text }]}>도착 희망 {targetArrivalTime}</Text>
          <Text style={[styles.departureMeta, { color: theme.text }]}>− 소요시간 {travelMinutes}분 − 여유 {bufferMinutes}분</Text>
          <Text style={[styles.departureSource, { color: theme.subtle }]}>
            {getTravelEstimateCopy(selectedDestinationTravelEstimate.status, selectedDestinationTravelEstimate.provider, selectedDestinationTravelEstimate.distanceMeters)}
          </Text>
          <Text style={[styles.departureTime, { color: theme.gold }]}>{departureTime} <Text style={styles.departureSuffix}>출발</Text></Text>
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
              <Text style={[styles.sectionTitle, { color: theme.muted }]}>알림 조건</Text>
              <Text style={[styles.conditionSummary, { color: theme.text }]}>
                강수 {selectedDestinationAlertCondition.rainThresholdPct}% · 출발 {selectedDestinationAlertCondition.leadTimeMinutes}분 전 · 바람 {selectedDestinationAlertCondition.windThresholdMs}m/s
              </Text>
            </View>
            <Pressable
              accessibilityLabel="알림 설정 상세로 이동"
              accessibilityRole="button"
              onPress={() => onOpenAlertSettings("G2", "destination")}
              style={[styles.detailButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
            >
              <Text style={[styles.detailButtonText, { color: theme.text }]}>상세</Text>
            </Pressable>
          </View>
          <View style={styles.conditionGrid}>
            <ConditionButton
              label="도착 희망"
              value={targetArrivalTime}
              accessibilityLabel={`도착 희망 ${targetArrivalTime}, 조정`}
              onPress={() => onCycleDestinationSchedulePreference("targetArrivalTime")}
              theme={theme}
            />
            <ConditionButton
              label="여유 시간"
              value={`${bufferMinutes}분`}
              accessibilityLabel={`여유 시간 ${bufferMinutes}분, 조정`}
              onPress={() => onCycleDestinationSchedulePreference("bufferMinutes")}
              theme={theme}
            />
          </View>
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
  onPress: () => void;
  theme: AppTheme;
}) {
  return (
    <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" onPress={onPress} style={[styles.conditionButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
      <Text style={[styles.conditionLabel, { color: theme.subtle }]}>{label}</Text>
      <Text style={[styles.conditionValue, { color: theme.gold }]}>{value}</Text>
    </Pressable>
  );
}

function DecisionStat({
  icon,
  label,
  value,
  meta,
  color,
  theme,
}: {
  icon: number;
  label: string;
  value: string;
  meta: string;
  color: string;
  theme: AppTheme;
}) {
  return (
    <View style={[styles.decisionStat, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
      <View style={styles.decisionStatTop}>
        <Image source={icon} style={[styles.decisionStatIcon, { tintColor: color }]} resizeMode="contain" />
        <Text style={[styles.decisionStatLabel, { color }]}>{label}</Text>
      </View>
      <Text style={[styles.decisionStatValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.decisionStatMeta, { color: theme.muted }]}>{meta}</Text>
    </View>
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

function getTravelEstimateCopy(status: P0ScreenProps["selectedDestinationTravelEstimate"]["status"], provider: P0ScreenProps["selectedDestinationTravelEstimate"]["provider"], distanceMeters: number) {
  const source = provider === "kakao" && status === "ready"
    ? "Kakao Directions"
    : provider === "google" && status === "ready"
      ? "Google Distance Matrix"
      : status === "error"
        ? "갱신 실패"
        : "좌표 추정";
  if (!distanceMeters) return source;
  return `${source} · ${(distanceMeters / 1000).toFixed(1)}km`;
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
    width: 40,
    height: 40,
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
  decisionStats: {
    flexDirection: "row",
    gap: spacing.xs,
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
  departureSource: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
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
  detailButton: {
    minHeight: 36,
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
