import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

export type AppWidthClass = "compact" | "regular";
export type AppHeightClass = "short" | "standard";
export type ResponsivePercentWidth = `${number}%`;

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
  weatherContentGap: number;
  weatherTopPadding: number;
  weatherPanelPadding: number;
  weatherAtmosphereHeight: number;
  weatherChartHeight: number;
  homeHeroMinHeight: number;
  homeWeatherShowcaseMinHeight: number;
  homeWeatherHaloSize: number;
  homeWeatherOrbSize: number;
  homeWeatherIconSize: number;
  homeSidebarMaxWidth: number;
  notificationTopPadding: number;
  outfitPanelPadding: number;
  outfitCardGap: number;
  wardrobeGridItemWidth: ResponsivePercentWidth;
  wardrobeCardMinHeight: number;
  wardrobeImageHeight: number;
  wardrobePresetCardMinHeight: number;
  wardrobePresetImageHeight: number;
  outfitDetailCardMinHeight: number;
  outfitDetailImageHeight: number;
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
    weatherContentGap: isShort ? 8 : isTablet ? 14 : isRegular ? 12 : 10,
    weatherTopPadding: isShort ? 12 : isTablet ? 24 : isRegular ? 20 : 16,
    weatherPanelPadding: isShort ? 12 : isTablet ? 18 : isRegular ? 16 : 14,
    weatherAtmosphereHeight: isShort ? 220 : isTablet ? 340 : isRegular ? 300 : 280,
    weatherChartHeight: isShort ? 78 : isTablet ? 108 : isRegular ? 100 : 94,
    homeHeroMinHeight: isShort ? 196 : isTablet ? 252 : isRegular ? 236 : 224,
    homeWeatherShowcaseMinHeight: isShort ? 144 : isTablet ? 188 : isRegular ? 176 : 168,
    homeWeatherHaloSize: isShort ? 136 : isTablet ? 184 : isRegular ? 172 : 160,
    homeWeatherOrbSize: isShort ? 88 : isTablet ? 120 : isRegular ? 112 : 106,
    homeWeatherIconSize: isShort ? 58 : isTablet ? 78 : isRegular ? 74 : 70,
    homeSidebarMaxWidth: isShort ? 320 : isTablet ? 420 : isRegular ? 380 : 340,
    notificationTopPadding: isShort ? 24 : isTablet ? 64 : isRegular ? 52 : 44,
    outfitPanelPadding: isShort ? 12 : isTablet ? 20 : isRegular ? 18 : 16,
    outfitCardGap: isShort ? 8 : isTablet ? 12 : 10,
    wardrobeGridItemWidth: isTablet ? "23%" : isShort ? "48%" : "30.8%",
    wardrobeCardMinHeight: isShort ? 144 : isTablet ? 174 : isRegular ? 158 : 150,
    wardrobeImageHeight: isShort ? 66 : isTablet ? 84 : isRegular ? 76 : 72,
    wardrobePresetCardMinHeight: isShort ? 154 : isTablet ? 184 : isRegular ? 170 : 162,
    wardrobePresetImageHeight: isShort ? 64 : isTablet ? 82 : isRegular ? 74 : 68,
    outfitDetailCardMinHeight: isShort ? 82 : isTablet ? 104 : isRegular ? 92 : 86,
    outfitDetailImageHeight: isShort ? 44 : isTablet ? 62 : isRegular ? 54 : 50,
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
