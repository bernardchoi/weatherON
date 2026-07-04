export type AppThemeName = "dark" | "light";

export type AppTheme = {
  name: AppThemeName;
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
    background: "#10243F",
    backgroundAlt: "#1F4E79",
    nav: "rgba(10,23,48,0.96)",
    navBorder: "rgba(248,251,255,0.10)",
    card: "#214A78",
    cardStrong: "#17365D",
    cardSoft: "#2A5D8F",
    cardMuted: "rgba(248,251,255,0.10)",
    clear: "#2FC6A3",
    gold: "#F4B63F",
    sky: "#4AA3DF",
    warm: "#E8854A",
    alert: "#E97F77",
    text: "#F8FBFF",
    muted: "rgba(215,230,245,0.82)",
    subtle: "rgba(215,230,245,0.64)",
    border: "rgba(255,255,255,0.12)",
    shadow: "rgba(0,0,0,0.34)",
    onAccent: "#10243F",
  },
  light: {
    name: "light",
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
    sky: "#237BBD",
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
  warm: appThemes.dark.warm,
  text: appThemes.dark.text,
  muted: appThemes.dark.muted,
  subtle: appThemes.dark.subtle,
  border: appThemes.dark.border,
};

export function resolveAppTheme(themeMode: "system" | "light" | "dark" | undefined, systemMode: "light" | "dark" | null | undefined): AppTheme {
  if (themeMode === "light") return appThemes.light;
  if (themeMode === "dark") return appThemes.dark;
  return systemMode === "light" ? appThemes.light : appThemes.dark;
}

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 8,
  xl: 8,
  pill: 999,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
};
