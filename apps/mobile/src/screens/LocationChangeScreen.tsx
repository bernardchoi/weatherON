import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

export function LocationChangeScreen({
  state,
  accountLinked,
  locationReady,
  savedDestinations,
  selectedDestinationPlace,
  placeSearchQuery,
  placeSearchResults,
  isPlaceSearchLoading,
  permissionGateResult,
  onNavigate,
  onRequireAccount,
  onRequestCurrentLocation,
  onRequestPermissionGate,
  onSearchPlaces,
  onSelectDestinationPlace,
  onSelectWeatherLocation,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const locationStatus = permissionGateResult?.returnTo === "H2" ? permissionGateResult.message : locationReady ? "GPS 자동 감지 가능" : "권한 확인 필요";
  const savedPlaces = savedDestinations.length ? savedDestinations.map((item) => item.place) : placeSearchResults.slice(0, 2);

  const selectPlace = (place: typeof selectedDestinationPlace) => {
    onSelectDestinationPlace(place);
    onSelectWeatherLocation(place);
    onNavigate("H1");
  };

  return (
    <AppScreen title="위치 변경" subtitle="현재 날씨 기준 위치를 선택하세요" badge={accountLinked ? "계정 연결됨" : "게스트"}>
      <View style={[styles.searchBox, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
        <Text style={[styles.searchIcon, { color: theme.subtle }]}>⌕</Text>
        <TextInput
          accessibilityLabel="동 읍 면 검색"
          value={placeSearchQuery}
          onChangeText={onSearchPlaces}
          placeholder="동/읍/면 검색"
          placeholderTextColor={theme.subtle}
          style={[styles.searchInput, { color: theme.text }]}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => (locationReady ? onRequestCurrentLocation() : onRequestPermissionGate("location", "H2"))}
        style={[styles.currentRow, { backgroundColor: theme.cardStrong, borderColor: locationReady ? theme.clear : theme.border }]}
      >
        <View style={[styles.weatherIcon, { backgroundColor: theme.cardMuted, borderColor: theme.clear }]}>
          <Text style={[styles.weatherGlyph, { color: theme.clear }]}>현</Text>
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.text }]}>현재 위치 사용</Text>
          <Text style={[styles.meta, { color: theme.muted }]}>{locationStatus}</Text>
        </View>
        <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
      </Pressable>

      <View style={styles.group}>
        <Text style={[styles.groupTitle, { color: theme.muted }]}>저장한 위치</Text>
        <View style={[styles.savedPanel, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
          {savedPlaces.map((place, index) => (
            <Pressable
              accessibilityRole="button"
              key={place.id}
              onPress={() => selectPlace(place)}
              style={[styles.savedRow, index < savedPlaces.length - 1 ? { borderBottomColor: theme.border, borderBottomWidth: 1 } : null]}
            >
              <View style={[styles.weatherIcon, { backgroundColor: theme.cardMuted, borderColor: place.id === selectedDestinationPlace.id ? theme.gold : theme.border }]}>
                <Text style={[styles.weatherGlyph, { color: place.id === selectedDestinationPlace.id ? theme.gold : theme.subtle }]}>
                  {place.name.slice(0, 1)}
                </Text>
              </View>
              <View style={styles.copy}>
                <View style={styles.inline}>
                  <Text style={[styles.title, { color: theme.text }]}>{place.name}</Text>
                  {place.id === selectedDestinationPlace.id ? <StatusPill label="현재" tone="clear" /> : null}
                </View>
                <Text style={[styles.meta, { color: theme.muted }]}>{place.address}</Text>
              </View>
              <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton label={accountLinked ? "위치 저장됨" : "게스트로 적용"} onPress={() => onNavigate("H1")} tone="warning" />
        <AppButton label={accountLinked ? "계정 연결됨" : "계정 연결"} onPress={() => onRequireAccount("destination-care", "H2")} tone="secondary" />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => (accountLinked ? onNavigate("P1") : onRequireAccount("destination-care", "H2"))}
        style={[styles.addRow, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
      >
        <Text style={[styles.addPlus, { color: theme.subtle }]}>＋</Text>
        <Text style={[styles.addText, { color: theme.muted }]}>계정 연결하고 위치 저장</Text>
      </Pressable>

      <View style={[styles.statusBox, { backgroundColor: theme.cardStrong }]}>
        <Text style={[styles.statusTitle, { color: theme.clear }]}>위치</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>
          {isPlaceSearchLoading ? "검색 중" : `${state.weather.locationName} 기준 · 검색어 ${placeSearchQuery || "없음"}`}
        </Text>
      </View>
    </AppScreen>
  );
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
  searchIcon: {
    fontSize: 22,
    fontWeight: "900",
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    fontSize: 15,
    fontWeight: "800",
    outlineStyle: "none" as never,
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
  chevron: {
    fontSize: 24,
    fontWeight: "700",
  },
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: "900",
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
  inline: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  actions: {
    flexDirection: "row",
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
