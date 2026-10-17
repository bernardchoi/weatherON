import React from "react";
import { Platform } from "../localization/react-native";
import { triggerConfirmedSelectionHaptic } from "../utils/confirmedInteractionFeedback";

// Only a user-requested value subsequently observed in owner props earns one
// selection haptic. Rejection, reopening, same-value taps and cancellation do not.
export function useConfirmedOptionFeedback(value: string) {
  const pending = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (pending.current === null || pending.current !== value) return;
    pending.current = null;
    triggerConfirmedSelectionHaptic();
  }, [value]);
  return {
    request: (next: string) => { pending.current = Platform.OS === "ios" && next !== value ? next : null; },
    cancel: () => { pending.current = null; },
  };
}
