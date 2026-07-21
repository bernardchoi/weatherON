import React, { useRef } from "react";
import { Animated, Easing, Image, type ImageSourcePropType, Platform, Pressable, StyleSheet, Text } from "react-native";
import { uiIconAssets } from "../assets";
import { useAppTheme } from "../theme/AppThemeContext";
import { androidMaterialColor, androidMaterialRipple, androidMaterialSurface } from "../theme/androidMaterial";
import { iosGlassSurface, type IosGlassRole } from "../theme/iosGlass";
import { colorWithAlpha, radius, spacing } from "../theme/tokens";
import { IosGlassBackdrop } from "./IosGlassBackdrop";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  tone?: "primary" | "secondary" | "warning";
  variant?: "filled" | "tonal" | "outlined" | "text";
  size?: "md" | "sm";
  accessibilityLabel?: string;
  disabled?: boolean;
};

export function AppButton({
  label,
  onPress,
  tone = "primary",
  variant,
  size = "md",
  accessibilityLabel,
  disabled = false,
}: AppButtonProps) {
  const theme = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const resolvedVariant = variant ?? (tone === "secondary" ? "tonal" : "filled");
  const filledColor = tone === "warning" ? theme.gold : theme.clear;
  const foregroundColor = tone === "warning" ? theme.gold : tone === "primary" ? theme.clear : theme.text;
  const backgroundColor = resolvedVariant === "filled"
    ? filledColor
    : resolvedVariant === "tonal"
      ? androidMaterialColor(theme, "secondaryContainer")
      : "transparent";
  const borderColor = resolvedVariant === "filled"
    ? filledColor
    : resolvedVariant === "outlined"
      ? androidMaterialColor(theme, "outlineVariant")
      : "transparent";
  const color = resolvedVariant === "filled"
    ? theme.onAccent
    : resolvedVariant === "tonal"
      ? androidMaterialColor(theme, "onSecondaryContainer")
      : foregroundColor;
  const icon = getButtonIcon(label);
  const glassRole: IosGlassRole = resolvedVariant === "filled" ? "buttonPrimary" : "buttonSecondary";
  const usesIosGlass = Platform.OS === "ios" && resolvedVariant !== "text" && !theme.reducedTransparency;
  const glassSurface = usesIosGlass ? iosGlassSurface(theme, glassRole, { nativeBackdrop: true }) : null;
  const glassOverlayColor = resolvedVariant === "filled"
    ? colorWithAlpha(filledColor, tone === "warning" ? 0.3 : 0.24)
    : colorWithAlpha(theme.card, theme.name === "light" ? 0.12 : 0.08);

  const animateTo = (toValue: number) => {
    Animated.timing(scale, {
      toValue,
      duration: 110,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };
  const pressOpacity = scale.interpolate({ inputRange: [0.97, 1], outputRange: [0.88, 1] });

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      android_ripple={androidMaterialRipple(theme, resolvedVariant === "filled" ? "primary" : "surface")}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => animateTo(0.97)}
      onPressOut={() => animateTo(1)}
      style={[styles.pressable, Platform.OS === "android" ? styles.pressableAndroid : null]}
    >
      <Animated.View
        style={[
          styles.button,
          size === "sm" ? styles.buttonSm : null,
          Platform.OS === "android" ? styles.buttonAndroid : null,
          Platform.OS === "android" && size === "sm" ? styles.buttonSmAndroid : null,
          resolvedVariant === "tonal" ? androidMaterialSurface(theme, "secondaryContainer") : null,
          { backgroundColor, borderColor, opacity: disabled ? 0.48 : pressOpacity, transform: [{ scale }] },
          glassSurface,
        ]}
      >
        {glassSurface ? (
          <IosGlassBackdrop
            theme={theme}
            role={glassRole}
            overlayColor={glassOverlayColor}
            style={size === "sm" ? styles.glassBackdropSm : styles.glassBackdrop}
          />
        ) : null}
        {resolvedVariant !== "text" ? (
          <Image source={icon} style={[styles.icon, size === "sm" ? styles.iconSm : null, { tintColor: color }]} resizeMode="contain" />
        ) : null}
        <Text style={[styles.label, size === "sm" ? styles.labelSm : null, { color }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

function getButtonIcon(label: string): ImageSourcePropType {
  if (/(삭제|해제|제거)/u.test(label)) return uiIconAssets.trash;
  if (/(우산|비|날씨|제보)/u.test(label)) return uiIconAssets.umbrella;
  if (/(코디|옷|아이템)/u.test(label)) return uiIconAssets.shirt;
  if (/(목적지|장소|위치|도시|핀)/u.test(label)) return uiIconAssets.pin;
  if (/알림/u.test(label)) return uiIconAssets.myAlerts;
  if (/(출발|계속|다음|돌아가기|복귀|홈으로|닫기)/u.test(label)) return uiIconAssets.depart;
  if (/(설정|수정|정책|관리|동의)/u.test(label)) return uiIconAssets.settings;
  return uiIconAssets.check;
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radius.md,
  },
  pressableAndroid: {
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  button: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  buttonAndroid: {
    minHeight: 48,
    borderRadius: radius.pill,
  },
  icon: {
    width: 17,
    height: 17,
  },
  iconSm: {
    width: 14,
    height: 14,
  },
  buttonSm: {
    minHeight: 34,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  buttonSmAndroid: {
    minHeight: 40,
    borderRadius: radius.pill,
  },
  glassBackdrop: {
    borderRadius: radius.md,
  },
  glassBackdropSm: {
    borderRadius: radius.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: "900",
  },
  labelSm: {
    fontSize: 12,
  },
});
