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
  if (!region) return null;
  const wave = phase.interpolate({ inputRange: [0, .5, 1], outputRange: [0, 1, 0] });
  const warm = daylight?.phase === "twilight";
  const light = warm ? "#FFCA9A" : daylight?.season === "winter" ? "#D8EEFF" : "#FFF0CA";
  return <View testID="ambient-weather-region" style={{ position: "absolute", left: region.x, top: region.y, width: region.width, height: region.height, overflow: "hidden" }}>
    {kind === "clear" && daylight?.phase !== "unknown" && daylight ? <Animated.View style={{ position: "absolute", left: -20, top: -20, width: region.width + 40, height: region.height + 40, borderRadius: 100, backgroundColor: light, borderWidth: warm && !dark ? 1 : 0, borderColor: "#BB7956", opacity: wave.interpolate({ inputRange: [0, 1], outputRange: [dark ? .04 : warm ? .18 : .10, dark ? .13 : warm ? .34 : .28] }), transform: [{ scale: wave.interpolate({ inputRange: [0, 1], outputRange: [.90, 1.08] }) }] }} /> : null}
    {["cloud", "partly-cloudy", "rain", "storm", "snow", "fog"].includes(kind) ? Array.from({ length: 3 }, (_, i) => <Animated.View key={`cloud${i}`} style={{ position: "absolute", left: -region.width * .3, top: region.height * (.12 + i * .22), width: region.width * 1.5, height: 22 + i * 9, borderRadius: 70, backgroundColor: dark ? "#A6BFDA" : "#FFFFFF", opacity: wave.interpolate({ inputRange: [0, 1], outputRange: [.07, kind === "cloud" ? .22 : .14] }), transform: [{ translateX: wave.interpolate({ inputRange: [0, 1], outputRange: [-12 + i * 7, 18 + i * 7] }) }] }} />) : null}
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
      return <Animated.View key={`particle${i}`} style={{ position: "absolute", left: (i * 43) % Math.max(1, region.width), top: -14, width: snow ? 3 : 1, height: snow ? 3 : 12, borderRadius: snow ? 2 : 0, backgroundColor: dark ? "#D6E9F9" : "#568DAF", opacity: phase.interpolate({ inputRange, outputRange: visibility.map(value => value * (snow ? .55 : .34)) }), transform: [{ translateY: phase.interpolate({ inputRange, outputRange: travel.map(value => value * (region.height + 28)) }) }, { translateX: phase.interpolate({ inputRange: [0, .5, 1], outputRange: snow ? [-5, 8, -5] : [0, 3, 0] }) }] }} />;
    })}
    {/* Provider storm means heavy rain; it does not prove lightning. */}
    {kind === "storm" ? <Animated.View style={{ position: "absolute", inset: 0, backgroundColor: "#DDEAF8", opacity: phase.interpolate({ inputRange: [0, .73, .75, .79, 1], outputRange: [0, 0, .06, 0, 0] }) }} /> : null}
  </View>;
}
