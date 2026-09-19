import { getCalendars, getLocales } from "expo-localization";
import en from "./locales/en.json";
import ja from "./locales/ja.json";
import { resolveLocalePolicy, type AppLanguage, type LocalePolicy } from "./localePolicy";

type Catalog = Record<string, string>;
type Listener = () => void;

const catalogs: Record<Exclude<AppLanguage, "ko">, Catalog> = { en, ja };
const listeners = new Set<Listener>();
const patternCache = new Map<AppLanguage, Array<{ source: RegExp; target: string }>>();
let snapshot = readDeviceLocalePolicy();

export function getLocalePolicy(): LocalePolicy {
  return snapshot;
}

export function refreshLocalePolicy(): boolean {
  const next = readDeviceLocalePolicy();
  if (JSON.stringify(next) === JSON.stringify(snapshot)) return false;
  snapshot = next;
  patternCache.clear();
  listeners.forEach((listener) => listener());
  return true;
}

export function subscribeLocalePolicy(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function translateText(value: string, language = snapshot.language): string {
  if (language === "ko" || !/[가-힣]/u.test(value)) return value;
  const catalog = catalogs[language];
  const leading = value.match(/^\s*/u)?.[0] ?? "";
  const trailing = value.match(/\s*$/u)?.[0] ?? "";
  const source = value.trim();
  const exact = catalog[source];
  if (exact) return `${leading}${exact}${trailing}`;
  for (const pattern of getPatterns(language)) {
    const match = source.match(pattern.source);
    if (!match) continue;
    return `${leading}${fillPlaceholders(pattern.target, match.slice(1), language)}${trailing}`;
  }
  return value;
}

export function translateAccessibility(value?: string, language?: AppLanguage): string | undefined {
  return value ? translateText(value, language) : value;
}

export function formatDisplayDate(
  value: Date | number | string,
  options: Intl.DateTimeFormatOptions,
  timeZone?: string,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return translateText("날짜 미상");
  return new Intl.DateTimeFormat(snapshot.languageTag, { ...options, timeZone }).format(date);
}

export function formatDisplayTime(value: Date | number | string, timeZone?: string): string {
  return formatDisplayDate(value, {
    hour: "numeric",
    minute: "2-digit",
    hour12: !snapshot.uses24HourClock,
  }, timeZone);
}

export function formatDisplayClockTime(value: string): string {
  const match = value.match(/(?:^|T)(\d{2}):(\d{2})(?::|$)/u);
  if (!match) return translateText("확인 중");
  const date = new Date(Date.UTC(2020, 0, 1, Number(match[1]), Number(match[2])));
  return formatDisplayTime(date, "UTC");
}

export function formatDisplayNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(snapshot.languageTag, options).format(value);
}

export function formatDisplayUnit(value: number, unit: Intl.NumberFormatOptions["unit"], maximumFractionDigits: number): string {
  return formatDisplayNumber(value, { style: "unit", unit, unitDisplay: "narrow", maximumFractionDigits });
}

function readDeviceLocalePolicy(): LocalePolicy {
  try {
    return resolveLocalePolicy(getLocales(), getCalendars()[0]);
  } catch {
    return resolveLocalePolicy([{ languageTag: "en-US", languageCode: "en", regionCode: "US" }]);
  }
}

function getPatterns(language: Exclude<AppLanguage, "ko">) {
  const cached = patternCache.get(language);
  if (cached) return cached;
  const patterns = Object.entries(catalogs[language])
    .filter(([key]) => /\{\d+\}/u.test(key))
    .map(([key, target]) => ({
      source: new RegExp(`^${escapeRegExp(key).replace(/\\\{\d+\\\}/gu, "(.+?)")}$`, "u"),
      target,
    }))
    .sort((left, right) => right.source.source.length - left.source.source.length);
  patternCache.set(language, patterns);
  return patterns;
}

function fillPlaceholders(target: string, values: string[], language: AppLanguage): string {
  const template = target.startsWith("plural:")
    ? target.slice("plural:".length).split("|")[new Intl.PluralRules(language).select(Number(values[0])) === "one" ? 0 : 1]
    : target;
  return template.replace(/\{(\d+)\}/gu, (_, index: string) => values[Number(index)] ?? "");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
