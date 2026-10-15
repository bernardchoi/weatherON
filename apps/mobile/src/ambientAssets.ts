// V3 filled silhouettes where meanings match; original v1 fallback elsewhere.
import { filledV3Weather } from "./filledV3Assets";
import { uiIconAssets } from "./assets";
import type { AppTheme } from "./theme/tokens";
export const ambientUiIcons = {
  // Code vector follows approved 24×24 / 1.75 outline grammar and core v3 document shape.
  policyDocument: require("../../../assets/ambient-surface-runtime-v1/ui-outline/policy-document.png"),
  delete: require("../../../assets/ambient-surface-runtime-v1/ui-outline/delete.png"),
  wardrobe: require("../../../assets/filled-surface-v3-20261015/png/compact/light/wardrobe.png"),
  style: require("../../../assets/ambient-surface-runtime-v1/ui-outline/style.png"),
  permissions: require("../../../assets/ambient-surface-runtime-v1/ui-outline/permissions.png"),
  settings: require("../../../assets/ambient-surface-runtime-v1/ui-outline/settings.png"),
  tabHome: require("../../../assets/filled-surface-v3-20261015/png/compact/light/tab-home.png"),
  tabOutfit: require("../../../assets/filled-surface-v3-20261015/png/compact/light/tab-outfit.png"),
  tabDepart: require("../../../assets/filled-surface-v3-20261015/png/compact/light/tab-depart.png"),
  tabMy: require("../../../assets/filled-surface-v3-20261015/png/compact/light/tab-my.png"),
  location: require("../../../assets/filled-surface-v3-20261015/png/compact/light/location.png"),
  time: require("../../../assets/ambient-surface-runtime-v1/ui-outline/time.png"),
  umbrella: require("../../../assets/ambient-surface-runtime-v1/ui-outline/umbrella.png"),
  notifications: require("../../../assets/ambient-surface-runtime-v1/ui-outline/notifications.png"),
  expand: require("../../../assets/ambient-surface-runtime-v1/ui-outline/expand.png"),
  add: require("../../../assets/ambient-surface-runtime-v1/ui-outline/add.png"),
  temperature: require("../../../assets/ambient-surface-runtime-v1/ui-outline/temperature.png"),
  wind: require("../../../assets/filled-surface-v3-20261015/png/compact/light/wind.png"),
  droplet: require("../../../assets/ambient-surface-runtime-v1/ui-outline/droplet.png"),
  check: require("../../../assets/ambient-surface-runtime-v1/ui-outline/check.png"),
};
export const ambientSelectedTabs = {
  tabHome: require("../../../assets/ambient-surface-runtime-v1/tabs-selected/tab-home.png"),
  tabOutfit: require("../../../assets/ambient-surface-runtime-v1/tabs-selected/tab-outfit.png"),
  tabDepart: require("../../../assets/ambient-surface-runtime-v1/tabs-selected/tab-depart.png"),
  tabMy: require("../../../assets/ambient-surface-runtime-v1/tabs-selected/tab-my.png"),
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
export function ambientWeatherIcon(condition: string, isNight: boolean, theme: AppTheme, variant: "compact" | "hero" = "compact") {
  const assets = filledV3Weather[variant][theme.name];
  if (condition === "clear") return { source: isNight ? assets.night : assets.sun };
  if (condition === "cloud") return { source: assets.cloud };
  if (condition === "rain") return { source: assets.rain };
  // Provider storm means heavy rain here, not necessarily lightning.
  if (condition === "storm") return { source: weather[theme.name]["heavy-rain"] };
  if (condition === "snow") return { source: assets.snow };
  if (condition === "fog") return { source: assets.fog };
  if (condition === "dust") return { source: uiIconAssets.wind, tintColor: theme.muted };
  // Unsupported provider states (including mixed/hail/unknown) keep caller fallback.
  return undefined;
}
