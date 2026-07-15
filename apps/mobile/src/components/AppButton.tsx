import React, { useRef } from "react";
import { Animated, Easing, Image, type ImageSourcePropType, Pressable, StyleSheet, Text } from "react-native";
import { uiIconAssets } from "../assets";
import { useAppTheme } from "../theme/AppThemeContext";
import { androidMaterialRipple, androidMaterialSurface } from "../theme/androidMaterial";
import { radius, spacing } from "../theme/tokens";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  tone?: "primary" | "secondary" | "warning";
  size?: "md" | "sm";
  accessibilityLabel?: string;
  disabled?: boolean;
};

export function AppButton({ label, onPress, tone = "primary", size = "md", accessibilityLabel, disabled = false }: AppButtonProps) {
  const theme = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const backgroundColor = tone === "primary" ? theme.clear : tone === "warning" ? theme.gold : theme.cardMuted;
  const borderColor = tone === "primary" ? theme.clear : theme.border;
  const color = tone === "primary" || tone === "warning" ? theme.onAccent : theme.text;
  const icon = getButtonIcon(label);

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
      android_ripple={androidMaterialRipple(theme, tone === "primary" || tone === "warning" ? "primary" : "surface")}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => animateTo(0.97)}
      onPressOut={() => animateTo(1)}
    >
      <Animated.View
        style={[
          styles.button,
          size === "sm" ? styles.buttonSm : null,
          tone === "secondary" ? androidMaterialSurface(theme, "cta") : null,
          { backgroundColor, borderColor, opacity: disabled ? 0.48 : pressOpacity, transform: [{ scale }] },
        ]}
      >
        <Image source={icon} style={[styles.icon, size === "sm" ? styles.iconSm : null, { tintColor: color }]} resizeMode="contain" />
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
  if (/(알림|출발|계속|다음|돌아가기|복귀|홈으로|닫기)/u.test(label)) return uiIconAssets.depart;
  if (/(설정|수정|정책|관리|동의)/u.test(label)) return uiIconAssets.settings;
  return uiIconAssets.check;
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
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
  label: {
    fontSize: 14,
    fontWeight: "900",
  },
  labelSm: {
    fontSize: 12,
  },
});
