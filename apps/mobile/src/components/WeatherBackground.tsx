import React, { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, AppState, Easing, StyleSheet, View, useWindowDimensions } from "react-native";
import type { WeatherCondition } from "@weatheron/shared";
import type { AppTheme } from "../theme/tokens";

// docs/planning/WeatherON_planning_v5.html §20 "날씨 다이나믹 배경 애니메이션 — 홈(H1)"
// 네이티브 gradient 모듈 없이 RN View 레이어로 6종 배경색 + 상태별 모션을 구성한다.
// 라이트 모드는 동일 모티프를 유지하되 각 색상을 흰색 쪽으로 리틴트한다(스펙 "색·opacity만 리틴트" 지침).
type MotionState = "clear" | "cloud" | "rain" | "snow" | "storm" | "night";

const DARK_GRADIENTS: Record<Exclude<MotionState, "night">, [string, string, string]> = {
  clear: ["#0B1E3D", "#1A3A6B", "#2D5FA6"],
  cloud: ["#1A2A3A", "#2D4A5E", "#4A7090"],
  rain: ["#0D1F2D", "#1B3A52", "#2E6080"],
  snow: ["#E8F4F8", "#C8E4F0", "#A8CCDF"],
  storm: ["#2A1A3A", "#4A2A6B", "#6B3A8A"],
};
const NIGHT_GRADIENT: [string, string, string] = ["#060E1F", "#0D1E3A", "#122040"];

const LIGHT_RETINT_RATIO = 0.8;

type Props = {
  condition: WeatherCondition | string;
  theme: AppTheme;
  // "scene": 그라디언트 배경 + 전체 화면 파티클(카드 뒤에 깔림).
  // "overlay": 배경 없이 옅은 파티클만 — 카드 위에 얹어 iOS 날씨앱처럼 "비가 화면 앞을 지나가는" 느낌을 준다.
  variant?: "scene" | "overlay";
};

// iOS 27 날씨앱처럼 날씨 모션이 화면 전체를 채우도록, 파티클(비·눈·별)을 상단 1/3이 아니라
// 화면 전체 높이에 걸쳐 떨어뜨린다. 카드가 불투명이라 카드 뒤 파티클은 카드 사이 여백에서만 보이고,
// 추가로 variant="overlay" 레이어를 카드 위에 얹으면 비가 UI 앞을 가로지르는 것처럼 보인다.
export function WeatherBackground({ condition, theme, variant = "scene" }: Props) {
  const { height: windowHeight } = useWindowDimensions();
  const isNight = useIsNightHour();
  const enabled = useAnimationEnabled();
  const motionState = resolveMotionState(condition, isNight);
  const gradientColors = useMemo(() => resolveGradient(motionState, theme.name), [motionState, theme.name]);
  const fullBand = Math.max(windowHeight, 320);

  if (variant === "overlay") {
    // 카드 위에 얹히는 전경 레이어: 비/폭풍/눈에만, 성긴 밀도·낮은 대비로 가독성을 해치지 않게.
    return (
      <View pointerEvents="none" style={styles.wrap}>
        {motionState === "rain" ? <RainDropsLayer height={fullBand} color={theme.sky} count={26} enabled={enabled} foreground /> : null}
        {motionState === "storm" ? <RainDropsLayer height={fullBand} color={theme.sky} count={38} enabled={enabled} intense foreground /> : null}
        {motionState === "snow" ? <SnowFlakesLayer height={fullBand} count={22} enabled={enabled} foreground /> : null}
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <GradientBackdrop colors={gradientColors} />
      <View style={StyleSheet.absoluteFill}>
        {motionState === "clear" ? <GlowPulseLayer color={theme.gold} enabled={enabled} /> : null}
        {motionState === "cloud" ? <CloudDriftLayer height={windowHeight * 0.55} enabled={enabled} /> : null}
        {motionState === "rain" ? <RainDropsLayer height={fullBand} color={theme.sky} count={90} enabled={enabled} /> : null}
        {motionState === "storm" ? (
          <>
            <RainDropsLayer height={fullBand} color={theme.sky} count={120} enabled={enabled} intense />
            <LightningFlashLayer enabled={enabled} />
          </>
        ) : null}
        {motionState === "snow" ? <SnowFlakesLayer height={fullBand} count={64} enabled={enabled} /> : null}
        {motionState === "night" ? <StarTwinkleLayer height={windowHeight} count={30} enabled={enabled} /> : null}
      </View>
    </View>
  );
}

function GradientBackdrop({ colors }: { colors: [string, string, string] }) {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors[1] }]}>
      <View style={[StyleSheet.absoluteFill, styles.gradientTop, { backgroundColor: colors[0] }]} />
      <View style={[StyleSheet.absoluteFill, styles.gradientBottom, { backgroundColor: colors[2] }]} />
      <View style={[styles.gradientOrb, styles.gradientOrbLarge, { backgroundColor: colors[0] }]} />
      <View style={[styles.gradientOrb, styles.gradientOrbSmall, { backgroundColor: colors[2] }]} />
    </View>
  );
}

function resolveMotionState(condition: WeatherCondition | string, isNight: boolean): MotionState {
  if (condition === "clear") return isNight ? "night" : "clear";
  if (condition === "rain") return "rain";
  if (condition === "storm") return "storm";
  if (condition === "snow") return "snow";
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

// 실제 일출·일몰 데이터가 아직 없어 로컬 시각 기준(19시~6시)으로 근사한다.
// TODO: 날씨 상세 화면의 일출·일몰 계산이 공용화되면 그 값으로 교체.
function useIsNightHour(): boolean {
  const [isNight, setIsNight] = useState(() => isNightHour(new Date()));
  useEffect(() => {
    const timer = setInterval(() => setIsNight(isNightHour(new Date())), 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);
  return isNight;
}

function isNightHour(date: Date): boolean {
  const hour = date.getHours();
  return hour >= 19 || hour < 6;
}

// Reduce Motion 접근성 설정과 앱 포그라운드 상태를 함께 반영해 애니메이션 on/off를 결정한다.
function useAnimationEnabled(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [active, setActive] = useState(AppState.currentState === "active");

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((value) => {
        if (mounted) setReduceMotion(value);
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener?.("reduceMotionChanged", (value) => setReduceMotion(value));
    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => setActive(state === "active"));
    return () => subscription.remove();
  }, []);

  return active && !reduceMotion;
}

function GlowPulseLayer({ color, enabled }: { color: string; enabled: boolean }) {
  const opacity = useRef(new Animated.Value(0.1)).current;

  useEffect(() => {
    if (!enabled) {
      opacity.stopAnimation();
      opacity.setValue(0.1);
      return;
    }
    const cancel = startRepeating(() =>
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.16, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    return () => {
      cancel();
      opacity.stopAnimation();
    };
  }, [enabled, opacity]);

  return (
    <Animated.View
      style={[styles.glow, { backgroundColor: color, opacity }]}
    />
  );
}

function CloudDriftLayer({ height, enabled }: { height: number; enabled: boolean }) {
  const layers = useMemo(
    () => [
      { top: height * 0.14, width: 220, opacity: 0.09, duration: 72000 },
      { top: height * 0.32, width: 170, opacity: 0.06, duration: 88000 },
      { top: height * 0.5, width: 260, opacity: 0.07, duration: 64000 },
    ],
    [height],
  );
  return (
    <>
      {layers.map((layer, index) => (
        <CloudDriftShape key={index} {...layer} enabled={enabled} reverse={index % 2 === 1} />
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
}: {
  top: number;
  width: number;
  opacity: number;
  duration: number;
  enabled: boolean;
  reverse: boolean;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) {
      progress.stopAnimation();
      return;
    }
    progress.setValue(0);
    const cancel = startRepeating(
      () => Animated.timing(progress, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
      () => progress.setValue(0),
    );
    return () => {
      cancel();
      progress.stopAnimation();
    };
  }, [duration, enabled, progress]);

  const outputRange = reverse ? [width, -width] : [-width, width];
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange });

  return (
    <Animated.View
      style={[
        styles.cloud,
        { top, width, height: width * 0.42, borderRadius: width * 0.21, opacity, transform: [{ translateX }] },
      ]}
    />
  );
}

type RainParticleSpec = { left: number; startPhase: number; duration: number; tilt: number };

function RainDropsLayer({
  height,
  color,
  count,
  enabled,
  intense = false,
  foreground = false,
}: {
  height: number;
  color: string;
  count: number;
  enabled: boolean;
  intense?: boolean;
  foreground?: boolean;
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
  // 카드 위에 얹히는 전경 레이어는 가독성을 위해 더 옅게.
  const dropOpacity = foreground ? 0.1 : intense ? 0.2 : 0.15;
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
      () => Animated.timing(progress, { toValue: 1, duration: particle.duration, easing: Easing.linear, useNativeDriver: true }),
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

function SnowFlakesLayer({ height, count, enabled, foreground = false }: { height: number; count: number; enabled: boolean; foreground?: boolean }) {
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
  const peakOpacity = foreground ? 0.14 : 0.22;
  return (
    <>
      {particles.map((particle, index) => (
        <SnowFlake key={index} band={band} particle={particle} enabled={enabled} peakOpacity={peakOpacity} />
      ))}
    </>
  );
}

function SnowFlake({ band, particle, enabled, peakOpacity }: { band: number; particle: SnowParticleSpec; enabled: boolean; peakOpacity: number }) {
  const fall = useRef(new Animated.Value(particle.startPhase)).current;
  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) {
      fall.stopAnimation();
      sway.stopAnimation();
      return;
    }
    const cancelFall = startRepeating(
      () => Animated.timing(fall, { toValue: 1, duration: particle.duration, easing: Easing.linear, useNativeDriver: true }),
      () => fall.setValue(0),
    );
    const cancelSway = startRepeating(() =>
      Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(sway, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
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
          transform: [{ translateY }, { translateX }],
        },
      ]}
    />
  );
}

type StarSpec = { left: number; top: number; startPhase: number; duration: number; size: number };

function StarTwinkleLayer({ height, count, enabled }: { height: number; count: number; enabled: boolean }) {
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
        <Star key={index} star={star} enabled={enabled} />
      ))}
    </>
  );
}

function Star({ star, enabled }: { star: StarSpec; enabled: boolean }) {
  const twinkle = useRef(new Animated.Value(star.startPhase)).current;

  useEffect(() => {
    if (!enabled) {
      twinkle.stopAnimation();
      return;
    }
    const cancel = startRepeating(() =>
      Animated.sequence([
        Animated.timing(twinkle, { toValue: 1, duration: star.duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(twinkle, { toValue: 0, duration: star.duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
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
        { left: `${star.left}%`, top: star.top, width: star.size, height: star.size, borderRadius: star.size / 2, opacity },
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
          Animated.timing(opacity, { toValue: 0.06, duration: 90, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 220, easing: Easing.in(Easing.quad), useNativeDriver: true }),
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
    ...StyleSheet.absoluteFillObject,
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
    width: 420,
    height: 420,
    opacity: 0.16,
  },
  gradientOrbSmall: {
    left: "-18%",
    bottom: "2%",
    width: 360,
    height: 360,
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
    backgroundColor: "#FFFFFF",
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
