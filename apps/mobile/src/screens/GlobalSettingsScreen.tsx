import { pageStyles } from "../theme/pageStyles";
import React from "react";
import { Animated, Easing, Image, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import { AppListGroup, AppListRow } from "../components/AppListRow";
import { BackButton } from "../components/BackButton";
import { FeedbackPressable } from "../components/FeedbackPressable";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import {
  androidMaterialColor,
  androidMaterialRipple,
  androidMaterialSurface,
  isAndroidDynamicColorAvailable,
} from "../theme/androidMaterial";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { radius, spacing } from "../theme/tokens";

export function GlobalSettingsScreen({
  temperatureUnit,
  distanceUnit,
  themeMode,
  reducedTransparency,
  dynamicColorEnabled,
  onNavigate,
  onSetTemperatureUnit,
  onSetDistanceUnit,
  onSetThemeMode,
  onToggleReducedTransparency,
  onToggleDynamicColor,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            width: "100%",
            maxWidth: layout.contentMaxWidth,
            gap: layout.settingsContentGap,
            paddingHorizontal: layout.screenHorizontalPadding,
            paddingTop: layout.weatherTopPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >

        <View style={[styles.header, { minHeight: layout.settingsHeaderMinHeight }, pageStyles.header]}>
          <BackButton onPress={() => onNavigate("M1")} />
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
                fontSize: layout.screenTitleFontSize,
                lineHeight: layout.screenTitleLineHeight,
              },
              pageStyles.title,
            ]}
          >
            표시 설정
          </Text>
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
        </AppListGroup>

        <View style={[styles.themePanel, pageStyles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.themeCopy}>
            <Image source={uiIconAssets.myDisplay} style={[styles.themeIcon, { tintColor: theme.clear }]} resizeMode="contain" />
            <View>
              <Text style={[styles.themeTitle, { color: theme.text }]}>테마</Text>
              <Text style={[styles.themeBody, { color: theme.subtle }]}>앱 전체 색상</Text>
            </View>
          </View>
          <SegmentControl
            label="테마"
            fullWidth
            options={(["system", "light", "dark"] as const).map((mode) => ({
              label: getThemeModeLabel(mode),
              active: themeMode === mode,
              onPress: () => onSetThemeMode(mode),
            }))}
          />
        </View>

        <Text style={[styles.groupLabel, { color: theme.subtle }]}>화면</Text>

        <AppListGroup>
          <AppListRow
            icon={uiIconAssets.settings}
            title="투명 효과 줄이기"
            subtitle={reducedTransparency ? "반투명 패널·탭 바를 단색으로 표시" : "기본 투명 효과 사용"}
            tone="sky"
            right={(
              <MaterialSwitch enabled={reducedTransparency} />
            )}
            accessibilityLabel={`투명 효과 줄이기 ${reducedTransparency ? "켜짐" : "꺼짐"}`}
            accessibilityRole="switch"
            accessibilityState={{ checked: reducedTransparency }}
            onPress={onToggleReducedTransparency}
          />
          {isAndroidDynamicColorAvailable() ? (
            <AppListRow
              icon={uiIconAssets.myDisplay}
              title="기기 색상 사용"
              subtitle="탭·선택·스위치에 시스템 강조색 적용"
              tone="clear"
              divider
              right={<MaterialSwitch enabled={dynamicColorEnabled} />}
              accessibilityLabel={`기기 색상 사용 ${dynamicColorEnabled ? "켜짐" : "꺼짐"}`}
              accessibilityRole="switch"
              accessibilityState={{ checked: dynamicColorEnabled }}
              onPress={onToggleDynamicColor}
            />
          ) : null}
        </AppListGroup>

        <View
          accessibilityLabel="표시 설정 버전 정보"
          style={styles.footerLinks}
        >
          <Text style={[styles.footerText, { color: theme.subtle }]}>WeatherON v1.0.0</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function SegmentControl({
  label,
  options,
  fullWidth = false,
}: {
  label: string;
  options: { label: string; active: boolean; onPress: () => void }[];
  fullWidth?: boolean;
}) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  return (
    <View
      style={[
        styles.segmentControl,
        Platform.OS === "android" ? styles.materialBorder : null,
        fullWidth ? styles.segmentControlFull : null,
        layout.isShort && !fullWidth ? styles.segmentControlShort : null,
        { backgroundColor: theme.nav, borderColor: theme.border },
        androidMaterialSurface(theme, "surfaceContainer"),
      ]}
    >
      {options.map((option) => (
        <FeedbackPressable
          key={option.label}
          accessibilityLabel={`${label} ${option.label}`}
          accessibilityRole="button"
          accessibilityState={{ selected: option.active }}
          android_ripple={androidMaterialRipple(theme)}
          onPress={option.onPress}
          style={[
            styles.segmentOption,
            option.active ? androidMaterialSurface(theme, "secondaryContainer") : null,
            { backgroundColor: option.active ? androidMaterialColor(theme, "secondaryContainer") : "transparent" },
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              { color: option.active ? androidMaterialColor(theme, "onSecondaryContainer") : theme.subtle },
            ]}
          >
            {option.label}
          </Text>
        </FeedbackPressable>
      ))}
    </View>
  );
}

function MaterialSwitch({ enabled }: { enabled: boolean }) {
  const theme = useAppTheme();
  const progress = React.useRef(new Animated.Value(enabled ? 1 : 0)).current;

  React.useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: enabled ? 1 : 0,
      duration: 160,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [enabled, progress]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, Platform.OS === "android" ? 18 : 20] });
  return (
    <View
      style={[
        styles.effectSwitchTrack,
        Platform.OS === "android" ? styles.effectSwitchTrackAndroid : null,
        {
          backgroundColor: enabled
            ? androidMaterialColor(theme, "primary")
            : androidMaterialColor(theme, "surfaceContainerHigh"),
          borderColor: enabled ? androidMaterialColor(theme, "primary") : androidMaterialColor(theme, "outlineVariant"),
        },
      ]}
    >
      <Animated.View
        style={[
          styles.effectSwitchKnob,
          {
            backgroundColor: enabled ? androidMaterialColor(theme, "onPrimary") : theme.subtle,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

function getThemeModeLabel(mode: P0ScreenProps["themeMode"]) {
  if (mode === "light") return "라이트";
  if (mode === "dark") return "다크";
  return "시스템";
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    minHeight: "100%",
    paddingBottom: spacing.xl,
    alignSelf: "center",
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
  segmentControl: {
    width: 128,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: radius.md,
  },
  segmentControlFull: { width: "100%", minHeight: 56 },
  segmentControlShort: {
    width: 116,
  },
  segmentOption: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    paddingHorizontal: 4,
  },
  segmentText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  effectSwitchTrack: {
    width: 50,
    height: 30,
    justifyContent: "center",
    padding: 3,
    borderRadius: radius.pill,
  },
  effectSwitchTrackAndroid: {
    width: 52,
    height: 32,
    borderWidth: 2,
  },
  materialBorder: {
    borderWidth: 1,
  },
  effectSwitchKnob: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
  },
  footerLinks: {
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  themePanel: { gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1 },
  themeCopy: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  themeIcon: { width: 24, height: 24 },
  themeTitle: { fontSize: 15, lineHeight: 20, fontWeight: "900" },
  themeBody: { fontSize: 12, lineHeight: 17, fontWeight: "600" },
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
