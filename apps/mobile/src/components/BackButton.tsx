import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "../theme/AppThemeContext";
import { androidMaterialRipple, androidMaterialSurface } from "../theme/androidMaterial";
import { iosGlassSurface } from "../theme/iosGlass";
import { radius, semanticColor } from "../theme/tokens";
import { FeedbackPressable } from "./FeedbackPressable";

type BackButtonProps = {
  onPress: () => void;
  accessibilityLabel?: string;
};

// 앱 전역 뒤로가기 버튼의 유일한 구현. 예전엔 화면마다 크기·모서리·글리프(텍스트 "‹" vs 벡터 화살표)가
// 제각각이라 화면을 넘나들 때마다 버튼 모양이 바뀌었다. 이 컴포넌트 하나로 통일한다.
export function BackButton({ onPress, accessibilityLabel = "뒤로" }: BackButtonProps) {
  const theme = useAppTheme();
  const glassSurface = iosGlassSurface(theme, "control");
  return (
    <FeedbackPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      android_ripple={androidMaterialRipple(theme)}
      onPress={onPress}
      style={[styles.backButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }, androidMaterialSurface(theme, "iconButton"), glassSurface]}
    >
      {glassSurface ? <View pointerEvents="none" style={[styles.glassShine, { backgroundColor: semanticColor(theme, "glassHighlight") }]} /> : null}
      <ChevronLeft color={theme.text} />
    </FeedbackPressable>
  );
}

function ChevronLeft({ color }: { color: string }) {
  return (
    <View style={styles.chevronLeft} accessibilityElementsHidden>
      <View style={[styles.chevronLeftTop, { backgroundColor: color }]} />
      <View style={[styles.chevronLeftBottom, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
    overflow: "hidden",
  },
  glassShine: {
    position: "absolute",
    left: 8,
    right: 8,
    top: 6,
    height: 1,
    borderRadius: 1,
  },
  chevronLeft: {
    width: 16,
    height: 16,
    justifyContent: "center",
  },
  chevronLeftTop: {
    position: "absolute",
    left: 4,
    width: 9,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }, { translateY: -3 }],
  },
  chevronLeftBottom: {
    position: "absolute",
    left: 4,
    width: 9,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }, { translateY: 3 }],
  },
});
