import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

export function DestinationAddScreen({
  destinationSaved,
  accountLinked,
  termsRequiredAccepted,
  selectedDestinationPlace,
  placeSearchQuery,
  placeSearchResults,
  isPlaceSearchLoading,
  onNavigate,
  onSearchPlaces,
  onSelectDestinationPlace,
  onRequireAccount,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const isAccountReady = accountLinked && termsRequiredAccepted;
  const selectedCategory = getCategoryLabel(selectedDestinationPlace.category);
  const resultCount = isPlaceSearchLoading ? "검색 중" : `${placeSearchResults.length}건`;
  const ctaLabel = destinationSaved ? "목적지 목록 보기" : isAccountReady ? "목적지 케어에 추가" : "계정 연결하고 저장";

  const handlePrimaryAction = () => {
    if (destinationSaved) {
      onNavigate("G1");
      return;
    }
    onRequireAccount("destination-care", "P1");
  };

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.statusBar}>
          <Text style={[styles.statusText, { color: theme.text }]}>9:41</Text>
          <Text style={[styles.statusText, { color: theme.subtle }]}>••• 5G</Text>
        </View>

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
            placeholder="잠실종합운동장"
            placeholderTextColor={theme.subtle}
            style={[styles.input, { color: theme.text }]}
            value={placeSearchQuery}
          />
        </View>

        <View style={styles.segmentRow}>
          <View style={[styles.segment, !isAccountReady ? { backgroundColor: "#0B1E38" } : { backgroundColor: theme.cardStrong }]}>
            <Text style={[styles.segmentText, { color: !isAccountReady ? theme.text : theme.subtle }]}>게스트</Text>
          </View>
          <View style={[styles.segment, isAccountReady ? { backgroundColor: theme.gold } : { backgroundColor: theme.card }]}>
            <Text style={[styles.segmentText, { color: isAccountReady ? theme.onAccent : theme.subtle }]}>
              {isAccountReady ? "계정 연결됨" : "계정 연결"}
            </Text>
          </View>
        </View>

        <View style={styles.stack}>
          <View style={[styles.stateCard, styles.stateCardSky, { backgroundColor: theme.cardStrong, borderColor: "rgba(140,207,255,0.34)" }]}>
            <View style={styles.stateHeader}>
              <Text style={[styles.eyebrow, { color: theme.sky }]}>DESTINATION</Text>
              <View style={[styles.countPill, { backgroundColor: "#10243F" }]}>
                <Text style={[styles.countText, { color: theme.sky }]}>{resultCount}</Text>
              </View>
            </View>
            <Text style={[styles.stateText, { color: theme.text }]}>{selectedDestinationPlace.name} 자동 케어 후보로 선택</Text>
          </View>

          <View style={[styles.stateCard, styles.stateCardGold, { backgroundColor: theme.cardStrong, borderColor: "rgba(244,182,63,0.28)" }]}>
            <Text style={[styles.eyebrow, { color: theme.gold }]}>DESTINATION CARE</Text>
            <Text style={[styles.stateText, { color: theme.text }]}>등록한 장소는 출발 탭에 저장되고, 날씨 비교·출발 시각·신발/우산 알림에 자동 반영돼요</Text>
          </View>
        </View>

        <View style={[styles.selectedRail, { backgroundColor: "rgba(255,255,255,0.14)" }]}>
          <Text style={[styles.selectedName, { color: theme.text }]}>{selectedDestinationPlace.name}</Text>
          <View style={[styles.categoryPill, { borderColor: theme.border }]}>
            <CategoryIcon color={theme.muted} />
            <Text style={[styles.categoryText, { color: theme.muted }]}>{selectedCategory}</Text>
          </View>
        </View>

        {placeSearchResults.length > 0 ? (
          <View style={styles.results}>
            {placeSearchResults.slice(0, 3).map((place) => {
              const selected = selectedDestinationPlace.id === place.id;
              return (
                <Pressable
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
                      게스트는 미리보기 가능, 저장과 알림 케어는 계정 연결 후 반영돼요
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <Text style={[styles.resultName, { color: theme.text }]}>검색 결과 없음</Text>
            <Text style={[styles.resultBody, { color: theme.muted }]}>전체 보기 또는 다른 장소명으로 다시 검색해요</Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <Pressable accessibilityRole="button" onPress={handlePrimaryAction} style={[styles.primaryButton, { backgroundColor: theme.gold }]}>
          <Text style={[styles.primaryText, { color: theme.onAccent }]}>{ctaLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
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
  statusBar: {
    minHeight: 23,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    letterSpacing: 0,
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
  segmentRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  segmentText: {
    fontSize: 12,
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
    letterSpacing: 1.7,
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
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  primaryButton: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
  },
  primaryText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  bottomSpacer: {
    height: 18,
  },
});
