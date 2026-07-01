import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { PlaceSearchResult } from "@weatheron/shared";
import { AppButton } from "../components/AppButton";
import { uiIconAssets } from "../assets";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

type DestinationCardModel = {
  id: string;
  title: string;
  area: string;
  icon: "company" | "school" | "place";
  originTemp: number;
  destinationTemp: number;
  departureTime: string;
  arrivalTime: string;
  warning: string;
  tone: "warm" | "clear";
  place: PlaceSearchResult;
  saved: boolean;
  careEnabled: boolean;
  savedAtLabel: string;
};

export function DestinationListScreen({
  state,
  savedDestinations,
  recentlyRemovedDestination,
  selectedDestinationPlace,
  accountGateResult,
  permissionGateResult,
  onNavigate,
  onSelectDestinationPlace,
  onRestoreRemovedDestination,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const care = state.destinationCare;
  const destinationCards = buildDestinationCards(savedDestinations, care, state.destinationWeatherById);
  const alertCount = destinationCards.filter((item) => item.careEnabled).length;
  const hasDestinations = destinationCards.length > 0;
  const alertLabel = hasDestinations ? `알림 ${alertCount}/${destinationCards.length}` : "알림 0";
  const resultBanner = getDestinationResultBanner(accountGateResult, permissionGateResult, hasDestinations);
  const recommendedDepartureTime = getRecommendedDepartureTime(care);

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>출발</Text>
        </View>

        <Pressable accessibilityLabel="목적지 검색 추가" accessibilityRole="button" onPress={() => onNavigate("P1")} style={[styles.searchRail, { backgroundColor: theme.card }]}>
          <SearchGlyph color={theme.subtle} />
          <Text style={[styles.searchText, { color: theme.subtle }]}>목적지 검색 · 추가</Text>
        </Pressable>

        {resultBanner ? <ResultBanner title={resultBanner.title} body={resultBanner.body} tone={resultBanner.tone} theme={theme} /> : null}
        {recentlyRemovedDestination ? (
          <RemovedDestinationBanner
            destinationName={recentlyRemovedDestination.place.name}
            onRestore={onRestoreRemovedDestination}
            theme={theme}
          />
        ) : null}

        <View style={[styles.todayCard, { backgroundColor: theme.card, borderLeftColor: theme.clear }]}>
          <View style={styles.todayTop}>
            <View>
              <Text style={[styles.todayLabel, { color: theme.clear }]}>오늘 준비</Text>
              <Text style={[styles.todayTitle, { color: theme.text }]}>{hasDestinations ? "알아서 챙기는 중" : "목적지 추가 대기"}</Text>
            </View>
            <View style={[styles.alertPill, { backgroundColor: theme.cardStrong }]}>
              <Text style={[styles.alertPillText, { color: theme.gold }]}>{alertLabel}</Text>
            </View>
          </View>
          <View style={styles.segmentRow}>
            <Segment label="날씨 비교" active={false} theme={theme} />
            <Segment label={hasDestinations ? `출발 ${recommendedDepartureTime}` : "목적지 필요"} active theme={theme} />
            <Segment label={hasDestinations ? "비 그침" : "알림 대기"} active={false} theme={theme} />
          </View>
          <Text style={[styles.todayHint, { color: theme.subtle }]}>
            {hasDestinations ? "목적지를 누르면 날씨와 출발 준비를 자세히 볼 수 있어요" : "자주 가는 곳을 추가하면 출발 시간과 비 그침 알림을 계산해요"}
          </Text>
        </View>

        <View style={styles.destinationList}>
          {hasDestinations ? (
            destinationCards.map((item) => (
              <DestinationCard
                key={item.id}
                item={item}
                theme={theme}
                selected={selectedDestinationPlace.id === item.place.id}
                onOpen={() => {
                  onSelectDestinationPlace(item.place);
                  onNavigate("G2");
                }}
              />
            ))
          ) : (
            <EmptyDestinationState theme={theme} onAdd={() => onNavigate("P1")} />
          )}
        </View>

      </ScrollView>
    </View>
  );
}

function EmptyDestinationState({ theme, onAdd }: { theme: AppTheme; onAdd: () => void }) {
  return (
    <View style={[styles.emptyCard, { backgroundColor: theme.card, borderLeftColor: theme.gold, borderColor: theme.border }]}>
      <View style={styles.emptyHeader}>
        <View style={[styles.emptyIconBox, { backgroundColor: theme.cardStrong }]}>
          <PlaceGlyph type="place" color={theme.gold} />
        </View>
        <View style={styles.emptyCopy}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>첫 목적지를 추가해 주세요</Text>
          <Text style={[styles.emptyBody, { color: theme.subtle }]}>자주 가는 장소를 저장하면 목적지 날씨와 출발 준비를 바로 비교해요</Text>
        </View>
      </View>
      <AppButton label="목적지 추가" accessibilityLabel="첫 목적지 추가하기" onPress={onAdd} tone="warning" />
    </View>
  );
}

function DestinationCard({
  item,
  theme,
  selected,
  onOpen,
}: {
  item: DestinationCardModel;
  theme: AppTheme;
  selected: boolean;
  onOpen: () => void;
}) {
  const accent = item.tone === "warm" ? theme.warm : theme.clear;
  return (
    <Pressable
      accessibilityLabel={`${item.title} 목적지 상세 보기`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onOpen}
      style={[
        styles.destinationCard,
        {
          backgroundColor: selected ? theme.card : theme.card,
          borderLeftColor: accent,
          borderColor: selected ? accent : "transparent",
        },
      ]}
    >
      <View style={styles.destinationTop}>
        <View style={styles.destinationTitleRow}>
          <PlaceGlyph type={item.icon} color={theme.text} />
          <Text style={[styles.destinationName, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
          <Text style={[styles.destinationArea, { color: theme.subtle }]} numberOfLines={1}>— {item.area}</Text>
        </View>
        <View style={[styles.readyPill, { backgroundColor: theme.cardStrong }]}>
          <Text style={[styles.readyText, { color: theme.gold }]}>{item.careEnabled ? "알림 켬" : "알림 꺼짐"}</Text>
        </View>
        <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
      </View>

      <View style={styles.weatherLine}>
        <SunGlyph color={theme.gold} />
        <Text style={[styles.tempText, { color: theme.text }]}>{item.originTemp}°</Text>
        <Text style={[styles.arrowText, { color: theme.subtle }]}>›</Text>
        <Text style={[styles.tempText, { color: theme.text }]}>{item.destinationTemp}°</Text>
        <Text style={[styles.diffText, { color: accent }]}>{formatTempDiff(item.destinationTemp - item.originTemp)}</Text>
      </View>

      <View style={styles.destinationBottom}>
        <Text style={[styles.timeText, { color: theme.subtle }]} numberOfLines={1}>출발 {item.departureTime}</Text>
        <Text style={[styles.timeText, { color: theme.subtle }]} numberOfLines={1}>도착 {item.arrivalTime}</Text>
        <Text style={[styles.warningText, { color: accent }]} numberOfLines={1}>{getDestinationWarningText(item)}</Text>
      </View>

      <View style={[styles.cardHintRow, { borderTopColor: theme.border }]}>
        <Text style={[styles.cardHintText, { color: theme.subtle }]}>탭해서 날씨와 출발 준비 보기</Text>
      </View>
    </Pressable>
  );
}

function RemovedDestinationBanner({
  destinationName,
  onRestore,
  theme,
}: {
  destinationName: string;
  onRestore: () => void;
  theme: AppTheme;
}) {
  return (
    <View style={[styles.removedBanner, { backgroundColor: theme.cardStrong, borderColor: theme.warm }]}>
      <View style={styles.removedCopy}>
        <Text style={[styles.resultTitle, { color: theme.warm }]}>목적지 삭제됨</Text>
        <Text style={[styles.resultBody, { color: theme.muted }]}>{destinationName}을 다시 복구할 수 있어요</Text>
      </View>
      <Pressable accessibilityLabel={`${destinationName} 목적지 복구`} accessibilityRole="button" onPress={onRestore} style={[styles.restoreButton, { backgroundColor: theme.gold }]}>
        <Text style={[styles.restoreButtonText, { color: theme.onAccent }]}>복구</Text>
      </Pressable>
    </View>
  );
}

function ResultBanner({
  title,
  body,
  tone,
  theme,
}: {
  title: string;
  body: string;
  tone: "clear" | "warm";
  theme: AppTheme;
}) {
  const accent = tone === "clear" ? theme.clear : theme.warm;
  return (
    <View style={[styles.resultBanner, { backgroundColor: theme.cardStrong, borderColor: accent }]}>
      <Text style={[styles.resultTitle, { color: accent }]}>{title}</Text>
      <Text style={[styles.resultBody, { color: theme.muted }]}>{body}</Text>
    </View>
  );
}

function Segment({ label, active, theme }: { label: string; active: boolean; theme: AppTheme }) {
  return (
    <View style={[styles.segment, { backgroundColor: active ? theme.cardStrong : "rgba(16,36,63,0.42)" }]}>
      <Text style={[styles.segmentText, { color: active ? theme.gold : theme.subtle }]}>{label}</Text>
    </View>
  );
}

function buildDestinationCards(
  savedDestinations: P0ScreenProps["savedDestinations"],
  care: P0ScreenProps["state"]["destinationCare"],
  destinationWeatherById: P0ScreenProps["state"]["destinationWeatherById"],
): DestinationCardModel[] {
  if (!savedDestinations.length) return [];
  const originWeather = care.originWeather;

  return savedDestinations.slice(0, 3).map((destination) => {
    const destinationWeather = destinationWeatherById[destination.place.id] ?? care.destinationWeather;
    const destinationRain = Math.max(destinationWeather.current.rainProbabilityPct, ...destinationWeather.hourly.map((hour) => hour.rainProbabilityPct));
    const destinationWind = Math.max(destinationWeather.current.windMs, ...destinationWeather.hourly.map((hour) => hour.windMs));
    const warning = buildDestinationWarning(destination.place.name, destinationRain, destinationWind, destination.alertCondition);
    const tone = destinationRain >= destination.alertCondition.rainThresholdPct || destinationWind >= destination.alertCondition.windThresholdMs ? "warm" : "clear";
    const schedule = getDestinationSchedule(destination, care);

    return {
      id: destination.place.id,
      title: destination.place.name,
      area: getAreaLabel(destination.place),
      icon: "place",
      originTemp: Math.round(originWeather.current.tempC),
      destinationTemp: Math.round(destinationWeather.current.tempC),
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      warning,
      tone,
      place: destination.place,
      saved: true,
      careEnabled: destination.careEnabled,
      savedAtLabel: destination.savedAtLabel,
    };
  });
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
    const skipped = permissionGateResult.message.includes("나중에");
    return {
      title: skipped ? "목적지 저장 완료" : "목적지 알림 준비 완료",
      body: skipped ? "알림 권한은 나중에 켜도 목적지 비교는 바로 사용할 수 있어요" : "출발 시간과 강수 알림을 목적지 기준으로 계산해요",
      tone: skipped ? "warm" : "clear",
    };
  }
  if (accountGateResult?.returnTo === "G1" && accountGateResult.pendingAction === "destination-care" && hasDestinations) {
    return {
      title: "목적지 저장 완료",
      body: "저장한 목적지를 눌러 날씨 비교와 출발 준비를 확인해요",
      tone: "clear",
    };
  }
  return null;
}

function getAreaLabel(place: PlaceSearchResult) {
  if (place.countryCode === "JP") return "일본";
  if (place.countryCode === "GLOBAL") return "해외";
  const parts = place.address.split(" ").filter(Boolean);
  const province = parts[0] ?? "";
  const city = parts[1] ?? "";
  if (city && !city.endsWith("도") && city !== "County") return city;
  if (province) return province.replace(/특별시|광역시|특별자치시|특별자치도|시$/u, "");
  return "목적지";
}

function formatTempDiff(value: number) {
  if (value > 0) return `+${value}°`;
  if (value === 0) return "±0°";
  return `${value}°`;
}

function getDestinationWarningText(item: DestinationCardModel) {
  if (item.savedAtLabel === "방금 저장") return "방금 저장됨";
  if (item.savedAtLabel === "업데이트됨") return "방금 업데이트됨";
  if (item.savedAtLabel === "복구됨") return "방금 복구됨";
  return item.warning;
}

function getDestinationSchedule(destination: P0ScreenProps["savedDestinations"][number], care: P0ScreenProps["state"]["destinationCare"]) {
  const targetArrivalTime = destination.schedulePreference.targetArrivalTime;
  const travelMinutes = destination.travelEstimate.travelMinutes || care.departureAdvice?.travelMinutes || 40;
  const bufferMinutes = destination.schedulePreference.bufferMinutes;
  return {
    arrivalTime: targetArrivalTime,
    departureTime: subtractMinutes(targetArrivalTime, travelMinutes + bufferMinutes),
  };
}

function getRecommendedDepartureTime(care: P0ScreenProps["state"]["destinationCare"]) {
  const targetArrivalTime = care.departureAdvice?.targetArrivalTime;
  const travelMinutes = care.departureAdvice?.travelMinutes;
  const bufferMinutes = care.departureAdvice?.bufferMinutes ?? 10;
  if (!targetArrivalTime || !travelMinutes) return care.departureAdvice?.recommendedDepartureTime ?? "08:10";
  return care.departureAdvice?.recommendedDepartureTime ?? subtractMinutes(targetArrivalTime, travelMinutes + bufferMinutes);
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

function SearchGlyph({ color }: { color: string }) {
  return (
    <View style={styles.searchGlyph} accessibilityElementsHidden>
      <View style={[styles.searchCircle, { borderColor: color }]} />
      <View style={[styles.searchHandle, { backgroundColor: color }]} />
    </View>
  );
}

function SunGlyph({ color }: { color: string }) {
  return (
    <View style={styles.sunGlyph} accessibilityElementsHidden>
      <View style={[styles.sunCore, { borderColor: color }]} />
      <View style={[styles.sunRayVertical, { backgroundColor: color }]} />
      <View style={[styles.sunRayHorizontal, { backgroundColor: color }]} />
    </View>
  );
}

function PlaceGlyph({ type, color }: { type: DestinationCardModel["icon"]; color: string }) {
  const source = type === "place" ? uiIconAssets.pin : uiIconAssets.pin;
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
    gap: spacing.sm,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 112,
    minHeight: "100%",
  },
  atmosphere: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -110,
    height: 300,
    opacity: 0.72,
    borderTopLeftRadius: 160,
    borderTopRightRadius: 160,
  },
  header: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
    letterSpacing: 0,
  },
  searchRail: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 14,
    borderRadius: radius.md,
  },
  searchGlyph: {
    width: 18,
    height: 18,
  },
  searchCircle: {
    position: "absolute",
    left: 1,
    top: 1,
    width: 11,
    height: 11,
    borderWidth: 1.4,
    borderRadius: 7,
  },
  searchHandle: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 7,
    height: 1.5,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  searchText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  todayCard: {
    gap: spacing.sm,
    padding: 16,
    borderRadius: radius.lg,
    borderLeftWidth: 2,
  },
  resultBanner: {
    gap: 4,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderLeftWidth: 2,
  },
  resultTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  resultBody: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  removedBanner: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderLeftWidth: 2,
  },
  removedCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  restoreButton: {
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  restoreButtonText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  todayTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  todayLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  todayTitle: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  alertPill: {
    minWidth: 60,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  alertPillText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  segmentRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  segmentText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  todayHint: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  destinationList: {
    gap: spacing.sm,
  },
  destinationCard: {
    gap: spacing.sm,
    padding: 16,
    borderRadius: radius.lg,
    borderLeftWidth: 2,
    borderWidth: 1,
  },
  emptyCard: {
    gap: spacing.md,
    padding: 16,
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
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  emptyBody: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  destinationTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  destinationTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  destinationName: {
    flexShrink: 1,
    minWidth: 0,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  destinationArea: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  readyPill: {
    minWidth: 60,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  readyText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  chevron: {
    fontSize: 19,
    lineHeight: 22,
    fontWeight: "700",
  },
  weatherLine: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  tempText: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  arrowText: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  diffText: {
    marginLeft: spacing.xs,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  destinationBottom: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  timeText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  warningText: {
    marginLeft: "auto",
    flexShrink: 1,
    minWidth: 0,
    maxWidth: "100%",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  cardHintRow: {
    minHeight: 34,
    justifyContent: "flex-end",
    borderTopWidth: 1,
    paddingTop: spacing.xs,
  },
  cardHintText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
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
    width: 20,
    height: 20,
    flexShrink: 0,
  },
});
