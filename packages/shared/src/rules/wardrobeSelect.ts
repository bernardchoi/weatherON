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

  const desiredTags = getDesiredWeatherTags(signals);
  const seasonReadyCandidates = candidates.filter((item) => isThermallyCompatible(item, signals));
  const weatherReadyCandidates = seasonReadyCandidates.filter((item) => matchesDesiredWeather(item, desiredTags));
  const weatherReadyOwnedCandidates = weatherReadyCandidates.filter((item) => item.owned);
  const rankingCandidates =
    weatherReadyOwnedCandidates.length > 0
      ? weatherReadyOwnedCandidates
      : weatherReadyCandidates.length > 0
        ? weatherReadyCandidates
        : seasonReadyCandidates.length > 0
          ? seasonReadyCandidates
          : candidates;
  const ranked = [...rankingCandidates].sort((a, b) => scoreItem(b, signals, profile) - scoreItem(a, signals, profile));
  return ranked[0];
}

function scoreItem(item: WardrobeItem, signals: WeatherSignals, profile: UserPreferenceProfile): number {
  const desiredTags = getDesiredWeatherTags(signals);
  const desiredPurpose = profile.routine === "free" ? "daily" : profile.routine;
  const purposeScore = item.purposes.includes(desiredPurpose) ? 14 : item.purposes.includes("daily") ? 7 : 0;
  const weatherScore = desiredTags.reduce((score, tag) => score + (item.weatherTags.includes(tag) ? 18 : 0), 0);
  const seasonScore = item.seasons.some((season) => signals.recommendedSeasons.includes(season)) ? 16 : -30;
  const thermalConflictScore =
    (signals.thermalProfile === "hot" && item.weatherTags.includes("cold")) ||
    (signals.thermalProfile === "cold" && item.weatherTags.includes("heat"))
      ? -36
      : 0;
  const ownedScore = item.owned ? 6 : 0;
  const formalScore = profile.fit === "formal" && item.purposes.includes("formal") ? 10 : 0;
  const outdoorScore = profile.fit === "outdoor" && item.purposes.includes("outdoor") ? 10 : 0;

  return purposeScore + weatherScore + seasonScore + thermalConflictScore + ownedScore + formalScore + outdoorScore;
}

function matchesDesiredWeather(item: WardrobeItem, desiredTags: WeatherTag[]): boolean {
  return desiredTags.some((tag) => item.weatherTags.includes(tag));
}

function isThermallyCompatible(item: WardrobeItem, signals: WeatherSignals): boolean {
  if (!item.seasons.some((season) => signals.recommendedSeasons.includes(season))) return false;
  if (signals.thermalProfile === "hot") {
    return item.seasons.includes("summer") && !item.weatherTags.includes("cold");
  }
  if (signals.thermalProfile === "warm") {
    return !item.weatherTags.includes("cold");
  }
  if (signals.thermalProfile === "cold") {
    return item.seasons.includes("winter") && !item.weatherTags.includes("heat");
  }
  if (signals.thermalProfile === "cool") {
    return !item.weatherTags.includes("heat");
  }
  return true;
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
