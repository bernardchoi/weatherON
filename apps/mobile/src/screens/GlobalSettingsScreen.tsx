import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

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
  const unitSummary = `${temperatureUnit === "celsius" ? "°C" : "°F"} · ${getDistanceUnitLabel(distanceUnit)}`;
  const stateSummary = `${unitSummary} · 테마 ${getThemeModeLabel(themeMode)}`;

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <Pressable accessibilityLabel="뒤로" accessibilityRole="button" onPress={() => onNavigate("M1")} style={[styles.backButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <ChevronLeft color={theme.muted} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>표시 설정</Text>
        </View>

        <View style={[styles.unitCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionLabel, { color: theme.muted }]}>표시 설정</Text>
          <SegmentRow
            label="온도"
            options={[
              { label: "°C", active: temperatureUnit === "celsius", onPress: () => onSetTemperatureUnit("celsius") },
              { label: "°F", active: temperatureUnit === "fahrenheit", onPress: () => onSetTemperatureUnit("fahrenheit") },
            ]}
            theme={theme}
          />
          <SegmentRow
            label="거리"
            options={[
              { label: "미터", active: distanceUnit === "meter", onPress: () => onSetDistanceUnit("meter") },
              { label: "마일", active: distanceUnit === "mile", onPress: () => onSetDistanceUnit("mile") },
            ]}
            theme={theme}
          />
        </View>

        <View style={[styles.themeCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
          <Text style={[styles.sectionLabel, { color: theme.muted }]}>테마</Text>
          <View style={[styles.wideSegment, { backgroundColor: theme.nav }]}>
            {(["system", "light", "dark"] as const).map((mode) => (
              <Pressable
                key={mode}
                accessibilityLabel={`테마 ${getThemeModeLabel(mode)}`}
                accessibilityRole="button"
                accessibilityState={{ selected: themeMode === mode }}
                onPress={() => onSetThemeMode(mode)}
                style={[styles.wideSegmentOption, { backgroundColor: themeMode === mode ? theme.gold : "transparent" }]}
              >
                <Text style={[styles.segmentText, { color: themeMode === mode ? theme.onAccent : theme.subtle }]}>{getThemeModeLabel(mode)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          accessibilityLabel={`표시 설정 요약, ${stateSummary}, 투명 효과 ${reducedTransparency ? "줄임" : "기본"}`}
          accessibilityRole="switch"
          accessibilityState={{ checked: reducedTransparency }}
          onPress={onToggleReducedTransparency}
          style={[styles.globalCard, { backgroundColor: theme.cardStrong, borderColor: theme.gold }]}
        >
          <Text style={[styles.globalLabel, { color: theme.gold }]}>표시</Text>
          <Text style={[styles.globalText, { color: theme.text }]}>{stateSummary}</Text>
          <Text style={[styles.globalMeta, { color: theme.subtle }]}>투명 효과 {reducedTransparency ? "줄임" : "기본"} · 탭해서 전환</Text>
        </Pressable>

        <Pressable accessibilityLabel="버전 정보와 약관 보기" accessibilityRole="button" onPress={() => onNavigate("R1")} style={styles.footerLinks}>
          <Text style={[styles.footerText, { color: theme.subtle }]}>
            버전 정보 · 약관 · 오픈소스 라이선스
          </Text>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function SegmentRow({
  label,
  options,
  theme,
}: {
  label: string;
  options: { label: string; active: boolean; onPress: () => void }[];
  theme: AppTheme;
}) {
  return (
    <View style={styles.segmentRow}>
      <Text style={[styles.segmentLabel, { color: theme.text }]}>{label}</Text>
      <View style={[styles.segmentControl, { backgroundColor: theme.nav }]}>
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
    </View>
  );
}

function ChevronLeft({ color }: { color: string }) {
  return (
    <View style={styles.chevronLeft} accessibilityElementsHidden>
      <View style={[styles.chevronLeftTop, { backgroundColor: color }]} />
      <View style={[styles.chevronLeftBottom, { backgroundColor: color }]} />
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: 0,
  },
  unitCard: {
    gap: spacing.md,
    padding: 16,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  sectionLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  segmentRow: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  segmentLabel: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "800",
  },
  segmentControl: {
    width: 110,
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: radius.md,
  },
  segmentOption: {
    flex: 1,
    minHeight: 28,
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
  themeCard: {
    gap: spacing.md,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  wideSegment: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: radius.md,
  },
  wideSegmentOption: {
    flex: 1,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  globalCard: {
    gap: 6,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  globalLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  globalText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
  },
  globalMeta: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
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
  chevronLeft: {
    width: 16,
    height: 16,
    justifyContent: "center",
  },
  chevronLeftTop: {
    position: "absolute",
    left: 4,
    width: 9,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }, { translateY: -3 }],
  },
  chevronLeftBottom: {
    position: "absolute",
    left: 4,
    width: 9,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }, { translateY: 3 }],
  },
});
