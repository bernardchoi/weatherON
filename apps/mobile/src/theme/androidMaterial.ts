import { Platform, PlatformColor, type ColorValue, type ViewStyle } from "react-native";
import type { AppTheme } from "./tokens";

export type AndroidMaterialColorRole =
  | "primary"
  | "onPrimary"
  | "secondaryContainer"
  | "onSecondaryContainer"
  | "surfaceContainerLow"
  | "surfaceContainer"
  | "surfaceContainerHigh"
  | "outlineVariant"
  | "inverseSurface"
  | "inverseOnSurface"
  | "inversePrimary"
  | "scrim";

type AndroidMaterialRole =
  | "navigation"
  | "iconButton"
  | "sheet"
  | "weather"
  | "cta"
  | "surfaceContainerLow"
  | "surfaceContainer"
  | "surfaceContainerHigh"
  | "secondaryContainer";

export function isAndroidDynamicColorAvailable() {
  return Platform.OS === "android" && Number(Platform.Version) >= 31;
}

export function androidMaterialColor(theme: AppTheme, role: AndroidMaterialColorRole): ColorValue {
  if (Platform.OS !== "android") return getLegacyColor(theme, role);

  if (isAndroidDynamicColorAvailable() && theme.dynamicColorEnabled && isDynamicAccentRole(role)) {
    return getDynamicColor(theme, role);
  }

  return getFallbackColor(theme, role);
}

function isDynamicAccentRole(role: AndroidMaterialColorRole) {
  return role === "primary"
    || role === "onPrimary"
    || role === "secondaryContainer"
    || role === "onSecondaryContainer"
    || role === "inversePrimary";
}

function getLegacyColor(theme: AppTheme, role: AndroidMaterialColorRole): string {
  if (role === "primary" || role === "secondaryContainer") return theme.gold;
  if (role === "onPrimary" || role === "onSecondaryContainer") return theme.onAccent;
  if (role === "surfaceContainerLow") return theme.card;
  if (role === "surfaceContainer") return theme.cardStrong;
  if (role === "surfaceContainerHigh") return theme.cardSoft;
  if (role === "outlineVariant") return theme.border;
  if (role === "inverseSurface") return theme.name === "light" ? "#26323C" : "#EAF2F8";
  if (role === "inverseOnSurface") return theme.name === "light" ? "#F5FAFF" : "#142033";
  if (role === "inversePrimary") return theme.gold;
  return "rgba(6,12,24,0.56)";
}

export function androidMaterialSurface(theme: AppTheme, role: AndroidMaterialRole): ViewStyle | null {
  if (Platform.OS !== "android") return null;

  return {
    backgroundColor: getSurfaceColor(theme, role),
    borderColor: role === "iconButton" ? "transparent" : androidMaterialColor(theme, "outlineVariant"),
    elevation: getElevation(role),
    ...(role === "iconButton" ? { borderRadius: 999, overflow: "hidden" as const } : null),
  };
}

export function androidMaterialActiveIndicator(theme: AppTheme, active: boolean): ViewStyle | null {
  if (Platform.OS !== "android" || !active) return null;

  return {
    backgroundColor: theme.dynamicColorEnabled
      ? androidMaterialColor(theme, "secondaryContainer")
      : theme.name === "light" ? `${theme.gold}2E` : `${theme.gold}38`,
  };
}

export function androidMaterialRipple(theme: AppTheme, tone: "primary" | "surface" = "surface") {
  if (Platform.OS !== "android") return undefined;

  const color = tone === "primary" ? theme.onAccent : theme.text;
  return {
    color: `${color}1F`,
    borderless: false,
  };
}

function getSurfaceColor(theme: AppTheme, role: AndroidMaterialRole): ColorValue {
  if (role === "cta" || role === "secondaryContainer") return androidMaterialColor(theme, "secondaryContainer");
  if (role === "iconButton" || role === "surfaceContainerHigh" || role === "sheet") {
    return androidMaterialColor(theme, "surfaceContainerHigh");
  }
  if (role === "surfaceContainerLow") return androidMaterialColor(theme, "surfaceContainerLow");
  if (role === "surfaceContainer" || role === "navigation" || role === "weather") {
    return androidMaterialColor(theme, "surfaceContainer");
  }
  return androidMaterialColor(theme, "surfaceContainerLow");
}

function getElevation(role: AndroidMaterialRole): number {
  if (role === "iconButton" || role === "cta") return 0;
  if (role === "sheet") return 8;
  if (role === "navigation") return 3;
  if (role === "weather") return 3;
  if (role === "surfaceContainerHigh") return 2;
  if (role === "surfaceContainer") return 1;
  return 0;
}

function getDynamicColor(theme: AppTheme, role: AndroidMaterialColorRole): ColorValue {
  const light = theme.name === "light";
  const resource = {
    primary: light ? "@android:color/system_accent1_600" : "@android:color/system_accent1_200",
    onPrimary: light ? "@android:color/system_accent1_0" : "@android:color/system_accent1_800",
    secondaryContainer: light ? "@android:color/system_accent2_100" : "@android:color/system_accent2_700",
    onSecondaryContainer: light ? "@android:color/system_accent2_900" : "@android:color/system_accent2_100",
    surfaceContainerLow: light ? "@android:color/system_neutral1_10" : "@android:color/system_neutral1_900",
    surfaceContainer: light ? "@android:color/system_neutral1_50" : "@android:color/system_neutral1_800",
    surfaceContainerHigh: light ? "@android:color/system_neutral1_100" : "@android:color/system_neutral1_700",
    outlineVariant: light ? "@android:color/system_neutral2_200" : "@android:color/system_neutral2_600",
    inverseSurface: light ? "@android:color/system_neutral1_800" : "@android:color/system_neutral1_100",
    inverseOnSurface: light ? "@android:color/system_neutral1_50" : "@android:color/system_neutral1_900",
    inversePrimary: light ? "@android:color/system_accent1_200" : "@android:color/system_accent1_700",
    scrim: "@android:color/black",
  } satisfies Record<AndroidMaterialColorRole, string>;

  return PlatformColor(resource[role]);
}

function getFallbackColor(theme: AppTheme, role: AndroidMaterialColorRole): string {
  const light = theme.name === "light";
  if (role === "primary") return theme.gold;
  if (role === "onPrimary") return theme.onAccent;
  if (role === "secondaryContainer") return light ? "#F9E6D8" : "#4B3B2A";
  if (role === "onSecondaryContainer") return light ? "#5A210C" : "#FFE1C4";
  if (role === "surfaceContainerLow") return light ? "#F7FAFD" : "#0B2E49";
  if (role === "surfaceContainer") return light ? "#EEF4F8" : "#103D5F";
  if (role === "surfaceContainerHigh") return light ? "#E5EDF3" : "#16557F";
  if (role === "outlineVariant") return light ? "rgba(31,78,121,0.18)" : "rgba(248,251,255,0.18)";
  if (role === "inverseSurface") return light ? "#26323C" : "#EAF2F8";
  if (role === "inverseOnSurface") return light ? "#F5FAFF" : "#142033";
  if (role === "inversePrimary") return light ? "#FFDCC2" : "#7A2E12";
  return "rgba(0,0,0,0.56)";
}
