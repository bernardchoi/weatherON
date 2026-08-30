import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { recommendOutfit, type PlaceSearchResult, type UserPreferenceProfile } from "@weatheron/shared";
import { AppButton } from "../components/AppButton";
import { FeedbackPressable } from "../components/FeedbackPressable";
import { MaterialSnackbar } from "../components/MaterialSnackbar";
import { getOutfitImageSource, uiIconAssets } from "../assets";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { cardShadow, radius, spacing, type AppTheme } from "../theme/tokens";
import { formatTemperature, formatTemperatureDelta } from "../utils/units";
import { getTravelMinutesForTransport } from "../utils/travelEstimate";
import { getOutfitVariantLabel } from "../utils/outfitLabels";
import { toUserPreferenceProfile } from "../utils/preferenceProfile";

type DestinationCardModel = {
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
  repeatLabel: string;
  warning: string;
  outfitTitle: string;
  outfitMatchPct: number;
  outfitItems: Array<{ id: string; name: string; imageUrl?: string }>;
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
  permissionReady,
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
}: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const care = state.destinationCare;
  const preferenceProfile = toUserPreferenceProfile({ styleGender, ageBand, fitPreference, selectedStyles, smartCareScenario });
  const destinationCards = buildDestinationCards(savedDestinations, care, state.destinationWeatherById, temperatureUnit, wardrobeItems, preferenceProfile);
  const alertCount = permissionReady ? destinationCards.filter((item) => item.careEnabled).length : 0;
  const hasDestinations = destinationCards.length > 0;
  const alertLabel = hasDestinations ? `알림 ${alertCount}/${destinationCards.length}` : "알림 0";
  const resultBanner = getDestinationResultBanner(accountGateResult, permissionGateResult, hasDestinations);
  const recommendedDepartureTime = getRecommendedDepartureTime(care);

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            width: "100%",
            maxWidth: layout.contentMaxWidth,
            gap: layout.destinationContentGap,
            paddingHorizontal: layout.screenHorizontalPadding,
            paddingTop: layout.weatherTopPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.atmosphere, !hasDestinations ? styles.atmosphereEmpty : null, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
                fontSize: layout.screenTitleFontSize,
                lineHeight: layout.screenTitleLineHeight,
              },
            ]}
          >
            출발
          </Text>
        </View>

        <FeedbackPressable
          accessibilityLabel={hasDestinations ? "오늘 출발 준비 상세 보기" : "첫 목적지 추가"}
          accessibilityRole="button"
          onPress={() => {
            if (hasDestinations) {
              onSelectDestinationPlace(destinationCards[0].place);
              onNavigate("G2");
              return;
            }
            onNavigate("P1");
          }}
          style={[
            styles.todayCard,
            { padding: layout.destinationPanelPadding, backgroundColor: theme.card, borderLeftColor: theme.clear },
            cardShadow(theme),
          ]}
        >
          <View style={styles.todayTop}>
            <View>
              <Text style={[styles.todayLabel, { color: theme.subtle }]}>오늘 준비</Text>
              <Text style={[styles.todayTitle, { color: theme.text }]}>{hasDestinations ? "알아서 챙기는 중" : "목적지 추가 대기"}</Text>
            </View>
            <View style={[styles.alertPill, { backgroundColor: theme.cardStrong }]}>
              <Text style={[styles.alertPillText, { color: theme.clear }]}>{alertLabel}</Text>
            </View>
          </View>
          <View style={[styles.prepMetricStrip, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <PrepMetric label="날씨 비교" value={hasDestinations ? `${destinationCards.length}곳` : "대기"} icon={uiIconAssets.check} theme={theme} />
            <PrepMetric label="출발" value={hasDestinations ? recommendedDepartureTime : "필요"} icon={uiIconAssets.clock} theme={theme} />
            <PrepMetric label="비 완화" value={hasDestinations ? "확인" : "대기"} icon={uiIconAssets.rain} theme={theme} />
          </View>
          <Text style={[styles.todayHint, { color: theme.subtle }]}>
            {hasDestinations ? "탭하면 상세 준비 확인" : "추가하면 출발·강수 자동 계산"}
          </Text>
        </FeedbackPressable>

        <View style={styles.destinationList}>
          {hasDestinations ? (
            destinationCards.map((item) => (
              <DestinationCard
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
              style={[styles.addDestinationRail, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
            >
              <Text style={[styles.addDestinationIcon, { color: theme.clear }]}>+</Text>
              <Text style={[styles.addDestinationText, { color: theme.clear }]}>목적지 추가</Text>
            </FeedbackPressable>
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
          duration={3800}
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
      style={[
        styles.emptyCard,
        {
          padding: panelPadding,
          backgroundColor: theme.card,
          borderLeftColor: theme.clear,
          borderColor: theme.border,
        },
        cardShadow(theme),
      ]}
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
          icon={uiIconAssets.clock}
          title="출발 시간"
          body="도착 시간 기준 계산"
          color={theme.clear}
          theme={theme}
          accessibilityLabel="목적지 추가하고 출발 시간 계산"
          onPress={onAdd}
        />
        <EmptyBenefit
          icon={uiIconAssets.rain}
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
      style={[styles.emptyBenefit, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
    >
      <Image source={icon} style={[styles.emptyBenefitIcon, { tintColor: color }]} resizeMode="contain" />
      <View style={styles.emptyBenefitCopy}>
        <Text style={[styles.emptyBenefitTitle, { color: theme.text }]} numberOfLines={1}>{title}</Text>
        <Text style={[styles.emptyBenefitBody, { color: theme.subtle }]} numberOfLines={1}>{body}</Text>
      </View>
    </FeedbackPressable>
  );
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
      style={[
        styles.destinationCard,
        {
          backgroundColor: theme.card,
          borderLeftColor: accent,
          borderColor: selected ? selectedAccent : "transparent",
          paddingHorizontal,
          paddingVertical,
        },
        cardShadow(theme),
      ]}
    >
      <FeedbackPressable
        accessibilityLabel={`${item.title} 목적지 상세 보기`}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onOpen}
        style={styles.destinationMainButton}
      >
        <View style={styles.destinationTop}>
          <View style={[styles.destinationIconFrame, { backgroundColor: `${accent}18` }]}>
            <PlaceGlyph type={item.icon} color={accent} />
          </View>
          <View style={styles.destinationTitleColumn}>
            <View style={styles.destinationNameRow}>
              {selected ? <Image source={uiIconAssets.check} style={[styles.destinationSelectedCheck, { tintColor: selectedAccent }]} resizeMode="contain" /> : null}
              <Text style={[styles.destinationName, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
            </View>
            <Text style={[styles.destinationArea, { color: theme.subtle }]} numberOfLines={2}>{item.area}</Text>
          </View>
          <View style={[styles.readyPill, { backgroundColor: theme.cardStrong }]}>
            <Text style={[styles.readyText, { color: statusColor }]}>{getAlertPillLabel(item.careEnabled, permissionReady)}</Text>
          </View>
          <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
        </View>

        <View style={styles.destinationSummaryRow}>
          <View style={styles.destinationWeatherLine}>
            <SunGlyph color={theme.clear} />
            <Text style={[styles.signalText, { color: theme.text }]} numberOfLines={1}>
              {item.originTemp} → {item.destinationTemp}
            </Text>
            <Text style={[styles.diffText, { color: warningColor }]} numberOfLines={1}>{item.tempDiff}</Text>
          </View>
          <View style={[styles.rainPill, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <Image source={uiIconAssets.rain} style={[styles.rainPillIcon, { tintColor: warningColor }]} resizeMode="contain" />
            <Text style={[styles.rainPillText, { color: warningColor }]} numberOfLines={1}>{item.rainPct}</Text>
          </View>
        </View>

        <View style={styles.destinationPrepRow}>
          <CompactSignal icon={uiIconAssets.clock} label={item.departureTime} color={theme.clear} theme={theme} />
          <CompactSignal icon={uiIconAssets.rain} label={item.rainPct} color={warningColor} theme={theme} />
          <OutfitSignal item={item} theme={theme} />
        </View>

        <View style={styles.destinationFooterRow}>
          <Text style={[styles.warningText, { color: warningColor }]} numberOfLines={1}>{getDestinationActionText(item)}</Text>
          <Text style={[styles.repeatText, { color: theme.subtle }]} numberOfLines={1}>{item.repeatLabel}</Text>
        </View>
      </FeedbackPressable>

    </View>
  );
}

function CompactSignal({
  icon,
  label,
  color,
  theme,
}: {
  icon: number;
  label: string;
  color: string;
  theme: AppTheme;
}) {
  return (
    <View style={[styles.compactSignal, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
      <Image source={icon} style={[styles.compactSignalIcon, { tintColor: color }]} resizeMode="contain" />
      <Text style={[styles.compactSignalText, { color: theme.text }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function OutfitSignal({ item, theme }: { item: DestinationCardModel; theme: AppTheme }) {
  return (
    <View
      accessibilityLabel={`목적지 코디 ${item.outfitTitle}, 매치 ${item.outfitMatchPct}%`}
      style={[styles.outfitSignal, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
    >
      <View style={styles.outfitPreviewStack}>
        {item.outfitItems.slice(0, 3).map((outfitItem, index) => {
          const imageSource = getOutfitImageSource(outfitItem.imageUrl);
          return (
            <View
              key={outfitItem.id}
              style={[
                styles.outfitPreviewBubble,
                index > 0 ? styles.outfitPreviewBubbleOverlap : null,
                { backgroundColor: theme.card, borderColor: theme.cardStrong },
              ]}
            >
              {imageSource ? (
                <Image source={imageSource} style={styles.outfitPreviewImage} resizeMode="contain" />
              ) : (
                <Image source={uiIconAssets.shirt} style={[styles.outfitPreviewFallback, { tintColor: theme.clear }]} resizeMode="contain" />
              )}
            </View>
          );
        })}
      </View>
      <View style={styles.outfitSignalCopy}>
        <Text style={[styles.outfitSignalTitle, { color: theme.text }]} numberOfLines={1}>{item.outfitTitle}</Text>
        <Text style={[styles.outfitSignalMeta, { color: theme.clear }]} numberOfLines={1}>{item.outfitMatchPct}%</Text>
      </View>
    </View>
  );
}

function getAlertPillLabel(careEnabled: boolean, permissionReady: boolean) {
  if (!permissionReady) return "권한 필요";
  return careEnabled ? "알림 켬" : "알림 꺼짐";
}

function getStatusColor(careEnabled: boolean, permissionReady: boolean, theme: AppTheme) {
  if (!permissionReady) return theme.warm;
  if (careEnabled) return theme.clear;
  return theme.subtle;
}

function PrepMetric({ label, value, icon, theme }: { label: string; value: string; icon: number; theme: AppTheme }) {
  const color = theme.clear;
  return (
    <View style={styles.prepMetric}>
      <View style={styles.prepMetricLabelRow}>
        <Image source={icon} style={[styles.prepMetricIcon, { tintColor: color }]} resizeMode="contain" />
        <Text style={[styles.prepMetricLabel, { color: theme.subtle }]} numberOfLines={1}>{label}</Text>
      </View>
      <Text style={[styles.prepMetricValue, { color }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function buildDestinationCards(
  savedDestinations: P0ScreenProps["savedDestinations"],
  care: P0ScreenProps["state"]["destinationCare"],
  destinationWeatherById: P0ScreenProps["state"]["destinationWeatherById"],
  temperatureUnit: P0ScreenProps["temperatureUnit"],
  wardrobeItems: P0ScreenProps["wardrobeItems"],
  preferenceProfile: UserPreferenceProfile,
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
    const outfit = recommendOutfit(destinationWeather, preferenceProfile, wardrobeItems);
    const outfitItems = Object.values(outfit.items).filter(Boolean);

    return {
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
      repeatLabel: getRepeatLabel(destination.schedulePreference),
      warning,
      outfitTitle: getOutfitVariantLabel(outfit.variant),
      outfitMatchPct: outfit.matchPct,
      outfitItems: outfitItems.slice(0, 3).map((item) => ({
        id: item?.id ?? "",
        name: item?.name ?? "",
        imageUrl: item?.imageUrl,
      })),
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
    const skipped = permissionGateResult.denied || permissionGateResult.message.includes("나중에");
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
  if (item.tone === "warm" && item.warning.includes("강수")) return `우산 준비 · ${item.rainPct}`;
  if (item.tone === "warm" && item.warning.includes("바람")) return "바람막이 확인";
  if (!item.careEnabled) return "알림 켜기";
  if (item.savedAtLabel === "방금 저장") return "출발·강수 기준 확인";
  if (item.savedAtLabel === "복구됨") return "복구 알림 확인";
  return "출발 시간 확인";
}

function getDestinationSchedule(destination: P0ScreenProps["savedDestinations"][number], care: P0ScreenProps["state"]["destinationCare"]) {
  const targetArrivalTime = destination.schedulePreference.targetArrivalTime;
  const travelMinutes = getTravelMinutesForTransport(
    destination.travelEstimate,
    destination.schedulePreference.transportMode,
    care.originWeather.countryCode,
    destination.place.countryCode,
    care.originWeather.locationId,
  );
  if (typeof travelMinutes !== "number") {
    return {
      arrivalTime: targetArrivalTime,
      departureTime: "경로 확인 전",
    };
  }
  const bufferMinutes = getAutoBufferMinutes(targetArrivalTime, travelMinutes);
  return {
    arrivalTime: targetArrivalTime,
    departureTime: subtractMinutes(targetArrivalTime, travelMinutes + bufferMinutes),
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

function getRecommendedDepartureTime(care: P0ScreenProps["state"]["destinationCare"]) {
  const targetArrivalTime = care.departureAdvice?.targetArrivalTime;
  const travelMinutes = care.departureAdvice?.travelMinutes;
  const bufferMinutes = care.departureAdvice?.bufferMinutes ?? 10;
  if (!targetArrivalTime || !travelMinutes) return care.departureAdvice?.recommendedDepartureTime ?? "확인 전";
  return care.departureAdvice?.recommendedDepartureTime ?? subtractMinutes(targetArrivalTime, travelMinutes + bufferMinutes);
}

function getAutoBufferMinutes(targetArrivalTime: string, travelMinutes: number): number {
  const [hourText, minuteText] = targetArrivalTime.split(":");
  const targetMinutes = Number(hourText) * 60 + Number(minuteText);
  if (!Number.isFinite(targetMinutes)) return 10;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const dayMinutes = 24 * 60;
  const freeWindow = (((targetMinutes - currentMinutes) % dayMinutes + dayMinutes) % dayMinutes) - travelMinutes;
  if (freeWindow <= 30) return 0;
  if (freeWindow <= 90) return 5;
  if (freeWindow <= 180) return 10;
  if (freeWindow <= 360) return 15;
  return 20;
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
    paddingBottom: spacing.xl,
    minHeight: "100%",
    alignSelf: "center",
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
  atmosphereEmpty: {
    bottom: -190,
    opacity: 0.26,
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
  todayCard: {
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderLeftWidth: 2,
  },
  todayTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  todayLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  todayTitle: {
    marginTop: 2,
    fontSize: 18,
    lineHeight: 23,
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
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  prepMetricStrip: {
    flexDirection: "row",
    gap: spacing.xs,
    padding: 6,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  prepMetric: {
    flex: 1,
    minHeight: 42,
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: spacing.xs,
  },
  prepMetricLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
  prepMetricLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  prepMetricIcon: {
    width: 14,
    height: 14,
  },
  prepMetricValue: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    letterSpacing: 0,
  },
  todayHint: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  destinationList: {
    gap: spacing.sm,
  },
  secondaryActions: {
    gap: spacing.sm,
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
  destinationTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
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
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  destinationBottom: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  destinationBottomShort: {
    alignItems: "flex-start",
    flexDirection: "column",
  },
  timeLine: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeIcon: {
    width: 13,
    height: 13,
  },
  repeatLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  repeatIcon: {
    width: 11,
    height: 11,
  },
  timeText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  repeatText: {
    flexShrink: 0,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  destinationPrepRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.xs,
  },
  compactSignal: {
    width: 68,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 5,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  compactSignalIcon: {
    width: 15,
    height: 15,
  },
  compactSignalText: {
    maxWidth: "100%",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  outfitSignal: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 7,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  outfitPreviewStack: {
    width: 70,
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
  },
  outfitPreviewBubble: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 2,
  },
  outfitPreviewBubbleOverlap: {
    marginLeft: -16,
  },
  outfitPreviewImage: {
    width: 30,
    height: 30,
  },
  outfitPreviewFallback: {
    width: 18,
    height: 18,
  },
  outfitSignalCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  outfitSignalTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  outfitSignalMeta: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  destinationFooterRow: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  destinationOutfitLine: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  destinationOutfitIcon: {
    width: 16,
    height: 16,
    flexShrink: 0,
  },
  destinationOutfitCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  destinationOutfitLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  destinationOutfitText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
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
