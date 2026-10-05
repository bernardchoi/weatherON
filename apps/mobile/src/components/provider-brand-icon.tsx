import React from "react";
import { Image } from "../localization/react-native";

const providerAssets = {
  google: require("../../../../assets/auth-providers/google-g.png"),
  naver: require("../../../../assets/auth-providers/naver-mark.png"),
  kakao: require("../../../../assets/auth-providers/kakao-symbol.png"),
  line: require("../../../../assets/auth-providers/line-icon.png"),
} as const;

type ProviderBrandIconProps = {
  provider: keyof typeof providerAssets;
  size?: number;
  disabled?: boolean;
};

export function ProviderBrandIcon({ provider, size = 24, disabled = false }: ProviderBrandIconProps) {
  // LINE's official canvas contains clear space: 98 of its 132 pixels are the bubble.
  const canvasSize = provider === "line" ? size * 132 / 98 : size;
  return (
    <Image
      source={providerAssets[provider]}
      style={{ width: canvasSize, height: canvasSize, ...(provider === "line" && disabled ? { tintColor: "rgba(30,30,30,0.2)" } : {}) }}
      resizeMode="contain"
      accessible={false}
      accessibilityIgnoresInvertColors
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
