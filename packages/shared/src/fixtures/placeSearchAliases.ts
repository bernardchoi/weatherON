// 외부 지오코더(카카오·구글·Open-Meteo)에 보내기 전 검색어를 보정하는 별칭 테이블.
// placeSearchFixtures.ts의 내부 별칭(픽스처 이름 매칭용)과는 목적이 달라 분리 유지한다.
// 서버(Node/Worker)는 배포 경계상 이 TS를 임포트할 수 없어 동일 테이블을
// apps/server/src/proxyCore.mjs에 유지한다. 수정 시 함께 갱신할 것.
export const placeSearchQueryAliases: Record<string, string> = {
  "잠실": "잠실야구장",
  "jamsil": "Jamsil Baseball Stadium",
  "jamsil baseball stadium": "잠실야구장",
  "도쿄": "Tokyo",
  "tokyo station": "Tokyo Station",
  "tokyostation": "Tokyo Station",
  "도쿄 역": "Tokyo Station",
  "도쿄역": "Tokyo Station",
  "東京駅": "Tokyo Station",
  "시부야": "Shibuya",
  "신주쿠": "Shinjuku",
  "오사카": "Osaka",
  "신사이바시": "Shinsaibashi Station",
  "신사이바시역": "Shinsaibashi Station",
  "shinsaibashi": "Shinsaibashi Station",
  "shinsaibashi station": "Shinsaibashi Station",
  "心斎橋": "Shinsaibashi Station",
  "心斎橋駅": "Shinsaibashi Station",
  "난바": "Namba Station",
  "난바역": "Namba Station",
  "난카이난바": "Namba Station",
  "난카이난바역": "Namba Station",
  "namba": "Namba Station",
  "namba station": "Namba Station",
  "nankai namba": "Namba Station",
  "nankai namba station": "Namba Station",
  "難波": "Namba Station",
  "難波駅": "Namba Station",
  "なんば": "Namba Station",
  "なんば駅": "Namba Station",
  "교토": "Kyoto",
  "삿포로": "Sapporo",
  "후쿠오카": "Fukuoka",
  "잠실 야구장": "잠실야구장",
  "잠실야구장": "Jamsil Baseball Stadium",
  "잠실종합운동장": "잠실야구장",
  "jamsil stadium": "Jamsil Baseball Stadium",
  "방콕": "Bangkok",
  "파리": "Paris",
  "런던": "London",
  "뉴욕": "New York",
  "센트럴파크": "Central Park",
  "센트럴 파크": "Central Park",
};

export function getPlaceSearchQueryAlias(query: string): string {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, " ");
  return placeSearchQueryAliases[normalized] ?? query;
}
