// KMA's published warning-zone table, reviewed 2026-11-23:
// https://www.weather.go.kr/w/forecast/guide/wrn-area.do
// Only explicit administrative memberships. Don't guess "동지역", elevation,
// islands, or other subdivisions from a city name or a coarse coordinate.
const seoulZones = {
  서울동남권: "강동구 송파구 강남구 서초구",
  서울동북권: "도봉구 노원구 강북구 성북구 동대문구 중랑구 성동구 광진구",
  서울서남권: "강서구 양천구 구로구 영등포구 동작구 관악구 금천구",
  서울서북권: "은평구 종로구 마포구 서대문구 중구 용산구",
};
const pajuZones = {
  파주동북부: "문산읍 법원읍 파주읍 적성면 파평면",
  파주서북부: "장단면 군내면 진서면 진동면",
  파주남부: "조리읍 광탄면 탄현면 월롱면",
};
const busanZones = {
  부산동부: "기장군 해운대구 수영구 남구",
  부산중부: "금정구 북구 동래구 연제구 부산진구 사상구",
  부산서부: "강서구 사하구 영도구 서구 동구 중구",
};

const gwangjuZones = {
  광주동부: "동구 서구 남구 북구",
  광주서부: "광산구",
};
const gwangjuDistricts = new Set(Object.values(gwangjuZones).join(" ").split(" "));

function readGwangjuDistrict([parent, first, second]: string[]): string | undefined {
  if (!parent) return undefined;
  const merged = canonicalRegion(parent) === "전남광주";
  if (parent !== "광주" && parent !== "광주광역시" && !merged) return undefined;
  // Some geocoders include the former city name after the new upper area.
  const district = merged && (first === "광주" || first === "광주광역시")
    ? second : first;
  return district && gwangjuDistricts.has(district) ? district : undefined;
}

export const administrativeSuffix = /(?:특별자치도|특별자치시|통합특별시|특별시|광역시|자치도|[도시군구])$/u;
const provinceAliases: Readonly<Record<string, string>> = {
  충북: "충청북", 충남: "충청남", 전라북: "전북",
  전남: "전라남", 경북: "경상북", 경남: "경상남",
};

export const provinces = new Set(["경기", "강원", "충청북", "충청남", "전북", "전라남", "경상북", "경상남", "제주"]);

export function canonicalRegion(value: string): string {
  const trimmed = value.trim();
  const stripped = trimmed.replace(administrativeSuffix, "");
  // A standalone island/county name such as 완도 is not a province suffix.
  const name = trimmed === stripped + "도" && !provinces.has(stripped) && !Object.hasOwn(provinceAliases, stripped)
    ? trimmed : stripped;
  return Object.hasOwn(provinceAliases, name) ? provinceAliases[name] : name;
}

const upperAreas = new Set([...provinces, "서울", "부산", "울산", "대구", "대전", "광주", "인천", "세종", "전남광주"]);

type Scope = "in" | "out" | "unknown";
type Zone = { parent: string; member: (tokens: string[]) => Scope };

function zonedMembers<T extends Record<string, string>>(
  parent: string, membersByZone: T, memberSuffix: RegExp,
): Record<keyof T, Zone> {
  const all = new Set(Object.values(membersByZone).flatMap(members => members.split(" ")));
  return Object.fromEntries(Object.entries(membersByZone).map(([name, members]) => {
    const included = new Set(members.split(" "));
    return [name, { parent, member: (tokens: string[]): Scope => {
      const firstUnit = tokens[0];
      if (!firstUnit || !memberSuffix.test(firstUnit) || !all.has(firstUnit)) return "unknown";
      return included.has(firstUnit) ? "in" : "out";
    } }];
  })) as Record<keyof T, Zone>;
}

// Municipality list: https://www.wando.go.kr/wando/sub.cs?m=713
const wandoTownships = new Set("완도읍 금일읍 노화읍 군외면 신지면 고금면 약산면 청산면 소안면 금당면 보길면 생일면".split(" "));
const zones: Readonly<Record<string, Zone>> = {
  ...zonedMembers("서울", seoulZones, /구$/u),
  ...zonedMembers("파주", pajuZones, /[읍면]$/u),
  ...zonedMembers("부산", busanZones, /[구군]$/u),
  ...zonedMembers("광주", gwangjuZones, /구$/u),
  완도여서도: { parent: "완도", member: ([town, village]) => {
    if (!wandoTownships.has(town)) return "unknown";
    if (town !== "청산면") return "out";
    if (!village?.endsWith("리")) return "unknown";
    return village === "여서리" ? "in" : "out";
  } },
};

function matchZone(zone: Zone, address: string[]): Scope {
  const [head, second] = address;
  if (!head) return "unknown";
  if (zone.parent === "광주") {
    const district = readGwangjuDistrict(address);
    return district ? zone.member([district]) : "unknown";
  }
  if (zone.parent === "파주" || zone.parent === "완도") {
    const requiredUpper = zone.parent === "파주" ? ["경기"] : ["전라남", "전남광주"];
    if (canonicalRegion(head) === zone.parent) return zone.member(address.slice(1));
    if (!requiredUpper.includes(canonicalRegion(head))) return "unknown";
    return second && canonicalRegion(second) === zone.parent ? zone.member(address.slice(2)) : "unknown";
  }
  return canonicalRegion(head) === zone.parent ? zone.member(address.slice(1)) : "unknown";
}

function resolveZone(label: string, outer?: string): Zone | undefined {
  const name = label.replace(/\s+/gu, "");
  const qualified = outer && /^(?:동남권|동북권|서남권|서북권|동부|중부|서부)$/u.test(name) ? outer + name : name;
  if (!Object.hasOwn(zones, qualified)) return undefined;
  const zone = zones[qualified];
  if (!outer || outer === zone.parent || (outer === "경기" && zone.parent === "파주")
    || (["전라남", "전남광주"].includes(outer) && zone.parent === "완도")
    || (outer === "전남광주" && zone.parent === "광주")) return zone;
  return undefined;
}

// Sanitize to a leading administrative path; don't interpret a POI name or
// a later text fragment as a district, and don't retain street/house details.
export function readKmaAdministrativeArea(value: string): string | undefined {
  const tokens = value.trim().replace(/^대한민국(?:[ ,]+|$)/u, "").match(/^[가-힣\d]+(?:[ ,·]+[가-힣\d]+)*/u)?.[0].split(/[ ,·]+/u) ?? [];
  const result: string[] = [];
  for (const token of tokens) {
    const upper = upperAreas.has(canonicalRegion(token)) && !/[시군구]$/u.test(token.replace(/(?:특별자치시|통합특별시|특별시|광역시)$/u, ""));
    const unit = /^[가-힣]+\d*[가-힣]*[시군구읍면동리]$/u.test(token);
    if ((!result.length && !upper && !/^[가-힣]+[시군]$/u.test(token)) || (!unit && !upper)) break;
    if (result.at(-1) !== token) result.push(token);
  }
  return result.length ? result.join(" ") : undefined;
}

/** A former-city scope requires exact district evidence, not the combined province alone. */
export function matchKmaGwangjuScope(label: string, address: string[], child?: string): boolean | undefined {
  if (canonicalRegion(label) !== "광주" || label === "광주시") return undefined;
  const district = readGwangjuDistrict(address);
  return Boolean(district && (!child || district === (child.endsWith("구") ? child : child + "구")));
}

/** undefined means no special case is defined; false is a conservative non-match. */
export function matchKmaNamedZone(label: string, address: string[], outer?: string): boolean | undefined {
  const zone = resolveZone(label, outer);
  if (zone) return matchZone(zone, address) === "in";
  // A known warning zone listed under a conflicting parent must not fall through.
  if (resolveZone(label)) return false;
  return undefined;
}

export function matchKmaExcludedZone(outer: string, excluded: string, address: string[]): boolean {
  const normalized = excluded.trim().replace(/\s+/gu, "");
  if (outer === "완도" && /^(?:완도(?:군)?)?여서도$/u.test(normalized)) {
    return matchZone(zones.완도여서도, address) === "out";
  }
  const zone = resolveZone(normalized, outer);
  return zone?.parent === outer && matchZone(zone, address) === "out";
}
