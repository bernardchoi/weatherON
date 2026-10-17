import { Platform } from "../localization/react-native";
import * as Haptics from "expo-haptics";

let lastFeedbackAt = -Infinity;
// Call only after a user-requested state transition is confirmed. UIKit owns system
// haptic availability; never substitute vibration or ask for a permission.
export function triggerConfirmedSelectionHaptic() {
  if (Platform.OS !== "ios") return;
  const now = Date.now();
  if (now - lastFeedbackAt < 250) return;
  lastFeedbackAt = now;
  void Haptics.selectionAsync().catch(() => undefined);
}
