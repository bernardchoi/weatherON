export type DestinationVisualInput = {
  id: string;
  name: string;
  address: string;
  category: string;
  countryCode: string;
};

export function getDestinationVisualKind(place: DestinationVisualInput) {
  const name = place.name.toLowerCase();
  const text = `${place.name} ${place.address} ${place.category}`.toLowerCase();
  if (place.category === "airport" || hasAnyKeyword(text, ["공항", "airport", "空港"])) return "airport";
  if (hasAnyKeyword(name, ["버스터미널", "버스 터미널", "bus terminal", "bus station", "バスターミナル"])) return "bus";
  if (hasAnyKeyword(name, ["여객터미널", "여객선터미널", "페리", "ferry", "harbor", "harbour", "港", "フェリー"])) return "ferry";
  if (hasAnyKeyword(name, ["지하철", "subway", "metro", "地下鉄"])) return "metro";
  if (isRailStationName(name)) return "rail";
  if (hasAnyKeyword(text, ["교회", "성당", "church", "cathedral", "chapel", "basilica", "教会", "カトリック"])) return "church";
  if (hasAnyKeyword(text, ["사찰", "사원", "절", "temple", "shrine", "神社", "寺院"]) || hasStandaloneKoreanShrineKeyword(text)) return "temple";
  if (hasAnyKeyword(name, ["야구장", "야구", "baseball", "ballpark", "ball park", "lions park", "라이온즈파크", "라이온즈 파크"])) return "baseball";
  if (hasAnyKeyword(text, ["축구", "월드컵경기장", "football", "soccer"])) return "football";
  if (hasAnyKeyword(name, ["체육관", "실내경기장", "농구장", "배구장", "arena", "gymnasium", "basketball", "volleyball", "アリーナ", "体育館"])) return "arena";
  if (hasAnyKeyword(name, ["놀이공원", "테마파크", "유원지", "theme park", "amusement park", "遊園地", "テーマパーク"])) return "amusement";
  if (hasAnyKeyword(name, ["컨벤션", "전시장", "박람회장", "convention", "exhibition", "expo center", "展示場", "コンベンション"])) return "convention";
  if (hasAnyKeyword(name, ["쇼핑몰", "백화점", "아울렛", "shopping mall", "shopping center", "department store", "outlet", "デパート", "ショッピングモール"])) return "shopping";
  if (place.category === "hotel" || hasAnyKeyword(name, ["호텔", "리조트", "숙소", "hotel", "resort", "lodging", "旅館"])) return "hotel";
  if (hasAnyKeyword(name, ["캠핑", "야영장", "campground", "campsite", "camping", "キャンプ"])) return "camping";
  if (hasAnyKeyword(name, ["스키장", "ski resort", "skiing", "スキー場"])) return "ski";
  if (hasAnyKeyword(name, ["공원", "park", "公園"])) return "park";
  if (hasAnyKeyword(name, ["회사", "오피스", "업무단지", "본사", "office", "workplace", "business center", "headquarters", "オフィス"])) return "office";
  if (hasAnyKeyword(text, ["병원", "의료원", "hospital", "medical center", "clinic", "病院", "医院"])) return "hospital";
  if (hasAnyKeyword(text, ["박물관", "미술관", "문화센터", "museum", "gallery", "art center", "博物館", "美術館"])) return "museum";
  if (place.category === "mountain" || hasAnyKeyword(text, ["등산", "오름", "국립공원", "mountain", "hiking", "trail", "登山"])) return "mountain";
  if (place.category === "school" || hasAnyKeyword(text, ["학교", "대학교", "대학", "school", "university", "college", "学校", "大学"])) return "school";
  if (place.category === "sports") return "arena";
  return place.category;
}

export function getKnownDestinationAssetId(place: DestinationVisualInput) {
  const compact = `${place.id} ${place.name} ${place.address}`.toLowerCase().replace(/\s+/g, "");
  if (compact.includes("shinsaibashi") || compact.includes("신사이바시") || compact.includes("心斎橋")) return "jp-shinsaibashi-station";
  if (compact.includes("tokyostation") || compact.includes("도쿄역") || compact.includes("東京駅")) return "jp-tokyo-station";
  if (compact.includes("nambastation") || compact.includes("nankainamba") || compact.includes("난바역") || compact.includes("難波駅") || compact.includes("なんば駅")) return "jp-namba-station";
  return null;
}

export function getDestinationVisualRegion(countryCode: string) {
  if (countryCode === "KR" || countryCode === "JP") return countryCode;
  if (EUROPEAN_DESTINATION_COUNTRY_CODES.has(countryCode)) return "EU";
  return "GLOBAL";
}

function hasAnyKeyword(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function hasStandaloneKoreanShrineKeyword(text: string) {
  return /(^|[\s·,()])신사($|[\s·,()])/u.test(text);
}

function isRailStationName(name: string) {
  const trimmed = name.trim();
  return trimmed.endsWith("역") || trimmed.endsWith("駅") || /\bstation\b/u.test(trimmed) || /\brailway\b/u.test(trimmed);
}

const EUROPEAN_DESTINATION_COUNTRY_CODES = new Set([
  "AT", "BE", "CH", "CZ", "DE", "DK", "ES", "FI", "FR", "GB", "GR", "HU", "IE", "IT", "NL", "NO", "PL", "PT", "RO", "SE",
]);
