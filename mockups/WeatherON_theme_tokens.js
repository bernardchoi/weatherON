export const WEATHERON_THEMES = {
  dark: {
    mode: "dark",
    shellBg: "#030810",
    stageBg: "#030810",
    navBg: "#0A1730",
    navButtonBg: "#17365D",
    navButtonText: "rgba(248,251,255,0.82)",
    navMuted: "rgba(185,203,224,0.78)",
    NAVY: "#10243F",
    NAVY_DARK: "#17365D",
    PANEL: "#214A78",
    PANEL_L1: "#2A5D8F",
    PANEL_L2: "#3470A6",
    GOLD: "#F4B63F",
    onGold: "#10243F",
    SKY: "#8CCFFF",
    CLEAR: "#67E8D0",
    WARM: "#FFB37C",
    MIST: "#D7E6F5",
    logoNavy: "#0C1F3F",
    logoCloud: "#F4F7FC",
    inkRgb: "248,251,255",
    mistRgb: "215,230,245",
    gradient: "linear-gradient(175deg, #10243F 0%, #1F4E79 54%, #4AA3DF 120%)",
    phoneShadow: "0 0 0 1.5px rgba(255,255,255,0.08), 0 40px 80px rgba(0,0,0,0.62), 0 8px 24px rgba(0,0,0,0.38)",
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
