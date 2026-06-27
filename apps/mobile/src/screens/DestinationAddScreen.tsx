import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, radius, spacing } from "../theme/tokens";

export function DestinationAddScreen({
  state,
  destinationSaved,
  selectedDestinationPlace,
  placeSearchQuery,
  placeSearchResults,
  isPlaceSearchLoading,
  onNavigate,
  onSearchPlaces,
  onSelectDestinationPlace,
  onSaveDestination,
}: P0ScreenProps) {
  const care = state.destinationCare;

  return (
    <AppScreen title="목적지 추가" subtitle="검색 결과 선택 후 G1/G2/P3가 같은 목적지 상태를 공유함" badge="P1">
      <Section title="장소 검색" caption="국내는 Kakao, 해외는 Google Maps 후보로 확장 가능한 adapter 구조">
        <View style={styles.searchBox}>
          <TextInput
            accessibilityLabel="목적지 검색어"
            onChangeText={onSearchPlaces}
            placeholder="강릉, 잠실, 도쿄"
            placeholderTextColor={appColors.subtle}
            style={styles.input}
            value={placeSearchQuery}
          />
          <StatusPill label={isPlaceSearchLoading ? "검색 중" : "READY"} tone={isPlaceSearchLoading ? "warm" : "clear"} />
        </View>
        <View style={styles.results}>
          {placeSearchResults.map((place) => {
            const selected = selectedDestinationPlace.id === place.id;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={place.id}
                onPress={() => onSelectDestinationPlace(place)}
                style={[styles.resultRow, selected ? styles.resultSelected : null]}
              >
                <View style={styles.copy}>
                  <Text style={styles.resultName}>{place.name}</Text>
                  <Text style={styles.meta}>
                    {place.address} · {place.provider.toUpperCase()}
                  </Text>
                </View>
                <StatusPill label={selected ? "선택" : place.category.toUpperCase()} tone={selected ? "clear" : "sky"} />
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title="선택 목적지" caption="저장하면 G1/G2/P3가 같은 careOn 상태를 공유함">
        <View style={styles.preview}>
          <View style={styles.previewHeader}>
            <View style={styles.copy}>
              <Text style={styles.name}>{care.name}</Text>
              <Text style={styles.meta}>
                {selectedDestinationPlace.category.toUpperCase()} · {care.destinationWeather.locationName} · 강수{" "}
                {care.destinationWeather.current.rainProbabilityPct}%
              </Text>
            </View>
            <StatusPill label={destinationSaved ? "저장됨" : "미저장"} tone={destinationSaved ? "clear" : "warm"} />
          </View>
          <Text style={styles.reason}>{care.nextAlertText}</Text>
          <View style={styles.actions}>
            <AppButton label={destinationSaved ? "목록 보기" : "목적지 저장"} onPress={() => (destinationSaved ? onNavigate("G1") : onSaveDestination("G1"))} />
            <AppButton label="케어 미리보기" onPress={() => onNavigate("G2")} tone="secondary" />
          </View>
        </View>
      </Section>

      <Section title="adapter 상태" caption="키가 없으면 fixture, 서버 키가 있으면 외부 provider로 전환">
        <Text style={styles.reason}>현재 결과 provider: {selectedDestinationPlace.provider.toUpperCase()}</Text>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  preview: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  searchBox: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: appColors.border,
  },
  input: {
    flex: 1,
    minHeight: 42,
    color: appColors.text,
    fontSize: 15,
    fontWeight: "800",
    paddingHorizontal: spacing.sm,
  },
  results: {
    gap: spacing.sm,
  },
  resultRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  resultSelected: {
    borderColor: appColors.clear,
    backgroundColor: "rgba(103,232,208,0.14)",
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
  },
  name: {
    color: appColors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  meta: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  resultName: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  reason: {
    color: appColors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
