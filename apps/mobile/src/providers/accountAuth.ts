import { fetch as expoFetch } from "expo/fetch";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";
import { getAccountRuntimeConfig } from "../config/accountEnv";
import { normalizeBaseUrl } from "../utils/httpJson";
import {
  createAppIntegrityHeaders,
  ensureAppAttestEnrollment,
  forgetIntegrityUser,
  rememberIntegrityUser,
} from "./appIntegrity";

export type AccountProvider = "apple" | "kakao" | "naver" | "line" | "google";

export type AccountProfile = {
  userId: string;
  email: string | null;
  displayName: string | null;
  provider: AccountProvider;
  termsAccepted: boolean;
  termsVersion: string | null;
  marketingAccepted: boolean;
};

export type AccountSessionResult = {
  account: AccountProfile;
  expiresAt: string;
};

export type AccountRestoreResult =
  | { status: "signed-out"; account: null }
  | { status: "authenticated"; account: AccountProfile; expiresAt: string }
  | { status: "offline"; account: null };

type AppleChallenge = {
  challengeId: string;
  nonce: string;
  state: string;
  expiresAt: string;
};

type AppleExchangeResponse = AccountSessionResult & {
  sessionToken: string;
};

type OAuthChallenge = {
  provider: Exclude<AccountProvider, "apple">;
  challengeId: string;
  state: string;
  verifier: string;
  redirectUri: string;
  authorizationUrl: string;
  expiresAt: string;
};

type OAuthExchangeResponse = AccountSessionResult & { sessionToken: string };

export type AccountProviderAvailability = { provider: Exclude<AccountProvider, "apple">; available: boolean };

const sessionTokenKey = "weatheron.account.session.v1";
const keychainService = "com.weatheron.mobile.account-session";
let volatileWebSessionToken: string | null = null;

export async function isAppleAccountSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== "ios") return false;
  const AppleAuthentication = await import("expo-apple-authentication");
  return AppleAuthentication.isAvailableAsync();
}

export async function signInWithAppleAccount(): Promise<AccountSessionResult> {
  if (Platform.OS !== "ios") {
    throw new AccountAuthError("apple_unavailable", "Apple 로그인은 현재 iOS 앱에서 사용할 수 있습니다.");
  }
  const AppleAuthentication = await import("expo-apple-authentication");
  const challenge = await accountRequest<AppleChallenge>("/auth/apple/challenge", { method: "POST" });
  const appleNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, challenge.nonce, {
    encoding: Crypto.CryptoEncoding.HEX,
  });

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: appleNonce,
      state: challenge.state,
    });
    if (!credential.identityToken || credential.state !== challenge.state) {
      throw new AccountAuthError("apple_response_invalid", "Apple 로그인 응답을 확인할 수 없습니다.");
    }

    const exchange = await accountRequest<AppleExchangeResponse>("/auth/apple/exchange", {
      method: "POST",
      body: {
        challengeId: challenge.challengeId,
        nonce: challenge.nonce,
        state: challenge.state,
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode,
        user: credential.user,
        displayName: formatAppleDisplayName(credential.fullName),
      },
    });
    await writeSessionToken(exchange.sessionToken);
    await rememberIntegrityUser(exchange.account.userId);
    await ensureAppAttestEnrollment(exchange.sessionToken, exchange.account.userId).catch((error) => {
      console.warn("App Attest enrollment deferred", error instanceof Error ? error.message : String(error));
    });
    return { account: exchange.account, expiresAt: exchange.expiresAt };
  } catch (error) {
    if (isAppleCancellation(error)) throw new AccountAuthError("apple_canceled", "Apple 로그인을 취소했습니다.");
    throw normalizeAccountError(error);
  }
}

export async function listAvailableAccountProviders(): Promise<AccountProviderAvailability[]> {
  try {
    const response = await accountRequest<{ providers: AccountProviderAvailability[] }>("/auth/providers");
    return Array.isArray(response.providers) ? response.providers.filter(isProviderAvailability) : [];
  } catch {
    return [];
  }
}

export async function signInWithOAuthAccount(
  provider: Exclude<AccountProvider, "apple">,
): Promise<AccountSessionResult> {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    throw new AccountAuthError("oauth_unavailable", "간편 로그인은 iOS와 Android 앱에서 사용할 수 있습니다.");
  }
  const redirectUri = "weatheron://oauth/callback";
  const challenge = await accountRequest<OAuthChallenge>("/auth/oauth/challenge", {
    method: "POST",
    body: { provider, redirectUri },
  });
  const WebBrowser = await import("expo-web-browser");
  const browserResult = await WebBrowser.openAuthSessionAsync(challenge.authorizationUrl, redirectUri, {
    preferEphemeralSession: true,
  });
  if (browserResult.type === "cancel" || browserResult.type === "dismiss") {
    throw new AccountAuthError("oauth_canceled", "로그인을 취소했습니다.");
  }
  if (browserResult.type !== "success" || !browserResult.url) {
    throw new AccountAuthError("oauth_response_invalid", "로그인 응답을 확인할 수 없습니다.");
  }
  const callback = new URL(browserResult.url);
  const expectedCallback = new URL(redirectUri);
  if (callback.protocol !== expectedCallback.protocol || callback.host !== expectedCallback.host || callback.pathname !== expectedCallback.pathname) {
    throw new AccountAuthError("oauth_response_invalid", "로그인 응답을 확인할 수 없습니다.");
  }
  const responseState = callback.searchParams.get("state");
  const code = callback.searchParams.get("code");
  if (callback.searchParams.has("error")) {
    throw new AccountAuthError("oauth_denied", "로그인이 완료되지 않았습니다.");
  }
  if (!code || responseState !== challenge.state) {
    throw new AccountAuthError("oauth_response_invalid", "로그인 응답을 확인할 수 없습니다.");
  }
  const exchange = await accountRequest<OAuthExchangeResponse>("/auth/oauth/exchange", {
    method: "POST",
    body: {
      provider,
      challengeId: challenge.challengeId,
      state: responseState,
      verifier: challenge.verifier,
      redirectUri,
      code,
    },
  });
  await persistAuthenticatedSession(exchange);
  return { account: exchange.account, expiresAt: exchange.expiresAt };
}

export async function restoreAccountSession(): Promise<AccountRestoreResult> {
  try {
    const token = await readSessionToken();
    if (!token) return { status: "signed-out", account: null };
    const session = await accountRequest<AccountSessionResult>("/auth/session", { token });
    await rememberIntegrityUser(session.account.userId);
    await ensureAppAttestEnrollment(token, session.account.userId).catch((error) => {
      console.warn("App Attest enrollment deferred", error instanceof Error ? error.message : String(error));
    });
    return { status: "authenticated", account: session.account, expiresAt: session.expiresAt };
  } catch (error) {
    const normalized = normalizeAccountError(error);
    if (normalized.status === 401) {
      await deleteSessionToken().catch(() => {});
      await forgetIntegrityUser().catch(() => {});
      return { status: "signed-out", account: null };
    }
    return { status: "offline", account: null };
  }
}

export async function acceptAccountTerms(marketingAccepted: boolean): Promise<AccountProfile> {
  const token = await requireStoredSessionToken();
  const response = await accountRequest<{ account: AccountProfile }>("/account/terms", {
    method: "POST",
    token,
    body: { requiredAccepted: true, marketingAccepted },
  });
  return response.account;
}

export async function signOutAccountSession(): Promise<void> {
  const token = await readSessionToken();
  try {
    if (token) await accountRequest<{ signedOut: boolean }>("/auth/logout", { method: "POST", token });
  } catch {
    // 서버 연결이 끊겨도 이 기기의 세션은 즉시 제거한다.
  } finally {
    await deleteSessionToken();
    await forgetIntegrityUser();
  }
}

export async function deleteAccountSession(): Promise<void> {
  const token = await requireStoredSessionToken();
  await accountRequest<{ deleted: boolean }>("/account/delete", { method: "POST", token });
  await deleteSessionToken();
  await forgetIntegrityUser();
}

export async function requestAuthenticatedAccountJson<T>(
  path: string,
  body: Record<string, unknown>,
  timeoutMs = 20_000,
): Promise<T> {
  const token = await requireStoredSessionToken();
  return accountRequest<T>(path, { method: "POST", token, body, timeoutMs });
}

export async function subscribeToAppleCredentialRevocation(onRevoked: () => void): Promise<() => void> {
  if (Platform.OS !== "ios") return () => {};
  const AppleAuthentication = await import("expo-apple-authentication");
  const subscription = AppleAuthentication.addRevokeListener(onRevoked);
  return () => subscription.remove();
}

async function accountRequest<T>(
  path: string,
  options: { method?: "GET" | "POST"; body?: Record<string, unknown>; token?: string; timeoutMs?: number } = {},
): Promise<T> {
  const config = getAccountRuntimeConfig();
  if (!config.apiBaseUrl) {
    throw new AccountAuthError("account_api_missing", "계정 서버 주소가 설정되지 않았습니다.");
  }
  const url = new URL(path, normalizeBaseUrl(config.apiBaseUrl));
  const method = options.method ?? "GET";
  const bodyText = options.body ? JSON.stringify(options.body) : "";
  const integrityHeaders = options.token
    ? await createAppIntegrityHeaders({ token: options.token, method, path, bodyText })
    : {};
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? config.timeoutMs);
  try {
    const response = await expoFetch(url.toString(), {
      method,
      signal: controller.signal,
      headers: {
        accept: "application/json",
        ...(options.body ? { "content-type": "application/json" } : {}),
        ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
        ...integrityHeaders,
      },
      ...(options.body ? { body: bodyText } : {}),
    });
    const responseText = await response.text();
    const payload = parseJsonObject(responseText);
    if (!response.ok) {
      throw new AccountAuthError(
        typeof payload.error === "string" ? payload.error : "account_request_failed",
        typeof payload.message === "string" ? payload.message : `계정 요청에 실패했습니다. (${response.status})`,
        response.status,
      );
    }
    return payload as T;
  } catch (error) {
    if (error instanceof AccountAuthError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AccountAuthError("account_timeout", "계정 서버 응답이 지연되고 있습니다.", 0);
    }
    throw new AccountAuthError("account_network_error", "계정 서버에 연결할 수 없습니다.", 0);
  } finally {
    clearTimeout(timeout);
  }
}

async function requireStoredSessionToken(): Promise<string> {
  const token = await readSessionToken();
  if (!token) throw new AccountAuthError("session_required", "다시 로그인해 주세요.", 401);
  return token;
}

async function readSessionToken(): Promise<string | null> {
  if (Platform.OS === "web") return volatileWebSessionToken;
  const SecureStore = await import("expo-secure-store");
  return SecureStore.getItemAsync(sessionTokenKey, { keychainService });
}

async function writeSessionToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    volatileWebSessionToken = token;
    return;
  }
  const SecureStore = await import("expo-secure-store");
  await SecureStore.setItemAsync(sessionTokenKey, token, {
    keychainService,
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
}

async function deleteSessionToken(): Promise<void> {
  if (Platform.OS === "web") {
    volatileWebSessionToken = null;
    return;
  }
  const SecureStore = await import("expo-secure-store");
  await SecureStore.deleteItemAsync(sessionTokenKey, { keychainService });
}

function formatAppleDisplayName(fullName: import("expo-apple-authentication").AppleAuthenticationFullName | null): string | null {
  if (!fullName) return null;
  const value = [fullName.familyName, fullName.givenName, fullName.middleName].filter(Boolean).join(" ").trim();
  return value || null;
}

function parseJsonObject(value: string): Record<string, unknown> {
  try {
    const parsed = value ? JSON.parse(value) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function isAppleCancellation(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "ERR_REQUEST_CANCELED");
}

function normalizeAccountError(error: unknown): AccountAuthError {
  if (error instanceof AccountAuthError) return error;
  return new AccountAuthError("account_unknown_error", error instanceof Error ? error.message : "계정 요청에 실패했습니다.");
}

async function persistAuthenticatedSession(exchange: OAuthExchangeResponse): Promise<void> {
  await writeSessionToken(exchange.sessionToken);
  await rememberIntegrityUser(exchange.account.userId);
  await ensureAppAttestEnrollment(exchange.sessionToken, exchange.account.userId).catch((error) => {
    console.warn("App Attest enrollment deferred", error instanceof Error ? error.message : String(error));
  });
}

function isProviderAvailability(value: unknown): value is AccountProviderAvailability {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<AccountProviderAvailability>;
  return Boolean(
    (item.provider === "kakao" || item.provider === "naver" || item.provider === "line" || item.provider === "google") &&
      typeof item.available === "boolean",
  );
}

export class AccountAuthError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 0,
  ) {
    super(message);
    this.name = "AccountAuthError";
  }
}
