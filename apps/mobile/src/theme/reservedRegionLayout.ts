export type ReservedRegionKind = "occlusion" | "division";

export type ReservedRegion = {
  kind: ReservedRegionKind;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ReservedContentRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
  avoidsReservedRegion: boolean;
};

const edgeCoverage = 0.72;
const edgeTolerance = 0.14;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function normalizeRegion(region: ReservedRegion, width: number, height: number): ReservedRegion | null {
  const x = clamp(region.x, 0, width);
  const y = clamp(region.y, 0, height);
  const right = clamp(region.x + region.width, 0, width);
  const bottom = clamp(region.y + region.height, 0, height);
  if (right <= x || bottom <= y) return null;
  return { ...region, x, y, width: right - x, height: bottom - y };
}

/**
 * Pick one uninterrupted, largest pane when UIKit reports a region that spans
 * most of the opposite axis. This keeps all touch controls, including the
 * custom tab bar, out of a Duo hinge/occlusion instead of padding across it.
 */
export function resolveReservedContentRegion(
  width: number,
  height: number,
  regions: readonly ReservedRegion[],
): ReservedContentRegion {
  const safeWidth = Math.max(0, width);
  const safeHeight = Math.max(0, height);
  const full = { x: 0, y: 0, width: safeWidth, height: safeHeight, avoidsReservedRegion: false };
  if (safeWidth === 0 || safeHeight === 0) return full;

  const normalized = regions
    .map((region) => normalizeRegion(region, safeWidth, safeHeight))
    .filter((region): region is ReservedRegion => region !== null);

  const verticalBlocker = normalized
    .filter((region) => region.x > 0 && region.x + region.width < safeWidth
      && region.height >= safeHeight * edgeCoverage
      && region.y <= safeHeight * edgeTolerance
      && region.y + region.height >= safeHeight * (1 - edgeTolerance))
    .sort((left, right) => right.width * right.height - left.width * left.height)[0];

  if (verticalBlocker) {
    const left = { x: 0, y: 0, width: verticalBlocker.x, height: safeHeight, avoidsReservedRegion: true };
    const right = {
      x: verticalBlocker.x + verticalBlocker.width,
      y: 0,
      width: safeWidth - verticalBlocker.x - verticalBlocker.width,
      height: safeHeight,
      avoidsReservedRegion: true,
    };
    return right.width >= left.width ? right : left;
  }

  const horizontalBlocker = normalized
    .filter((region) => region.y > 0 && region.y + region.height < safeHeight
      && region.width >= safeWidth * edgeCoverage
      && region.x <= safeWidth * edgeTolerance
      && region.x + region.width >= safeWidth * (1 - edgeTolerance))
    .sort((top, bottom) => bottom.width * bottom.height - top.width * top.height)[0];

  if (horizontalBlocker) {
    const top = { x: 0, y: 0, width: safeWidth, height: horizontalBlocker.y, avoidsReservedRegion: true };
    const bottom = {
      x: 0,
      y: horizontalBlocker.y + horizontalBlocker.height,
      width: safeWidth,
      height: safeHeight - horizontalBlocker.y - horizontalBlocker.height,
      avoidsReservedRegion: true,
    };
    return bottom.height >= top.height ? bottom : top;
  }

  return full;
}

export function equalReservedRegions(left: readonly ReservedRegion[], right: readonly ReservedRegion[]) {
  if (left.length !== right.length) return false;
  return left.every((region, index) => {
    const other = right[index];
    return other
      && region.kind === other.kind
      && region.x === other.x
      && region.y === other.y
      && region.width === other.width
      && region.height === other.height;
  });
}
