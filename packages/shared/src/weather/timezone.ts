const forecastDateFormatters = new Map<string, Intl.DateTimeFormat>();

function forecastDateFormatter(timeZone: string) {
  let formatter = forecastDateFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
    forecastDateFormatters.set(timeZone, formatter);
  }
  return formatter;
}

export function isValidIanaTimeZone(value?: string): value is string {
  if (!value?.trim()) return false;
  try {
    forecastDateFormatter(value);
    return true;
  } catch {
    return false;
  }
}

export function getForecastLocalDate(value: string, timeZone: string): string {
  // 공급자가 지역 벽시계로 준 값은 그대로, offset/Z가 있으면 예보 지역 날짜로 변환한다.
  if (!/(?:Z|[+-]\d{2}:?\d{2})$/u.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const parts = Object.fromEntries(forecastDateFormatter(timeZone).formatToParts(date).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
