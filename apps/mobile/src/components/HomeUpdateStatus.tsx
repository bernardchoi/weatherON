import { ambientMotion } from "../theme/ambientMotion";
import React, { useEffect, useRef, useState } from "react";
import { Animated, AppState, Easing, Platform, Pressable, Text, View } from "../localization/react-native";
import { useReducedMotion } from "../hooks/useReducedMotion";

/** A persistent text slot; only actual, sustained work gets a moving indicator. */
export function HomeUpdateStatus({ label, pending, color, testID, onRetry, active = true }: { label: string; pending: boolean; color: string; testID?: string; active?: boolean; onRetry?: () => void }) {
  const reducedMotion = useReducedMotion();
  const [sustained, setSustained] = useState(false);
  const [foreground, setForeground] = useState(AppState.currentState === "active");
  const motionActive = active && foreground;
  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => setForeground(state === "active"));
    return () => subscription.remove();
  }, []);
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    setSustained(false);
    if (!pending || !motionActive) return;
    const timer = setTimeout(() => setSustained(true), ambientMotion.busyDelay);
    return () => clearTimeout(timer);
  }, [pending, motionActive]);
  useEffect(() => {
    pulse.stopAnimation(); pulse.setValue(1);
    if (!pending || !sustained || !motionActive || reducedMotion !== false) return;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 0.35, duration: ambientMotion.busyPulse, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: ambientMotion.busyPulse, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [pending, sustained, motionActive, reducedMotion, pulse]);
  // Do not announce each partial response or timestamp. The final label remains
  // readable by VoiceOver/TalkBack without repeated automatic interruptions.
  return <View testID={testID} accessibilityState={{ busy: pending }} style={{ minHeight: 24, flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
    <Animated.View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 5, height: 5, borderRadius: 3, marginTop: 8, backgroundColor: color, opacity: pending && sustained ? pulse : 0.4 }} />
    {onRetry ? <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onRetry} style={{ flex: 1, minHeight: 44, justifyContent: "center" }}>
      <Text style={{ color, fontSize: Platform.OS === "ios" ? 12 : 13, lineHeight: 20 }}>{label} ›</Text>
    </Pressable> : <Text style={{ flex: 1, flexShrink: 1, color, fontSize: Platform.OS === "ios" ? 12 : 13, lineHeight: 20 }}>{label}</Text>}
  </View>;
}
