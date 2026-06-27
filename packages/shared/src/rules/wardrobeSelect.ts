import type { UserPreferenceProfile } from "../types/profile";
import type { WardrobeCategory, WardrobeItem, WeatherTag } from "../types/wardrobe";
import type { WeatherSignals } from "./weatherSignals";

export function selectWardrobeItem(
  wardrobe: WardrobeItem[],
  category: WardrobeCategory,
  signals: WeatherSignals,
  profile: UserPreferenceProfile,
): WardrobeItem {
  const candidates = wardrobe.filter((item) => item.category === category);
  if (candidates.length === 0) {
    throw new Error(`Missing wardrobe preset for category: ${category}`);
  }

  const ranked = [...candidates].sort((a, b) => scoreItem(b, signals, profile) - scoreItem(a, signals, profile));
  return ranked[0];
}

function scoreItem(item: WardrobeItem, signals: WeatherSignals, profile: UserPreferenceProfile): number {
  const desiredTags = getDesiredWeatherTags(signals);
  const desiredPurpose = profile.routine === "free" ? "daily" : profile.routine;
  const purposeScore = item.purposes.includes(desiredPurpose) ? 14 : item.purposes.includes("daily") ? 7 : 0;
  const weatherScore = desiredTags.reduce((score, tag) => score + (item.weatherTags.includes(tag) ? 18 : 0), 0);
  const ownedScore = item.owned ? 6 : 0;
  const formalScore = profile.fit === "formal" && item.purposes.includes("formal") ? 10 : 0;
  const outdoorScore = profile.fit === "outdoor" && item.purposes.includes("outdoor") ? 10 : 0;

  return purposeScore + weatherScore + ownedScore + formalScore + outdoorScore;
}

function getDesiredWeatherTags(signals: WeatherSignals): WeatherTag[] {
  const tags: WeatherTag[] = [];
  if (signals.isRainy) tags.push("rain");
  if (signals.isWindy) tags.push("wind");
  if (signals.isCold) tags.push("cold");
  if (signals.isHot) tags.push("heat");
  if (tags.length === 0) tags.push("dry");
  return tags;
}
