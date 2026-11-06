import { fetch as expoFetch } from "expo/fetch";
import * as Crypto from "expo-crypto";
import { Platform } from "../localization/react-native";
import { getAccountRuntimeConfig } from "../config/accountEnv";
import { normalizeBaseUrl } from "../utils/httpJson";
import { readPendingAccountDeletion, writePendingAccountDeletion } from "./accountDeletionState";
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
  | { status: "cleanup-required"; account: null; serverDeleted: boolean }
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
// Serialize local credential/identity mutations so an already-started secure-store
// write completes before a newer logout clears it. Network requests stay parallel.
let sessionMutationTail: Promise<void> = Promise.resolve();
function mutateSession(isCurrent: () => boolean, mutation: () => Promise<void>): Promise<void> {
  const pending = sessionMutationTail.then(async () => {
    if (isCurrent()) await mutation();
  });
  sessionMutationTail = pending.catch(() => {});
  return pending;
}

export async function isAppleAccountSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== "ios") return false;
  const AppleAuthentication = await import("expo-apple-authentication");
  return AppleAuthentication.isAvailableAsync();
}

export async function signInWithAppleAccount(expectedUserId?: string, isCurrent: () => boolean = () => true): Promise<AccountSessionResult> {
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
    await persistAuthenticatedSession(exchange, expectedUserId, isCurrent);
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
  expectedUserId?: string,
  isCurrent: () => boolean = () => true,
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
  await persistAuthenticatedSession(exchange, expectedUserId, isCurrent);
  return { account: exchange.account, expiresAt: exchange.expiresAt };
}

export async function restoreAccountSession(isCurrent: () => boolean = () => true): Promise<AccountRestoreResult> {
  // Check before token/network access, including offline launches. Failure to
  // read this guard must reject, never fall back to showing cached private data.
  const deletion = await readPendingAccountDeletion();
  if (deletion) return { status: "cleanup-required", account: null, serverDeleted: deletion === "server-deleted" };
  try {
    const token = await readSessionToken();
    if (!isCurrent() || !token) return { status: "signed-out", account: null };
    const session = await accountRequest<AccountSessionResult>("/auth/session", { token });
    if (!isCurrent()) return { status: "offline", account: null };
    await mutateSession(isCurrent, () => rememberIntegrityUser(session.account.userId));
    if (!isCurrent()) return { status: "offline", account: null };
    await ensureAppAttestEnrollment(token, session.account.userId).catch((error) => {
      console.warn("App Attest enrollment deferred", error instanceof Error ? error.message : String(error));
    });
    return { status: "authenticated", account: session.account, expiresAt: session.expiresAt };
  } catch (error) {
    const normalized = normalizeAccountError(error);
    if (!isCurrent()) return { status: "offline", account: null };
    if (normalized.status === 401) {
      await mutateSession(isCurrent, async () => {
        await deleteSessionToken().catch(() => {});
        await forgetIntegrityUser().catch(() => {});
      });
      return { status: "signed-out", account: null };
    }
    return { status: "offline", account: null };
  }
}

export async function acceptAccountTerms(): Promise<AccountProfile> {
  const token = await requireStoredSessionToken();
  const response = await accountRequest<{ account: AccountProfile }>("/account/terms", {
    method: "POST",
    token,
    body: {
      requiredAccepted: true,
      termsAccepted: true,
      privacyAccepted: true,
      locationAccepted: true,
    },
  });
  return response.account;
}

export async function signOutAccountSession(isCurrent: () => boolean = () => true): Promise<void> {
  const token = await readSessionToken();
  try {
    if (token) await accountRequest<{ signedOut: boolean }>("/auth/logout", { method: "POST", token });
  } catch {
    // 서버 연결이 끊겨도 이 기기의 세션은 즉시 제거한다.
  } finally {
    await clearLocalAccountSession(isCurrent);
  }
}

export async function clearLocalAccountSession(isCurrent: () => boolean = () => true): Promise<void> {
  await mutateSession(isCurrent, async () => {
    // Attempt both independent stores, but never hide a failure from the caller.
    const results = await Promise.allSettled([deleteSessionToken(), forgetIntegrityUser()]);
    const failed = results.find(result => result.status === "rejected");
    if (failed?.status === "rejected") throw failed.reason;
  });
}

export async function deleteAccountSession(
  isCurrent: () => boolean = () => true,
  onServerDeleted: () => void = () => {},
): Promise<void> {
  const pending = await readPendingAccountDeletion();
  if (!isCurrent()) return;
  if (pending === "server-deleted") {
    onServerDeleted();
    await clearLocalAccountSession(isCurrent);
    return;
  }
  let token: string;
  try { token = await requireStoredSessionToken(); }
  catch (error) {
    if (pending === "requested") throw new AccountAuthError("delete_result_unknown", "탈퇴 결과를 확인하지 못했어요. support@weatheron.app으로 문의해 주세요.");
    throw error;
  }
  if (pending === "requested") {
    // A prior process may have lost the response. Only a still-authenticated
    // account proves that retrying the server request is necessary.
    try {
      const session = await accountRequest<AccountSessionResult>("/auth/session", { token });
      if (!session.account?.userId) throw new Error("Invalid account session");
    }
    catch (error) {
      throw new AccountAuthError("delete_result_unknown", normalizeAccountError(error).status === 401
        ? "탈퇴 결과를 확인하지 못했어요. support@weatheron.app으로 문의해 주세요."
        : "탈퇴 결과를 확인하지 못했어요. 연결 상태를 확인한 뒤 다시 시도해 주세요.");
    }
  }
  if (!isCurrent()) return;
  // Durable intent must succeed before the irreversible request is sent.
  await writePendingAccountDeletion("requested");
  if (!isCurrent()) {
    // No server request was sent. Do not leave an ambiguous deletion behind
    // when a newer logout cancelled this operation during the durable write.
    await writePendingAccountDeletion(null);
    return;
  }
  let result: { deleted: boolean };
  try { result = await accountRequest<{ deleted: boolean }>("/account/delete", { method: "POST", token }); }
  catch (error) {
    const rejected = normalizeAccountError(error);
    if (rejected.status >= 400 && rejected.status < 500) await writePendingAccountDeletion(null);
    throw error;
  }
  if (result.deleted !== true) throw new AccountAuthError("delete_response_invalid", "회원 탈퇴를 완료하지 못했습니다.");
  // Publish the irreversible server acknowledgement before fallible local work.
  // A retry can then finish local cleanup without needing the deleted account.
  if (isCurrent()) onServerDeleted();
  await writePendingAccountDeletion("server-deleted");
  if (!isCurrent()) return;
  await clearLocalAccountSession(isCurrent);
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

async function persistAuthenticatedSession(exchange: OAuthExchangeResponse, expectedUserId?: string, isCurrent: () => boolean = () => true): Promise<void> {
  // Validate before replacing the existing keychain token or integrity identity.
  if (expectedUserId && exchange.account.userId !== expectedUserId) {
    await accountRequest("/auth/logout", { method: "POST", token: exchange.sessionToken }).catch(() => {});
    throw new AccountAuthError("reauth_account_mismatch", "현재 연결된 계정으로 다시 인증해 주세요. 저장 데이터는 유지됩니다.");
  }
  await mutateSession(isCurrent, async () => {
    await writeSessionToken(exchange.sessionToken);
    await rememberIntegrityUser(exchange.account.userId);
  });
  if (!isCurrent()) return;
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

export function isAccountAuthCancellation(error: unknown): boolean {
  return error instanceof AccountAuthError && (error.code === "apple_canceled" || error.code === "oauth_canceled");
}

export function getAccountAuthDisplayMessage(error: unknown): string {
  if (!(error instanceof AccountAuthError)) return "계정 요청에 실패했습니다.";
  if (error.code === "account_cleanup_required" || error.code === "delete_result_unknown") return error.message;
  if (error.code === "apple_canceled") return "Apple 로그인을 취소했습니다.";
  if (error.code === "oauth_canceled") return "로그인을 취소했습니다.";
  if (error.code === "apple_unavailable") return "Apple 로그인은 현재 iOS 앱에서 사용할 수 있습니다.";
  if (error.code === "oauth_unavailable") return "간편 로그인은 iOS와 Android 앱에서 사용할 수 있습니다.";
  if (error.code === "account_api_missing") return "계정 서버 주소가 설정되지 않았습니다.";
  if (error.code === "account_timeout") return "계정 서버 응답이 지연되고 있습니다.";
  if (error.code === "account_network_error") return "계정 서버에 연결할 수 없습니다.";
  if (error.code === "reauth_account_mismatch") return "현재 연결된 계정으로 다시 인증해 주세요. 저장 데이터는 유지됩니다.";
  if (error.code === "session_required") return "다시 로그인해 주세요.";
  if (error.code.includes("response_invalid")) return "로그인 응답을 확인할 수 없습니다.";
  if (error.code === "oauth_denied") return "로그인이 완료되지 않았습니다.";
  return "계정 요청에 실패했습니다.";
}
