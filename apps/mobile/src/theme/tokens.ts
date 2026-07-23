export type AppThemeName = "dark" | "light";

export type AppTheme = {
  name: AppThemeName;
  // 표시 설정의 "투명 효과 줄이기" 상태. 화면은 이 값을 직접 분기하지 않고,
  // 아래 토큰의 불투명 변형을 받아 동일한 색상 체계를 유지한다.
  reducedTransparency: boolean;
  // Android 12+에서 Material 보조 요소에만 시스템 동적 색상을 허용한다.
  dynamicColorEnabled: boolean;
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
    dynamicColorEnabled: false,
    background: "#071E33",
    backgroundAlt: "#0E4A75",
    nav: "rgba(7,30,51,0.97)",
    navBorder: "rgba(158,215,255,0.18)",
    card: "#103D5F",
    cardStrong: "#0B2E49",
    cardSoft: "#16557F",
    cardMuted: "rgba(126,204,255,0.12)",
    clear: "#5DE2C2",
    gold: "#FFC758",
    sky: "#58BFFF",
    skyLite: "#D8F3FF",
    warm: "#FF9A66",
    alert: "#FF7F78",
    text: "#F6FBFF",
    muted: "rgba(220,240,255,0.90)",
    subtle: "rgba(194,225,247,0.78)",
    border: "rgba(158,215,255,0.16)",
    shadow: "rgba(0,8,18,0.48)",
    onAccent: "#071E33",
  },
  light: {
    name: "light",
    reducedTransparency: false,
    dynamicColorEnabled: false,
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

export type SemanticColorRole =
  | "surfacePassive"
  | "surfaceSelected"
  | "accentTint"
  | "accentBorder"
  | "infoTint"
  | "successTint"
  | "outlineSoft"
  | "outlineStrong"
  | "imagePlaceholder"
  | "scrim"
  | "glassHighlight"
  | "glassBorder"
  | "glassBorderStrong";

export function colorWithAlpha(color: string, alpha: number): string {
  const rgb = parseHexColor(color);
  if (!rgb) return color;

  const normalizedAlpha = Number(alpha.toFixed(3));
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${normalizedAlpha})`;
}

export function semanticColor(theme: AppTheme, role: SemanticColorRole): string {
  if (role === "surfacePassive") {
    return theme.name === "light" ? theme.cardSoft : colorWithAlpha(theme.skyLite, 0.1);
  }
  if (role === "surfaceSelected") {
    return theme.name === "light" ? colorWithAlpha(theme.gold, 0.1) : colorWithAlpha(theme.text, 0.1);
  }
  if (role === "accentTint") return colorWithAlpha(theme.gold, theme.name === "light" ? 0.1 : 0.12);
  if (role === "accentBorder") return colorWithAlpha(theme.gold, theme.name === "light" ? 0.32 : 0.4);
  if (role === "infoTint") return colorWithAlpha(theme.sky, theme.name === "light" ? 0.1 : 0.14);
  if (role === "successTint") return colorWithAlpha(theme.clear, theme.name === "light" ? 0.1 : 0.16);
  if (role === "outlineSoft") return colorWithAlpha(theme.text, theme.name === "light" ? 0.12 : 0.12);
  if (role === "outlineStrong") return colorWithAlpha(theme.text, theme.name === "light" ? 0.24 : 0.18);
  if (role === "imagePlaceholder") return colorWithAlpha(theme.text, theme.name === "light" ? 0.06 : 0.08);
  if (role === "scrim") return theme.name === "light" ? colorWithAlpha(theme.text, 0.32) : colorWithAlpha(theme.background, 0.48);
  if (role === "glassHighlight") return colorWithAlpha(theme.name === "light" ? theme.card : theme.text, theme.name === "light" ? 0.64 : 0.18);
  if (role === "glassBorder") return colorWithAlpha(theme.name === "light" ? theme.card : theme.text, theme.name === "light" ? 0.6 : 0.26);
  return colorWithAlpha(theme.name === "light" ? theme.card : theme.text, theme.name === "light" ? 0.62 : 0.34);
}

export type ToneColor = "clear" | "gold" | "sky" | "warm";

export function getToneColor(theme: AppTheme, tone: ToneColor): string {
  if (tone === "gold") return theme.gold;
  if (tone === "sky") return theme.sky;
  if (tone === "warm") return theme.warm;
  return theme.clear;
}

function parseHexColor(color: string) {
  const normalized = color.trim().replace("#", "");
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(normalized)) return null;

  const fullHex = normalized.length === 3
    ? normalized.split("").map((char) => `${char}${char}`).join("")
    : normalized;

  return {
    r: Number.parseInt(fullHex.slice(0, 2), 16),
    g: Number.parseInt(fullHex.slice(2, 4), 16),
    b: Number.parseInt(fullHex.slice(4, 6), 16),
  };
}

export function resolveAppTheme(
  themeMode: "system" | "light" | "dark" | undefined,
  systemMode: "light" | "dark" | null | undefined,
  reducedTransparency = false,
  dynamicColorEnabled = false,
): AppTheme {
  const baseTheme = themeMode === "light"
    ? appThemes.light
    : themeMode === "dark"
      ? appThemes.dark
      : systemMode === "light"
        ? appThemes.light
        : appThemes.dark;

  const configuredTheme = dynamicColorEnabled
    ? { ...baseTheme, dynamicColorEnabled: true }
    : baseTheme;

  if (!reducedTransparency) return configuredTheme;

  // 반투명 패널·탭 바·보조 텍스트·구분선을 불투명 표면으로 바꾼다.
  // 개별 화면마다 조건을 두지 않아도 테마 토큰을 쓰는 모든 화면에 즉시 적용된다.
  return configuredTheme.name === "dark"
    ? {
        ...configuredTheme,
        reducedTransparency: true,
        nav: "#071E33",
        navBorder: "#315C79",
        cardMuted: "#164A6C",
        muted: "#DCF0FF",
        subtle: "#C2E1F7",
        border: "#315C79",
        shadow: "#020A12",
      }
    : {
        ...configuredTheme,
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
