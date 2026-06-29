export type P0RouteId =
  | "H1"
  | "H2"
  | "C1"
  | "C2"
  | "C3"
  | "C4"
  | "H3"
  | "H4"
  | "H5"
  | "W1"
  | "W2"
  | "W3"
  | "W4"
  | "G1"
  | "G2"
  | "G3"
  | "G4"
  | "G5"
  | "G6"
  | "P1"
  | "P2"
  | "P3"
  | "M1"
  | "M2"
  | "M3"
  | "S0"
  | "S1"
  | "S2"
  | "S3";
export type AccountRouteId = "A1" | "A2" | "A3" | "A4";
export type PermissionRouteId = "O3";
export type OnboardingRouteId = "O1" | "O2" | "O4" | "O5" | "O6";
export type PolicyRouteId = "R1" | "R2" | "R3" | "R4";
export type AppRouteId = P0RouteId | AccountRouteId | PermissionRouteId | OnboardingRouteId | PolicyRouteId;

export type P0Route = {
  id: P0RouteId;
  label: string;
  title: string;
};

export const p0Routes: P0Route[] = [
  { id: "H1", label: "홈", title: "오늘 준비" },
  { id: "H2", label: "위치", title: "위치 변경" },
  { id: "C1", label: "코디", title: "오늘 코디" },
  { id: "C2", label: "옷장", title: "옷장" },
  { id: "C3", label: "프리셋", title: "옷장 상세" },
  { id: "C4", label: "상세", title: "코디 상세" },
  { id: "H3", label: "센터", title: "알림 센터" },
  { id: "H4", label: "우산", title: "우산 추천" },
  { id: "H5", label: "강수", title: "강수 타임라인" },
  { id: "W1", label: "제보 홈", title: "날씨 제보 홈" },
  { id: "W2", label: "제보", title: "날씨 제보" },
  { id: "W3", label: "완료", title: "제보 완료" },
  { id: "W4", label: "이력", title: "내 제보 이력" },
  { id: "G1", label: "목적지", title: "목적지 목록" },
  { id: "G2", label: "케어", title: "목적지 케어" },
  { id: "G3", label: "여행", title: "여행 플래너" },
  { id: "G4", label: "도보", title: "도보여행" },
  { id: "G5", label: "AI", title: "AI 종주 플래너" },
  { id: "G6", label: "프리미엄", title: "프리미엄" },
  { id: "P1", label: "추가", title: "목적지 추가" },
  { id: "P2", label: "가이드", title: "준비 가이드" },
  { id: "P3", label: "허브", title: "목적지 허브" },
  { id: "M1", label: "MY", title: "MY" },
  { id: "M2", label: "알림", title: "알림 설정" },
  { id: "M3", label: "설정", title: "권한·정책" },
  { id: "S0", label: "입장", title: "ON Square 입장" },
  { id: "S1", label: "소셜", title: "ON Square" },
  { id: "S2", label: "노트", title: "날씨 노트" },
  { id: "S3", label: "리액션", title: "날씨 리액션" },
];

export const bottomNavRoutes: P0Route[] = [
  { id: "H1", label: "홈", title: "오늘 준비" },
  { id: "C1", label: "코디", title: "오늘 코디" },
  { id: "G1", label: "출발", title: "목적지 목록" },
  { id: "M1", label: "MY", title: "MY" },
  { id: "S1", label: "소셜", title: "ON Square" },
];

export function isP0Route(route: AppRouteId): route is P0RouteId {
  return p0Routes.some((item) => item.id === route);
}
