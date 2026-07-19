import React from "react";
import { StyleSheet, View } from "react-native";
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
  return (
    <View style={styles.actions}>
      <AppButton
        label={primaryLabel}
        accessibilityLabel={primaryAccessibilityLabel}
        onPress={onPrimary}
        tone="warning"
      />
      {secondaryLabel && onSecondary ? (
        <AppButton
          label={secondaryLabel}
          accessibilityLabel={secondaryAccessibilityLabel ?? secondaryLabel}
          onPress={onSecondary}
          tone="secondary"
          variant="text"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.xs,
  },
});
