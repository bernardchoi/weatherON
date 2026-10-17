import React from "react";
import { Platform, Image, type ImageSourcePropType, StyleSheet, Text, View } from "../localization/react-native";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
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
  rows?: boolean;
};

export function OnboardingVisualStrip({ items, rows = false }: OnboardingVisualStripProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();

  return (
    <View style={[styles.row, rows && { flexDirection: "column", gap: 20 }]}>
      {items.map((item) => {
        const accent = theme[item.tone];
        return (
          <View
            key={`${item.label}-${item.value}`}
            accessible
            accessibilityLabel={`${item.label} ${item.value}`}
            style={[
              styles.item,
              Platform.OS === "ios" && { backgroundColor: "transparent", borderWidth: 0 },
              {
                backgroundColor: Platform.OS === "ios" ? "transparent" : theme.cardStrong,
                borderColor: theme.border,
                minHeight: rows ? 110 : layout.onboardingVisualItemMinHeight,
                paddingVertical: layout.isShort || layout.isNarrow ? 6 : spacing.sm,
              },
            ]}
          >
            <View
              style={[
                styles.iconFrame,
                {
                  backgroundColor: Platform.OS === "ios" ? "transparent" : semanticColor(theme, item.tone === "clear" ? "successTint" : item.tone === "gold" ? "accentTint" : "infoTint"),
                  width: layout.onboardingVisualIconFrameSize,
                  height: layout.onboardingVisualIconFrameSize,
                },
              ]}
            >
              <Image
                source={item.icon}
                style={{
                  tintColor: accent,
                  width: rows ? 44 : layout.onboardingVisualIconSize,
                  height: rows ? 44 : layout.onboardingVisualIconSize,
                }}
                resizeMode="contain"
                accessible={false}
              />
            </View>
            <Text style={[styles.value, { color: theme.text }, Platform.OS === "ios" && { fontSize: 16, lineHeight: 24, fontWeight: "500" }]} numberOfLines={Platform.OS === "ios" ? undefined : 1}>{item.value}</Text>
            <Text style={[styles.label, { color: accent }, Platform.OS === "ios" && { fontSize: 15, lineHeight: 22, fontWeight: "600" }]} numberOfLines={Platform.OS === "ios" ? undefined : 1}>{item.label}</Text>
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
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 4,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  iconFrame: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
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
