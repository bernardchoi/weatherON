import React from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "../localization/react-native";
import { useAppTheme } from "../theme/AppThemeContext";
import { HomePlanMaterial } from "./HomePlanMaterial";

// One native material per functional group. The material never owns touches or focus.
export function AmbientControlSurface({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useAppTheme();
  if (Platform.OS !== "ios") return <>{children}</>;
  return <View style={[styles.surface, style]}>
    <HomePlanMaterial theme={theme} />
    {children}
  </View>;
}
const styles = StyleSheet.create({ surface: { borderRadius: 24, padding: 12, gap: 8 } });
