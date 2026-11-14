import type { OutfitRecommendation } from "@weatheron/shared";
import type { HomeMascotState } from "./homeMascotState";

export type MascotClothing = "none" | "light" | "outer" | "winter" | "raincoat";
/** Use the already-selected recommendation, never a second temperature rule or photo inference. */
export function resolveMascotClothing(outfit: OutfitRecommendation, input: {
  reliable: boolean; currentAvailable: boolean; pending: boolean; weatherSnapshotId: string;
}): MascotClothing {
  if (!input.reliable || !input.currentAvailable || input.pending || outfit.weatherSnapshotId !== input.weatherSnapshotId) return "none";
  const { outer, top } = outfit.items;
  if (!outer && !top) return "none";
  // A warm waterproof coat remains winter clothing; umbrella is an independent layer.
  if (outer?.weatherTags.includes("cold")) return "winter";
  if (outer?.weatherTags.includes("rain")) return "raincoat";
  if (outer) return "outer";
  return "light";
}
export function withMascotClothing(state: HomeMascotState, clothing: MascotClothing): HomeMascotState {
  // A snow bitmap bakes clothing into the art. Use the base pose plus clothing
  // keeping snow motion but not double coats (or inferred clothing on missing data).
  return { ...state, clothing, asset: state.asset === "cold" ? "base" : state.asset };
}
