import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, radius, spacing } from "../theme/tokens";

const filters = [
  { id: "all", label: "전체" },
  { id: "saved", label: "저장" },
  { id: "care", label: "케어 ON" },
  { id: "category", label: "카테고리" },
] as const;

export function DestinationHubScreen({
  state,
  destinationSaved,
  savedDestinations,
  destinationCareEnabled,
  selectedDestinationPlace,
  destinationHubFilter,
  onNavigate,
  onRemoveSavedDestination,
  onSelectDestinationPlace,
  onToggleSavedDestinationCare,
  onSetDestinationHubFilter,
}: P0ScreenProps) {
  const care = state.destinationCare;
  const destinations = savedDestinations.length
    ? savedDestinations.map((destination) => ({ ...destination, saved: true }))
    : [{ place: selectedDestinationPlace, careEnabled: destinationCareEnabled, savedAtLabel: "Guest 미리보기", saved: false }];
  const filteredDestinations = destinations.filter((destination) =>
    getFilterMatched(destinationHubFilter, destination.saved, destination.careEnabled, destination.place.category, selectedDestinationPlace.category),
  );

  return (
    <AppScreen title="목적지 허브" subtitle="필터 리스트와 상세 상태를 한 화면에서 확인하는 P3 구조" badge="P3">
      <Section title="필터" caption={`선택 필터 ${getFilterLabel(destinationHubFilter)} · 매칭 ${filteredDestinations.length}개`}>
        <View style={styles.filterRow}>
          {filters.map((filter) => {
            const active = destinationHubFilter === filter.id;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={filter.id}
                onPress={() => onSetDestinationHubFilter(filter.id)}
                style={[styles.filterButton, active ? styles.filterButtonActive : null]}
              >
                <Text style={[styles.filterText, active ? styles.filterTextActive : null]}>{filter.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.filterRow}>
          <StatusPill label={destinationSaved ? "저장됨" : "Guest"} tone={destinationSaved ? "clear" : "warm"} />
          <StatusPill label={destinationCareEnabled ? "케어 ON" : "케어 OFF"} tone={destinationCareEnabled ? "clear" : "warm"} />
          <StatusPill label={selectedDestinationPlace.category.toUpperCase()} tone="sky" />
          <StatusPill label={selectedDestinationPlace.provider.toUpperCase()} tone="gold" />
        </View>
      </Section>

      <Section title="상세 상태" caption={care.nextAlertText}>
        {filteredDestinations.length ? (
          <View style={styles.list}>
            {filteredDestinations.map((destination) => {
              const active = selectedDestinationPlace.id === destination.place.id;
              return (
                <View
                  key={destination.place.id}
                  style={[styles.card, active ? styles.cardActive : null]}
                >
                  <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => onSelectDestinationPlace(destination.place)} style={styles.selectArea}>
                    <View style={styles.cardHeader}>
                      <View style={styles.copy}>
                        <Text style={styles.name}>{destination.place.name}</Text>
                        <Text style={styles.meta}>
                          {destination.place.address} · {destination.saved ? "저장 목적지" : "Guest 미리보기"}
                        </Text>
                      </View>
                      <StatusPill label={destination.careEnabled ? "케어 ON" : "케어 OFF"} tone={destination.careEnabled ? "clear" : "warm"} />
                    </View>
                    {active ? (
                      <Text style={styles.meta}>
                        목적지 체감 {care.destinationWeather.current.feelsLikeC}도 · 강수확률 {care.destinationWeather.current.rainProbabilityPct}% · 바람{" "}
                        {care.destinationWeather.current.windMs.toFixed(1)}m/s
                      </Text>
                    ) : null}
                  </Pressable>
                  <View style={styles.filterRow}>
                    <StatusPill label={destination.place.category.toUpperCase()} tone="sky" />
                    <StatusPill label={destination.place.provider.toUpperCase()} tone="gold" />
                    <StatusPill label={destination.savedAtLabel} tone="clear" />
                  </View>
                  {destination.saved ? (
                    <View style={styles.actions}>
                      <AppButton
                        label={destination.careEnabled ? "케어 끄기" : "케어 켜기"}
                        onPress={() => {
                          onSelectDestinationPlace(destination.place);
                          onToggleSavedDestinationCare(destination.place.id);
                        }}
                        tone="secondary"
                      />
                      <AppButton label="삭제" onPress={() => onRemoveSavedDestination(destination.place.id)} tone="warning" />
                    </View>
                  ) : null}
                </View>
              );
            })}
            <View style={styles.actions}>
              <AppButton label="상세 케어" onPress={() => onNavigate("G2")} />
              <AppButton label="준비 가이드" onPress={() => onNavigate("P2")} tone="secondary" />
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.name}>매칭 목적지 없음</Text>
            <Text style={styles.meta}>저장 필터는 계정 연결 후 저장된 목적지만 표시함</Text>
            <View style={styles.actions}>
              <AppButton label="목적지 추가" onPress={() => onNavigate("P1")} />
              <AppButton label="목록" onPress={() => onNavigate("G1")} tone="secondary" />
            </View>
          </View>
        )}
      </Section>
    </AppScreen>
  );
}

function getFilterMatched(
  filter: P0ScreenProps["destinationHubFilter"],
  saved: boolean,
  careOn: boolean,
  category: string,
  selectedCategory: string,
): boolean {
  if (filter === "saved") return saved;
  if (filter === "care") return careOn;
  if (filter === "category") return category === selectedCategory;
  return true;
}

function getFilterLabel(filter: P0ScreenProps["destinationHubFilter"]): string {
  const item = filters.find((candidate) => candidate.id === filter);
  return item?.label ?? "전체";
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  filterButton: {
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  filterButtonActive: {
    borderColor: appColors.clear,
    backgroundColor: "rgba(103,232,208,0.14)",
  },
  filterText: {
    color: appColors.muted,
    fontSize: 12,
    fontWeight: "900",
  },
  filterTextActive: {
    color: appColors.clear,
  },
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  selectArea: {
    gap: spacing.md,
  },
  cardActive: {
    borderColor: appColors.clear,
    backgroundColor: "rgba(103,232,208,0.12)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
  },
  list: {
    gap: spacing.sm,
  },
  name: {
    color: appColors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  meta: {
    color: appColors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
