import React from "react";
import { Image, type ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, semanticColor, spacing } from "../theme/tokens";

type VisualTone = "clear" | "gold" | "sky";

export type OnboardingVisualItem = {
  label: string;
  value: string;
  icon: ImageSourcePropType;
  tone: VisualTone;
};

type OnboardingVisualStripProps = {
  items: OnboardingVisualItem[];
};

export function OnboardingVisualStrip({ items }: OnboardingVisualStripProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.row}>
      {items.map((item) => {
        const accent = theme[item.tone];
        return (
          <View
            key={`${item.label}-${item.value}`}
            accessible
            accessibilityLabel={`${item.label} ${item.value}`}
            style={[styles.item, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
          >
            <View style={[styles.iconFrame, { backgroundColor: semanticColor(theme, item.tone === "clear" ? "successTint" : item.tone === "gold" ? "accentTint" : "infoTint") }]}>
              <Image source={item.icon} style={[styles.icon, { tintColor: accent }]} resizeMode="contain" accessible={false} />
            </View>
            <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>{item.value}</Text>
            <Text style={[styles.label, { color: accent }]} numberOfLines={1}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  item: {
    flex: 1,
    minWidth: 0,
    minHeight: 94,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  iconFrame: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  icon: {
    width: 19,
    height: 19,
  },
  value: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
    textAlign: "center",
  },
  label: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    textAlign: "center",
  },
});
