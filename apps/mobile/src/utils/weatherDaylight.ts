import type { CountryCode, GeoCoordinate } from "@weatheron/shared";
import {
  addZonedCalendarDays,
  createDateAtTimeInZone,
  getZonedDateTimeParts,
  parseDateTimeInZone,
} from "./zonedDateTime";

export type WeatherDaylightContext = {
  coordinate?: GeoCoordinate;
  timeZone?: string;
};

const officialZenith = 90.833;

export function isNightAtWeatherTime(
  value: string,
  context: WeatherDaylightContext,
  referenceValue = value,
): boolean {
  const timeZone = context.timeZone ?? "UTC";
  const referenceDate = resolveWeatherDate(referenceValue, timeZone, new Date());
  const date = resolveWeatherDate(value, timeZone, referenceDate);
  const localParts = getZonedDateTimeParts(date, timeZone);
  const coordinate = context.coordinate;

  if (coordinate && isValidCoordinate(coordinate)) {
    const events = getSolarEvents(date, coordinate, timeZone);
    if (events) return date < events.sunrise || date >= events.sunset;
  }

  return localParts.hour >= 19 || localParts.hour < 6;
}

export function isNightAtForecastTime(
  value: string,
  context: WeatherDaylightContext,
  referenceValue = value,
): boolean {
  const timeZone = context.timeZone ?? "UTC";
  const referenceDate = resolveWeatherDate(referenceValue, timeZone, new Date());
  const date = resolveForecastWallTime(value, timeZone, referenceDate);
  const localParts = getZonedDateTimeParts(date, timeZone);
  const coordinate = context.coordinate;

  if (coordinate && isValidCoordinate(coordinate)) {
    const events = getSolarEvents(date, coordinate, timeZone);
    if (events) return date < events.sunrise || date >= events.sunset;
  }

  return localParts.hour >= 19 || localParts.hour < 6;
}

export function resolveWeatherTimeZone(countryCode: CountryCode, timeZone?: string): string | undefined {
  if (countryCode === "KR") return "Asia/Seoul";
  if (countryCode === "JP") return "Asia/Tokyo";
  return timeZone;
}

function resolveWeatherDate(value: string, timeZone: string, referenceDate: Date): Date {
  const shortTime = value.match(/^(\d{2}):(\d{2})$/u);
  if (!shortTime) {
    const parsed = parseDateTimeInZone(value, timeZone);
    return Number.isNaN(parsed.getTime()) ? referenceDate : parsed;
  }

  const referenceParts = getZonedDateTimeParts(referenceDate, timeZone);
  let dateParts = {
    year: referenceParts.year,
    month: referenceParts.month,
    day: referenceParts.day,
  };
  let candidate = createDateAtTimeInZone(dateParts, `${shortTime[1]}:${shortTime[2]}`, timeZone);

  // 23시 다음 00시처럼 날짜가 생략된 예보는 다음 날로 해석함.
  if (candidate.getTime() < referenceDate.getTime() - 2 * 3_600_000) {
    dateParts = addZonedCalendarDays(dateParts, 1);
    candidate = createDateAtTimeInZone(dateParts, `${shortTime[1]}:${shortTime[2]}`, timeZone);
  }
  return candidate;
}

function resolveForecastWallTime(value: string, timeZone: string, referenceDate: Date): Date {
  const dateTime = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/u);
  if (dateTime) {
    return createDateAtTimeInZone(
      { year: Number(dateTime[1]), month: Number(dateTime[2]), day: Number(dateTime[3]) },
      `${dateTime[4]}:${dateTime[5]}`,
      timeZone,
    );
  }
  return resolveWeatherDate(value, timeZone, referenceDate);
}

function getSolarEvents(date: Date, coordinate: GeoCoordinate, timeZone: string) {
  const sunrise = getSolarEvent(date, coordinate, timeZone, true);
  const sunset = getSolarEvent(date, coordinate, timeZone, false);
  return sunrise && sunset ? { sunrise, sunset } : null;
}

function getSolarEvent(date: Date, coordinate: GeoCoordinate, timeZone: string, isSunrise: boolean): Date | null {
  const localParts = getZonedDateTimeParts(date, timeZone);
  const localNoon = createDateAtTimeInZone(localParts, "12:00", timeZone);
  const dayOfYear = getDayOfYear(localParts.year, localParts.month, localParts.day);
  const longitudeHour = coordinate.longitude / 15;
  const approximateTime = dayOfYear + ((isSunrise ? 6 : 18) - longitudeHour) / 24;
  const meanAnomaly = 0.9856 * approximateTime - 3.289;
  const trueLongitude = normalizedDegrees(
    meanAnomaly
      + 1.916 * Math.sin(degreesToRadians(meanAnomaly))
      + 0.02 * Math.sin(2 * degreesToRadians(meanAnomaly))
      + 282.634,
  );

  let rightAscension = normalizedDegrees(
    radiansToDegrees(Math.atan(0.91764 * Math.tan(degreesToRadians(trueLongitude)))),
  );
  const longitudeQuadrant = Math.floor(trueLongitude / 90) * 90;
  const rightAscensionQuadrant = Math.floor(rightAscension / 90) * 90;
  rightAscension = (rightAscension + longitudeQuadrant - rightAscensionQuadrant) / 15;

  const sinDeclination = 0.39782 * Math.sin(degreesToRadians(trueLongitude));
  const cosDeclination = Math.cos(Math.asin(sinDeclination));
  const cosHourAngle = (
    Math.cos(degreesToRadians(officialZenith))
      - sinDeclination * Math.sin(degreesToRadians(coordinate.latitude))
  ) / (cosDeclination * Math.cos(degreesToRadians(coordinate.latitude)));
  if (cosHourAngle < -1 || cosHourAngle > 1) return null;

  const hourAngleDegrees = isSunrise
    ? 360 - radiansToDegrees(Math.acos(cosHourAngle))
    : radiansToDegrees(Math.acos(cosHourAngle));
  const localMeanTime = hourAngleDegrees / 15 + rightAscension - 0.06571 * approximateTime - 6.622;
  const utcHour = normalizedHours(localMeanTime - longitudeHour);
  const utcMidnight = Date.UTC(localParts.year, localParts.month - 1, localParts.day);
  let event = new Date(utcMidnight + utcHour * 3_600_000);

  while (event.getTime() - localNoon.getTime() <= -12 * 3_600_000) {
    event = new Date(event.getTime() + 24 * 3_600_000);
  }
  while (event.getTime() - localNoon.getTime() > 12 * 3_600_000) {
    event = new Date(event.getTime() - 24 * 3_600_000);
  }
  return event;
}

function getDayOfYear(year: number, month: number, day: number): number {
  return Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 86_400_000);
}

function isValidCoordinate(coordinate: GeoCoordinate): boolean {
  return Number.isFinite(coordinate.latitude)
    && Number.isFinite(coordinate.longitude)
    && Math.abs(coordinate.latitude) <= 90
    && Math.abs(coordinate.longitude) <= 180;
}

function normalizedDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function normalizedHours(value: number): number {
  return ((value % 24) + 24) % 24;
}

function degreesToRadians(value: number): number {
  return value * Math.PI / 180;
}

function radiansToDegrees(value: number): number {
  return value * 180 / Math.PI;
}
