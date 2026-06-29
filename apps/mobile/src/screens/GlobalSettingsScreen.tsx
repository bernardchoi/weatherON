import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

type SettingTone = "clear" | "gold" | "sky" | "warm";

export function GlobalSettingsScreen({
  locationReady,
  permissionReady,
  permissionGateResult,
  temperatureUnit,
  weightUnit,
  distanceUnit,
  themeMode,
  reducedTransparency,
  onNavigate,
  onRequestPermissionGate,
  onSetTemperatureUnit,
  onSetWeightUnit,
  onSetDistanceUnit,
  onSetThemeMode,
  onToggleReducedTransparency,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const unitSummary = `${temperatureUnit === "celsius" ? "°C" : "°F"} · ${getWeightUnitLabel(weightUnit)} · ${getDistanceUnitLabel(distanceUnit)}`;
  const stateSummary = `${unitSummary} · 테마 ${getThemeModeLabel(themeMode)} · 위치 관리 · ${permissionReady ? "권한 정상" : "권한 확인 필요"}`;

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.statusBar}>
          <Text style={[styles.statusText, { color: theme.text }]}>9:41</Text>
          <Text style={[styles.statusText, { color: theme.subtle }]}>••• 5G</Text>
        </View>

        <View style={styles.header}>
          <Pressable accessibilityLabel="뒤로" accessibilityRole="button" onPress={() => onNavigate("M1")} style={[styles.backButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <ChevronLeft color={theme.muted} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>전역 설정</Text>
        </View>

        {permissionGateResult?.returnTo === "M3" ? (
          <View style={[styles.resultStrip, { backgroundColor: theme.cardStrong, borderColor: theme.clear }]}>
            <Text style={[styles.resultText, { color: theme.text }]}>{permissionGateResult.message}</Text>
            <Text style={[styles.resultMeta, { color: theme.subtle }]}>권한 확인 후 전역 설정으로 복귀함</Text>
          </View>
        ) : null}

        <View style={[styles.unitCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionLabel, { color: theme.muted }]}>단위 설정</Text>
          <SegmentRow
            label="온도"
            options={[
              { label: "°C", active: temperatureUnit === "celsius", onPress: () => onSetTemperatureUnit("celsius") },
              { label: "°F", active: temperatureUnit === "fahrenheit", onPress: () => onSetTemperatureUnit("fahrenheit") },
            ]}
            theme={theme}
          />
          <SegmentRow
            label="무게"
            options={[
              { label: "킬로그램", active: weightUnit === "kilogram", onPress: () => onSetWeightUnit("kilogram") },
              { label: "파운드", active: weightUnit === "pound", onPress: () => onSetWeightUnit("pound") },
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

        <SettingRow
          icon="pin"
          title="위치 관리"
          body={locationReady ? "현재 위치 자동 감지 가능" : "2곳 저장됨"}
          tone={locationReady ? "clear" : "sky"}
          accessory="chevron"
          onPress={() => onNavigate("H2")}
          theme={theme}
        />

        <View style={[styles.themeCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
          <Text style={[styles.sectionLabel, { color: theme.muted }]}>테마</Text>
          <View style={[styles.wideSegment, { backgroundColor: theme.nav }]}>
            {(["system", "light", "dark"] as const).map((mode) => (
              <Pressable
                key={mode}
                accessibilityRole="button"
                onPress={() => onSetThemeMode(mode)}
                style={[styles.wideSegmentOption, { backgroundColor: themeMode === mode ? theme.gold : "transparent" }]}
              >
                <Text style={[styles.segmentText, { color: themeMode === mode ? theme.onAccent : theme.subtle }]}>{getThemeModeLabel(mode)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <SettingRow
          icon="bell"
          title="알림 권한 관리"
          body={permissionReady ? "시스템 알림 허용됨" : "시스템 설정으로 이동"}
          tone={permissionReady ? "clear" : "warm"}
          accessory="external"
          onPress={() => onRequestPermissionGate("notification", "M3", "general")}
          theme={theme}
        />

        <Pressable accessibilityRole="switch" accessibilityState={{ checked: reducedTransparency }} onPress={onToggleReducedTransparency} style={[styles.globalCard, { backgroundColor: theme.cardStrong, borderColor: theme.gold }]}>
          <Text style={[styles.globalLabel, { color: theme.gold }]}>전역</Text>
          <Text style={[styles.globalText, { color: theme.text }]}>{stateSummary}</Text>
          <Text style={[styles.globalMeta, { color: theme.subtle }]}>투명 효과 {reducedTransparency ? "줄임" : "기본"} · 탭해서 전환</Text>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={() => onNavigate("R1")} style={styles.footerLinks}>
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
            accessibilityRole="button"
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

function SettingRow({
  icon,
  title,
  body,
  tone,
  accessory,
  onPress,
  theme,
}: {
  icon: "pin" | "bell";
  title: string;
  body: string;
  tone: SettingTone;
  accessory: "chevron" | "external";
  onPress: () => void;
  theme: AppTheme;
}) {
  const color = getToneColor(theme, tone);
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.settingRow, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
      <View style={styles.settingIcon}>
        <SettingIcon type={icon} color={color} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.rowBody, { color: theme.subtle }]} numberOfLines={1}>{body}</Text>
      </View>
      {accessory === "external" ? <ExternalIcon color={theme.subtle} /> : <ChevronRight color={theme.subtle} />}
    </Pressable>
  );
}

function SettingIcon({ type, color }: { type: "pin" | "bell"; color: string }) {
  if (type === "bell") return <BellGlyph color={color} />;
  return <PinGlyph color={color} />;
}

function PinGlyph({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.pinHead, { borderColor: color }]} />
      <View style={[styles.pinPoint, { backgroundColor: color }]} />
    </View>
  );
}

function BellGlyph({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.bellCup, { borderColor: color }]} />
      <View style={[styles.bellBase, { backgroundColor: color }]} />
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

function ChevronRight({ color }: { color: string }) {
  return (
    <View style={styles.chevronRight} accessibilityElementsHidden>
      <View style={[styles.chevronRightTop, { backgroundColor: color }]} />
      <View style={[styles.chevronRightBottom, { backgroundColor: color }]} />
    </View>
  );
}

function ExternalIcon({ color }: { color: string }) {
  return (
    <View style={styles.externalIcon} accessibilityElementsHidden>
      <View style={[styles.externalBox, { borderColor: color }]} />
      <View style={[styles.externalStem, { backgroundColor: color }]} />
      <View style={[styles.externalArrowA, { backgroundColor: color }]} />
      <View style={[styles.externalArrowB, { backgroundColor: color }]} />
    </View>
  );
}

function getToneColor(theme: AppTheme, tone: SettingTone) {
  if (tone === "gold") return theme.gold;
  if (tone === "sky") return theme.sky;
  if (tone === "warm") return theme.warm;
  return theme.clear;
}

function getThemeModeLabel(mode: P0ScreenProps["themeMode"]) {
  if (mode === "light") return "라이트";
  if (mode === "dark") return "다크";
  return "시스템";
}

function getWeightUnitLabel(unit: P0ScreenProps["weightUnit"]) {
  return unit === "pound" ? "파운드" : "킬로그램";
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
  resultStrip: {
    gap: 4,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  resultText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  resultMeta: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
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
  settingRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  settingIcon: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },
  rowBody: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
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
  iconFrame: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pinHead: {
    width: 12,
    height: 12,
    borderWidth: 1.7,
    borderRadius: radius.pill,
  },
  pinPoint: {
    width: 2,
    height: 6,
    borderRadius: 2,
    marginTop: -1,
  },
  bellCup: {
    width: 13,
    height: 12,
    borderWidth: 1.7,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 0,
  },
  bellBase: {
    width: 12,
    height: 2,
    borderRadius: 2,
    marginTop: 1,
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
  chevronRight: {
    width: 16,
    height: 16,
    justifyContent: "center",
  },
  chevronRightTop: {
    position: "absolute",
    right: 4,
    width: 9,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }, { translateY: -3 }],
  },
  chevronRightBottom: {
    position: "absolute",
    right: 4,
    width: 9,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }, { translateY: 3 }],
  },
  externalIcon: {
    width: 18,
    height: 18,
  },
  externalBox: {
    position: "absolute",
    left: 2,
    bottom: 2,
    width: 10,
    height: 10,
    borderWidth: 1.4,
    borderRadius: 2,
  },
  externalStem: {
    position: "absolute",
    right: 3,
    top: 4,
    width: 10,
    height: 1.6,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }],
  },
  externalArrowA: {
    position: "absolute",
    right: 3,
    top: 3,
    width: 6,
    height: 1.6,
    borderRadius: 2,
  },
  externalArrowB: {
    position: "absolute",
    right: 3,
    top: 3,
    width: 1.6,
    height: 6,
    borderRadius: 2,
  },
});
