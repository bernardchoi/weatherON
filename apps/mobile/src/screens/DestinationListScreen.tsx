import { LocalizationContext } from "../localization/LocalizationProvider";
import { translateText } from "../localization/localization";
import { ambientScreenIconOverrides, ambientUiIcons, ambientWeatherIcon } from "../ambientAssets";
import { buildHomePreparation, forecastAt, forecastTime, snapshotReliable } from "../utils/homeOuting";
import { pageStyles } from "../theme/pageStyles";
import React from "react";
import { Platform, Image, RawText, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "../localization/react-native";
import { recommendOutfit, type PlaceSearchResult, type UserPreferenceProfile, type WeatherSnapshot } from "@weatheron/shared";
import { triggerConfirmedSelectionHaptic } from "../utils/confirmedInteractionFeedback";
import { AmbientControlSurface } from "../components/AmbientControlSurface";
import { AppButton } from "../components/AppButton";
import { FeedbackPressable } from "../components/FeedbackPressable";
import { MaterialSnackbar } from "../components/MaterialSnackbar";
import { getOutfitImageSource, uiIconAssets } from "../assets";
import type { P0ScreenProps } from "../navigation/types";
import { getDestinationTiming } from "../state/appStateHelpers";
import { getDestinationLabelText, type DestinationLabel } from "../state/appStateTypes";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { cardShadow, radius, spacing, type AppTheme } from "../theme/tokens";
import { formatTemperature, formatTemperatureDelta } from "../utils/units";
import { formatRouteClock } from "../utils/travelEstimate";
import { getOutfitVariantLabel } from "../utils/outfitLabels";
import { toUserPreferenceProfile } from "../utils/preferenceProfile";

import { getConditionLabel } from "../utils/weatherPresentation";
import { useIsNightHour } from "../utils/useIsNightHour";
import { resolveWeatherTimeZone } from "../utils/weatherDaylight";

type DestinationCardModel = {
  actionText?: string;
  weatherCondition: string | null;
  weatherNotice: string | null;
  weatherAvailable: boolean;
  id: string;
  title: string;
  area: string;
  icon: "company" | "school" | "place";
  originTemp: string;
  destinationTemp: string;
  tempDiff: string;
  rainPct: string;
  departureTime: string;
  arrivalTime: string;
  arrivalLabel: string;
  repeatLabel: string;
  warning: string;
  warningKind: "rain" | "wind" | "none";
  outfitTitle: string;
  outfitItems: Array<{ id: string; name: string; imageUrl?: string }>;
  tone: "warm" | "clear";
  place: PlaceSearchResult;
  saved: boolean;
  careEnabled: boolean;
  label: DestinationLabel | null;
  savedAtLabel: string;
  changeStatus: P0ScreenProps["savedDestinations"][number]["changeStatus"];
};

export function DestinationListScreen({
  state,
  savedDestinations,
  placeSearchOrigin,
  recentlyRemovedDestination,
  selectedDestinationPlace,
  accountGateResult,
  permissionGateResult,
  permissionReady,
  destinationLimitNotice,
  temperatureUnit,
  wardrobeItems,
  styleGender,
  ageBand,
  fitPreference,
  selectedStyles,
  smartCareScenario,
  onNavigate,
  onSelectDestinationPlace,
  onRestoreRemovedDestination,
  onDismissRemovedDestination,
  onDismissDestinationLimitNotice,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const care = state.destinationCare;
  const preferenceProfile = toUserPreferenceProfile({ styleGender, ageBand, fitPreference, selectedStyles, smartCareScenario });
  const destinationCards = buildDestinationCards(savedDestinations, care, state.destinationWeatherById, temperatureUnit, wardrobeItems, preferenceProfile, Boolean(placeSearchOrigin));
  const alertCount = permissionReady ? destinationCards.filter((item) => item.careEnabled).length : 0;
  const hasDestinations = destinationCards.length > 0;
  const alertLabel = hasDestinations ? `알림 ${alertCount}/${destinationCards.length}` : "알림 0";
  const resultBanner = getDestinationResultBanner(accountGateResult, permissionGateResult, hasDestinations);
  const selectedCard = destinationCards.find((item) => item.place.id === selectedDestinationPlace.id) ?? destinationCards[0];
  const visibleCards = Platform.OS === "ios" && selectedCard ? [selectedCard, ...destinationCards.filter(item => item.id !== selectedCard.id)] : destinationCards;
  const pendingSelection = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (pendingSelection.current !== selectedDestinationPlace.id) return;
    pendingSelection.current = null;
    triggerConfirmedSelectionHaptic();
  }, [selectedDestinationPlace.id]);
  const openDestination = (place: PlaceSearchResult) => {
    if (Platform.OS === "ios" && place.id !== selectedDestinationPlace.id) pendingSelection.current = place.id;
    onSelectDestinationPlace(place);
    onNavigate("G2");
  };

  return (
    <View style={[styles.shell, { backgroundColor: Platform.OS === "ios" ? "transparent" : theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            width: "100%",
            maxWidth: layout.contentMaxWidth,
            gap: Platform.OS === "ios" ? 12 : layout.destinationContentGap,
            paddingHorizontal: layout.screenHorizontalPadding,
            paddingTop: layout.weatherTopPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >

        <View style={[styles.header, { minHeight: 44, paddingTop: 0, justifyContent: "flex-start" }]}>
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
                fontSize: layout.screenTitleFontSize,
                lineHeight: layout.screenTitleLineHeight,
              },
              pageStyles.title,
              Platform.OS === "ios" && { fontSize: 28, lineHeight: 36, fontWeight: "700" },
            ]}
          >
            출발
          </Text>
        </View>

        {(Platform.OS !== "ios" || !hasDestinations) && (
          <FeedbackPressable accessibilityRole="button" accessibilityLabel={selectedCard ? `${selectedCard.title} 출발 상세 보기` : "첫 목적지 추가"}
            onPress={() => { if (selectedCard) { openDestination(selectedCard.place); } else onNavigate("P1"); }}
            style={{ minHeight: 80, gap: 4, paddingVertical: 8 }}>
            <Text style={[pageStyles.compactCaption, { color: theme.subtle }]} numberOfLines={1}>{selectedCard ? `선택한 목적지 · ${selectedCard.title}` : "첫 출발 준비"}</Text>
            <Text style={[pageStyles.number, { color: theme.text }]}>{selectedCard ? selectedCard.departureTime.includes(":") ? `${selectedCard.departureTime} 출발` : selectedCard.departureTime : "어디로 가시나요?"}</Text>
            <Text style={[pageStyles.compactCaption, { color: theme.muted }]} numberOfLines={1}>{selectedCard ? `${selectedCard.arrivalTime} ${selectedCard.arrivalLabel} · ${alertLabel}` : "목적지를 추가하면 출발 날씨까지 챙겨드려요"}</Text>
          </FeedbackPressable>
        )}

        {Platform.OS === "ios" && hasDestinations ? <Text style={[pageStyles.caption, { color: theme.muted }]}>저장된 목적지</Text> : null}

        <View style={styles.destinationList}>
          {hasDestinations ? (
            visibleCards.map((item) => (
              Platform.OS === "ios" ? <AmbientDestinationSummary key={item.id} item={item} theme={theme} permissionReady={permissionReady} selected={selectedDestinationPlace.id === item.id} featured={selectedCard?.id === item.id} onOpen={() => openDestination(item.place)} /> : <DestinationCard
                key={item.id}
                item={item}
                paddingHorizontal={layout.destinationCardPaddingHorizontal}
                paddingVertical={layout.destinationCardPaddingVertical}
                theme={theme}
                permissionReady={permissionReady}
                selected={selectedDestinationPlace.id === item.place.id}
                onOpen={() => {
                  onSelectDestinationPlace(item.place);
                  onNavigate("G2");
                }}
              />
            ))
          ) : (
            <EmptyDestinationState
              panelPadding={layout.destinationPanelPadding}
              theme={theme}
              onAdd={() => onNavigate("P1")}
            />
          )}
        </View>

        {hasDestinations ? (
          <View style={styles.secondaryActions}>
            <FeedbackPressable
              accessibilityLabel="목록 하단 목적지 추가"
              accessibilityRole="button"
              onPress={() => onNavigate("P1")}
              style={[[styles.addDestinationRail, { backgroundColor: theme.cardStrong, borderColor: theme.border }], Platform.OS === "ios" && ambientVisual.addDestinationRail]}
            >
              <Text style={[styles.addDestinationIcon, { color: theme.clear }]}>+</Text>
              <Text style={[styles.addDestinationText, { color: theme.clear }, Platform.OS === "ios" && { fontSize: 17, lineHeight: 24, fontWeight: "600" }]}>목적지 추가</Text>
            </FeedbackPressable>
            {savedDestinations.length >= 3 ? <Text style={[styles.limitHint, { color: theme.muted }]}>목적지는 최대 3개까지 등록할 수 있어요. 기존 목적지를 삭제한 뒤 추가해 주세요.</Text> : null}
          </View>
        ) : null}

      </ScrollView>
      {recentlyRemovedDestination ? (
        <MaterialSnackbar
          key={`removed-${recentlyRemovedDestination.place.id}`}
          message="목적지 삭제됨"
          supportingText={`${recentlyRemovedDestination.place.name}을 다시 복구할 수 있음`}
          actionLabel="복구"
          onAction={onRestoreRemovedDestination}
          onDismiss={onDismissRemovedDestination}
          duration={Platform.OS === "ios" ? 0 : 3800}
        />
      ) : destinationLimitNotice ? (
        <MaterialSnackbar
          message="목적지는 최대 3개까지 등록할 수 있어요."
          supportingText="기존 목적지를 삭제한 뒤 추가해 주세요."
          onDismiss={onDismissDestinationLimitNotice}
        />
      ) : resultBanner ? (
        <MaterialSnackbar
          key={`${resultBanner.title}-${resultBanner.body}`}
          message={resultBanner.title}
          supportingText={resultBanner.body}
        />
      ) : null}
    </View>
  );
}

function EmptyDestinationState({
  panelPadding,
  theme,
  onAdd,
}: {
  panelPadding: number;
  theme: AppTheme;
  onAdd: () => void;
}) {
  return (
    <View
      style={[[
        styles.emptyCard,
        {
          padding: panelPadding,
          backgroundColor: theme.card,
          borderLeftColor: theme.clear,
          borderColor: theme.border,
        },
        cardShadow(theme),
        pageStyles.card,
        { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: theme.border, borderColor: theme.border },
      ], Platform.OS === "ios" && ambientVisual.emptyCard]}
    >
      <View style={styles.emptyHeader}>
        <View style={[styles.emptyIconBox, { backgroundColor: theme.cardStrong }]}>
          <PlaceGlyph type="place" color={theme.clear} />
        </View>
        <View style={styles.emptyCopy}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>첫 목적지 추가</Text>
          <Text style={[styles.emptyBody, { color: theme.subtle }]}>날씨·출발 준비 자동 비교</Text>
        </View>
      </View>
      <View style={styles.emptyBenefitGrid}>
        <EmptyBenefit
          icon={screenIcons.clock}
          title="출발 시간"
          body="도착 시간 기준 계산"
          color={theme.clear}
          theme={theme}
          accessibilityLabel="목적지 추가하고 출발 시간 계산"
          onPress={onAdd}
        />
        <EmptyBenefit
          icon={screenIcons.rain}
          title="비 완화"
          body="강수 변화 먼저 확인"
          color={theme.clear}
          theme={theme}
          accessibilityLabel="목적지 추가하고 강수 변화 확인"
          onPress={onAdd}
        />
      </View>
      <AppButton label="목적지 추가" accessibilityLabel="첫 목적지 추가하기" onPress={onAdd} />
    </View>
  );
}

function EmptyBenefit({
  icon,
  title,
  body,
  color,
  theme,
  onPress,
  accessibilityLabel,
}: {
  icon: number;
  title: string;
  body: string;
  color: string;
  theme: AppTheme;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <FeedbackPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[[styles.emptyBenefit, { backgroundColor: theme.cardStrong, borderColor: theme.border }], Platform.OS === "ios" && ambientVisual.emptyBenefit]}
    >
      <Image source={icon} style={[styles.emptyBenefitIcon, { tintColor: color }]} resizeMode="contain" />
      <View style={styles.emptyBenefitCopy}>
        <Text style={[styles.emptyBenefitTitle, { color: theme.text }]} numberOfLines={1}>{title}</Text>
        <Text style={[styles.emptyBenefitBody, { color: theme.subtle }]} numberOfLines={1}>{body}</Text>
      </View>
    </FeedbackPressable>
  );
}

function AmbientDestinationSummary({ item, theme, permissionReady, selected, featured, onOpen }: {
  item: DestinationCardModel; theme: AppTheme; permissionReady: boolean; selected: boolean; featured: boolean; onOpen: () => void;
}) {
  const { language } = React.use(LocalizationContext);
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1.3;
  const isNight = useIsNightHour({ coordinate: item.place.coordinate, timeZone: resolveWeatherTimeZone(item.place.countryCode, item.place.timezone) });
  const weatherIcon = item.weatherCondition ? ambientWeatherIcon(item.weatherCondition, isNight, theme) : undefined;
  const content = <FeedbackPressable accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={`${item.title} 목적지 상세 보기`} hapticFeedback="none" onPress={onOpen} style={{ gap: 8, minHeight: stacked ? undefined : 112 }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Image source={selected ? ambientUiIcons.check : ambientUiIcons.location} accessible={false} style={{ width: 22, height: 22, tintColor: selected ? theme.clear : theme.muted }} />
      <View style={{ flex: 1, gap: 2 }}>
        <RawText style={{ fontSize: 20, lineHeight: 26, fontWeight: "700", color: theme.text }}>{item.title}</RawText>
        <RawText style={[pageStyles.caption, { color: theme.muted }]}>{item.area}{item.label ? ` · ${translateText(getDestinationLabelText(item.label), language)}` : ""}</RawText>
      </View>
      <Text accessible={false} style={{ fontSize: 22, color: theme.muted }}>›</Text>
    </View>
    <View style={{ flexDirection: stacked ? "column" : "row", alignItems: stacked ? "flex-start" : "center", gap: 12 }}>
      <View style={{ flex: stacked ? undefined : 1, minWidth: 0, gap: 2 }}>
        <Text style={{ fontSize: item.departureTime.includes(":") ? 28 : 18, lineHeight: 32, fontWeight: "600", fontVariant: ["tabular-nums"], color: theme.text }}>{item.departureTime}{item.departureTime.includes(":") ? <Text style={[pageStyles.caption, { color: theme.muted }]}> 출발</Text> : null}</Text>
        <Text style={[pageStyles.caption, { color: theme.muted }]}>{item.arrivalTime} {item.arrivalLabel}</Text>
      </View>
      <View style={{ gap: 2, alignItems: stacked ? "flex-start" : "flex-end" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Image source={weatherIcon?.source ?? ambientUiIcons.temperature} accessible={false} style={{ width: 32, height: 32, ...(weatherIcon?.tintColor ? { tintColor: weatherIcon.tintColor } : !weatherIcon ? { tintColor: theme.muted } : {}) }} />
          <Text style={{ fontSize: 28, lineHeight: 32, fontWeight: "600", color: theme.text }}>{item.weatherAvailable ? item.destinationTemp : "—"}</Text>
        </View>
        <Text style={[pageStyles.caption, { color: theme.muted }]}>{item.weatherAvailable ? `현재 ${item.weatherCondition ? translateText(getConditionLabel(item.weatherCondition), language) : "날씨"}` : "날씨 확인 중"}</Text>
      </View>
    </View>
    {item.weatherNotice ? <Text style={[pageStyles.caption, { color: theme.warm }]}>{item.weatherNotice}</Text> : null}
    {selected ? <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderColor: theme.border, paddingTop: 8, gap: 4, minHeight: stacked ? undefined : 52 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
        <Image source={item.warningKind === "wind" ? ambientUiIcons.wind : ambientUiIcons.umbrella} accessible={false} style={{ width: 20, height: 20, tintColor: theme.clear }} />
        <Text style={[pageStyles.caption, { flex: 1, color: theme.text }]}>{item.weatherNotice ? item.weatherNotice : getDestinationActionText(item)}</Text>
      </View>
      <Text style={[pageStyles.caption, { color: getStatusColor(item.careEnabled, permissionReady, theme) }]}>{getAlertPillLabel(item.careEnabled, permissionReady)} · {translateText(item.repeatLabel, language)}</Text>
    </View> : null}
  </FeedbackPressable>;
  return selected
    ? <AmbientControlSurface style={{ padding: 12, gap: 0 }}>{content}</AmbientControlSurface>
    : <View style={{ padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: theme.border }}>{content}</View>;
}

function DestinationCard({
  item,
  paddingHorizontal,
  paddingVertical,
  theme,
  permissionReady,
  selected,
  onOpen,
}: {
  item: DestinationCardModel;
  paddingHorizontal: number;
  paddingVertical: number;
  theme: AppTheme;
  permissionReady: boolean;
  selected: boolean;
  onOpen: () => void;
}) {
  const accent = theme.clear;
  const selectedAccent = theme.clear;
  const statusColor = getStatusColor(item.careEnabled, permissionReady, theme);
  const warningColor = item.tone === "warm" ? theme.warm : theme.subtle;
  return (
    <View
      style={[[
        styles.destinationCard,
        {
          backgroundColor: theme.card,
          borderLeftColor: accent,
          borderColor: selected ? selectedAccent : "transparent",
          paddingHorizontal,
          paddingVertical,
        },
        cardShadow(theme),
        pageStyles.card,
        { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: selected ? selectedAccent : theme.border, borderColor: selected ? selectedAccent : theme.border },
      ], Platform.OS === "ios" && ambientVisual.destinationCard]}
    >
      <FeedbackPressable
        accessibilityLabel={`${item.title} 목적지 상세 보기`}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onOpen}
        style={styles.destinationMainButton}
      >
        <View style={styles.destinationTop}>
          <View style={[[styles.destinationIconFrame, { backgroundColor: `${accent}18` }], Platform.OS === "ios" && ambientVisual.destinationIconFrame]}>
            <PlaceGlyph type={item.icon} color={accent} />
          </View>
          <View style={styles.destinationTitleColumn}>
            <View style={styles.destinationNameRow}>
              {selected ? <Image source={screenIcons.check} style={[styles.destinationSelectedCheck, { tintColor: selectedAccent }]} resizeMode="contain" /> : null}
              {item.label ? <DestinationLabelPill label={item.label} theme={theme} /> : null}
              <RawText style={[styles.destinationName, pageStyles.sectionTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</RawText>
            </View>
            <RawText style={[[styles.destinationArea, pageStyles.compactCaption, { color: theme.subtle }], Platform.OS === "ios" && ambientVisual.destinationArea]} numberOfLines={1}>{item.area}</RawText>
          </View>
          <View style={[[styles.readyPill, { backgroundColor: theme.cardStrong }], Platform.OS === "ios" && ambientVisual.readyPill]}>
            <Text style={[[styles.readyText, { color: statusColor }], Platform.OS === "ios" && ambientVisual.readyText]}>{getAlertPillLabel(item.careEnabled, permissionReady)}</Text>
          </View>
          {Platform.OS !== "ios" ? <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text> : null}
        </View>

        {<View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
          <Text style={[pageStyles.number, { color: theme.text }]}>{item.departureTime}</Text>
          <Text style={[pageStyles.compactCaption, { color: theme.subtle }]} numberOfLines={1}>{item.departureTime.includes(":") ? "출발 · " : ""}{item.arrivalTime} {item.arrivalLabel}</Text>
        </View>}
        <View style={styles.destinationSummaryRow}>
          <View style={styles.destinationWeatherLine}>
            <SunGlyph color={theme.clear} />
            <Text style={[[styles.signalText, { color: theme.text }], Platform.OS === "ios" && ambientVisual.signalText]} numberOfLines={1}>
              {item.originTemp} → {item.destinationTemp}
            </Text>
            <Text style={[styles.diffText, { color: warningColor }]} numberOfLines={1}>{item.tempDiff}</Text>
          </View>
          <View style={[[styles.rainPill, { backgroundColor: theme.cardStrong, borderColor: theme.border }], Platform.OS === "ios" && ambientVisual.rainPill]}>
            <Image source={screenIcons.rain} style={[styles.rainPillIcon, { tintColor: warningColor }]} resizeMode="contain" />
            <Text style={[styles.rainPillText, { color: warningColor }]} numberOfLines={1}>{item.rainPct}</Text>
          </View>
        </View>

        <View style={styles.destinationFooterRow}>
          <Text style={[styles.warningText, { color: warningColor }]} numberOfLines={1}>{getDestinationActionText(item)}</Text>
          <Text style={[[styles.repeatText, { color: theme.subtle }], Platform.OS === "ios" && ambientVisual.repeatText]} numberOfLines={1}>{item.repeatLabel}</Text>
        </View>
      </FeedbackPressable>

    </View>
  );
}

function getAlertPillLabel(careEnabled: boolean, permissionReady: boolean) {
  if (!permissionReady) return "권한 필요";
  return careEnabled ? "알림 켬" : "알림 꺼짐";
}

function DestinationLabelPill({ label, theme }: { label: DestinationLabel; theme: AppTheme }) {
  return (
    <View style={[styles.destinationLabelPill, { backgroundColor: `${theme.clear}18` }]}>
      <Text style={[styles.destinationLabelText, { color: theme.clear }]}>{getDestinationLabelText(label)}</Text>
    </View>
  );
}

function getStatusColor(careEnabled: boolean, permissionReady: boolean, theme: AppTheme) {
  if (!permissionReady) return theme.warm;
  if (careEnabled) return theme.clear;
  return theme.subtle;
}

function buildDestinationCards(
  savedDestinations: P0ScreenProps["savedDestinations"],
  care: P0ScreenProps["state"]["destinationCare"],
  destinationWeatherById: P0ScreenProps["state"]["destinationWeatherById"],
  temperatureUnit: P0ScreenProps["temperatureUnit"],
  wardrobeItems: P0ScreenProps["wardrobeItems"],
  preferenceProfile: UserPreferenceProfile,
  originAvailable: boolean,
): DestinationCardModel[] {
  if (!savedDestinations.length) return [];
  const originWeather = care.originWeather;

  return savedDestinations.map((destination) => {
    const destinationWeather = destinationWeatherById[destination.place.id] ?? care.destinationWeather;
    const destinationRainLegacy = Math.max(destinationWeather.current.rainProbabilityPct, ...destinationWeather.hourly.map((hour) => hour.rainProbabilityPct));
    const destinationWindLegacy = Math.max(destinationWeather.current.windMs, ...destinationWeather.hourly.map((hour) => hour.windMs));
    const timing = originAvailable ? getDestinationTiming(destination.travelEstimate, destination.schedulePreference, destination.place.timezone, Date.now(), originWeather.countryCode, destination.place.countryCode, originWeather.locationId) : undefined;
    const arrivalAt = timing?.arrivalAt;
    const hour = forecastAt(destinationWeather, arrivalAt);
    const available = Boolean(destinationWeatherById[destination.place.id]) && snapshotReliable(destinationWeather) && hour && (destinationWeather.source !== "weatherkit" || (hour.available?.rainProbability && hour.available.wind));
    const destinationRain = Platform.OS === "ios" ? available ? hour!.rainProbabilityPct : 0 : destinationRainLegacy;
    const destinationWind = Platform.OS === "ios" ? available ? hour!.windMs : 0 : destinationWindLegacy;
    const preparation = buildHomePreparation(destinationWeather, arrivalAt, true);
    const warning = buildDestinationWarning(destination.place.name, destinationRain, destinationWind, destination.alertCondition);
    const warningKind = destinationRain >= destination.alertCondition.rainThresholdPct
      ? "rain"
      : destinationWind >= destination.alertCondition.windThresholdMs ? "wind" : "none";
    const tone = destinationRain >= destination.alertCondition.rainThresholdPct || destinationWind >= destination.alertCondition.windThresholdMs ? "warm" : "clear";
    const schedule = getDestinationSchedule(destination, care, originAvailable);
    const outfit = recommendOutfit(destinationWeather, preferenceProfile, wardrobeItems);
    const outfitItems = Object.values(outfit.items).filter(Boolean);

    return {
      ...getDestinationWeatherPresentation(destinationWeatherById[destination.place.id]),
      ...(Platform.OS === "ios" ? { weatherNotice: !available ? "도착 시각 예보 확인 필요" : null, actionText: available ? `${forecastTime(Date.parse(arrivalAt!), destinationWeather)} 도착 무렵 · ${preparation.evidence || preparation.copy.replace(/\n/g, " ")}` : "도착 시각 예보 확인 필요" } : {}),
      id: destination.place.id,
      title: destination.place.name,
      area: getAreaLabel(destination.place),
      icon: "place",
      originTemp: formatTemperature(originWeather.current.tempC, temperatureUnit),
      destinationTemp: formatTemperature(destinationWeather.current.tempC, temperatureUnit),
      tempDiff: formatTemperatureDelta(destinationWeather.current.tempC - originWeather.current.tempC, temperatureUnit),
      rainPct: `${Math.round(destinationRain)}%`,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      arrivalLabel: schedule.arrivalLabel,
      repeatLabel: getRepeatLabel(destination.schedulePreference),
      warning,
      warningKind,
      outfitTitle: getOutfitVariantLabel(outfit.variant),
      outfitItems: outfitItems.slice(0, 3).map((item) => ({
        id: item?.id ?? "",
        name: item?.name ?? "",
        imageUrl: item?.imageUrl,
      })),
      tone,
      place: destination.place,
      saved: true,
      careEnabled: destination.careEnabled,
      label: destination.label,
      savedAtLabel: destination.savedAtLabel,
      changeStatus: destination.changeStatus,
    };
  });
}

// A fallback for a different place must never masquerade as this destination's weather.
function getDestinationWeatherPresentation(weather: WeatherSnapshot | undefined) {
  if (!weather || weather.locationUnverified || weather.source === "fallback" || weather.current.tempAvailable === false || !Number.isFinite(weather.current.tempC)) {
    return { weatherCondition: null, weatherAvailable: false, weatherNotice: "목적지 날씨 확인 중" };
  }
  const weatherNotice = weather.stale ? "이전 날씨 · 업데이트 필요"
    : !weather.hourly.some(hour => Date.parse(hour.time) > Date.now()) ? "시간대별 예보 확인 중" : null;
  return { weatherCondition: weather.current.condition, weatherAvailable: true, weatherNotice };
}

function buildDestinationWarning(
  destinationName: string,
  rainProbabilityPct: number,
  windMs: number,
  condition: P0ScreenProps["selectedDestinationAlertCondition"],
) {
  if (rainProbabilityPct >= condition.rainThresholdPct) return `${destinationName} 강수 ${Math.round(rainProbabilityPct)}%`;
  if (windMs >= condition.windThresholdMs) return `${destinationName} 바람 ${windMs.toFixed(1)}m/s`;
  return "날씨 차이 크지 않음";
}

function getDestinationResultBanner(
  accountGateResult: P0ScreenProps["accountGateResult"],
  permissionGateResult: P0ScreenProps["permissionGateResult"],
  hasDestinations: boolean,
): { title: string; body: string; tone: "clear" | "warm" } | null {
  if (permissionGateResult?.returnTo === "G1" && permissionGateResult.reason === "destination-care") {
    const skipped = permissionGateResult.outcome !== "allowed";
    return {
      title: skipped ? "목적지 저장 완료" : "목적지 알림 준비 완료",
      body: skipped ? "권한은 나중에 켜도 비교 가능" : "출발·강수 알림 자동 계산",
      tone: skipped ? "warm" : "clear",
    };
  }
  if (accountGateResult?.returnTo === "G1" && accountGateResult.pendingAction === "destination-care" && hasDestinations) {
    return {
      title: "목적지 저장 완료",
      body: "목적지를 눌러 준비 확인",
      tone: "clear",
    };
  }
  return null;
}

function getAreaLabel(place: PlaceSearchResult) {
  if (place.countryCode === "JP") {
    const city = getCountryCityLabel(place);
    return city ? `${city} · 일본` : "일본";
  }
  if (place.countryCode === "GLOBAL") return getGlobalAreaLabel(place);
  const parts = place.address.replace(/,/g, " ").split(" ").filter(Boolean);
  const province = parts[0] ?? "";
  const city = parts[1] ?? "";
  if (city && !isAdministrativeNoise(city)) return trimAdministrativeSuffix(city);
  if (province && !isAdministrativeNoise(province)) return trimAdministrativeSuffix(province);
  if (place.category === "sports") return "경기장";
  if (place.category === "beach") return "해변";
  if (place.category === "residential") return "주거지";
  if (place.category === "transit") return "교통";
  if (place.category === "medical") return "의료";
  if (place.category === "culture") return "문화";
  if (place.category === "religious") return "종교시설";
  if (place.category === "shopping") return "쇼핑";
  if (place.category === "leisure") return "여가";
  if (place.category === "dining") return "식음";
  return "목적지";
}

function getGlobalAreaLabel(place: PlaceSearchResult) {
  const parts = place.address.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 1] ?? "해외";
  return "해외";
}

function getCountryCityLabel(place: PlaceSearchResult) {
  const parts = place.address.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.length >= 2 ? parts[parts.length - 1] : null;
}

function isAdministrativeNoise(value: string) {
  return value === "County" || value === "Province" || value === "State" || value === "도";
}

function trimAdministrativeSuffix(value: string) {
  return value.replace(/(특별자치시|특별자치도|광역시|특별시|시|군)$/u, "");
}

function getDestinationActionText(item: DestinationCardModel) {
  if (item.actionText) return item.actionText;
  if (item.warningKind === "rain") return `우산 준비 · ${item.rainPct}`;
  if (item.warningKind === "wind") return "바람막이 확인";
  if (!item.careEnabled) return "알림 켜기";
  if (item.changeStatus === "saved") return "출발·강수 기준 확인";
  if (item.changeStatus === "restored") return "복구 알림 확인";
  return "출발 시간 확인";
}

function getDestinationSchedule(
  destination: P0ScreenProps["savedDestinations"][number],
  care: P0ScreenProps["state"]["destinationCare"],
  originAvailable: boolean,
) {
  const timing = originAvailable ? getDestinationTiming(destination.travelEstimate, destination.schedulePreference, destination.place.timezone, Date.now(), care.originWeather.countryCode, destination.place.countryCode, care.originWeather.locationId) : undefined;
  return {
    arrivalTime: timing ? formatRouteClock(timing.arrivalAt, destination.place.timezone) : destination.schedulePreference.targetArrivalTime,
    arrivalLabel: timing ? "예상 도착" : "도착 목표",
    departureTime: timing ? formatRouteClock(timing.departureAt, destination.place.timezone) : "경로 확인 전",
  };
}

const repeatDayLabels: Record<P0ScreenProps["selectedDestinationSchedulePreference"]["repeatDays"][number], string> = {
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
  sat: "토",
  sun: "일",
};

function getRepeatLabel(schedulePreference: P0ScreenProps["selectedDestinationSchedulePreference"]) {
  if (!schedulePreference.repeatEnabled || schedulePreference.repeatDays.length === 0) return "없음";
  if (schedulePreference.repeatDays.length >= 5) return "주중";
  return schedulePreference.repeatDays.map((day) => repeatDayLabels[day]).join("");
}

function SunGlyph({ color }: { color: string }) {
  if (Platform.OS === "ios") return <Image source={ambientUiIcons.temperature} style={{ width: 24, height: 24, tintColor: color }} resizeMode="contain" accessibilityElementsHidden />;
  return (
    <View style={styles.sunGlyph} accessibilityElementsHidden>
      <View style={[styles.sunCore, { borderColor: color }]} />
      <View style={[styles.sunRayVertical, { backgroundColor: color }]} />
      <View style={[styles.sunRayHorizontal, { backgroundColor: color }]} />
    </View>
  );
}

function PlaceGlyph({ type, color }: { type: DestinationCardModel["icon"]; color: string }) {
  const source = type === "place" ? screenIcons.pin : screenIcons.pin;
  return (
    <Image source={source} style={[styles.placeGlyph, { tintColor: color }]} resizeMode="contain" accessibilityElementsHidden />
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
    minHeight: "100%",
    alignSelf: "center",
  },
  header: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: 0,
  },
  destinationList: {
    gap: spacing.sm,
  },
  secondaryActions: {
    gap: spacing.sm,
  },
  limitHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  addDestinationRail: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addDestinationIcon: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
  },
  addDestinationText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  destinationCard: {
    gap: 8,
    borderRadius: radius.md,
    borderLeftWidth: 2,
    borderWidth: 1,
  },
  destinationMainButton: {
    gap: 7,
  },
  emptyCard: {
    gap: spacing.md,
    borderRadius: radius.lg,
    borderLeftWidth: 2,
    borderWidth: 1,
  },
  emptyHeader: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  emptyIconBox: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  emptyCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  emptyTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  emptyBody: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  emptyBenefitGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  emptyBenefit: {
    flex: 1,
    minHeight: 72,
    gap: 6,
    justifyContent: "center",
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  emptyBenefitIcon: {
    width: 20,
    height: 20,
  },
  emptyBenefitCopy: {
    gap: 2,
  },
  emptyBenefitTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  emptyBenefitBody: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  destinationTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  destinationIconFrame: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    borderRadius: radius.pill,
  },
  destinationTitleColumn: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  destinationNameRow: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  destinationSelectedCheck: {
    width: 13,
    height: 13,
    flexShrink: 0,
  },
  destinationName: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  destinationLabelPill: {
    minHeight: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
  },
  destinationLabelText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
  },
  destinationArea: {
    flexShrink: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },
  readyPill: {
    minWidth: 56,
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    marginTop: 5,
    borderRadius: radius.pill,
  },
  readyText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  chevron: {
    marginTop: 5,
    fontSize: 17,
    lineHeight: 20,
    fontWeight: "700",
  },
  destinationSummaryRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  destinationWeatherLine: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  rainPill: {
    minWidth: 56,
    minHeight: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  rainPillIcon: {
    width: 13,
    height: 13,
  },
  rainPillText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  signalText: {
    flexShrink: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  diffText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  repeatText: {
    flexShrink: 0,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  destinationFooterRow: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  warningText: {
    flexShrink: 1,
    minWidth: 0,
    maxWidth: "100%",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  sunGlyph: {
    width: 19,
    height: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  sunCore: {
    position: "absolute",
    width: 10,
    height: 10,
    borderWidth: 1.6,
    borderRadius: 6,
  },
  sunRayVertical: {
    position: "absolute",
    width: 1.6,
    height: 19,
    borderRadius: 2,
  },
  sunRayHorizontal: {
    position: "absolute",
    width: 19,
    height: 1.6,
    borderRadius: 2,
  },
  placeGlyph: {
    width: 19,
    height: 19,
    flexShrink: 0,
  },
});

const screenIcons = Platform.OS === "ios" ? { ...uiIconAssets, ...ambientScreenIconOverrides } : uiIconAssets;

// Approved Ambient reading hierarchy; Android retains its original styles.
const ambientVisual = StyleSheet.create({
  "destinationCard": {
    "backgroundColor": "transparent",
    "borderWidth": 0,
    "borderRadius": 0,
    "shadowOpacity": 0,
    "paddingHorizontal": 0,
    "borderBottomWidth": 0.5,
    "paddingVertical": 18
  },
  "addDestinationRail": {
    "backgroundColor": "transparent",
    "borderWidth": 0,
    "borderRadius": 0,
    "shadowOpacity": 0,
    "paddingHorizontal": 0,
    "borderBottomWidth": 0.5,
    "paddingVertical": 18
  },
  "emptyCard": {
    "backgroundColor": "transparent",
    "borderWidth": 0,
    "borderRadius": 0,
    "shadowOpacity": 0,
    "paddingHorizontal": 0,
    "paddingVertical": 18,
    "gap": 16
  },
  "emptyBenefit": {
    "backgroundColor": "transparent",
    "borderWidth": 0
  },
  "destinationIconFrame": {
    "backgroundColor": "transparent",
    "borderWidth": 0
  },
  "readyPill": {
    "backgroundColor": "transparent",
    "borderWidth": 0
  },
  "rainPill": {
    "backgroundColor": "transparent",
    "borderWidth": 0
  },
  "signalText": {
    "fontSize": 16,
    "lineHeight": 23,
    "fontWeight": "500"
  },
  "repeatText": {
    "fontSize": 14,
    "lineHeight": 20,
    "fontWeight": "400"
  },
  "destinationArea": {
    "fontSize": 14,
    "lineHeight": 20,
    "fontWeight": "400"
  },
  "readyText": {
    "fontSize": 14,
    "lineHeight": 20,
    "fontWeight": "400"
  }
});
