import type { UserPreferenceProfile } from "@weatheron/shared";
import type { AgeBand, FitPreference, SmartCareScenario, StyleGender } from "../state/useWeatherOnAppState";

export type PreferenceProfileInput = {
  styleGender: StyleGender;
  ageBand: AgeBand;
  fitPreference: FitPreference;
  selectedStyles: string[];
  smartCareScenario: SmartCareScenario;
};

export function toUserPreferenceProfile(values: PreferenceProfileInput): UserPreferenceProfile {
  return {
    gender: values.styleGender === "men" ? "male" : values.styleGender === "women" ? "female" : "any",
    ageBand: values.ageBand,
    styleTags: values.selectedStyles,
    fit: values.fitPreference,
    routine: values.smartCareScenario === "travel" ? "travel" : values.smartCareScenario === "outing" ? "free" : "commute",
    alertMode: "auto-care",
  };
}
