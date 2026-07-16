export const WEATHERON_THEMES = {
  dark: {
    mode: "dark",
    shellBg: "#030B18",
    stageBg: "#071E33",
    navBg: "#071E33",
    navButtonBg: "#0B2E49",
    navButtonText: "rgba(246,251,255,0.88)",
    navMuted: "rgba(194,225,247,0.78)",
    NAVY: "#071E33",
    NAVY_DARK: "#0B2E49",
    PANEL: "#103D5F",
    PANEL_L1: "#16557F",
    PANEL_L2: "#2373A4",
    GOLD: "#FFC758",
    onGold: "#071E33",
    SKY: "#58BFFF",
    SKY_LITE: "#D8F3FF",
    CLEAR: "#5DE2C2",
    WARM: "#FF9A66",
    MIST: "#DCF0FF",
    logoNavy: "#0C1F3F",
    logoCloud: "#F4F7FC",
    inkRgb: "246,251,255",
    mistRgb: "220,240,255",
    gradient: "linear-gradient(175deg, #071E33 0%, #0D3D62 58%, #176B9E 120%)",
    phoneShadow: "0 0 0 1.5px rgba(158,215,255,0.12), 0 30px 62px rgba(0,0,0,0.48), 0 8px 20px rgba(0,0,0,0.28)",
  },
  light: {
    mode: "light",
    shellBg: "#E7F1F8",
    stageBg: "#E7F1F8",
    navBg: "#FFFFFF",
    navButtonBg: "#EAF3FA",
    navButtonText: "rgba(20,32,51,0.82)",
    navMuted: "rgba(82,103,127,0.78)",
    NAVY: "#F5F9FC",
    NAVY_DARK: "#FFFFFF",
    PANEL: "#FFFFFF",
    PANEL_L1: "#EAF3FA",
    PANEL_L2: "#D7EAF7",
    GOLD: "#C2410C",
    onGold: "#FFFFFF",
    SKY: "#185E96",
    CLEAR: "#006B61",
    WARM: "#9C341F",
    MIST: "#40536A",
    logoNavy: "#1F4E79",
    logoCloud: "#F8FBFF",
    inkRgb: "20,32,51",
    mistRgb: "64,83,106",
    gradient: "linear-gradient(175deg, #F5F9FC 0%, #EAF3FA 58%, #D7EAF7 100%)",
    phoneShadow: "0 0 0 1.5px rgba(31,78,121,0.14), 0 30px 70px rgba(31,78,121,0.22), 0 8px 24px rgba(31,78,121,0.14)",
  },
};

export function getWeatherONTheme(mode = "dark") {
  return WEATHERON_THEMES[mode] || WEATHERON_THEMES.dark;
}

export function ink(theme, alpha) {
  const resolvedAlpha = theme.mode === "light" && alpha === 0.66 ? 0.76 : alpha;
  return `rgba(${theme.inkRgb},${resolvedAlpha})`;
}

export function mist(theme, alpha) {
  const floor = theme.mode === "light" ? 0.72 : 0.82;
  return `rgba(${theme.mistRgb},${Math.max(alpha, floor)})`;
}
