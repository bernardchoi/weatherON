import React from "react";
import { StyleSheet } from "../localization/react-native";
import Svg, { G, Path, Line, Circle } from "react-native-svg";
import type { MascotClothing } from "../utils/mascotOutfit";

/** Code-native clothing, registered to the torso. Face, hands and props are untouched.
 * Deliberately broad shapes: these must remain legible at the 56pt home slot.
 * This is a representative silhouette, not a reproduction of the user's own item.
 */
export function HomeMascotClothing({ clothing = "none", size, rainPose = false }: {
  clothing?: MascotClothing; size: number; rainPose?: boolean;
}) {
  if (clothing === "none") return null;
  const color = { light: "#C4E3DF", outer: "#559A9C", winter: "#3E737E", raincoat: "#F3C44C" }[clothing];
  const edge = clothing === "raincoat" ? "#A77220" : "#285C65";
  // Rain torso begins 43px higher and is taller/slightly wider than the base/fan torso.
  const transform = rainPose ? "translate(-20 -190) scale(1.04 1.2)" : undefined;
  return <Svg testID={`home-mascot-clothing-${clothing}`} width={size} height={size} viewBox="0 0 1024 1024" style={StyleSheet.absoluteFill}>
    <G transform={transform}>
      <Path d="M399 733 Q449 743 512 741 Q575 743 623 733 L649 854 Q591 883 512 882 Q433 883 375 854Z"
        fill={color} stroke={edge} strokeWidth={8} strokeLinejoin="round" />
      <Path d="M405 739 Q512 770 618 739" fill="none" stroke={edge} strokeWidth={8} />
      {clothing === "light" ? <Path d="M388 818 Q512 842 637 818" fill="none" stroke="#8ABFBC" strokeWidth={18} /> : <>
        <Line x1={512} y1={757} x2={512} y2={875} stroke={edge} strokeWidth={8} />
        <Path d="M453 739 L476 784 L506 758 M571 739 L548 784 L518 758" fill="none" stroke={edge} strokeWidth={7} />
        {clothing === "winter" ? <>
          <Path d="M391 800 Q448 817 502 810 M522 810 Q581 817 634 800 M382 843 Q446 859 502 852 M522 852 Q580 859 643 843" fill="none" stroke="#70A4AA" strokeWidth={7} />
          <Path d="M409 731 Q512 750 615 731 L611 761 Q512 778 413 761Z" fill="#EDBE55" stroke="#B17E28" strokeWidth={6} />
        </> : <><Circle cx={512} cy={801} r={5} fill={edge}/><Circle cx={512} cy={841} r={5} fill={edge}/></>}
      </>}
    </G>
  </Svg>;
}
