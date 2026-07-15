export type ZonedDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

const weekdayIds = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export function getZonedDateTimeParts(date: Date, timeZone: string): ZonedDateParts {
  const formatter = createDateTimeFormatter(timeZone);
  const entries = formatter.formatToParts(date).map((part) => [part.type, part.value]);
  const parts = Object.fromEntries(entries);
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

export function addZonedCalendarDays(parts: Pick<ZonedDateParts, "year" | "month" | "day">, days: number) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function createDateAtTimeInZone(
  dateParts: Pick<ZonedDateParts, "year" | "month" | "day">,
  time: string,
  timeZone: string,
): Date {
  const [hourText, minuteText] = time.split(":");
  const targetWallTime = Date.UTC(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    Number(hourText),
    Number(minuteText),
  );
  let candidateTime = targetWallTime;

  // 목표 시간대의 벽시계와 UTC 후보 간 차이를 보정함. DST 전환도 반복 보정으로 처리함.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const candidateParts = getZonedDateTimeParts(new Date(candidateTime), timeZone);
    const candidateWallTime = Date.UTC(
      candidateParts.year,
      candidateParts.month - 1,
      candidateParts.day,
      candidateParts.hour,
      candidateParts.minute,
    );
    const adjustment = targetWallTime - candidateWallTime;
    candidateTime += adjustment;
    if (adjustment === 0) break;
  }

  return new Date(candidateTime);
}

export function getMinutesUntilTimeInZone(time: string, nowMs: number, timeZone: string): number {
  const nowParts = getZonedDateTimeParts(new Date(nowMs), timeZone);
  const [hourText, minuteText] = time.split(":");
  const targetMinutes = Number(hourText) * 60 + Number(minuteText);
  const currentMinutes = nowParts.hour * 60 + nowParts.minute;
  const dayMinutes = 24 * 60;
  return ((targetMinutes - currentMinutes) % dayMinutes + dayMinutes) % dayMinutes;
}

export function getWeekdayForZonedDate(parts: Pick<ZonedDateParts, "year" | "month" | "day">) {
  const weekday = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
  return weekdayIds[weekday];
}

export function parseDateTimeInZone(value: string, timeZone: string): Date {
  if (/(?:Z|[+-]\d{2}:?\d{2})$/u.test(value)) return new Date(value);
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/u);
  if (!match) return new Date(value);
  return createDateAtTimeInZone(
    { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) },
    `${match[4]}:${match[5]}`,
    timeZone,
  );
}

// Intl.DateTimeFormat 생성은 Hermes에서 ICU 로케일 데이터를 로드하는 무거운 동기 작업이라,
// 목적지 전환처럼 이 유틸을 반복 호출하는 경로(시간당 예보 순회 등)에서 매번 새로 만들면
// 체감 가능한 지연으로 누적된다. timeZone별로 하나만 만들어 재사용한다.
const dateTimeFormatterCache = new Map<string, Intl.DateTimeFormat>();

function createDateTimeFormatter(timeZone: string) {
  const cached = dateTimeFormatterCache.get(timeZone);
  if (cached) return cached;

  const options: Intl.DateTimeFormatOptions = {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  };
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat("en-US", options);
  } catch {
    formatter = new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" });
  }
  dateTimeFormatterCache.set(timeZone, formatter);
  return formatter;
}
