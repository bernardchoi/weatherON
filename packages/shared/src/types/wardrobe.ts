export type WardrobeCategory = "outer" | "top" | "bottom" | "shoes" | "accessory";
export type Season = "spring" | "summer" | "fall" | "winter";
export type Purpose = "commute" | "school" | "travel" | "outdoor" | "formal" | "daily";
export type WeatherTag = "rain" | "wind" | "cold" | "heat" | "dry";

export type WardrobeItem = {
  id: string;
  ownerId?: string;
  source: "preset" | "photo";
  category: WardrobeCategory;
  name: string;
  seasons: Season[];
  purposes: Purpose[];
  weatherTags: WeatherTag[];
  imageUrl: string;
  owned: boolean;
};
