import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/AppThemeContext";
import { spacing } from "../theme/tokens";
import { AppButton } from "./AppButton";

type OnboardingFooterProps = {
  primaryLabel: string;
  onPrimary: () => void;
  primaryAccessibilityLabel?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
  secondaryAccessibilityLabel?: string;
};

export function OnboardingFooter({
  primaryLabel,
  onPrimary,
  primaryAccessibilityLabel,
  secondaryLabel,
  onSecondary,
  secondaryAccessibilityLabel,
}: OnboardingFooterProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.actions}>
      <AppButton
        label={primaryLabel}
        accessibilityLabel={primaryAccessibilityLabel}
        onPress={onPrimary}
        tone="warning"
      />
      {secondaryLabel && onSecondary ? (
        <Pressable
          accessibilityLabel={secondaryAccessibilityLabel ?? secondaryLabel}
          accessibilityRole="button"
          onPress={onSecondary}
          style={styles.secondaryAction}
        >
          <Text style={[styles.secondaryLabel, { color: theme.subtle }]}>{secondaryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.xs,
  },
  secondaryAction: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
});
