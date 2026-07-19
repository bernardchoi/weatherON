import React from "react";
import { Image, type ImageSourcePropType, Platform, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/AppThemeContext";
import { androidMaterialRipple, androidMaterialSurface } from "../theme/androidMaterial";
import { cardShadow, radius, spacing, type AppTheme } from "../theme/tokens";
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
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: "button" | "switch";
  accessibilityState?: { checked?: boolean; disabled?: boolean; selected?: boolean };
};

export function AppListGroup({ children }: AppListGroupProps) {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.group,
        Platform.OS === "android" ? styles.groupAndroid : null,
        { backgroundColor: theme.cardStrong, borderColor: theme.border },
        cardShadow(theme),
        androidMaterialSurface(theme, "surfaceContainer"),
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
  onPress,
  accessibilityLabel,
  accessibilityRole = "button",
  accessibilityState,
}: AppListRowProps) {
  const theme = useAppTheme();
  const color = getToneColor(theme, tone);
  const content = (
    <>
      {divider ? <View style={[styles.divider, { backgroundColor: theme.border }]} /> : null}
      <View style={[styles.iconFrame, { backgroundColor: `${color}16` }]}>
        <Image source={icon} style={[styles.icon, { tintColor: color }]} resizeMode="contain" />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.subtle }]} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right ?? (value ? <Text style={[styles.value, { color }]} numberOfLines={1}>{value}</Text> : null)}
      {onPress && accessibilityRole !== "switch" ? <Chevron color={theme.subtle} /> : null}
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
        style={styles.row}
      >
        {content}
      </FeedbackPressable>
    );
  }

  return <View style={styles.row}>{content}</View>;
}

function getToneColor(theme: AppTheme, tone: AppListTone) {
  if (tone === "clear") return theme.clear;
  if (tone === "gold") return theme.gold;
  if (tone === "warm") return theme.warm;
  return theme.sky;
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
