import React from "react";
import { Animated, Easing, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "../localization/react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/AppThemeContext";
import { equalReservedRegions, resolveReservedContentRegion, type ReservedRegion } from "../theme/reservedRegionLayout";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { HomePlanMaterial } from "./HomePlanMaterial";
import { ReservedRegionObserver } from "./ReservedRegionObserver";

// Reuses the existing iOS 26 UIGlassEffect manager. Older OS / missing manager /
// Reduce Transparency use HomePlanMaterial's opaque theme surface, never blur.
export function IosSelectionSheet({ visible, onClose, accessibilityLabel, children }: {
  visible: boolean; onClose: () => void; accessibilityLabel: string; children: React.ReactNode;
}) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [reservedRegions, setReservedRegions] = React.useState<ReservedRegion[]>([]);
  const reservedContentRegion = resolveReservedContentRegion(width, height, reservedRegions);
  const bottomReserve = Math.max(insets.bottom, 12);
  const availableLeft = Math.max(insets.left, reservedContentRegion.x);
  const availableRight = Math.min(width - insets.right, reservedContentRegion.x + reservedContentRegion.width);
  const availableTop = Math.max(insets.top, reservedContentRegion.y);
  const availableBottom = Math.min(height - bottomReserve, reservedContentRegion.y + reservedContentRegion.height);
  const panelWidth = Math.max(0, availableRight - availableLeft - 24);
  const panelCenterX = (availableLeft + availableRight) / 2;
  const panelMaxHeight = Math.max(120, availableBottom - availableTop - 24);
  const panelBottomMargin = Math.max(bottomReserve, height - availableBottom);
  const handleReservedRegionsChange = React.useCallback((nextRegions: ReservedRegion[]) => {
    setReservedRegions((currentRegions) => equalReservedRegions(currentRegions, nextRegions) ? currentRegions : nextRegions);
  }, []);
  const [mounted, setMounted] = React.useState(visible);
  const [panelHeight, setPanelHeight] = React.useState(height);
  const travel = panelHeight + Math.max(insets.bottom, 12) + 2;
  const progress = React.useRef(new Animated.Value(0)).current;
  const phase = React.useRef<"closed" | "opening" | "open" | "dragging" | "closing">("closed");
  // Some callers clear their filter/content as soon as visible becomes false.
  // Keep the outgoing tree and its geometry intact until native exit completes.
  const content = React.useRef({ children, accessibilityLabel });
  if (visible && phase.current !== "closing") content.current = { children, accessibilityLabel };
  const presented = React.useRef(false);
  const generation = React.useRef(0);
  const latest = React.useRef({ visible, onClose, reducedMotion, travel });
  latest.current = { visible, onClose, reducedMotion, travel };

  const settle = React.useCallback((open: boolean, notify = false) => {
    const token = ++generation.current;
    progress.stopAnimation();
    phase.current = open ? "opening" : "closing";
    const complete = () => {
      if (token !== generation.current) return;
      phase.current = open ? "open" : "closed";
      if (!open) {
        presented.current = false;
        setMounted(false);
        // Defer parent work until the panel has completely left the screen.
        if (notify) latest.current.onClose();
      }
    };
    if (latest.current.reducedMotion !== false) {
      progress.setValue(open ? 1 : 0);
      complete();
      return;
    }
    Animated.timing(progress, {
      toValue: open ? 1 : 0, duration: open ? 240 : 260,
      easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => { if (finished) complete(); });
  }, [progress]);
  const dismiss = React.useCallback(() => {
    if (phase.current === "closing" || phase.current === "closed") return;
    settle(false, true);
  }, [settle]);

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      if (presented.current) settle(true);
      // First presentation starts in onShow, after native Modal is ready.
    } else if (phase.current !== "closed") {
      settle(false);
    }
  }, [visible, reducedMotion, settle]);
  React.useEffect(() => () => {
    ++generation.current;
    progress.stopAnimation();
  }, [progress]);

  const pan = React.useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) =>
      phase.current === "open" && gesture.dy > 6 && gesture.dy > Math.abs(gesture.dx),
    onPanResponderGrant: () => {
      ++generation.current;
      progress.stopAnimation();
      phase.current = "dragging";
    },
    onPanResponderMove: (_, gesture) => {
      if (phase.current !== "dragging" || latest.current.reducedMotion !== false) return;
      // No React state updates while tracking the finger. Settle runs natively.
      progress.setValue(1 - Math.min(1, Math.max(0, gesture.dy) / latest.current.travel));
    },
    onPanResponderRelease: (_, gesture) => {
      if (phase.current !== "dragging") return;
      const threshold = Math.min(120, latest.current.travel * 0.25);
      if (gesture.dy >= threshold || (gesture.dy > 12 && gesture.vy > 0.8)) dismiss();
      else settle(true);
    },
    onPanResponderTerminate: () => { if (phase.current === "dragging") settle(true); },
    onPanResponderTerminationRequest: () => true,
  }), [dismiss, progress, settle]);
  if (!mounted) return null;
  return <Modal transparent visible animationType="none" onRequestClose={dismiss} onShow={() => {
    presented.current = true;
    if (latest.current.visible && phase.current !== "closing") settle(true);
  }}>
    <View style={styles.layer}>
      <ReservedRegionObserver onRegionsChange={handleReservedRegionsChange} />
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "#000000", opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.24] }) }]}>
        <Pressable accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.fill} onPress={dismiss} />
      </Animated.View>
      {/* Keep native glass ancestors at full alpha; fade only the separate scrim. */}
      <Animated.View onLayout={event => { if (phase.current !== "closing") setPanelHeight(event.nativeEvent.layout.height); }} onAccessibilityEscape={dismiss} accessibilityViewIsModal accessibilityLabel={content.current.accessibilityLabel} style={[styles.panel, { width: panelWidth, maxWidth: 560, maxHeight: panelMaxHeight, marginBottom: panelBottomMargin, borderColor: theme.border, transform: [{ translateX: panelCenterX - width / 2 }, { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [travel, 0] }) }] }]}>
        <HomePlanMaterial theme={theme} />
        <View style={styles.header}>
          <View pointerEvents="none" accessible={false} style={[styles.handle, { backgroundColor: theme.subtle }]} />
          <View {...pan.panHandlers} testID="selection-sheet-drag-handle" accessible={false} style={styles.dragHandle} />
          <Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={dismiss} style={styles.close}><Text style={{ color: theme.clear, fontSize: 16, fontWeight: "600" }}>닫기</Text></Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets contentContainerStyle={styles.content} showsVerticalScrollIndicator>
          {content.current.children}
        </ScrollView>
      </Animated.View>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({
  fill: { flex: 1 }, layer: { flex: 1, justifyContent: "flex-end" },
  panel: { alignSelf: "center", borderRadius: 24, borderWidth: 1, overflow: "hidden", flexShrink: 1 },
  header: { minHeight: 48, alignItems: "center", justifyContent: "center" },
  dragHandle: { position: "absolute", left: 0, top: 0, bottom: 0, right: 72 },
  handle: { width: 36, height: 4, borderRadius: 2, opacity: 0.45 },
  close: { position: "absolute", right: 8, minWidth: 56, minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  content: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
});
