import React, { useId } from "react";
import { Animated, StyleSheet } from "../localization/react-native";
import Svg, { Defs, Mask, Rect, Path, ClipPath, G, Image as SvgImage } from "react-native-svg";
import contract from "../../assets/characters/rain-rig-contract.json";
const source = require("../../assets/characters/rain-rig-source.png");

/** Source-mask rig: umbrella, hand and arm move together; body/head stay fixed. */
export function HomeMascotRainRig({ size, phase, moving }: { size: number; phase: Animated.Value; moving: boolean }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const { translate, scale } = contract.outerTransform;
  const groupTransform = `translate(${translate[0]} ${translate[1]}) scale(${scale})`;
  const origin = contract.rotationOrigin.map((v, i) => (translate[i] + scale * v) * size / 1024);
  const picture = <SvgImage href={source} x={0} y={0} width={1199} height={1312} />;
  const canvas = { width: size, height: size, viewBox: "0 0 1024 1024", style: StyleSheet.absoluteFill };
  return <>
    <Svg {...canvas}>
      <Defs><Mask id={`${id}body`} x={0} y={0} width={1199} height={1312} maskUnits="userSpaceOnUse">
        <Rect x={0} y={0} width={1199} height={1312} fill="white" />
        <Path d={contract.topPath} fill="black" /><Path d={contract.stationaryCutLowerPath} fill="black" />
      </Mask></Defs>
      <G transform={groupTransform}><G mask={`url(#${id}body)`}>{picture}</G></G>
    </Svg>
    <Animated.View testID="home-mascot-umbrella-part" style={[StyleSheet.absoluteFill, {
      transformOrigin: [origin[0], origin[1], 0], transform: [{ rotate: phase.interpolate({ inputRange: [0, 1],
        outputRange: moving ? ["-0.6deg", "0.6deg"] : ["0deg", "0deg"] }) }],
    }]}>
      <Svg {...canvas}><Defs><ClipPath id={`${id}moving`}><Path d={contract.topPath} /><Path d={contract.movingLowerPath} /></ClipPath></Defs>
        <G transform={groupTransform}><G clipPath={`url(#${id}moving)`}>{picture}</G></G>
      </Svg>
    </Animated.View>
    <Svg {...canvas}><Defs><ClipPath id={`${id}head`}><Path d={contract.headPath} /></ClipPath></Defs>
      <G transform={groupTransform}><G clipPath={`url(#${id}head)`}>{picture}</G></G>
    </Svg>
  </>;
}
