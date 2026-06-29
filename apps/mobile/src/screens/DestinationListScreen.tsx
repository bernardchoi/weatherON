import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { PlaceSearchResult } from "@weatheron/shared";
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
};

export function DestinationListScreen({
  state,
  savedDestinations,
  selectedDestinationPlace,
  onNavigate,
  onSaveDestination,
  onSelectDestinationPlace,
  onToggleSavedDestinationCare,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const care = state.destinationCare;
  const destinationCards = buildDestinationCards(savedDestinations, selectedDestinationPlace, care);
  const alertCount = destinationCards.filter((item) => item.careEnabled).length;

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.statusBar}>
          <Text style={[styles.statusText, { color: theme.text }]}>9:41</Text>
          <Text style={[styles.statusText, { color: theme.subtle }]}>••• 5G</Text>
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>출발</Text>
          <Pressable accessibilityRole="button" onPress={() => onNavigate("P1")} style={[styles.addButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.addText, { color: theme.text }]}>＋</Text>
          </Pressable>
        </View>

        <Pressable accessibilityRole="button" onPress={() => onNavigate("P1")} style={[styles.searchRail, { backgroundColor: theme.card }]}>
          <SearchGlyph color={theme.subtle} />
          <Text style={[styles.searchText, { color: theme.subtle }]}>목적지 검색 · 추가</Text>
        </Pressable>

        <View style={[styles.todayCard, { backgroundColor: theme.card, borderLeftColor: theme.clear }]}>
          <View style={styles.todayTop}>
            <View>
              <Text style={[styles.todayLabel, { color: theme.clear }]}>오늘 준비</Text>
              <Text style={[styles.todayTitle, { color: theme.text }]}>알아서 챙기는 중</Text>
            </View>
            <View style={[styles.alertPill, { backgroundColor: theme.cardStrong }]}>
              <Text style={[styles.alertPillText, { color: theme.gold }]}>알림 {alertCount}/2</Text>
            </View>
          </View>
          <View style={styles.segmentRow}>
            <Segment label="날씨 비교" active={false} theme={theme} />
            <Segment label={`출발 ${care.departureAdvice?.recommendedDepartureTime ?? "08:10"}`} active theme={theme} />
            <Segment label="신발·우산" active={false} theme={theme} />
          </View>
          <Text style={[styles.todayHint, { color: theme.subtle }]}>목적지를 누르면 날씨와 출발 준비를 자세히 볼 수 있어요</Text>
        </View>

        <View style={styles.destinationList}>
          {destinationCards.map((item, index) => (
            <DestinationCard
              key={item.id}
              item={item}
              index={index}
              theme={theme}
              selected={selectedDestinationPlace.id === item.place.id}
              onOpen={() => {
                onSelectDestinationPlace(item.place);
                onNavigate("G2");
              }}
              onToggle={() => {
                onSelectDestinationPlace(item.place);
                if (item.saved) onToggleSavedDestinationCare(item.id);
                else onSaveDestination("G1");
              }}
            />
          ))}
        </View>

        <Pressable accessibilityRole="button" onPress={() => onNavigate("P1")} style={[styles.dashedAdd, { borderColor: theme.border, backgroundColor: theme.cardStrong }]}>
          <Text style={[styles.dashedAddText, { color: theme.subtle }]}>＋ 목적지 추가</Text>
        </Pressable>

        <View style={[styles.tripCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
          <RouteGlyph color={theme.text} />
          <View style={styles.tripCopy}>
            <View style={styles.tripTitleRow}>
              <Text style={[styles.tripTitle, { color: theme.text }]}>여행·AI 플래너</Text>
              <View style={[styles.premiumTag, { backgroundColor: "rgba(140,207,255,0.16)" }]}>
                <Text style={[styles.premiumText, { color: theme.sky }]}>MVP 이후</Text>
              </View>
            </View>
            <Text style={[styles.tripMeta, { color: theme.subtle }]}>출발 알림 반응 확인 후 확장 검토</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function DestinationCard({
  item,
  index,
  theme,
  selected,
  onOpen,
  onToggle,
}: {
  item: DestinationCardModel;
  index: number;
  theme: AppTheme;
  selected: boolean;
  onOpen: () => void;
  onToggle: () => void;
}) {
  const accent = item.tone === "warm" ? theme.warm : theme.clear;
  return (
    <Pressable
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
          <Text style={[styles.destinationName, { color: theme.text }]}>{item.title}</Text>
          <Text style={[styles.destinationArea, { color: theme.subtle }]}>— {item.area}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onToggle} style={[styles.readyPill, { backgroundColor: theme.cardStrong }]}>
          <Text style={[styles.readyText, { color: theme.gold }]}>{item.careEnabled ? "준비" : "대기"}</Text>
        </Pressable>
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
        <Text style={[styles.timeText, { color: theme.subtle }]}>출발 {item.departureTime}</Text>
        <Text style={[styles.timeText, { color: theme.subtle }]}>도착 {item.arrivalTime}</Text>
        <Text style={[styles.warningText, { color: accent }]}>{item.warning}</Text>
      </View>
    </Pressable>
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
  selectedDestinationPlace: PlaceSearchResult,
  care: P0ScreenProps["state"]["destinationCare"],
): DestinationCardModel[] {
  const baseCards: DestinationCardModel[] = [
    {
      id: selectedDestinationPlace.id,
      title: "회사",
      area: "판교",
      icon: "company",
      originTemp: 21,
      destinationTemp: 19,
      departureTime: care.departureAdvice?.recommendedDepartureTime ?? "08:30",
      arrivalTime: "09:00",
      warning: "바람 강함 주의",
      tone: "warm",
      place: selectedDestinationPlace,
      saved: false,
      careEnabled: care.careOn,
    },
    {
      id: "school-preview",
      title: "학교",
      area: "신촌",
      icon: "school",
      originTemp: 21,
      destinationTemp: 21,
      departureTime: "09:00",
      arrivalTime: "09:45",
      warning: "날씨 차이 없음",
      tone: "clear",
      place: {
        ...selectedDestinationPlace,
        id: "school-preview",
        name: "학교",
        address: "서울 신촌",
      },
      saved: false,
      careEnabled: true,
    },
  ];

  if (!savedDestinations.length) return baseCards;

  return savedDestinations.slice(0, 2).map((destination, index) => ({
    id: destination.place.id,
    title: index === 0 ? "회사" : destination.place.name,
    area: getAreaLabel(destination.place.address, index === 0 ? "판교" : "신촌"),
    icon: index === 0 ? "company" : "school",
    originTemp: index === 0 ? 21 : 21,
    destinationTemp: index === 0 ? 19 : 21,
    departureTime: index === 0 ? "08:30" : "09:00",
    arrivalTime: index === 0 ? "09:00" : "09:45",
    warning: index === 0 ? "바람 강함 주의" : "날씨 차이 없음",
    tone: index === 0 ? "warm" : "clear",
    place: destination.place,
    saved: true,
    careEnabled: destination.careEnabled,
  }));
}

function getAreaLabel(address: string, fallback: string) {
  const parts = address.split(" ").filter(Boolean);
  return parts[parts.length - 1] ?? fallback;
}

function formatTempDiff(value: number) {
  if (value > 0) return `+${value}°`;
  if (value === 0) return "±0°";
  return `${value}°`;
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
  return (
    <View style={styles.placeGlyph} accessibilityElementsHidden>
      <View style={[styles.placeRoof, { borderColor: color }, type === "school" ? styles.schoolRoof : null]} />
      <View style={[styles.placeBase, { borderColor: color }]} />
      <View style={[styles.placeDoor, { backgroundColor: color }]} />
    </View>
  );
}

function RouteGlyph({ color }: { color: string }) {
  return (
    <View style={styles.routeGlyph} accessibilityElementsHidden>
      <View style={[styles.routeWingTop, { borderColor: color }]} />
      <View style={[styles.routeWingBottom, { borderColor: color }]} />
      <View style={[styles.routeBody, { backgroundColor: color }]} />
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 112,
    minHeight: "100%",
  },
  atmosphere: {
    position: "absolute",
    left: -32,
    right: -32,
    bottom: -110,
    height: 300,
    opacity: 0.72,
    borderTopLeftRadius: 160,
    borderTopRightRadius: 160,
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
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
    letterSpacing: 0,
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  addText: {
    marginTop: -1,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "500",
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
    minWidth: 42,
    minHeight: 26,
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
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  dashedAdd: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radius.md,
  },
  dashedAddText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  tripCard: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  tripCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  tripTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  tripTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  premiumTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  premiumText: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "900",
  },
  tripMeta: {
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
    width: 18,
    height: 18,
  },
  placeRoof: {
    position: "absolute",
    top: 1,
    left: 4,
    width: 10,
    height: 9,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    transform: [{ rotate: "45deg" }],
  },
  schoolRoof: {
    borderTopLeftRadius: 2,
  },
  placeBase: {
    position: "absolute",
    left: 3,
    bottom: 1,
    width: 12,
    height: 10,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderRadius: 2,
  },
  placeDoor: {
    position: "absolute",
    left: 8,
    bottom: 2,
    width: 2,
    height: 5,
    borderRadius: 1,
  },
  routeGlyph: {
    width: 24,
    height: 24,
  },
  routeWingTop: {
    position: "absolute",
    left: 2,
    top: 4,
    width: 18,
    height: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    transform: [{ rotate: "-22deg" }],
  },
  routeWingBottom: {
    position: "absolute",
    left: 6,
    top: 10,
    width: 12,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: "-22deg" }],
  },
  routeBody: {
    position: "absolute",
    left: 9,
    top: 5,
    width: 2,
    height: 17,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
});
