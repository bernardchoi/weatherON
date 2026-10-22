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
  const leading = value.match(/^\s*/u)?.[0] ?? "";
  const trailing = value.match(/\s*$/u)?.[0] ?? "";
  const source = value.trim();
  const known = translateKnown(source, language);
  if (known !== undefined) return `${leading}${known}${trailing}`;
  // Rule guidance composes independently translated warning and clothing blocks.
  // Match the longest known block first; retain unknown Korean verbatim so a
  // missing translation cannot replace a warning with optimistic generic copy.
  const lines = source.split("\n");
  if (lines.length > 1) {
    const translated: string[] = [];
    for (let start = 0; start < lines.length;) {
      let end = lines.length;
      let match: string | undefined;
      for (; end > start; end--) {
        const candidate = lines.slice(start, end).join("\n");
        if (start === 0 && end === lines.length) continue;
        const result = translateKnown(candidate, language);
        if (result !== undefined && !/[가-힣]/u.test(result)) { match = result; break; }
      }
      translated.push(match ?? lines[start]);
      start = match === undefined ? start + 1 : end;
    }
    return `${leading}${translated.join("\n")}${trailing}`;
  }
  return value;
}

function translateKnown(source: string, language: Exclude<AppLanguage, "ko">): string | undefined {
  const exact = catalogs[language][source];
  if (exact) return exact;
  for (const pattern of getPatterns(language)) {
    const match = source.match(pattern.source);
    if (match) return fillPlaceholders(pattern.target, match.slice(1), language);
  }
  return undefined;
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
      source: new RegExp(`^${escapeRegExp(key).replace(/\\\{\d+\\\}/gu, "([\\s\\S]+?)")}$`, "u"),
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
  return template.replace(/\{(\d+)\}/gu, (_, index: string) => translateText(values[Number(index)] ?? "", language));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
