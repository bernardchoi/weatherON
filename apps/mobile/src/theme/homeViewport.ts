// The measured ScrollView frame already excludes native safe areas and the sibling dock.
// Only whitespace changes: text, hit targets and natural content height remain unconstrained.
export function resolveHomeViewportSpacing(availableHeight: number) {
  const compact = availableHeight > 0 && availableHeight < 800;
  return {
    contentGap: compact ? 6 : 8,
    topPadding: compact ? 16 : 20,
    planMargin: compact ? 8 : 18,
    planGap: compact ? 6 : 12,
    heroGap: compact ? 10 : 14,
    outfitTop: compact ? 12 : 16,
    outfitBottom: compact ? 8 : 12,
  };
}
