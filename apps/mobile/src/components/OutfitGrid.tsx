import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { OutfitRecommendation } from "@weatheron/shared";
import { appColors, radius, spacing } from "../theme/tokens";

type OutfitGridProps = {
  outfit: OutfitRecommendation;
};

const slotLabel: Record<string, string> = {
  outer: "OUTER",
  top: "TOP",
  bottom: "BOTTOM",
  shoes: "SHOES",
  accessory: "ACCESSORY",
};

export function OutfitGrid({ outfit }: OutfitGridProps) {
  return (
    <View style={styles.outfitGrid}>
      {Object.entries(outfit.items).map(([slot, item]) =>
        item ? (
          <View key={slot} style={styles.itemCell}>
            <Text style={styles.itemSlot}>{slotLabel[slot] ?? slot.toUpperCase()}</Text>
            <Text style={styles.itemName}>{item.name}</Text>
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
    minHeight: 68,
    justifyContent: "center",
    gap: 4,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  itemSlot: {
    color: appColors.clear,
    fontSize: 10,
    fontWeight: "900",
  },
  itemName: {
    color: appColors.text,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
  },
});
