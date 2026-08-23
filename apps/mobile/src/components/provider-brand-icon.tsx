import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { AccountProvider } from "../providers/accountAuth";

const providerAssets = {
  kakao: require("../../../../assets/auth-providers/kakao-login-ko.png"),
  naver: require("../../../../assets/auth-providers/naver-icon.png"),
  line: require("../../../../assets/auth-providers/line-icon.png"),
  google: require("../../../../assets/auth-providers/google-icon-ios.png"),
} as const;

type ProviderBrandIconProps = {
  provider: AccountProvider;
  size?: number;
  appleColor?: string;
};

export function ProviderBrandIcon({ provider, size = 24, appleColor = "#000000" }: ProviderBrandIconProps) {
  if (provider === "apple") {
    return <Text accessibilityElementsHidden style={[styles.appleMark, { color: appleColor, fontSize: size * 1.15, lineHeight: size * 1.2 }]}></Text>;
  }

  if (provider === "kakao") {
    // 공식 와이드 버튼에서 심볼 영역만 동일 비율로 노출해 브랜드 형태를 변형하지 않음.
    return (
      <View style={[styles.kakaoSymbol, { width: size, height: size }]} accessibilityElementsHidden>
        <Image
          source={providerAssets.kakao}
          resizeMode="stretch"
          style={[
            styles.kakaoSource,
            {
              width: size * (600 / 34),
              height: size * (90 / 34),
              left: -size * (29 / 34),
              top: -size * (28 / 34),
            },
          ]}
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  return (
    <Image
      source={providerAssets[provider]}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
      accessibilityElementsHidden
    />
  );
}

const styles = StyleSheet.create({
  appleMark: { fontWeight: "700" },
  kakaoSymbol: { overflow: "hidden" },
  kakaoSource: { position: "absolute" },
});
