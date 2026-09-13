import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const destructiveAction = /(삭제|제거|해제|지우기|로그아웃|탈퇴)/u;
const confirmAction = /(저장|등록|적용|내 옷장에 추가)/u;

export function triggerImportantActionHaptic(label?: string) {
  if (!label || (Platform.OS !== "ios" && Platform.OS !== "android")) return;
  if (destructiveAction.test(label)) {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
  } else if (confirmAction.test(label)) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
  }
}
