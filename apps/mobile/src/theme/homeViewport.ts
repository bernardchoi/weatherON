// The measured ScrollView frame already excludes native safe areas and the sibling dock.
// Only whitespace changes: text, hit targets and natural content height remain unconstrained.
export function resolveHomeViewportSpacing(availableHeight: number) {
  const compact = availableHeight > 0 && availableHeight < 800;
  return {
    contentGap: compact ? 6 : 8,
    topPadding: compact ? 12 : 18,
    planMargin: compact ? 8 : 12,
    planGap: compact ? 14 : 16,
    heroGap: compact ? 6 : 10,
    outfitTop: compact ? 8 : 12,
    outfitBottom: compact ? 8 : 12,
  };
}

/** Home-specific density. The native viewport already excludes the dock.
 * Accessibility sizes keep natural wrapping and scrolling; never clip the card.
 */
export function resolveHomeCardDensity(viewportHeight: number, width: number, fontScale: number) {
  const compact = viewportHeight > 0 && viewportHeight < 800 && fontScale <= 1.3;
  const dense = compact && viewportHeight < 680;
  return {
    compact,
    heroTemperature: dense ? 76 : compact ? 84 : 96,
    heroLine: dense ? 76 : compact ? 84 : 92,
    mascotMax: dense ? 148 : compact ? 160 : 176,
    outfitPhotoHeight: dense ? 60 : compact ? 72 : 96,
    stackOutfit: fontScale > 1.3 || width < (compact ? 335 : 390),
    cardGap: compact ? 5 : 8,
  };
}
