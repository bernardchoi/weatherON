import type { OfficialSpecialAlert } from "./weatherProvider";
import type { WeatherLocationPreset } from "./weatherLocations";
import { canonicalRegion, matchKmaExcludedZone, matchKmaNamedZone, provinces } from "./kmaAlertZones";

type RecordReader = (record: Record<string, unknown>, keys: string[]) => string | undefined;
const bulletinKeys = new Set(["t6", "t7", "tmef"]);
const ambiguousCities = new Set(["고성", "광주", "중", "동", "서", "남", "북", "강서"]);

function parseKst(value?: string): number {
  const parts = value?.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})$/u);
  if (!parts) return NaN;
  const [, y, m, d, h, min] = parts;
  const iso = `${y}-${m}-${d}T${h}:${min}:00`;
  const time = Date.parse(`${iso}+09:00`);
  return Number.isFinite(time) && new Date(time + 9 * 3_600_000).toISOString().startsWith(iso) ? time : NaN;
}

function splitAreas(value: string): string[] {
  let depth = 0;
  let part = "";
  const parts: string[] = [];
  for (const char of value) {
    if (char === "(") depth++;
    if (char === ")") depth--;
    if (depth < 0) return [];
    if (depth === 0 && /[,，]/u.test(char)) {
      parts.push(part.trim());
      part = "";
    } else part += char;
  }
  return depth === 0 ? [...parts, part.trim()].filter(Boolean) : [];
}

function matchesArea(area: string, location: WeatherLocationPreset): boolean {
  // Prefer administrative data over user-facing place names or POI text.
  const address: string[] = (location.kmaAdministrativeArea ?? location.locationName).match(/[가-힣]+(?:[0-9]+[가-힣]+)*/gu) ?? [];
  const names = new Set(address.map(canonicalRegion));
  const province = [...names].find(name => provinces.has(name));
  const group = area.match(/^([가-힣]+)\s*(?:\((.*)\))?$/u);
  if (!group) return false;
  const outer = canonicalRegion(group[1]);
  if (!group[2]) {
    const zone = matchKmaNamedZone(group[1], address);
    if (zone !== undefined) return zone;
    if (outer === "전국") return true;
    if (outer === "광주" && (province || address.includes("광주시"))) return false;
    return names.has(outer);
  }
  if (provinces.has(outer) && province && outer !== province) return false;
  const children = splitAreas(group[2]);
  if (!children.length) return false;
  // Recognize only a documented, complete exclusion rule. A partial or
  // ambiguous address never proves the location lies outside an exclusion.
  if (children.length === 1) {
    const exclusion = children[0].match(/^([가-힣\s]+?)\s*제외$/u);
    if (exclusion) return matchKmaExcludedZone(outer, exclusion[1], address);
  }
  if (children.some(child => /제외/u.test(child) && !child.includes("("))) return false;
  return children.some(child => {
    if (child.includes("(")) {
      const nested = child.match(/^(완도(?:군)?)\s*\([가-힣\s]+제외\)$/u);
      return Boolean(nested && ["전라남", "전남광주"].includes(outer) && matchesArea(child, location));
    }
    const zone = matchKmaNamedZone(child, address, outer);
    if (zone !== undefined) return zone;
    const childName = canonicalRegion(child);
    return /^[가-힣]+$/u.test(child) && names.has(childName)
      && (provinces.has(outer) ? !ambiguousCities.has(childName) || province === outer : names.has(outer));
  });
}

/** Undefined means this is not the bulletin schema, so the structured path may run. */
export function normalizeKmaBulletin(
  records: Record<string, unknown>[],
  location: WeatherLocationPreset,
  read: RecordReader,
  now: number,
): OfficialSpecialAlert[] | undefined {
  const bulletins = records.filter(record => Object.keys(record).some(key => bulletinKeys.has(key.toLowerCase())));
  if (!bulletins.length) return undefined;
  const effective = bulletins.map(record => ({
    text: read(record, ["t6"]),
    published: parseKst(read(record, ["tmFc"])),
    effective: parseKst(read(record, ["tmEf"])),
    sequence: Number(read(record, ["tmSeq"]) ?? 0),
  })).filter(item => item.published <= now && item.effective <= now
    && item.published >= now - 7 * 86_400_000)
    .sort((a, b) => b.published - a.published || b.sequence - a.sequence || b.effective - a.effective);
  // Each t6 is a full snapshot. Never resurrect older alerts once superseded,
  // and never treat t7 (preliminary) or other notes as active.
  const latest = effective[0];
  if (!latest?.text) return [];
  const text = latest.text.replace(/<br\s*\/?\s*>/giu, "\n").replace(/\r/gu, "");
  const alerts: OfficialSpecialAlert[] = [];
  const sections = text.split(/(?:^|\s)[o○●]\s*(?=[가-힣])/u);
  for (const section of sections) {
    const match = section.trim().match(/^(호우|폭염)\s*(중대\s*경보|경보|주의보)\s*[:：]\s*([\s\S]+)$/u);
    if (!match) continue;
    const [, hazard, rawSeverity, description] = match;
    const severity = rawSeverity.replace(/\s+/gu, "");
    if (severity === "중대경보" && hazard !== "폭염") continue;
    // Stop at non-bulletin paragraphs, and allow whitespace in wrapped lists.
    const areas = splitAreas(description.split(/\n\s*\n/u)[0].replace(/\s+/gu, " ").trim().replace(/[.]$/u, ""));
    const area = areas.find(candidate => matchesArea(candidate, location));
    if (!area) continue;
    alerts.push({
      source: "kma",
      active: true,
      type: hazard === "호우" ? "heavy-rain" : "heatwave",
      level: severity === "중대경보" ? "critical" : severity === "경보" ? "warning" : "advisory",
      title: `${hazard}${severity}`,
      reason: area,
      regionName: area,
      issuedAt: new Date(latest.published).toISOString(),
      effectiveAt: new Date(latest.effective).toISOString(),
      rawStatus: "getPwnStatus",
    });
  }
  return alerts;
}
