import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, PanResponder, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/AppThemeContext";
import { androidMaterialColor, androidMaterialRipple } from "../theme/androidMaterial";
import { radius, spacing } from "../theme/tokens";
import { FeedbackPressable } from "./FeedbackPressable";

type MaterialSnackbarProps = {
  message: string;
  supportingText?: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  duration?: number;
};

export function MaterialSnackbar({
  message,
  supportingText,
  actionLabel,
  onAction,
  onDismiss,
  duration = 3800,
}: MaterialSnackbarProps) {
  const theme = useAppTheme();
  const [visible, setVisible] = useState(true);
  const progress = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const dismissedRef = useRef(false);
  const dismissRef = useRef<() => void>(() => {});

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    Animated.parallel([
      Animated.timing(progress, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(dragY, {
        toValue: 72,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) return;
      setVisible(false);
      onDismiss?.();
    });
  }, [dragY, onDismiss, progress]);

  dismissRef.current = dismiss;
  const swipeResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderMove: (_, gesture) => dragY.setValue(Math.max(0, gesture.dy)),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > 44 || gesture.vy > 0.7) {
        dismissRef.current();
        return;
      }
      Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
    },
    onPanResponderTerminate: () => Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start(),
  })).current;

  useEffect(() => {
    const enter = Animated.timing(progress, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    enter.start();
    const timer = setTimeout(dismiss, duration);

    return () => {
      clearTimeout(timer);
      enter.stop();
    };
  }, [dismiss, duration, progress]);

  if (!visible) return null;

  const translateY = Animated.add(progress.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }), dragY);
  const foreground = androidMaterialColor(theme, "inverseOnSurface");
  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <Animated.View
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        accessibilityHint="아래로 쓸어내려 닫기"
        {...swipeResponder.panHandlers}
        style={[
          styles.snackbar,
          {
            backgroundColor: androidMaterialColor(theme, "inverseSurface"),
            opacity: progress,
            shadowColor: theme.shadow,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.copy}>
          <Text style={[styles.message, { color: foreground }]} numberOfLines={1}>{message}</Text>
          {supportingText ? <Text style={[styles.supportingText, { color: foreground }]} numberOfLines={1}>{supportingText}</Text> : null}
        </View>
        {actionLabel && onAction ? (
          <FeedbackPressable
            accessibilityLabel={actionLabel}
            accessibilityRole="button"
            android_ripple={androidMaterialRipple(theme)}
            onPress={() => {
              onAction();
              dismiss();
            }}
            style={styles.action}
          >
            <Text style={[styles.actionLabel, { color: androidMaterialColor(theme, "inversePrimary") }]}>{actionLabel}</Text>
          </FeedbackPressable>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: spacing.md,
  },
  snackbar: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  message: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  supportingText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    opacity: 0.82,
  },
  action: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  actionLabel: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
});
