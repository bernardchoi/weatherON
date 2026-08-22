import { IntegrityHttpError, verifyAppIntegrityRequest } from "./integrityCore.mjs";
import {
  createOAuthChallenge,
  disconnectOAuthProviders,
  exchangeOAuthCredential,
  getOAuthProviderAvailability,
  handleOAuthCallback,
} from "./oauthCore.mjs";

const APPLE_ISSUER = "https://appleid.apple.com";
const APPLE_JWKS_URL = `${APPLE_ISSUER}/auth/keys`;
const DEFAULT_CHALLENGE_TTL_SECONDS = 5 * 60;
const DEFAULT_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const DEFAULT_TERMS_VERSION = "2026-08-08";
const MAX_JSON_BODY_BYTES = 24 * 1024;

const appleJwksCache = new Map();

export function isAccountRoute(pathname) {
  return pathname.startsWith("/auth/") || pathname.startsWith("/account/");
}

export async function handleAccountRoute(request, env = {}, options = {}) {
  try {
    const database = env.WEATHERON_DB;
    if (!database) throw new AuthHttpError(503, "account_storage_unavailable", "계정 저장소가 아직 연결되지 않았습니다.");

    const url = new URL(request.url);
    const routeKey = `${request.method.toUpperCase()} ${url.pathname}`;
    if (routeKey === "GET /auth/providers") return { status: 200, payload: { providers: getOAuthProviderAvailability(env) } };
    if (routeKey === "GET /auth/oauth/callback") return await handleOAuthCallback(request, database, env);
    if (routeKey === "POST /auth/apple/challenge") return await createAppleChallenge(database, env);
    if (routeKey === "POST /auth/apple/exchange") return await exchangeAppleCredential(request, database, env, options);
    if (routeKey === "POST /auth/oauth/challenge") return await createOAuthChallenge(request, database, env);
    if (routeKey === "POST /auth/oauth/exchange") {
      return await exchangeOAuthCredential(request, database, env, {
        fetchImpl: options.fetchImpl ?? globalThis.fetch,
        upsertIdentity: (identity) => upsertIdentity(database, identity),
        createSession: (userId, nowIso) => createSession(database, userId, env, nowIso),
        readProfile: (userId) => readAccountProfile(database, userId, env),
      });
    }
    if (routeKey === "GET /auth/session") return await getCurrentSession(request, database, env);
    if (routeKey === "POST /auth/logout") return await signOutSession(request, database, env);
    if (routeKey === "POST /account/terms") return await acceptTerms(request, database, env);
    if (routeKey === "POST /account/delete") return await deleteAccount(request, database, env, options);
    throw new AuthHttpError(404, "not_found", "요청한 계정 API가 없습니다.");
  } catch (error) {
    if (error instanceof AuthHttpError || error instanceof IntegrityHttpError || error?.name === "OAuthHttpError") {
      return { status: error.status, payload: { error: error.code, message: error.message } };
    }
    console.error("account route failed", error instanceof Error ? error.message : String(error));
    return { status: 500, payload: { error: "account_internal_error", message: "계정 요청을 처리하지 못했습니다." } };
  }
}

async function createAppleChallenge(database, env) {
  const now = Date.now();
  const ttlSeconds = readPositiveInteger(env.AUTH_CHALLENGE_TTL_SECONDS, DEFAULT_CHALLENGE_TTL_SECONDS);
  const challengeId = crypto.randomUUID();
  const nonce = randomToken(32);
  const state = randomToken(24);
  const createdAt = new Date(now).toISOString();
  const expiresAt = new Date(now + ttlSeconds * 1000).toISOString();

  await database.batch([
    database.prepare("DELETE FROM auth_challenges WHERE expires_at < ? OR consumed_at IS NOT NULL").bind(createdAt),
    database
      .prepare(
        "INSERT INTO auth_challenges (id, nonce_hash, state_hash, expires_at, consumed_at, created_at) VALUES (?, ?, ?, ?, NULL, ?)",
      )
      .bind(challengeId, await sha256Hex(nonce), await sha256Hex(state), expiresAt, createdAt),
  ]);

  return { status: 201, payload: { challengeId, nonce, state, expiresAt } };
}

async function exchangeAppleCredential(request, database, env, options) {
  const body = await readJsonObject(request);
  const challengeId = readRequiredString(body.challengeId, "challengeId", 120);
  const nonce = readRequiredString(body.nonce, "nonce", 240);
  const state = readRequiredString(body.state, "state", 240);
  const identityToken = readRequiredString(body.identityToken, "identityToken", 16_000);
  const credentialUser = readOptionalString(body.user, 512);
  const displayName = readOptionalString(body.displayName, 100);
  const nowIso = new Date().toISOString();

  const challenge = await database
    .prepare("SELECT id, nonce_hash, state_hash, expires_at, consumed_at FROM auth_challenges WHERE id = ?")
    .bind(challengeId)
    .first();
  if (!challenge || challenge.consumed_at || challenge.expires_at <= nowIso) {
    throw new AuthHttpError(409, "apple_challenge_expired", "Apple 로그인 요청이 만료되었습니다. 다시 시도해 주세요.");
  }
  const [nonceHash, stateHash] = await Promise.all([sha256Hex(nonce), sha256Hex(state)]);
  if (challenge.nonce_hash !== nonceHash || challenge.state_hash !== stateHash) {
    throw new AuthHttpError(401, "apple_challenge_mismatch", "Apple 로그인 요청 정보를 확인할 수 없습니다.");
  }

  const consumeResult = await database
    .prepare("UPDATE auth_challenges SET consumed_at = ? WHERE id = ? AND consumed_at IS NULL AND expires_at > ?")
    .bind(nowIso, challengeId, nowIso)
    .run();
  if (Number(consumeResult?.meta?.changes ?? 0) !== 1) {
    throw new AuthHttpError(409, "apple_challenge_used", "이미 처리된 Apple 로그인 요청입니다.");
  }

  const claims = await verifyAppleIdentityToken(identityToken, {
    expectedNonce: nonce,
    clientIds: readAppleClientIds(env),
    fetchImpl: options.fetchImpl ?? globalThis.fetch,
    nowMs: options.nowMs ?? Date.now(),
  });
  if (credentialUser && credentialUser !== claims.sub) {
    throw new AuthHttpError(401, "apple_user_mismatch", "Apple 사용자 식별자가 일치하지 않습니다.");
  }

  const subjectHash = await sha256Hex(claims.sub);
  const email = readOptionalString(claims.email, 320);
  const userId = await upsertIdentity(database, { provider: "apple", subjectHash, email, displayName, nowIso });
  const session = await createSession(database, userId, env, nowIso);
  const profile = await readAccountProfile(database, userId, env);

  return {
    status: 200,
    payload: {
      sessionToken: session.token,
      expiresAt: session.expiresAt,
      account: profile,
    },
  };
}

async function getCurrentSession(request, database, env) {
  const session = await requireSession(request, database);
  await verifyAppIntegrityRequest(request.clone(), database, env, { session, routeKey: "GET /auth/session" });
  await database.prepare("UPDATE auth_sessions SET last_seen_at = ? WHERE id = ?").bind(new Date().toISOString(), session.session_id).run();
  return { status: 200, payload: { account: toAccountProfile(session, env), expiresAt: session.expires_at } };
}

async function signOutSession(request, database, env) {
  const session = await requireSession(request, database);
  await verifyAppIntegrityRequest(request.clone(), database, env, { session, routeKey: "POST /auth/logout" });
  await database.prepare("UPDATE auth_sessions SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL").bind(new Date().toISOString(), session.session_id).run();
  return { status: 200, payload: { signedOut: true } };
}

async function acceptTerms(request, database, env) {
  const session = await requireSession(request, database);
  await verifyAppIntegrityRequest(request.clone(), database, env, { session, routeKey: "POST /account/terms" });
  const body = await readJsonObject(request);
  if (body.requiredAccepted !== true) {
    throw new AuthHttpError(400, "required_terms_missing", "필수 약관 동의가 필요합니다.");
  }
  const nowIso = new Date().toISOString();
  const termsVersion = readTermsVersion(env);
  await database
    .prepare(
      "UPDATE users SET terms_version = ?, terms_accepted_at = ?, marketing_consent = ?, updated_at = ? WHERE id = ?",
    )
    .bind(termsVersion, nowIso, body.marketingAccepted === true ? 1 : 0, nowIso, session.user_id)
    .run();
  return { status: 200, payload: { account: await readAccountProfile(database, session.user_id, env) } };
}

async function deleteAccount(request, database, env, options) {
  const session = await requireSession(request, database);
  await verifyAppIntegrityRequest(request.clone(), database, env, { session, routeKey: "POST /account/delete" });
  const recentAuthLimit = Date.now() - 15 * 60 * 1000;
  if (!session.created_at || Date.parse(session.created_at) < recentAuthLimit) {
    throw new AuthHttpError(401, "recent_auth_required", "회원 탈퇴를 위해 다시 로그인해 주세요.");
  }
  await disconnectOAuthProviders(database, session.user_id, env, options.fetchImpl ?? globalThis.fetch);
  await database.prepare("DELETE FROM users WHERE id = ?").bind(session.user_id).run();
  return { status: 200, payload: { deleted: true } };
}

async function upsertIdentity(database, { provider, subjectHash, email, displayName, nowIso }) {
  const existing = await database
    .prepare("SELECT user_id FROM auth_identities WHERE provider = ? AND subject_hash = ?")
    .bind(provider, subjectHash)
    .first();
  if (existing?.user_id) {
    await database.batch([
      database
        .prepare("UPDATE auth_identities SET email = COALESCE(?, email), last_login_at = ?, updated_at = ? WHERE provider = ? AND subject_hash = ?")
        .bind(email, nowIso, nowIso, provider, subjectHash),
      database
        .prepare("UPDATE users SET email = COALESCE(?, email), display_name = COALESCE(?, display_name), updated_at = ? WHERE id = ?")
        .bind(email, displayName, nowIso, existing.user_id),
    ]);
    return existing.user_id;
  }

  const userId = crypto.randomUUID();
  try {
    await database.batch([
      database
        .prepare(
          "INSERT INTO users (id, email, display_name, terms_version, terms_accepted_at, marketing_consent, created_at, updated_at) VALUES (?, ?, ?, NULL, NULL, 0, ?, ?)",
        )
        .bind(userId, email, displayName, nowIso, nowIso),
      database
        .prepare(
          "INSERT INTO auth_identities (provider, subject_hash, user_id, email, created_at, updated_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(provider, subjectHash, userId, email, nowIso, nowIso, nowIso),
    ]);
    return userId;
  } catch (error) {
    const concurrent = await database
      .prepare("SELECT user_id FROM auth_identities WHERE provider = ? AND subject_hash = ?")
      .bind(provider, subjectHash)
      .first();
    if (concurrent?.user_id) return concurrent.user_id;
    throw error;
  }
}

async function createSession(database, userId, env, nowIso) {
  const token = randomToken(32);
  const tokenHash = await sha256Hex(token);
  const sessionId = crypto.randomUUID();
  const ttlSeconds = readPositiveInteger(env.AUTH_SESSION_TTL_SECONDS, DEFAULT_SESSION_TTL_SECONDS);
  const expiresAt = new Date(Date.parse(nowIso) + ttlSeconds * 1000).toISOString();
  await database
    .prepare(
      "INSERT INTO auth_sessions (id, user_id, token_hash, expires_at, revoked_at, created_at, last_seen_at) VALUES (?, ?, ?, ?, NULL, ?, ?)",
    )
    .bind(sessionId, userId, tokenHash, expiresAt, nowIso, nowIso)
    .run();
  return { token, expiresAt };
}

export async function requireSession(request, database) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+([^\s]+)$/i.exec(authorization);
  if (!match || match[1].length < 32 || match[1].length > 256) {
    throw new AuthHttpError(401, "session_required", "로그인이 필요합니다.");
  }
  const tokenHash = await sha256Hex(match[1]);
  const nowIso = new Date().toISOString();
  const session = await database
    .prepare(
      `SELECT
        sessions.id AS session_id,
        sessions.user_id,
        sessions.expires_at,
        sessions.created_at,
        users.email,
        users.display_name,
        users.terms_version,
        users.terms_accepted_at,
        users.marketing_consent,
        (SELECT provider FROM auth_identities WHERE user_id = users.id ORDER BY last_login_at DESC LIMIT 1) AS provider
      FROM auth_sessions AS sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ? AND sessions.revoked_at IS NULL AND sessions.expires_at > ?`,
    )
    .bind(tokenHash, nowIso)
    .first();
  if (!session) throw new AuthHttpError(401, "session_invalid", "로그인 세션이 만료되었습니다.");
  return session;
}

async function readAccountProfile(database, userId, env) {
  const user = await database
    .prepare(
      `SELECT id AS user_id, email, display_name, terms_version, terms_accepted_at, marketing_consent,
        (SELECT provider FROM auth_identities WHERE user_id = users.id ORDER BY last_login_at DESC LIMIT 1) AS provider
       FROM users WHERE id = ?`,
    )
    .bind(userId)
    .first();
  if (!user) throw new AuthHttpError(404, "account_not_found", "계정을 찾을 수 없습니다.");
  return toAccountProfile(user, env);
}

function toAccountProfile(row, env) {
  const termsVersion = readTermsVersion(env);
  return {
    userId: row.user_id,
    email: row.email ?? null,
    displayName: row.display_name ?? null,
    provider: row.provider ?? "apple",
    termsAccepted: Boolean(row.terms_accepted_at && row.terms_version === termsVersion),
    termsVersion: row.terms_version ?? null,
    marketingAccepted: row.marketing_consent === 1,
  };
}

export async function verifyAppleIdentityToken(identityToken, { expectedNonce, clientIds, fetchImpl, nowMs = Date.now() }) {
  if (!Array.isArray(clientIds) || clientIds.length === 0) {
    throw new AuthHttpError(503, "apple_client_not_configured", "Apple 로그인 App ID가 서버에 설정되지 않았습니다.");
  }
  if (typeof fetchImpl !== "function") {
    throw new AuthHttpError(503, "apple_keys_unavailable", "Apple 공개키를 확인할 수 없습니다.");
  }
  const parts = identityToken.split(".");
  if (parts.length !== 3) throw new AuthHttpError(401, "apple_token_invalid", "Apple 로그인 토큰 형식이 올바르지 않습니다.");

  const header = decodeJwtJson(parts[0]);
  const claims = decodeJwtJson(parts[1]);
  if (header.alg !== "RS256" || typeof header.kid !== "string") {
    throw new AuthHttpError(401, "apple_token_algorithm_invalid", "Apple 로그인 토큰 서명 방식을 확인할 수 없습니다.");
  }

  const key = await getAppleVerificationKey(header.kid, fetchImpl);
  const verified = await crypto.subtle.verify(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    decodeBase64Url(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );
  if (!verified) throw new AuthHttpError(401, "apple_token_signature_invalid", "Apple 로그인 서명이 올바르지 않습니다.");

  const nowSeconds = Math.floor(nowMs / 1000);
  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (claims.iss !== APPLE_ISSUER) throw new AuthHttpError(401, "apple_token_issuer_invalid", "Apple 로그인 발급자를 확인할 수 없습니다.");
  if (!audience.some((value) => clientIds.includes(value))) {
    throw new AuthHttpError(401, "apple_token_audience_invalid", "Apple 로그인 대상 앱이 일치하지 않습니다.");
  }
  if (!Number.isFinite(claims.exp) || claims.exp <= nowSeconds) {
    throw new AuthHttpError(401, "apple_token_expired", "Apple 로그인 토큰이 만료되었습니다.");
  }
  if (Number.isFinite(claims.iat) && claims.iat > nowSeconds + 300) {
    throw new AuthHttpError(401, "apple_token_time_invalid", "Apple 로그인 토큰 시간이 올바르지 않습니다.");
  }
  if (typeof claims.sub !== "string" || !claims.sub) {
    throw new AuthHttpError(401, "apple_token_subject_invalid", "Apple 사용자 식별자가 없습니다.");
  }
  if (claims.nonce !== (await sha256Hex(expectedNonce))) {
    throw new AuthHttpError(401, "apple_token_nonce_invalid", "Apple 로그인 nonce가 일치하지 않습니다.");
  }
  return claims;
}

async function getAppleVerificationKey(kid, fetchImpl) {
  const cached = appleJwksCache.get(kid);
  if (cached && cached.expiresAt > Date.now()) return cached.key;

  const response = await fetchImpl(APPLE_JWKS_URL, { headers: { accept: "application/json" } });
  if (!response.ok) throw new AuthHttpError(503, "apple_keys_unavailable", "Apple 공개키를 불러오지 못했습니다.");
  const payload = await response.json();
  const jwk = Array.isArray(payload?.keys)
    ? payload.keys.find((item) => item?.kid === kid && item?.kty === "RSA" && item?.alg === "RS256")
    : null;
  if (!jwk) throw new AuthHttpError(401, "apple_token_key_invalid", "Apple 로그인 공개키를 찾을 수 없습니다.");

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  appleJwksCache.set(kid, { key, expiresAt: Date.now() + 60 * 60 * 1000 });
  return key;
}

async function readJsonObject(request) {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_JSON_BODY_BYTES) {
    throw new AuthHttpError(413, "request_too_large", "요청 데이터가 너무 큽니다.");
  }
  try {
    const value = text ? JSON.parse(text) : {};
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("object required");
    return value;
  } catch {
    throw new AuthHttpError(400, "invalid_json", "요청 JSON 형식이 올바르지 않습니다.");
  }
}

function readAppleClientIds(env) {
  return String(env.APPLE_CLIENT_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function readTermsVersion(env) {
  return readOptionalString(env.WEATHERON_TERMS_VERSION, 80) ?? DEFAULT_TERMS_VERSION;
}

function readPositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function readRequiredString(value, field, maxLength) {
  const normalized = readOptionalString(value, maxLength);
  if (!normalized) throw new AuthHttpError(400, "missing_field", `${field} 값이 필요합니다.`);
  return normalized;
}

function readOptionalString(value, maxLength) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  if (normalized.length > maxLength) throw new AuthHttpError(400, "invalid_field", "요청 값이 허용 길이를 초과했습니다.");
  return normalized;
}

function decodeJwtJson(value) {
  try {
    return JSON.parse(new TextDecoder().decode(decodeBase64Url(value)));
  } catch {
    throw new AuthHttpError(401, "apple_token_invalid", "Apple 로그인 토큰을 해석할 수 없습니다.");
  }
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function randomToken(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return encodeBase64Url(bytes);
}

function encodeBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

class AuthHttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
