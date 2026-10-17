import React from "react";
import { Image } from "../localization/react-native";
import { ambientUiIcons } from "../ambientAssets";
import type { WardrobeCategoryFilter } from "./WardrobeFilterControls";

const categoryIcons = {
  all: ambientUiIcons.wardrobeAll,
  top: ambientUiIcons.tabOutfit,
  outer: ambientUiIcons.wardrobeOuter,
  bottom: ambientUiIcons.wardrobeBottom,
  shoes: ambientUiIcons.wardrobeShoes,
  accessory: ambientUiIcons.wardrobeAccessory,
} satisfies Record<WardrobeCategoryFilter, number>;

// Category silhouettes retain their individual meaning at 22px instead of sharing a generic garment.
// Category labels remain the accessible names on the containing selection row.
export function WardrobeCategoryIcon({ category, color, size = 22 }: {
  category: WardrobeCategoryFilter; color: string; size?: number;
}) {
  return <Image
    source={categoryIcons[category]}
    accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={{ width: size, height: size, flexShrink: 0, tintColor: color }} />;
}
