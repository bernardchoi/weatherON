import React from "react";
import { Image, StyleSheet, View } from "../localization/react-native";
import { ambientUiIcons } from "../ambientAssets";
import { filledV3Weather } from "../filledV3Assets";
import { homeCharacterAssets } from "../characterAssets";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";

export function OnboardingAmbientScene({ destination = false }: { destination?: boolean }) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const height = Math.min(layout.height * 0.2, destination ? 146 : 174);
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
          <Image source={weather.rain} style={[styles.sky, { left: "10%" }]} resizeMode="contain" />
          <View style={[styles.ground, { backgroundColor: theme.sky }]} />
          <Image source={homeCharacterAssets.rain} style={{ height: "96%", width: "64%" }} resizeMode="contain" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { borderRadius: 20, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  sky: { position: "absolute", top: "10%", width: "17%", height: "32%" },
  ground: { position: "absolute", bottom: "6%", width: "34%", height: "8%", borderRadius: 100, opacity: 0.14 },
  endpoint: { alignItems: "center", gap: 6 },
  weather: { width: 56, height: 56 },
  marker: { width: 26, height: 26 },
  route: { width: "30%", marginTop: 60, borderTopWidth: 2, borderStyle: "dashed" },
});
