import { pageStyles } from "../theme/pageStyles";
import React, { useEffect, useRef, useState } from "react";
import { AppState, Animated, Easing, Image, LocalizedView, Platform, RawText, ScrollView, StyleSheet, Text, View } from "../localization/react-native";
import { recommendOutfit } from "@weatheron/shared";
import { uiIconAssets } from "../assets";
import { AppButton } from "../components/AppButton";
import { BackButton } from "../components/BackButton";
import { BottomSheet } from "../components/BottomSheet";
import { FeedbackPressable } from "../components/FeedbackPressable";
import { IosGlassBackdrop } from "../components/IosGlassBackdrop";
import { MaterialSnackbar } from "../components/MaterialSnackbar";
import { OutfitGrid } from "../components/OutfitGrid";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { iosGlassSurface } from "../theme/iosGlass";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { cardShadow, radius, semanticColor, spacing, type AppTheme } from "../theme/tokens";
import { openDestinationDirections } from "../utils/destinationDirections";
import { getDestinationImageAsset } from "../utils/destinationImage";
import { toUserPreferenceProfile } from "../utils/preferenceProfile";
import { addMinutesToTime } from "../utils/zonedDateTime";
import { formatTemperature } from "../utils/units";
import {
  departureLiveActivityAutoLeadMinutes,
  endDepartureLiveActivity,
  getDepartureLiveActivityStatus,
  type DepartureLiveActivityStatus,
} from "../providers/departureLiveActivity";

export function DestinationCareScreen({
  permissionReady,
  state,
  destinationCareEnabled,
  savedDestinations,
  selectedDestinationAlertCondition,
  selectedDestinationSchedulePreference,
  selectedDestinationTravelEstimate,
  selectedDestinationDepartureAt,
  selectedDestinationPlace,
  placeSearchOrigin,
  temperatureUnit,
  wardrobeItems,
  styleGender,
  ageBand,
  fitPreference,
  selectedStyles,
  smartCareScenario,
  destinationSaved,
  destinationLimitNotice,
  onNavigate,
  onOpenAlertSettings,
  onToggleDestinationCare,
  onSetDestinationTargetArrivalTime,
  onSetDestinationTimeBasis,
  onSetDestinationTransportMode,
  onToggleDestinationRepeat,
  onToggleDestinationRepeatDay,
  onRemoveSavedDestination,
  onDismissDestinationLimitNotice,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const care = state.destinationCare;
  const destinationWeather = state.destinationWeatherById[selectedDestinationPlace.id] ?? care.destinationWeather;
  const preferenceProfile = toUserPreferenceProfile({ styleGender, ageBand, fitPreference, selectedStyles, smartCareScenario });
  const destinationOutfit = recommendOutfit(destinationWeather, preferenceProfile, wardrobeItems);
  const destinationOutfitReason = destinationOutfit.reasons[0] ?? "목적지 날씨 기준으로 다시 고름";
  const headerTitle = selectedDestinationPlace?.name ?? care.name;
  const justSaved = Boolean(
    selectedDestinationPlace && savedDestinations.find((destination) => destination.place.id === selectedDestinationPlace.id)?.changeStatus === "saved",
  );
  const timeBasis = selectedDestinationSchedulePreference.timeBasis;
  const selectedTargetTime = selectedDestinationSchedulePreference.targetArrivalTime;
  const travelMinutes = care.departureAdvice?.travelMinutes;
  const bufferMinutes = care.departureAdvice?.bufferMinutes;
  const routeTimingReady = typeof travelMinutes === "number" && typeof bufferMinutes === "number";
  const targetTimeReady = Boolean(selectedDestinationDepartureAt)
    && new Date(selectedDestinationDepartureAt ?? 0).getTime() > Date.now();
  const departureReady = targetTimeReady && (timeBasis === "departure" || routeTimingReady);
  const departureTime = timeBasis === "departure" ? selectedTargetTime : getRecommendedDepartureTime(care);
  const targetArrivalTime = timeBasis === "departure"
    ? typeof travelMinutes === "number" ? addMinutesToTime(selectedTargetTime, travelMinutes) : undefined
    : selectedTargetTime;
  const transportMode = care.departureAdvice?.transportMode ?? selectedDestinationSchedulePreference.transportMode;
  const [transportSelectorOpen, setTransportSelectorOpen] = useState(false);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [arrivalEditorOpen, setArrivalEditorOpen] = useState(false);
  const [directionsMessage, setDirectionsMessage] = useState<string | null>(null);
  const [departureActivityStatus, setDepartureActivityStatus] = useState<DepartureLiveActivityStatus>({
    supported: Platform.OS === "ios" || Platform.OS === "android",
    enabled: false,
    active: false,
  });
  const prepAlertTime = subtractMinutes(departureTime, 40);
  const rainAlertTime = subtractMinutes(departureTime, 10);
  const alertTimingCopy = departureReady ? `${prepAlertTime} · ${rainAlertTime} · ${departureTime}` : "출발 시간을 정하면 계산함";
  const destinationRain = destinationWeather.current.rainProbabilityPct;
  const ctaLabel = getCareCtaLabel(permissionReady, destinationCareEnabled);
  const transportLabel = getTransportModeLabel(transportMode);
  const walkUnavailable = isWalkUnavailable(selectedDestinationTravelEstimate.distanceMeters);
  const repeatEnabled = selectedDestinationSchedulePreference.repeatEnabled;
  const repeatDays = selectedDestinationSchedulePreference.repeatDays;
  const repeatSummary = getRepeatSummary(repeatEnabled, repeatDays);
  const destinationName = selectedDestinationPlace?.name ?? destinationWeather.locationName;
  const directionsLabel = selectedDestinationPlace.countryCode === "KR" ? "카카오맵 길찾기" : "Google 지도 길찾기";
  const destinationImage = getDestinationImageAsset(selectedDestinationPlace);
  const departureActivityMatchesDestination =
    (departureActivityStatus.active || departureActivityStatus.scheduled) &&
    departureActivityStatus.destinationId === selectedDestinationPlace.id;
  const departureActivityMatchesCurrentPlan = departureActivityMatchesDestination && Boolean(
    departureActivityStatus.departureAt &&
    selectedDestinationDepartureAt &&
    Math.abs(new Date(departureActivityStatus.departureAt).getTime() - new Date(selectedDestinationDepartureAt).getTime()) < 1000,
  );
  const movementTimeLabel = routeTimingReady
    ? selectedDestinationTravelEstimate.status === "fallback" ? `예상 ${travelMinutes}분` : `${travelMinutes}분`
    : selectedDestinationTravelEstimate.status === "loading" ? "확인 중" : "경로 확인 전";
  const decisionEyebrow = timeBasis === "departure" ? "도착 판단" : "출발 판단";
  const departureDecision = departureReady
    ? timeBasis === "departure"
      ? targetArrivalTime ? `${targetArrivalTime} 도착 예정` : "도착 시간 확인 전"
      : selectedDestinationTravelEstimate.status === "fallback" ? `예상 ${departureTime} 출발` : `${departureTime} 출발 권장`
    : targetTimeReady ? "경로 확인 전" : `${timeBasis === "departure" ? "출발" : "도착"} 시간 변경 필요`;
  const liveActivityMeta = departureActivityMatchesDestination
    ? departureActivityStatus.automaticEndScheduled === false
      ? "종료 연결 재시도 중"
      : departureActivityStatus.scheduled
        ? `출발 ${departureLiveActivityAutoLeadMinutes}분 전 시작 예약됨`
        : `${departureTime}까지 표시 중`
    : destinationCareEnabled && departureActivityStatus.supported && !departureActivityStatus.enabled
      ? "설정에서 허용 필요"
      : destinationCareEnabled && departureReady
        ? departureActivityStatus.automaticStartSupported
          ? `출발 ${departureLiveActivityAutoLeadMinutes}분 전 자동 시작`
          : `앱 실행 중 ${departureLiveActivityAutoLeadMinutes}분 전 시작`
        : destinationCareEnabled ? "시간 계산 후 자동" : "케어 꺼짐";
  const liveActivityNeedsPermission = destinationCareEnabled && departureActivityStatus.supported && !departureActivityStatus.enabled;

  const openDirections = async () => {
    setDirectionsMessage(null);
    try {
      const result = await openDestinationDirections({
        origin: placeSearchOrigin?.coordinate,
        originName: placeSearchOrigin?.locationName,
        destination: selectedDestinationPlace.coordinate,
        destinationAddress: selectedDestinationPlace.address,
        destinationName: selectedDestinationPlace.name,
        destinationCountryCode: selectedDestinationPlace.countryCode,
        transportMode,
      });
      if (result === "copied") setDirectionsMessage("지도를 열지 못해 목적지 주소를 복사했음");
    } catch {
      setDirectionsMessage("지도와 주소 복사를 열지 못했음");
    }
  };

  useEffect(() => {
    if (transportMode === "walk" && walkUnavailable) onSetDestinationTransportMode("auto");
  }, [onSetDestinationTransportMode, transportMode, walkUnavailable]);

  useEffect(() => {
    if (Platform.OS !== "ios" && Platform.OS !== "android") return;
    let active = true;
    const refresh = () => {
      if (AppState.currentState !== "active") return;
      void getDepartureLiveActivityStatus().then((status) => {
        if (active) setDepartureActivityStatus(status);
      });
    };
    refresh();
    const timer = setInterval(refresh, 10_000);
    const subscription = AppState.addEventListener("change", refresh);
    return () => {
      active = false;
      clearInterval(timer);
      subscription.remove();
    };
  }, [selectedDestinationDepartureAt, selectedDestinationPlace.id]);

  useEffect(() => {
    if (!departureActivityMatchesCurrentPlan || !departureActivityStatus.departureAt) return;
    const remainingMs = new Date(departureActivityStatus.departureAt).getTime() - Date.now();
    if (remainingMs <= 0) {
      void getDepartureLiveActivityStatus().then(setDepartureActivityStatus);
      return;
    }
    const timer = setTimeout(() => {
      void getDepartureLiveActivityStatus().then(setDepartureActivityStatus);
    }, Math.min(remainingMs + 500, 2_147_483_647));
    return () => clearTimeout(timer);
  }, [departureActivityMatchesCurrentPlan, departureActivityStatus.departureAt]);

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            width: "100%",
            maxWidth: layout.contentMaxWidth,
            gap: layout.isShort ? spacing.md : spacing.lg,
            paddingHorizontal: layout.screenHorizontalPadding,
            paddingTop: layout.weatherTopPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >

        <View style={[styles.header, { minHeight: 44, paddingTop: 0, justifyContent: "center" }]}>
          <BackButton onPress={() => onNavigate("G1")} />
          <View style={styles.headerCopy}>
            <View style={styles.headerTitleRow}>
              <Image source={uiIconAssets.pin} style={[styles.headerIcon, { tintColor: theme.text }]} resizeMode="contain" />
              <RawText style={[styles.title, pageStyles.title, { color: theme.text }]} numberOfLines={1}>{headerTitle}</RawText>
            </View>
            <Text style={[styles.subtitle, pageStyles.caption, { color: theme.subtle }]}>
              {timeBasis === "departure" ? "출발 시각 · 이동 · 도착 판단" : "도착 목표 · 이동 · 출발 판단"}
            </Text>
          </View>
        </View>

        <LocalizedView accessibilityLabel={`${headerTitle} 생성형 분위기 이미지`} style={[styles.placeImageFrame, { borderColor: theme.border }]}>
          <Image source={destinationImage} style={styles.decisionImage} resizeMode="cover" />
          <View style={[styles.generatedImageBadge, { backgroundColor: theme.cardStrong }]}>
            <Text style={[styles.generatedImageBadgeText, pageStyles.caption, { color: theme.subtle }]}>장소 이미지</Text>
          </View>
        </LocalizedView>

        {justSaved ? (
          <View style={[styles.savedBanner, { backgroundColor: theme.cardStrong, borderColor: theme.clear }, cardShadow(theme), pageStyles.card]}>
            <Text style={[styles.savedBannerTitle, { color: theme.clear }]}>목적지 저장 완료</Text>
            <Text style={[styles.savedBannerBody, { color: theme.muted }]}>아래 출발 시간과 날씨 비교가 이 목적지 기준으로 계산됨</Text>
          </View>
        ) : null}

        <View
          style={[
            styles.carePanel,
            { padding: layout.destinationPanelPadding, backgroundColor: theme.card, borderColor: theme.border },
            cardShadow(theme),
            pageStyles.card,
          ]}
        >
        <View style={[styles.decisionPanel, pageStyles.unboxed]}>
          <View style={styles.decisionHeader}>
            <View style={styles.decisionCopy}>
              <Text style={[styles.decisionEyebrow, pageStyles.caption, { color: theme.gold }]}>{decisionEyebrow}</Text>
              <Text style={[styles.decisionTitle, pageStyles.number, { color: theme.text }]}>{departureDecision}</Text>
              <Text style={[styles.decisionBody, pageStyles.caption, { color: theme.muted }]}>
                {departureReady
                  ? timeBasis === "departure"
                    ? targetArrivalTime ? `${selectedTargetTime} 출발 · ${movementTimeLabel}` : `${selectedTargetTime} 출발 · 이동 시간 확인 뒤 도착 시간을 안내`
                    : `${targetArrivalTime} 도착 목표 · ${movementTimeLabel} · 여유 ${bufferMinutes}분`
                  : targetTimeReady
                    ? timeBasis === "departure"
                      ? `${selectedTargetTime} 출발 예정 · 이동 시간 확인 뒤 도착 시간을 안내`
                      : `${selectedTargetTime} 도착 목표 · 이동 시간 확인 뒤 출발 시간을 안내`
                    : `${selectedTargetTime} ${timeBasis === "departure" ? "출발" : "도착"} 목표를 다시 선택해야 함`}
              </Text>
            </View>
            <View style={[styles.careStatePill, { backgroundColor: destinationCareEnabled ? semanticColor(theme, "successTint") : theme.cardStrong, borderColor: destinationCareEnabled ? theme.clear : theme.border }]}>
              <Text style={[styles.careStateText, pageStyles.caption, { color: destinationCareEnabled ? theme.clear : theme.subtle }]}>
                {destinationCareEnabled ? "케어 ON" : "케어 OFF"}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.routeSummaryStrip,
              { backgroundColor: theme.cardMuted, borderColor: "transparent" },
            ]}
          >
            <SummaryChip
              icon={uiIconAssets.pin}
              label="출발지"
              value={placeSearchOrigin?.locationName ?? "선택 필요"}
              meta={placeSearchOrigin ? "위치 변경" : "직접 선택"}
              color={theme.clear}
              theme={theme}
              accessibilityLabel={`${placeSearchOrigin?.locationName ?? "출발지 미설정"}, 출발지 변경`}
              onPress={() => onNavigate("H2")}
              minHeight={layout.destinationCareSummaryMinHeight}
            />
            <SummaryChip
              icon={uiIconAssets.clock}
              label={timeBasis === "departure" ? "출발 시간" : "도착 목표"}
              value={selectedTargetTime}
              meta={departureReady
                ? timeBasis === "departure" ? targetArrivalTime ? `도착 예정 ${targetArrivalTime}` : "도착 확인 전" : `${departureTime} 출발`
                : "시간 변경"}
              color={theme.sky}
              theme={theme}
              accessibilityLabel={`${timeBasis === "departure" ? "출발" : "도착"} 희망 시각 ${selectedTargetTime}, 시간 변경 시트 열기`}
              onPress={() => setArrivalEditorOpen(true)}
              minHeight={layout.destinationCareSummaryMinHeight}
            />
            <SummaryChip
              icon={uiIconAssets.depart}
              label="이동수단"
              value={transportLabel}
              meta={movementTimeLabel}
              color={theme.gold}
              theme={theme}
              accessibilityLabel={`이동수단 ${transportLabel}, 선택 시트 열기`}
              onPress={() => setTransportSelectorOpen(true)}
              minHeight={layout.destinationCareSummaryMinHeight}
            />
          </View>
          <RepeatSchedulePanel
            repeatEnabled={repeatEnabled}
            repeatDays={repeatDays}
            repeatSummary={repeatSummary}
            onToggleRepeat={onToggleDestinationRepeat}
            onToggleRepeatDay={onToggleDestinationRepeatDay}
            theme={theme}
          />
        </View>

        <View style={[styles.detailPanel, pageStyles.unboxed, styles.embeddedSection, { borderColor: theme.border }]}>
          <FeedbackPressable
            accessibilityLabel={detailPanelOpen ? "알림 일정 닫기" : "알림 일정 열기"}
            accessibilityRole="button"
            accessibilityState={{ expanded: detailPanelOpen }}
            onPress={() => setDetailPanelOpen((current) => !current)}
            style={styles.detailPanelHeader}
          >
            <View style={styles.conditionCopy}>
              <Text style={[styles.sectionTitle, { color: theme.muted }]}>알림 일정</Text>
              <Text style={[styles.conditionSummary, { color: theme.text }]}>{alertTimingCopy}</Text>
            </View>
            <Text style={[styles.settingsChevron, { color: theme.gold }]}>{detailPanelOpen ? "닫기" : "열기"}</Text>
          </FeedbackPressable>

          <DropdownMotion visible={detailPanelOpen} maxHeight={260}>
            <>
              <View style={styles.conditionHeader}>
                <View style={styles.conditionCopy}>
                  <Text style={[styles.sectionTitle, { color: theme.muted }]}>알림 기준</Text>
                  <Text style={[styles.conditionSummary, { color: theme.text }]}>강수 {selectedDestinationAlertCondition.rainThresholdPct}% 이상 · 출발 {selectedDestinationAlertCondition.leadTimeMinutes}분 전</Text>
                </View>
                <FeedbackPressable
                  accessibilityLabel="목적지 알림 고급 설정으로 이동"
                  accessibilityRole="button"
                  onPress={() => onOpenAlertSettings("G2", "destination")}
                  style={[styles.detailButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
                >
                  <Text style={[styles.detailButtonText, { color: theme.text }]}>알림 설정</Text>
                </FeedbackPressable>
              </View>

              {!permissionReady ? (
                <Text style={[styles.routeNotice, { color: theme.warm }]}>조회와 길찾기는 가능함. 알림을 켤 때만 권한이 필요함</Text>
              ) : null}

              <AppButton label={ctaLabel} accessibilityLabel={ctaLabel} onPress={onToggleDestinationCare} variant="outlined" tone={destinationCareEnabled ? "warning" : "primary"} />
            </>
          </DropdownMotion>
        </View>

        <View style={[styles.quickActionRow, { borderColor: theme.border }]}>
          <FeedbackPressable
            accessibilityLabel={`${destinationName} ${directionsLabel}, ${transportMode === "auto" ? "외부 지도에서 이동수단 선택" : `${transportLabel}으로 전달`}`}
            accessibilityRole="button"
            onPress={() => void openDirections()}
            style={[styles.quickAction, Platform.OS === "ios" ? null : styles.directionsQuickAction, { backgroundColor: theme.cardMuted }]}
          >
            <View style={[styles.quickActionIconFrame, { backgroundColor: `${theme.clear}18` }]}>
              <Image source={uiIconAssets.depart} style={[styles.quickActionIcon, { tintColor: theme.clear }]} resizeMode="contain" />
            </View>
            <View style={styles.quickActionCopy}>
              <Text style={[styles.quickActionTitle, { color: theme.text }]} numberOfLines={1}>{directionsLabel}</Text>
              <Text style={[styles.quickActionMeta, { color: theme.subtle }]} numberOfLines={1}>{transportMode === "auto" ? "수단 선택" : transportLabel}</Text>
            </View>
            <Text style={[styles.quickActionChevron, { color: theme.clear }]}>›</Text>
          </FeedbackPressable>

          {Platform.OS === "ios" || Platform.OS === "android" ? (
            <View
              accessibilityLabel={`자동 카운트다운, ${liveActivityMeta}`}
              style={[styles.quickAction, { backgroundColor: theme.cardMuted }]}
            >
              <View style={[styles.quickActionIconFrame, { backgroundColor: `${theme.gold}18` }]}>
                <Image source={uiIconAssets.clock} style={[styles.quickActionIcon, { tintColor: theme.gold }]} resizeMode="contain" />
              </View>
              <View style={styles.quickActionCopy}>
                <Text style={[styles.quickActionTitle, { color: theme.text }]} numberOfLines={1}>자동 카운트다운</Text>
                <Text style={[styles.quickActionMeta, { color: liveActivityNeedsPermission ? theme.warm : theme.subtle }]} numberOfLines={1}>{liveActivityMeta}</Text>
              </View>
            </View>
          ) : null}
        </View>
        </View>

        <View style={[styles.outfitPanel, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow(theme), pageStyles.card]}>
          <View style={styles.outfitHeader}>
            <View style={styles.outfitCopy}>
              <Text style={[styles.sectionTitle, { color: theme.clear }]}>목적지 코디</Text>
              <Text style={[styles.outfitTitle, { color: theme.text }]} numberOfLines={1}>{destinationOutfit.decisionText}</Text>
              <Text style={[styles.outfitReason, { color: theme.muted }]} numberOfLines={1}>{destinationOutfitReason}</Text>
            </View>
            <View style={[styles.outfitMatchPill, { backgroundColor: theme.cardStrong }]}>
              <Text style={[styles.outfitMatchText, { color: theme.clear }]}>{destinationOutfit.matchPct}%</Text>
            </View>
          </View>
          <OutfitGrid outfit={destinationOutfit} maxItems={4} compact singleRow />
        </View>

        {destinationSaved ? (
          <FeedbackPressable
            accessibilityLabel={`${destinationName} 목적지 삭제`}
            accessibilityRole="button"
            onPress={() => {
              if (!selectedDestinationPlace) return;
              if (departureActivityMatchesDestination) void endDepartureLiveActivity();
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

      {directionsMessage ? (
        <MaterialSnackbar key={directionsMessage} message={directionsMessage} onDismiss={() => setDirectionsMessage(null)} />
      ) : destinationLimitNotice ? (
        <MaterialSnackbar message="목적지는 최대 3개까지 등록할 수 있어요." supportingText="기존 목적지를 삭제한 뒤 추가해 주세요." onDismiss={onDismissDestinationLimitNotice} />
      ) : null}

      <BottomSheet
        visible={arrivalEditorOpen}
        onClose={() => setArrivalEditorOpen(false)}
        accessibilityLabel="출발 또는 도착 시각 선택 시트"
      >
        <Text style={[styles.sheetTitle, { color: theme.text }]}>시간 기준과 시각</Text>
        <View style={styles.timeBasisSelector}>
          {(["arrival", "departure"] as const).map((basis) => {
            const selected = timeBasis === basis;
            const label = basis === "arrival" ? "도착 시간" : "출발 시간";
            return (
              <FeedbackPressable
                key={basis}
                accessibilityLabel={`${label} 기준 선택${selected ? ", 현재 선택됨" : ""}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onSetDestinationTimeBasis(basis)}
                style={[styles.timeBasisOption, { backgroundColor: selected ? `${theme.gold}18` : theme.cardMuted, borderColor: selected ? theme.gold : theme.border }]}
              >
                <Text style={[styles.timeBasisOptionText, { color: selected ? theme.gold : theme.text }]}>{label}</Text>
              </FeedbackPressable>
            );
          })}
        </View>
        <ArrivalInputControl
          label={timeBasis === "arrival" ? "도착 희망" : "출발 희망"}
          value={selectedTargetTime}
          caption={timeBasis === "arrival" ? "5분 단위 스크롤 선택" : "이동 시간 기준 도착 예정 시간 계산"}
          onSelectTime={onSetDestinationTargetArrivalTime}
          theme={theme}
        />
        <FeedbackPressable
          accessibilityLabel={`${timeBasis === "arrival" ? "도착" : "출발"} 희망 시각 확인`}
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
  minHeight,
}: {
  icon: number;
  label: string;
  value: string;
  meta: string;
  color: string;
  theme: AppTheme;
  accessibilityLabel: string;
  onPress: () => void;
  minHeight: number;
}) {
  const glassSurface = iosGlassSurface(theme, "chip", { nativeBackdrop: true });
  return (
    <FeedbackPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.summaryChip,
        { minHeight },
        glassSurface ? [styles.summaryChipGlass, glassSurface] : null,
      ]}
    >
      {glassSurface ? <IosGlassBackdrop theme={theme} role="chip" style={styles.summaryChipBackdrop} /> : null}
      <View style={[styles.summaryIconFrame, { backgroundColor: `${color}18` }]}>
        <Image source={icon} style={[styles.summaryIcon, { tintColor: color }]} resizeMode="contain" />
      </View>
      <Text numberOfLines={1} style={[styles.summaryLabel, pageStyles.compactCaption, { color: theme.subtle }]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.summaryValue, pageStyles.body, { color: theme.text }]}>{value}</Text>
      <Text numberOfLines={1} style={[styles.summaryMeta, pageStyles.compactCaption, { color }]}>{meta}</Text>
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
        <Text style={[styles.arrivalControlLabel, pageStyles.compactCaption, { color: theme.subtle }]}>{label}</Text>
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
      <Text numberOfLines={1} style={[styles.arrivalControlCaption, pageStyles.compactCaption, { color: theme.gold }]}>{caption}</Text>
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
  repeatSummary,
  onToggleRepeat,
  onToggleRepeatDay,
  theme,
}: {
  repeatEnabled: boolean;
  repeatDays: P0ScreenProps["selectedDestinationSchedulePreference"]["repeatDays"];
  repeatSummary: string;
  onToggleRepeat: () => void;
  onToggleRepeatDay: (day: P0ScreenProps["selectedDestinationSchedulePreference"]["repeatDays"][number]) => void;
  theme: AppTheme;
}) {
  return (
    <View style={[styles.settingsPanel, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
      <View style={styles.settingsRow}>
        <View style={styles.settingsRowMain}>
          <View style={[styles.settingsIconFrame, { backgroundColor: repeatEnabled ? `${theme.clear}18` : theme.cardMuted }]}>
            <Image source={uiIconAssets.clock} style={[styles.settingsIcon, { tintColor: repeatEnabled ? theme.clear : theme.subtle }]} resizeMode="contain" />
          </View>
          <View style={styles.settingsCopy}>
            <Text style={[styles.settingsLabel, { color: repeatEnabled ? theme.clear : theme.subtle }]}>반복 요일</Text>
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
              style={[
                styles.repeatDayChip,
                {
                  backgroundColor: selected ? `${theme.clear}22` : theme.cardStrong,
                  borderColor: selected ? theme.clear : theme.border,
                },
              ]}
            >
              <Text style={[styles.repeatDayText, { color: selected ? theme.clear : theme.subtle }]}>{option.shortLabel}</Text>
            </FeedbackPressable>
          );
        })}
      </View>
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

function getRecommendedDepartureTime(care: P0ScreenProps["state"]["destinationCare"]) {
  const targetArrivalTime = care.departureAdvice?.targetArrivalTime;
  const travelMinutes = care.departureAdvice?.travelMinutes;
  const bufferMinutes = care.departureAdvice?.bufferMinutes ?? 10;
  if (!targetArrivalTime || !travelMinutes) return care.departureAdvice?.recommendedDepartureTime ?? "확인 전";
  return care.departureAdvice?.recommendedDepartureTime ?? subtractMinutes(targetArrivalTime, travelMinutes + bufferMinutes);
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
  timeBasisSelector: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  timeBasisOption: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  timeBasisOptionText: {
    fontSize: 14,
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
    paddingBottom: spacing.lg,
    minHeight: "100%",
    alignSelf: "center",
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
    gap: spacing.md,
    borderRadius: radius.lg,
  },
  carePanel: {
    gap: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
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
  placeImageFrame: {
    height: 112,
    overflow: "hidden",
    borderRadius: radius.lg,
    borderWidth: 1,
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
  quickActionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  quickAction: {
    flex: 1,
    minWidth: 0,
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  directionsQuickAction: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "62%",
  },
  quickActionIconFrame: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  quickActionIcon: {
    width: 16,
    height: 16,
  },
  quickActionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  quickActionTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  quickActionMeta: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
  },
  quickActionChevron: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "800",
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
  summaryChipGlass: {
    borderWidth: 1,
    overflow: "hidden",
  },
  summaryChipBackdrop: {
    borderRadius: radius.sm,
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
  outfitPanel: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  outfitHeader: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  outfitCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  outfitTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  outfitReason: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  outfitMatchPill: {
    minWidth: 54,
    minHeight: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  outfitMatchText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  sectionTitle: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    letterSpacing: 0,
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
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
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
    minHeight: 48,
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
  repeatDayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
  },
  repeatDayChip: {
    flex: 1,
    minWidth: 0,
    maxWidth: 48,
    height: 44,
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
  embeddedSection: {
    paddingHorizontal: 0,
    paddingBottom: 0,
    paddingTop: spacing.md,
    borderRadius: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  detailPanelHeader: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
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
  routeNotice: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  detailButton: {
    minWidth: 54,
    minHeight: 48,
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
