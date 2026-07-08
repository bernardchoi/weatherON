import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";
import { outfitImageAssets, uiIconAssets } from "../assets";
import { WeatherStatusPanel } from "../components/WeatherStatusPanel";
import type { P0RouteId } from "../navigation/routes";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing, type AppTheme } from "../theme/tokens";
import { getDisplayLocationName } from "../utils/locationDisplay";
import { getOutfitVariantLabel } from "../utils/outfitLabels";
import { formatTemperature, formatTemperatureDelta } from "../utils/units";

// 2026-07-08 출시 로드맵: 코디가 출시 범위에 포함되어 홈 코디 카드 노출.
const HOME_OUTFIT_CARD_VISIBLE = true;
const HOME_OUTFIT_FALLBACK_IMAGE = "assets/outfits/weatheron-outfit-light-rain-jacket-v1.png";

export function HomeScreen({
  state,
  savedDestinations,
  selectedDestinationPlace,
  readNotificationIds,
  notificationHistory,
  smartCareEnabled,
  isWeatherLoading,
  permissionReady,
  locationReady,
  weatherLocationMode,
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
  const [notificationSidebarOpen, setNotificationSidebarOpen] = useState(false);
  const activeNotifications = state.notifications.filter((item) => item.active);
  const unreadNotificationCount = permissionReady
    ? activeNotifications.filter((item) => !readNotificationIds.includes(item.id)).length
    : 0;
  const destinationReady = state.hasDestination && state.destinationCare.name !== "목적지 미등록";
  const homeDecision = buildHomeDecision(state.destinationCare, destinationReady, temperatureUnit);
  const currentWeather = state.destinationCare.originWeather;
  const todayMinMax = getTodayMinMax(currentWeather);
  const currentLocationName = getDisplayLocationName(currentWeather.locationName);
  const current = currentWeather.current;
  const locationStatus = getHomeLocationStatus(locationReady, weatherLocationMode);
  const selectedDestination = savedDestinations.find((destination) => destination.place.id === selectedDestinationPlace.id) ?? savedDestinations[0] ?? null;
  const destinationSelectorLabel = selectedDestination ? getDestinationSelectorMeta(selectedDestination.place) : "목적지 추가 필요";

  return (
    <View style={[styles.screenWrap, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.homeScroll} contentContainerStyle={styles.homeContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.homeAtmosphere, { backgroundColor: theme.backgroundAlt }]} />
        <View style={[styles.homeGlow, { backgroundColor: `${theme.gold}24` }]} />

        <View style={styles.topBar}>
          <View style={[styles.modePill, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <View style={[styles.modeDot, { backgroundColor: smartCareEnabled ? theme.clear : theme.gold }]} />
            <Text style={[styles.modeText, { color: theme.muted }]} numberOfLines={1}>
              {smartCareEnabled ? "ON · 개인화" : "게스트 · 저장 제한"}
            </Text>
          </View>
          <NotificationBellButton
            unreadCount={unreadNotificationCount}
            smartCareEnabled={smartCareEnabled}
            theme={theme}
            onPress={() => setNotificationSidebarOpen(true)}
          />
        </View>

        <View style={styles.decisionStack}>
          <HomeDecisionHero
            current={current}
            currentLocationName={currentLocationName}
            todayMinMax={todayMinMax}
            locationStatus={locationStatus}
            temperatureUnit={temperatureUnit}
            theme={theme}
            onOpenForecast={() => onNavigate("H6")}
          />
          {HOME_OUTFIT_CARD_VISIBLE ? (
            <HomeOutfitPreviewCard
              outfit={state.outfit}
              packTitle={homeDecision.packTitle}
              theme={theme}
              onPress={() => onNavigate("C1")}
            />
          ) : null}
        </View>

        <View style={styles.destinationSection}>
          <DestinationSelectorCard
            selectedDestinationName={selectedDestination?.place.name ?? "목적지 없음"}
            selectedDestinationMeta={destinationSelectorLabel}
            savedDestinations={savedDestinations}
            selectedDestinationId={selectedDestination?.place.id}
            theme={theme}
            onSelect={(place) => onSelectDestinationPlace(place)}
            onAdd={() => onNavigate("P1")}
          />
          <View style={styles.visualDecisionGrid}>
            <VisualDecisionCard
              label="나갈 시간"
              value={homeDecision.departureTime}
              helper={destinationReady ? "도착 시간 기준" : "목적지 추가"}
              accent={theme.gold}
              icon={uiIconAssets.depart}
              theme={theme}
              onPress={() => onNavigate(destinationReady ? "G2" : "P1")}
            />
            <VisualDecisionCard
              label="비 완화"
              value={homeDecision.rainCompactTitle}
              helper={homeDecision.rainCompactBody}
              accent={getInfoAccent(theme)}
              icon={uiIconAssets.rain}
              theme={theme}
              onPress={() => onNavigate(destinationReady ? "H5" : "P1")}
            />
            <VisualDecisionCard
              label="챙길 것"
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
        </View>

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
  if (locationReady && weatherLocationMode === "auto") return { value: "현재 위치", tone: "clear" };
  if (weatherLocationMode === "manual") return { value: "수동", tone: "sky" };
  return { value: "확인 필요", tone: "warm" };
}

function DestinationSelectorCard({
  selectedDestinationName,
  selectedDestinationMeta,
  savedDestinations,
  selectedDestinationId,
  theme,
  onSelect,
  onAdd,
}: {
  selectedDestinationName: string;
  selectedDestinationMeta: string;
  savedDestinations: P0ScreenProps["savedDestinations"];
  selectedDestinationId?: string;
  theme: AppTheme;
  onSelect: (place: P0ScreenProps["selectedDestinationPlace"]) => void;
  onAdd: () => void;
}) {
  const hasDestinations = savedDestinations.length > 0;
  const alternateDestinations = selectedDestinationId
    ? savedDestinations.filter((destination) => destination.place.id !== selectedDestinationId)
    : savedDestinations;
  return (
    <View style={[styles.destinationSelectorCard, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow(theme)]}>
      <View style={styles.destinationSelectorHeader}>
        <View style={[styles.destinationSelectorIconFrame, { backgroundColor: `${theme.gold}14` }]}>
          <Image source={uiIconAssets.pin} style={[styles.destinationSelectorIcon, { tintColor: theme.gold }]} resizeMode="contain" />
        </View>
        <View style={styles.destinationSelectorCopy}>
          <Text style={[styles.destinationSelectorLabel, { color: theme.gold }]}>목적지</Text>
          <Text style={[styles.destinationSelectorTitle, { color: theme.text }]} numberOfLines={1}>{selectedDestinationName}</Text>
          <Text style={[styles.destinationSelectorMeta, { color: theme.subtle }]} numberOfLines={1}>{selectedDestinationMeta}</Text>
        </View>
        <Pressable
          accessibilityLabel="목적지 추가"
          accessibilityRole="button"
          onPress={onAdd}
          style={[styles.destinationSelectorAddButton, { backgroundColor: "transparent", borderColor: theme.border }]}
        >
          <Text style={[styles.destinationSelectorAddText, { color: theme.gold }]}>추가</Text>
        </Pressable>
      </View>

      {!hasDestinations ? (
        <Pressable
          accessibilityLabel="목적지 추가하기"
          accessibilityRole="button"
          onPress={onAdd}
          style={[styles.destinationEmptySelector, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
        >
          <Text style={[styles.destinationEmptyTitle, { color: theme.text }]}>첫 목적지 추가</Text>
          <Text style={[styles.destinationEmptyBody, { color: theme.subtle }]}>저장 후 하단 카드가 목적지 기준으로 바뀜</Text>
        </Pressable>
      ) : alternateDestinations.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destinationChipRow}>
          {alternateDestinations.map((destination) => {
            return (
              <Pressable
                key={destination.place.id}
                accessibilityLabel={`${destination.place.name} 목적지로 변경`}
                accessibilityRole="button"
                onPress={() => onSelect(destination.place)}
                style={[
                  styles.destinationChip,
                  {
                    backgroundColor: theme.cardStrong,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={styles.destinationChipTitleRow}>
                  <Text style={[styles.destinationChipTitle, { color: theme.text }]} numberOfLines={1}>{destination.place.name}</Text>
                </View>
                <Text style={[styles.destinationChipMeta, { color: theme.subtle }]} numberOfLines={1}>{getDestinationSelectorMeta(destination.place)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
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
    : "확인 전";
  const routeStatusLabel = getRouteStatusLabel(care.departureAdvice?.travelStatus);
  const destinationDiff = destinationReady
    ? buildDestinationDiff(care, temperatureUnit)
    : {
        title: "목적지 없음",
        body: "목적지 추가하면 출발시간까지 계산",
      };
  const rainWindow = destinationReady
    ? buildRainWindow(care)
    : {
        title: "목적지 추가 후 계산",
        body: "저장한 목적지 기준으로 강수 시작과 완화 시점을 계산",
        compactTitle: "대기",
        compactBody: "목적지 추가",
      };

  return {
    departureTime,
    departureBody: destinationReady
      ? routeTimingReady
        ? `${targetArrivalTime} 도착 · 이동 ${travelMinutes}분 · 여유 ${bufferMinutes}분 · ${routeStatusLabel}`
        : `${targetArrivalTime} 도착 · 해외 경로 확인 전`
      : "현재 위치 예보 연결됨 · 목적지 추가하면 출발시간까지 계산",
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
  if (status === "ready") return "경로 확인";
  if (status === "error") return "경로 갱신 실패";
  return "경로 확인 전";
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
    body: `${getDisplayLocationName(care.originWeather.locationName)} 대비 ${diffParts.join(" · ")} · 목적지 기준 준비`,
  };
}

function buildRainWindow(care: P0ScreenProps["state"]["destinationCare"]) {
  const threshold = care.alertCondition?.rainThresholdPct ?? 50;
  const rainyHours = care.destinationWeather.hourly.filter((hour) => hour.rainProbabilityPct >= threshold || hour.precipitationMm > 0);
  if (rainyHours.length === 0) {
    const maxRain = Math.max(care.destinationWeather.current.rainProbabilityPct, ...care.destinationWeather.hourly.map((hour) => hour.rainProbabilityPct));
    return {
      title: `최대 강수 ${Math.round(maxRain)}%`,
      body: `${care.name} 기준 ${threshold}% 미만 · 강수 알림은 조용히 대기`,
      compactTitle: "대기",
      compactBody: `최대 ${Math.round(maxRain)}%`,
    };
  }
  const firstRain = rainyHours[0];
  const lastRain = rainyHours[rainyHours.length - 1];
  return {
    title: `비 시작 ${formatHour(firstRain.time)} · 완화 ${formatHour(lastRain.time)}`,
    body: `${care.name} 강수 ${threshold}% 기준 · 타임라인에서 완화 알림 조정 가능`,
    compactTitle: formatHour(lastRain.time),
    compactBody: `${formatHour(firstRain.time)} 시작`,
  };
}

function buildPackDecision(weather: P0ScreenProps["state"]["destinationCare"]["originWeather"]["current"]) {
  if (weather.rainProbabilityPct >= 50 || weather.precipitationMm > 0) {
    return { packTitle: "우산", packBody: "비 대비", packIcon: uiIconAssets.umbrella, packTone: "sky" as const, packFocus: "umbrella" as const };
  }
  if (weather.windMs >= 7) {
    return { packTitle: "바람막이", packBody: "바람 대비", packIcon: uiIconAssets.shirt, packTone: "warm" as const, packFocus: "outfit" as const };
  }
  if (weather.feelsLikeC <= 5) {
    return { packTitle: "겉옷", packBody: "체감 추위", packIcon: uiIconAssets.shirt, packTone: "warm" as const, packFocus: "outfit" as const };
  }
  return { packTitle: "가볍게", packBody: "기본 준비", packIcon: uiIconAssets.check, packTone: "clear" as const, packFocus: "outfit" as const };
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
  if (weather.hourly.length > 0) {
    const temps = weather.hourly.map((item) => item.tempC);
    return { minTempC: Math.min(...temps), maxTempC: Math.max(...temps) };
  }
  return null;
}

function getHeroMetaLine(
  current: P0ScreenProps["state"]["destinationCare"]["originWeather"]["current"],
  todayMinMax: { minTempC: number; maxTempC: number } | null,
  temperatureUnit: P0ScreenProps["temperatureUnit"],
) {
  const feelsLike = `체감 ${formatTemperature(current.feelsLikeC, temperatureUnit)}`;
  if (!todayMinMax) return feelsLike;
  return `${feelsLike} · 최고 ${formatTemperature(todayMinMax.maxTempC, temperatureUnit)} · 최저 ${formatTemperature(todayMinMax.minTempC, temperatureUnit)}`;
}

function HomeDecisionHero({
  current,
  currentLocationName,
  todayMinMax,
  locationStatus,
  temperatureUnit,
  theme,
  onOpenForecast,
}: {
  current: P0ScreenProps["state"]["destinationCare"]["originWeather"]["current"];
  currentLocationName: string;
  todayMinMax: { minTempC: number; maxTempC: number } | null;
  locationStatus: ReturnType<typeof getHomeLocationStatus>;
  temperatureUnit: P0ScreenProps["temperatureUnit"];
  theme: AppTheme;
  onOpenForecast: () => void;
}) {
  const weatherIcon = current.condition === "rain" || current.condition === "storm" ? uiIconAssets.rain : uiIconAssets.uv;
  const locationTone = locationStatus.tone === "clear" ? theme.clear : locationStatus.tone === "sky" ? theme.skyLite : theme.warm;

  return (
    <View
      accessibilityLabel="현재 날씨 요약"
      style={[styles.decisionHero, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow(theme)]}
    >
      <View style={styles.weatherShowcase}>
        <View style={[styles.weatherHalo, { backgroundColor: theme.cardMuted }]} />
        <Pressable
          accessibilityLabel={`${currentLocationName} 현재 날씨 ${getConditionLabel(current.condition)} ${formatTemperature(current.tempC, temperatureUnit)}, 날씨 상세 보기`}
          accessibilityRole="button"
          onPress={onOpenForecast}
          style={styles.weatherPrimaryColumn}
        >
          <View style={[styles.weatherOrb, { backgroundColor: `${theme.gold}18`, borderColor: `${theme.gold}42` }]}>
            <Image source={weatherIcon} style={[styles.weatherOrbIcon, { tintColor: current.condition === "rain" || current.condition === "storm" ? theme.sky : theme.gold }]} resizeMode="contain" />
          </View>
          <Text style={[styles.showcaseTemp, { color: theme.text }]}>{formatTemperature(current.tempC, temperatureUnit)}</Text>
          <Text style={[styles.showcaseCondition, { color: theme.muted }]}>{getConditionLabel(current.condition)}</Text>
          <Text style={[styles.showcaseMeta, { color: theme.subtle }]} numberOfLines={1}>
            {getHeroMetaLine(current, todayMinMax, temperatureUnit)}
          </Text>
          <Text style={[styles.showcaseMetaSub, { color: theme.subtle }]} numberOfLines={1}>
            {currentLocationName}
          </Text>
        </Pressable>
        <View style={[styles.showcaseStatus, { backgroundColor: `${locationTone}16` }]}>
          <View style={[styles.statusDot, { backgroundColor: locationTone }]} />
          <Text style={[styles.statusBadgeText, { color: locationTone }]}>{locationStatus.value}</Text>
        </View>
      </View>
      <View style={styles.decisionMetricRow}>
        <DecisionMetric icon={uiIconAssets.drop} label={`강수 ${current.rainProbabilityPct}%`} theme={theme} />
        <DecisionMetric icon={uiIconAssets.wind} label={`${current.windMs.toFixed(1)}m/s`} theme={theme} />
        <DecisionMetric icon={uiIconAssets.humidity} label={`${current.humidityPct}%`} theme={theme} />
      </View>
      <FeelsLikeCard current={current} temperatureUnit={temperatureUnit} theme={theme} onPress={onOpenForecast} />
    </View>
  );
}

function FeelsLikeCard({
  current,
  temperatureUnit,
  theme,
  onPress,
}: {
  current: P0ScreenProps["state"]["destinationCare"]["originWeather"]["current"];
  temperatureUnit: P0ScreenProps["temperatureUnit"];
  theme: AppTheme;
  onPress: () => void;
}) {
  const delta = current.feelsLikeC - current.tempC;
  return (
    <Pressable
      accessibilityLabel={`현재 위치 체감온도 ${formatTemperature(current.feelsLikeC, temperatureUnit)}`}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.feelsLikeCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
    >
      <View style={[styles.feelsLikeIconFrame, { backgroundColor: `${theme.clear}16` }]}>
        <Image source={uiIconAssets.shirt} style={[styles.feelsLikeIcon, { tintColor: theme.clear }]} resizeMode="contain" />
      </View>
      <View style={styles.feelsLikeCopy}>
        <Text style={[styles.feelsLikeLabel, { color: theme.clear }]} numberOfLines={1}>현재 위치 체감온도</Text>
        <Text style={[styles.feelsLikeBody, { color: theme.muted }]} numberOfLines={1}>
          실제 {formatTemperature(current.tempC, temperatureUnit)} · {getFeelsLikeDeltaLabel(delta, temperatureUnit)}
        </Text>
      </View>
      <Text style={[styles.feelsLikeValue, { color: theme.text }]} numberOfLines={1}>
        {formatTemperature(current.feelsLikeC, temperatureUnit)}
      </Text>
    </Pressable>
  );
}

function getFeelsLikeDeltaLabel(deltaC: number, temperatureUnit: P0ScreenProps["temperatureUnit"]) {
  const roundedDelta = Math.round(deltaC);
  if (roundedDelta === 0) return "실제 기온과 같음";
  return `체감 ${formatTemperatureDelta(deltaC, temperatureUnit)}`;
}

function DecisionMetric({ icon, label, theme }: { icon: number; label: string; theme: AppTheme }) {
  return (
    <View style={[styles.decisionMetric, { backgroundColor: theme.cardMuted }]}>
      <Image source={icon} style={[styles.decisionMetricIcon, { tintColor: theme.text }]} resizeMode="contain" />
      <Text style={[styles.decisionMetricText, { color: theme.text }]} numberOfLines={1}>{label}</Text>
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
    <Pressable
      accessibilityLabel={`${label} ${value}`}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.visualDecisionCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}
    >
      <View style={[styles.visualIconFrame, { backgroundColor: `${accent}18` }]}>
        <Image source={icon} style={[styles.visualDecisionIcon, { tintColor: accent }]} resizeMode="contain" />
      </View>
      <Text style={[styles.visualDecisionLabel, { color: accent }]} numberOfLines={1}>{label}</Text>
      <Text style={[styles.visualDecisionValue, { color: theme.text }]} numberOfLines={1}>{value}</Text>
      <Text style={[styles.visualDecisionHelper, { color: theme.muted }]} numberOfLines={1}>{helper}</Text>
    </Pressable>
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
  const imageSource = getHomeOutfitPreviewImage(outfit);
  return (
    <Pressable
      accessibilityLabel={`오늘 코디 ${outfit.decisionText}`}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.homeOutfitCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
    >
      <View style={styles.homeOutfitCopy}>
        <Text style={[styles.homeOutfitLabel, { color: theme.clear }]}>오늘 코디</Text>
        <Text style={[styles.homeOutfitTitle, { color: theme.text }]} numberOfLines={1}>
          {outfit.decisionText || packTitle}
        </Text>
        <Text style={[styles.homeOutfitBody, { color: theme.muted }]} numberOfLines={1}>
          {getOutfitVariantLabel(outfit.variant)} · 매칭 {outfit.matchPct}%
        </Text>
      </View>
      <View style={[styles.homeOutfitImageFrame, { backgroundColor: theme.cardMuted }]}>
        {imageSource ? (
          <Image source={imageSource} style={styles.homeOutfitImage} resizeMode="contain" />
        ) : (
          <Image source={uiIconAssets.shirt} style={[styles.homeOutfitIcon, { tintColor: theme.clear }]} resizeMode="contain" />
        )}
      </View>
    </Pressable>
  );
}

function getHomeOutfitPreviewImage(outfit: P0ScreenProps["state"]["outfit"]) {
  const previewItem = Object.values(outfit.items).find((item) => item?.imageUrl && outfitImageAssets[item.imageUrl]);
  if (previewItem?.imageUrl && outfitImageAssets[previewItem.imageUrl]) return outfitImageAssets[previewItem.imageUrl];
  return outfitImageAssets[HOME_OUTFIT_FALLBACK_IMAGE];
}

function getConditionLabel(condition: string) {
  if (condition === "clear") return "맑음";
  if (condition === "cloud") return "흐림";
  if (condition === "rain") return "비";
  if (condition === "snow") return "눈";
  if (condition === "storm") return "강한 비";
  if (condition === "dust") return "먼지";
  return "날씨";
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
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.bellButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
    >
      <BellGlyph color={theme.text} />
      {unreadCount > 0 ? (
        <View style={[styles.bellBadge, { backgroundColor: theme.sky }]}>
          <Text style={[styles.bellBadgeText, { color: theme.onAccent }]}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function NotificationSidebar({
  visible,
  notifications,
  readNotificationIds,
  notificationHistory,
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
          style={[styles.sidebarScrim, { opacity: progress }]}
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
            { backgroundColor: theme.cardStrong, borderColor: theme.border, shadowColor: theme.shadow },
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
        return (
          <SidebarNotificationItem
            key={item.id}
            item={item}
            route={route}
            read={read}
            color={color}
            previewOnly={previewOnly}
            smartCareEnabled={smartCareEnabled}
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
          accessibilityLabel={`${item.title} 열기`}
          accessibilityRole="button"
          onPress={onOpen}
          style={[styles.sidebarItem, { backgroundColor: theme.card, borderColor: read ? theme.border : color }]}
        >
          <View style={styles.sidebarItemMain}>
            <View style={[styles.sidebarItemDot, { backgroundColor: read ? theme.border : color }]} />
            <View style={styles.sidebarItemCopy}>
              <Text style={[styles.sidebarItemTitle, { color: theme.text }]}>{item.title}</Text>
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
  const label = item.action === "open" ? "열림" : item.action === "sent" ? "발송" : "읽음";
  return (
    <View style={styles.sidebarHistoryRow}>
      <View style={[styles.sidebarItemDot, { backgroundColor: theme.clear }]} />
      <View style={styles.sidebarItemCopy}>
        <Text style={[styles.sidebarHistoryTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.sidebarHistoryMeta, { color: theme.subtle }]}>{label} · {item.statusLabel}</Text>
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

const styles = StyleSheet.create({
  screenWrap: {
    flex: 1,
  },
  homeScroll: {
    flex: 1,
  },
  homeContent: {
    // 2026-07-08 실기기 QA: 홈 하단 판단 카드가 탭바에 일부 가려짐 확인.
    // AppScreen.tsx의 navClearancePadding(140→176, 코디 탭 동일 이슈 수정 시 검증된 값)과
    // 동일 근거(탭바 64 + margin 24 대비 여유)로 130 → 176으로 확대.
    minHeight: "100%",
    gap: spacing.md,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 176,
  },
  homeAtmosphere: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 320,
    opacity: 0.68,
  },
  homeGlow: {
    position: "absolute",
    top: 72,
    left: "50%",
    width: 180,
    height: 180,
    marginLeft: -90,
    borderRadius: 90,
    opacity: 0.36,
  },
  topBar: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  modePill: {
    minHeight: 34,
    maxWidth: 112,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  modeDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
  },
  modeText: {
    flex: 1,
    minWidth: 0,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  decisionStack: {
    gap: spacing.md,
    paddingTop: 2,
  },
  decisionHero: {
    minHeight: 402,
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  weatherShowcase: {
    minHeight: 230,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingTop: 6,
  },
  weatherHalo: {
    position: "absolute",
    top: 0,
    left: "50%",
    marginLeft: -88,
    width: 176,
    height: 176,
    borderRadius: 88,
    opacity: 0.5,
  },
  weatherPrimaryColumn: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: spacing.md,
    zIndex: 1,
  },
  weatherOrb: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  weatherOrbIcon: {
    width: 60,
    height: 60,
  },
  showcaseTemp: {
    marginTop: 8,
    fontSize: 58,
    lineHeight: 62,
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "center",
  },
  showcaseCondition: {
    marginTop: -1,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    textAlign: "center",
  },
  showcaseMeta: {
    marginTop: 5,
    maxWidth: "100%",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  showcaseMetaSub: {
    marginTop: 1,
    maxWidth: "100%",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  showcaseStatus: {
    position: "absolute",
    top: 8,
    right: 4,
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    zIndex: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
  },
  statusBadgeText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  decisionMetricRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  decisionMetric: {
    flex: 1,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 8,
    borderRadius: radius.md,
  },
  decisionMetricIcon: {
    width: 14,
    height: 14,
  },
  decisionMetricText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  feelsLikeCard: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  feelsLikeIconFrame: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  feelsLikeIcon: {
    width: 24,
    height: 24,
  },
  feelsLikeCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  feelsLikeLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  feelsLikeBody: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  feelsLikeValue: {
    minWidth: 64,
    textAlign: "right",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
  },
  destinationSection: {
    gap: spacing.sm,
  },
  destinationSelectorCard: {
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  destinationSelectorHeader: {
    minHeight: 42,
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
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  destinationSelectorTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  destinationSelectorMeta: {
    fontSize: 11,
    lineHeight: 15,
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
    width: 104,
    minHeight: 48,
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  destinationChipTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
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
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  destinationEmptyBody: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  visualDecisionGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  visualDecisionCard: {
    flex: 1,
    minHeight: 108,
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    padding: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  visualIconFrame: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  visualDecisionIcon: {
    width: 22,
    height: 22,
  },
  visualDecisionLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  visualDecisionValue: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "900",
  },
  visualDecisionHelper: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
  },
  homeOutfitCard: {
    minHeight: 132,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  homeOutfitCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  homeOutfitLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  homeOutfitTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
  },
  homeOutfitBody: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  homeOutfitImageFrame: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
  },
  homeOutfitImage: {
    width: 96,
    height: 96,
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
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    elevation: 40,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  sidebarScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 14, 24, 0.48)",
  },
  sidebarScrimTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  sidebarPanel: {
    width: "86%",
    maxWidth: 340,
    height: "100%",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: 30,
    paddingBottom: 118,
    borderLeftWidth: 1,
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
  closeIconButton: {
    minWidth: 48,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  closeIconText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
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
  sidebarPermissionPill: {
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  sidebarPermissionPillText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
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
  sidebarItemTarget: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  sidebarItemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  sidebarOpenHint: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  sidebarConditionButton: {
    minWidth: 54,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  sidebarConditionText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
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
