const KMA_BASE_HOURS = [2, 5, 8, 11, 14, 17, 20, 23];

export function getKmaForecastBaseDateTime(now = new Date()) {
  const parts = getSeoulDateTimeParts(now);
  let selectedHour;
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

function getSeoulDateTimeParts(date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
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

function formatKmaDate(parts) {
  return `${parts.year}${String(parts.month).padStart(2, "0")}${String(parts.day).padStart(2, "0")}`;
}
