import React from "react";
import Svg, { Path } from "react-native-svg";
import paths from "../../../../assets/wordmark/home-02/paths.json";
import type { AppTheme } from "../theme/tokens";

// Selected 02 contours supplied by the source workspace; no font substitution.
// Home only. At 180×30, the preserved path ink is approximately 23pt high.
export function IosHomeWordmark({ theme }: { theme: AppTheme }) {
  return (
    <Svg testID="home-wordmark-02" width={180} height={30} viewBox={paths.viewBox}
      preserveAspectRatio="xMinYMid meet" accessible accessibilityRole="image" accessibilityLabel="WeatherON">
      <Path d={paths.weatherPath} fill={theme.muted} fillRule="evenodd" />
      <Path d={paths.onPath} fill={theme.wordmarkOn} fillRule="evenodd" />
    </Svg>
  );
}
