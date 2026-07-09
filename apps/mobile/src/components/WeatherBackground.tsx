import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, AppState, Easing, StyleSheet, View, useWindowDimensions } from "react-native";
import type { WeatherCondition } from "@weatheron/shared";
import type { AppTheme } from "../theme/tokens";

// docs/planning/WeatherON_planning_v5.html §20 "날씨 다이나믹 배경 애니메이션 — 홈(H1)"
// 6종 그라디언트 + 상태별 모션 레이어(파티클 수·opacity·주기)를 그대로 옮긴 구현.
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
};

// 카드가 전부 불투명해 배경은 화면 상단 여백·카드 사이 여백·좌우 인셋에서만 비친다.
// 그 좁은 틈에서도 날씨가 체감되도록 전체 화면 높이를 덮는 레이어로 깔고,
// 빗줄기·눈송이·별은 스펙 지침대로 상단 1/3 대역에만 제한한다.
export function WeatherBackground({ condition, theme }: Props) {
  const { height: windowHeight } = useWindowDimensions();
  const isNight = useIsNightHour();
  const enabled = useAnimationEnabled();
  const motionState = resolveMotionState(condition, isNight);
  const gradientColors = useMemo(() => resolveGradient(motionState, theme.name), [motionState, theme.name]);
  const topBand = Math.round(windowHeight / 3);

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <LinearGradient colors={gradientColors} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={StyleSheet.absoluteFill}>
        {motionState === "clear" ? <GlowPulseLayer color={theme.gold} enabled={enabled} /> : null}
        {motionState === "cloud" ? <CloudDriftLayer height={topBand * 1.6} enabled={enabled} /> : null}
        {motionState === "rain" ? <RainDropsLayer height={topBand} color={theme.sky} count={60} enabled={enabled} /> : null}
        {motionState === "storm" ? (
          <>
            <RainDropsLayer height={topBand} color={theme.sky} count={90} enabled={enabled} intense />
            <LightningFlashLayer enabled={enabled} />
          </>
        ) : null}
        {motionState === "snow" ? <SnowFlakesLayer height={topBand} count={45} enabled={enabled} /> : null}
        {motionState === "night" ? <StarTwinkleLayer height={topBand * 1.8} count={22} enabled={enabled} /> : null}
      </View>
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
  return (
    <>
      {particles.map((particle, index) => (
        <RainDrop key={index} band={dropBand} color={color} opacity={intense ? 0.2 : 0.15} particle={particle} enabled={enabled} />
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

function SnowFlakesLayer({ height, count, enabled }: { height: number; count: number; enabled: boolean }) {
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
  return (
    <>
      {particles.map((particle, index) => (
        <SnowFlake key={index} band={band} particle={particle} enabled={enabled} />
      ))}
    </>
  );
}

function SnowFlake({ band, particle, enabled }: { band: number; particle: SnowParticleSpec; enabled: boolean }) {
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
  const flakeOpacity = fall.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 0.22, 0.22, 0] });

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
