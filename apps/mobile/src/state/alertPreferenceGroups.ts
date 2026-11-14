import type { AlertPreferences } from "./appStateTypes";

export const alertPreferenceGroups = {
  weather: ["rainDetail", "weatherAlerts"],
  daily: ["routine", "bedtime"],
  departure: ["destination"],
} as const;
export type AlertPreferenceGroup = keyof typeof alertPreferenceGroups;
export function getAlertGroupState(preferences: AlertPreferences, group: AlertPreferenceGroup): boolean | "mixed" {
  const values = alertPreferenceGroups[group].map((key) => preferences[key]);
  return values.every(Boolean) ? true : values.some(Boolean) ? "mixed" : false;
}
// No migration on read: legacy individual choices remain intact until an explicit action.
// A mixed group turns off first; never enable previously declined notifications implicitly.
export function toggleAlertGroup(preferences: AlertPreferences, group: AlertPreferenceGroup): AlertPreferences {
  const enabled = getAlertGroupState(preferences, group) === false;
  const next = { ...preferences };
  for (const key of alertPreferenceGroups[group]) next[key] = enabled;
  return next;
}
