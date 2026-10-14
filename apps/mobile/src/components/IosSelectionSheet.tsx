import React from "react";
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "../localization/react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/AppThemeContext";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { HomePlanMaterial } from "./HomePlanMaterial";

// Reuses the existing iOS 26 UIGlassEffect manager. Older OS / missing manager /
// Reduce Transparency use HomePlanMaterial's opaque theme surface, never blur.
export function IosSelectionSheet({ visible, onClose, accessibilityLabel, children }: {
  visible: boolean; onClose: () => void; accessibilityLabel: string; children: React.ReactNode;
}) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [mounted, setMounted] = React.useState(visible);
  const progress = React.useRef(new Animated.Value(visible ? 1 : 0)).current;
  React.useEffect(() => {
    progress.stopAnimation();
    if (visible) setMounted(true);
    if (reducedMotion !== false) {
      progress.setValue(visible ? 1 : 0);
      if (!visible) setMounted(false);
      return;
    }
    const animation = Animated.timing(progress, { toValue: visible ? 1 : 0, duration: visible ? 220 : 170, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start(({ finished }) => { if (finished && !visible) setMounted(false); });
    return () => animation.stop();
  }, [visible, reducedMotion, progress]);
  if (!mounted) return null;
  return <Modal transparent visible animationType="none" onRequestClose={onClose}>
    <View style={styles.layer}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "#000000", opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.24] }) }]}>
        <Pressable accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.fill} onPress={onClose} />
      </Animated.View>
      <Animated.View accessibilityViewIsModal accessibilityLabel={accessibilityLabel} style={[styles.panel, { maxHeight: Math.max(120, height - insets.top - Math.max(insets.bottom, 12) - 24), marginBottom: Math.max(insets.bottom, 12), borderColor: theme.border, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [32, 0] }) }], opacity: progress }]}>
        <HomePlanMaterial theme={theme} />
        <View style={styles.header}>
          <View pointerEvents="none" accessible={false} style={[styles.handle, { backgroundColor: theme.subtle }]} />
          <Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={onClose} style={styles.close}><Text style={{ color: theme.clear, fontSize: 16, fontWeight: "600" }}>닫기</Text></Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content} showsVerticalScrollIndicator>
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({
  fill: { flex: 1 }, layer: { flex: 1, justifyContent: "flex-end" },
  panel: { marginHorizontal: 12, borderRadius: 24, borderWidth: 1, overflow: "hidden", flexShrink: 1 },
  header: { minHeight: 48, alignItems: "center", justifyContent: "center" },
  handle: { width: 36, height: 4, borderRadius: 2, opacity: 0.45 },
  close: { position: "absolute", right: 8, minWidth: 56, minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  content: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
});
