export type AmbientReadRegion = { x: number; y: number; width: number; height: number };
const fraction = (v: number) => v - Math.floor(v);
export const ambientStars = Array.from({ length: 26 }, (_, i) => ({
  x: .04 + fraction(Math.sin((i + 1) * 127.1) * 43758.5453) * .92,
  y: .03 + fraction(Math.sin((i + 1) * 311.7) * 21341.9137) * .94,
  size: i % 7 === 0 ? 2.4 : i % 3 === 0 ? 1.8 : 1.2,
  twinkle: i % 4 === 0,
  offset: fraction(i * .381966),
}));
export function isAmbientReadingPoint(x: number, y: number, areas: AmbientReadRegion[]) {
  return areas.some(r => x >= r.x - 10 && x <= r.x + r.width + 10 && y >= r.y - 10 && y <= r.y + r.height + 10);
}
// A streak is permitted only in an actual empty horizontal gap, never over text.
export function ambientMeteorGap(height: number, areas: AmbientReadRegion[]) {
  const intervals = areas.map(r => [Math.max(0, r.y - 10), Math.min(height, r.y + r.height + 10)]).filter(([a, b]) => b > a).sort((a, b) => a[0] - b[0]);
  let end = 18; let best = { y: 0, height: 0 };
  for (const [a, b] of [...intervals, [height - 18, height]]) {
    if (a - end > best.height) best = { y: end, height: a - end };
    end = Math.max(end, b);
  }
  return best.height >= 18 ? best : null;
}
