import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, AppState, Easing, StyleSheet, View, useWindowDimensions } from "react-native";
import type { WeatherCondition } from "@weatheron/shared";
import type { AppTheme } from "../theme/tokens";
import { useReducedMotion } from "../hooks/useReducedMotion";

// docs/planning/WeatherON_planning_v5.html §20 "날씨 다이나믹 배경 애니메이션 — 홈(H1)"
// RN View의 transform·opacity로 날씨별 모션을 구성함.
// 라이트 모드는 동일 모티프를 유지하되 각 색상을 흰색 쪽으로 리틴트한다(스펙 "색·opacity만 리틴트" 지침).
type MotionState = "clear" | "cloud" | "rain" | "snow" | "storm" | "night" | "dust";

const DARK_GRADIENTS: Record<Exclude<MotionState, "night">, [string, string, string]> = {
  clear: ["#071E33", "#0D3D62", "#176B9E"],
  cloud: ["#0B2233", "#183E55", "#2D607D"],
  rain: ["#071B2A", "#10354B", "#1D5872"],
  snow: ["#102C43", "#2A5871", "#5B91A9"],
  storm: ["#160D2E", "#2C1A4A", "#51386F"],
  dust: ["#302A24", "#544839", "#827056"],
};
const NIGHT_GRADIENT: [string, string, string] = ["#030B18", "#07182B", "#0D2D49"];

const LIGHT_RETINT_RATIO = 0.8;

type Props = {
  condition: WeatherCondition | string;
  theme: AppTheme;
  isNight: boolean;
  subtle?: boolean;
};

// 정보 카드 뒤에서만 움직이며 터치·스크린리더 탐색에 참여하지 않음.
export const WeatherBackground = React.memo(function WeatherBackground({ condition, theme, isNight, subtle = false }: Props) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const enabled = useAnimationEnabled();
  const motionState = resolveMotionState(condition, isNight);
  const gradientColors = useMemo(() => resolveGradient(motionState, theme.name), [motionState, theme.name]);
  const fullBand = Math.max(windowHeight, 320);

  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.wrap}>
      <View style={[StyleSheet.absoluteFill, { opacity: subtle ? (theme.name === "dark" ? 0.32 : 0.24) : 1 }]}><GradientBackdrop colors={gradientColors} windowWidth={windowWidth} subtle={subtle} /></View>
      <View style={StyleSheet.absoluteFill}>
        {motionState === "clear" ? <GlowPulseLayer color={theme.gold} enabled={enabled} /> : null}
        {motionState === "cloud" ? <CloudDriftLayer height={windowHeight * 0.65} color={theme.name === "dark" ? "#FFFFFF" : theme.sky} enabled={enabled} /> : null}
        {motionState === "dust" ? <CloudDriftLayer height={windowHeight} color={theme.gold} enabled={enabled} haze /> : null}
        {motionState === "rain" ? <RainDropsLayer height={fullBand} color={theme.sky} count={subtle ? 16 : 48} enabled={enabled} /> : null}
        {motionState === "storm" ? (
          <>
            <RainDropsLayer height={fullBand} color={theme.sky} count={subtle ? 24 : 64} enabled={enabled} intense />
            <CloudDriftLayer height={windowHeight * 0.55} color={theme.sky} enabled={enabled} />
            <LightningFlashLayer enabled={enabled} />
          </>
        ) : null}
        {motionState === "snow" ? <SnowFlakesLayer height={fullBand} count={subtle ? 20 : 32} color={theme.name === "dark" ? "#FFFFFF" : theme.sky} enabled={enabled} /> : null}
        {motionState === "night" ? <><GlowPulseLayer color={theme.skyLite} enabled={enabled} night /><StarTwinkleLayer height={windowHeight} count={20} color={theme.name === "dark" ? "#FFFFFF" : theme.sky} enabled={enabled} /></> : null}
      </View>
    </View>
  );
});

function GradientBackdrop({ colors, windowWidth, subtle }: { colors: [string, string, string]; windowWidth: number; subtle: boolean }) {
  const isNarrowScene = windowWidth <= 390;
  const largeOrbSize = isNarrowScene ? Math.max(220, Math.min(300, windowWidth * 0.76)) : 420;
  const smallOrbSize = isNarrowScene ? Math.max(190, Math.min(260, windowWidth * 0.66)) : 360;
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors[1] }]}>
      {!subtle ? <>
        <View style={[StyleSheet.absoluteFill, styles.gradientTop, { backgroundColor: colors[0] }]} />
        <View style={[StyleSheet.absoluteFill, styles.gradientBottom, { backgroundColor: colors[2] }]} />
      </> : null}
      <View style={[styles.gradientOrb, styles.gradientOrbLarge, { backgroundColor: colors[0], width: largeOrbSize, height: largeOrbSize, opacity: isNarrowScene ? 0.06 : 0.16 }]} />
      <View style={[styles.gradientOrb, styles.gradientOrbSmall, { backgroundColor: colors[2], width: smallOrbSize, height: smallOrbSize, opacity: isNarrowScene ? 0.05 : 0.13 }]} />
    </View>
  );
}

export function resolveMotionState(condition: WeatherCondition | string, isNight: boolean): MotionState {
  if (condition === "clear") return isNight ? "night" : "clear";
  if (condition === "rain") return "rain";
  if (condition === "storm") return "storm";
  if (condition === "snow") return "snow";
  if (condition === "dust" || condition === "fog" || condition === "haze") return "dust";
  return "cloud";
}

function resolveGradient(motionState: MotionState, themeName: AppTheme["name"]): [string, string, string] {
  const darkColors = motionState === "night" ? NIGHT_GRADIENT : DARK_GRADIENTS[motionState];
  if (themeName === "dark") return darkColors;
  return darkColors.map((hex) => mixWithWhite(hex, LIGHT_RETINT_RATIO)) as [string, string, string];
}

function mixWithWhite(hex: string, ratio: number): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * ratio);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

// 이 앱의 웹 프리뷰 환경에는 네이티브 애니메이션 드라이버가 없어 Animated가 JS 폴백으로 동작하는데,
// 그 경로에서 Animated.loop가 첫 반복 이후 재시작하지 않고 멈추는 현상이 있다(iOS/Android 네이티브
// 드라이버에서는 재현되지 않을 수 있으나, 플랫폼에 관계없이 안전하도록 수동 반복으로 대체한다).
// 매 반복이 끝날 때 onIterationEnd로 다음 반복의 시작 상태를 맞춘 뒤 재귀적으로 다시 시작한다.
function startRepeating(getAnimation: () => Animated.CompositeAnimation, onIterationEnd?: () => void): () => void {
  let cancelled = false;
  const run = () => {
    getAnimation().start(({ finished }) => {
      if (!finished || cancelled) return;
      onIterationEnd?.();
      run();
    });
  };
  run();
  return () => {
    cancelled = true;
  };
}

// Reduce Motion 접근성 설정과 앱 포그라운드 상태를 함께 반영해 애니메이션 on/off를 결정한다.
function useAnimationEnabled(): boolean {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(AppState.currentState === "active");

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => setActive(state === "active"));
    return () => subscription.remove();
  }, []);

  return active && reduceMotion === false;
}

function GlowPulseLayer({ color, enabled, night = false }: { color: string; enabled: boolean; night?: boolean }) {
  const opacity = useRef(new Animated.Value(0.1)).current;

  useEffect(() => {
    if (!enabled) {
      opacity.stopAnimation();
      opacity.setValue(0.1);
      return;
    }
    const cancel = startRepeating(() =>
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.24, duration: 4500, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
        Animated.timing(opacity, { toValue: 0.1, duration: 4500, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      ]),
    );
    return () => {
      cancel();
      opacity.stopAnimation();
    };
  }, [enabled, opacity]);

  const size = night ? 130 : 220;
  return (
    <Animated.View
      style={[styles.glow, {
        width: size, height: size, marginLeft: -size / 2, opacity,
        transform: [
          { scale: opacity.interpolate({ inputRange: [0.1, 0.24], outputRange: [0.9, 1.15] }) },
          { rotate: opacity.interpolate({ inputRange: [0.1, 0.24], outputRange: ["-8deg", "8deg"] }) },
        ],
      }]}
    >
      {[0, 0.12, 0.24].map((inset, index) => <View key={inset} style={{
        position: "absolute", left: size * inset, top: size * inset,
        width: size * (1 - inset * 2), height: size * (1 - inset * 2),
        borderRadius: size, backgroundColor: color, opacity: [0.16, 0.28, 0.6][index],
      }} />)}
      {!night ? Array.from({ length: 8 }, (_, index) => {
        const angle = index * Math.PI / 4;
        return <View key={index} style={{
          position: "absolute", left: size / 2 + Math.cos(angle) * 88 - 15,
          top: size / 2 + Math.sin(angle) * 88 - 1,
          width: 30, height: 2, borderRadius: 1, backgroundColor: color,
          transform: [{ rotate: `${index * 45}deg` }],
        }} />;
      }) : null}
    </Animated.View>
  );
}

function CloudDriftLayer({ height, enabled, color, haze = false }: { height: number; enabled: boolean; color: string; haze?: boolean }) {
  const layers = useMemo(
    () => [
      { top: height * 0.14, width: 220, opacity: 0.1, duration: 24000 },
      { top: height * 0.32, width: 170, opacity: 0.07, duration: 30000 },
      { top: height * 0.5, width: 260, opacity: 0.08, duration: 20000 },
    ],
    [height],
  );
  return (
    <>
      {layers.map((layer, index) => (
        <CloudDriftShape key={index} {...layer} color={color} haze={haze} enabled={enabled} reverse={index % 2 === 1} />
      ))}
    </>
  );
}

function CloudDriftShape({
  top,
  width,
  opacity,
  duration,
  enabled,
  reverse,
  color,
  haze,
}: {
  top: number;
  width: number;
  opacity: number;
  duration: number;
  enabled: boolean;
  reverse: boolean;
  color: string;
  haze: boolean;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) {
      progress.stopAnimation();
      return;
    }
    progress.setValue(0);
    const cancel = startRepeating(
      () => Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
        Animated.timing(progress, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      ]),
    );
    return () => {
      cancel();
      progress.stopAnimation();
    };
  }, [duration, enabled, progress]);

  const outputRange = reverse ? [60, -60] : [-60, 60];
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange });

  return (
    <Animated.View
      style={[
        styles.cloud,
        { top, left: reverse ? "30%" : "5%", width: haze ? width * 2 : width, height: width * (haze ? 0.12 : 0.42), opacity, transform: [{ translateX }] },
      ]}
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: color, borderRadius: width }]} />
      {!haze ? <>
        <View style={{ position: "absolute", backgroundColor: color, width: width * 0.48, height: width * 0.48, borderRadius: width, top: -width * 0.18, left: width * 0.16 }} />
        <View style={{ position: "absolute", backgroundColor: color, width: width * 0.36, height: width * 0.36, borderRadius: width, top: -width * 0.09, right: width * 0.12 }} />
      </> : null}
    </Animated.View>
  );
}

type RainParticleSpec = { left: number; startPhase: number; duration: number; tilt: number };

function RainDropsLayer({
  height,
  color,
  count,
  enabled,
  intense = false,
}: {
  height: number;
  color: string;
  count: number;
  enabled: boolean;
  intense?: boolean;
}) {
  const dropBand = Math.max(height, 220);
  const particles = useMemo<RainParticleSpec[]>(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        startPhase: Math.random(),
        duration: 900 + Math.random() * (intense ? 500 : 800),
        tilt: intense ? 6 : 3,
      })),
    [count, intense],
  );
  const dropOpacity = intense ? 0.2 : 0.15;
  return (
    <>
      {particles.map((particle, index) => (
        <RainDrop key={index} band={dropBand} color={color} opacity={dropOpacity} particle={particle} enabled={enabled} />
      ))}
    </>
  );
}

function RainDrop({
  band,
  color,
  opacity,
  particle,
  enabled,
}: {
  band: number;
  color: string;
  opacity: number;
  particle: RainParticleSpec;
  enabled: boolean;
}) {
  const progress = useRef(new Animated.Value(particle.startPhase)).current;

  useEffect(() => {
    if (!enabled) {
      progress.stopAnimation();
      return;
    }
    const cancel = startRepeating(
      () => Animated.timing(progress, { toValue: 1, duration: particle.duration, easing: Easing.linear, useNativeDriver: true, isInteraction: false }),
      () => progress.setValue(0),
    );
    return () => {
      cancel();
      progress.stopAnimation();
    };
  }, [enabled, particle.duration, progress]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-24, band] });
  const dropOpacity = progress.interpolate({ inputRange: [0, 0.08, 0.85, 1], outputRange: [0, opacity, opacity, 0] });

  return (
    <Animated.View
      style={[
        styles.rainDrop,
        {
          left: `${particle.left}%`,
          backgroundColor: color,
          opacity: dropOpacity,
          transform: [{ translateY }, { rotate: `${particle.tilt}deg` }],
        },
      ]}
    />
  );
}

type SnowParticleSpec = { left: number; startPhase: number; duration: number; size: number; sway: number };

function SnowFlakesLayer({ height, count, enabled, color }: { height: number; count: number; enabled: boolean; color: string }) {
  const band = Math.max(height, 220);
  const particles = useMemo<SnowParticleSpec[]>(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        startPhase: Math.random(),
        duration: 5000 + Math.random() * 4000,
        size: 3 + Math.random() * 3,
        sway: 8 + Math.random() * 10,
      })),
    [count],
  );
  const peakOpacity = 0.3;
  return (
    <>
      {particles.map((particle, index) => (
        <SnowFlake key={index} band={band} particle={particle} enabled={enabled} peakOpacity={peakOpacity} color={color} />
      ))}
    </>
  );
}

function SnowFlake({ band, particle, enabled, peakOpacity, color }: { band: number; particle: SnowParticleSpec; enabled: boolean; peakOpacity: number; color: string }) {
  const fall = useRef(new Animated.Value(particle.startPhase)).current;
  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) {
      fall.stopAnimation();
      sway.stopAnimation();
      return;
    }
    const cancelFall = startRepeating(
      () => Animated.timing(fall, { toValue: 1, duration: particle.duration, easing: Easing.linear, useNativeDriver: true, isInteraction: false }),
      () => fall.setValue(0),
    );
    const cancelSway = startRepeating(() =>
      Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
        Animated.timing(sway, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      ]),
    );
    return () => {
      cancelFall();
      cancelSway();
      fall.stopAnimation();
      sway.stopAnimation();
    };
  }, [enabled, fall, particle.duration, sway]);

  const translateY = fall.interpolate({ inputRange: [0, 1], outputRange: [-10, band] });
  const translateX = sway.interpolate({ inputRange: [0, 1], outputRange: [-particle.sway, particle.sway] });
  const flakeOpacity = fall.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, peakOpacity, peakOpacity, 0] });

  return (
    <Animated.View
      style={[
        styles.snowFlake,
        {
          left: `${particle.left}%`,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          opacity: flakeOpacity,
          backgroundColor: color,
          transform: [{ translateY }, { translateX }],
        },
      ]}
    />
  );
}

type StarSpec = { left: number; top: number; startPhase: number; duration: number; size: number };

function StarTwinkleLayer({ height, count, enabled, color }: { height: number; count: number; enabled: boolean; color: string }) {
  const stars = useMemo<StarSpec[]>(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        top: Math.random() * height * 0.75,
        startPhase: Math.random(),
        duration: 4000 + Math.random() * 4000,
        size: 1.5 + Math.random() * 1.5,
      })),
    [count, height],
  );
  return (
    <>
      {stars.map((star, index) => (
        <Star key={index} star={star} enabled={enabled} color={color} />
      ))}
    </>
  );
}

function Star({ star, enabled, color }: { star: StarSpec; enabled: boolean; color: string }) {
  const twinkle = useRef(new Animated.Value(star.startPhase)).current;

  useEffect(() => {
    if (!enabled) {
      twinkle.stopAnimation();
      return;
    }
    const cancel = startRepeating(() =>
      Animated.sequence([
        Animated.timing(twinkle, { toValue: 1, duration: star.duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
        Animated.timing(twinkle, { toValue: 0, duration: star.duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      ]),
    );
    return () => {
      cancel();
      twinkle.stopAnimation();
    };
  }, [enabled, star.duration, twinkle]);

  const opacity = twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.75] });

  return (
    <Animated.View
      style={[
        styles.star,
        { backgroundColor: color, left: `${star.left}%`, top: star.top, width: star.size, height: star.size, borderRadius: star.size / 2, opacity },
      ]}
    />
  );
}

function LightningFlashLayer({ enabled }: { enabled: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleFlash = () => {
      const wait = 8000 + Math.random() * 12000;
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.035, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true, isInteraction: false }),
          Animated.timing(opacity, { toValue: 0, duration: 1600, easing: Easing.in(Easing.quad), useNativeDriver: true, isInteraction: false }),
        ]).start(() => {
          if (!cancelled) scheduleFlash();
        });
      }, wait);
    };
    scheduleFlash();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      opacity.stopAnimation();
      opacity.setValue(0);
    };
  }, [enabled, opacity]);

  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.flash, { opacity }]} />;
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },
  gradientTop: {
    bottom: "48%",
    opacity: 0.72,
  },
  gradientBottom: {
    top: "42%",
    opacity: 0.52,
  },
  gradientOrb: {
    position: "absolute",
    borderRadius: 999,
  },
  gradientOrbLarge: {
    top: "8%",
    right: "-22%",
    opacity: 0.16,
  },
  gradientOrbSmall: {
    left: "-20%",
    bottom: "-2%",
    opacity: 0.13,
  },
  glow: {
    position: "absolute",
    top: "8%",
    left: "50%",
    width: 220,
    height: 220,
    marginLeft: -110,
    borderRadius: 110,
  },
  cloud: {
    position: "absolute",
  },
  rainDrop: {
    position: "absolute",
    top: 0,
    width: 2,
    height: 16,
    borderRadius: 1,
  },
  snowFlake: {
    position: "absolute",
    top: 0,
    backgroundColor: "#FFFFFF",
  },
  star: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
  },
  flash: {
    backgroundColor: "#FFFFFF",
  },
});
