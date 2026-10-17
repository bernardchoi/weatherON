// The measured ScrollView frame already excludes native safe areas and the sibling dock.
// Only whitespace changes: text, hit targets and natural content height remain unconstrained.
export function resolveHomeViewportSpacing(availableHeight: number) {
  const compact = availableHeight > 0 && availableHeight < 800;
  return {
    contentGap: compact ? 6 : 8,
    topPadding: compact ? 12 : 18,
    planMargin: compact ? 18 : 24,
    planGap: compact ? 14 : 16,
    heroGap: compact ? 6 : 10,
    outfitTop: compact ? 8 : 12,
    outfitBottom: compact ? 8 : 12,
  };
}
