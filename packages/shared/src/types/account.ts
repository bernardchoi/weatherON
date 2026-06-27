export type AccountConsentState = {
  accountLinked: boolean;
  provider?: "kakao" | "naver" | "line" | "apple" | "google" | "email";
  termsRequiredAccepted: boolean;
  marketingAccepted: boolean;
  locationPermission: "unknown" | "granted" | "denied";
  pushPermission: "unknown" | "granted" | "denied";
  adConsentStatus: "unknown" | "accepted" | "declined";
};

export const guestConsentState: AccountConsentState = {
  accountLinked: false,
  termsRequiredAccepted: false,
  marketingAccepted: false,
  locationPermission: "unknown",
  pushPermission: "unknown",
  adConsentStatus: "unknown",
};
