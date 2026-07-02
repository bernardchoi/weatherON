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
  const temperatureLabel = temperatureUnit === "celsius" ? "°C" : "°F";
  const distanceLabel = getDistanceUnitLabel(distanceUnit);
  const themeLabel = getThemeModeLabel(themeMode);
  const stateSummary = `${temperatureLabel} · ${distanceLabel} · 테마 ${themeLabel}`;

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
          <View>
            <Text style={[styles.sectionLabel, { color: theme.muted }]}>단위</Text>
            <Text style={[styles.sectionCaption, { color: theme.subtle }]}>홈, 출발, 목적지 화면에 바로 반영</Text>
          </View>
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
          <View>
            <Text style={[styles.sectionLabel, { color: theme.muted }]}>테마</Text>
            <Text style={[styles.sectionCaption, { color: theme.subtle }]}>앱 전체 색상 모드</Text>
          </View>
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

        <View accessibilityLabel={`표시 설정 요약, ${stateSummary}`} style={[styles.summaryCard, { backgroundColor: theme.cardStrong, borderColor: theme.gold }]}>
          <Text style={[styles.summaryLabel, { color: theme.gold }]}>표시 설정 요약</Text>
          <Text style={[styles.summaryText, { color: theme.text }]}>{stateSummary}</Text>
          <View style={styles.scopeList}>
            <ScopeLine label="온도" value="홈 날씨 · 출발 비교 · 목적지 상세" theme={theme} />
            <ScopeLine label="거리" value="장소 검색 결과 · 이동 거리 안내" theme={theme} />
            <ScopeLine label="테마" value="앱 전체 배경과 카드 색상" theme={theme} />
          </View>
        </View>

        <Pressable
          accessibilityLabel={`투명 효과 ${reducedTransparency ? "줄임" : "기본"}`}
          accessibilityRole="switch"
          accessibilityState={{ checked: reducedTransparency }}
          onPress={onToggleReducedTransparency}
          style={[styles.effectCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
        >
          <View style={styles.effectCopy}>
            <Text style={[styles.effectTitle, { color: theme.text }]}>화면 효과</Text>
            <Text style={[styles.effectBody, { color: theme.subtle }]}>투명 효과 {reducedTransparency ? "줄임" : "기본"}</Text>
          </View>
          <View style={[styles.effectSwitchTrack, { backgroundColor: reducedTransparency ? theme.gold : theme.cardMuted }]}>
            <View style={[styles.effectSwitchKnob, { backgroundColor: reducedTransparency ? theme.onAccent : theme.text }, reducedTransparency ? styles.effectSwitchKnobOn : null]} />
          </View>
        </Pressable>

        <View accessibilityLabel="표시 설정 버전 정보" style={styles.footerLinks}>
          <Text style={[styles.footerText, { color: theme.subtle }]}>
            WeatherON v0.1.0 · 표시 설정
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function ScopeLine({ label, value, theme }: { label: string; value: string; theme: AppTheme }) {
  return (
    <View style={styles.scopeLine}>
      <Text style={[styles.scopeLabel, { color: theme.subtle }]}>{label}</Text>
      <Text style={[styles.scopeValue, { color: theme.text }]} numberOfLines={1}>{value}</Text>
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
  sectionCaption: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  segmentRow: {
    minHeight: 48,
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
    width: 128,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: radius.md,
  },
  segmentOption: {
    flex: 1,
    minHeight: 40,
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
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: radius.md,
  },
  wideSegmentOption: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  summaryCard: {
    gap: spacing.sm,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  scopeList: {
    gap: 6,
  },
  scopeLine: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  scopeLabel: {
    width: 34,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  scopeValue: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  effectCard: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  effectCopy: {
    flex: 1,
    gap: 4,
  },
  effectTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  effectBody: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
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
