// WeatherKit REST WeatherAlertCollection/WeatherAlertSummary. Keep the
// agency's description verbatim and require Apple's supplied details link.
export type JapanWeatherAlert = {
  id: string;
  description: string;
  agency: string;
  detailsUrl: string;
  expiresAt: number;
};

export type JapanWeatherAlertResult = {
  locationId: string;
  status: "checking" | "active" | "none" | "unavailable";
  alerts: JapanWeatherAlert[];
};

export const japanWeatherAgencyUrl = "https://www.jma.go.jp/bosai/warning/";

export function japanWeatherAlertStatus(locationId: string, status: "checking" | "none" | "unavailable"): JapanWeatherAlertResult {
  return { locationId, status, alerts: [] };
}

function object(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function apiTime(value: unknown): number {
  return typeof value === "string" && /T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/iu.test(value)
    ? Date.parse(value) : NaN;
}

function appleAlertUrl(value: unknown, base?: string): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const url = new URL(value, value.startsWith("#") ? base : undefined);
    if (url.protocol === "https:" && !url.username && !url.password && !url.port
      && ["weatherkit.apple.com", "weather-data.apple.com"].includes(url.hostname)
      && url.pathname === "/alertDetails/index.html") return url.href;
  } catch { /* An invalid URL cannot be opened. */ }
  return undefined;
}

export function normalizeJapanWeatherAlerts(payload: unknown, locationId: string, now = Date.now()): JapanWeatherAlertResult {
  const collection = object(object(payload)?.weatherAlerts);
  const metadata = object(collection?.metadata);
  const expires = apiTime(metadata?.expireTime);
  if (!Array.isArray(collection?.alerts) || metadata?.temporarilyUnavailable === true
    || (metadata?.expireTime !== undefined && (!Number.isFinite(expires) || expires <= now))) {
    return japanWeatherAlertStatus(locationId, "unavailable");
  }
  const collectionUrl = appleAlertUrl(collection.detailsUrl);
  const alerts = new Map<string, JapanWeatherAlert>();
  let invalid = false;
  for (const item of collection.alerts) {
    const alert = object(item);
    if (!alert || alert.countryCode !== "JP") { invalid = true; continue; }
    const effectiveAt = apiTime(alert.effectiveTime);
    const expiresAt = apiTime(alert.expireTime);
    if (!Number.isFinite(effectiveAt) || !Number.isFinite(expiresAt) || expiresAt <= effectiveAt) { invalid = true; continue; }
    if (now < effectiveAt || now >= expiresAt) continue;
    const detailsUrl = appleAlertUrl(alert.detailsUrl, collectionUrl) ?? collectionUrl;
    if (!detailsUrl || typeof alert.id !== "string" || !alert.id.trim()
      || typeof alert.description !== "string" || !alert.description.trim()
      || typeof alert.source !== "string" || !alert.source.trim()) { invalid = true; continue; }
    if (!alerts.has(alert.id)) alerts.set(alert.id, {
      id: alert.id, description: alert.description, agency: alert.source, detailsUrl,
      expiresAt: Number.isFinite(expires) ? Math.min(expiresAt, expires) : expiresAt,
    });
  }
  if (!alerts.size) return japanWeatherAlertStatus(locationId, invalid ? "unavailable" : "none");
  return { locationId, status: "active", alerts: [...alerts.values()] };
}
