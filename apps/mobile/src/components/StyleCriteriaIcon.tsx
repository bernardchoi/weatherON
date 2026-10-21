import React from "react";
import Svg, { Circle, Rect } from "react-native-svg";

// A native vector is used at the Outfit landing card's fixed 26pt size. It
// keeps the control's three sliders crisp on every iOS display scale instead
// of asking Image to resample a dense derivative for this small focal icon.
export function StyleCriteriaIcon({ color, size = 26 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessible={false}>
      <Rect x="7" y="10" width="50" height="10" rx="5" fill={color} fillOpacity={0.56} />
      <Rect x="7" y="27" width="50" height="10" rx="5" fill={color} fillOpacity={0.72} />
      <Rect x="7" y="44" width="50" height="10" rx="5" fill={color} fillOpacity={0.56} />
      <Rect x="10" y="13" width="44" height="4" rx="2" fill={color} fillOpacity={0.9} />
      <Rect x="10" y="30" width="44" height="4" rx="2" fill={color} fillOpacity={1} />
      <Rect x="10" y="47" width="44" height="4" rx="2" fill={color} fillOpacity={0.9} />
      <Circle cx="24" cy="15" r="10" fill={color} fillOpacity={0.92} />
      <Circle cx="42" cy="32" r="10" fill={color} fillOpacity={0.96} />
      <Circle cx="20" cy="49" r="10" fill={color} fillOpacity={0.92} />
      <Circle cx="24" cy="15" r="5" fill={color} />
      <Circle cx="42" cy="32" r="5" fill={color} />
      <Circle cx="20" cy="49" r="5" fill={color} />
    </Svg>
  );
}
