import React from "react";
import { Image } from "react-native";
import type { AccountProvider } from "../providers/accountAuth";

const providerAssets = {
  naver: require("../../../../assets/auth-providers/naver-icon.png"),
  line: require("../../../../assets/auth-providers/line-icon.png"),
} as const;

type ProviderBrandIconProps = {
  provider: Extract<AccountProvider, "naver" | "line">;
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
