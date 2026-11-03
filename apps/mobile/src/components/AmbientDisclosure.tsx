import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "../localization/react-native";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { ambientMotion } from "../theme/ambientMotion";

/** The header stays outside; only this measured content track opens/closes. */
export function AmbientDisclosure({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  const [contentHeight, setContentHeight] = useState(0);
  const measured = useRef(false);
  const height = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  useEffect(() => {
    height.stopAnimation(); opacity.stopAnimation();
    if (!contentHeight) return;
    if (reducedMotion !== false) {
      height.setValue(visible ? contentHeight : 0); opacity.setValue(visible ? 1 : 0);
      return;
    }
    const duration = visible ? ambientMotion.disclosureOpen : ambientMotion.disclosureClose;
    const animation = Animated.parallel([
      // Layout needs the JS driver, bounded to this small content track.
      Animated.timing(height, { toValue: visible ? contentHeight : 0, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(opacity, { toValue: visible ? 1 : 0, duration, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [visible, contentHeight, reducedMotion, height, opacity]);
  // Retain the content for measurement and interrupted reversals. Closed content
  // cannot take touches/focus. No max-height cap or scale can clip large type.
  return <Animated.View pointerEvents={visible ? "auto" : "none"} accessibilityElementsHidden={!visible} importantForAccessibility={visible ? "auto" : "no-hide-descendants"} style={{ overflow: "hidden", height: !measured.current && visible ? undefined : height, opacity }}>
    <View style={{ flexShrink: 0 }} onLayout={event => {
      const next = Math.ceil(event.nativeEvent.layout.height);
      if (!Number.isFinite(next) || next <= 0) return;
      if (!measured.current && visible) height.setValue(next);
      measured.current = true;
      setContentHeight(previous => previous === next ? previous : next);
    }}>{children}</View>
  </Animated.View>;
}
