import React from "react";
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../components/AppButton";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";
import { formatDistance } from "../utils/units";

export function DestinationAddScreen({
  state,
  destinationSaved,
  deviceLocationState,
  selectedDestinationPlace,
  placeSearchQuery,
  placeSearchResults,
  isPlaceSearchLoading,
  placeSearchStatus,
  distanceUnit,
  onNavigate,
  onReturnFromDestinationAdd,
  onSaveDestination,
  onSearchPlaces,
  onSelectDestinationPlace,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const [keyboardVisible, setKeyboardVisible] = React.useState(false);
  const selectedCategory = getCategoryLabel(selectedDestinationPlace.category);
  const hasQuery = placeSearchQuery.trim().length >= 2;
  const selectedFromResults = placeSearchResults.some((place) => place.id === selectedDestinationPlace.id);
  const canUseSavedDestination = destinationSaved && (!hasQuery || selectedFromResults);
  const canUseSelectedDestination = canUseSavedDestination || selectedFromResults;
  const resultCount = getResultCountLabel(placeSearchStatus, placeSearchResults.length, hasQuery, isPlaceSearchLoading);
  const ctaLabel = getPrimaryActionLabel(canUseSavedDestination, selectedFromResults, hasQuery);
  const canClearSearch = placeSearchQuery.length > 0 && placeSearchResults.length === 0 && placeSearchStatus !== "loading";
  const duplicateNameCounts = getDuplicateNameCounts(placeSearchResults);

  React.useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handlePrimaryAction = () => {
    if (!canUseSelectedDestination) return;
    if (canUseSavedDestination) {
      onNavigate("G2");
      return;
    }
    onSaveDestination("G2");
  };

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            onPress={onReturnFromDestinationAdd}
            style={[styles.backButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
          >
            <BackGlyph color={theme.subtle} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: theme.text }]}>목적지 추가</Text>
            <Text style={[styles.subtitle, { color: theme.subtle }]}>장소를 검색하고 결과를 선택</Text>
          </View>
        </View>

        <View style={[styles.searchField, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
          <SearchGlyph color={theme.subtle} />
          <TextInput
            accessibilityLabel="목적지 검색어"
            onChangeText={onSearchPlaces}
            placeholder="목적지 장소명 검색"
            placeholderTextColor={theme.subtle}
            style={[styles.input, { color: theme.text }]}
            value={placeSearchQuery}
          />
        </View>

        <View style={[styles.searchStatusRow, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
          <Text style={[styles.searchStatusText, { color: theme.text }]} numberOfLines={1}>
            {getSelectionCopy(canUseSelectedDestination, selectedDestinationPlace.name, hasQuery)}
          </Text>
          <View style={[styles.countPill, { backgroundColor: theme.cardMuted }]}>
            <Text style={[styles.countText, { color: theme.sky }]}>{resultCount}</Text>
          </View>
        </View>

        {canUseSelectedDestination ? (
          <View style={[styles.selectedRail, { backgroundColor: "rgba(255,255,255,0.14)" }]}>
            <Text style={[styles.selectedName, { color: theme.text }]}>{selectedDestinationPlace.name}</Text>
            <View style={[styles.categoryPill, { borderColor: theme.border }]}>
              <CategoryIcon color={theme.muted} />
              <Text style={[styles.categoryText, { color: theme.muted }]}>{selectedCategory}</Text>
            </View>
          </View>
        ) : null}

        {placeSearchResults.length > 0 ? (
          <View style={styles.results}>
            {placeSearchResults.slice(0, 3).map((place) => {
              const selected = selectedDestinationPlace.id === place.id;
              const duplicate = (duplicateNameCounts.get(place.name) ?? 0) > 1;
              return (
                <Pressable
                  accessibilityLabel={`${place.name} 목적지 선택`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={place.id}
                  onPress={() => onSelectDestinationPlace(place)}
                  style={[
                    styles.resultCard,
                    {
                      backgroundColor: selected ? theme.cardStrong : "rgba(255,255,255,0.08)",
                      borderColor: selected ? "rgba(140,207,255,0.56)" : theme.border,
                    },
                  ]}
                >
                  <View style={styles.resultHead}>
                    <View style={styles.resultTitleRow}>
                      <Text style={[styles.resultName, { color: theme.text }]} numberOfLines={1}>{place.name} {selected ? "선택됨" : ""}</Text>
                      {duplicate ? (
                        <View style={[styles.smallPill, { borderColor: theme.border }]}>
                          <Text style={[styles.smallPillText, { color: theme.gold }]}>동명이름</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.resultMeta, { color: selected ? theme.sky : theme.subtle }]} numberOfLines={1}>
                      {getCategoryLabel(place.category)} · {getPlaceDistanceLabel(place, deviceLocationState.location, state.weather.countryCode, distanceUnit)} · {getProviderLabel(place.provider)}
                    </Text>
                    <Text style={[styles.resultAddress, { color: theme.muted }]} numberOfLines={2}>{place.address || getCountryLabel(place.countryCode)}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <Text style={[styles.resultName, { color: theme.text }]}>{getEmptyTitle(placeSearchStatus, hasQuery)}</Text>
            <Text style={[styles.resultBody, { color: theme.muted }]}>
              {getEmptyBody(placeSearchStatus, hasQuery)}
            </Text>
            {placeSearchStatus === "error" ? (
              <SearchRecoveryButton label="다시 시도" accessibilityLabel="목적지 검색 다시 시도" onPress={() => onSearchPlaces(placeSearchQuery)} />
            ) : null}
            {canClearSearch ? (
              <SearchRecoveryButton label="검색어 지우기" accessibilityLabel="목적지 검색어 지우기" onPress={() => onSearchPlaces("")} />
            ) : null}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {keyboardVisible ? null : (
        <View style={[styles.footer, { backgroundColor: theme.background }]}>
          <AppButton label={ctaLabel} accessibilityLabel={ctaLabel} onPress={handlePrimaryAction} tone="warning" disabled={!canUseSelectedDestination} />
        </View>
      )}
    </View>
  );
}

function SearchRecoveryButton({ label, accessibilityLabel, onPress }: { label: string; accessibilityLabel: string; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.retryButton, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}
    >
      <Text style={[styles.retryButtonText, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

function getResultCountLabel(status: P0ScreenProps["placeSearchStatus"], count: number, hasQuery: boolean, loading: boolean) {
  if (loading || status === "loading") return "검색 중";
  if (status === "error") return "연결 실패";
  if (hasQuery) return `${count}건`;
  return "검색 전";
}

function getPrimaryActionLabel(canUseSavedDestination: boolean, selectedFromResults: boolean, hasQuery: boolean) {
  if (canUseSavedDestination) return "목적지 비교 보기";
  if (selectedFromResults) return "목적지 저장하고 비교";
  return hasQuery ? "검색 결과 선택 필요" : "장소 선택 필요";
}

function getSelectionCopy(canUseSelectedDestination: boolean, selectedName: string, hasQuery: boolean) {
  if (canUseSelectedDestination) return `${selectedName} 선택됨`;
  return hasQuery ? "검색 결과에서 목적지 선택" : "장소명 2글자 이상 입력";
}

function getEmptyTitle(status: P0ScreenProps["placeSearchStatus"], hasQuery: boolean) {
  if (status === "loading") return "검색 중";
  if (status === "error") return "검색 연결 실패";
  if (hasQuery) return "검색 결과 없음";
  return "장소를 검색해 주세요";
}

function getEmptyBody(status: P0ScreenProps["placeSearchStatus"], hasQuery: boolean) {
  if (status === "loading") return "장소 목록을 불러오는 중";
  if (status === "error") return "다시 시도하거나 검색어를 지워 주세요";
  if (hasQuery) return "다른 이름이나 더 넓은 지역명으로 검색";
  return "검색 결과에서 주소와 국가를 확인 후 선택";
}

function getDuplicateNameCounts(results: P0ScreenProps["placeSearchResults"]) {
  const counts = new Map<string, number>();
  for (const place of results) {
    counts.set(place.name, (counts.get(place.name) ?? 0) + 1);
  }
  return counts;
}

function getCategoryLabel(category: string) {
  if (category === "sports") return "야구장";
  if (category === "mountain") return "등산";
  if (category === "beach") return "해변";
  if (category === "airport") return "공항";
  if (category === "hotel") return "숙소";
  return "장소";
}

function getCategoryDetail(category: string) {
  if (category === "sports") return "스포츠";
  if (category === "mountain") return "산";
  if (category === "beach") return "바다";
  if (category === "airport") return "이동";
  if (category === "hotel") return "여행";
  return "카테고리";
}

function getCountryLabel(countryCode: string) {
  if (countryCode === "KR") return "한국";
  if (countryCode === "JP") return "일본";
  return "국가 확인";
}

function getPlaceDistanceLabel(
  place: P0ScreenProps["placeSearchResults"][number],
  origin: P0ScreenProps["deviceLocationState"]["location"],
  currentCountryCode: P0ScreenProps["state"]["weather"]["countryCode"],
  distanceUnit: P0ScreenProps["distanceUnit"],
) {
  if (!origin) return place.countryCode === currentCountryCode ? "거리 확인 불가" : getCountryLabel(place.countryCode);
  if (place.countryCode !== origin.countryCode) return "해외";
  return formatDistance(getCoordinateDistanceMeters(origin.coordinate, place.coordinate), distanceUnit);
}

function getCoordinateDistanceMeters(
  origin: NonNullable<P0ScreenProps["deviceLocationState"]["location"]>["coordinate"],
  destination: P0ScreenProps["placeSearchResults"][number]["coordinate"],
) {
  const earthRadiusMeters = 6371000;
  const lat1 = toRadians(origin.latitude);
  const lat2 = toRadians(destination.latitude);
  const deltaLat = toRadians(destination.latitude - origin.latitude);
  const deltaLon = toRadians(destination.longitude - origin.longitude);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getProviderLabel(provider: string) {
  if (provider === "kakao") return "Kakao";
  if (provider === "google") return "Google";
  if (provider === "openmeteo") return "좌표 검색";
  return "추천";
}

function BackGlyph({ color }: { color: string }) {
  return (
    <View style={styles.backGlyph} accessibilityElementsHidden>
      <View style={[styles.backLineTop, { backgroundColor: color }]} />
      <View style={[styles.backLineBottom, { backgroundColor: color }]} />
    </View>
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

function CategoryIcon({ color }: { color: string }) {
  return (
    <View style={[styles.categoryIcon, { borderColor: color }]} accessibilityElementsHidden>
      <View style={[styles.categoryIconLine, { backgroundColor: color }]} />
    </View>
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
    minHeight: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 178,
  },
  atmosphere: {
    position: "absolute",
    left: -28,
    right: -28,
    top: 126,
    height: 520,
    opacity: 0.34,
    borderRadius: 72,
  },
  header: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  backGlyph: {
    width: 16,
    height: 16,
  },
  backLineTop: {
    position: "absolute",
    left: 3,
    top: 5,
    width: 9,
    height: 1.8,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }],
  },
  backLineBottom: {
    position: "absolute",
    left: 3,
    top: 10,
    width: 9,
    height: 1.8,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "900",
    letterSpacing: 0,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  searchField: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
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
    borderWidth: 1.7,
    borderRadius: 999,
  },
  searchHandle: {
    position: "absolute",
    left: 11,
    top: 12,
    width: 7,
    height: 1.7,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  input: {
    flex: 1,
    minHeight: 44,
    padding: 0,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  searchStatusRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  searchStatusText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  countPill: {
    minWidth: 44,
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
  },
  countText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
  },
  selectedRail: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: 14,
    borderRadius: radius.md,
  },
  selectedName: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  categoryPill: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
  },
  categoryText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  categoryIcon: {
    width: 13,
    height: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.4,
    borderRadius: 999,
  },
  categoryIconLine: {
    width: 1.4,
    height: 7,
    borderRadius: 2,
  },
  results: {
    gap: spacing.sm,
  },
  resultCard: {
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  resultHead: {
    gap: 4,
  },
  resultTitleRow: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  resultName: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  smallPill: {
    minHeight: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  smallPillText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  resultMeta: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  resultAddress: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  resultBody: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  emptyCard: {
    gap: spacing.xs,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  retryButton: {
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginTop: spacing.xs,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  retryButtonText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  bottomSpacer: {
    height: 18,
  },
});
