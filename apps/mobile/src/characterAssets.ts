// User-approved small eyes/no catchlights; original geometry preserved.
// Rain face/belly palette harmonized by approved coordinate-preserving correction.
// All states share a 1024 canvas and foot baseline. No remote image requests.
export const homeCharacterAssets = {
  base: require("../assets/characters/main-fullbody.png"),
  rain: require("../assets/characters/main-rain.png"),
  heat: require("../assets/characters/main-heat.png"),
  cold: require("../assets/characters/main-cold.png"),
} as const;
