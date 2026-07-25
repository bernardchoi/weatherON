import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

export type AppWidthClass = "compact" | "regular";
export type AppHeightClass = "short" | "standard";

export type ResponsiveLayout = {
  width: number;
  height: number;
  widthClass: AppWidthClass;
  heightClass: AppHeightClass;
  isRegular: boolean;
  isShort: boolean;
  isTablet: boolean;
  screenHorizontalPadding: number;
  screenContentGap: number;
  screenHeaderGap: number;
  screenTitleFontSize: number;
  screenTitleLineHeight: number;
  footerPaddingTop: number;
  footerPaddingBottom: number;
  contentMaxWidth: number;
  bottomNavHorizontalPadding: number;
  bottomNavMaxWidth: number;
  onboardingHeroVisualHeight: number;
  onboardingDestinationVisualHeight: number;
  onboardingVisualItemMinHeight: number;
  onboardingVisualIconFrameSize: number;
  onboardingVisualIconSize: number;
  onboardingPanelPadding: number;
  onboardingCompactRowMinHeight: number;
  onboardingSegmentMinHeight: number;
  splashContentMaxWidth: number;
  splashIconSize: number;
  splashWordmarkWidth: number;
  splashWordmarkHeight: number;
  splashDescriptionMaxWidth: number;
  splashDescriptionFontSize: number;
  splashDescriptionLineHeight: number;
  splashGlowHeight: number;
  splashGlowRadius: number;
  splashGlowBottom: number;
};

export const responsiveLayoutBreakpoints = {
  regularWidth: 430,
  shortHeight: 700,
  tabletWidth: 744,
} as const;

export function resolveResponsiveLayout(width: number, height: number): ResponsiveLayout {
  const safeWidth = Math.max(0, width);
  const safeHeight = Math.max(0, height);
  const isRegular = safeWidth >= responsiveLayoutBreakpoints.regularWidth;
  const isShort = safeHeight < responsiveLayoutBreakpoints.shortHeight;
  const isTablet = safeWidth >= responsiveLayoutBreakpoints.tabletWidth;

  const screenHorizontalPadding = isTablet ? 32 : isRegular ? 28 : isShort ? 16 : 20;
  const splashIconSize = isShort ? 86 : isTablet ? 128 : isRegular ? 112 : 102;
  const splashWordmarkWidth = isShort ? 148 : isTablet ? 208 : isRegular ? 184 : 172;
  const splashDescriptionFontSize = isShort ? 16 : isTablet ? 20 : isRegular ? 19 : 18;

  return {
    width: safeWidth,
    height: safeHeight,
    widthClass: isRegular ? "regular" : "compact",
    heightClass: isShort ? "short" : "standard",
    isRegular,
    isShort,
    isTablet,
    screenHorizontalPadding,
    screenContentGap: isShort ? 12 : isTablet ? 20 : isRegular ? 18 : 16,
    screenHeaderGap: isShort ? 12 : 24,
    screenTitleFontSize: isShort ? 21 : isTablet ? 26 : isRegular ? 24 : 23,
    screenTitleLineHeight: isShort ? 26 : isTablet ? 32 : isRegular ? 29 : 28,
    footerPaddingTop: isShort ? 6 : isTablet ? 12 : 8,
    footerPaddingBottom: isShort ? 8 : isTablet ? 20 : 16,
    contentMaxWidth: isTablet ? 680 : 640,
    bottomNavHorizontalPadding: isTablet ? 32 : isRegular ? 28 : isShort ? 16 : 20,
    bottomNavMaxWidth: isTablet ? 680 : 640,
    onboardingHeroVisualHeight: isShort ? 160 : isTablet ? 280 : isRegular ? 232 : 214,
    onboardingDestinationVisualHeight: isShort ? 150 : isTablet ? 260 : isRegular ? 216 : 198,
    onboardingVisualItemMinHeight: isShort ? 82 : isTablet ? 104 : isRegular ? 98 : 94,
    onboardingVisualIconFrameSize: isShort ? 30 : isTablet ? 40 : isRegular ? 36 : 34,
    onboardingVisualIconSize: isShort ? 17 : isTablet ? 22 : isRegular ? 20 : 19,
    onboardingPanelPadding: isShort ? 12 : isTablet ? 20 : 16,
    onboardingCompactRowMinHeight: isShort ? 72 : isTablet ? 92 : isRegular ? 86 : 82,
    onboardingSegmentMinHeight: isShort ? 64 : isTablet ? 84 : isRegular ? 80 : 76,
    splashContentMaxWidth: isTablet ? 560 : 440,
    splashIconSize,
    splashWordmarkWidth,
    splashWordmarkHeight: Math.round(splashWordmarkWidth * (38 / 172)),
    splashDescriptionMaxWidth: isShort ? 260 : isTablet ? 360 : isRegular ? 320 : 290,
    splashDescriptionFontSize,
    splashDescriptionLineHeight: isShort ? 24 : isTablet ? 30 : isRegular ? 29 : 28,
    splashGlowHeight: isShort ? 400 : isTablet ? 680 : isRegular ? 600 : 520,
    splashGlowRadius: isShort ? 200 : isTablet ? 340 : isRegular ? 300 : 260,
    splashGlowBottom: isShort ? -100 : isTablet ? -150 : isRegular ? -130 : -120,
  };
}

export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();
  return useMemo(() => resolveResponsiveLayout(width, height), [height, width]);
}
