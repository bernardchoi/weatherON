import type { AccountProvider } from "./accountAuth";

export type AccountRegion = "KR" | "JP" | "GLOBAL";
export type AccountButtonLanguage = "ko" | "ja" | "en";

export function resolveAccountButtonLanguage(locale = "en"): AccountButtonLanguage {
  const language = locale.replace("_", "-").split("-")[0]?.toLowerCase();
  if (language === "ko" || language === "ja") return language;
  return "en";
}

export function resolveAccountRegion(options: { regionCode?: string | null; locale?: string } = {}): AccountRegion {
  const locale = (options.locale ?? "").replace("_", "-");
  const localeRegion = locale.split("-").find((part, index) => index > 0 && /^[A-Za-z]{2}$/u.test(part));
  const region = (options.regionCode ?? localeRegion)?.toUpperCase();
  if (region === "KR") return "KR";
  if (region === "JP") return "JP";
  return "GLOBAL";
}

export function orderProvidersForRegion(
  region: AccountRegion,
  availableProviders: AccountProvider[],
): AccountProvider[] {
  const priority: Record<AccountRegion, AccountProvider[]> = {
    KR: ["kakao", "naver", "apple", "google", "line"],
    JP: ["line", "apple", "google", "kakao", "naver"],
    GLOBAL: ["google", "apple", "line", "kakao", "naver"],
  };
  const available = new Set(availableProviders);
  return priority[region].filter((provider) => available.has(provider));
}

export function getAccountRegionLabel(region: AccountRegion): string {
  if (region === "KR") return "한국 계정 환경에 맞춘 로그인";
  if (region === "JP") return "일본 계정 환경에 맞춘 로그인";
  return "계정 환경에 맞춘 로그인";
}
