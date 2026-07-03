import React, { useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { DailyWeather, HourlyWeather } from "@weatheron/shared";
import { uiIconAssets } from "../assets";
import { WeatherStatusPanel } from "../components/WeatherStatusPanel";
import type { P0RouteId } from "../navigation/routes";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";
import { getDisplayLocationName } from "../utils/locationDisplay";
import { formatTemperature, formatTemperatureDelta } from "../utils/units";

export function HomeScreen({
  state,
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
  onMarkAllNotificationsRead,
  onOpenNotificationDeepLink,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const [notificationSidebarOpen, setNotificationSidebarOpen] = useState(false);
  const activeNotifications = state.notifications.filter((item) => item.active);
  const unreadNotificationCount = activeNotifications.filter((item) => !readNotificationIds.includes(item.id)).length;
  const destinationReady = state.hasDestination && state.destinationCare.name !== "목적지 미등록";
  const homeDecision = buildHomeDecision(state.destinationCare, destinationReady, temperatureUnit);
  const currentWeather = state.destinationCare.originWeather;
  const forecastPreview = buildForecastPreview(currentWeather, temperatureUnit);
  const currentLocationName = getDisplayLocationName(currentWeather.locationName);
  const current = currentWeather.current;
  const locationStatus = getHomeLocationStatus(locationReady, weatherLocationMode);
  const sourceLabel = buildWeatherSourceLabel(
    state.weatherProvider.currentSource,
    state.weatherProvider.destinationSource,
    state.weatherProvider.fallbackUsed,
  );
  const updatedAtLabel = buildWeatherUpdatedAtLabel(state.weatherProvider.currentObservedAt, state.weatherProvider.destinationObservedAt);

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
          <Pressable
            accessibilityLabel="현재 위치 변경"
            accessibilityRole="button"
            onPress={() => onNavigate("H2")}
            style={[styles.locationPill, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
          >
            <Text style={[styles.locationText, { color: theme.text }]} numberOfLines={1}>{currentLocationName}</Text>
            <Text style={[styles.locationChevron, { color: theme.subtle }]}>▾</Text>
          </Pressable>
          <NotificationBellButton
            unreadCount={unreadNotificationCount}
            smartCareEnabled={smartCareEnabled}
            theme={theme}
            onPress={() => setNotificationSidebarOpen(true)}
          />
        </View>

        <View style={styles.decisionStack}>
          <HomeDecisionHero
            decision={homeDecision}
            current={current}
            currentLocationName={currentLocationName}
            destinationReady={destinationReady}
            locationStatus={locationStatus}
            permissionReady={permissionReady}
            temperatureUnit={temperatureUnit}
            theme={theme}
            onPress={() => onNavigate("G1")}
          />
          <View style={styles.quickActionGrid}>
            <HomeQuickAction
              label="목적지 비교"
              title={destinationReady ? homeDecision.destinationTitle : "목적지 추가 필요"}
              body={destinationReady ? state.destinationCare.name : "목적지 추가하면 출발시간 계산"}
              accent={theme.sky}
              icon={uiIconAssets.pin}
              theme={theme}
              onPress={() => onNavigate(destinationReady ? "G2" : "P1")}
            />
            <HomeQuickAction
              label="강수 타임라인"
              title={homeDecision.rainTitle}
              body={homeDecision.rainBody}
              accent={theme.clear}
              icon={uiIconAssets.rain}
              theme={theme}
              onPress={() => onNavigate("H5")}
            />
          </View>
          <ForecastPreviewRow preview={forecastPreview} theme={theme} onOpen={() => onNavigate("H6")} />
        </View>

        <View style={styles.cardStack}>
          <View style={[styles.syncCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.syncCopy}>
              <Text style={[styles.syncLabel, { color: theme.clear }]}>준비 기준</Text>
              <Text style={[styles.syncTitle, { color: theme.text }]}>{smartCareEnabled ? "개인화 기준 적용 중" : "게스트 기준 적용 중"}</Text>
              <Text style={[styles.syncBody, { color: theme.muted }]}>
                위치 {locationStatus.value} · 알림 {permissionReady ? "맞춤 케어" : "설정 전"} · {sourceLabel} · {updatedAtLabel}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="날씨 새로고침"
              accessibilityRole="button"
              disabled={isWeatherLoading}
              onPress={onRefreshWeather}
              style={[styles.refreshPill, { backgroundColor: `${theme.clear}18`, borderColor: `${theme.clear}44`, opacity: isWeatherLoading ? 0.55 : 1 }]}
            >
              <Text style={[styles.refreshPillText, { color: theme.clear }]}>{isWeatherLoading ? "갱신 중" : "갱신"}</Text>
            </Pressable>
          </View>
          {state.weatherProvider.status !== "ready" || state.weatherProvider.retryable || state.weatherProvider.fallbackUsed ? (
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
        onOpenSettings={() => {
          setNotificationSidebarOpen(false);
          onNavigate("M2");
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

function buildHomeDecision(
  care: P0ScreenProps["state"]["destinationCare"],
  destinationReady: boolean,
  temperatureUnit: P0ScreenProps["temperatureUnit"],
) {
  const targetArrivalTime = care.departureAdvice?.targetArrivalTime ?? "13:00";
  const travelMinutes = care.departureAdvice?.travelMinutes ?? 40;
  const bufferMinutes = care.departureAdvice?.bufferMinutes ?? 10;
  const departureTime = care.departureAdvice?.recommendedDepartureTime ?? subtractMinutes(targetArrivalTime, travelMinutes + bufferMinutes);
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
      };

  return {
    departureTime,
    departureBody: destinationReady ? `${targetArrivalTime} 도착 · 이동 ${travelMinutes}분 · 여유 ${bufferMinutes}분 · ${routeStatusLabel}` : "현재 위치 예보 연결됨 · 목적지 추가하면 출발시간까지 계산",
    destinationTitle: destinationDiff.title,
    destinationBody: destinationDiff.body,
    rainTitle: rainWindow.title,
    rainBody: destinationReady ? rainWindow.body : rainWindow.body,
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
    };
  }
  const firstRain = rainyHours[0];
  const lastRain = rainyHours[rainyHours.length - 1];
  return {
    title: `${formatHour(firstRain.time)} 시작 · ${formatHour(lastRain.time)} 완화`,
    body: `${care.name} 강수 ${threshold}% 기준 · 타임라인에서 그침 알림 조정 가능`,
  };
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

function buildWeatherSourceLabel(
  currentSource: P0ScreenProps["state"]["weatherProvider"]["currentSource"],
  destinationSource: P0ScreenProps["state"]["weatherProvider"]["destinationSource"],
  fallbackUsed: boolean,
) {
  if (fallbackUsed || currentSource === "fallback" || destinationSource === "fallback") return "기본 예보";
  if (currentSource === "kma" || destinationSource === "kma") return "기상청 예보";
  if (currentSource === "openmeteo" || destinationSource === "openmeteo") return "실시간 예보";
  if (currentSource === "cache" || destinationSource === "cache") return "최근 예보";
  return "예보 연결";
}

function buildWeatherUpdatedAtLabel(currentObservedAt: string, destinationObservedAt: string) {
  const currentTime = new Date(currentObservedAt).getTime();
  const destinationTime = new Date(destinationObservedAt).getTime();
  const latestTime = Math.max(
    Number.isFinite(currentTime) ? currentTime : 0,
    Number.isFinite(destinationTime) ? destinationTime : 0,
  );
  if (!latestTime) return "갱신 시각 확인 중";
  const latest = new Date(latestTime);
  return `갱신 ${String(latest.getHours()).padStart(2, "0")}:${String(latest.getMinutes()).padStart(2, "0")}`;
}

function buildForecastPreview(
  weather: P0ScreenProps["state"]["destinationCare"]["originWeather"],
  temperatureUnit: P0ScreenProps["temperatureUnit"],
) {
  const hourly = getHourlyForecast(weather);
  const daily = getDailyForecast(weather.daily, weather.hourly);
  const nextHour = hourly[0];
  const rainyHour = hourly.find((item) => item.rainProbabilityPct >= 50 || item.precipitationMm > 0);
  const weeklyPeak = daily.reduce<DailyWeather | null>((peak, item) => {
    if (!peak) return item;
    return item.rainProbabilityPct > peak.rainProbabilityPct ? item : peak;
  }, null);

  return {
    hourlyTitle: nextHour ? `${formatHour(nextHour.time)} · ${formatTemperature(nextHour.tempC, temperatureUnit)}` : "시간별 확인",
    hourlyBody: rainyHour ? `${formatHour(rainyHour.time)} 강수 ${rainyHour.rainProbabilityPct}%` : "강수 신호 낮음",
    weeklyTitle: weeklyPeak ? `${formatDateLabel(weeklyPeak.date)} 강수 ${weeklyPeak.rainProbabilityPct}%` : "주간 확인",
    weeklyBody: daily.length > 1 ? `${daily.length}일 예보 · 최고 ${formatTemperature(Math.max(...daily.map((item) => item.maxTempC)), temperatureUnit)}` : "일별 예보 확인",
  };
}

function getHourlyForecast(weather: P0ScreenProps["state"]["destinationCare"]["originWeather"]): HourlyWeather[] {
  if (weather.hourly.length > 0) return weather.hourly;
  return [{
    time: weather.observedAt,
    tempC: weather.current.tempC,
    rainProbabilityPct: weather.current.rainProbabilityPct,
    precipitationMm: weather.current.precipitationMm,
    windMs: weather.current.windMs,
    condition: weather.current.condition,
  }];
}

function getDailyForecast(daily: DailyWeather[] | undefined, hourly: HourlyWeather[]): DailyWeather[] {
  if (daily && daily.length > 0) return daily;
  const grouped = hourly.reduce<Record<string, HourlyWeather[]>>((acc, item) => {
    const date = item.time.includes("T") ? item.time.slice(0, 10) : "오늘";
    acc[date] = acc[date] ?? [];
    acc[date].push(item);
    return acc;
  }, {});
  return Object.entries(grouped).map(([date, items]) => ({
    date,
    minTempC: Math.min(...items.map((item) => item.tempC)),
    maxTempC: Math.max(...items.map((item) => item.tempC)),
    rainProbabilityPct: Math.max(...items.map((item) => item.rainProbabilityPct)),
    precipitationMm: Number(items.reduce((sum, item) => sum + item.precipitationMm, 0).toFixed(1)),
    windMs: Math.max(...items.map((item) => item.windMs)),
    condition: selectDailyCondition(items),
  }));
}

function selectDailyCondition(items: HourlyWeather[]) {
  const priority = ["storm", "snow", "rain", "dust", "cloud", "clear"];
  return priority.find((condition) => items.some((item) => item.condition === condition)) ?? items[0]?.condition ?? "cloud";
}

function formatDateLabel(value: string) {
  if (value === "오늘") return value;
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  return `${Number(match[2])}/${Number(match[3])}`;
}

function HomeDecisionHero({
  decision,
  current,
  currentLocationName,
  destinationReady,
  locationStatus,
  permissionReady,
  temperatureUnit,
  theme,
  onPress,
}: {
  decision: ReturnType<typeof buildHomeDecision>;
  current: P0ScreenProps["state"]["destinationCare"]["originWeather"]["current"];
  currentLocationName: string;
  destinationReady: boolean;
  locationStatus: ReturnType<typeof getHomeLocationStatus>;
  permissionReady: boolean;
  temperatureUnit: P0ScreenProps["temperatureUnit"];
  theme: AppTheme;
  onPress: () => void;
}) {
  const headline = destinationReady ? `${decision.departureTime} 출발 준비` : "목적지 추가하면 출발시간 계산";
  const body = destinationReady ? decision.departureBody : "현재 위치 예보 기준. 목적지만 추가하면 출발·강수 판단까지 연결";
  const weatherIcon = current.condition === "rain" || current.condition === "storm" ? uiIconAssets.rain : uiIconAssets.uv;
  const locationTone = locationStatus.tone === "clear" ? theme.clear : locationStatus.tone === "sky" ? theme.sky : theme.warm;

  return (
    <Pressable
      accessibilityLabel={`출발 판단 ${headline}`}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.decisionHero, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}
    >
      <View style={styles.weatherShowcase}>
        <View style={[styles.weatherHalo, { backgroundColor: theme.cardMuted }]} />
        <View style={[styles.weatherOrb, { backgroundColor: `${theme.gold}18`, borderColor: `${theme.gold}42` }]}>
          <Image source={weatherIcon} style={[styles.weatherOrbIcon, { tintColor: current.condition === "rain" || current.condition === "storm" ? theme.sky : theme.gold }]} resizeMode="contain" />
        </View>
        <Text style={[styles.showcaseTemp, { color: theme.text }]}>{formatTemperature(current.feelsLikeC, temperatureUnit)}</Text>
        <Text style={[styles.showcaseCondition, { color: theme.muted }]}>{getConditionLabel(current.condition)}</Text>
        <Text style={[styles.showcaseMeta, { color: theme.subtle }]} numberOfLines={1}>
          {currentLocationName} · 현재 {formatTemperature(current.tempC, temperatureUnit)}
        </Text>
        <View style={[styles.showcaseStatus, { backgroundColor: `${locationTone}16` }]}>
          <View style={[styles.statusDot, { backgroundColor: locationTone }]} />
          <Text style={[styles.statusBadgeText, { color: locationTone }]}>{locationStatus.value}</Text>
        </View>
      </View>
      <View style={styles.decisionCopy}>
        <Text style={[styles.decisionLabel, { color: theme.gold }]}>오늘 준비</Text>
        <Text style={[styles.decisionTitle, { color: theme.text }]}>{headline}</Text>
        <Text style={[styles.decisionBody, { color: theme.muted }]} numberOfLines={2}>{body}</Text>
      </View>
      <View style={styles.decisionMetricRow}>
        <DecisionMetric icon={uiIconAssets.drop} label={`강수 ${current.rainProbabilityPct}%`} theme={theme} />
        <DecisionMetric icon={uiIconAssets.wind} label={`${current.windMs.toFixed(1)}m/s`} theme={theme} />
        <DecisionMetric icon={uiIconAssets.humidity} label={`${current.humidityPct}%`} theme={theme} />
      </View>
      <View style={styles.decisionFooter}>
        <Text style={[styles.decisionFootnote, { color: theme.subtle }]} numberOfLines={1}>
          알림 {permissionReady ? "맞춤 케어" : "설정 전"}
        </Text>
        <View style={[styles.primaryMiniButton, { backgroundColor: theme.gold }]}>
          <Text style={[styles.primaryMiniButtonText, { color: theme.onAccent }]}>출발 판단</Text>
        </View>
      </View>
    </Pressable>
  );
}

function ForecastPreviewRow({
  preview,
  theme,
  onOpen,
}: {
  preview: ReturnType<typeof buildForecastPreview>;
  theme: AppTheme;
  onOpen: () => void;
}) {
  return (
    <View style={styles.forecastPreviewRow}>
      <ForecastPreviewCard
        label="시간별 예보"
        title={preview.hourlyTitle}
        body={preview.hourlyBody}
        icon={uiIconAssets.clock}
        accent={theme.sky}
        theme={theme}
        onPress={onOpen}
      />
      <ForecastPreviewCard
        label="주간 예보"
        title={preview.weeklyTitle}
        body={preview.weeklyBody}
        icon={uiIconAssets.uv}
        accent={theme.gold}
        theme={theme}
        onPress={onOpen}
      />
    </View>
  );
}

function ForecastPreviewCard({
  label,
  title,
  body,
  icon,
  accent,
  theme,
  onPress,
}: {
  label: string;
  title: string;
  body: string;
  icon: number;
  accent: string;
  theme: AppTheme;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`${label} 상세 보기`}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.forecastPreviewCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
    >
      <View style={styles.forecastPreviewHeader}>
        <Image source={icon} style={[styles.forecastPreviewIcon, { tintColor: accent }]} resizeMode="contain" />
        <Text style={[styles.forecastPreviewLabel, { color: accent }]}>{label}</Text>
      </View>
      <Text style={[styles.forecastPreviewTitle, { color: theme.text }]} numberOfLines={1}>{title}</Text>
      <Text style={[styles.forecastPreviewBody, { color: theme.muted }]} numberOfLines={1}>{body}</Text>
    </Pressable>
  );
}

function DecisionMetric({ icon, label, theme }: { icon: number; label: string; theme: AppTheme }) {
  return (
    <View style={[styles.decisionMetric, { backgroundColor: theme.cardMuted }]}>
      <Image source={icon} style={[styles.decisionMetricIcon, { tintColor: theme.text }]} resizeMode="contain" />
      <Text style={[styles.decisionMetricText, { color: theme.text }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function HomeQuickAction({
  label,
  title,
  body,
  accent,
  icon,
  theme,
  onPress,
}: {
  label: string;
  title: string;
  body: string;
  accent: string;
  icon: number;
  theme: AppTheme;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`${label} ${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.quickActionCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
    >
      <View style={styles.quickActionHeader}>
        <Image source={icon} style={[styles.quickActionIcon, { tintColor: accent }]} resizeMode="contain" />
        <Text style={[styles.quickActionLabel, { color: accent }]}>{label}</Text>
      </View>
      <Text style={[styles.quickActionTitle, { color: theme.text }]} numberOfLines={2}>{title}</Text>
      <Text style={[styles.quickActionBody, { color: theme.muted }]} numberOfLines={1}>{body}</Text>
    </Pressable>
  );
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
      style={[styles.bellButton, { backgroundColor: theme.cardStrong, borderColor: unreadCount > 0 ? theme.gold : theme.border }]}
    >
      <BellGlyph color={theme.text} />
      {unreadCount > 0 ? (
        <View style={[styles.bellBadge, { backgroundColor: theme.alert }]}>
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
  onOpenSettings,
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
  onOpenSettings: () => void;
  onOpen: (id: string, route: P0RouteId) => void;
  theme: AppTheme;
}) {
  if (!visible) return null;

  const unreadCount = notifications.filter((item) => !readNotificationIds.includes(item.id)).length;
  const hasUnread = unreadCount > 0;
  const groups = buildSidebarGroups(notifications.slice(0, 6), readNotificationIds);
  const recentHistory = notificationHistory.slice(0, 3);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.sidebarLayer}>
        <Pressable
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          onPress={onClose}
          style={styles.sidebarScrim}
        />
        <View style={[styles.sidebarPanel, { backgroundColor: theme.cardStrong, borderColor: theme.border, shadowColor: theme.shadow }]}>
          <View style={styles.sidebarHeader}>
            <View style={styles.sidebarTitleGroup}>
              <Text style={[styles.sidebarKicker, { color: hasUnread ? theme.gold : theme.clear }]}>
                {smartCareEnabled ? "스마트 알림" : "알림 꺼짐"}
              </Text>
              <Text style={[styles.sidebarTitle, { color: theme.text }]}>알림</Text>
              <Text style={[styles.sidebarMeta, { color: theme.subtle }]}>
                {notifications.length}개 활성 · 읽지 않음 {unreadCount}개
              </Text>
            </View>
            <Pressable accessibilityLabel="알림 사이드바 닫기" accessibilityRole="button" onPress={onClose} style={[styles.closeIconButton, { borderColor: theme.border }]}>
              <Text style={[styles.closeIconText, { color: theme.text }]}>닫기</Text>
            </Pressable>
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
            onPress={onMarkAllNotificationsRead}
            style={[styles.markAllButton, { backgroundColor: theme.cardMuted, borderColor: hasUnread ? theme.gold : theme.border, opacity: hasUnread ? 1 : 0.54 }]}
          >
            <Text style={[styles.markAllText, { color: hasUnread ? theme.gold : theme.subtle }]}>전체 읽음</Text>
          </Pressable>

          <ScrollView style={styles.sidebarScroll} contentContainerStyle={styles.sidebarList} showsVerticalScrollIndicator={false}>
            {groups.map((group) => (
              <SidebarNotificationGroup
                key={group.title}
                group={group}
                readNotificationIds={readNotificationIds}
                smartCareEnabled={smartCareEnabled}
                onOpen={onOpen}
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
            {notifications.length === 0 ? (
              <View style={[styles.sidebarEmpty, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.sidebarEmptyTitle, { color: theme.text }]}>활성 알림 없음</Text>
                <Text style={[styles.sidebarEmptyBody, { color: theme.muted }]}>조건을 켜면 여기에서 바로 확인 가능</Text>
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
        </View>
      </View>
    </Modal>
  );
}

type SidebarGroup = {
  title: "주의 필요" | "오늘 예정";
  meta: string;
  items: P0ScreenProps["state"]["notifications"];
};

function buildSidebarGroups(notifications: P0ScreenProps["state"]["notifications"], readNotificationIds: string[]): SidebarGroup[] {
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
  theme,
}: {
  group: SidebarGroup;
  readNotificationIds: string[];
  smartCareEnabled: boolean;
  onOpen: (id: string, route: P0RouteId) => void;
  theme: AppTheme;
}) {
  return (
    <View style={styles.sidebarGroup}>
      <View>
        <Text style={[styles.sidebarGroupTitle, { color: theme.text }]}>{group.title}</Text>
        <Text style={[styles.sidebarGroupMeta, { color: theme.subtle }]}>{group.items.length > 0 ? group.meta : "해당 알림 없음"}</Text>
      </View>
      {group.items.map((item, index) => {
        const route = item.deepLink as P0RouteId;
        const read = readNotificationIds.includes(item.id);
        const color = getNotificationTone(theme, index, route);
        return (
          <Pressable
            key={item.id}
            accessibilityLabel={`${item.title} 열기`}
            accessibilityRole="button"
            onPress={() => onOpen(item.id, route)}
            style={[styles.sidebarItem, { backgroundColor: theme.card, borderColor: read ? theme.border : color }]}
          >
            <View style={styles.sidebarItemMain}>
              <View style={[styles.sidebarItemDot, { backgroundColor: read ? theme.border : color }]} />
              <View style={styles.sidebarItemCopy}>
                <Text style={[styles.sidebarItemTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.sidebarItemBody, { color: theme.muted }]}>{smartCareEnabled ? item.reason : "스마트 알림 꺼짐"}</Text>
                <Text style={[styles.sidebarItemTarget, { color }]}>{getNotificationTargetLabel(route)}</Text>
              </View>
            </View>
            <Text style={[styles.sidebarOpenHint, { color: read ? theme.subtle : theme.text }]}>
              {read ? "확인됨" : "눌러서 확인"}
            </Text>
          </Pressable>
        );
      })}
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
      <View style={[styles.bellCup, { borderColor: color }]} />
      <View style={[styles.bellBase, { backgroundColor: color }]} />
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
  if (route === "H5" || index === 1) return theme.sky;
  if (route === "G2" || route === "H4" || index === 2) return theme.clear;
  if (index === 0) return theme.gold;
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
    minHeight: "100%",
    gap: spacing.sm,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 130,
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
  locationPill: {
    flex: 1,
    minHeight: 44,
    maxWidth: 184,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  locationText: {
    minWidth: 0,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  locationChevron: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  decisionStack: {
    gap: spacing.sm,
    paddingTop: 2,
  },
  decisionHero: {
    minHeight: 390,
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  weatherShowcase: {
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingTop: 4,
  },
  weatherHalo: {
    position: "absolute",
    top: 8,
    width: 190,
    height: 190,
    borderRadius: 95,
    opacity: 0.56,
  },
  weatherOrb: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    marginBottom: 4,
    zIndex: 1,
  },
  weatherOrbIcon: {
    width: 34,
    height: 34,
  },
  showcaseTemp: {
    fontSize: 74,
    lineHeight: 80,
    fontWeight: "900",
    letterSpacing: 0,
    zIndex: 1,
  },
  showcaseCondition: {
    marginTop: -2,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    zIndex: 1,
  },
  showcaseMeta: {
    marginTop: 3,
    maxWidth: "84%",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    zIndex: 1,
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
  decisionCopy: {
    gap: 4,
  },
  decisionLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  decisionTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: 0,
  },
  decisionBody: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800",
  },
  decisionMetricRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  decisionMetric: {
    flex: 1,
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 6,
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
  decisionFooter: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  decisionFootnote: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  primaryMiniButton: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  primaryMiniButtonText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  quickActionGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  quickActionCard: {
    flex: 1,
    minHeight: 108,
    gap: spacing.xs,
    justifyContent: "center",
    padding: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  quickActionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  quickActionIcon: {
    width: 16,
    height: 16,
  },
  quickActionLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  quickActionTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  quickActionBody: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  forecastPreviewRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  forecastPreviewCard: {
    flex: 1,
    minHeight: 100,
    justifyContent: "center",
    gap: 5,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  forecastPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  forecastPreviewIcon: {
    width: 16,
    height: 16,
  },
  forecastPreviewLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  forecastPreviewTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },
  forecastPreviewBody: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  cardStack: {
    gap: 9,
    paddingTop: 2,
  },
  syncCard: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  syncCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  syncLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  syncTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  syncBody: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
  },
  refreshPill: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  refreshPillText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  bellButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
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
  bellCup: {
    width: 14,
    height: 13,
    borderWidth: 1.8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 0,
  },
  bellBase: {
    width: 13,
    height: 2,
    marginTop: 1,
    borderRadius: 2,
  },
});
