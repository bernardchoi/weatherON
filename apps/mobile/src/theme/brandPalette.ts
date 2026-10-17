// Shared brand identity from Ambient B icon layers; weather hues stay independent.
export const brandPalettes = {
  light: {
    background: "#E9F6F8", backgroundAlt: "#D5EAEC", surface: "#DDEFF2", elevated: "#F4FAFB",
    text: "#183844", muted: "#49656F", border: "#B8D2D8", materialTint: "#B6D0DA",
    sun: "#FFC650", fold: "#4B9EAD", wordmarkOn: "#80591F",
    action: "#DA3622", actionLabel: "#AA2C1F", selected: "#FFE5DE",
  },
  dark: {
    background: "#102B38", backgroundAlt: "#21414C", surface: "#1A3945", elevated: "#244854",
    text: "#F4F8F8", muted: "#C4DCE3", border: "#3D606D", materialTint: "#B6D0DA",
    sun: "#FFCC59", fold: "#4097AA", wordmarkOn: "#D8BB7A",
    action: "#FFB52E", actionLabel: "#FFD17A", selected: "#433A27",
  },
} as const;
