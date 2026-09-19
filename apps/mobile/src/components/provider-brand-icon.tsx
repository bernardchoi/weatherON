import React from "react";
import { Image } from "../localization/react-native";
import type { AccountProvider } from "../providers/accountAuth";

const providerAssets = {
  google: require("../../../../assets/auth-providers/google-icon-ios.png"),
  naver: require("../../../../assets/auth-providers/naver-icon.png"),
  line: require("../../../../assets/auth-providers/line-icon.png"),
} as const;

type ProviderBrandIconProps = {
  provider: Extract<AccountProvider, "google" | "naver" | "line">;
  size?: number;
};

export function ProviderBrandIcon({ provider, size = 24 }: ProviderBrandIconProps) {
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
