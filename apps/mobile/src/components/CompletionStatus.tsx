import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Image, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing } from "../theme/tokens";

type CompletionStatusProps = {
  visible: boolean;
  title: string;
  message: string;
  compact?: boolean;
};

// 완료 상태는 한 번만 짧게 강조하고, 바로 다음 행동을 고를 수 있게 유지한다.
export function CompletionStatus({ visible, title, message, compact = false }: CompletionStatusProps) {
  const theme = useAppTheme();
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduceMotionEnabled(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotionEnabled);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    progress.stopAnimation();
    if (!visible) {
      progress.setValue(0);
      return;
    }
    if (reduceMotionEnabled) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, reduceMotionEnabled, visible]);

  if (!visible) return null;

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        styles.card,
        compact && styles.cardCompact,
        { backgroundColor: theme.cardStrong, borderColor: theme.clear, shadowColor: theme.shadow, opacity: progress, transform: [{ scale }] },
        cardShadow(theme),
      ]}
    >
      <View style={[styles.mark, compact && styles.markCompact, { backgroundColor: `${theme.clear}18` }]}>
        <Image source={uiIconAssets.check} style={[styles.icon, compact && styles.iconCompact, { tintColor: theme.clear }]} resizeMode="contain" />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, compact && styles.titleCompact, { color: theme.clear }]}>{title}</Text>
        <Text style={[styles.message, compact && styles.messageCompact, { color: theme.muted }]} numberOfLines={compact ? 1 : undefined}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  cardCompact: {
    minHeight: 58,
    paddingVertical: spacing.sm,
  },
  mark: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  markCompact: {
    width: 34,
    height: 34,
  },
  icon: {
    width: 22,
    height: 22,
  },
  iconCompact: {
    width: 18,
    height: 18,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "900",
  },
  titleCompact: {
    fontSize: 13,
  },
  message: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  messageCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
});
