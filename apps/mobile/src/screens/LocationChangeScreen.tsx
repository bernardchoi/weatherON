import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing } from "../theme/tokens";

export function LocationChangeScreen({
  state,
  accountLinked,
  locationReady,
  weatherLocationMode,
  deviceLocationState,
  savedDestinations,
  selectedDestinationPlace,
  placeSearchQuery,
  placeSearchResults,
  isPlaceSearchLoading,
  placeSearchStatus,
  onNavigate,
  onRequireAccount,
  onRequestCurrentLocation,
  onSearchPlaces,
  onSelectWeatherLocation,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const locationCopy = getLocationCopy(locationReady, weatherLocationMode);
  const hasSavedDestinations = savedDestinations.length > 0;
  const hasSearchQuery = placeSearchQuery.trim().length >= 2;
  const searchMode = hasSearchQuery || isPlaceSearchLoading || placeSearchStatus === "error";
  const listedPlaces = searchMode ? placeSearchResults.slice(0, 3) : hasSavedDestinations ? savedDestinations.map((item) => item.place) : placeSearchResults.slice(0, 3);
  const activeWeatherPlace = listedPlaces.find((place) => place.id === state.weather.locationId) ?? null;
  const canApplyPlace = Boolean(activeWeatherPlace);
  const selectedLocationName = activeWeatherPlace?.name ?? state.weather.locationName;
  const locationSectionTitle = searchMode ? "검색 결과" : hasSavedDestinations ? "저장한 위치" : "검색 결과";
  const locationSectionMeta = getLocationSectionMeta(searchMode, placeSearchStatus, isPlaceSearchLoading, placeSearchResults.length, hasSavedDestinations, savedDestinations.length);
  const addLocationLabel = accountLinked ? "새 위치 저장" : "계정 연결하고 위치 저장";
  const canClearSearch = placeSearchQuery.length > 0 && listedPlaces.length === 0 && placeSearchStatus !== "loading";
  const showShortQueryHint = placeSearchQuery.length > 0 && !hasSearchQuery && !isPlaceSearchLoading;
  const currentLocationAction =
    deviceLocationState.status === "requesting" ? "현재 위치 확인 중" : locationCopy.currentAction;
  const currentLocationStatus = getDeviceLocationStatusCopy(deviceLocationState.status, deviceLocationState.message);

  const selectPlace = (place: typeof selectedDestinationPlace) => {
    onSelectWeatherLocation(place);
    onNavigate("H1");
  };
  const applySelectedPlace = () => {
    if (!activeWeatherPlace) return;
    onSelectWeatherLocation(activeWeatherPlace);
    onNavigate("H1");
  };

  return (
    <AppScreen title="위치 변경" subtitle="현재 날씨 기준 위치를 선택하세요" badge={accountLinked ? "계정 연결됨" : "게스트"} showWordmark={false}>
      <View style={[styles.searchBox, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}>
        <SearchGlyph color={theme.subtle} />
        <TextInput
          accessibilityLabel="동 읍 면 검색"
          value={placeSearchQuery}
          onChangeText={onSearchPlaces}
          placeholder="동/읍/면 또는 장소 검색"
          placeholderTextColor={theme.subtle}
          style={[styles.searchInput, { color: theme.text }]}
        />
      </View>
      {showShortQueryHint ? (
        <View style={[styles.searchHint, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}>
          <Text style={[styles.searchHintText, { color: theme.subtle }]}>2글자 이상 입력하면 위치 후보를 검색함</Text>
          <LocationRecoveryButton label="검색어 지우기" accessibilityLabel="위치 검색어 지우기" onPress={() => onSearchPlaces("")} compact />
        </View>
      ) : null}

      <Pressable
        accessibilityLabel={`현재 위치 사용, ${currentLocationAction}`}
        accessibilityRole="button"
        onPress={onRequestCurrentLocation}
        style={[
          styles.currentRow,
          { backgroundColor: theme.cardStrong, borderColor: locationReady && weatherLocationMode === "auto" ? theme.clear : theme.border },
          cardShadow(theme),
        ]}
      >
        <View style={[styles.weatherIcon, { backgroundColor: theme.cardMuted, borderColor: theme.clear }]}>
          <CurrentLocationGlyph color={theme.clear} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.text }]}>현재 위치 사용</Text>
          <Text style={[styles.meta, { color: theme.muted }]}>{currentLocationAction}</Text>
          {currentLocationStatus ? <Text style={[styles.stateHint, { color: theme.subtle }]}>{currentLocationStatus}</Text> : null}
        </View>
        <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
      </Pressable>

      <View style={styles.group}>
        <View style={styles.groupHeader}>
          <Text style={[styles.groupTitle, { color: theme.muted }]}>{locationSectionTitle}</Text>
          <Text style={[styles.groupMeta, { color: theme.subtle }]}>{locationSectionMeta}</Text>
        </View>
        <View style={[styles.savedPanel, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}>
          {listedPlaces.length > 0 ? (
            listedPlaces.map((place, index) => (
              <Pressable
                accessibilityLabel={`${place.name} 위치로 홈 날씨 기준 변경`}
                accessibilityRole="button"
                key={place.id}
                onPress={() => selectPlace(place)}
                style={[styles.savedRow, index < listedPlaces.length - 1 ? { borderBottomColor: theme.border, borderBottomWidth: 1 } : null]}
              >
                <View style={[styles.weatherIcon, { backgroundColor: theme.cardMuted, borderColor: place.id === state.weather.locationId ? theme.gold : theme.border }]}>
                  <Text style={[styles.weatherGlyph, { color: place.id === state.weather.locationId ? theme.gold : theme.subtle }]}>
                    {place.name.slice(0, 1)}
                  </Text>
                </View>
                <View style={styles.copy}>
                  <View style={styles.inline}>
                    <Text style={[styles.title, { color: theme.text }]}>{place.name}</Text>
                    {place.id === state.weather.locationId ? <StatusPill label="현재" tone="clear" /> : null}
                  </View>
                  <Text style={[styles.meta, { color: theme.muted }]}>{place.address}</Text>
                </View>
                <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyResult}>
              <Text style={[styles.title, { color: theme.text }]}>{getLocationEmptyTitle(placeSearchStatus, searchMode)}</Text>
              <Text style={[styles.meta, { color: theme.muted }]}>{getLocationEmptyBody(placeSearchStatus, searchMode)}</Text>
              {placeSearchStatus === "error" ? (
                <LocationRecoveryButton label="다시 검색" accessibilityLabel="위치 검색 다시 시도" onPress={() => onSearchPlaces(placeSearchQuery)} />
              ) : null}
              {canClearSearch ? (
                <LocationRecoveryButton label="검색어 지우기" accessibilityLabel="위치 검색어 지우기" onPress={() => onSearchPlaces("")} />
              ) : null}
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          label="홈에 적용"
          accessibilityLabel={`${selectedLocationName} 위치를 홈 날씨 기준으로 적용`}
          onPress={applySelectedPlace}
          tone="warning"
          disabled={!canApplyPlace}
        />
      </View>

      <Pressable
        accessibilityLabel={addLocationLabel}
        accessibilityRole="button"
        onPress={() => (accountLinked ? onNavigate("P1") : onRequireAccount("destination-care", "H2"))}
        style={[styles.addRow, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}
      >
        <Text style={[styles.addPlus, { color: theme.subtle }]}>＋</Text>
        <Text style={[styles.addText, { color: theme.muted }]}>{addLocationLabel}</Text>
      </Pressable>

      <View style={[styles.statusBox, { backgroundColor: theme.cardStrong }, cardShadow(theme)]}>
        <Text style={[styles.statusTitle, { color: theme.clear }]}>{locationCopy.statusTitle}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>
          {isPlaceSearchLoading ? "검색 중" : `${state.weather.locationName} 기준 · ${locationCopy.statusBody(hasSavedDestinations, savedDestinations.length)}`}
        </Text>
        <Text style={[styles.stateHint, { color: theme.subtle }]}>
          {activeWeatherPlace ? `선택 위치 · ${activeWeatherPlace.name}` : "목록에서 위치를 선택해 적용"}
        </Text>
      </View>
    </AppScreen>
  );
}

function SearchGlyph({ color }: { color: string }) {
  return (
    <View style={styles.searchGlyph} accessibilityElementsHidden>
      <View style={[styles.searchCircle, { borderColor: color }]} />
      <View style={[styles.searchHandle, { backgroundColor: color }]} />
    </View>
  );
}

function CurrentLocationGlyph({ color }: { color: string }) {
  return (
    <View style={styles.locationGlyph} accessibilityElementsHidden>
      <View style={[styles.locationRing, { borderColor: color }]} />
      <View style={[styles.locationCore, { backgroundColor: color }]} />
    </View>
  );
}

function LocationRecoveryButton({
  label,
  accessibilityLabel,
  onPress,
  compact = false,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  compact?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.recoveryButton, compact ? styles.recoveryButtonCompact : null, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}
    >
      <Text style={[styles.recoveryButtonText, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

function getLocationSectionMeta(
  searchMode: boolean,
  status: P0ScreenProps["placeSearchStatus"],
  loading: boolean,
  resultCount: number,
  hasSavedDestinations: boolean,
  savedCount: number,
) {
  if (loading || status === "loading") return "검색 중";
  if (searchMode && status === "error") return "연결 실패";
  if (searchMode) return `${resultCount}곳 검색됨`;
  return hasSavedDestinations ? `${savedCount}곳 저장됨` : "저장 전 · 선택하면 홈 날씨 기준으로 적용";
}

function getLocationEmptyTitle(status: P0ScreenProps["placeSearchStatus"], searchMode: boolean) {
  if (status === "loading") return "검색 중";
  if (status === "error") return "검색 연결 실패";
  return searchMode ? "검색 결과 없음" : "위치를 검색해 주세요";
}

function getLocationEmptyBody(status: P0ScreenProps["placeSearchStatus"], searchMode: boolean) {
  if (status === "loading") return "위치 후보를 불러오는 중";
  if (status === "error") return "검색어는 유지됨 · 다시 검색하거나 지워서 새로 시작 가능";
  return searchMode ? "다른 장소명이나 지역명을 입력하거나 검색어를 지워 다시 시작" : "검색하거나 현재 위치를 허용해 홈 날씨 기준을 정할 수 있음";
}

function getLocationCopy(
  locationReady: boolean,
  weatherLocationMode: P0ScreenProps["weatherLocationMode"],
) {
  if (locationReady && weatherLocationMode === "auto") {
    return {
      currentAction: "GPS 자동 감지 가능",
      statusTitle: "현재 위치",
      statusBody: (hasSavedDestinations: boolean, count: number) => (hasSavedDestinations ? `저장 위치 ${count}곳` : "GPS 기준 적용 중"),
    };
  }
  if (weatherLocationMode === "manual") {
    return {
      currentAction: "수동 위치 적용 중 · GPS 없이도 홈 날씨 기준 유지",
      statusTitle: "수동 위치",
      statusBody: (hasSavedDestinations: boolean, count: number) => (hasSavedDestinations ? `저장 위치 ${count}곳` : "검색 위치를 홈 기준으로 적용 중"),
    };
  }
  return {
    currentAction: "권한 확인 필요 · 수동 위치도 선택 가능",
    statusTitle: "위치 확인",
    statusBody: (hasSavedDestinations: boolean, count: number) => (hasSavedDestinations ? `저장 위치 ${count}곳` : "선택 위치 적용 가능"),
  };
}

function getDeviceLocationStatusCopy(status: P0ScreenProps["deviceLocationState"]["status"], message: string) {
  if (status === "idle") return "";
  if (status === "granted") return message;
  if (status === "requesting") return "기기 위치를 확인하는 중";
  if (status === "denied") return "권한 거부됨 · 수동 위치로 계속 가능";
  if (status === "unavailable") return "위치 서비스 꺼짐 · 수동 위치로 계속 가능";
  return "위치 확인 실패 · 수동 위치로 계속 가능";
}

const styles = StyleSheet.create({
  searchBox: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  searchGlyph: {
    width: 20,
    height: 20,
  },
  searchCircle: {
    position: "absolute",
    left: 1,
    top: 1,
    width: 12,
    height: 12,
    borderWidth: 1.8,
    borderRadius: 999,
  },
  searchHandle: {
    position: "absolute",
    left: 12,
    top: 13,
    width: 8,
    height: 1.8,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  locationGlyph: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  locationRing: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.8,
  },
  locationCore: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    fontSize: 15,
    fontWeight: "800",
    outlineStyle: "none" as never,
  },
  searchHint: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: -spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  searchHintText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  currentRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  weatherIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  weatherGlyph: {
    fontSize: 13,
    fontWeight: "900",
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  meta: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  stateHint: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  chevron: {
    fontSize: 24,
    fontWeight: "700",
  },
  group: {
    gap: spacing.sm,
  },
  groupHeader: {
    gap: 3,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: "900",
  },
  groupMeta: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  savedPanel: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  savedRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  emptyResult: {
    gap: 4,
    padding: spacing.md,
  },
  recoveryButton: {
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginTop: spacing.xs,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  recoveryButtonCompact: {
    minHeight: 34,
    marginTop: 0,
  },
  recoveryButtonText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  actions: {
    gap: spacing.sm,
  },
  addRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addPlus: {
    fontSize: 22,
    fontWeight: "800",
  },
  addText: {
    fontSize: 14,
    fontWeight: "900",
  },
  statusBox: {
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: "900",
  },
});
