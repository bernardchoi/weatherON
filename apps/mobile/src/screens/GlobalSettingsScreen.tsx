import { pageStyles } from "../theme/pageStyles";
import React from "react";
import { Animated, Easing, Image, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "../localization/react-native";
import { uiIconAssets } from "../assets";
import { ambientUiIcons } from "../ambientAssets";
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
import { ambientPalette } from "../theme/ambientSurface";
import { useConfirmedOptionFeedback } from "../hooks/useConfirmedOptionFeedback";
import { useReducedMotion } from "../hooks/useReducedMotion";

const screenIcons = Platform.OS === "ios" ? { ...uiIconAssets, uv: ambientUiIcons.temperature, clearNight: ambientUiIcons.temperature, pin: ambientUiIcons.location, shirt: ambientUiIcons.tabOutfit, depart: ambientUiIcons.tabDepart, rain: ambientUiIcons.umbrella, umbrella: ambientUiIcons.umbrella, myAlerts: ambientUiIcons.notifications, myDisplay: ambientUiIcons.settings, settings: ambientUiIcons.settings, tabMy: ambientUiIcons.tabMy, check: ambientUiIcons.check } : uiIconAssets;

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
  const ambient = Platform.OS === "ios";

  return (
    <View style={[styles.shell, { backgroundColor: Platform.OS === "ios" ? "transparent" : theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            width: "100%",
            maxWidth: layout.contentMaxWidth,
            gap: ambient ? 8 : layout.settingsContentGap,
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
              ambient && ambientVisual.title,
            ]}
          >
            표시 설정
          </Text>
        </View>

        <Text style={[[styles.groupLabel, { color: theme.subtle }], Platform.OS === "ios" && ambientVisual.groupLabel]}>기본 표시</Text>

        <AppListGroup>
          <AppListRow
            ambientLayout="setting"
            icon={screenIcons.uv}
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
            ambientLayout="setting"
            icon={screenIcons.pin}
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
          {ambient ? <AppListRow
            ambientLayout="setting"
            icon={screenIcons.myDisplay}
            title="테마"
            subtitle="앱 전체 색상"
            divider
            right={<SegmentControl
              label="테마"
              options={(["system", "light", "dark"] as const).map((mode) => ({
                label: getThemeModeLabel(mode),
                active: themeMode === mode,
                onPress: () => onSetThemeMode(mode),
              }))}
            />}
          /> : null}
        </AppListGroup>

        {!ambient ? <View style={[[styles.themePanel, pageStyles.card, { backgroundColor: theme.card, borderColor: theme.border }], Platform.OS === "ios" && ambientVisual.themePanel]}>
          <View style={styles.themeCopy}>
            <Image source={screenIcons.myDisplay} style={[styles.themeIcon, { tintColor: theme.clear }]} resizeMode="contain" />
            <View>
              <Text style={[[styles.themeTitle, { color: theme.text }], Platform.OS === "ios" && ambientVisual.themeTitle]}>테마</Text>
              <Text style={[[styles.themeBody, { color: theme.subtle }], Platform.OS === "ios" && ambientVisual.themeBody]}>앱 전체 색상</Text>
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
        </View> : null}

        <Text style={[[styles.groupLabel, { color: theme.subtle }], Platform.OS === "ios" && ambientVisual.groupLabel]}>화면</Text>

        <AppListGroup>
          <AppListRow
            ambientLayout="setting"
            icon={screenIcons.settings}
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
              icon={screenIcons.myDisplay}
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
          style={[styles.footerLinks, ambient && ambientVisual.footerLinks]}
        >
          <Text style={[[styles.footerText, { color: theme.subtle }], Platform.OS === "ios" && ambientVisual.footerText]}>WeatherON v1.0.0</Text>
        </View>

        {!ambient ? <View style={styles.bottomSpacer} /> : null}
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
  const { width, fontScale } = useWindowDimensions();
  const ambient = Platform.OS === "ios";
  const stacked = ambient && (width < 390 || fontScale > 1.15);
  const verticalOptions = stacked && (options.length > 2 || fontScale > 1.6);
  const palette = ambientPalette(theme);
  const feedback = useConfirmedOptionFeedback(options.find(option => option.active)?.label ?? "");
  return (
    <View
      style={[
        styles.segmentControl,
        Platform.OS === "android" ? styles.materialBorder : null,
        fullWidth ? styles.segmentControlFull : null,
        layout.isShort && !fullWidth ? styles.segmentControlShort : null,
        { backgroundColor: theme.nav, borderColor: theme.border },
        androidMaterialSurface(theme, "surfaceContainer"),
        ambient && { width: options.length > 2 ? 192 : 160, minHeight: 48, padding: 2, borderWidth: StyleSheet.hairlineWidth, backgroundColor: "transparent" },
        ambient && (fullWidth || stacked) && { width: "100%" },
        verticalOptions && { flexDirection: "column", alignItems: "stretch" },
      ]}
    >
      {options.map((option) => (
        <FeedbackPressable
          key={option.label}
          accessibilityLabel={`${label} ${option.label}`}
          accessibilityRole="button"
          accessibilityState={{ selected: option.active }}
          android_ripple={androidMaterialRipple(theme)}
          hapticFeedback={ambient ? "none" : "automatic"}
          onPress={() => { feedback.request(option.label); option.onPress(); }}
          style={[
            styles.segmentOption,
            option.active ? androidMaterialSurface(theme, "secondaryContainer") : null,
            { backgroundColor: option.active ? androidMaterialColor(theme, "secondaryContainer") : "transparent" },
            ambient && { minHeight: 44, backgroundColor: option.active ? palette.selected : "transparent" },
            verticalOptions && { flex: 0, paddingVertical: 8 },
          ]}
        >
          <Text
            style={[[
              styles.segmentText,
              { color: option.active ? androidMaterialColor(theme, "onSecondaryContainer") : theme.subtle },
            ], ambient && ambientVisual.segmentText, ambient && { color: option.active ? theme.clear : theme.subtle }]}
          >
            {option.label}
          </Text>
          {verticalOptions && option.active ? <Image source={ambientUiIcons.check} accessible={false} style={{ width: 16, height: 16, tintColor: theme.clear }} /> : null}
        </FeedbackPressable>
      ))}
    </View>
  );
}

function MaterialSwitch({ enabled }: { enabled: boolean }) {
  const theme = useAppTheme();
  const progress = React.useRef(new Animated.Value(enabled ? 1 : 0)).current;
  const reducedMotion = useReducedMotion();
  const iosReducedMotion = Platform.OS === "ios" ? reducedMotion : false;

  React.useEffect(() => {
    if (iosReducedMotion !== false) {
      progress.stopAnimation();
      progress.setValue(enabled ? 1 : 0);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: enabled ? 1 : 0,
      duration: 160,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [enabled, progress, iosReducedMotion]);

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
            backgroundColor: Platform.OS === "ios" ? "#FFFFFF" : enabled ? androidMaterialColor(theme, "onPrimary") : theme.subtle,
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

// Approved iOS Ambient hierarchy; Android retains its existing presentation.
const ambientVisual = StyleSheet.create({
  title: { fontSize: 26, lineHeight: 34 },
  footerLinks: { alignItems: "flex-start", marginTop: 24 },
  "themePanel": {
    "backgroundColor": "transparent",
    "borderWidth": 0,
    "borderRadius": 0,
    "shadowOpacity": 0,
    "elevation": 0,
    "paddingHorizontal": 0,
    "paddingVertical": 18,
    "gap": 16
  },
  "groupLabel": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500",
    "marginTop": 16
  },
  "themeTitle": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  },
  "themeBody": {
    "fontSize": 14,
    "lineHeight": 21,
    "fontWeight": "400"
  },
  "footerText": {
    "fontSize": 14,
    "lineHeight": 21,
    "fontWeight": "400"
  },
  "segmentText": {
    "fontSize": 15,
    "lineHeight": 21,
    "fontWeight": "600"
  }
});
