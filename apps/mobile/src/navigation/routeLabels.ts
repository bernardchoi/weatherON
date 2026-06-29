import { p0Routes, type AppRouteId } from "./routes";

const extraRouteLabels: Record<Exclude<AppRouteId, (typeof p0Routes)[number]["id"]>, string> = {
  A1: "스플래시",
  A2: "계정 연결",
  A3: "약관 동의",
  A4: "계정 관리",
  O1: "온보딩 시작",
  O2: "온보딩",
  O3: "권한 설정",
  O4: "스타일 기준",
  O5: "스마트 케어",
  O6: "목적지 설정",
  R1: "정책 허브",
  R2: "정책 문서",
  R3: "광고 동의",
  R4: "광고 배치",
};

export function getRouteLabel(route: AppRouteId | null | undefined) {
  if (!route) return "홈";
  return p0Routes.find((item) => item.id === route)?.title ?? extraRouteLabels[route as keyof typeof extraRouteLabels] ?? "홈";
}
