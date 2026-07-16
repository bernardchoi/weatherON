import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import { BackButton } from "../components/BackButton";
import { BottomSheet } from "../components/BottomSheet";
import { FeedbackPressable } from "../components/FeedbackPressable";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing, type AppTheme } from "../theme/tokens";
import { getDestinationImageAsset } from "../utils/destinationImage";
import { formatDistance, formatTemperature, formatTemperatureDelta } from "../utils/units";

export function DestinationCareScreen({
  permissionReady,
  state,
  destinationCareEnabled,
  savedDestinations,
  selectedDestinationAlertCondition,
  selectedDestinationSchedulePreference,
  selectedDestinationTravelEstimate,
  selectedDestinationPlace,
  temperatureUnit,
  distanceUnit,
  onNavigate,
  onOpenAlertSettings,
  onToggleDestinationCare,
  onSetDestinationTargetArrivalTime,
  onSetDestinationTransportMode,
  onToggleDestinationRepeat,
  onToggleDestinationRepeatDay,
  onRemoveSavedDestination,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const care = state.destinationCare;
  const originWeather = care.originWeather;
  const destinationWeather = care.destinationWeather;
  const headerTitle = selectedDestinationPlace?.name ?? care.name;
  const justSaved = Boolean(
    selectedDestinationPlace && savedDestinations.find((destination) => destination.place.id === selectedDestinationPlace.id)?.savedAtLabel === "방금 저장",
  );
  const departureTime = getRecommendedDepartureTime(care);
  const targetArrivalTime = care.departureAdvice?.targetArrivalTime ?? selectedDestinationSchedulePreference.targetArrivalTime;
  const travelMinutes = care.departureAdvice?.travelMinutes;
  const bufferMinutes = care.departureAdvice?.bufferMinutes;
  const routeTimingReady = typeof travelMinutes === "number" && typeof bufferMinutes === "number";
  const transportMode = care.departureAdvice?.transportMode ?? selectedDestinationSchedulePreference.transportMode;
  const [conditionControlsOpen, setConditionControlsOpen] = useState(false);
  const [transportSelectorOpen, setTransportSelectorOpen] = useState(false);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [repeatDaysOpen, setRepeatDaysOpen] = useState(false);
  const [arrivalEditorOpen, setArrivalEditorOpen] = useState(false);
  const prepAlertTime = subtractMinutes(departureTime, 40);
  const rainAlertTime = subtractMinutes(departureTime, 10);
  const alertTimingCopy = routeTimingReady ? `${prepAlertTime}/${rainAlertTime}/${departureTime}` : "출발 알림 보류";
  const originRain = originWeather.current.rainProbabilityPct;
  const destinationRain = destinationWeather.current.rainProbabilityPct;
  const ctaLabel = getCareCtaLabel(permissionReady, destinationCareEnabled);
  const transportLabel = getTransportModeLabel(transportMode);
  const walkUnavailable = isWalkUnavailable(selectedDestinationTravelEstimate.distanceMeters);
  const repeatEnabled = selectedDestinationSchedulePreference.repeatEnabled;
  const repeatDays = selectedDestinationSchedulePreference.repeatDays;
  const repeatSummary = getRepeatSummary(repeatEnabled, repeatDays);
  const routeMeta = getTravelEstimateCopy(selectedDestinationTravelEstimate.status, selectedDestinationTravelEstimate.provider, selectedDestinationTravelEstimate.distanceMeters, distanceUnit);
  const destinationName = selectedDestinationPlace?.name ?? destinationWeather.locationName;
  const destinationSaved = Boolean(selectedDestinationPlace);
  const ctaAccent = destinationCareEnabled ? theme.warm : theme.gold;
  const bufferReason = getBufferReasonCopy(bufferMinutes, transportMode);
  const destinationImage = getDestinationImageAsset(selectedDestinationPlace);

  useEffect(() => {
    if (transportMode === "walk" && walkUnavailable) onSetDestinationTransportMode("auto");
  }, [onSetDestinationTransportMode, transportMode, walkUnavailable]);

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <BackButton onPress={() => onNavigate("G1")} />
          <View style={styles.headerCopy}>
            <View style={styles.headerTitleRow}>
              <Image source={uiIconAssets.pin} style={[styles.headerIcon, { tintColor: theme.text }]} resizeMode="contain" />
              <Text style={[styles.title, { color: theme.text }]}>{headerTitle}</Text>
            </View>
            <Text style={[styles.subtitle, { color: theme.subtle }]}>목적지 기준 알림 미리보기</Text>
          </View>
        </View>

        {justSaved ? (
          <View style={[styles.savedBanner, { backgroundColor: theme.cardStrong, borderColor: theme.clear }, cardShadow(theme)]}>
            <Text style={[styles.savedBannerTitle, { color: theme.clear }]}>목적지 저장 완료</Text>
            <Text style={[styles.savedBannerBody, { color: theme.muted }]}>아래 출발 시간과 날씨 비교가 이 목적지 기준으로 계산됨</Text>
          </View>
        ) : null}

        <View style={[styles.decisionPanel, { backgroundColor: theme.card, borderColor: theme.gold }, cardShadow(theme)]}>
          <View accessibilityLabel={`${headerTitle} 생성형 분위기 이미지`} style={[styles.decisionImageFrame, { borderColor: theme.border }]}>
            <Image source={destinationImage} style={styles.decisionImage} resizeMode="cover" />
            <View style={[styles.generatedImageBadge, { backgroundColor: theme.cardStrong }]}>
              <Text style={[styles.generatedImageBadgeText, { color: theme.subtle }]}>AI 이미지</Text>
            </View>
          </View>
          <View style={styles.decisionHeader}>
            <View style={styles.decisionCopy}>
              <Text style={[styles.decisionEyebrow, { color: theme.gold }]}>출발시간 역산</Text>
              <Text style={[styles.decisionTitle, { color: theme.text }]}>{routeTimingReady ? `${departureTime} 출발` : "경로 확인 전"}</Text>
              <Text style={[styles.decisionBody, { color: theme.muted }]}>
                {routeTimingReady ? `${targetArrivalTime} 도착 기준으로 이동 시간과 날씨를 함께 봄` : `${targetArrivalTime} 도착 기준 날씨만 먼저 확인`}
              </Text>
            </View>
            <View style={[styles.careStatePill, { backgroundColor: destinationCareEnabled ? "rgba(47,198,163,0.16)" : theme.cardStrong, borderColor: destinationCareEnabled ? theme.clear : theme.border }]}>
              <Text style={[styles.careStateText, { color: destinationCareEnabled ? theme.clear : theme.subtle }]}>
                {destinationCareEnabled ? "케어 ON" : "케어 OFF"}
              </Text>
            </View>
          </View>
          <View style={[styles.routeSummaryStrip, { backgroundColor: theme.cardMuted, borderColor: "transparent" }]}>
            <SummaryChip
              icon={uiIconAssets.clock}
              label="도착"
              value={targetArrivalTime}
              meta={routeTimingReady ? `${departureTime} 출발` : "출발 계산 보류"}
              color={theme.sky}
              theme={theme}
              accessibilityLabel={`도착 희망 시각 ${targetArrivalTime}, 시간 변경 시트 열기`}
              onPress={() => setArrivalEditorOpen(true)}
            />
            <SummaryChip
              icon={uiIconAssets.depart}
              label="이동"
              value={routeTimingReady ? `${travelMinutes}분` : "확인 전"}
              meta={routeTimingReady ? transportLabel : "해외 경로"}
              color={theme.gold}
              theme={theme}
              accessibilityLabel={`이동수단 ${transportLabel}, 선택 시트 열기`}
              onPress={() => setTransportSelectorOpen(true)}
            />
            <ArrivalControl
              label="자동 여유"
              value={routeTimingReady ? `${bufferMinutes}분` : "보류"}
              caption={bufferReason}
              theme={theme}
            />
          </View>

          <RepeatSchedulePanel
            repeatEnabled={repeatEnabled}
            repeatDays={repeatDays}
            repeatDaysOpen={repeatDaysOpen}
            repeatSummary={repeatSummary}
            onToggleRepeat={onToggleDestinationRepeat}
            onToggleRepeatDays={() => setRepeatDaysOpen((current) => !current)}
            onToggleRepeatDay={onToggleDestinationRepeatDay}
            theme={theme}
          />
        </View>

        {!permissionReady ? (
          <InfoPanel tone="warm" title="푸시 알림 대기" pill="권한 필요" theme={theme}>
            <Text style={[styles.panelBody, { color: theme.text }]}>목적지 비교와 출발 시간은 사용 가능함. 알림을 받으려면 아래 버튼으로 권한을 켜야 함</Text>
          </InfoPanel>
        ) : null}

        <View style={[styles.detailPanel, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow(theme)]}>
          <FeedbackPressable
            accessibilityLabel={detailPanelOpen ? "날씨 비교와 알림 상세 닫기" : "날씨 비교와 알림 상세 열기"}
            accessibilityRole="button"
            accessibilityState={{ expanded: detailPanelOpen }}
            onPress={() => setDetailPanelOpen((current) => !current)}
            style={styles.detailPanelHeader}
          >
            <View style={styles.conditionCopy}>
              <Text style={[styles.sectionTitle, { color: theme.muted }]}>날씨 비교 · 알림</Text>
              <Text style={[styles.conditionSummary, { color: theme.text }]}>
                강수 {originRain}% → {destinationRain}% · {alertTimingCopy}
              </Text>
            </View>
            <Text style={[styles.settingsChevron, { color: theme.gold }]}>{detailPanelOpen ? "닫기" : "상세"}</Text>
          </FeedbackPressable>

          <DropdownMotion visible={detailPanelOpen} maxHeight={520}>
            <>
              <View style={styles.compareGrid}>
                <CompareMetric
                  label="기온"
                  value={`${formatTemperature(originWeather.current.tempC, temperatureUnit)} → ${formatTemperature(destinationWeather.current.tempC, temperatureUnit)}`}
                  meta={formatTemperatureDelta(destinationWeather.current.tempC - originWeather.current.tempC, temperatureUnit)}
                  accent={theme.text}
                  theme={theme}
                />
                <CompareMetric
                  label="강수"
                  value={`${originRain}% → ${destinationRain}%`}
                  meta={destinationRain > originRain ? "목적지 높음" : "차이 작음"}
                  accent={destinationRain > originRain ? theme.warm : theme.clear}
                  theme={theme}
                />
                <CompareMetric
                  label="날씨"
                  value={`${getConditionLabel(originWeather.current.condition)} → ${getConditionLabel(destinationWeather.current.condition)}`}
                  meta={destinationName}
                  accent={theme.text}
                  theme={theme}
                />
                <CompareMetric
                  label="경로"
                  value={transportLabel}
                  meta={routeMeta}
                  accent={theme.gold}
                  theme={theme}
                />
              </View>

              <View style={styles.timelineCompact}>
                <TimelineItem time={prepAlertTime} label="출발 준비 확인" icon={uiIconAssets.clock} color={theme.sky} active={false} theme={theme} />
                <TimelineItem time={rainAlertTime} label="목적지 강수 확인" icon={uiIconAssets.rain} color={theme.clear} active={false} theme={theme} />
                <TimelineItem time={departureTime} label="출발 시각 알림" icon={uiIconAssets.depart} color={theme.gold} active theme={theme} />
              </View>

              <View style={styles.conditionHeader}>
                <View style={styles.conditionCopy}>
                  <Text style={[styles.sectionTitle, { color: theme.muted }]}>자동 알림 기준</Text>
                  <Text style={[styles.conditionSummary, { color: theme.text }]}>
                    강수 {selectedDestinationAlertCondition.rainThresholdPct}% 이상이면 우산/강수 알림, 출발 {selectedDestinationAlertCondition.leadTimeMinutes}분 전 목적지 날씨 확인
                  </Text>
                </View>
                <FeedbackPressable
                  accessibilityLabel="목적지 알림 고급 설정으로 이동"
                  accessibilityRole="button"
                  onPress={() => onOpenAlertSettings("G2", "destination")}
                  style={[styles.detailButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
                >
                  <Text style={[styles.detailButtonText, { color: theme.text }]}>고급 설정</Text>
                </FeedbackPressable>
              </View>
            </>
          </DropdownMotion>
        </View>

        <FeedbackPressable
          accessibilityLabel={ctaLabel}
          accessibilityRole="button"
          onPress={onToggleDestinationCare}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: destinationCareEnabled ? "transparent" : theme.gold,
              borderColor: ctaAccent,
              opacity: pressed ? 0.86 : 1,
            },
          ]}
        >
          <Text style={[styles.ctaText, { color: destinationCareEnabled ? ctaAccent : theme.onAccent }]}>{ctaLabel}</Text>
        </FeedbackPressable>

        {destinationSaved ? (
          <FeedbackPressable
            accessibilityLabel={`${destinationName} 목적지 삭제`}
            accessibilityRole="button"
            onPress={() => {
              if (!selectedDestinationPlace) return;
              onRemoveSavedDestination(selectedDestinationPlace.id);
              onNavigate("G1");
            }}
            style={[styles.deleteDestinationButton, { backgroundColor: theme.cardStrong, borderColor: theme.warm }]}
          >
            <Text style={[styles.deleteDestinationTitle, { color: theme.warm }]}>목적지 삭제</Text>
            <Text style={[styles.deleteDestinationBody, { color: theme.muted }]}>삭제 후 출발 목록에서 바로 복구 가능</Text>
          </FeedbackPressable>
        ) : null}

      </ScrollView>

      <BottomSheet
        visible={arrivalEditorOpen}
        onClose={() => setArrivalEditorOpen(false)}
        accessibilityLabel="도착 희망 시각 선택 시트"
      >
        <Text style={[styles.sheetTitle, { color: theme.text }]}>도착 희망 시각</Text>
        <ArrivalInputControl
          label="도착 희망"
          value={targetArrivalTime}
          caption="5분 단위 스크롤 선택"
          onSelectTime={onSetDestinationTargetArrivalTime}
          theme={theme}
        />
        <FeedbackPressable
          accessibilityLabel="도착 희망 시각 확인"
          accessibilityRole="button"
          onPress={() => setArrivalEditorOpen(false)}
          style={[styles.sheetConfirmButton, { backgroundColor: theme.gold }]}
        >
          <Text style={[styles.sheetConfirmText, { color: theme.onAccent }]}>확인</Text>
        </FeedbackPressable>
      </BottomSheet>

      <BottomSheet
        visible={transportSelectorOpen}
        onClose={() => setTransportSelectorOpen(false)}
        accessibilityLabel="이동수단 선택 시트"
      >
        <Text style={[styles.sheetTitle, { color: theme.text }]}>이동수단 선택</Text>
        <TransportDropdown
          transportMode={transportMode}
          walkUnavailable={walkUnavailable}
          routeTimingReady={routeTimingReady}
          onSetTransportMode={(mode) => {
            setTransportSelectorOpen(false);
            onSetDestinationTransportMode(mode);
          }}
          theme={theme}
        />
      </BottomSheet>
    </View>
  );
}

const repeatDayOptions: Array<{ day: P0ScreenProps["selectedDestinationSchedulePreference"]["repeatDays"][number]; label: string; shortLabel: string }> = [
  { day: "mon", label: "월요일", shortLabel: "월" },
  { day: "tue", label: "화요일", shortLabel: "화" },
  { day: "wed", label: "수요일", shortLabel: "수" },
  { day: "thu", label: "목요일", shortLabel: "목" },
  { day: "fri", label: "금요일", shortLabel: "금" },
  { day: "sat", label: "토요일", shortLabel: "토" },
  { day: "sun", label: "일요일", shortLabel: "일" },
];

function SummaryChip({
  icon,
  label,
  value,
  meta,
  color,
  theme,
  accessibilityLabel,
  onPress,
}: {
  icon: number;
  label: string;
  value: string;
  meta: string;
  color: string;
  theme: AppTheme;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <FeedbackPressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" onPress={onPress} style={styles.summaryChip}>
      <View style={[styles.summaryIconFrame, { backgroundColor: `${color}18` }]}>
        <Image source={icon} style={[styles.summaryIcon, { tintColor: color }]} resizeMode="contain" />
      </View>
      <Text numberOfLines={1} style={[styles.summaryLabel, { color: theme.subtle }]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.summaryValue, { color: theme.text }]}>{value}</Text>
      <Text numberOfLines={1} style={[styles.summaryMeta, { color }]}>{meta}</Text>
    </FeedbackPressable>
  );
}

function ArrivalInputControl({
  label,
  value,
  caption,
  onSelectTime,
  theme,
}: {
  label: string;
  value: string;
  caption: string;
  onSelectTime: (value: string) => void;
  theme: AppTheme;
}) {
  const { hour, minute } = getTimeParts(value);
  const setHour = (nextHour: string) => onSelectTime(`${nextHour}:${minute}`);
  const setMinute = (nextMinute: string) => onSelectTime(`${hour}:${nextMinute}`);
  return (
    <View style={[styles.arrivalControl, { backgroundColor: theme.cardMuted, borderColor: "transparent" }]}>
      <View style={styles.arrivalControlCopy}>
        <Text style={[styles.arrivalControlLabel, { color: theme.subtle }]}>{label}</Text>
        <View style={styles.arrivalWheelRow}>
          <TimeWheel
            accessibilityLabel={`${label} 시 입력`}
            options={hourOptions}
            selectedValue={hour}
            suffix="시"
            theme={theme}
            onSelect={setHour}
          />
          <Text style={[styles.arrivalTimeColon, { color: theme.subtle }]}>:</Text>
          <TimeWheel
            accessibilityLabel={`${label} 분 입력`}
            options={minuteOptions}
            selectedValue={minute}
            suffix="분"
            theme={theme}
            onSelect={setMinute}
          />
        </View>
      </View>
      <Text style={[styles.arrivalControlCaption, { color: theme.gold }]}>{caption}</Text>
    </View>
  );
}

const TIME_WHEEL_ROW_HEIGHT = 48;
const TIME_WHEEL_VIEWPORT = 148;

function TimeWheel({
  accessibilityLabel,
  options,
  selectedValue,
  suffix,
  theme,
  onSelect,
}: {
  accessibilityLabel: string;
  options: string[];
  selectedValue: string;
  suffix: string;
  theme: AppTheme;
  onSelect: (value: string) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = Math.max(0, options.indexOf(selectedValue));

  // 선택된 값이 뷰포트 중앙에 오도록 스크롤 위치를 맞춘다.
  const centerOffset = Math.max(0, selectedIndex * TIME_WHEEL_ROW_HEIGHT - (TIME_WHEEL_VIEWPORT - TIME_WHEEL_ROW_HEIGHT) / 2);
  const centerOffsetRef = useRef(centerOffset);
  centerOffsetRef.current = centerOffset;

  // 이 휠은 높이가 0→목표값으로 애니메이션되는 DropdownMotion(overflow:hidden) 안에 있다.
  // requestAnimationFrame 한 프레임 뒤에 scrollTo를 호출하면 웹에서는 통하지만, 실기기에서는
  // 네이티브 레이아웃이 그 시점에 아직 잡히지 않아 스크롤이 씹히는 경우가 있었다(첫 프레임에
  // 목록 맨 위 00/01/02가 보이던 버그). onLayout은 플랫폼 관계없이 실제 레이아웃이 끝난 뒤에만
  // 불리므로, 그 시점에 맞춰 스크롤해야 두 플랫폼 모두에서 안정적으로 동작한다.
  const handleLayout = () => {
    scrollRef.current?.scrollTo({ y: centerOffsetRef.current, animated: false });
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: centerOffset, animated: false });
  }, [centerOffset]);

  return (
    <ScrollView
      ref={scrollRef}
      accessibilityLabel={accessibilityLabel}
      style={[styles.timeWheel, { borderColor: theme.border }]}
      contentContainerStyle={styles.timeWheelContent}
      contentOffset={{ x: 0, y: centerOffset }}
      onLayout={handleLayout}
      onContentSizeChange={handleLayout}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {options.map((option) => {
        const selected = selectedValue === option;
        return (
          <FeedbackPressable
            key={`${suffix}-${option}`}
            accessibilityLabel={`${option}${suffix} 선택`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelect(option)}
            style={[styles.timeWheelOption, { backgroundColor: selected ? `${theme.gold}18` : "transparent" }]}
          >
            <Text style={[styles.timeWheelOptionText, { color: selected ? theme.gold : theme.subtle }]}>{option}</Text>
          </FeedbackPressable>
        );
      })}
    </ScrollView>
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
    <View style={[styles.arrivalControl, { backgroundColor: theme.cardMuted, borderColor: "transparent" }]}>
      <View style={styles.arrivalControlCopy}>
        <Text style={[styles.arrivalControlLabel, { color: theme.subtle }]}>{label}</Text>
        <Text style={[styles.arrivalControlValue, { color: theme.text }]}>{value}</Text>
      </View>
      <Text style={[styles.arrivalControlCaption, { color: theme.gold }]}>{caption}</Text>
    </View>
  );
}

const transportOptions: Array<{ mode: P0ScreenProps["selectedDestinationSchedulePreference"]["transportMode"]; label: string; caption: string }> = [
  { mode: "auto", label: "자동", caption: "기본 경로 · 선택 시 재계산" },
  { mode: "walk", label: "도보", caption: "걷는 시간 · 선택 시 재계산" },
  { mode: "drive", label: "자차", caption: "도로 기준 · 선택 시 재계산" },
  { mode: "transit", label: "대중교통", caption: "배차/환승 변동 가능 · 선택 시 재계산" },
];

const hourOptions = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const minuteOptions = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0"));

function TransportDropdown({
  transportMode,
  walkUnavailable,
  routeTimingReady,
  onSetTransportMode,
  theme,
}: {
  transportMode: P0ScreenProps["selectedDestinationSchedulePreference"]["transportMode"];
  walkUnavailable: boolean;
  routeTimingReady: boolean;
  onSetTransportMode: (mode: P0ScreenProps["selectedDestinationSchedulePreference"]["transportMode"]) => void;
  theme: AppTheme;
}) {
  return (
    <View style={[styles.transportDropdownPanel, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
      {transportOptions.map((option) => {
        const selected = transportMode === option.mode;
        const disabled = option.mode === "walk" && walkUnavailable;
        const caption = disabled
          ? "장거리 목적지는 도보 제외"
          : !routeTimingReady
            ? option.mode === "auto"
              ? "경로 API 확인 전 기본값 · 직접 선택하면 바로 반영됨"
              : "선택해도 Google 지도 등 외부 경로 확인 필요"
            : option.caption;
        return (
          <FeedbackPressable
            key={option.mode}
            accessibilityLabel={`${option.label} 이동수단 선택${selected ? ", 현재 선택됨" : ""}${disabled ? ", 장거리 목적지에서 비활성" : ""}`}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={() => onSetTransportMode(option.mode)}
            style={[
              styles.transportDropdownRow,
              {
                backgroundColor: selected ? `${theme.gold}14` : "transparent",
                borderColor: selected ? theme.gold : theme.border,
                opacity: disabled ? 0.5 : 1,
              },
            ]}
          >
            <View style={styles.transportDropdownCopy}>
              <Text style={[styles.transportDropdownLabel, { color: selected ? theme.gold : theme.text }]}>{option.label}</Text>
              <Text style={[styles.transportDropdownCaption, { color: disabled ? theme.warm : theme.subtle }]}>{caption}</Text>
            </View>
            {selected ? <Text style={[styles.transportSelectedText, { color: theme.gold }]}>선택됨</Text> : null}
          </FeedbackPressable>
        );
      })}
    </View>
  );
}

function RepeatSchedulePanel({
  repeatEnabled,
  repeatDays,
  repeatDaysOpen,
  repeatSummary,
  onToggleRepeat,
  onToggleRepeatDays,
  onToggleRepeatDay,
  theme,
}: {
  repeatEnabled: boolean;
  repeatDays: P0ScreenProps["selectedDestinationSchedulePreference"]["repeatDays"];
  repeatDaysOpen: boolean;
  repeatSummary: string;
  onToggleRepeat: () => void;
  onToggleRepeatDays: () => void;
  onToggleRepeatDay: (day: P0ScreenProps["selectedDestinationSchedulePreference"]["repeatDays"][number]) => void;
  theme: AppTheme;
}) {
  return (
    <View style={[styles.settingsPanel, { backgroundColor: theme.cardMuted, borderColor: "transparent" }]}>
      <View style={styles.settingsRow}>
        <View style={styles.settingsRowMain}>
          <View style={[styles.settingsIconFrame, { backgroundColor: repeatEnabled ? `${theme.clear}18` : theme.cardMuted }]}>
            <Image source={uiIconAssets.clock} style={[styles.settingsIcon, { tintColor: repeatEnabled ? theme.clear : theme.subtle }]} resizeMode="contain" />
          </View>
          <View style={styles.settingsCopy}>
            <Text style={[styles.settingsLabel, { color: repeatEnabled ? theme.clear : theme.subtle }]}>반복 알림</Text>
            <Text style={[styles.settingsValue, { color: theme.text }]} numberOfLines={1}>{repeatSummary}</Text>
          </View>
        </View>
        <FeedbackPressable
          accessibilityLabel={repeatEnabled ? "반복 알림 끄기" : "반복 알림 켜기"}
          accessibilityRole="switch"
          accessibilityState={{ checked: repeatEnabled }}
          onPress={onToggleRepeat}
          style={[styles.repeatSwitch, { backgroundColor: repeatEnabled ? theme.clear : theme.cardMuted, borderColor: repeatEnabled ? theme.clear : theme.border }]}
        >
          <Text style={[styles.repeatSwitchText, { color: repeatEnabled ? theme.background : theme.subtle }]}>{repeatEnabled ? "ON" : "OFF"}</Text>
        </FeedbackPressable>
      </View>

      <DropdownMotion visible={repeatEnabled} maxHeight={58}>
        <FeedbackPressable
          accessibilityLabel={repeatDaysOpen ? "반복 요일 선택 닫기" : "반복 요일 선택 열기"}
          accessibilityRole="button"
          accessibilityState={{ expanded: repeatDaysOpen }}
          onPress={onToggleRepeatDays}
          style={[styles.repeatDayToggle, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}
        >
          <Text style={[styles.repeatDayToggleText, { color: theme.text }]}>요일 선택</Text>
          <Text style={[styles.repeatDayToggleMeta, { color: theme.clear }]}>{repeatDaysOpen ? "닫기" : repeatSummary}</Text>
        </FeedbackPressable>
      </DropdownMotion>

      <DropdownMotion visible={repeatEnabled && repeatDaysOpen} maxHeight={96}>
        <View style={styles.repeatDayRow}>
          {repeatDayOptions.map((option) => {
            const selected = repeatDays.includes(option.day);
            return (
              <FeedbackPressable
                key={option.day}
                accessibilityLabel={`${option.label} 반복 알림 ${selected ? "선택됨" : "선택 안 됨"}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onToggleRepeatDay(option.day)}
                style={[styles.repeatDayChip, { backgroundColor: selected ? `${theme.clear}22` : theme.cardMuted, borderColor: selected ? theme.clear : theme.border }]}
              >
                <Text style={[styles.repeatDayText, { color: selected ? theme.clear : theme.subtle }]}>{option.shortLabel}</Text>
              </FeedbackPressable>
            );
          })}
        </View>
      </DropdownMotion>
    </View>
  );
}

function DropdownMotion({ visible, maxHeight, children }: { visible: boolean; maxHeight: number; children: React.ReactNode }) {
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (visible) setRendered(true);
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 260 : 190,
      easing: visible ? Easing.out(Easing.exp) : Easing.in(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !visible) setRendered(false);
    });
  }, [progress, visible]);

  if (!rendered) return null;

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] });
  const scaleY = progress.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] });
  const animatedMaxHeight = progress.interpolate({ inputRange: [0, 1], outputRange: [0, maxHeight] });

  return (
    <Animated.View
      collapsable={false}
      style={[styles.dropdownMotion, { maxHeight: animatedMaxHeight, opacity: progress, transform: [{ translateY }, { scaleY }] }]}
    >
      {children}
    </Animated.View>
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
    <View style={[styles.infoPanel, { backgroundColor: theme.card, borderLeftColor: accent }, cardShadow(theme)]}>
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

function CompareMetric({ label, value, meta, accent, theme }: { label: string; value: string; meta: string; accent: string; theme: AppTheme }) {
  return (
    <View style={[styles.compareMetric, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
      <Text numberOfLines={1} style={[styles.compareLabel, { color: theme.subtle }]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.compareValue, { color: accent }]}>{value}</Text>
      <Text numberOfLines={1} style={[styles.compareMeta, { color: theme.muted }]}>{meta}</Text>
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
  if (!targetArrivalTime || !travelMinutes) return care.departureAdvice?.recommendedDepartureTime ?? "확인 전";
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
        : "경로 확인 전";
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

function isWalkUnavailable(distanceMeters: number) {
  return distanceMeters > 25_000;
}

function getTransportOptionCaption(
  mode: P0ScreenProps["selectedDestinationSchedulePreference"]["transportMode"],
  routeTimingReady: boolean,
) {
  if (!routeTimingReady) {
    return mode === "auto" ? "경로 확인 전 · 직접 선택 가능" : "선택해도 외부 경로 확인 필요";
  }
  return transportOptions.find((option) => option.mode === mode)?.caption ?? "기본 경로";
}

function getBufferReasonCopy(
  bufferMinutes: number | undefined,
  transportMode: P0ScreenProps["selectedDestinationSchedulePreference"]["transportMode"],
): string {
  if (typeof bufferMinutes !== "number") return "경로 확인 필요";
  if (transportMode === "transit") return "배차/환승 변동";
  if (transportMode === "walk") return "도보 이동 여유";
  if (transportMode === "drive") return "도로 이동 여유";
  return "기본 경로 여유";
}

function getRepeatSummary(enabled: boolean, days: P0ScreenProps["selectedDestinationSchedulePreference"]["repeatDays"]) {
  if (!enabled || days.length === 0) return "반복 없음";
  return days.map((day) => repeatDayOptions.find((option) => option.day === day)?.shortLabel ?? "").filter(Boolean).join(" · ");
}

function getTimeParts(value: string) {
  const [rawHour = "10", rawMinute = "00"] = value.split(":");
  const hour = Number(rawHour);
  const minute = Math.round(Number(rawMinute) / 5) * 5;
  return {
    hour: Number.isFinite(hour) ? String(Math.max(0, Math.min(23, hour))).padStart(2, "0") : "10",
    minute: Number.isFinite(minute) ? String(Math.max(0, Math.min(55, minute))).padStart(2, "0") : "00",
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
  sheetTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  sheetConfirmButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  sheetConfirmText: {
    fontSize: 15,
    fontWeight: "900",
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.sm,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: spacing.lg,
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
  savedBanner: {
    gap: 3,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderLeftWidth: 2,
  },
  savedBannerTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  savedBannerBody: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
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
    height: 126,
    alignSelf: "stretch",
    marginTop: -16,
    marginHorizontal: -16,
    overflow: "hidden",
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderBottomLeftRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
    borderBottomWidth: 1,
  },
  decisionImage: {
    width: "100%",
    height: "100%",
  },
  generatedImageBadge: {
    position: "absolute",
    right: spacing.sm,
    bottom: spacing.sm,
    minHeight: 24,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    opacity: 0.9,
  },
  generatedImageBadgeText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
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
  summaryGrid: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  routeSummaryStrip: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 0,
  },
  summaryChip: {
    flex: 1,
    minHeight: 66,
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 0,
  },
  summaryIconFrame: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  summaryIcon: {
    width: 13,
    height: 13,
  },
  summaryLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  summaryValue: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  summaryMeta: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
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
    minHeight: 72,
    justifyContent: "space-between",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 9,
    borderRadius: radius.sm,
    borderWidth: 0,
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
  arrivalWheelRow: {
    minHeight: 120,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeWheel: {
    width: 76,
    height: 148,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  timeWheelContent: {
    paddingVertical: 4,
  },
  timeWheelOption: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.xs,
    marginHorizontal: 4,
  },
  timeWheelOptionText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  arrivalControlCaption: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
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
  compareGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
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
  compareMetric: {
    width: "48.7%",
    minHeight: 76,
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  compareMeta: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
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
  settingsPanel: {
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 0,
  },
  settingsRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  settingsRowMain: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  settingsIconFrame: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  settingsIcon: {
    width: 20,
    height: 20,
  },
  settingsCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  settingsLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  settingsValue: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  settingsTrailing: {
    maxWidth: 138,
    alignItems: "flex-end",
    gap: 2,
  },
  settingsMeta: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    textAlign: "right",
  },
  settingsChevron: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  transportDropdownPanel: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  dropdownMotion: {
    overflow: "hidden",
  },
  transportDropdownRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  transportDropdownCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  transportDropdownLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  transportDropdownCaption: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  transportSelectedText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  repeatSwitch: {
    minWidth: 58,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  repeatSwitchText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  repeatDayToggle: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  repeatDayToggleText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  repeatDayToggleMeta: {
    flexShrink: 1,
    textAlign: "right",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  repeatDayRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  repeatDayChip: {
    width: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  repeatDayText: {
    fontSize: 12,
    lineHeight: 16,
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
  detailPanel: {
    gap: spacing.sm,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  detailPanelHeader: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  timelineCompact: {
    gap: spacing.xs,
    paddingTop: 2,
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
  ctaWrap: {
    paddingTop: spacing.xs,
  },
  cta: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  ctaText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    letterSpacing: 0,
  },
  deleteDestinationButton: {
    minHeight: 62,
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  deleteDestinationTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  deleteDestinationBody: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
});
