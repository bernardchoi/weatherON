import { fetch as expoFetch } from "expo/fetch";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";
import { getAccountRuntimeConfig } from "../config/accountEnv";
import { normalizeBaseUrl } from "../utils/httpJson";

const deviceIdKey = "weatheron.app-integrity.device.v1";
const activeUserIdKey = "weatheron.app-integrity.active-user.v1";
const keychainService = "com.weatheron.mobile.app-integrity";
const protectedPurposes = new Set(["GET /auth/session", "POST /auth/logout", "POST /account/terms"]);

type IntegrityChallenge = {
  challengeId: string;
  challenge: string;
  purpose: string;
  expiresAt: string;
};

export async function rememberIntegrityUser(userId: string): Promise<void> {
  if (Platform.OS !== "ios") return;
  await writeSecureValue(activeUserIdKey, userId);
}

export async function forgetIntegrityUser(): Promise<void> {
  if (Platform.OS !== "ios") return;
  await deleteSecureValue(activeUserIdKey);
}

export async function ensureAppAttestEnrollment(token: string, userId: string): Promise<void> {
  if (Platform.OS !== "ios") return;
  const native = await loadNativeModule();
  if (!native.isSupported()) {
    console.warn("App Attest unsupported on this device");
    return;
  }

  const enrolledKey = integrityEnrolledKey(userId);
  if (await readSecureValue(enrolledKey)) return;

  const deviceId = (await readSecureValue(deviceIdKey)) ?? Crypto.randomUUID();
  await writeSecureValue(deviceIdKey, deviceId);
  const keyStorageKey = integrityKeyIdKey(userId);
  const keyId = (await readSecureValue(keyStorageKey)) ?? (await native.generateKey());
  await writeSecureValue(keyStorageKey, keyId);

  const challenge = await requestIntegrityChallenge(token, "attestation");
  const clientDataHash = await sha256Base64(challenge.challenge);
  const attestationObject = await native.attestKey(keyId, clientDataHash);
  await integrityApiRequest<{ registered: boolean }>("/app-integrity/attest", {
    method: "POST",
    token,
    bodyText: JSON.stringify({
      challengeId: challenge.challengeId,
      challenge: challenge.challenge,
      keyId,
      deviceId,
      attestationObject,
    }),
  });
  await writeSecureValue(enrolledKey, keyId);
}

export async function createAppIntegrityHeaders(options: {
  token: string;
  method: "GET" | "POST";
  path: string;
  bodyText: string;
}): Promise<Record<string, string>> {
  if (Platform.OS !== "ios") return {};
  try {
    const purpose = `${options.method} ${options.path}`;
    if (!protectedPurposes.has(purpose)) return {};
    const userId = await readSecureValue(activeUserIdKey);
    if (!userId) return {};
    const keyId = await readSecureValue(integrityEnrolledKey(userId));
    if (!keyId) return {};
    const native = await loadNativeModule();
    if (!native.isSupported()) return {};
    const challenge = await requestIntegrityChallenge(options.token, purpose);
    const clientData = JSON.stringify({
      challenge: challenge.challenge,
      method: options.method,
      path: options.path,
      bodyHash: await sha256Hex(options.bodyText),
    });
    const assertion = await native.generateAssertion(keyId, await sha256Base64(clientData));
    return {
      "x-weatheron-integrity-key-id": keyId,
      "x-weatheron-integrity-challenge-id": challenge.challengeId,
      "x-weatheron-integrity-challenge": challenge.challenge,
      "x-weatheron-integrity-assertion": assertion,
    };
  } catch (error) {
    console.warn("App Attest assertion unavailable", error instanceof Error ? error.message : String(error));
    return {};
  }
}

async function requestIntegrityChallenge(token: string, purpose: string): Promise<IntegrityChallenge> {
  return integrityApiRequest<IntegrityChallenge>("/app-integrity/challenge", {
    method: "POST",
    token,
    bodyText: JSON.stringify({ purpose }),
  });
}

async function integrityApiRequest<T>(
  path: string,
  options: { method: "GET" | "POST"; token: string; bodyText?: string },
): Promise<T> {
  const config = getAccountRuntimeConfig();
  if (!config.apiBaseUrl) throw new Error("account_api_missing");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await expoFetch(new URL(path, normalizeBaseUrl(config.apiBaseUrl)).toString(), {
      method: options.method,
      signal: controller.signal,
      headers: {
        accept: "application/json",
        authorization: `Bearer ${options.token}`,
        ...(options.bodyText ? { "content-type": "application/json" } : {}),
      },
      ...(options.bodyText ? { body: options.bodyText } : {}),
    });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};
    if (!response.ok) throw new Error(typeof payload.message === "string" ? payload.message : `integrity_http_${response.status}`);
    return payload as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function loadNativeModule() {
  return (await import("../../modules/weatheron-app-attest/src/WeatheronAppAttestModule")).default;
}

async function sha256Base64(value: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value, {
    encoding: Crypto.CryptoEncoding.BASE64,
  });
}

async function sha256Hex(value: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value, {
    encoding: Crypto.CryptoEncoding.HEX,
  });
}

function integrityKeyIdKey(userId: string) {
  return `weatheron.app-integrity.key.${userId}`;
}

function integrityEnrolledKey(userId: string) {
  return `weatheron.app-integrity.enrolled.${userId}`;
}

async function readSecureValue(key: string): Promise<string | null> {
  const SecureStore = await import("expo-secure-store");
  return SecureStore.getItemAsync(key, { keychainService });
}

async function writeSecureValue(key: string, value: string): Promise<void> {
  const SecureStore = await import("expo-secure-store");
  await SecureStore.setItemAsync(key, value, {
    keychainService,
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
}

async function deleteSecureValue(key: string): Promise<void> {
  const SecureStore = await import("expo-secure-store");
  await SecureStore.deleteItemAsync(key, { keychainService });
}
