import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

export type AppWidthClass = "narrow" | "compact" | "regular";
export type AppHeightClass = "short" | "standard";
export type ResponsivePercentWidth = `${number}%`;

export type ResponsiveLayout = {
  width: number;
  height: number;
  widthClass: AppWidthClass;
  heightClass: AppHeightClass;
  isNarrow: boolean;
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
  accountContentGap: number;
  accountPanelPadding: number;
  accountHeaderMinHeight: number;
  accountHeroMinHeight: number;
  accountProfileMinHeight: number;
  accountProviderMinHeight: number;
  accountConsentRowMinHeight: number;
  accountPolicyRowMinHeight: number;
  accountPolicyPointPadding: number;
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
  narrowWidth: 380,
  regularWidth: 430,
  shortHeight: 700,
  tabletWidth: 744,
} as const;

export function resolveResponsiveLayout(width: number, height: number): ResponsiveLayout {
  const safeWidth = Math.max(0, width);
  const safeHeight = Math.max(0, height);
  const isNarrow = safeWidth < responsiveLayoutBreakpoints.narrowWidth;
  const isRegular = safeWidth >= responsiveLayoutBreakpoints.regularWidth;
  const isShort = safeHeight < responsiveLayoutBreakpoints.shortHeight;
  const isTablet = safeWidth >= responsiveLayoutBreakpoints.tabletWidth;

  const screenHorizontalPadding = isTablet ? 32 : isRegular ? 28 : isNarrow ? 16 : 20;
  const splashIconSize = isShort ? 86 : isTablet ? 128 : isRegular ? 112 : isNarrow ? 96 : 102;
  const splashWordmarkWidth = isShort ? 148 : isTablet ? 208 : isRegular ? 184 : isNarrow ? 164 : 172;
  const splashDescriptionFontSize = isShort ? 16 : isTablet ? 20 : isRegular ? 19 : isNarrow ? 17 : 18;

  return {
    width: safeWidth,
    height: safeHeight,
    widthClass: isRegular ? "regular" : isNarrow ? "narrow" : "compact",
    heightClass: isShort ? "short" : "standard",
    isNarrow,
    isRegular,
    isShort,
    isTablet,
    screenHorizontalPadding,
    screenContentGap: isShort ? 12 : isTablet ? 20 : isRegular ? 18 : isNarrow ? 14 : 16,
    screenHeaderGap: isShort ? 12 : isNarrow ? 18 : 24,
    screenTitleFontSize: isShort ? 21 : isTablet ? 26 : isRegular ? 24 : isNarrow ? 22 : 23,
    screenTitleLineHeight: isShort ? 26 : isTablet ? 32 : isRegular ? 29 : isNarrow ? 27 : 28,
    footerPaddingTop: isShort ? 6 : isTablet ? 12 : 8,
    footerPaddingBottom: isShort ? 8 : isTablet ? 20 : 16,
    contentMaxWidth: isTablet ? 680 : 640,
    weatherContentGap: isShort ? 8 : isTablet ? 14 : isRegular ? 12 : isNarrow ? 9 : 10,
    weatherTopPadding: isShort ? 12 : isTablet ? 24 : isRegular ? 20 : isNarrow ? 14 : 16,
    weatherPanelPadding: isShort ? 12 : isTablet ? 18 : isRegular ? 16 : isNarrow ? 13 : 14,
    weatherAtmosphereHeight: isShort ? 220 : isTablet ? 340 : isRegular ? 300 : isNarrow ? 260 : 280,
    weatherChartHeight: isShort ? 78 : isTablet ? 108 : isRegular ? 100 : isNarrow ? 88 : 94,
    homeHeroMinHeight: isShort ? 196 : isTablet ? 252 : isRegular ? 236 : isNarrow ? 214 : 224,
    homeWeatherShowcaseMinHeight: isShort ? 144 : isTablet ? 188 : isRegular ? 176 : isNarrow ? 160 : 168,
    homeWeatherHaloSize: isShort ? 136 : isTablet ? 184 : isRegular ? 172 : isNarrow ? 152 : 160,
    homeWeatherOrbSize: isShort ? 88 : isTablet ? 120 : isRegular ? 112 : isNarrow ? 100 : 106,
    homeWeatherIconSize: isShort ? 58 : isTablet ? 78 : isRegular ? 74 : isNarrow ? 66 : 70,
    homeSidebarMaxWidth: isShort ? 320 : isTablet ? 420 : isRegular ? 380 : isNarrow ? 320 : 340,
    notificationTopPadding: isShort ? 24 : isTablet ? 64 : isRegular ? 52 : 44,
    outfitPanelPadding: isShort ? 12 : isTablet ? 20 : isRegular ? 18 : isNarrow ? 14 : 16,
    outfitCardGap: isShort ? 8 : isTablet ? 12 : isNarrow ? 8 : 10,
    wardrobeGridItemWidth: isTablet ? "23%" : isNarrow || isShort ? "48%" : "30.8%",
    wardrobeCardMinHeight: isShort ? 144 : isTablet ? 174 : isRegular ? 158 : 150,
    wardrobeImageHeight: isShort ? 66 : isTablet ? 84 : isRegular ? 76 : 72,
    wardrobePresetCardMinHeight: isShort ? 154 : isTablet ? 184 : isRegular ? 170 : 162,
    wardrobePresetImageHeight: isShort ? 64 : isTablet ? 82 : isRegular ? 74 : 68,
    outfitDetailCardMinHeight: isShort ? 82 : isTablet ? 104 : isRegular ? 92 : 86,
    outfitDetailImageHeight: isShort ? 44 : isTablet ? 62 : isRegular ? 54 : 50,
    accountContentGap: isShort ? 8 : isTablet ? 16 : isRegular ? 14 : isNarrow ? 10 : 12,
    accountPanelPadding: isShort ? 12 : isTablet ? 20 : isRegular ? 18 : isNarrow ? 14 : 16,
    accountHeaderMinHeight: isShort ? 58 : isTablet ? 88 : isRegular ? 82 : isNarrow ? 68 : 72,
    accountHeroMinHeight: isShort ? 126 : isTablet ? 184 : isRegular ? 168 : isNarrow ? 142 : 150,
    accountProfileMinHeight: isShort ? 74 : isTablet ? 100 : isRegular ? 92 : isNarrow ? 78 : 82,
    accountProviderMinHeight: isShort ? 46 : isTablet ? 58 : isRegular ? 54 : 50,
    accountConsentRowMinHeight: isShort ? 52 : isTablet ? 68 : isRegular ? 62 : isNarrow ? 54 : 56,
    accountPolicyRowMinHeight: isShort ? 60 : isTablet ? 82 : isRegular ? 74 : isNarrow ? 64 : 68,
    accountPolicyPointPadding: isShort ? 12 : isTablet ? 20 : isRegular ? 18 : isNarrow ? 14 : 16,
    bottomNavHorizontalPadding: isTablet ? 32 : isRegular ? 28 : isNarrow ? 16 : 20,
    bottomNavMaxWidth: isTablet ? 680 : 640,
    onboardingHeroVisualHeight: isShort ? 160 : isTablet ? 280 : isRegular ? 232 : isNarrow ? 200 : 214,
    onboardingDestinationVisualHeight: isShort ? 150 : isTablet ? 260 : isRegular ? 216 : isNarrow ? 184 : 198,
    onboardingVisualItemMinHeight: isShort ? 82 : isTablet ? 104 : isRegular ? 98 : isNarrow ? 90 : 94,
    onboardingVisualIconFrameSize: isShort ? 30 : isTablet ? 40 : isRegular ? 36 : isNarrow ? 32 : 34,
    onboardingVisualIconSize: isShort ? 17 : isTablet ? 22 : isRegular ? 20 : isNarrow ? 18 : 19,
    onboardingPanelPadding: isShort ? 12 : isTablet ? 20 : isNarrow ? 14 : 16,
    onboardingCompactRowMinHeight: isShort ? 72 : isTablet ? 92 : isRegular ? 86 : isNarrow ? 78 : 82,
    onboardingSegmentMinHeight: isShort ? 64 : isTablet ? 84 : isRegular ? 80 : isNarrow ? 72 : 76,
    splashContentMaxWidth: isTablet ? 560 : 440,
    splashIconSize,
    splashWordmarkWidth,
    splashWordmarkHeight: Math.round(splashWordmarkWidth * (38 / 172)),
    splashDescriptionMaxWidth: isShort ? 260 : isTablet ? 360 : isRegular ? 320 : isNarrow ? 280 : 290,
    splashDescriptionFontSize,
    splashDescriptionLineHeight: isShort ? 24 : isTablet ? 30 : isRegular ? 29 : isNarrow ? 26 : 28,
    splashGlowHeight: isShort ? 400 : isTablet ? 680 : isRegular ? 600 : isNarrow ? 480 : 520,
    splashGlowRadius: isShort ? 200 : isTablet ? 340 : isRegular ? 300 : isNarrow ? 240 : 260,
    splashGlowBottom: isShort ? -100 : isTablet ? -150 : isRegular ? -130 : isNarrow ? -110 : -120,
  };
}

export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();
  return useMemo(() => resolveResponsiveLayout(width, height), [height, width]);
}
