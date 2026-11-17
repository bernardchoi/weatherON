import React, { useContext, useLayoutEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "../localization/react-native";
import { ambientMotion } from "../theme/ambientMotion";
import { AmbientMotionContext } from "./AmbientReveal";

/** Owns presentation only: requests and results never wait for this transition. */
export function HomeUpdateRegion({ visible, contentKey, children, spacing, testID }: {
  visible: boolean;
  contentKey: string;
  /** Retained copy receives false on exit so busy timers stop with real work. */
  children: (present: boolean) => React.ReactNode;
  /** Gap of the parent stack; animate it with the content to avoid a final jump. */
  spacing: number;
  testID?: string;
}) {
  // Navigation owns foreground and Reduce Motion policy (unknown is disabled).
  const { active, motionAllowed } = useContext(AmbientMotionContext);
  const [mounted, setMounted] = useState(visible);
  const [contentHeight, setContentHeight] = useState(0);
  const height = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const revision = useRef(0);
  const latest = useRef({ visible, contentKey });
  latest.current = { visible, contentKey };
  const retained = useRef<{ contentKey: string; children: typeof children | null }>({ contentKey, children });
  if (visible) retained.current = { contentKey, children };
  // A different destination must never inherit the old destination's copy.
  else if (retained.current.contentKey !== contentKey) retained.current = { contentKey, children: null };

  useLayoutEffect(() => {
    const current = ++revision.current;
    height.stopAnimation();
    opacity.stopAnimation();
    if (visible) setMounted(true);
    const targetHeight = visible ? contentHeight : 0;
    if (!motionAllowed || !active || (!visible && !mounted) || !contentHeight) {
      height.setValue(targetHeight);
      opacity.setValue(visible && contentHeight > 0 ? 1 : 0);
      if (!visible) {
        retained.current = { contentKey, children: null };
        setMounted(false);
      }
      return;
    }
    const duration = visible ? ambientMotion.disclosureOpen : ambientMotion.disclosureClose;
    const animation = Animated.parallel([
      // Only this measured card region uses the layout (JS) driver.
      Animated.timing(height, { toValue: targetHeight, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false, isInteraction: false }),
      Animated.timing(opacity, { toValue: visible ? 1 : 0, duration, easing: Easing.out(Easing.cubic), useNativeDriver: true, isInteraction: false }),
    ]);
    animation.start(({ finished }) => {
      if (finished && revision.current === current && !latest.current.visible && latest.current.contentKey === contentKey) {
        retained.current = { contentKey, children: null };
        setMounted(false);
      }
    });
    return () => {
      // Invalidate before stop(), which may invoke a completion callback.
      ++revision.current;
      animation.stop();
    };
  }, [visible, contentKey, contentHeight, mounted, motionAllowed, active, height, opacity]);

  return <Animated.View testID={testID} pointerEvents={visible ? "auto" : "none"}
    accessibilityElementsHidden={!visible} importantForAccessibility={visible ? "auto" : "no-hide-descendants"}
    style={{ overflow: "hidden", height, opacity, marginTop: -spacing }}>
    {visible || mounted ? <View style={{ position: "absolute", top: 0, left: 0, right: 0, paddingTop: spacing }} onLayout={event => {
      if (latest.current.contentKey !== contentKey) return;
      const next = Math.ceil(event.nativeEvent.layout.height);
      if (Number.isFinite(next) && next > 0) setContentHeight(previous => previous === next ? previous : next);
    }}>{visible ? children(true) : retained.current.children?.(false)}</View> : null}
  </Animated.View>;
}
