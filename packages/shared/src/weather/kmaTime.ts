// KMA 단기예보 발표 시각 계산. 발표는 KST 기준 02·05·08·11·14·17·20·23시이고,
// 각 발표분 조회는 10분 이후부터 안정적이라 10분 미만이면 이전 발표분을 쓴다.
// 서버(Node/Worker)는 배포 경계상 이 TS를 임포트할 수 없어 동일 로직을
// apps/server/src/kmaTime.mjs에 유지한다. 수정 시 함께 갱신할 것.
const KMA_BASE_HOURS = [2, 5, 8, 11, 14, 17, 20, 23];

export type KmaForecastBaseDateTime = {
  baseDate: string;
  baseTime: string;
};

export function getKmaForecastBaseDateTime(now: Date = new Date()): KmaForecastBaseDateTime {
  const parts = getSeoulDateTimeParts(now);
  let selectedHour: number | undefined;
  for (const hour of KMA_BASE_HOURS) {
    if (parts.hour > hour || (parts.hour === hour && parts.minute >= 10)) selectedHour = hour;
  }
  if (selectedHour == null) {
    const previous = new Date(Date.UTC(parts.year, parts.month - 1, parts.day - 1));
    return {
      baseDate: formatKmaDate({
        year: previous.getUTCFullYear(),
        month: previous.getUTCMonth() + 1,
        day: previous.getUTCDate(),
      }),
      baseTime: "2300",
    };
  }
  return {
    baseDate: formatKmaDate(parts),
    baseTime: `${String(selectedHour).padStart(2, "0")}00`,
  };
}

type SeoulDateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function getSeoulDateTimeParts(date: Date): SeoulDateTimeParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const entries = formatter.formatToParts(date).map((part) => [part.type, part.value] as const);
  const parts = Object.fromEntries(entries);
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function formatKmaDate(parts: Pick<SeoulDateTimeParts, "year" | "month" | "day">): string {
  return `${parts.year}${String(parts.month).padStart(2, "0")}${String(parts.day).padStart(2, "0")}`;
}
