export type P0RouteId = "H1" | "C1" | "C2" | "C3" | "C4" | "H3" | "H4" | "H5" | "G1" | "G2" | "P1" | "P2" | "P3" | "M1" | "M2" | "M3";
export type AccountRouteId = "A2" | "A3" | "A4";
export type PermissionRouteId = "O3";
export type OnboardingRouteId = "O2" | "O4" | "O5" | "O6";
export type PolicyRouteId = "R1" | "R2" | "R3" | "R4";
export type AppRouteId = P0RouteId | AccountRouteId | PermissionRouteId | OnboardingRouteId | PolicyRouteId;

export type P0Route = {
  id: P0RouteId;
  label: string;
  title: string;
};

export const p0Routes: P0Route[] = [
  { id: "H1", label: "홈", title: "오늘 준비" },
  { id: "C1", label: "코디", title: "오늘 코디" },
  { id: "C2", label: "옷장", title: "옷장" },
  { id: "C3", label: "프리셋", title: "옷장 상세" },
  { id: "C4", label: "상세", title: "코디 상세" },
  { id: "H3", label: "센터", title: "알림 센터" },
  { id: "H4", label: "우산", title: "우산 추천" },
  { id: "H5", label: "강수", title: "강수 타임라인" },
  { id: "G1", label: "목적지", title: "목적지 목록" },
  { id: "G2", label: "케어", title: "목적지 케어" },
  { id: "P1", label: "추가", title: "목적지 추가" },
  { id: "P2", label: "가이드", title: "준비 가이드" },
  { id: "P3", label: "허브", title: "목적지 허브" },
  { id: "M1", label: "MY", title: "MY" },
  { id: "M2", label: "알림", title: "알림 설정" },
  { id: "M3", label: "설정", title: "권한·정책" },
];

export const bottomNavRoutes: P0Route[] = [
  { id: "H1", label: "홈", title: "오늘 준비" },
  { id: "C1", label: "코디", title: "오늘 코디" },
  { id: "H4", label: "우산", title: "우산 추천" },
  { id: "H5", label: "강수", title: "강수 타임라인" },
  { id: "G1", label: "목적지", title: "목적지 목록" },
  { id: "M1", label: "MY", title: "MY" },
];

export function isP0Route(route: AppRouteId): route is P0RouteId {
  return p0Routes.some((item) => item.id === route);
}
