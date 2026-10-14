import React from "react";
import Svg, { Path, Rect } from "react-native-svg";
import { Image } from "../localization/react-native";
import { ambientUiIcons } from "../ambientAssets";
import { uiIconAssets } from "../assets";
import type { WardrobeCategoryFilter } from "./WardrobeFilterControls";

// The existing Ambient shirt and app shoe are reused. New glyphs share the
// Ambient 24-unit grid, 1.75 stroke, round caps/joins and unfilled silhouette.
// Category labels remain the accessible names on the containing selection row.
export function WardrobeCategoryIcon({ category, color, size = 22 }: {
  category: WardrobeCategoryFilter; color: string; size?: number;
}) {
  if (category === "top" || category === "shoes") return <Image
    source={category === "top" ? ambientUiIcons.tabOutfit : uiIconAssets.shoe}
    accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={{ width: size, height: size, flexShrink: 0, tintColor: color }} />;
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
    accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexShrink: 0 }}>
    {category === "all" ? <>
      <Rect x={3.5} y={3.5} width={6.5} height={6.5} rx={1.3} />
      <Rect x={14} y={3.5} width={6.5} height={6.5} rx={1.3} />
      <Rect x={3.5} y={14} width={6.5} height={6.5} rx={1.3} />
      <Rect x={14} y={14} width={6.5} height={6.5} rx={1.3} />
    </> : category === "outer" ? <>
      <Path d="M9 3.5 5.5 5 3 13l3 1 1-3-.5 9.5h11L17 11l1 3 3-1-2.5-8L15 3.5" />
      <Path d="m9 3.5 3 4 3-4M12 7.5v13M8.5 15h1M14.5 15h1" />
    </> : category === "bottom" ? <>
      <Path d="M6.5 3.5h11l1 17h-5L12 10l-1.5 10.5h-5l1-17Z" />
      <Path d="M6.5 6.5h11M12 3.5v3" />
    </> : <>
      <Rect x={4} y={8} width={16} height={12.5} rx={2} />
      <Path d="M8 9V7a4 4 0 0 1 8 0v2" />
    </>}
  </Svg>;
}
