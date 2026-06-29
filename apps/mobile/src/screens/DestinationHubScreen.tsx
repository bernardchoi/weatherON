import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { PlaceSearchResult } from "@weatheron/shared";
import { placeImageAssets } from "../assets";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

type FilterId = "all" | "sports" | "outdoor" | "season" | "culture";

type DestinationCard = {
  place: PlaceSearchResult;
  filter: Exclude<FilterId, "all">;
  image: number;
  metric: string;
  recommendation: string;
  accent: "clear" | "warm";
};

const filters: { id: FilterId; label: string; icon: "pin" | "ball" | "mountain" | "snow" | "culture" }[] = [
  { id: "all", label: "전체", icon: "pin" },
  { id: "sports", label: "스포츠", icon: "ball" },
  { id: "outdoor", label: "아웃도어", icon: "mountain" },
  { id: "season", label: "계절", icon: "snow" },
  { id: "culture", label: "문화", icon: "culture" },
];

const destinationCards: DestinationCard[] = [
  {
    place: {
      id: "kr-jamsil-baseball-stadium",
      name: "잠실종합운동장",
      address: "서울 송파구 올림픽로 25",
      category: "sports",
      countryCode: "KR",
      coordinate: { latitude: 37.5122, longitude: 127.0719 },
      timezone: "Asia/Seoul",
      provider: "fixture",
    },
    filter: "sports",
    image: placeImageAssets.baseball,
    metric: "경기 취소 확률 12%",
    recommendation: "쿨링룩 추천",
    accent: "clear",
  },
  {
    place: {
      id: "kr-bukhansan-national-park",
      name: "북한산국립공원",
      address: "서울 강북구 삼양로173길",
      category: "mountain",
      countryCode: "KR",
      coordinate: { latitude: 37.6584, longitude: 126.977 },
      timezone: "Asia/Seoul",
      provider: "fixture",
    },
    filter: "outdoor",
    image: placeImageAssets.mountain,
    metric: "정상 낙뢰 위험",
    recommendation: "오전 하산 권장",
    accent: "warm",
  },
  {
    place: {
      id: "kr-haeundae-beach",
      name: "해운대해수욕장",
      address: "부산 해운대구 우동",
      category: "beach",
      countryCode: "KR",
      coordinate: { latitude: 35.1587, longitude: 129.1604 },
      timezone: "Asia/Seoul",
      provider: "fixture",
    },
    filter: "season",
    image: placeImageAssets.beach,
    metric: "파도 보통",
    recommendation: "래시가드 추천",
    accent: "clear",
  },
];

export function DestinationHubScreen({
  selectedDestinationPlace,
  onNavigate,
  onSelectDestinationPlace,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const visibleDestinations = useMemo(
    () => destinationCards.filter((card) => activeFilter === "all" || card.filter === activeFilter),
    [activeFilter],
  );

  const openDestination = (place: PlaceSearchResult) => {
    onSelectDestinationPlace(place);
    onNavigate("P2");
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
          <Text style={[styles.title, { color: theme.text }]}>목적지</Text>
          <Text style={[styles.subtitle, { color: theme.subtle }]}>저장한 목적지별 자동 케어와 준비 가이드</Text>
        </View>

        <View style={styles.filterRow}>
          {filters.map((filter) => {
            const active = activeFilter === filter.id;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={filter.id}
                onPress={() => setActiveFilter(filter.id)}
                style={[styles.filterButton, { backgroundColor: active ? theme.gold : theme.cardStrong, borderColor: active ? theme.gold : theme.border }]}
              >
                <FilterIcon type={filter.icon} color={active ? theme.onAccent : theme.subtle} />
                <Text style={[styles.filterText, { color: active ? theme.onAccent : theme.text }]}>{filter.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.stateCard, { backgroundColor: theme.cardStrong, borderColor: "rgba(103,232,208,0.34)" }]}>
          <Text style={[styles.eyebrow, { color: theme.clear }]}>DESTINATION CARE</Text>
          <Text style={[styles.stateText, { color: theme.text }]}>카테고리별 날씨 리스크와 코디·신발·준비물을 목적지 카드에서 바로 확인해요</Text>
        </View>

        <View style={[styles.stateCard, { backgroundColor: theme.cardStrong, borderColor: "rgba(103,232,208,0.34)" }]}>
          <View style={styles.stateHeader}>
            <View style={styles.stateCopy}>
              <Text style={[styles.eyebrow, { color: theme.clear }]}>DESTINATION CARE</Text>
              <Text style={[styles.stateText, { color: theme.text }]}>저장 목적지 기준으로 자동 케어 후보를 보여줌</Text>
            </View>
            <View style={[styles.countPill, { backgroundColor: "#10243F" }]}>
              <Text style={[styles.countText, { color: theme.gold }]}>{visibleDestinations.length}곳</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => onNavigate("P1")} style={[styles.addPill, { backgroundColor: theme.gold }]}>
              <Text style={[styles.addPillText, { color: theme.onAccent }]}>추가</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.destinationList}>
          {visibleDestinations.length ? (
            visibleDestinations.map((card) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: selectedDestinationPlace.id === card.place.id }}
                key={card.place.id}
                onPress={() => openDestination(card.place)}
                style={[
                  styles.destinationCard,
                  {
                    backgroundColor: theme.cardStrong,
                    borderColor: selectedDestinationPlace.id === card.place.id ? theme.clear : "transparent",
                    borderLeftColor: card.accent === "warm" ? theme.warm : theme.clear,
                  },
                ]}
              >
                <Image source={card.image} style={styles.destinationImage} resizeMode="cover" />
                <View style={styles.destinationCopy}>
                  <View style={styles.destinationTitleRow}>
                    <CategoryMiniIcon category={card.place.category} color={card.accent === "warm" ? theme.warm : theme.clear} />
                    <Text style={[styles.destinationName, { color: theme.text }]} numberOfLines={1}>{card.place.name}</Text>
                  </View>
                  <Text style={[styles.destinationMeta, { color: card.accent === "warm" ? theme.warm : theme.clear }]} numberOfLines={1}>
                    {card.metric} · {card.recommendation}
                  </Text>
                </View>
                <Chevron color={theme.subtle} />
              </Pressable>
            ))
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
              <Text style={[styles.destinationName, { color: theme.text }]}>매칭 목적지 없음</Text>
              <Text style={[styles.destinationMeta, { color: theme.subtle }]}>목적지를 추가하거나 전체 필터로 돌아가요</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function FilterIcon({ type, color }: { type: (typeof filters)[number]["icon"]; color: string }) {
  if (type === "pin") return <PinIcon color={color} />;
  if (type === "mountain") return <MountainIcon color={color} />;
  if (type === "snow") return <SnowIcon color={color} />;
  if (type === "culture") return <CultureIcon color={color} />;
  return <BallIcon color={color} />;
}

function CategoryMiniIcon({ category, color }: { category: string; color: string }) {
  if (category === "mountain") return <MountainIcon color={color} />;
  if (category === "beach") return <WaveIcon color={color} />;
  return <BallIcon color={color} />;
}

function PinIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.pinOuter, { borderColor: color }]} />
      <View style={[styles.pinDot, { backgroundColor: color }]} />
    </View>
  );
}

function BallIcon({ color }: { color: string }) {
  return (
    <View style={[styles.roundIcon, { borderColor: color }]} accessibilityElementsHidden>
      <View style={[styles.ballLine, { backgroundColor: color }]} />
    </View>
  );
}

function MountainIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.mountainLeft, { borderBottomColor: color }]} />
      <View style={[styles.mountainRight, { borderBottomColor: color }]} />
    </View>
  );
}

function SnowIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.snowLineV, { backgroundColor: color }]} />
      <View style={[styles.snowLineH, { backgroundColor: color }]} />
    </View>
  );
}

function CultureIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.cultureColumn, { backgroundColor: color }]} />
      <View style={[styles.cultureColumn, { backgroundColor: color }]} />
      <View style={[styles.cultureColumn, { backgroundColor: color }]} />
    </View>
  );
}

function WaveIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.waveOne, { backgroundColor: color }]} />
      <View style={[styles.waveTwo, { backgroundColor: color }]} />
    </View>
  );
}

function Chevron({ color }: { color: string }) {
  return (
    <View style={styles.chevron} accessibilityElementsHidden>
      <View style={[styles.chevronTop, { backgroundColor: color }]} />
      <View style={[styles.chevronBottom, { backgroundColor: color }]} />
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
    paddingBottom: 118,
  },
  atmosphere: {
    position: "absolute",
    left: -32,
    right: -32,
    top: 186,
    height: 520,
    opacity: 0.34,
    borderRadius: 76,
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
    gap: 8,
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  filterRow: {
    flexDirection: "row",
    gap: 6,
    marginHorizontal: -1,
  },
  filterButton: {
    minHeight: 35,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 7,
  },
  filterText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  stateCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderLeftWidth: 2,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  stateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stateCopy: {
    flex: 1,
    gap: 6,
  },
  eyebrow: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.7,
  },
  stateText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "800",
  },
  countPill: {
    minHeight: 32,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: 8,
  },
  countText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
  },
  addPill: {
    minHeight: 34,
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: 11,
  },
  addPillText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
  },
  destinationList: {
    gap: spacing.md,
  },
  destinationCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderLeftWidth: 2,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 12,
  },
  destinationImage: {
    width: 74,
    height: 58,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  destinationCopy: {
    flex: 1,
    gap: 8,
  },
  destinationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  destinationName: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  destinationMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  emptyCard: {
    gap: 6,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  iconFrame: {
    width: 12,
    height: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pinOuter: {
    width: 11,
    height: 11,
    borderWidth: 1.4,
    borderRadius: 999,
  },
  pinDot: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 999,
  },
  roundIcon: {
    width: 12,
    height: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.4,
    borderRadius: 999,
  },
  ballLine: {
    width: 1.4,
    height: 8,
    borderRadius: 2,
  },
  mountainLeft: {
    position: "absolute",
    left: 1,
    bottom: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 9,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  mountainRight: {
    position: "absolute",
    right: 1,
    bottom: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  snowLineV: {
    position: "absolute",
    width: 1.4,
    height: 13,
    borderRadius: 2,
  },
  snowLineH: {
    position: "absolute",
    width: 13,
    height: 1.4,
    borderRadius: 2,
  },
  cultureColumn: {
    width: 2,
    height: 11,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  waveOne: {
    position: "absolute",
    top: 4,
    width: 12,
    height: 2,
    borderRadius: 2,
  },
  waveTwo: {
    position: "absolute",
    top: 9,
    width: 12,
    height: 2,
    borderRadius: 2,
  },
  chevron: {
    width: 14,
    height: 18,
  },
  chevronTop: {
    position: "absolute",
    right: 2,
    top: 5,
    width: 8,
    height: 1.6,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  chevronBottom: {
    position: "absolute",
    right: 2,
    top: 10,
    width: 8,
    height: 1.6,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }],
  },
  bottomSpacer: {
    height: 18,
  },
});
