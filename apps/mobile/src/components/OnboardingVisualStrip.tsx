import React from "react";
import { Platform, Image, useWindowDimensions, type ImageSourcePropType, StyleSheet, Text, View } from "../localization/react-native";
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
  intro?: boolean;
};

export function OnboardingVisualStrip({ items, rows = false, intro = false }: OnboardingVisualStripProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();

  const { fontScale, width } = useWindowDimensions();
  if (rows || intro) {
    const horizontalItems = rows || (width - layout.screenHorizontalPadding * 2) / fontScale < 235;
    return (
      <View style={{ flexDirection: horizontalItems ? "column" : "row", gap: 8 }}>
        {items.map(item => (
          <View key={item.label} accessible accessibilityLabel={rows ? item.value : `${item.label} ${item.value}`}
            style={horizontalItems ? styles.featureRow : styles.featureColumn}>
            <Image source={item.icon} accessible={false} resizeMode="contain"
              style={{ width: 32, height: 32, tintColor: theme[item.tone] }} />
            <View style={horizontalItems ? styles.rowCopy : styles.columnCopy}>
              {intro && <Text style={{ color: theme.muted, fontSize: 15, fontWeight: "600" }}>{item.label}</Text>}
              <Text style={{ color: theme.text, fontSize: rows ? 19 : 16, fontWeight: "600",
                textAlign: horizontalItems ? "left" : "center" }}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  }
  return (
    <View style={styles.row}>
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
                minHeight: layout.onboardingVisualItemMinHeight,
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
                  width: layout.onboardingVisualIconSize,
                  height: layout.onboardingVisualIconSize,
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
  featureRow: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 5 },
  featureColumn: { flex: 1, alignItems: "center", gap: 6 },
  rowCopy: { flex: 1, gap: 2 },
  columnCopy: { alignItems: "center", gap: 2, alignSelf: "stretch" },
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
