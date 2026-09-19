export const supportedLanguages = ["ko", "en", "ja"] as const;

export type AppLanguage = (typeof supportedLanguages)[number];

export type DeviceLocalePreference = {
  languageTag?: string | null;
  languageCode?: string | null;
  regionCode?: string | null;
  measurementSystem?: "metric" | "us" | "uk" | null;
  temperatureUnit?: "celsius" | "fahrenheit" | null;
};

export type LocalePolicy = {
  language: AppLanguage;
  languageTag: string;
  regionCode: string | null;
  temperatureUnit: "celsius" | "fahrenheit";
  distanceUnit: "meter" | "mile";
  uses24HourClock: boolean;
  deviceTimeZone: string | null;
};

export function resolveSupportedLanguage(locales: readonly DeviceLocalePreference[]): AppLanguage {
  for (const locale of locales) {
    const language = normalizeLanguage(locale.languageCode ?? locale.languageTag);
    if (language) return language;
  }
  return "en";
}

export function resolveLocalePolicy(
  locales: readonly DeviceLocalePreference[],
  calendar: { uses24hourClock?: boolean | null; timeZone?: string | null } = {},
): LocalePolicy {
  const primary = locales[0];
  const language = resolveSupportedLanguage(locales);
  return {
    language,
    languageTag: getDisplayLanguageTag(locales, language),
    regionCode: normalizeRegion(primary?.regionCode) ?? getRegionFromTag(primary?.languageTag),
    temperatureUnit: primary?.temperatureUnit === "fahrenheit" ? "fahrenheit" : "celsius",
    distanceUnit: primary?.measurementSystem === "us" || primary?.measurementSystem === "uk" ? "mile" : "meter",
    uses24HourClock: calendar.uses24hourClock ?? infer24HourClock(primary?.languageTag),
    deviceTimeZone: calendar.timeZone || null,
  };
}

export function normalizeLanguage(value?: string | null): AppLanguage | null {
  const language = value?.trim().replaceAll("_", "-").split("-")[0]?.toLowerCase();
  return supportedLanguages.includes(language as AppLanguage) ? language as AppLanguage : null;
}

function normalizeRegion(value?: string | null): string | null {
  return value && /^[A-Za-z]{2}$/u.test(value) ? value.toUpperCase() : null;
}

function getRegionFromTag(value?: string | null): string | null {
  if (!value) return null;
  try {
    return normalizeRegion(new Intl.Locale(value.replaceAll("_", "-")).region);
  } catch {
    return null;
  }
}

function getDisplayLanguageTag(locales: readonly DeviceLocalePreference[], language: AppLanguage): string {
  const supportedLocale = locales.find((locale) => normalizeLanguage(locale.languageCode ?? locale.languageTag) === language);
  const region = normalizeRegion(supportedLocale?.regionCode) ?? getRegionFromTag(supportedLocale?.languageTag);
  if (region) return `${language}-${region}`;
  return language === "ko" ? "ko-KR" : language === "ja" ? "ja-JP" : "en-US";
}

function infer24HourClock(languageTag?: string | null): boolean {
  try {
    return new Intl.DateTimeFormat(languageTag || undefined, { hour: "numeric" }).resolvedOptions().hour12 === false;
  } catch {
    return false;
  }
}
