import type { AccountProvider } from "./accountAuth";

export type AccountRegion = "KR" | "JP" | "GLOBAL";

export function resolveAccountRegion(options: { locale?: string; timeZone?: string } = {}): AccountRegion {
  const locale = (options.locale ?? Intl.DateTimeFormat().resolvedOptions().locale ?? "").replace("_", "-");
  const timeZone = options.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  const parts = locale.split("-");
  const language = parts[0]?.toLowerCase();
  const region = parts.find((part, index) => index > 0 && /^[A-Za-z]{2}$/.test(part))?.toUpperCase();
  if (region === "KR") return "KR";
  if (region === "JP") return "JP";
  if (language === "ko") return "KR";
  if (language === "ja") return "JP";
  if (timeZone === "Asia/Seoul") return "KR";
  if (timeZone === "Asia/Tokyo") return "JP";
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
