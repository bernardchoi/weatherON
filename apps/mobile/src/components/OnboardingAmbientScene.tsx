import React from "react";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { Image, StyleSheet, useWindowDimensions, View } from "../localization/react-native";
import { ambientUiIcons } from "../ambientAssets";
import { filledV3Weather } from "../filledV3Assets";
import { homeCharacterAssets } from "../characterAssets";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";

export function OnboardingAmbientScene({ destination = false }: { destination?: boolean }) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const { fontScale } = useWindowDimensions();
  const compact = layout.isShort || fontScale > 1.4;
  const height = destination ? Math.min(layout.height * 0.2, 146)
    : compact ? Math.min(layout.height * 0.23, 158) : Math.min(layout.height * 0.34, 330);
  const weather = filledV3Weather.hero[theme.name];
  return (
    <View accessible accessibilityRole="image"
      accessibilityLabel={destination ? "목적지 날씨와 출발 시간 비교 예시" : "우산을 챙긴 온비"}
      style={[styles.scene, { height, backgroundColor: theme.cardMuted }]}>
      {destination ? (
        <>
          <View style={styles.endpoint}>
            <Image source={weather.sun} style={styles.weather} resizeMode="contain" />
            <Image source={ambientUiIcons.tabHome} style={[styles.marker, { tintColor: theme.text }]} />
          </View>
          <View style={[styles.route, { borderColor: theme.muted }]} />
          <View style={styles.endpoint}>
            <Image source={weather.rain} style={styles.weather} resizeMode="contain" />
            <Image source={ambientUiIcons.location} style={[styles.marker, { tintColor: theme.gold }]} />
          </View>
        </>
      ) : (
        <>
          <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden>
            <Svg width="100%" height="100%" viewBox="0 0 360 240" preserveAspectRatio="none">
              <Defs>
                <LinearGradient id="morning" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0" stopColor={theme.sky} stopOpacity={0.38} />
                  <Stop offset="1" stopColor={theme.gold} stopOpacity={0.12} />
                </LinearGradient>
              </Defs>
              <Rect width="360" height="240" fill="url(#morning)" />
              <Path d="M0 169 Q62 117 147 160 T360 137 V240 H0Z" fill={theme.sky} opacity={0.18} />
              <Path d="M0 213 V176 L24 157 L48 176 V192 H63 V170 H88 V200 H272 V162 L296 144 L320 162 V178 H342 V154 H360 V240 H0Z" fill={theme.cardMuted} opacity={0.8} />
              <Path d="M0 220 Q86 197 164 215 T360 203 V240 H0Z" fill={theme.sky} opacity={0.2} />
            </Svg>
          </View>
          <Image source={weather.rain} style={[styles.sky, { left: "10%" }]} resizeMode="contain" />
          <View style={[styles.ground, { backgroundColor: theme.sky }]} />
          <Image source={homeCharacterAssets.rain} style={{ height: "96%", width: "64%" }} resizeMode="contain" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { overflow: "hidden", borderRadius: 20, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  sky: { position: "absolute", top: "10%", width: "17%", height: "32%" },
  ground: { position: "absolute", bottom: "6%", width: "34%", height: "8%", borderRadius: 100, opacity: 0.14 },
  endpoint: { alignItems: "center", gap: 6 },
  weather: { width: 56, height: 56 },
  marker: { width: 26, height: 26 },
  route: { width: "30%", marginTop: 60, borderTopWidth: 2, borderStyle: "dashed" },
});
