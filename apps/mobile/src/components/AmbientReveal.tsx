import React, { createContext, forwardRef, useContext, useLayoutEffect, useRef } from "react";
import { Animated, Easing, View, type ViewProps } from "../localization/react-native";
import { ambientMotion } from "../theme/ambientMotion";

export const AmbientMotionContext = createContext({ enabled: false, motionAllowed: false, active: true, visit: 0, scene: "" });

export function useAmbientEntrance(order = 0) {
  const { enabled, active, visit } = useContext(AmbientMotionContext);
  const progress = useRef(new Animated.Value(enabled && active ? 0 : 1)).current;
  const playedVisit = useRef<number | null>(null);
  useLayoutEffect(() => {
    progress.stopAnimation();
    const firstEntry = playedVisit.current !== visit;
    if (active) playedVisit.current = visit;
    if (!enabled || !active || !firstEntry) { progress.setValue(1); return; }
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1, duration: ambientMotion.entrance, delay: order * ambientMotion.stagger,
      easing: Easing.bezier(0.3, 0.2, 0.2, 1), useNativeDriver: true, isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [active, enabled, visit, order, progress]);
  return {
    opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }),
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
  };
}

export const AmbientReveal = forwardRef<View, ViewProps & { order?: number }>(function AmbientReveal({ order, style, children, ...props }, ref) {
  const entrance = useAmbientEntrance(order);
  const context = useContext(AmbientMotionContext);
  return <Animated.View {...props} ref={ref} style={[style, entrance]}><AmbientMotionContext.Provider value={{ ...context, enabled: false }}>{children}</AmbientMotionContext.Provider></Animated.View>;
});

/** Changed values arrive immediately; only their presentation is staggered. */
export function AmbientChange({ changeKey, order = 0, style, ...props }: ViewProps & { changeKey: string; order?: number }) {
  const { motionAllowed, active } = useContext(AmbientMotionContext);
  const previous = useRef(changeKey);
  const progress = useRef(new Animated.Value(1)).current;
  useLayoutEffect(() => {
    const changed = previous.current !== changeKey;
    previous.current = changeKey;
    progress.stopAnimation();
    if (!changed || !motionAllowed || !active) { progress.setValue(1); return; }
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1, duration: ambientMotion.change, delay: order * ambientMotion.stagger,
      easing: Easing.bezier(0.3, 0.2, 0.2, 1), useNativeDriver: true, isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [changeKey, order, active, motionAllowed, progress]);
  return <Animated.View {...props} style={[style, {
    opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }),
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
  }]} />;
}
