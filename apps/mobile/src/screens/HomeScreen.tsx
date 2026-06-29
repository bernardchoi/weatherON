import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { OutfitGrid } from "../components/OutfitGrid";
import { LocationModePanel } from "../components/LocationModePanel";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import { WeatherSummary } from "../components/WeatherSummary";
import { WeatherStatusPanel } from "../components/WeatherStatusPanel";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

export function HomeScreen({
  state,
  useDestinationWeather,
  umbrellaReviewed,
  smartCareEnabled,
  weatherLocationMode,
  deviceLocationState,
  locationReady,
  isWeatherLoading,
  onNavigate,
  onToggleWeather,
  onReviewUmbrella,
  onSetWeatherProviderMode,
  onSetWeatherLocationMode,
  onRequestCurrentLocation,
  onRefreshWeather,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const activeNotifications = state.notifications.filter((item) => item.active);
  const departureTime = state.destinationCare.departureAdvice?.recommendedDepartureTime ?? "08:10";
  const targetArrivalTime = state.destinationCare.departureAdvice?.targetArrivalTime ?? "09:00";
  const travelMinutes = state.destinationCare.departureAdvice?.travelMinutes ?? 40;

  return (
    <AppScreen
      title="나가기 전 5초 판단"
      subtitle="언제 나갈지, 목적지는 다른지, 비는 언제 그치는지 먼저 확인"
      badge={locationReady ? "현재 위치" : "기본 위치"}
    >
      <WeatherSummary weather={state.weather} useDestinationWeather={useDestinationWeather} onToggleWeather={onToggleWeather} />
      <View style={styles.statusStrip}>
        <StatusPill label={locationReady ? "위치 정상" : "위치 확인 필요"} tone={locationReady ? "clear" : "warm"} />
        <StatusPill label={smartCareEnabled ? "알림 설정 전" : "스마트 케어 꺼짐"} tone="sky" />
        <StatusPill label={state.weatherProvider.fallbackUsed ? "기본 예보" : "실시간 예보"} tone="gold" />
      </View>

      <Section title="오늘 바로 결정" caption="MVP 0에서 검증할 핵심 흐름" accent="gold">
        <View style={styles.priorityGrid}>
          <PriorityCard
            index="01"
            label="언제 나가야 함"
            title={`${departureTime} 출발`}
            body={`${targetArrivalTime} 도착 · 이동 ${travelMinutes}분 · 여유 10분 반영`}
            accent={theme.gold}
            icon={uiIconAssets.depart}
            theme={theme}
            action={<AppButton label="출발 준비 보기" onPress={() => onNavigate("G2")} />}
          />
          <PriorityCard
            index="02"
            label="목적지는 다른가"
            title={state.destinationCare.name}
            body="출발지보다 흐리고 강수 가능성 있음 · 목적지 기준으로 준비"
            accent={theme.sky}
            icon={uiIconAssets.pin}
            theme={theme}
            action={<AppButton label="목적지 비교" onPress={() => onNavigate("G2")} tone="secondary" />}
          />
          <PriorityCard
            index="03"
            label="비는 언제 그침"
            title="18:00 시작 · 21:00 그침"
            body="강수 타임라인에서 비 그침 알림을 바로 켤 수 있음"
            accent={theme.clear}
            icon={uiIconAssets.rain}
            theme={theme}
            action={<AppButton label="강수 타임라인" onPress={() => onNavigate("H5")} tone="secondary" />}
          />
        </View>
      </Section>
      <View style={styles.locationAction}>
        <AppButton label="위치 변경" onPress={() => onNavigate("H2")} tone="secondary" />
      </View>

      <Section title="목적지 케어" caption={state.destinationCare.nextAlertText} accent="gold">
        <View style={styles.destinationRow}>
          <View style={styles.destinationCopy}>
            <Text style={[styles.destinationName, { color: theme.text }]}>{state.destinationCare.name}</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>
              {state.destinationCare.departureAdvice?.targetArrivalTime} 도착 · 이동{" "}
              {state.destinationCare.departureAdvice?.travelMinutes}분
            </Text>
          </View>
          <StatusPill label={state.destinationCare.careOn ? "켜짐" : "꺼짐"} tone="clear" />
        </View>
        <View style={styles.actions}>
          <AppButton label="목적지 케어" onPress={() => onNavigate("G2")} />
          <AppButton label="목적지 목록" onPress={() => onNavigate("G1")} tone="secondary" />
        </View>
      </Section>

      <Section title="오늘 날씨엔 이 코디 어때요?" caption="핵심 판단 후 확인하는 보조 추천" accent="clear">
        <OutfitGrid outfit={state.outfit} maxItems={4} compact />
        <Text style={[styles.reason, { color: theme.muted }]}>{state.outfit.decisionText} · {state.outfit.reasons.join(" · ")}</Text>
        <View style={styles.actions}>
          <AppButton label="코디 보기" onPress={() => onNavigate("C1")} />
          <AppButton label="상세" onPress={() => onNavigate("C4")} tone="secondary" />
        </View>
      </Section>

      {!umbrellaReviewed && state.umbrella.level !== "none" ? (
        <Section title={state.umbrella.title} caption={state.umbrella.reason} accent="sky">
          <View style={styles.actionRow}>
            <StatusPill label={state.umbrella.level === "required" ? "필수" : "추천"} tone="sky" />
            <AppButton label="우산 상세" onPress={() => onNavigate("H4")} />
            <AppButton label="확인" onPress={onReviewUmbrella} tone="secondary" />
          </View>
        </Section>
      ) : null}

      <Section
        title="알림 센터"
        caption={`${activeNotifications.length}개 자동 케어 활성 · ${smartCareEnabled ? "켜짐" : "꺼짐"} · ${
          state.weatherProvider.fallbackUsed ? "기본 예보 기준" : "실시간 예보 연결"
        }`}
        accent="warm"
      >
        {activeNotifications.slice(0, 3).map((item) => (
          <View key={item.id} style={[styles.notificationRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.notificationTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.notificationReason, { color: theme.muted }]}>{item.reason}</Text>
          </View>
        ))}
        <View style={styles.actions}>
          <AppButton label="알림 센터" onPress={() => onNavigate("H3")} />
          <AppButton label="강수 보기" onPress={() => onNavigate("H5")} tone="secondary" />
        </View>
      </Section>

      <Section title="날씨 기준 설정" caption="위치와 예보 연결 상태를 확인" accent="sky">
        <LocationModePanel
          mode={weatherLocationMode}
          deviceLocationState={deviceLocationState}
          locationReady={locationReady}
          onSetMode={onSetWeatherLocationMode}
          onRequestCurrentLocation={onRequestCurrentLocation}
        />
        <WeatherStatusPanel
          status={state.weatherProvider.status}
          message={state.weatherProvider.message}
          retryable={state.weatherProvider.retryable}
          loading={isWeatherLoading}
          onSetMode={onSetWeatherProviderMode}
          onRetry={onRefreshWeather}
        />
      </Section>
    </AppScreen>
  );
}

function PriorityCard({
  index,
  label,
  title,
  body,
  accent,
  icon,
  theme,
  action,
}: {
  index: string;
  label: string;
  title: string;
  body: string;
  accent: string;
  icon: number;
  theme: AppTheme;
  action: React.ReactNode;
}) {
  return (
    <View style={[styles.priorityItem, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
      <View style={[styles.priorityRail, { backgroundColor: accent }]} />
      <View style={styles.priorityHeader}>
        <View style={[styles.priorityIconBox, { borderColor: `${accent}66`, backgroundColor: theme.cardSoft }]}>
          <Image source={icon} style={[styles.priorityIcon, { tintColor: accent }]} resizeMode="contain" />
        </View>
        <Text style={[styles.priorityIndex, { color: accent }]}>{index}</Text>
        <Text style={[styles.priorityKicker, { color: accent }]}>{label}</Text>
      </View>
      <Text style={[styles.priorityTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.priorityBody, { color: theme.muted }]}>{body}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  reason: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  statusStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    justifyContent: "center",
  },
  locationAction: {
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  destinationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  destinationCopy: {
    flex: 1,
  },
  priorityGrid: {
    gap: spacing.sm,
  },
  priorityItem: {
    gap: spacing.xs,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  priorityRail: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  priorityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  priorityIndex: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  priorityIconBox: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  priorityIcon: {
    width: 18,
    height: 18,
  },
  priorityKicker: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  priorityTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
  },
  priorityBody: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  destinationName: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  meta: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  notificationRow: {
    gap: 3,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  notificationReason: {
    fontSize: 12,
    lineHeight: 17,
  },
  reportRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
});
