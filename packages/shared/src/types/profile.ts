export type UserPreferenceProfile = {
  gender: "male" | "female" | "any";
  ageBand: "10-20" | "20-30" | "30-40" | "40-50" | "50+";
  styleTags: string[];
  fit: "standard" | "relaxed" | "formal" | "outdoor";
  routine: "commute" | "school" | "travel" | "free";
  alertMode: "auto-care";
};

export const defaultPreferenceProfile: UserPreferenceProfile = {
  gender: "any",
  ageBand: "20-30",
  styleTags: ["minimal", "clean"],
  fit: "standard",
  routine: "commute",
  alertMode: "auto-care",
};
