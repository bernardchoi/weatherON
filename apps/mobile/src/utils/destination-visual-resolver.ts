import type { PlaceSearchResult } from "@weatheron/shared";

export type DestinationVisualInput = {
  id: string;
  name: string;
  address: string;
  category: string;
  countryCode: string;
};

// 키워드 상수: 카테고리 정규화와 비주얼 매핑이 같은 목록을 공유해 드리프트를 방지한다.
const RESIDENTIAL_KEYWORDS = ["아파트", "주택", "빌라", "오피스텔", "주거단지", "residence", "residential", "apartment", "condominium"];
const HOTEL_KEYWORDS = ["호텔", "리조트", "숙소", "hotel", "resort", "lodging", "旅館"];
// 주거지 오분류 방지 가드 전용: "Residence Inn"·"신라스테이 레지던스"류 숙박 브랜드 표현 포함.
// 분류용 HOTEL_KEYWORDS에 넣기엔 오탐 위험이 커서(예: "inn"⊂"dinner") 가드에서만 사용한다.
const HOTEL_GUARD_KEYWORDS = [...HOTEL_KEYWORDS, "레지던스", "스테이", "게스트하우스", " inn", "inn ", "stay", "guesthouse", "guest house", "hostel"];
const BUS_KEYWORDS = ["버스터미널", "버스 터미널", "bus terminal", "bus station", "バスターミナル"];
const FERRY_KEYWORDS = ["여객터미널", "여객선터미널", "페리", "ferry", "harbor", "harbour", "港", "フェリー"];
const METRO_KEYWORDS = ["지하철", "subway", "metro", "地下鉄"];
const CHURCH_KEYWORDS = ["교회", "성당", "church", "cathedral", "chapel", "basilica", "教会", "カトリック"];
const TEMPLE_TEXT_KEYWORDS = ["사찰", "사원", "temple", "shrine", "神社", "寺院"];
// "절"은 단독 사용 시 오탐이 잦아(예: "절벽") 비주얼 판정에서만 유지한다.
const TEMPLE_VISUAL_KEYWORDS = ["사찰", "사원", "절", "temple", "shrine", "神社", "寺院"];
const MEDICAL_KEYWORDS = ["병원", "의료원", "한의원", "치과", "보건소", "요양", "hospital", "medical center", "clinic", "クリニック", "診療所", "病院", "医院"];
const MUSEUM_KEYWORDS = ["박물관", "미술관", "문화센터", "museum", "gallery", "art center", "博物館", "美術館"];
const CONVENTION_KEYWORDS = ["컨벤션", "전시장", "박람회장", "convention", "exhibition", "expo center", "展示場", "コンベンション"];
const SHOPPING_KEYWORDS = ["쇼핑몰", "백화점", "아울렛", "스타필드", "롯데몰", "현대프리미엄아울렛", "이마트", "shopping mall", "shopping center", "department store", "outlet", "デパート", "ショッピングモール"];
const DINING_KEYWORDS = ["식당", "음식점", "카페", "레스토랑", "맛집", "restaurant", "cafe", "coffee", "dining", "レストラン", "カフェ", "飲食店"];
const PARK_KEYWORDS = ["공원", "park", "公園"];
const AMUSEMENT_KEYWORDS = ["놀이공원", "테마파크", "유원지", "theme park", "amusement park", "遊園地", "テーマパーク"];
const CAMPING_KEYWORDS = ["캠핑", "야영장", "campground", "campsite", "camping", "キャンプ"];
const SKI_KEYWORDS = ["스키장", "ski resort", "skiing", "スキー場"];
const TRANSIT_KEYWORDS = [...BUS_KEYWORDS, ...FERRY_KEYWORDS, ...METRO_KEYWORDS];
const RELIGIOUS_KEYWORDS = [...CHURCH_KEYWORDS, ...TEMPLE_TEXT_KEYWORDS];
const CULTURE_KEYWORDS = [...MUSEUM_KEYWORDS, ...CONVENTION_KEYWORDS];
const LEISURE_KEYWORDS = [...PARK_KEYWORDS, ...AMUSEMENT_KEYWORDS, ...CAMPING_KEYWORDS, ...SKI_KEYWORDS];

export function getNormalizedDestinationCategory(place: DestinationVisualInput) {
  const name = place.name.toLowerCase();
  const text = `${place.name} ${place.address}`.toLowerCase();
  // 아파트 상가 안 의료시설도 의료 목적지로 우선 처리한다.
  if (isMedicalDestination(text)) return "medical";
  // 이름 자체가 주거지인 경우 최우선. 단 "Residence Inn"류 호텔 브랜드는 제외한다.
  if (isResidentialName(name)) return "residential";
  if (hasAnyKeyword(name, TRANSIT_KEYWORDS) || isRailStationName(name)) return "transit";
  if (hasAnyKeyword(text, RELIGIOUS_KEYWORDS) || hasStandaloneKoreanShrineKeyword(text)) return "religious";
  if (hasAnyKeyword(text, CULTURE_KEYWORDS)) return "culture";
  if (hasAnyKeyword(name, SHOPPING_KEYWORDS)) return "shopping";
  if (hasAnyKeyword(name, DINING_KEYWORDS)) return "dining";
  if (hasAnyKeyword(name, LEISURE_KEYWORDS)) return "leisure";
  // 검색 공급자가 넓은 지형 분류를 반환해도 공동주택·주거단지는 주거지로 처리한다.
  // 주소 기반 판정은 다른 명시적 카테고리가 없을 때만 적용(빌라 건물 내 카페 오분류 방지).
  if (isResidentialText(name, text)) return "residential";
  return place.category;
}

export function getDestinationVisualKind(place: DestinationVisualInput) {
  const name = place.name.toLowerCase();
  const text = `${place.name} ${place.address} ${place.category}`.toLowerCase();
  const category = getNormalizedDestinationCategory(place);
  if (isMedicalDestination(text)) return "hospital";
  if (isResidentialName(name)) return "residential";
  if (category === "airport" || hasAnyKeyword(text, ["공항", "airport", "空港"])) return "airport";
  if (hasAnyKeyword(name, BUS_KEYWORDS)) return "bus";
  if (hasAnyKeyword(name, FERRY_KEYWORDS)) return "ferry";
  if (hasAnyKeyword(name, METRO_KEYWORDS)) return "metro";
  if (isRailStationName(name)) return "rail";
  if (hasAnyKeyword(text, CHURCH_KEYWORDS)) return "church";
  if (hasAnyKeyword(text, TEMPLE_VISUAL_KEYWORDS) || hasStandaloneKoreanShrineKeyword(text)) return "temple";
  if (hasAnyKeyword(name, ["야구장", "야구", "baseball", "ballpark", "ball park", "lions park", "라이온즈파크", "라이온즈 파크"])) return "baseball";
  if (hasAnyKeyword(text, ["축구", "월드컵경기장", "football", "soccer"])) return "football";
  if (hasAnyKeyword(name, ["체육관", "실내경기장", "농구장", "배구장", "arena", "gymnasium", "basketball", "volleyball", "アリーナ", "体育館"])) return "arena";
  if (hasAnyKeyword(name, AMUSEMENT_KEYWORDS)) return "amusement";
  if (hasAnyKeyword(name, CONVENTION_KEYWORDS)) return "convention";
  if (hasAnyKeyword(name, SHOPPING_KEYWORDS)) return "shopping";
  if (category === "dining" || hasAnyKeyword(name, DINING_KEYWORDS)) return "dining";
  if (category === "hotel" || hasAnyKeyword(name, HOTEL_KEYWORDS)) return "hotel";
  if (hasAnyKeyword(name, CAMPING_KEYWORDS)) return "camping";
  if (hasAnyKeyword(name, SKI_KEYWORDS)) return "ski";
  if (hasAnyKeyword(name, PARK_KEYWORDS)) return "park";
  if (hasAnyKeyword(name, ["회사", "오피스", "업무단지", "본사", "office", "workplace", "business center", "headquarters", "オフィス"])) return "office";
  if (hasAnyKeyword(text, MUSEUM_KEYWORDS)) return "museum";
  if (category === "mountain" || hasAnyKeyword(text, ["등산", "오름", "국립공원", "mountain", "hiking", "trail", "登山"])) return "mountain";
  if (category === "school" || hasAnyKeyword(text, ["학교", "대학교", "대학", "school", "university", "college", "学校", "大学"])) return "school";
  if (category === "sports") return "arena";
  if (isResidentialText(name, text)) return "residential";
  return category;
}

/**
 * 검색 결과의 category를 키워드 기반 정규화 결과로 교체한다.
 * getNormalizedDestinationCategory가 반환하는 리터럴은 모두 DestinationCare["category"]
 * union에 포함되며, 매칭 실패 시 원본 category를 그대로 반환하므로 캐스트가 안전하다.
 */
export function normalizePlaceSearchResultCategory(place: PlaceSearchResult): PlaceSearchResult {
  const category = getNormalizedDestinationCategory(place) as PlaceSearchResult["category"];
  return category === place.category ? place : { ...place, category };
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

function isResidentialName(name: string) {
  return hasAnyKeyword(name, RESIDENTIAL_KEYWORDS) && !hasAnyKeyword(name, HOTEL_GUARD_KEYWORDS);
}

function isMedicalDestination(text: string) {
  return hasAnyKeyword(text, MEDICAL_KEYWORDS) || /의원(?=$|[\s·,()\-])/u.test(text);
}

function isResidentialText(name: string, text: string) {
  return hasAnyKeyword(text, RESIDENTIAL_KEYWORDS) && !hasAnyKeyword(name, HOTEL_GUARD_KEYWORDS);
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
