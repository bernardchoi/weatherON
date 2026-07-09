import { useFonts } from "expo-font";
import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { applyPretendardToText, pretendardFontMap } from "./src/theme/fonts";
import { appColors } from "./src/theme/tokens";

// 폰트 로드 전에 Text 렌더 패치를 걸어 두면, 폰트가 준비되는 즉시 모든 텍스트가 Pretendard로 렌더된다.
applyPretendardToText();

export default function App() {
  const [fontsLoaded, fontError] = useFonts(pretendardFontMap);

  // 폰트 로딩이 끝나거나 실패하기 전까지는 렌더를 미뤄 시스템 폰트 → Pretendard 깜빡임을 줄인다.
  // 실패해도(fontError) 시스템 폰트로 폴백해 앱은 그대로 뜬다.
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <AppNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appColors.navy,
  },
});
