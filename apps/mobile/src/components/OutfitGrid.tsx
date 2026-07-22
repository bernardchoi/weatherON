import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { OutfitRecommendation } from "@weatheron/shared";
import { outfitImageAssets } from "../assets";
import { FeedbackPressable } from "./FeedbackPressable";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

type OutfitGridProps = {
  outfit: OutfitRecommendation;
  maxItems?: number;
  compact?: boolean;
  dense?: boolean;
  onItemPress?: (slot: string) => void;
};

const slotLabel: Record<string, string> = {
  outer: "겉옷",
  top: "상의",
  bottom: "하의",
  shoes: "신발",
  accessory: "소품",
};

export function OutfitGrid({ outfit, maxItems, compact = false, dense = false, onItemPress }: OutfitGridProps) {
  const theme = useAppTheme();
  const entries = Object.entries(outfit.items)
    .filter(([, item]) => Boolean(item))
    .slice(0, maxItems);
  return (
    <View style={styles.outfitGrid}>
      {entries.map(([slot, item]) =>
        item ? (
          <FeedbackPressable
            key={slot}
            accessibilityLabel={`${slotLabel[slot] ?? "아이템"} ${item.name}${onItemPress ? " 상세 보기" : ""}`}
            accessibilityRole={onItemPress ? "button" : undefined}
            disabled={!onItemPress}
            onPress={onItemPress ? () => onItemPress(slot) : undefined}
            style={[styles.itemCell, compact ? styles.itemCellCompact : null, dense ? styles.itemCellDense : null, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}
          >
            <View style={[styles.imageWell, compact ? styles.imageWellCompact : null, dense ? styles.imageWellDense : null, { backgroundColor: theme.cardMuted }]}>
              {item.imageUrl && outfitImageAssets[item.imageUrl] ? (
                <Image source={outfitImageAssets[item.imageUrl]} style={[styles.itemImage, compact ? styles.itemImageCompact : null, dense ? styles.itemImageDense : null]} resizeMode="contain" />
              ) : null}
            </View>
            <Text style={[styles.itemSlot, { color: theme.clear }]}>{slotLabel[slot] ?? "아이템"}</Text>
            <Text style={[styles.itemName, dense ? styles.itemNameDense : null, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
          </FeedbackPressable>
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
  itemCellDense: {
    minHeight: 82,
    gap: 3,
    padding: 7,
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
  imageWellDense: {
    height: 36,
  },
  itemImage: {
    width: "92%",
    height: 64,
  },
  itemImageCompact: {
    height: 52,
  },
  itemImageDense: {
    height: 34,
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
  itemNameDense: {
    fontSize: 12,
    lineHeight: 15,
  },
});
