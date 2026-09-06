import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, Modal, PanResponder, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getOutfitImageSource, outfitImageAssets, uiIconAssets } from "../assets";
import { FeedbackPressable } from "../components/FeedbackPressable";
import { IosGlassBackdrop } from "../components/IosGlassBackdrop";
import { WeatherBackground } from "../components/WeatherBackground";
import { WeatherStatusPanel } from "../components/WeatherStatusPanel";
import type { P0RouteId } from "../navigation/routes";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { pageStyles } from "../theme/pageStyles";
import { iosGlassSurface } from "../theme/iosGlass";
import { useResponsiveLayout, type ResponsiveLayout } from "../theme/responsiveLayout";
import { radius, semanticColor, spacing, type AppTheme } from "../theme/tokens";
import { getDisplayLocationName } from "../utils/locationDisplay";
import { resolveWeatherTimeZone } from "../utils/weatherDaylight";
import { useIsNightHour } from "../utils/useIsNightHour";
import { androidMaterialColor, androidMaterialSurface } from "../theme/androidMaterial";
import { formatTemperature, formatTemperatureDelta } from "../utils/units";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { getHomeCompanionMessage, getHomeDepartureSummary } from "../utils/homeCompanion";
import { getConditionIcon, getConditionColor, getConditionLabel } from "../utils/weatherPresentation";

// 2026-07-08 출시 로드맵: 코디가 출시 범위에 포함되어 홈 코디 카드 노출.
const HOME_OUTFIT_CARD_VISIBLE = true;
const HOME_OUTFIT_FALLBACK_IMAGE = "assets/outfits/weatheron-outfit-light-rain-jacket-v1.png";

export function HomeScreen({
  state,
  savedDestinations,
  selectedDestinationPlace,
  selectedDestinationDepartureAt,
  readNotificationIds,
  notificationHistory,
  smartCareEnabled,
  isWeatherLoading,
  permissionReady,
  locationReady,
  weatherLocationMode,
  placeSearchOrigin,
  temperatureUnit,
  onNavigate,
  onSetWeatherProviderMode,
  onRefreshWeather,
  onSelectDestinationPlace,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onOpenNotificationDeepLink,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const [notificationSidebarOpen, setNotificationSidebarOpen] = useState(false);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [refreshCompletedAt, setRefreshCompletedAt] = useState(0);
  const pullRefreshObservedLoadingRef = useRef(false);
  const activeNotifications = state.notifications.filter((item) => item.active);
  const activeWeatherAlert = state.officialSpecialAlert.active ? state.officialSpecialAlert : null;
  const unreadNotificationCount = permissionReady
    ? activeNotifications.filter((item) => !readNotificationIds.includes(item.id)).length
    : 0;
  const destinationReady = state.hasDestination && state.destinationCare.name !== "목적지 미등록";
  const homeDecision = buildHomeDecision(state.destinationCare, destinationReady, temperatureUnit);
  const currentWeather = state.destinationCare.originWeather;
  const todayMinMax = getTodayMinMax(currentWeather);
  const currentLocationName = getDisplayLocationName(currentWeather.locationName);
  const current = currentWeather.current;
  const isNight = useIsNightHour({
    coordinate: placeSearchOrigin?.coordinate,
    timeZone: resolveWeatherTimeZone(currentWeather.countryCode, placeSearchOrigin?.timezone ?? currentWeather.timezone),
  });
  const reliableWeather = state.weatherProvider.status === "ready" && !state.weatherProvider.fallbackUsed && !currentWeather.stale;
  const companionMessage = getHomeCompanionMessage(currentWeather, reliableWeather);
  const departureSummary = getHomeDepartureSummary(state.destinationCare, destinationReady, selectedDestinationDepartureAt);
  const refreshMessage = isWeatherLoading ? "날씨 확인 중이에요" : refreshCompletedAt > Date.now() - 10_000 ? "방금 확인했어요" : "";
  const locationStatus = getHomeLocationStatus(locationReady, weatherLocationMode);
  const selectedDestination = savedDestinations.find((destination) => destination.place.id === selectedDestinationPlace.id) ?? savedDestinations[0] ?? null;

  const refreshFromPull = useCallback(() => {
    pullRefreshObservedLoadingRef.current = false;
    setRefreshCompletedAt(0);
    setIsPullRefreshing(true);
    onRefreshWeather();
  }, [onRefreshWeather]);

  useEffect(() => {
    if (!isPullRefreshing) return;
    if (isWeatherLoading) {
      pullRefreshObservedLoadingRef.current = true;
      return;
    }
    if (pullRefreshObservedLoadingRef.current) {
      setIsPullRefreshing(false);
      if (reliableWeather) setRefreshCompletedAt(Date.now());
    }
  }, [isPullRefreshing, isWeatherLoading, reliableWeather]);

  useEffect(() => {
    if (!refreshCompletedAt) return;
    const timer = setTimeout(() => setRefreshCompletedAt(0), 10_000);
    return () => clearTimeout(timer);
  }, [refreshCompletedAt]);

  return (
    <View style={[styles.screenWrap, { backgroundColor: theme.background }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <WeatherBackground condition={current.condition} theme={theme} isNight={isNight} subtle />
      </View>
      <ScrollView
        testID="home-scroll"
        style={styles.homeScroll}
        contentContainerStyle={[
          styles.homeContent,
          {
            maxWidth: layout.contentMaxWidth,
            gap: Math.max(layout.isShort ? 6 : 8, layout.homeContentGap),
            paddingHorizontal: layout.screenHorizontalPadding,
            // 출발·MY의 44pt 제목 행과 첫 줄 시작점을 맞춘다.
            paddingTop: layout.weatherTopPadding + (44 - pageStyles.title.lineHeight) / 2,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isPullRefreshing}
            onRefresh={refreshFromPull}
            tintColor={theme.clear}
            colors={[theme.clear]}
            progressBackgroundColor={theme.cardStrong}
          />
        }
      >
        <View style={styles.topBar}>
          {(
            <View style={styles.iosLocationHeader}>
              <Text style={[styles.iosLocationName, { color: theme.text }]} numberOfLines={1}>{currentLocationName}</Text>
              <Text accessibilityLiveRegion="polite" style={[styles.iosSecondaryText, { color: theme.muted }]}>{refreshMessage || locationStatus.value}</Text>
            </View>
          )}
          <NotificationBellButton
            unreadCount={unreadNotificationCount}
            smartCareEnabled={smartCareEnabled}
            theme={theme}
            onPress={() => setNotificationSidebarOpen(true)}
          />
        </View>

        <View testID="home-decision-stack" style={styles.decisionStack}>
          <HomeDecisionHero
            current={current}
            isNight={isNight}
            companionMessage={companionMessage}
            currentLocationName={currentLocationName}
            todayMinMax={todayMinMax}
            temperatureUnit={temperatureUnit}
            theme={theme}
            onOpenForecast={() => onNavigate("H6")}
          />
          {activeWeatherAlert ? (
            <SpecialWeatherAlertCard
              alert={activeWeatherAlert}
              theme={theme}
              onPress={() => onOpenNotificationDeepLink("official-kma-special-alert", "H3")}
            />
          ) : null}
        </View>

        <View
          testID="home-plan-card"
          style={[
            styles.homePlanCard,
            {
              padding: layout.homePanelPadding,
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            androidMaterialSurface(theme, "surfaceContainer"),
          ]}
        >
          <DestinationSelectorCard
            savedDestinations={savedDestinations}
            selectedDestinationId={selectedDestination?.place.id}
            theme={theme}
            onSelect={(place) => onSelectDestinationPlace(place)}
            onAdd={() => onNavigate("P1")}
          />
          {destinationReady ? (
            <HomeValueTransition value={`${selectedDestination?.place.id}:${departureSummary.value}:${departureSummary.body}`}>
              <FeedbackPressable
                accessibilityRole="button"
                accessibilityLabel={`출발 안내 ${departureSummary.value}. ${departureSummary.body}`}
                onPress={() => onNavigate(destinationReady ? "G2" : "P1")}
                style={[styles.iosDeparture, { borderColor: theme.border }, isHomeTightLayout(layout) && styles.iosDepartureCompact]}
              >
                {isHomeTightLayout(layout) ? <>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={[styles.iosSecondaryText, { color: departureSummary.soon ? theme.gold : theme.muted }]}>{departureSummary.soon ? "이제 나갈 준비해요" : "추천 출발 시간"}</Text>
                    <Text style={[styles.iosSecondaryText, { color: theme.muted }]} numberOfLines={2}>{departureSummary.body}</Text>
                  </View>
                  <Text style={[styles.iosCompactDepartureTime, { color: theme.text }]}>{departureSummary.value}</Text>
                </> : <>
                <View style={styles.iosDepartureHeading}>
                  <Text style={[styles.iosSecondaryText, { color: departureSummary.soon ? theme.gold : theme.muted }]}>{departureSummary.soon ? "이제 나갈 준비해요" : "추천 출발 시간"}</Text>
                  <Text style={{ color: theme.muted }}>›</Text>
                </View>
                <Text style={[styles.iosDepartureTime, { color: theme.text }]}>{departureSummary.value}</Text>
                <Text style={[styles.iosSecondaryText, { color: theme.muted }]}>{departureSummary.body}</Text>
                </>}
              </FeedbackPressable>
            </HomeValueTransition>
          ) : null}
          {destinationReady ? <HomeValueTransition value={`${selectedDestination?.place.id}:${state.destinationCare.destinationWeather.current.rainProbabilityPct}:${homeDecision.rainCompactTitle}:${homeDecision.packTitle}`}>
          <View style={styles.visualDecisionGrid}>
            <VisualDecisionCard
              label={"목적지 강수"}
              value={destinationReady ? `${state.destinationCare.destinationWeather.current.rainProbabilityPct}%` : "목적지 선택"}
              helper={"시간별 예보 보기"}
              accent={getInfoAccent(theme)}
              icon={uiIconAssets.rain}
              theme={theme}
              onPress={() => onNavigate(destinationReady ? "H5" : "P1")}
            />
            <VisualDecisionCard
              label={destinationReady ? "목적지 준비물" : "오늘 챙길 것"}
              value={homeDecision.packTitle}
              helper={homeDecision.packBody}
              accent={getPackAccent(homeDecision.packTone, theme)}
              icon={homeDecision.packIcon}
              theme={theme}
              onPress={() =>
                onNavigate(homeDecision.packFocus === "umbrella" ? (destinationReady ? "H4" : "P1") : "C1")
              }
            />
          </View>
          </HomeValueTransition> : null}
        </View>

        {!layout.isShort && HOME_OUTFIT_CARD_VISIBLE ? (
          <HomeOutfitPreviewCard outfit={state.outfit} packTitle={homeDecision.packTitle} theme={theme} onPress={() => onNavigate("C1")} />
        ) : null}
        <View style={styles.cardStack}>
          {!isWeatherLoading && (state.weatherProvider.status !== "ready" || state.weatherProvider.retryable || state.weatherProvider.fallbackUsed) ? (
            <WeatherStatusPanel
              status={state.weatherProvider.status}
              message={state.weatherProvider.message}
              retryable={state.weatherProvider.retryable}
              loading={isWeatherLoading}
              onSetMode={onSetWeatherProviderMode}
              onRetry={onRefreshWeather}
            />
          ) : null}
        </View>
      </ScrollView>


      <NotificationSidebar
        visible={notificationSidebarOpen}
        notifications={activeNotifications}
        readNotificationIds={readNotificationIds}
        notificationHistory={notificationHistory}
        fallbackTimestamp={state.weatherProvider.currentObservedAt}
        smartCareEnabled={smartCareEnabled}
        permissionReady={permissionReady}
        theme={theme}
        onClose={() => setNotificationSidebarOpen(false)}
        onMarkAllNotificationsRead={onMarkAllNotificationsRead}
        onMarkNotificationRead={onMarkNotificationRead}
        onOpenSettings={() => {
          setNotificationSidebarOpen(false);
          onNavigate("M2");
        }}
        onOpenCenter={() => {
          setNotificationSidebarOpen(false);
          onNavigate("H3");
        }}
        onOpen={(id, route) => {
          onOpenNotificationDeepLink(id, route);
          setNotificationSidebarOpen(false);
        }}
      />
    </View>
  );
}

function getHomeLocationStatus(
  locationReady: boolean,
  weatherLocationMode: P0ScreenProps["weatherLocationMode"],
): { value: string; tone: "clear" | "sky" | "warm" } {
  if (locationReady && weatherLocationMode === "auto") return { value: "내 위치로 보는 중", tone: "clear" };
  if (weatherLocationMode === "manual") return { value: "직접 고른 지역", tone: "sky" };
  return { value: "위치 확인 필요", tone: "warm" };
}

function isHomeTightLayout(layout: ResponsiveLayout) {
  return layout.isShort || (layout.isNarrow && layout.homeCompact);
}

function DestinationSelectorCard({
  savedDestinations,
  selectedDestinationId,
  theme,
  onSelect,
  onAdd,
}: {
  savedDestinations: P0ScreenProps["savedDestinations"];
  selectedDestinationId?: string;
  theme: AppTheme;
  onSelect: (place: P0ScreenProps["selectedDestinationPlace"]) => void;
  onAdd: () => void;
}) {
  const layout = useResponsiveLayout();
  const hasDestinations = savedDestinations.length > 0;
  const tightLayout = isHomeTightLayout(layout);
  const reducedMotion = useReducedMotion();
  const addControlGlass = iosGlassSurface(theme, "control", { nativeBackdrop: true });
  const destinationChipGlass = iosGlassSurface(theme, "chip", { nativeBackdrop: true });
  const headerCaption = hasDestinations
    ? `저장한 ${savedDestinations.length}곳 · 눌러서 바꿔보기`
    : "자주 가는 곳을 골라보세요";

  return (
    <View style={styles.destinationSelectorCard}>
      {!((tightLayout || !hasDestinations)) ? <View style={styles.destinationSelectorHeader}>
        <View style={[styles.destinationSelectorIconFrame, { backgroundColor: `${theme.gold}14` }]}>
          <Image source={uiIconAssets.pin} style={[styles.destinationSelectorIcon, { tintColor: theme.gold }]} resizeMode="contain" />
        </View>
        <View style={styles.destinationSelectorCopy}>
          <Text style={[styles.destinationSelectorLabel, { color: theme.gold }]}>오늘의 목적지</Text>
          {tightLayout ? null : <Text style={[styles.destinationSelectorMeta, { color: theme.subtle }]} numberOfLines={1}>{headerCaption}</Text>}
        </View>
        <FeedbackPressable
          accessibilityLabel="새 목적지 추가"
          accessibilityRole="button"
          onPress={onAdd}
          style={[
            styles.destinationSelectorAddButton,
            { backgroundColor: addControlGlass ? theme.cardStrong : "transparent", borderColor: theme.border },
            addControlGlass,
          ]}
        >
          {addControlGlass ? <IosGlassBackdrop theme={theme} role="control" style={styles.destinationAddBackdrop} /> : null}
          <Text style={[styles.destinationSelectorAddText, { color: theme.gold }]}>추가</Text>
        </FeedbackPressable>
      </View> : null}

      {!hasDestinations ? (
        <FeedbackPressable
          accessibilityLabel="자주 가는 곳 추가"
          accessibilityRole="button"
          onPress={onAdd}
          style={[styles.destinationEmptySelector, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
        >
          <Text style={[styles.destinationEmptyTitle, { color: theme.text }]}>자주 가는 곳 추가</Text>
          <Text style={[styles.destinationEmptyBody, { color: theme.subtle }]}>날씨와 출발 시간을 맞춰드림</Text>
        </FeedbackPressable>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destinationChipRow}>
          {savedDestinations.map((destination) => {
            const selected = destination.place.id === selectedDestinationId;
            return (
              <FeedbackPressable
                key={destination.place.id}
                accessibilityLabel={`${destination.place.name} 목적지${selected ? " 선택됨" : "로 전환"}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onSelect(destination.place)}
                style={({ pressed }) => [
                  styles.destinationChip,
                  {
                    backgroundColor: selected ? `${theme.gold}1F` : theme.cardStrong,
                    borderColor: selected ? theme.gold : theme.border,
                  },
                  destinationChipGlass,
                  { borderColor: selected ? theme.clear : theme.border, backgroundColor: selected ? `${theme.clear}18` : theme.cardStrong, transform: [{ scale: pressed && reducedMotion === false ? 0.96 : 1 }] },
                  androidMaterialSurface(theme, selected ? "secondaryContainer" : "surfaceContainerHigh"),
                ]}
              >
                {destinationChipGlass ? <IosGlassBackdrop theme={theme} role="chip" style={styles.destinationChipBackdrop} /> : null}
                <View style={styles.destinationChipTitleRow}>
                  {selected ? <View style={[styles.destinationChipDot, { backgroundColor: theme.clear }]} /> : null}
                  <Text style={[styles.destinationChipTitle, { color: selected ? (Platform.OS === "android" ? androidMaterialColor(theme, "onSecondaryContainer") : theme.clear) : theme.text }]} numberOfLines={1}>
                    {destination.place.name}
                  </Text>
                </View>
                <Text style={[styles.destinationChipMeta, { color: theme.subtle }]} numberOfLines={1}>
                  {getDestinationSelectorMeta(destination.place)}
                </Text>
              </FeedbackPressable>
            );
          })}
          {tightLayout ? <FeedbackPressable accessibilityRole="button" accessibilityLabel="새 목적지 추가" onPress={onAdd} style={[styles.destinationSelectorAddButton, { borderColor: theme.border }]}>
            <Text style={[styles.destinationSelectorAddText, { color: theme.clear }]}>추가</Text>
          </FeedbackPressable> : null}
        </ScrollView>
      )}
    </View>
  );
}

function getDestinationSelectorMeta(place: P0ScreenProps["selectedDestinationPlace"]) {
  const addressParts = place.address.replace(/,/g, " ").split(" ").filter(Boolean);
  const city = addressParts.find((part) => !isSelectorAddressNoise(part));
  const category = getDestinationCategoryLabel(place.category);
  if (city) return `${trimSelectorAddress(city)} · ${category}`;
  if (place.countryCode === "GLOBAL") return `해외 · ${category}`;
  return category;
}

function isSelectorAddressNoise(value: string) {
  return value === "대한민국" || value === "한국" || value === "South" || value === "Korea";
}

function trimSelectorAddress(value: string) {
  return value.replace(/(특별자치시|특별자치도|광역시|특별시|시|군|구)$/u, "");
}

function getDestinationCategoryLabel(category: string) {
  if (category === "work") return "업무";
  if (category === "school") return "학교";
  if (category === "sports") return "스포츠";
  if (category === "mountain") return "산행";
  if (category === "beach") return "해변";
  if (category === "residential") return "주거지";
  if (category === "transit") return "교통";
  if (category === "medical") return "의료";
  if (category === "culture") return "문화";
  if (category === "religious") return "종교시설";
  if (category === "shopping") return "쇼핑";
  if (category === "leisure") return "여가";
  if (category === "dining") return "식음";
  if (category === "airport") return "공항";
  if (category === "hotel") return "숙소";
  return "목적지";
}

function buildHomeDecision(
  care: P0ScreenProps["state"]["destinationCare"],
  destinationReady: boolean,
  temperatureUnit: P0ScreenProps["temperatureUnit"],
) {
  const targetArrivalTime = care.departureAdvice?.targetArrivalTime ?? "13:00";
  const travelMinutes = care.departureAdvice?.travelMinutes;
  const bufferMinutes = care.departureAdvice?.bufferMinutes;
  const routeTimingReady = typeof travelMinutes === "number" && typeof bufferMinutes === "number";
  const departureTime = routeTimingReady
    ? care.departureAdvice?.recommendedDepartureTime ?? subtractMinutes(targetArrivalTime, travelMinutes + bufferMinutes)
    : "계산 중";
  const routeStatusLabel = getRouteStatusLabel(care.departureAdvice?.travelStatus);
  const destinationDiff = destinationReady
    ? buildDestinationDiff(care, temperatureUnit)
    : {
        title: "아직 고른 곳 없음",
        body: "목적지를 고르면 출발 시간까지 챙겨드림",
      };
  const rainWindow = destinationReady
    ? buildRainWindow(care)
    : {
        title: "목적지 고르면 안내 시작",
        body: "가는 곳 기준으로 비 시작과 잦아드는 때를 알려드림",
        compactTitle: "대기",
        compactBody: "목적지 추가",
      };

  return {
    departureTime,
    departureBody: destinationReady
      ? routeTimingReady
        ? `${targetArrivalTime} 도착 · 이동 ${travelMinutes}분 · 여유 ${bufferMinutes}분 · ${routeStatusLabel}`
        : `${targetArrivalTime} 도착 · 해외 경로 확인 전`
      : "현재 위치 날씨를 보고 있음 · 목적지를 고르면 출발 시간까지 챙겨드림",
    destinationTitle: destinationDiff.title,
    destinationBody: destinationDiff.body,
    rainTitle: rainWindow.title,
    rainBody: destinationReady ? rainWindow.body : rainWindow.body,
    rainCompactTitle: rainWindow.compactTitle,
    rainCompactBody: rainWindow.compactBody,
    ...buildPackDecision(destinationReady ? care.destinationWeather.current : care.originWeather.current),
  };
}

function getRouteStatusLabel(status?: NonNullable<P0ScreenProps["state"]["destinationCare"]["departureAdvice"]>["travelStatus"]) {
  if (status === "ready") return "길 안내 준비됨";
  if (status === "error") return "길 안내 다시 확인 필요";
  return "길 찾는 중";
}

function buildDestinationDiff(
  care: P0ScreenProps["state"]["destinationCare"],
  temperatureUnit: P0ScreenProps["temperatureUnit"],
) {
  const origin = care.originWeather.current;
  const destination = care.destinationWeather.current;
  const tempDiff = Math.round(destination.tempC - origin.tempC);
  const rainDiff = Math.round(destination.rainProbabilityPct - origin.rainProbabilityPct);
  const windDiff = Number((destination.windMs - origin.windMs).toFixed(1));
  const titleParts = [
    formatTemperatureDelta(tempDiff, temperatureUnit),
    `${destination.rainProbabilityPct}%`,
  ];
  const diffParts = [
    rainDiff === 0 ? "강수 차이 없음" : `강수 ${rainDiff > 0 ? "+" : ""}${rainDiff}%`,
    windDiff === 0 ? "바람 차이 없음" : `바람 ${windDiff > 0 ? "+" : ""}${windDiff}m/s`,
  ];
  return {
    title: titleParts.join(" · "),
    body: `${getDisplayLocationName(care.originWeather.locationName)}과 비교 · ${diffParts.join(" · ")} · 가는 곳 기준으로 준비`,
  };
}

function buildRainWindow(care: P0ScreenProps["state"]["destinationCare"]) {
  const threshold = care.alertCondition?.rainThresholdPct ?? 50;
  const rainyHours = care.destinationWeather.hourly.filter((hour) => hour.rainProbabilityPct >= threshold || hour.precipitationMm > 0);
  if (rainyHours.length === 0) {
    const maxRain = Math.max(care.destinationWeather.current.rainProbabilityPct, ...care.destinationWeather.hourly.map((hour) => hour.rainProbabilityPct));
    return {
      title: `비 올 가능성 최대 ${Math.round(maxRain)}%`,
      body: `${care.name} 기준 ${threshold}% 미만 · 우산 알림은 잠시 쉬어감`,
      compactTitle: "비 소식 없음",
      compactBody: `최대 ${Math.round(maxRain)}%`,
    };
  }
  const firstRain = rainyHours[0];
  const lastRain = rainyHours[rainyHours.length - 1];
  return {
    title: `비 시작 ${formatHour(firstRain.time)} · 완화 ${formatHour(lastRain.time)}`,
    body: `${care.name}에 비 올 가능성 ${threshold}% 기준 · 알림 시간은 타임라인에서 바꿀 수 있음`,
    compactTitle: formatHour(lastRain.time),
    compactBody: `${formatHour(firstRain.time)} 시작`,
  };
}

function buildPackDecision(weather: P0ScreenProps["state"]["destinationCare"]["originWeather"]["current"]) {
  if (weather.rainProbabilityPct >= 50 || weather.precipitationMm > 0) {
    return { packTitle: "우산", packBody: "비 오기 전 챙기기", packIcon: uiIconAssets.umbrella, packTone: "sky" as const, packFocus: "umbrella" as const };
  }
  if (weather.windMs >= 7) {
    return { packTitle: "바람막이", packBody: "바람 막아줄 한 겹", packIcon: uiIconAssets.shirt, packTone: "warm" as const, packFocus: "outfit" as const };
  }
  if (weather.feelsLikeC <= 5) {
    return { packTitle: "겉옷", packBody: "쌀쌀함 막아줄 한 겹", packIcon: uiIconAssets.shirt, packTone: "warm" as const, packFocus: "outfit" as const };
  }
  return { packTitle: "가볍게", packBody: "가벼운 차림이면 충분", packIcon: uiIconAssets.check, packTone: "clear" as const, packFocus: "outfit" as const };
}

function getInfoAccent(theme: AppTheme): string {
  return theme.skyLite;
}

function getPackAccent(tone: ReturnType<typeof buildPackDecision>["packTone"], theme: AppTheme): string {
  if (tone === "sky") return getInfoAccent(theme);
  if (tone === "warm") return theme.warm;
  return theme.clear;
}

function subtractMinutes(time: string, minutes: number) {
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return time;
  const dayMinutes = 24 * 60;
  const total = ((hour * 60 + minute - minutes) % dayMinutes + dayMinutes) % dayMinutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function formatHour(value: string) {
  const directTime = value.match(/(\d{1,2}):(\d{2})/);
  if (directTime) return `${directTime[1].padStart(2, "0")}:${directTime[2]}`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${String(date.getHours()).padStart(2, "0")}:00`;
}

function getTodayMinMax(
  weather: P0ScreenProps["state"]["destinationCare"]["originWeather"],
): { minTempC: number; maxTempC: number } | null {
  const today = weather.daily?.[0];
  if (today) return { minTempC: today.minTempC, maxTempC: today.maxTempC };
  if (weather.hourly.length === 0) return null;
  const temperatures = weather.hourly.map((hour) => hour.tempC);
  return { minTempC: Math.min(...temperatures), maxTempC: Math.max(...temperatures) };
}

function getHeroTemperatureRange(
  todayMinMax: { minTempC: number; maxTempC: number },
  temperatureUnit: P0ScreenProps["temperatureUnit"],
) {
  return `최고 ${formatTemperature(todayMinMax.maxTempC, temperatureUnit)} · 최저 ${formatTemperature(todayMinMax.minTempC, temperatureUnit)}`;
}

function HomeDecisionHero({
  current,
  isNight,
  currentLocationName,
  companionMessage,
  todayMinMax,
  temperatureUnit,
  theme,
  onOpenForecast,
}: {
  current: P0ScreenProps["state"]["destinationCare"]["originWeather"]["current"];
  isNight: boolean;
  currentLocationName: string;
  companionMessage: string;
  todayMinMax: { minTempC: number; maxTempC: number } | null;
  temperatureUnit: P0ScreenProps["temperatureUnit"];
  theme: AppTheme;
  onOpenForecast: () => void;
}) {
  const layout = useResponsiveLayout();
  return (
      <View testID="home-weather" style={[styles.iosWeatherHero, { paddingVertical: layout.homePanelPadding }]}>
        <FeedbackPressable accessibilityRole="button" accessibilityLabel={`${currentLocationName} ${formatTemperature(current.tempC, temperatureUnit)}, 날씨 상세 보기`} onPress={onOpenForecast} style={styles.iosWeatherMain}>
          <View style={styles.iosWeatherCopy}>
            <HomeValueTransition value={`${current.tempC}:${temperatureUnit}`}>
              <Text style={[styles.iosTemperature, { color: theme.text, fontSize: layout.isShort ? 56 : 68, lineHeight: layout.isShort ? 62 : 76 }]}>{formatTemperature(current.tempC, temperatureUnit)}</Text>
            </HomeValueTransition>
            <Text style={[styles.iosCondition, { color: theme.text }]}>{getConditionLabel(current.condition)}</Text>
            <Text style={[styles.iosSecondaryText, { color: theme.muted }]}>{todayMinMax ? getHeroTemperatureRange(todayMinMax, temperatureUnit) : ""}</Text>
          </View>
          <Image source={getConditionIcon(current.condition, isNight)} resizeMode="contain" style={[styles.iosWeatherIcon, { tintColor: getConditionColor(current.condition, theme, isNight), width: layout.homeWeatherOrbSize + 16, height: layout.homeWeatherOrbSize + 16 }]} />
        </FeedbackPressable>
        <HomeValueTransition value={companionMessage}>
          <Text style={[styles.iosCompanion, { color: theme.text }]}>{companionMessage}</Text>
        </HomeValueTransition>
        <Text style={[styles.iosSecondaryText, { color: theme.muted }]}>
          체감 {formatTemperature(current.feelsLikeC, temperatureUnit)} · 강수 {current.rainProbabilityPct}%
        </Text>
      </View>
    );
}

function VisualDecisionCard({
  label,
  value,
  helper,
  accent,
  icon,
  theme,
  onPress,
}: {
  label: string;
  value: string;
  helper: string;
  accent: string;
  icon: number;
  theme: AppTheme;
  onPress: () => void;
}) {
  return (
      <FeedbackPressable accessibilityRole="button" accessibilityLabel={`${label} ${value}. ${helper}`} onPress={onPress} style={[styles.iosSupportingAction, { backgroundColor: theme.cardStrong }, androidMaterialSurface(theme, "surfaceContainerHigh")]}>
        <Text style={[styles.iosSecondaryText, { color: theme.muted }]}>{label}</Text>
        <View style={styles.iosSupportingValue}>
          <Image source={icon} resizeMode="contain" style={{ width: 18, height: 18, tintColor: accent }} />
          <Text style={[styles.iosSupportingTitle, { color: theme.text }]} numberOfLines={2}>{value}</Text>
        </View>
      </FeedbackPressable>
    );
}

function HomeOutfitPreviewCard({
  outfit,
  packTitle,
  theme,
  onPress,
}: {
  outfit: P0ScreenProps["state"]["outfit"];
  packTitle: string;
  theme: AppTheme;
  onPress: () => void;
}) {
  const layout = useResponsiveLayout();
  const tightLayout = isHomeTightLayout(layout);
  const imageSource = getHomeOutfitPreviewImage(outfit);
  const compactCopy = getHomeOutfitCopy(outfit.decisionText, packTitle);
  const title = getHomeOutfitTitle(compactCopy.title);
  return (
    <FeedbackPressable
      accessibilityLabel={`오늘 입기 좋은 코디 ${outfit.decisionText}`}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.homeOutfitCard,
        {
          minHeight: layout.homeOutfitMinHeight,
          gap: tightLayout ? spacing.sm : spacing.md,
          paddingHorizontal: tightLayout ? spacing.sm : layout.homeCompact ? spacing.md : spacing.lg,
          paddingVertical: tightLayout ? 4 : layout.homeCompact ? spacing.xs : spacing.md,
          backgroundColor: theme.cardStrong,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.homeOutfitCopy}>
        <Text style={[styles.homeOutfitLabel, { color: theme.clear }]}>오늘 입기 좋은 코디</Text>
        <Text style={[styles.homeOutfitTitle, { color: theme.text }]} numberOfLines={layout.homeCompact ? 1 : 2}>
          {title}
        </Text>
        {tightLayout ? null : (
          <Text style={[styles.homeOutfitBody, { color: theme.muted }]} numberOfLines={1}>
            {compactCopy.body}
          </Text>
        )}
      </View>
      <View
        style={[
          styles.homeOutfitImageFrame,
          {
            width: tightLayout ? 44 : layout.homeCompact ? 54 : 62,
            height: tightLayout ? 44 : layout.homeCompact ? 54 : 62,
            backgroundColor: theme.cardMuted,
          },
        ]}
      >
        {imageSource ? (
          <Image
            source={imageSource}
            style={[
              styles.homeOutfitImage,
              {
                width: tightLayout ? 40 : layout.homeCompact ? 48 : 56,
                height: tightLayout ? 40 : layout.homeCompact ? 48 : 56,
              },
            ]}
            resizeMode="contain"
          />
        ) : (
          <Image source={uiIconAssets.shirt} style={[styles.homeOutfitIcon, { tintColor: theme.clear }]} resizeMode="contain" />
        )}
      </View>
    </FeedbackPressable>
  );
}

function getHomeOutfitCopy(decisionText: string, fallback: string) {
  if (decisionText.includes("비가 세요")) return { title: "비가 세요 · 방수 차림", body: "우산도 함께 챙겨요" };
  if (decisionText.includes("비 소식")) return { title: "비 소식 있어요.\n우산과 방수 신발 챙겨요", body: "방수 신발이면 더 좋아요" };
  if (decisionText.includes("더운 날")) return { title: "더운 날이에요 · 가볍게", body: "바람 잘 통하는 차림이 좋아요" };
  if (decisionText.includes("쌀쌀해요")) return { title: "쌀쌀해요 · 한 겹 더", body: "따뜻한 겉옷을 챙겨요" };
  if (decisionText.includes("기온차")) return { title: "일교차 커요 · 겹옷", body: "아침저녁에 걸칠 옷이 좋아요" };
  return { title: fallback === "가볍게" ? "오늘은 가볍게 나가요" : fallback, body: "편한 차림이면 충분해요" };
}

function getHomeOutfitTitle(copy: string) {
  return copy.replace(/\s+/gu, " ").trim();
}

function SpecialWeatherAlertCard({
  alert,
  theme,
  onPress,
}: {
  alert: P0ScreenProps["state"]["officialSpecialAlert"];
  theme: AppTheme;
  onPress: () => void;
}) {
  const layout = useResponsiveLayout();
  const tightLayout = isHomeTightLayout(layout);
  const isHeavyRain = alert.type === "heavy-rain";
  const accent = isHeavyRain ? theme.skyLite : theme.warm;
  const copy = getHomeSpecialAlertCopy(alert);
  return (
    <FeedbackPressable
      accessibilityLabel={`${copy.title}. ${copy.body}. 특보 기준 상세 보기`}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.specialAlertCard,
        {
          minHeight: layout.homeSpecialAlertMinHeight,
          paddingHorizontal: layout.homeSpecialAlertPaddingHorizontal,
          paddingVertical: layout.homeSpecialAlertPaddingVertical,
          backgroundColor: `${accent}16`,
          borderColor: `${accent}70`,
        },
      ]}
    >
      <View
        style={[
          styles.specialAlertIconFrame,
          {
            width: layout.homeSpecialAlertIconSize,
            height: layout.homeSpecialAlertIconSize,
            backgroundColor: accent,
          },
        ]}
        accessibilityElementsHidden
      >
        <Text
          style={[
            styles.specialAlertWarningMark,
            {
              color: theme.onAccent,
              fontSize: Math.max(15, Math.round(layout.homeSpecialAlertIconSize * 0.72)),
              lineHeight: layout.homeSpecialAlertIconSize,
            },
          ]}
        >
          !
        </Text>
      </View>
      <View style={styles.specialAlertCopy}>
        {tightLayout ? null : <Text style={[styles.specialAlertLabel, { color: accent }]}>날씨 주의</Text>}
        <Text
          style={[
            styles.specialAlertTitle,
            {
              color: theme.text,
              fontSize: layout.homeSpecialAlertTitleFontSize,
              lineHeight: layout.homeSpecialAlertTitleLineHeight,
            },
          ]}
          numberOfLines={1}
        >
          {copy.title}
        </Text>
        <Text
          style={[
            styles.specialAlertBody,
            {
              color: theme.muted,
              fontSize: layout.homeSpecialAlertBodyFontSize,
              lineHeight: layout.homeSpecialAlertBodyLineHeight,
            },
          ]}
          numberOfLines={1}
        >
          {copy.body}
        </Text>
      </View>
      <Text style={[styles.specialAlertChevron, { color: accent }]}>›</Text>
    </FeedbackPressable>
  );
}

function getHomeSpecialAlertCopy(alert: P0ScreenProps["state"]["officialSpecialAlert"]) {
  const isWarning = alert.level === "warning" || alert.title?.includes("경보") === true;
  const reason = alert.reason ?? "";
  const tempMatch = reason.match(/(\d+)℃/u)?.[1];
  const rainWindowMatch = reason.match(/((?:3|12)시간\s+\d+mm)/u)?.[1];

  if (alert.type === "heatwave") {
    return {
      title: isWarning ? "오늘은 더위 조심해요" : "한낮엔 잠깐 쉬어가요",
      body: tempMatch ? `최고 ${tempMatch}℃ · 물·그늘·실내 휴식` : "물·그늘·실내 휴식",
    };
  }

  if (alert.type === "heavy-rain") {
    return {
      title: isWarning ? "비가 많이 와요, 천천히 가요" : "비가 꽤 올 수 있어요",
      body: rainWindowMatch ? `${rainWindowMatch} · 배수·교통 확인` : "이동 전 배수·교통 확인",
    };
  }

  return {
    title: (alert.title ?? "기상청 특보가 있어요").replace(/\s+/gu, " ").trim(),
    body: reason.replace(/\s+/gu, " ").trim() || "기상청 발표 내용을 확인해요",
  };
}

function getHomeOutfitPreviewImage(outfit: P0ScreenProps["state"]["outfit"]) {
  const previewItem = Object.values(outfit.items).find((item) => getOutfitImageSource(item?.imageUrl));
  const previewSource = getOutfitImageSource(previewItem?.imageUrl);
  if (previewSource) return previewSource;
  return outfitImageAssets[HOME_OUTFIT_FALLBACK_IMAGE];
}

function NotificationBellButton({
  unreadCount,
  smartCareEnabled,
  onPress,
  theme,
}: {
  unreadCount: number;
  smartCareEnabled: boolean;
  onPress: () => void;
  theme: AppTheme;
}) {
  const label = smartCareEnabled ? `알림 열기, 읽지 않음 ${unreadCount}개` : "알림 열기, 스마트 케어 꺼짐";
  const glassSurface = iosGlassSurface(theme, "control", { nativeBackdrop: true });
  return (
    <FeedbackPressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.bellButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }, glassSurface]}
    >
      {glassSurface ? <IosGlassBackdrop theme={theme} role="control" style={styles.bellGlassBackdrop} /> : null}
      <BellGlyph color={theme.text} />
      {unreadCount > 0 ? (
        <View style={[styles.bellBadge, { backgroundColor: theme.sky }]}>
          <Text style={[styles.bellBadgeText, { color: theme.onAccent }]}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
        </View>
      ) : null}
    </FeedbackPressable>
  );
}

function NotificationSidebar({
  visible,
  notifications,
  readNotificationIds,
  notificationHistory,
  fallbackTimestamp,
  smartCareEnabled,
  permissionReady,
  onClose,
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
  onOpenSettings,
  onOpenCenter,
  onOpen,
  theme,
}: {
  visible: boolean;
  notifications: P0ScreenProps["state"]["notifications"];
  readNotificationIds: string[];
  notificationHistory: P0ScreenProps["notificationHistory"];
  fallbackTimestamp: string;
  smartCareEnabled: boolean;
  permissionReady: boolean;
  onClose: () => void;
  onMarkAllNotificationsRead: () => void;
  onMarkNotificationRead: (id: string) => void;
  onOpenSettings: () => void;
  onOpenCenter: () => void;
  onOpen: (id: string, route: P0RouteId) => void;
  theme: AppTheme;
}) {
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();
  const [mounted, setMounted] = useState(visible);
  const [bulkDismissing, setBulkDismissing] = useState(false);
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const dragX = useRef(new Animated.Value(0)).current;
  const touchCloseRef = useRef({ active: false, x: 0, y: 0 });

  useEffect(() => {
    if (visible) {
      setMounted(true);
      dragX.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
      return;
    }
    Animated.timing(progress, {
      toValue: 0,
      duration: 230,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [progress, visible]);

  if (!mounted) return null;

  const effectiveReadNotificationIds = permissionReady ? readNotificationIds : notifications.map((item) => item.id);
  const unreadCount = notifications.filter((item) => !effectiveReadNotificationIds.includes(item.id)).length;
  const hasUnread = unreadCount > 0;
  const previewOnly = !permissionReady;
  const visibleNotifications = previewOnly
    ? notifications.slice(0, 6)
    : notifications.filter((item) => !effectiveReadNotificationIds.includes(item.id)).slice(0, 6);
  const groups = buildSidebarGroups(visibleNotifications, effectiveReadNotificationIds, previewOnly);
  const recentHistory = notificationHistory.slice(0, 3);
  const panelBaseTranslateX = progress.interpolate({ inputRange: [0, 1], outputRange: [420, 0] });
  const panelTranslateX = Animated.add(panelBaseTranslateX, dragX);

  const animateSidebarBack = () => {
    Animated.spring(dragX, {
      toValue: 0,
      damping: 18,
      stiffness: 180,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const closeBySwipe = () => {
    Animated.timing(dragX, {
      toValue: 420,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  const panelPanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => gesture.dx > 14 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
    onMoveShouldSetPanResponderCapture: (_, gesture) => gesture.dx > 14 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
    onPanResponderTerminationRequest: () => false,
    onPanResponderMove: (_, gesture) => {
      dragX.setValue(Math.max(0, gesture.dx));
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 82 || gesture.vx > 0.55) {
        closeBySwipe();
        return;
      }
      animateSidebarBack();
    },
    onPanResponderTerminate: animateSidebarBack,
  });

  const handlePanelTouchStart = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    touchCloseRef.current = { active: false, x: pageX, y: pageY };
  };

  const handlePanelTouchMove = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    const dx = pageX - touchCloseRef.current.x;
    const dy = pageY - touchCloseRef.current.y;
    if (!touchCloseRef.current.active && dx > 14 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      touchCloseRef.current.active = true;
    }
    if (touchCloseRef.current.active) {
      dragX.setValue(Math.max(0, dx));
    }
  };

  const handlePanelTouchEnd = (event: GestureResponderEvent) => {
    if (!touchCloseRef.current.active) return;
    const dx = event.nativeEvent.pageX - touchCloseRef.current.x;
    touchCloseRef.current.active = false;
    if (dx > 82) {
      closeBySwipe();
      return;
    }
    animateSidebarBack();
  };

  const handleMarkAllRead = () => {
    if (!hasUnread || bulkDismissing) return;
    setBulkDismissing(true);
    setTimeout(() => {
      onMarkAllNotificationsRead();
      setBulkDismissing(false);
    }, 260);
  };

  return (
    <Modal animationType="none" transparent visible={mounted} onRequestClose={onClose}>
      <View style={styles.sidebarLayer}>
        <Animated.View
          style={[styles.sidebarScrim, { backgroundColor: semanticColor(theme, "scrim"), opacity: progress }]}
        >
          <Pressable
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            onPress={onClose}
            style={styles.sidebarScrimTouchable}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.sidebarPanel,
            {
              maxWidth: layout.homeSidebarMaxWidth,
              paddingHorizontal: layout.weatherPanelPadding,
              backgroundColor: theme.cardStrong,
              borderColor: theme.border,
              shadowColor: theme.shadow,
              marginTop: insets.top,
              paddingTop: spacing.xl,
              paddingBottom: Math.max(insets.bottom, spacing.xl),
            },
            { transform: [{ translateX: panelTranslateX }] },
          ]}
          renderToHardwareTextureAndroid
          collapsable={false}
          onTouchStart={handlePanelTouchStart}
          onTouchMove={handlePanelTouchMove}
          onTouchEnd={handlePanelTouchEnd}
          onTouchCancel={animateSidebarBack}
          {...panelPanResponder.panHandlers}
        >
          <View style={styles.sidebarHeader}>
            <View style={styles.sidebarTitleGroup}>
              <Text style={[styles.sidebarKicker, { color: hasUnread ? getInfoAccent(theme) : theme.clear }]}>
                {smartCareEnabled ? "스마트 알림" : "알림 꺼짐"}
              </Text>
              <Text style={[styles.sidebarTitle, { color: theme.text }]}>알림</Text>
              <Text style={[styles.sidebarMeta, { color: theme.subtle }]}>
                {previewOnly ? "권한 켜기 전 예시" : `${notifications.length}개 활성 · 읽지 않음 ${unreadCount}개`}
              </Text>
            </View>
          </View>

          {!permissionReady ? (
            <View style={[styles.sidebarPermissionCard, { backgroundColor: theme.card, borderColor: theme.warm }]}>
              <View style={styles.sidebarPermissionCopy}>
                <Text style={[styles.sidebarPermissionTitle, { color: theme.warm }]}>푸시 알림 대기</Text>
                <Text style={[styles.sidebarPermissionBody, { color: theme.muted }]}>홈·출발 판단은 유지됨 · 권한을 켜면 조건 알림 발송</Text>
              </View>
            </View>
          ) : null}

          <Pressable
            accessibilityLabel="모든 알림 읽음 처리"
            accessibilityRole="button"
            accessibilityState={{ disabled: !hasUnread }}
            disabled={!hasUnread}
            onPress={handleMarkAllRead}
            style={[styles.markAllButton, { backgroundColor: theme.cardMuted, borderColor: hasUnread ? getInfoAccent(theme) : theme.border, opacity: hasUnread ? 1 : 0.54 }]}
          >
            <Text style={[styles.markAllText, { color: hasUnread ? getInfoAccent(theme) : theme.subtle }]}>전체 읽음</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="알림 센터 열기"
            accessibilityRole="button"
            onPress={onOpenCenter}
            style={[styles.sidebarCenterButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <Text style={[styles.sidebarCenterText, { color: theme.text }]}>알림 센터</Text>
            <Text style={[styles.sidebarCenterMeta, { color: theme.subtle }]}>이력·도착 화면 확인</Text>
          </Pressable>

          <ScrollView style={styles.sidebarScroll} contentContainerStyle={styles.sidebarList} showsVerticalScrollIndicator={false}>
            {groups.map((group, groupIndex) => (
              <SidebarNotificationGroup
                key={group.title}
                group={group}
                readNotificationIds={effectiveReadNotificationIds}
                notificationHistory={notificationHistory}
                fallbackTimestamp={fallbackTimestamp}
                smartCareEnabled={smartCareEnabled}
                previewOnly={previewOnly}
                onOpen={onOpen}
                onDismiss={onMarkNotificationRead}
                bulkDismissing={bulkDismissing}
                dismissBaseDelay={groupIndex * 84}
                theme={theme}
              />
            ))}
            <View style={[styles.sidebarHistoryBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View>
                <Text style={[styles.sidebarGroupTitle, { color: theme.text }]}>최근 완료</Text>
                <Text style={[styles.sidebarGroupMeta, { color: theme.subtle }]}>
                  {recentHistory.length > 0 ? `${recentHistory.length}건 완료` : "아직 완료된 알림 없음"}
                </Text>
              </View>
              {recentHistory.length > 0 ? recentHistory.map((item) => <SidebarHistoryRow key={item.id} item={item} theme={theme} />) : null}
            </View>
            {visibleNotifications.length === 0 ? (
              <View style={[styles.sidebarEmpty, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.sidebarEmptyTitle, { color: theme.text }]}>{notifications.length === 0 ? "활성 알림 없음" : "새 알림 없음"}</Text>
                <Text style={[styles.sidebarEmptyBody, { color: theme.muted }]}>
                  {notifications.length === 0 ? "조건을 켜면 여기에서 바로 확인 가능" : "읽음 처리한 알림은 알림 센터 이력에 남음"}
                </Text>
              </View>
            ) : null}
          </ScrollView>

          <Pressable
            accessibilityLabel="알림 설정으로 이동"
            accessibilityRole="button"
            onPress={onOpenSettings}
            style={[styles.sidebarSettingsButton, { backgroundColor: theme.gold, borderColor: theme.gold }]}
          >
            <Text style={[styles.sidebarSettingsText, { color: theme.onAccent }]}>알림 설정으로 이동</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

type SidebarGroup = {
  title: "주의 필요" | "오늘 예정";
  meta: string;
  items: P0ScreenProps["state"]["notifications"];
};

function buildSidebarGroups(notifications: P0ScreenProps["state"]["notifications"], readNotificationIds: string[], previewOnly = false): SidebarGroup[] {
  if (previewOnly) {
    return [{ title: "오늘 예정", meta: "권한 켜기 전 예시 알림", items: notifications.slice(0, 3) }];
  }
  const warningItems = notifications.filter((item, index) => {
    const route = item.deepLink as P0RouteId;
    return !readNotificationIds.includes(item.id) || route === "H5" || index === 0;
  });
  const warningIds = new Set(warningItems.map((item) => item.id));
  const todayItems = notifications.filter((item) => !warningIds.has(item.id));
  return [
    { title: "오늘 예정", meta: "오늘 기준으로 준비할 알림", items: todayItems },
    { title: "주의 필요", meta: "읽지 않은 강수·출발 알림", items: warningItems },
  ];
}

function SidebarNotificationGroup({
  group,
  readNotificationIds,
  notificationHistory,
  fallbackTimestamp,
  smartCareEnabled,
  onOpen,
  onDismiss,
  bulkDismissing,
  dismissBaseDelay,
  theme,
  previewOnly = false,
}: {
  group: SidebarGroup;
  readNotificationIds: string[];
  notificationHistory: P0ScreenProps["notificationHistory"];
  fallbackTimestamp: string;
  smartCareEnabled: boolean;
  onOpen: (id: string, route: P0RouteId) => void;
  onDismiss: (id: string) => void;
  bulkDismissing: boolean;
  dismissBaseDelay: number;
  theme: AppTheme;
  previewOnly?: boolean;
}) {
  return (
    <View style={styles.sidebarGroup}>
      <View>
        <Text style={[styles.sidebarGroupTitle, { color: theme.text }]}>{group.title}</Text>
        <Text style={[styles.sidebarGroupMeta, { color: theme.subtle }]}>{group.items.length > 0 ? group.meta : "해당 알림 없음"}</Text>
      </View>
      {group.items.map((item, index) => {
        const route = item.deepLink as P0RouteId;
        const read = previewOnly || readNotificationIds.includes(item.id);
        const color = getNotificationTone(theme, index, route);
        const receivedAt = notificationHistory.find((history) => history.notificationId === item.id && history.action === "received")?.occurredAt;
        const timestamp = receivedAt ?? item.scheduledAt ?? fallbackTimestamp;
        const timestampLabel = receivedAt ? "푸시됨" : item.scheduledAt ? "예약됨" : "조건 감지";
        return (
          <SidebarNotificationItem
            key={item.id}
            item={item}
            route={route}
            read={read}
            color={color}
            previewOnly={previewOnly}
            smartCareEnabled={smartCareEnabled}
            timestamp={timestamp}
            timestampLabel={timestampLabel}
            bulkDismissing={bulkDismissing}
            dismissDelay={dismissBaseDelay + index * 34}
            onOpen={() => onOpen(item.id, route)}
            onDismiss={() => onDismiss(item.id)}
            theme={theme}
          />
        );
      })}
    </View>
  );
}

function SidebarNotificationItem({
  item,
  route,
  read,
  color,
  previewOnly,
  smartCareEnabled,
  timestamp,
  timestampLabel,
  bulkDismissing,
  dismissDelay,
  onOpen,
  onDismiss,
  theme,
}: {
  item: P0ScreenProps["state"]["notifications"][number];
  route: P0RouteId;
  read: boolean;
  color: string;
  previewOnly: boolean;
  smartCareEnabled: boolean;
  timestamp?: string;
  timestampLabel: string;
  bulkDismissing: boolean;
  dismissDelay: number;
  onOpen: () => void;
  onDismiss: () => void;
  theme: AppTheme;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const dismissedRef = useRef(false);

  const animateDismiss = (commit = true) => {
    if (previewOnly || dismissedRef.current) return;
    dismissedRef.current = true;
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -360,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && commit) onDismiss();
    });
  };

  useEffect(() => {
    if (!bulkDismissing || previewOnly) return;
    const timeout = setTimeout(() => animateDismiss(false), dismissDelay);
    return () => clearTimeout(timeout);
  }, [bulkDismissing, dismissDelay, previewOnly]);

  const itemPanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => !previewOnly && gesture.dx < -12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25,
    onMoveShouldSetPanResponderCapture: (_, gesture) => !previewOnly && gesture.dx < -12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25,
    onPanResponderMove: (_, gesture) => {
      const dx = Math.min(0, gesture.dx);
      translateX.setValue(dx);
      opacity.setValue(Math.max(0.7, 1 + dx / 380));
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx < -68 || gesture.vx < -0.55) {
        animateDismiss();
        return;
      }
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          damping: 18,
          stiffness: 190,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    },
  });

  return (
    <View style={styles.sidebarSwipeShell}>
      <View style={[styles.sidebarDeleteBackground, { backgroundColor: theme.warm }]}>
        <Text style={[styles.sidebarDeleteText, { color: theme.background }]}>삭제</Text>
      </View>
      <Animated.View style={{ opacity, transform: [{ translateX }] }} {...itemPanResponder.panHandlers}>
        <Pressable
          accessibilityLabel={`${item.title}, ${timestampLabel} ${formatSidebarNotificationDateTime(timestamp)}, 열기`}
          accessibilityRole="button"
          onPress={onOpen}
          style={[styles.sidebarItem, { backgroundColor: theme.card, borderColor: read ? theme.border : color }]}
        >
          <View style={styles.sidebarItemMain}>
            <View style={[styles.sidebarItemDot, { backgroundColor: read ? theme.border : color }]} />
            <View style={styles.sidebarItemCopy}>
              <Text style={[styles.sidebarItemTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.sidebarItemTimestamp, { color: theme.subtle }]}>{timestampLabel} · {formatSidebarNotificationDateTime(timestamp)}</Text>
              <Text style={[styles.sidebarItemBody, { color: theme.muted }]}>{previewOnly ? "권한을 켜면 실제 푸시로 받음" : smartCareEnabled ? item.reason : "스마트 알림 꺼짐"}</Text>
              <Text style={[styles.sidebarItemTarget, { color }]}>{getNotificationTargetLabel(route)}</Text>
            </View>
          </View>
          <Text style={[styles.sidebarOpenHint, { color: read ? theme.subtle : theme.text }]}>
            {previewOnly ? "예시" : read ? "확인됨" : "눌러서 확인"}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function SidebarHistoryRow({ item, theme }: { item: P0ScreenProps["notificationHistory"][number]; theme: AppTheme }) {
  const label = item.action === "open" ? "열림" : item.action === "sent" ? "발송" : item.action === "received" ? "수신" : "읽음";
  return (
    <View style={styles.sidebarHistoryRow}>
      <View style={[styles.sidebarItemDot, { backgroundColor: theme.clear }]} />
      <View style={styles.sidebarItemCopy}>
        <Text style={[styles.sidebarHistoryTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.sidebarHistoryMeta, { color: theme.subtle }]}>{label} · {item.statusLabel}{item.occurredAt ? ` · ${formatSidebarNotificationDateTime(item.occurredAt)}` : ""}</Text>
      </View>
    </View>
  );
}

function BellGlyph({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.bellDome, { borderColor: color }]} />
      <View style={[styles.bellRim, { backgroundColor: color }]} />
      <View style={[styles.bellClapper, { backgroundColor: color }]} />
    </View>
  );
}

function getNotificationTargetLabel(route: P0RouteId): string {
  if (route === "H4") return "오늘 준비";
  if (route === "H5") return "강수 타임라인";
  if (route === "H7") return "내일 브리핑";
  if (route === "G2") return "목적지 케어";
  if (route === "M2") return "알림 설정";
  return "홈";
}

function getNotificationTone(theme: AppTheme, index: number, route: P0RouteId): string {
  if (route === "H5" || index === 1) return getInfoAccent(theme);
  if (route === "G2" || route === "H4" || index === 2) return theme.clear;
  if (index === 0) return getInfoAccent(theme);
  return theme.warm;
}

function formatSidebarNotificationDateTime(value?: string) {
  const timestamp = value ? Date.parse(value) : Number.NaN;
  if (!Number.isFinite(timestamp)) return "시각 확인 중";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(timestamp));
}

function HomeValueTransition({ value, children }: { value: string; children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    progress.stopAnimation();
    if (reducedMotion !== false) { progress.setValue(1); return; }
    progress.setValue(0);
    const animation = Animated.timing(progress, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [value, reducedMotion, progress]);

  return <Animated.View style={{ opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }), transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [3, 0] }) }] }}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  iosLocationHeader: { flex: 1, gap: 2 },
  iosLocationName: { fontSize: 20, lineHeight: 26, fontWeight: "700" },
  iosSecondaryText: { fontSize: 12, lineHeight: 17 },
  iosWeatherHero: { gap: 8, paddingHorizontal: 8 },
  iosWeatherMain: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 100 },
  iosWeatherCopy: { flex: 1, gap: 2 },
  iosTemperature: { fontWeight: "300", letterSpacing: -2, fontVariant: ["tabular-nums"] },
  iosCondition: { fontSize: 16, lineHeight: 22, fontWeight: "500" },
  iosWeatherIcon: { marginHorizontal: 12 },
  iosCompanion: { fontSize: 15, lineHeight: 22, fontWeight: "500" },
  iosDeparture: { minHeight: 100, paddingVertical: 10, gap: 4, borderTopWidth: StyleSheet.hairlineWidth },
  iosDepartureCompact: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  iosCompactDepartureTime: { maxWidth: "48%", fontSize: 27, lineHeight: 33, fontWeight: "600", fontVariant: ["tabular-nums"] },
  iosDepartureHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  iosDepartureTime: { fontSize: 32, lineHeight: 38, fontWeight: "600", fontVariant: ["tabular-nums"] },
  iosSupportingAction: { flex: 1, minWidth: 0, minHeight: 56, justifyContent: "center", padding: 8, gap: 4, borderRadius: 14 },
  iosSupportingValue: { flexDirection: "row", alignItems: "center", gap: 6 },
  iosSupportingTitle: { flexShrink: 1, fontSize: 15, lineHeight: 20, fontWeight: "600" },
  screenWrap: {
    flex: 1,
  },
  homeScroll: {
    flex: 1,
  },
  homeContent: {
    // BottomNav는 스크롤 영역 밖 형제라 큰 하단 보정 없이도 마지막 카드가 가려지지 않는다.
    flexGrow: 1,
    paddingBottom: 0,
    width: "100%",
    alignSelf: "center",
  },
  topBar: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  decisionStack: {
    gap: spacing.xs,
    paddingTop: 0,
  },
  homePlanCard: {
    gap: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  destinationSelectorCard: {
    gap: spacing.xs,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  destinationSelectorHeader: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  destinationSelectorIconFrame: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  destinationSelectorIcon: {
    width: 18,
    height: 18,
  },
  destinationSelectorCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  destinationSelectorLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  destinationSelectorMeta: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },
  destinationSelectorAddButton: {
    minWidth: 48,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  destinationSelectorAddText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  destinationChipRow: {
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  destinationChip: {
    width: 118,
    minHeight: 48,
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  destinationAddBackdrop: {
    borderRadius: radius.md,
  },
  destinationChipBackdrop: {
    borderRadius: radius.md,
  },
  destinationChipTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  destinationChipDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
  },
  destinationChipTitle: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  destinationChipMeta: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
  },
  destinationEmptySelector: {
    minHeight: 58,
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  destinationEmptyTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  destinationEmptyBody: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },
  visualDecisionGrid: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  homeOutfitCard: {
    minHeight: 106,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  specialAlertCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  specialAlertIconFrame: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  specialAlertWarningMark: {
    fontSize: 21,
    lineHeight: 24,
    fontWeight: "900",
  },
  specialAlertCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  specialAlertLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  specialAlertTitle: {
    fontWeight: "900",
  },
  specialAlertBody: {
    fontWeight: "700",
  },
  specialAlertChevron: {
    fontSize: 26,
    lineHeight: 28,
    fontWeight: "500",
  },
  homeOutfitCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  homeOutfitLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  homeOutfitTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  homeOutfitBody: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },
  homeOutfitImageFrame: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
  },
  homeOutfitImage: {
    width: 56,
    height: 56,
  },
  homeOutfitIcon: {
    width: 34,
    height: 34,
  },
  cardStack: {
    gap: spacing.md,
    paddingTop: 4,
  },
  bellButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    overflow: "hidden",
  },
  bellGlassBackdrop: {
    borderRadius: radius.pill,
  },
  bellBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    minWidth: 17,
    height: 17,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderRadius: radius.pill,
  },
  bellBadgeText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
  },
  sidebarLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 40,
    elevation: 40,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  sidebarScrim: {
    ...StyleSheet.absoluteFill,
  },
  sidebarScrimTouchable: {
    ...StyleSheet.absoluteFill,
  },
  sidebarPanel: {
    width: "86%",
    alignSelf: "stretch",
    gap: spacing.sm,
    paddingBottom: spacing.xl,
    borderLeftWidth: 1,
    borderTopLeftRadius: radius.xl,
    shadowOffset: { width: -10, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sidebarTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  sidebarKicker: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  sidebarTitle: {
    marginTop: 2,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
  },
  sidebarMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  sidebarPermissionCard: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  sidebarPermissionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  sidebarPermissionTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  sidebarPermissionBody: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  markAllButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  markAllText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  sidebarCenterButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  sidebarCenterText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  sidebarCenterMeta: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarList: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  sidebarGroup: {
    gap: spacing.xs,
  },
  sidebarGroupTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  sidebarGroupMeta: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  sidebarItem: {
    minHeight: 92,
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  sidebarSwipeShell: {
    position: "relative",
    overflow: "hidden",
    borderRadius: radius.md,
  },
  sidebarDeleteBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 82,
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarDeleteText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  sidebarItemMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  sidebarItemDot: {
    width: 8,
    height: 8,
    marginTop: 5,
    borderRadius: radius.pill,
  },
  sidebarItemCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  sidebarItemTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  sidebarItemBody: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  sidebarItemTimestamp: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
  },
  sidebarItemTarget: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  sidebarOpenHint: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  sidebarHistoryBox: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  sidebarHistoryRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sidebarHistoryTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  sidebarHistoryMeta: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
  },
  sidebarSettingsButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  sidebarSettingsText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  sidebarEmpty: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  sidebarEmptyTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  sidebarEmptyBody: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  iconFrame: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  bellDome: {
    width: 15,
    height: 12,
    borderWidth: 1.8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1.8,
  },
  bellRim: {
    width: 19,
    height: 2,
    marginTop: 1,
    borderRadius: 1,
  },
  bellClapper: {
    width: 3,
    height: 3,
    marginTop: 1.5,
    borderRadius: 1.5,
  },
});
