import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { OutfitRecommendation } from "@weatheron/shared";
import { outfitImageAssets } from "../assets";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

type OutfitGridProps = {
  outfit: OutfitRecommendation;
  maxItems?: number;
  compact?: boolean;
};

const slotLabel: Record<string, string> = {
  outer: "겉옷",
  top: "상의",
  bottom: "하의",
  shoes: "신발",
  accessory: "소품",
};

export function OutfitGrid({ outfit, maxItems, compact = false }: OutfitGridProps) {
  const theme = useAppTheme();
  const entries = Object.entries(outfit.items)
    .filter(([, item]) => Boolean(item))
    .slice(0, maxItems);
  return (
    <View style={styles.outfitGrid}>
      {entries.map(([slot, item]) =>
        item ? (
          <View key={slot} style={[styles.itemCell, compact ? styles.itemCellCompact : null, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
            <View style={[styles.imageWell, compact ? styles.imageWellCompact : null, { backgroundColor: theme.name === "light" ? "#F8FBFF" : "rgba(248,251,255,0.10)" }]}>
              {item.imageUrl && outfitImageAssets[item.imageUrl] ? (
                <Image source={outfitImageAssets[item.imageUrl]} style={[styles.itemImage, compact ? styles.itemImageCompact : null]} resizeMode="contain" />
              ) : null}
            </View>
            <Text style={[styles.itemSlot, { color: theme.clear }]}>{slotLabel[slot] ?? "아이템"}</Text>
            <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
          </View>
        ) : null,
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outfitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  itemCell: {
    minWidth: "47%",
    minHeight: 142,
    gap: 7,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  itemCellCompact: {
    minHeight: 118,
  },
  imageWell: {
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  imageWellCompact: {
    height: 56,
  },
  itemImage: {
    width: "92%",
    height: 64,
  },
  itemImageCompact: {
    height: 52,
  },
  itemSlot: {
    fontSize: 10,
    fontWeight: "900",
  },
  itemName: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
  },
});
