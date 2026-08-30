import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { OutfitRecommendation } from "@weatheron/shared";
import { getOutfitImageSource } from "../assets";
import { FeedbackPressable } from "./FeedbackPressable";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

type OutfitGridProps = {
  outfit: OutfitRecommendation;
  maxItems?: number;
  compact?: boolean;
  dense?: boolean;
  onePage?: boolean;
  singleRow?: boolean;
  onItemPress?: (slot: string) => void;
};

const slotLabel: Record<string, string> = {
  outer: "겉옷",
  top: "상의",
  bottom: "하의",
  shoes: "신발",
  accessory: "소품",
};

export function OutfitGrid({ outfit, maxItems, compact = false, dense = false, onePage = false, singleRow = false, onItemPress }: OutfitGridProps) {
  const theme = useAppTheme();
  const entries = Object.entries(outfit.items)
    .filter(([, item]) => Boolean(item))
    .slice(0, maxItems);
  return (
    <View style={[styles.outfitGrid, onePage ? styles.outfitGridOnePage : null, singleRow ? styles.outfitGridSingleRow : null]}>
      {entries.map(([slot, item]) => {
        const imageSource = getOutfitImageSource(item?.imageUrl);
        return item ? (
          <FeedbackPressable
            key={slot}
            accessibilityLabel={`${slotLabel[slot] ?? "아이템"} ${item.name}${onItemPress ? " 상세 보기" : ""}`}
            accessibilityRole={onItemPress ? "button" : undefined}
            disabled={!onItemPress}
            onPress={onItemPress ? () => onItemPress(slot) : undefined}
            style={[
              styles.itemCell,
              compact ? styles.itemCellCompact : null,
              dense ? styles.itemCellDense : null,
              onePage ? styles.itemCellOnePage : null,
              singleRow ? styles.itemCellSingleRow : null,
              { backgroundColor: theme.cardMuted, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.imageWell,
                compact ? styles.imageWellCompact : null,
                dense ? styles.imageWellDense : null,
                onePage ? styles.imageWellOnePage : null,
                singleRow ? styles.imageWellSingleRow : null,
                { backgroundColor: theme.cardMuted },
              ]}
            >
              {imageSource ? (
                <Image
                  source={imageSource}
                  style={[
                    styles.itemImage,
                    compact ? styles.itemImageCompact : null,
                    dense ? styles.itemImageDense : null,
                    onePage ? styles.itemImageOnePage : null,
                    singleRow ? styles.itemImageSingleRow : null,
                  ]}
                  resizeMode="contain"
                />
              ) : null}
            </View>
            <Text style={[styles.itemSlot, singleRow ? styles.itemSlotSingleRow : null, { color: theme.clear }]} numberOfLines={1}>{slotLabel[slot] ?? "아이템"}</Text>
            <Text style={[styles.itemName, dense ? styles.itemNameDense : null, onePage ? styles.itemNameOnePage : null, singleRow ? styles.itemNameSingleRow : null, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
          </FeedbackPressable>
        ) : null;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  outfitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: spacing.sm,
    rowGap: spacing.sm,
  },
  outfitGridOnePage: {
    columnGap: spacing.sm,
    rowGap: spacing.sm,
  },
  outfitGridSingleRow: {
    flexWrap: "nowrap",
    columnGap: 5,
    rowGap: 0,
  },
  itemCell: {
    flexBasis: "48%",
    flexGrow: 1,
    maxWidth: "49%",
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
    minHeight: 112,
    gap: 5,
    padding: spacing.sm,
  },
  itemCellOnePage: {
    minHeight: 88,
    gap: 4,
    padding: spacing.sm,
  },
  itemCellSingleRow: {
    flexBasis: 0,
    maxWidth: undefined,
    minHeight: 74,
    gap: 2,
    padding: 5,
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
    height: 58,
  },
  imageWellOnePage: {
    height: 42,
    borderRadius: radius.xs,
  },
  imageWellSingleRow: {
    height: 28,
  },
  itemImage: {
    width: "92%",
    height: 64,
  },
  itemImageCompact: {
    height: 52,
  },
  itemImageDense: {
    height: 54,
  },
  itemImageOnePage: {
    height: 39,
  },
  itemImageSingleRow: {
    height: 26,
  },
  itemSlot: {
    fontSize: 10,
    fontWeight: "900",
  },
  itemSlotSingleRow: {
    fontSize: 9,
  },
  itemName: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
  },
  itemNameDense: {
    fontSize: 13,
    lineHeight: 17,
  },
  itemNameOnePage: {
    fontSize: 12,
    lineHeight: 15,
  },
  itemNameSingleRow: {
    fontSize: 10,
    lineHeight: 13,
  },
});
