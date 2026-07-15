export type AppThemeName = "dark" | "light";

export type AppTheme = {
  name: AppThemeName;
  // 표시 설정의 "투명 효과 줄이기" 상태. 화면은 이 값을 직접 분기하지 않고,
  // 아래 토큰의 불투명 변형을 받아 동일한 색상 체계를 유지한다.
  reducedTransparency: boolean;
  background: string;
  backgroundAlt: string;
  nav: string;
  navBorder: string;
  card: string;
  cardStrong: string;
  cardSoft: string;
  cardMuted: string;
  clear: string;
  gold: string;
  sky: string;
  skyLite: string;
  warm: string;
  alert: string;
  text: string;
  muted: string;
  subtle: string;
  border: string;
  shadow: string;
  onAccent: string;
};

export const appThemes: Record<AppThemeName, AppTheme> = {
  dark: {
    name: "dark",
    reducedTransparency: false,
    background: "#1D5A86",
    backgroundAlt: "#3D87B5",
    nav: "rgba(29,90,134,0.95)",
    navBorder: "rgba(248,251,255,0.10)",
    card: "#2B719D",
    cardStrong: "#276A96",
    cardSoft: "#3D87B5",
    cardMuted: "rgba(248,251,255,0.14)",
    clear: "#2FC6A3",
    gold: "#F4B63F",
    sky: "#4AA3DF",
    skyLite: "#DFF5FF",
    warm: "#E8854A",
    alert: "#E97F77",
    text: "#F8FBFF",
    muted: "rgba(228,242,255,0.90)",
    subtle: "rgba(228,242,255,0.86)",
    border: "rgba(255,255,255,0.12)",
    shadow: "rgba(0,0,0,0.22)",
    onAccent: "#123858",
  },
  light: {
    name: "light",
    reducedTransparency: false,
    background: "#F5F9FC",
    backgroundAlt: "#D7EAF7",
    nav: "rgba(255,255,255,0.94)",
    navBorder: "rgba(31,78,121,0.12)",
    card: "#FFFFFF",
    cardStrong: "#FFFFFF",
    cardSoft: "#EAF3FA",
    cardMuted: "rgba(31,78,121,0.08)",
    clear: "#007F73",
    gold: "#C2410C",
    // 2026-07-07 대비 실측: #237BBD 텍스트는 sky-soft 칩 배경(자기 색 9~13% 틴트) 위에서 3.8~4.0:1로 WCAG AA 4.5:1 미달.
    // #1D6DA8로 조정해 흰 배경/카드/자기 틴트 배경 전 구간에서 4.5:1 이상 확보.
    sky: "#1D6DA8",
    skyLite: "#1D6DA8",
    warm: "#C84A2F",
    alert: "#B42318",
    text: "#142033",
    muted: "rgba(20,32,51,0.80)",
    subtle: "rgba(20,32,51,0.66)",
    border: "rgba(31,78,121,0.12)",
    shadow: "rgba(31,78,121,0.16)",
    onAccent: "#FFFFFF",
  },
};

export const appColors = {
  navy: appThemes.dark.background,
  navyDeep: appThemes.dark.cardStrong,
  panel: appThemes.dark.card,
  panelSoft: appThemes.dark.cardSoft,
  clear: appThemes.dark.clear,
  gold: appThemes.dark.gold,
  sky: appThemes.dark.sky,
  skyLite: appThemes.dark.skyLite,
  warm: appThemes.dark.warm,
  text: appThemes.dark.text,
  muted: appThemes.dark.muted,
  subtle: appThemes.dark.subtle,
  border: appThemes.dark.border,
};

export function resolveAppTheme(
  themeMode: "system" | "light" | "dark" | undefined,
  systemMode: "light" | "dark" | null | undefined,
  reducedTransparency = false,
): AppTheme {
  const baseTheme = themeMode === "light"
    ? appThemes.light
    : themeMode === "dark"
      ? appThemes.dark
      : systemMode === "light"
        ? appThemes.light
        : appThemes.dark;

  if (!reducedTransparency) return baseTheme;

  // 반투명 패널·탭 바·보조 텍스트·구분선을 불투명 표면으로 바꾼다.
  // 개별 화면마다 조건을 두지 않아도 테마 토큰을 쓰는 모든 화면에 즉시 적용된다.
  return baseTheme.name === "dark"
    ? {
        ...baseTheme,
        reducedTransparency: true,
        nav: "#1D5A86",
        navBorder: "#5F9CC3",
        cardMuted: "#3D7EA9",
        muted: "#E4F2FF",
        subtle: "#D2E8F8",
        border: "#5F9CC3",
        shadow: "#123858",
      }
    : {
        ...baseTheme,
        reducedTransparency: true,
        nav: "#FFFFFF",
        navBorder: "#C7D8E6",
        cardMuted: "#E4EDF4",
        muted: "#344256",
        subtle: "#526174",
        border: "#C7D8E6",
        shadow: "#276A96",
      };
}

// UI Design Spec v1.0 §8: card 20 / cardSm 16 / sheet 28 / tab 24 / pill 16|999
export const radius = {
  xs: 4,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 20,
  sheet: 28,
  tab: 24,
  pill: 999,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
};

// 목업 BrandCard 기준(WeatherON_design_system.jsx): boxShadow 0 6px 16px rgba(0,0,0,0.30) — 라이트/다크 공통 고정값.
// RN은 shadow*가 iOS/web에서만 렌더링되고 Android는 elevation이 있어야 카드 뒷면 음영이 실제로 보인다.
// shadowColor에 theme.shadow(자체 알파 내장)를 쓰면 shadowOpacity와 알파가 곱해져 지나치게 옅어지므로 순수 블랙 기준으로 직접 지정한다.
// 사용 규칙: 화면 배경 위 최상위 "불투명" 카드에만 적용한다. 카드 안에 중첩된 표면이나
// cardMuted 같은 반투명 배경에 쓰면 Android elevation이 부모 표면 위로 두꺼운 그림자 아티팩트를 만든다.
export function cardShadow(theme: AppTheme) {
  return {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: theme.name === "dark" ? 0.28 : 0.18,
    shadowRadius: 12,
    elevation: 4,
  };
}
