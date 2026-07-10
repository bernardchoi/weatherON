import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import { AppListGroup, AppListRow } from "../components/AppListRow";
import { BackButton } from "../components/BackButton";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

export function GlobalSettingsScreen({
  temperatureUnit,
  distanceUnit,
  themeMode,
  reducedTransparency,
  onNavigate,
  onSetTemperatureUnit,
  onSetDistanceUnit,
  onSetThemeMode,
  onToggleReducedTransparency,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const temperatureLabel = temperatureUnit === "celsius" ? "°C" : "°F";
  const distanceLabel = getDistanceUnitLabel(distanceUnit);
  const themeLabel = getThemeModeLabel(themeMode);
  const stateSummary = `${temperatureLabel} · ${distanceLabel} · 테마 ${themeLabel}`;

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <BackButton onPress={() => onNavigate("M1")} />
          <Text style={[styles.title, { color: theme.text }]}>표시 설정</Text>
        </View>

        <View style={[styles.topSummary, { backgroundColor: theme.card }]}>
          <Text style={[styles.topSummaryLabel, { color: theme.sky }]}>현재 적용</Text>
          <Text style={[styles.topSummaryValue, { color: theme.text }]}>{temperatureLabel} · {distanceLabel}</Text>
          <Text style={[styles.topSummaryMeta, { color: theme.subtle }]}>{themeLabel} 테마</Text>
        </View>

        <Text style={[styles.groupLabel, { color: theme.subtle }]}>기본 표시</Text>

        <AppListGroup>
          <AppListRow
            icon={uiIconAssets.uv}
            title="온도"
            subtitle="날씨와 출발 비교"
            tone="gold"
            right={(
              <SegmentControl
                label="온도"
                options={[
                  { label: "°C", active: temperatureUnit === "celsius", onPress: () => onSetTemperatureUnit("celsius") },
                  { label: "°F", active: temperatureUnit === "fahrenheit", onPress: () => onSetTemperatureUnit("fahrenheit") },
                ]}
              />
            )}
          />
          <AppListRow
            icon={uiIconAssets.pin}
            title="거리"
            subtitle="검색과 이동 안내"
            tone="sky"
            divider
            right={(
              <SegmentControl
                label="거리"
                options={[
                  { label: "미터", active: distanceUnit === "meter", onPress: () => onSetDistanceUnit("meter") },
                  { label: "마일", active: distanceUnit === "mile", onPress: () => onSetDistanceUnit("mile") },
                ]}
              />
            )}
          />
          <AppListRow
            icon={uiIconAssets.myDisplay}
            title="테마"
            subtitle="앱 전체 색상"
            tone="clear"
            divider
            right={(
              <SegmentControl
                label="테마"
                wide
                options={(["system", "light", "dark"] as const).map((mode) => ({
                  label: getThemeModeLabel(mode),
                  active: themeMode === mode,
                  onPress: () => onSetThemeMode(mode),
                }))}
              />
            )}
          />
        </AppListGroup>

        <Text style={[styles.groupLabel, { color: theme.subtle }]}>화면</Text>

        <AppListGroup>
          <AppListRow
            icon={uiIconAssets.settings}
            title="투명 효과"
            subtitle={reducedTransparency ? "효과 줄임" : "기본 효과"}
            tone="sky"
            right={(
              <View style={[styles.effectSwitchTrack, { backgroundColor: reducedTransparency ? theme.gold : theme.cardMuted }]}>
                <View style={[styles.effectSwitchKnob, { backgroundColor: reducedTransparency ? theme.onAccent : theme.text }, reducedTransparency ? styles.effectSwitchKnobOn : null]} />
              </View>
            )}
            accessibilityLabel={`투명 효과 ${reducedTransparency ? "줄임" : "기본"}`}
            accessibilityRole="switch"
            accessibilityState={{ checked: reducedTransparency }}
            onPress={onToggleReducedTransparency}
          />
        </AppListGroup>

        <View
          accessibilityLabel="표시 설정 버전 정보"
          style={styles.footerLinks}
        >
          <Text style={[styles.footerText, { color: theme.subtle }]}>WeatherON v0.1.0 · {stateSummary}</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function SegmentControl({
  label,
  options,
  wide = false,
}: {
  label: string;
  options: { label: string; active: boolean; onPress: () => void }[];
  wide?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <View style={[styles.segmentControl, wide ? styles.segmentControlWide : null, { backgroundColor: theme.nav }]}>
      {options.map((option) => (
        <Pressable
          key={option.label}
          accessibilityLabel={`${label} ${option.label}`}
          accessibilityRole="button"
          accessibilityState={{ selected: option.active }}
          onPress={option.onPress}
          style={[styles.segmentOption, { backgroundColor: option.active ? theme.gold : "transparent" }]}
        >
          <Text style={[styles.segmentText, { color: option.active ? theme.onAccent : theme.subtle }]}>{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function getThemeModeLabel(mode: P0ScreenProps["themeMode"]) {
  if (mode === "light") return "라이트";
  if (mode === "dark") return "다크";
  return "시스템";
}

function getDistanceUnitLabel(unit: P0ScreenProps["distanceUnit"]) {
  return unit === "mile" ? "마일" : "미터";
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
    paddingBottom: 116,
  },
  atmosphere: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 280,
    height: 500,
    opacity: 0.34,
    borderRadius: 78,
  },
  header: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  title: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: 0,
  },
  groupLabel: {
    marginTop: spacing.sm,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  topSummary: {
    minHeight: 124,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  topSummaryLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  topSummaryValue: {
    marginTop: 4,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  topSummaryMeta: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  segmentControl: {
    width: 128,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: radius.md,
  },
  segmentControlWide: {
    width: 154,
  },
  segmentOption: {
    flex: 1,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    paddingHorizontal: 4,
  },
  segmentText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  effectSwitchTrack: {
    width: 50,
    height: 30,
    justifyContent: "center",
    padding: 3,
    borderRadius: radius.pill,
  },
  effectSwitchKnob: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
  },
  effectSwitchKnobOn: {
    alignSelf: "flex-end",
  },
  footerLinks: {
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  bottomSpacer: {
    height: 10,
  },
});
