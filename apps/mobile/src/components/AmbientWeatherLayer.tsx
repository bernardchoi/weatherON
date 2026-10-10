import React, { useEffect, useRef } from "react";
import { Animated, View } from "../localization/react-native";
import { ambientStars, ambientMeteorGap, isAmbientReadingPoint, type AmbientReadRegion } from "../utils/ambientSky";
import type { AmbientDaylight } from "../utils/weatherDaylight";

export type AmbientWeatherRegion = { x: number; y: number; width: number; height: number };
// A process-wide deadline avoids a meteor every time Home is revisited.
let nextMeteorAt = Date.now() + 90000;
export function AmbientWeatherLayer({ kind, particles, phase, moving, daylight, region, skyRegion, readingAreas = [], scrollOffset, meteorScrollY = 0, scrolling = false, dark }: {
  kind: string; particles: number; phase: Animated.Value; moving: boolean;
  daylight?: AmbientDaylight; region?: AmbientWeatherRegion; skyRegion?: AmbientWeatherRegion; readingAreas?: AmbientReadRegion[]; scrollOffset?: Animated.Value; meteorScrollY?: number; scrolling?: boolean; dark: boolean;
}) {
  const meteor = useRef(new Animated.Value(0)).current;
  const sky = skyRegion ?? region;
  const gap = sky ? ambientMeteorGap(sky.height, readingAreas.map(area => ({ ...area, y: area.y - meteorScrollY }))) : null;
  const night = kind === "clear" && daylight?.phase === "night";
  useEffect(() => {
    meteor.stopAnimation(); meteor.setValue(0);
    if (!night || !moving || !gap || scrolling) return;
    let timer: ReturnType<typeof setTimeout>;
    let animation: Animated.CompositeAnimation | undefined;
    const schedule = () => {
      timer = setTimeout(() => {
        nextMeteorAt = Date.now() + 120000;
        meteor.setValue(0);
        animation = Animated.timing(meteor, { toValue: 1, duration: 1800, useNativeDriver: true, isInteraction: false });
        animation.start(({ finished }) => { if (finished) schedule(); });
      }, Math.max(15000, nextMeteorAt - Date.now()));
    };
    schedule();
    return () => { clearTimeout(timer); animation?.stop(); meteor.setValue(0); };
  }, [night, moving, !!gap, scrolling, meteor]);
  if (!sky || kind === "none") return null;
  if (night) return <View testID="ambient-night-sky" style={{ position: "absolute", left: sky.x, top: sky.y, width: sky.width, height: sky.height, overflow: "hidden" }}>
    {ambientStars.map((star, i) => {
      const x = star.x * sky.width; const y = star.y * sky.height;
      const suppressed = isAmbientReadingPoint(x, y, readingAreas);
      let nativeWeight: Animated.AnimatedMultiplication<number> | number = 1;
      if (scrollOffset) for (const area of readingAreas) {
        if (x < area.x - 10 || x > area.x + area.width + 10) continue;
        const inside = scrollOffset.interpolate({ inputRange: [area.y - y - 10, area.y - y, area.y + area.height - y, area.y + area.height - y + 10], outputRange: [0, 1, 1, 0], extrapolate: "clamp" });
        nativeWeight = Animated.multiply(nativeWeight, Animated.subtract(1, Animated.multiply(.965, inside)));
      }
      const base = dark ? .48 : .74;
      const weight = suppressed ? .035 : 1;
      const offset = .15 + star.offset * .55;
      return <Animated.View key={i} testID="ambient-sky-star" style={{ position: "absolute", left: x, top: y, width: star.size, height: star.size, borderRadius: 2, backgroundColor: dark ? "#E4F2FF" : "#274A70", opacity: scrollOffset ? Animated.multiply(nativeWeight, star.twinkle ? phase.interpolate({ inputRange: [0, offset, Math.min(.96, offset + .23), 1], outputRange: [base, dark ? .78 : .90, base * (dark ? .7 : .95), base] }) : base) : star.twinkle ? phase.interpolate({ inputRange: [0, offset, Math.min(.96, offset + .23), 1], outputRange: [base * weight, (dark ? .78 : .90) * weight, base * (dark ? .7 : .95) * weight, base * weight] }) : base * weight, transform: [{ translateX: phase.interpolate({ inputRange: [0, .3, .7, 1], outputRange: [0, 4, -3, 0] }) }, { translateY: phase.interpolate({ inputRange: [0, .5, 1], outputRange: [0, i % 2 === 0 ? 5 : -4, 0] }) }] }} />;
    })}
    {gap ? <Animated.View testID="ambient-sky-meteor" style={{ position: "absolute", left: 0, top: gap.y + gap.height * .25, width: 52, height: 1, backgroundColor: dark ? "#E4F2FF" : "#274A70", opacity: meteor.interpolate({ inputRange: [0, .15, .65, 1], outputRange: [0, .65, .40, 0] }), transform: [{ translateX: meteor.interpolate({ inputRange: [0, 1], outputRange: [24, sky.width - 76] }) }, { translateY: meteor.interpolate({ inputRange: [0, 1], outputRange: [0, Math.min(8, gap.height * .2)] }) }, { rotate: "7deg" }] }} /> : null}
  </View>;
  // Every weather field shares the measured Home sky, never the icon's bounds.
  const weatherRegion = sky;

  const wave = phase.interpolate({ inputRange: [0, .5, 1], outputRange: [0, 1, 0] });
  const warm = daylight?.phase === "twilight";
  return <View testID="ambient-weather-region" pointerEvents="none" style={{ position: "absolute", left: weatherRegion.x, top: weatherRegion.y, width: weatherRegion.width, height: weatherRegion.height, overflow: "hidden" }}>
    {kind === "clear" && daylight && (daylight.phase === "day" || daylight.phase === "twilight") ? <>
      <Animated.View testID="ambient-day-sunlight" style={{ position: "absolute", left: -80, top: -80, width: weatherRegion.width + 160, height: weatherRegion.height + 160,
        // Original diffuse sunlight: an off-screen source, broad halo and two soft rays.
        // The full measured sky and transparent endpoints prevent rectangular light edges.
        // UI theme affects ink intensity; actual solar phase alone selects day/twilight.
        experimental_backgroundImage: dark
          ? `radial-gradient(ellipse 21% 13% at 76% 4%, ${warm ? "#FFCA9A08" : "#FFF9EA08"} 0%, #FFF9EA00 100%), radial-gradient(ellipse 68% 46% at 76% -4%, ${warm ? "#FFCA9A08" : "#FFE9BB08"} 0%, #FFE9BB00 100%), linear-gradient(158deg, #FFFFFF00 37%, #FFFFFF04 42%, #FFFFFF00 48%), linear-gradient(175deg, #FFFFFF00 45%, #FFFFFF04 48%, #FFFFFF00 53%)`
          : warm
          ? "radial-gradient(ellipse 21% 13% at 76% 4%, #FFF1D6F0 0%, #FFE4BD98 28%, #FFE4BD00 100%), radial-gradient(ellipse 68% 46% at 76% -4%, #FFCA9A68 0%, #FFCA9A28 38%, #FFCA9A00 100%), linear-gradient(158deg, #FFCA9A00 37%, #FFCA9A3C 42%, #FFCA9A00 48%), linear-gradient(175deg, #FFCA9A00 45%, #FFCA9A22 48%, #FFCA9A00 53%)"
          : "radial-gradient(ellipse 21% 13% at 76% 4%, #FFFFF6F5 0%, #FFF7E6B0 28%, #FFF7E600 100%), radial-gradient(ellipse 68% 46% at 76% -4%, #FFF1D86A 0%, #FFF1D826 38%, #FFF1D800 100%), linear-gradient(158deg, #FFFFFF00 37%, #FFFFFF3C 42%, #FFFFFF00 48%), linear-gradient(175deg, #FFFFFF00 45%, #FFFFFF22 48%, #FFFFFF00 53%)",
        opacity: wave.interpolate({ inputRange: [0, 1], outputRange: dark ? [.30, .52] : [.86, .94] }),
        transform: [{ translateX: phase.interpolate({ inputRange: [0, .3, .7, 1], outputRange: [0, -18, 13, 0] }) }, { translateY: phase.interpolate({ inputRange: [0, .5, 1], outputRange: [0, 16, 0] }) }, { rotate: phase.interpolate({ inputRange: [0, .3, .7, 1], outputRange: ["0deg", "-1.6deg", "1.1deg", "0deg"] }) }],
      }} />
    </> : null}
    {["cloud", "partly-cloudy", "rain", "storm", "snow", "fog"].includes(kind) ? Array.from({ length: 3 }, (_, i) => <Animated.View key={`cloud${i}`} style={{ position: "absolute", left: -weatherRegion.width * .3, top: weatherRegion.height * (.02 + i * .22), width: weatherRegion.width * 1.6, height: weatherRegion.height * .4,
      experimental_backgroundImage: `radial-gradient(ellipse at center, ${dark ? "#A6BFDA20" : "#FFFFFFB0"} 0%, ${dark ? "#A6BFDA00" : "#FFFFFF00"} 70%)`,
      opacity: wave.interpolate({ inputRange: [0, 1], outputRange: [.07, kind === "cloud" ? .22 : .14] }), transform: [{ translateX: wave.interpolate({ inputRange: [0, 1], outputRange: [-12 + i * 7, 18 + i * 7] }) }] }} />) : null}
    {Array.from({ length: particles }, (_, i) => {
      const snow = kind === "snow";
      // Several traversals inside a long common native clock, with invisible resets.
      const cycles = snow ? 3 : 8;
      const offset = (i * .61803398875) % 1;
      const inputRange = [0]; const travel = [offset]; const visibility = [offset > .1 && offset < .9 ? 1 : 0];
      for (let n = 1; n <= cycles; n++) {
        const reset = (n - offset) / cycles;
        if (reset > 0 && reset < 1) { inputRange.push(Math.max(inputRange[inputRange.length - 1] + .000001, reset - .0001), reset); travel.push(1, 0); visibility.push(0, 0); }
        const middle = reset + .5 / cycles;
        if (middle < 1) { inputRange.push(middle); travel.push(.5); visibility.push(1); }
      }
      inputRange.push(1); travel.push(offset); visibility.push(offset > .1 && offset < .9 ? 1 : 0);
      const x = (i * 43) % Math.max(1, weatherRegion.width);
      const fallingY = phase.interpolate({ inputRange, outputRange: travel.map(value => value * (weatherRegion.height + 28)) });
      // Follow moving particles and scrolling text in the same native value graph.
      const contentY = scrollOffset ? Animated.add(scrollOffset, fallingY) : fallingY;
      let readWeight: Animated.AnimatedMultiplication<number> | number = 1;
      for (const area of readingAreas) {
        if (x < area.x - 10 || x > area.x + area.width + 10) continue;
        const inside = contentY.interpolate({ inputRange: [area.y - 12, area.y, area.y + area.height, area.y + area.height + 12], outputRange: [0, 1, 1, 0], extrapolate: "clamp" });
        readWeight = Animated.multiply(readWeight, Animated.subtract(1, Animated.multiply(.965, inside)));
      }
      return <Animated.View key={`particle${i}`} testID="ambient-weather-particle" style={{ position: "absolute", left: x, top: -14, width: snow ? 3 : 1, height: snow ? 3 : 12, borderRadius: snow ? 2 : 0, backgroundColor: dark ? "#D6E9F9" : "#568DAF", opacity: Animated.multiply(readWeight, phase.interpolate({ inputRange, outputRange: visibility.map(value => value * (snow ? .55 : .34)) })), transform: [{ translateY: fallingY }, { translateX: phase.interpolate({ inputRange: [0, .5, 1], outputRange: snow ? [-5, 8, -5] : [0, 3, 0] }) }] }} />;
    })}
    {/* Provider storm means heavy rain; it does not prove lightning. */}
    {kind === "storm" ? <Animated.View style={{ position: "absolute", inset: 0, backgroundColor: "#DDEAF8", opacity: phase.interpolate({ inputRange: [0, .73, .75, .79, 1], outputRange: [0, 0, .06, 0, 0] }) }} /> : null}
  </View>;
}
