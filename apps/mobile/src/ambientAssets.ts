// V3 filled silhouettes where meanings match; original v1 fallback elsewhere.
import { filledV3Weather } from "./filledV3Assets";
import { Platform } from "./localization/react-native";
import type { AppTheme } from "./theme/tokens";
export const ambientUiIcons = {
  // Layered black-alpha PNGs keep their shallow surfaces when callers apply semantic tint colors.
  back: require("../../../assets/filled-surface-v3-20261015/png/ui/back.png"),
  policyDocument: require("../../../assets/filled-surface-v3-20261015/png/ui/policy-document.png"),
  delete: require("../../../assets/filled-surface-v3-20261015/png/ui/delete.png"),
  wardrobe: require("../../../assets/filled-surface-v3-20261015/png/compact/light/wardrobe.png"),
  wardrobeAll: require("../../../assets/filled-surface-v3-20261015/png/ui/wardrobe-all.png"),
  wardrobeOuter: require("../../../assets/filled-surface-v3-20261015/png/ui/wardrobe-outer.png"),
  wardrobeBottom: require("../../../assets/filled-surface-v3-20261015/png/ui/wardrobe-bottom.png"),
  wardrobeShoes: require("../../../assets/filled-surface-v3-20261015/png/ui/wardrobe-shoes.png"),
  wardrobeAccessory: require("../../../assets/filled-surface-v3-20261015/png/ui/wardrobe-accessory.png"),
  wardrobeEmpty: require("../../../assets/filled-surface-v3-20261015/png/ui/wardrobe-empty.png"),
  style: require("../../../assets/filled-surface-v3-20261015/png/ui/style.png"),
  permissions: require("../../../assets/filled-surface-v3-20261015/png/ui/permissions.png"),
  settings: require("../../../assets/filled-surface-v3-20261015/png/ui/settings.png"),
  tabHome: require("../../../assets/filled-surface-v3-20261015/png/compact/light/tab-home.png"),
  tabOutfit: require("../../../assets/filled-surface-v3-20261015/png/compact/light/tab-outfit.png"),
  tabDepart: require("../../../assets/filled-surface-v3-20261015/png/compact/light/tab-depart.png"),
  tabMy: require("../../../assets/filled-surface-v3-20261015/png/compact/light/tab-my.png"),
  location: require("../../../assets/filled-surface-v3-20261015/png/compact/light/location.png"),
  night: require("../../../assets/filled-surface-v3-20261015/png/compact/light/night.png"),
  time: require("../../../assets/filled-surface-v3-20261015/png/ui/time.png"),
  umbrella: require("../../../assets/filled-surface-v3-20261015/png/ui/umbrella.png"),
  notifications: require("../../../assets/filled-surface-v3-20261015/png/ui/notifications.png"),
  expand: require("../../../assets/filled-surface-v3-20261015/png/ui/expand.png"),
  add: require("../../../assets/filled-surface-v3-20261015/png/ui/add.png"),
  temperature: require("../../../assets/filled-surface-v3-20261015/png/ui/temperature.png"),
  uv: require("../../../assets/filled-surface-v3-20261015/png/ui/uv.png"),
  wind: require("../../../assets/filled-surface-v3-20261015/png/compact/light/wind.png"),
  droplet: require("../../../assets/filled-surface-v3-20261015/png/ui/droplet.png"),
  check: require("../../../assets/filled-surface-v3-20261015/png/ui/check.png"),
};
export const ambientSelectedTabs = {
  tabHome: require("../../../assets/ambient-surface-runtime-v1/tabs-selected/tab-home.png"),
  tabOutfit: require("../../../assets/ambient-surface-runtime-v1/tabs-selected/tab-outfit.png"),
  tabDepart: require("../../../assets/ambient-surface-runtime-v1/tabs-selected/tab-depart.png"),
  tabMy: require("../../../assets/ambient-surface-runtime-v1/tabs-selected/tab-my.png"),
};

// iOS reading screens keep these aliases so existing labels, roles, and interaction code stay intact.
export const ambientScreenIconOverrides = {
  uv: ambientUiIcons.uv,
  clearNight: ambientUiIcons.night,
  pin: ambientUiIcons.location,
  shirt: ambientUiIcons.tabOutfit,
  depart: ambientUiIcons.tabDepart,
  rain: ambientUiIcons.umbrella,
  umbrella: ambientUiIcons.umbrella,
  clock: ambientUiIcons.time,
  drop: ambientUiIcons.droplet,
  humidity: ambientUiIcons.droplet,
  wind: ambientUiIcons.wind,
  myAlerts: ambientUiIcons.notifications,
  myDisplay: ambientUiIcons.settings,
  myPolicy: ambientUiIcons.policyDocument,
  settings: ambientUiIcons.settings,
  tabMy: ambientUiIcons.tabMy,
  check: ambientUiIcons.check,
};
const weather = {
  light: {
    "sun": require("../../../assets/ambient-surface-runtime-v1/hero/light/sun.png"),
    "cloud": require("../../../assets/ambient-surface-runtime-v1/hero/light/cloud.png"),
    "rain": require("../../../assets/ambient-surface-runtime-v1/hero/light/rain.png"),
    "heavy-rain": require("../../../assets/ambient-surface-runtime-v1/hero/light/heavy-rain.png"),
    "snow": require("../../../assets/ambient-surface-runtime-v1/hero/light/snow.png"),
    "thunder": require("../../../assets/ambient-surface-runtime-v1/hero/light/thunder.png"),
    "fog": require("../../../assets/ambient-surface-runtime-v1/hero/light/fog.png"),
    "partly-cloudy": require("../../../assets/ambient-surface-runtime-v1/hero/light/partly-cloudy.png"),
  },
  dark: {
    "sun": require("../../../assets/ambient-surface-runtime-v1/hero/dark/sun.png"),
    "cloud": require("../../../assets/ambient-surface-runtime-v1/hero/dark/cloud.png"),
    "rain": require("../../../assets/ambient-surface-runtime-v1/hero/dark/rain.png"),
    "heavy-rain": require("../../../assets/ambient-surface-runtime-v1/hero/dark/heavy-rain.png"),
    "snow": require("../../../assets/ambient-surface-runtime-v1/hero/dark/snow.png"),
    "thunder": require("../../../assets/ambient-surface-runtime-v1/hero/dark/thunder.png"),
    "fog": require("../../../assets/ambient-surface-runtime-v1/hero/dark/fog.png"),
    "partly-cloudy": require("../../../assets/ambient-surface-runtime-v1/hero/dark/partly-cloudy.png"),
  },
};
export function ambientWeatherIcon(condition: string, isNight: boolean, theme: AppTheme, variant: "compact" | "hero" = "compact"): { source: number; tintColor?: string } | undefined {
  // Android keeps its legacy provider vocabulary until its separate rollout;
  // never expose staged V3 precipitation artwork there as a fallback.
  if (Platform.OS === "android" && ["sleet", "hail", "storm-hail", "mixed", "unknown"].includes(condition)) return undefined;
  const assets = filledV3Weather[variant][theme.name];
  if (condition === "clear") return { source: isNight ? assets.night : assets.sun };
  if (condition === "cloud") return { source: assets.cloud };
  if (condition === "rain") return { source: assets.rain };
  // Provider storm means heavy rain here, not necessarily lightning.
  if (condition === "storm") return { source: weather[theme.name]["heavy-rain"] };
  if (condition === "snow") return { source: assets.snow };
  if (condition === "sleet") return { source: assets.sleet };
  if (condition === "hail") return { source: assets.hail };
  if (condition === "storm-hail") return { source: assets.hail };
  if (condition === "mixed") return { source: assets.mixed };
  if (condition === "fog") return { source: assets.fog };
  if (condition === "dust") return { source: assets.wind };
  if (condition === "unknown") return { source: assets.unknown };
  return { source: assets.unknown };
}
