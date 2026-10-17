import { pageStyles } from "../theme/pageStyles";
import React from "react";
import { Image, type ImageSourcePropType, Platform, StyleSheet, Text, View, useWindowDimensions } from "../localization/react-native";
import { useAppTheme } from "../theme/AppThemeContext";
import { androidMaterialRipple, androidMaterialSurface } from "../theme/androidMaterial";
import { cardShadow, getToneColor, radius, spacing, type AppTheme } from "../theme/tokens";
import { useAmbientReadingSurface } from "./AmbientReadingSurface";
import { FeedbackPressable } from "./FeedbackPressable";

export type AppListTone = "clear" | "gold" | "sky" | "warm";

type AppListGroupProps = {
  children: React.ReactNode;
};

type AppListRowProps = {
  icon: ImageSourcePropType;
  title: string;
  subtitle?: string;
  value?: string;
  tone?: AppListTone;
  right?: React.ReactNode;
  divider?: boolean;
  contained?: boolean;
  ambientLayout?: "menu" | "setting";
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: "button" | "switch";
  accessibilityState?: { checked?: boolean; disabled?: boolean; selected?: boolean };
};

export function AppListGroup({ children }: AppListGroupProps) {
  const theme = useAppTheme();
  const ambient = useAmbientReadingSurface();
  return (
    <View
      style={[
        styles.group,
        Platform.OS === "android" ? styles.groupAndroid : null,
        { backgroundColor: theme.cardStrong, borderColor: theme.border },
        cardShadow(theme),
        androidMaterialSurface(theme, "surfaceContainer"),
        pageStyles.card,
        ambient && { ...pageStyles.unboxed, borderRadius: 0 },
      ]}
    >
      {children}
    </View>
  );
}

export function AppListRow({
  icon,
  title,
  subtitle,
  value,
  tone = "sky",
  right,
  divider = false,
  contained = false,
  ambientLayout,
  onPress,
  accessibilityLabel,
  accessibilityRole = "button",
  accessibilityState,
}: AppListRowProps) {
  const theme = useAppTheme();
  const ambient = useAmbientReadingSurface();
  const { width, fontScale } = useWindowDimensions();
  // Opt-in for M1/M3 only; other reading routes keep their current geometry.
  const editorial = Platform.OS === "ios" && ambient && ambientLayout !== undefined;
  const stackControl = editorial && ambientLayout === "setting" && right !== undefined
    && accessibilityRole !== "switch" && (width < 390 || fontScale > 1.15);
  const color = getToneColor(theme, tone);
  const trailing = right ?? (value ? <Text style={[styles.value, { fontWeight: "500", color }, editorial && styles.ambientValue]} numberOfLines={contained || editorial ? undefined : 1}>{value}</Text> : null);
  const content = (
    <>
      {divider && !ambient ? <View style={[styles.divider, { backgroundColor: theme.border }]} /> : null}
      <View style={[styles.iconFrame, { backgroundColor: `${color}16` }, pageStyles.quietIcon, editorial && styles.ambientIconFrame]}>
        <Image source={icon} style={[styles.icon, { tintColor: editorial ? theme.text : color }, editorial && styles.ambientIcon]} resizeMode="contain" accessibilityElementsHidden={editorial ? true : undefined} importantForAccessibility={editorial ? "no-hide-descendants" : undefined} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, pageStyles.body, { color: theme.text }, editorial && styles.ambientTitle]} numberOfLines={ambient ? undefined : 1}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, pageStyles.compactCaption, { color: theme.subtle }, editorial && styles.ambientSubtitle]} numberOfLines={ambient ? undefined : 1}>{subtitle}</Text> : null}
        {stackControl ? <View style={styles.stackedControl}>{trailing}</View> : null}
      </View>
      {stackControl ? null : trailing}
      {onPress && !ambient && accessibilityRole !== "switch" ? <Chevron color={theme.subtle} /> : null}
    </>
  );

  if (onPress) {
    return (
      <FeedbackPressable
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityRole={accessibilityRole}
        accessibilityState={accessibilityState}
        android_ripple={androidMaterialRipple(theme)}
        onPress={onPress}
        style={[styles.row, ambient && { paddingHorizontal: 0, paddingVertical: 18, borderTopWidth: StyleSheet.hairlineWidth, borderColor: theme.border }, ambient && contained && { paddingHorizontal: 8, paddingVertical: 12, borderTopWidth: divider ? StyleSheet.hairlineWidth : 0 }, editorial && styles.ambientRow, editorial && contained && styles.ambientContainedRow, stackControl && styles.stackedRow]}
      >
        {content}
      </FeedbackPressable>
    );
  }

  return <View style={[styles.row, ambient && { paddingHorizontal: 0, paddingVertical: 18, borderTopWidth: StyleSheet.hairlineWidth, borderColor: theme.border }, ambient && contained && { paddingHorizontal: 8, paddingVertical: 12, borderTopWidth: divider ? StyleSheet.hairlineWidth : 0 }, editorial && styles.ambientRow, editorial && contained && styles.ambientContainedRow, stackControl && styles.stackedRow]}>{content}</View>;
}

function Chevron({ color }: { color: string }) {
  return (
    <View style={styles.chevron} accessibilityElementsHidden>
      <View style={[styles.chevronTop, { backgroundColor: color }]} />
      <View style={[styles.chevronBottom, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  ambientRow: { minHeight: 76, paddingHorizontal: 0, paddingVertical: 12, gap: 12 },
  // The surface contributes 8pt; preserve another 12pt inside the full-width touch row.
  ambientContainedRow: { paddingHorizontal: 12 },
  ambientIconFrame: { width: 36, height: 40 },
  ambientIcon: { width: 32, height: 32 },
  ambientTitle: { fontSize: 17, lineHeight: 24, fontWeight: "600" },
  ambientSubtitle: { fontSize: 14, lineHeight: 20, fontWeight: "400" },
  ambientValue: { fontSize: 14, lineHeight: 20 },
  stackedRow: { alignItems: "flex-start", paddingVertical: 16 },
  stackedControl: { marginTop: 9, alignSelf: "stretch" },
  group: {
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  groupAndroid: {
    borderWidth: 1,
  },
  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: spacing.sm,
  },
  divider: {
    position: "absolute",
    top: 0,
    left: 66,
    right: 14,
    height: StyleSheet.hairlineWidth,
  },
  iconFrame: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  icon: {
    width: 24,
    height: 24,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
  },
  value: {
    maxWidth: 82,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
    textAlign: "right",
  },
  chevron: {
    width: 14,
    height: 18,
  },
  chevronTop: {
    position: "absolute",
    right: 2,
    top: 5,
    width: 8,
    height: 1.6,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  chevronBottom: {
    position: "absolute",
    right: 2,
    top: 10,
    width: 8,
    height: 1.6,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }],
  },
});
