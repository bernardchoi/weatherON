import type { ProfileCharacterId } from "../state/profileCharacter";

// Pixel coordinates in the original PNGs. Body bounds exclude detached weather
// motifs; art bounds include all nontransparent pixels, including those motifs.
// Keep the home assets unchanged: only profile presentation uses this framing.
export const profileCharacterFraming = {
  main: { canvas: 1024, body: [302, 359, 721, 944], art: [160, 353, 811, 975] },
  solar: { canvas: 512, body: [82, 121, 445, 468], art: [42, 26, 461, 475] },
  rain: { canvas: 512, body: [77, 124, 424, 468], art: [64, 27, 455, 474] },
  storm: { canvas: 512, body: [63, 123, 416, 468], art: [34, 49, 479, 474] },
  wind: { canvas: 512, body: [75, 94, 444, 435], art: [36, 47, 471, 474] },
  frost: { canvas: 512, body: [91, 94, 410, 436], art: [63, 49, 445, 442] },
  mist: { canvas: 512, body: [70, 85, 452, 428], art: [38, 47, 481, 456] },
} as const;

export function profileCharacterImageLayout(id: Exclude<ProfileCharacterId, "default">, size: number) {
  const { canvas, body } = profileCharacterFraming[id];
  // The art bible sets companion body height to 72% of the hero. Leaving 20%
  // around the hero also keeps every companion's decorative artwork in frame.
  const scale = size * 0.8 * (id === "main" ? 1 : 0.72) / (body[3] - body[1]);
  return {
    width: canvas * scale,
    height: canvas * scale,
    left: size / 2 - (body[0] + body[2]) / 2 * scale,
    top: size / 2 - (body[1] + body[3]) / 2 * scale,
  };
}
