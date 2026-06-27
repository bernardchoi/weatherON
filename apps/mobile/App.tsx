import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { appColors } from "./src/theme/tokens";

export default function App() {
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
