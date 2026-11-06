import type { OutfitRecommendation, WardrobeItem, WeatherSnapshot } from "@weatheron/shared";
import { toStoredWardrobePhotoUri } from "./wardrobePhotoUri";

type OutfitWeatherContext = Pick<WeatherSnapshot, "locationId" | "locationName" | "observedAt" | "timezone">;

export type SavedOutfitSnapshot = {
  schemaVersion: 1;
  savedAt: string;
  outfit: OutfitRecommendation;
  weather: OutfitWeatherContext;
};

const slots = ["outer", "top", "bottom", "shoes", "accessory"] as const;
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === "string");
const text = (value: unknown): value is string => typeof value === "string" && value.length > 0;

// Keep an independent copy, including the actual selected item metadata. The
// recommendation ID alone is only a location/rule ID and can describe many looks.
export function createSavedOutfitSnapshot(
  outfit: OutfitRecommendation,
  weather: OutfitWeatherContext,
  savedAt = new Date().toISOString(),
): SavedOutfitSnapshot | null {
  return normalizeSavedOutfitSnapshot({ schemaVersion: 1, savedAt, outfit, weather });
}

export function normalizeSavedOutfitSnapshot(value: unknown): SavedOutfitSnapshot | null {
  if (!isRecord(value) || value.schemaVersion !== 1 || !text(value.savedAt) || !Number.isFinite(Date.parse(value.savedAt))) return null;
  const outfit = value.outfit;
  const weather = value.weather;
  if (!isRecord(outfit) || !isRecord(weather) || !isRecord(outfit.items) || !isRecord(outfit.preparation)) return null;
  if (!text(weather.locationId) || !text(weather.locationName) || typeof weather.observedAt !== "string"
    || (weather.timezone !== undefined && typeof weather.timezone !== "string")) return null;
  if (!text(outfit.id) || !text(outfit.weatherSnapshotId) || !text(outfit.ruleVersion)
    || !["default", "formal", "rain", "cold", "heat"].includes(String(outfit.variant))
    || typeof outfit.decisionText !== "string" || !strings(outfit.reasons) || !Array.isArray(outfit.timeAdvice)
    || !outfit.timeAdvice.every(item => isRecord(item) && typeof item.time === "string" && typeof item.text === "string")) return null;
  const prep = outfit.preparation;
  if (!Number.isInteger(prep.ownedItemCount) || !Number.isInteger(prep.totalItemCount)
    || Number(prep.ownedItemCount) < 0 || Number(prep.totalItemCount) < 1 || Number(prep.totalItemCount) > slots.length
    || Number(prep.ownedItemCount) > Number(prep.totalItemCount) || !strings(prep.missingItemNames) || !strings(prep.rainProtectionGaps)) return null;
  const items: OutfitRecommendation["items"] = {};
  for (const slot of slots) {
    const item = outfit.items[slot];
    if (item == null) continue;
    if (!isRecord(item) || !text(item.id) || !text(item.name) || item.category !== slot
      || !["preset", "photo"].includes(String(item.source)) || typeof item.owned !== "boolean" || typeof item.imageUrl !== "string"
      || !strings(item.seasons) || !strings(item.purposes) || !strings(item.weatherTags)
      || !item.seasons.every(season => ["spring", "summer", "fall", "winter"].includes(season))
      || !item.purposes.every(purpose => ["commute", "school", "travel", "outdoor", "formal", "daily"].includes(purpose))
      || !item.weatherTags.every(tag => ["rain", "wind", "cold", "heat", "dry"].includes(tag))) return null;
    items[slot] = {
      id: item.id, name: item.name, category: slot, source: item.source as WardrobeItem["source"],
      imageUrl: toStoredWardrobePhotoUri(item.imageUrl), owned: item.owned,
      seasons: [...item.seasons] as WardrobeItem["seasons"], purposes: [...item.purposes] as WardrobeItem["purposes"], weatherTags: [...item.weatherTags] as WardrobeItem["weatherTags"],
      ...(typeof item.ownerId === "string" ? { ownerId: item.ownerId } : {}),
      ...(typeof item.photoPolicyVersion === "string" ? { photoPolicyVersion: item.photoPolicyVersion } : {}),
      ...(typeof item.photoDigest === "string" ? { photoDigest: item.photoDigest } : {}),
      ...(typeof item.photoApprovedAt === "string" ? { photoApprovedAt: item.photoApprovedAt } : {}),
    };
  }
  if (Object.keys(items).length !== prep.totalItemCount) return null;
  return {
    schemaVersion: 1, savedAt: value.savedAt,
    weather: { locationId: weather.locationId, locationName: weather.locationName, observedAt: weather.observedAt, ...(typeof weather.timezone === "string" ? { timezone: weather.timezone } : {}) },
    outfit: {
      id: outfit.id, weatherSnapshotId: outfit.weatherSnapshotId, ruleVersion: outfit.ruleVersion, variant: outfit.variant as OutfitRecommendation["variant"],
      items, decisionText: outfit.decisionText, reasons: [...outfit.reasons],
      timeAdvice: outfit.timeAdvice.map(item => ({ time: item.time as string, text: item.text as string })),
      preparation: { ownedItemCount: prep.ownedItemCount as number, totalItemCount: prep.totalItemCount as number, missingItemNames: [...prep.missingItemNames], rainProtectionGaps: [...prep.rainProtectionGaps] },
    },
  };
}

export function isCurrentOutfitSaved(saved: SavedOutfitSnapshot | null, outfit: OutfitRecommendation, weather: OutfitWeatherContext): boolean {
  if (!saved) return false;
  const current = createSavedOutfitSnapshot(outfit, weather, saved.savedAt);
  return current !== null && JSON.stringify(saved) === JSON.stringify(current);
}

export function getSavedOutfitPhotoUris(snapshot: SavedOutfitSnapshot | null | undefined): string[] {
  return snapshot ? Object.values(snapshot.outfit.items).filter(item => item?.source === "photo")
    .map(item => toStoredWardrobePhotoUri(item!.imageUrl)) : [];
}

export function getUnusedOutfitPhotoUris(previous: SavedOutfitSnapshot | null | undefined, next: SavedOutfitSnapshot, wardrobe: WardrobeItem[]): string[] {
  const retained = new Set([...getSavedOutfitPhotoUris(next), ...wardrobe.map(item => toStoredWardrobePhotoUri(item.imageUrl))]);
  return getSavedOutfitPhotoUris(previous).filter(uri => !retained.has(uri));
}
