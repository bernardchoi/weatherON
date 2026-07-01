import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../components/AppButton";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

export function DestinationAddScreen({
  destinationSaved,
  selectedDestinationPlace,
  placeSearchQuery,
  placeSearchResults,
  isPlaceSearchLoading,
  placeSearchStatus,
  onNavigate,
  onSaveDestination,
  onSearchPlaces,
  onSelectDestinationPlace,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const selectedCategory = getCategoryLabel(selectedDestinationPlace.category);
  const hasQuery = placeSearchQuery.trim().length >= 2;
  const selectedFromResults = placeSearchResults.some((place) => place.id === selectedDestinationPlace.id);
  const canUseSavedDestination = destinationSaved && (!hasQuery || selectedFromResults);
  const canUseSelectedDestination = canUseSavedDestination || selectedFromResults;
  const resultCount = getResultCountLabel(placeSearchStatus, placeSearchResults.length, hasQuery, isPlaceSearchLoading);
  const ctaLabel = getPrimaryActionLabel(canUseSavedDestination, selectedFromResults, hasQuery);
  const canClearSearch = placeSearchQuery.length > 0 && placeSearchResults.length === 0 && placeSearchStatus !== "loading";

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
            onPress={() => onNavigate("G1")}
            style={[styles.backButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
          >
            <BackGlyph color={theme.subtle} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: theme.text }]}>목적지 추가</Text>
            <Text style={[styles.subtitle, { color: theme.subtle }]}>장소를 고르면 자동 케어가 확장돼요</Text>
          </View>
        </View>

        <View style={[styles.searchField, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
          <SearchGlyph color={theme.subtle} />
          <TextInput
            accessibilityLabel="목적지 검색어"
            onChangeText={onSearchPlaces}
            placeholder="장소명 또는 주소 검색"
            placeholderTextColor={theme.subtle}
            style={[styles.input, { color: theme.text }]}
            value={placeSearchQuery}
          />
        </View>

        <View style={[styles.accountStatus, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
          <View style={styles.accountCopy}>
            <Text style={[styles.accountTitle, { color: theme.text }]}>이 기기에 저장</Text>
            <Text style={[styles.accountBody, { color: theme.subtle }]}>선택한 목적지는 홈 비교와 출발 탭에 바로 반영됨</Text>
          </View>
          <View style={[styles.accountPill, { backgroundColor: theme.gold }]}>
            <Text style={[styles.accountPillText, { color: theme.onAccent }]}>저장 가능</Text>
          </View>
        </View>

        <View style={styles.stack}>
          <View style={[styles.stateCard, styles.stateCardSky, { backgroundColor: theme.cardStrong, borderColor: "rgba(140,207,255,0.34)" }]}>
            <View style={styles.stateHeader}>
              <Text style={[styles.eyebrow, { color: theme.sky }]}>장소 선택</Text>
              <View style={[styles.countPill, { backgroundColor: "#10243F" }]}>
                <Text style={[styles.countText, { color: theme.sky }]}>{resultCount}</Text>
              </View>
            </View>
            <Text style={[styles.stateText, { color: theme.text }]}>
              {getSelectionCopy(canUseSelectedDestination, selectedDestinationPlace.name, hasQuery)}
            </Text>
          </View>

          <View style={[styles.stateCard, styles.stateCardGold, { backgroundColor: theme.cardStrong, borderColor: "rgba(244,182,63,0.28)" }]}>
            <Text style={[styles.eyebrow, { color: theme.gold }]}>자동 케어</Text>
            <Text style={[styles.stateText, { color: theme.text }]}>등록한 장소는 출발 탭에 저장되고, 날씨 비교·출발 시각·강수 알림에 자동 반영돼요</Text>
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
                    <Text style={[styles.resultName, { color: theme.text }]}>{place.name} {selected ? "선택됨" : ""}</Text>
                    <Text style={[styles.resultMeta, { color: selected ? theme.sky : theme.subtle }]}>{getCategoryLabel(place.category)} · {getCategoryDetail(place.category)}</Text>
                  </View>
                  {selected ? (
                    <Text style={[styles.resultBody, { color: theme.muted }]}>
                      저장하면 출발 탭에서 날씨 비교와 출발 준비를 바로 볼 수 있어요
                    </Text>
                  ) : null}
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

      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <AppButton label={ctaLabel} accessibilityLabel={ctaLabel} onPress={handlePrimaryAction} tone="warning" disabled={!canUseSelectedDestination} />
      </View>
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
  if (canUseSelectedDestination) return `${selectedName} 자동 케어 후보로 선택`;
  return hasQuery ? "검색 결과에서 목적지를 선택해 주세요" : "장소명 검색 후 결과를 선택해 주세요";
}

function getEmptyTitle(status: P0ScreenProps["placeSearchStatus"], hasQuery: boolean) {
  if (status === "loading") return "검색 중";
  if (status === "error") return "검색 연결 실패";
  if (hasQuery) return "검색 결과 없음";
  return "장소를 검색해 주세요";
}

function getEmptyBody(status: P0ScreenProps["placeSearchStatus"], hasQuery: boolean) {
  if (status === "loading") return "장소 목록을 불러오는 중이에요";
  if (status === "error") return "검색어는 유지됨 · 다시 시도하거나 지우고 새로 입력해 주세요";
  if (hasQuery) return "다른 장소명이나 지역명을 입력하거나 검색어를 지워 다시 시작해요";
  return "목적지를 선택하면 홈 비교와 출발 탭에 바로 반영됨";
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
    gap: spacing.md,
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
  accountStatus: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  accountCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  accountTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  accountBody: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  accountPill: {
    minHeight: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  accountPillText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",
  },
  stack: {
    gap: spacing.sm,
  },
  stateCard: {
    gap: spacing.xs,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  stateCardSky: {
    borderLeftWidth: 2,
  },
  stateCardGold: {
    borderLeftWidth: 2,
  },
  stateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  eyebrow: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  countPill: {
    minWidth: 44,
    minHeight: 31,
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
  stateText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "800",
  },
  selectedRail: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
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
    gap: spacing.sm,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  resultHead: {
    gap: 4,
  },
  resultName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  resultMeta: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
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
