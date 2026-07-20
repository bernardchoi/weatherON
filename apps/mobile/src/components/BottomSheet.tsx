import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useAppTheme } from "../theme/AppThemeContext";
import { androidMaterialColor, androidMaterialSurface } from "../theme/androidMaterial";
import { iosGlassSurface } from "../theme/iosGlass";
import { radius, spacing } from "../theme/tokens";

// 이 화면들의 안드로이드 실기기는 제스처 내비게이션 바가 하단 화면을 60~80px 정도 가린다.
// safe-area-context 없이도 시트 콘텐츠(특히 맨 아래 확인 버튼)가 항상 손닿는 범위에 오도록
// 넉넉한 하단 여백을 고정값으로 둔다.
const GESTURE_BAR_CLEARANCE = 72;

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
};

export function BottomSheet({ visible, onClose, accessibilityLabel, children }: BottomSheetProps) {
  const theme = useAppTheme();
  const { height: windowHeight } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
      return;
    }
    Animated.timing(progress, {
      toValue: 0,
      duration: 190,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [progress, visible]);

  if (!mounted) return null;

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [360, 0] });
  const sheetGlassSurface = iosGlassSurface(theme, "sheet");
  const sheetHeaderGlassSurface = iosGlassSurface(theme, "sheetHeader");
  const grabberGlassSurface = iosGlassSurface(theme, "grabber");

  return (
    <Modal animationType="none" transparent visible={mounted} onRequestClose={onClose}>
      <View style={styles.layer}>
        <Animated.View style={[styles.scrim, { backgroundColor: androidMaterialColor(theme, "scrim"), opacity: progress }]}>
          <Pressable
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            onPress={onClose}
            style={styles.scrimTouchable}
          />
        </Animated.View>
        <Animated.View
          accessibilityLabel={accessibilityLabel}
          collapsable={false}
          style={[
            styles.panel,
            { maxHeight: windowHeight * 0.82 },
            { backgroundColor: theme.cardStrong, borderColor: theme.border, shadowColor: theme.shadow },
            androidMaterialSurface(theme, "sheet"),
            sheetGlassSurface,
            { transform: [{ translateY }] },
          ]}
        >
          {sheetHeaderGlassSurface ? (
            <View
              pointerEvents="none"
              style={[
                styles.sheetChrome,
                { borderColor: theme.name === "light" ? "rgba(255,255,255,0.6)" : "rgba(248,251,255,0.26)" },
                sheetHeaderGlassSurface,
              ]}
            >
              <View style={[styles.grabber, { backgroundColor: androidMaterialColor(theme, "outlineVariant") }, grabberGlassSurface]} />
            </View>
          ) : (
            <View style={[styles.grabber, styles.grabberDefault, { backgroundColor: androidMaterialColor(theme, "outlineVariant") }]} />
          )}
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  layer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  scrimTouchable: {
    flex: 1,
  },
  panel: {
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.lg,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 12,
  },
  sheetChrome: {
    alignSelf: "center",
    minWidth: 96,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  grabberDefault: {
    marginBottom: spacing.xs,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl + GESTURE_BAR_CLEARANCE,
  },
});
