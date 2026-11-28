import React, { useContext } from "react";
import { Image, Linking, Pressable, Text, View } from "react-native";
import { LocalizationContext } from "../localization/LocalizationProvider";
import { useAppTheme } from "../theme/AppThemeContext";
import { isGoogleProvider } from "../utils/googleMapsContent";

const googleMarks = {
  light: require("../../assets/providers/google-maps-light.png"),
  dark: require("../../assets/providers/google-maps-dark.png"),
};
const appleMarks = {
  light: require("../../assets/providers/apple-weather-light.png"),
  dark: require("../../assets/providers/apple-weather-dark.png"),
};
const modificationNotice = {
  ko: "Apple 날씨 데이터를 가공한 추천입니다.",
  ja: "Appleの気象データを加工したおすすめです。",
  en: "Recommendations use modified Apple Weather data.",
};

export function GoogleMapsAttribution({ provider }: { provider?: string }) {
  const theme = useAppTheme();
  if (!isGoogleProvider(provider)) return null;
  return (
    <View style={{ alignSelf: "flex-start", padding: 6 }}>
      <Image accessible accessibilityLabel="Google Maps" resizeMode="contain"
        source={googleMarks[theme.name]} style={{ width: 98, height: 18 }} />
    </View>
  );
}

export function AppleWeatherAttribution({ source, modified = false }: { source?: string; modified?: boolean }) {
  const theme = useAppTheme();
  const { language } = useContext(LocalizationContext);
  if (source !== "weatherkit") return null;
  return (
    <View style={{ alignSelf: "flex-start" }}>
      <Pressable accessibilityRole="link" accessibilityLabel="Apple Weather"
        onPress={() => { void Linking.openURL("https://developer.apple.com/weatherkit/data-source-attribution/"); }}
        style={{ alignSelf: "flex-start", minHeight: 44, justifyContent: "center", paddingHorizontal: 4 }}>
        <Image resizeMode="contain" source={appleMarks[theme.name]} style={{ width: 88, height: 16 }} />
      </Pressable>
      {modified && <Text style={{ color: theme.muted, fontSize: 12 }}>
        {modificationNotice[language === "ko" || language === "ja" ? language : "en"]}
      </Text>}
    </View>
  );
}
