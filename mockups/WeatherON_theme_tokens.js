export const WEATHERON_THEMES = {
  dark: {
    mode: "dark",
    shellBg: "#163F63",
    stageBg: "#163F63",
    navBg: "#1D5A86",
    navButtonBg: "#276A96",
    navButtonText: "rgba(248,251,255,0.86)",
    navMuted: "rgba(228,242,255,0.82)",
    NAVY: "#1D5A86",
    NAVY_DARK: "#276A96",
    PANEL: "#2B719D",
    PANEL_L1: "#3D87B5",
    PANEL_L2: "#55A0CA",
    GOLD: "#F4B63F",
    onGold: "#123858",
    SKY: "#8CCFFF",
    SKY_LITE: "#DFF5FF",
    CLEAR: "#67E8D0",
    WARM: "#FFB37C",
    MIST: "#E4F2FF",
    logoNavy: "#0C1F3F",
    logoCloud: "#F4F7FC",
    inkRgb: "248,251,255",
    mistRgb: "228,242,255",
    gradient: "linear-gradient(175deg, #1D5A86 0%, #3D87B5 54%, #68B8EA 120%)",
    phoneShadow: "0 0 0 1.5px rgba(255,255,255,0.08), 0 30px 62px rgba(0,0,0,0.36), 0 8px 20px rgba(0,0,0,0.20)",
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
