import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

export function useReducedMotion() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active) setEnabled(value);
    }).catch(() => { if (active) setEnabled(true); });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setEnabled);
    return () => { active = false; subscription.remove(); };
  }, []);
  return enabled;
}
