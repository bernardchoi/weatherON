const OAUTH_PROVIDERS = ["kakao", "naver", "line", "google"];
const DEFAULT_REDIRECT_URI = "weatheron://oauth/callback";

export function getOAuthProviderAvailability(env = {}) {
  const tokenStorageReady = Boolean(readOptionalString(env.AUTH_PROVIDER_TOKEN_KEY, 512));
  const callbackReady = Boolean(readProviderRedirectUri(env));
  return OAUTH_PROVIDERS.map((provider) => ({
    provider,
    available: tokenStorageReady && callbackReady && isProviderConfigured(provider, env),
  }));
}

export async function createOAuthChallenge(request, database, env = {}) {
  const body = await readJsonObject(request);
  const provider = readProvider(body.provider);
  const clientRedirectUri = readClientRedirectUri(body.redirectUri, env);
  const providerRedirectUri = readProviderRedirectUri(env);
  ensureProviderAvailable(provider, env);

  const now = Date.now();
  const challengeId = crypto.randomUUID();
  const verifier = randomToken(48);
  const state = randomToken(24);
  const nonce = randomToken(24);
  const createdAt = new Date(now).toISOString();
  const expiresAt = new Date(now + 5 * 60 * 1000).toISOString();

  await database.batch([
    database.prepare("DELETE FROM auth_challenges WHERE expires_at < ? OR consumed_at IS NOT NULL").bind(createdAt),
    database
      .prepare("INSERT INTO auth_challenges (id, nonce_hash, state_hash, expires_at, consumed_at, created_at, provider, provider_redirect_uri, client_redirect_uri) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?)")
      .bind(challengeId, await sha256Hex(verifier), await sha256Hex(state), expiresAt, createdAt, provider, providerRedirectUri, clientRedirectUri),
  ]);

  return {
    status: 201,
    payload: {
      provider,
      challengeId,
      state,
      verifier,
      redirectUri: clientRedirectUri,
      authorizationUrl: await buildAuthorizationUrl(provider, { state, nonce, verifier, redirectUri: providerRedirectUri }, env),
      expiresAt,
    },
  };
}

export async function exchangeOAuthCredential(request, database, env = {}, options = {}) {
  const body = await readJsonObject(request);
  const provider = readProvider(body.provider);
  const challengeId = readRequiredString(body.challengeId, "challengeId", 120);
  const state = readRequiredString(body.state, "state", 240);
  const verifier = readRequiredString(body.verifier, "verifier", 512);
  const code = readRequiredString(body.code, "code", 4096);
  const clientRedirectUri = readClientRedirectUri(body.redirectUri, env);
  ensureProviderAvailable(provider, env);

  const nowIso = new Date().toISOString();
  const challenge = await database
    .prepare("SELECT id, nonce_hash, state_hash, expires_at, consumed_at, provider, provider_redirect_uri, client_redirect_uri FROM auth_challenges WHERE id = ?")
    .bind(challengeId)
    .first();
  if (!challenge || challenge.consumed_at || challenge.expires_at <= nowIso) {
    throw oauthError(409, "oauth_challenge_expired", "로그인 요청이 만료되었습니다. 다시 시도해 주세요.");
  }
  if (challenge.provider !== provider || challenge.client_redirect_uri !== clientRedirectUri) {
    throw oauthError(401, "oauth_challenge_mismatch", "로그인 요청 정보를 확인할 수 없습니다.");
  }
  const [verifierHash, stateHash] = await Promise.all([sha256Hex(verifier), sha256Hex(state)]);
  if (challenge.nonce_hash !== verifierHash || challenge.state_hash !== stateHash) {
    throw oauthError(401, "oauth_challenge_mismatch", "로그인 요청 정보를 확인할 수 없습니다.");
  }
  const consumed = await database
    .prepare("UPDATE auth_challenges SET consumed_at = ? WHERE id = ? AND consumed_at IS NULL AND expires_at > ?")
    .bind(nowIso, challengeId, nowIso)
    .run();
  if (Number(consumed?.meta?.changes ?? 0) !== 1) {
    throw oauthError(409, "oauth_challenge_used", "이미 처리된 로그인 요청입니다.");
  }

  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const token = await requestProviderToken(provider, { code, verifier, redirectUri: challenge.provider_redirect_uri, state }, env, fetchImpl);
  const identity = await requestProviderIdentity(provider, token.accessToken, fetchImpl);
  const subjectHash = await sha256Hex(identity.subject);
  const userId = await options.upsertIdentity({
    provider,
    subjectHash,
    email: null,
    displayName: identity.displayName,
    nowIso,
  });
  await storeProviderToken(database, env, {
    provider,
    subjectHash,
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    expiresAt: token.expiresAt,
    nowIso,
  });
  const session = await options.createSession(userId, nowIso);
  const profile = await options.readProfile(userId);
  return {
    status: 200,
    payload: { sessionToken: session.token, expiresAt: session.expiresAt, account: profile },
  };
}

export async function handleOAuthCallback(request, database, env = {}) {
  const url = new URL(request.url);
  const state = readOptionalString(url.searchParams.get("state"), 240);
  if (!state) throw oauthError(400, "oauth_state_missing", "로그인 반환 정보를 확인할 수 없습니다.");
  const challenge = await database
    .prepare("SELECT client_redirect_uri FROM auth_challenges WHERE state_hash = ? AND consumed_at IS NULL AND expires_at > ?")
    .bind(await sha256Hex(state), new Date().toISOString())
    .first();
  if (!challenge?.client_redirect_uri) {
    throw oauthError(409, "oauth_challenge_expired", "로그인 요청이 만료되었습니다. 다시 시도해 주세요.");
  }
  const clientUrl = new URL(readClientRedirectUri(challenge.client_redirect_uri, env));
  for (const key of ["code", "state", "error", "error_description"]) {
    const value = url.searchParams.get(key);
    if (value) clientUrl.searchParams.set(key, value);
  }
  return { status: 302, redirect: clientUrl.toString(), payload: {} };
}

export async function disconnectOAuthProviders(database, userId, env = {}, fetchImpl = globalThis.fetch) {
  let rows = [];
  try {
    const result = await database
      .prepare(
        `SELECT identities.provider, identities.subject_hash, tokens.token_ciphertext
         FROM auth_identities AS identities
         LEFT JOIN auth_provider_tokens AS tokens
           ON tokens.provider = identities.provider AND tokens.subject_hash = identities.subject_hash
         WHERE identities.user_id = ? AND identities.provider <> 'apple'`,
      )
      .bind(userId)
      .all();
    rows = Array.isArray(result?.results) ? result.results : [];
  } catch {
    return;
  }
  for (const row of rows) {
    if (!row?.token_ciphertext || !OAUTH_PROVIDERS.includes(row.provider)) continue;
    try {
      const token = await decryptProviderToken(row.token_ciphertext, env);
      await revokeProviderToken(row.provider, token, env, fetchImpl);
    } catch {
      // 이용자 탈퇴는 외부 공급자 장애로 막지 않는다. 공급자 연결 해제는 다음 운영 재처리 대상이다.
    }
  }
}

function isProviderConfigured(provider, env) {
  if (provider === "kakao") return Boolean(getProviderClientId(provider, env));
  return Boolean(getProviderClientId(provider, env) && getProviderClientSecret(provider, env));
}

function ensureProviderAvailable(provider, env) {
  if (!readOptionalString(env.AUTH_PROVIDER_TOKEN_KEY, 512) || !readProviderRedirectUri(env) || !isProviderConfigured(provider, env)) {
    throw oauthError(503, "oauth_provider_unavailable", "이 로그인 방식은 현재 사용할 수 없습니다.");
  }
}

async function buildAuthorizationUrl(provider, { state, nonce, verifier, redirectUri }, env) {
  const codeChallenge = encodeBase64Url(await sha256Bytes(verifier));
  const clientId = getProviderClientId(provider, env);
  const values = { response_type: "code", client_id: clientId, redirect_uri: redirectUri, state };
  let endpoint;
  if (provider === "kakao") endpoint = "https://kauth.kakao.com/oauth/authorize";
  if (provider === "naver") endpoint = "https://nid.naver.com/oauth2.0/authorize";
  if (provider === "line") {
    endpoint = "https://access.line.me/oauth2/v2.1/authorize";
    Object.assign(values, { scope: "openid profile", nonce, code_challenge: codeChallenge, code_challenge_method: "S256" });
  }
  if (provider === "google") {
    endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    Object.assign(values, {
      scope: "openid",
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      access_type: "offline",
      prompt: "select_account",
    });
  }
  const url = new URL(endpoint);
  for (const [key, value] of Object.entries(values)) url.searchParams.set(key, value);
  return url.toString();
}

async function requestProviderToken(provider, { code, verifier, redirectUri, state }, env, fetchImpl) {
  const clientId = getProviderClientId(provider, env);
  const clientSecret = getProviderClientSecret(provider, env);
  const form = new URLSearchParams({ grant_type: "authorization_code", client_id: clientId, redirect_uri: redirectUri, code });
  let endpoint;
  if (provider === "kakao") {
    endpoint = "https://kauth.kakao.com/oauth/token";
    if (clientSecret) form.set("client_secret", clientSecret);
  }
  if (provider === "naver") {
    endpoint = "https://nid.naver.com/oauth2.0/token";
    form.set("client_secret", clientSecret);
    form.set("state", state);
  }
  if (provider === "line") {
    endpoint = "https://api.line.me/oauth2/v2.1/token";
    form.set("client_secret", clientSecret);
    form.set("code_verifier", verifier);
  }
  if (provider === "google") {
    endpoint = "https://oauth2.googleapis.com/token";
    form.set("client_secret", clientSecret);
    form.set("code_verifier", verifier);
  }
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  const payload = await readJsonResponse(response);
  if (!response.ok || typeof payload.access_token !== "string") {
    throw oauthError(401, "oauth_token_invalid", "로그인 인증을 완료하지 못했습니다.");
  }
  const expiresIn = Number(payload.expires_in);
  return {
    accessToken: payload.access_token,
    refreshToken: readOptionalString(payload.refresh_token, 8192),
    expiresAt: Number.isFinite(expiresIn) ? new Date(Date.now() + expiresIn * 1000).toISOString() : null,
  };
}

async function requestProviderIdentity(provider, accessToken, fetchImpl) {
  let endpoint;
  if (provider === "kakao") endpoint = "https://kapi.kakao.com/v2/user/me";
  if (provider === "naver") endpoint = "https://openapi.naver.com/v1/nid/me";
  if (provider === "line") endpoint = "https://api.line.me/v2/profile";
  if (provider === "google") endpoint = "https://openidconnect.googleapis.com/v1/userinfo";
  const response = await fetchImpl(endpoint, { headers: { accept: "application/json", authorization: `Bearer ${accessToken}` } });
  const payload = await readJsonResponse(response);
  if (!response.ok) throw oauthError(401, "oauth_profile_invalid", "로그인 계정을 확인하지 못했습니다.");

  const source = provider === "naver" ? payload.response : payload;
  const subject = provider === "kakao" ? String(source?.id ?? "") : String(source?.sub ?? source?.id ?? source?.userId ?? "");
  if (!subject) throw oauthError(401, "oauth_subject_missing", "로그인 계정 식별 정보를 확인하지 못했습니다.");
  const displayName = readOptionalString(
    source?.name ?? source?.nickname ?? source?.displayName ?? source?.properties?.nickname,
    100,
  );
  return { subject, displayName };
}

async function storeProviderToken(database, env, token) {
  const tokenCiphertext = await encryptProviderToken(
    { accessToken: token.accessToken, refreshToken: token.refreshToken },
    env,
  );
  await database
    .prepare(
      `INSERT INTO auth_provider_tokens (provider, subject_hash, token_ciphertext, expires_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(provider, subject_hash) DO UPDATE SET
         token_ciphertext = excluded.token_ciphertext,
         expires_at = excluded.expires_at,
         updated_at = excluded.updated_at`,
    )
    .bind(token.provider, token.subjectHash, tokenCiphertext, token.expiresAt, token.nowIso)
    .run();
}

async function revokeProviderToken(provider, token, env, fetchImpl) {
  const accessToken = token.accessToken;
  if (!accessToken) return;
  if (provider === "kakao") {
    await fetchImpl("https://kapi.kakao.com/v1/user/unlink", { method: "POST", headers: { authorization: `Bearer ${accessToken}` } });
    return;
  }
  if (provider === "naver") {
    const url = new URL("https://nid.naver.com/oauth2.0/token");
    url.searchParams.set("grant_type", "delete");
    url.searchParams.set("client_id", getProviderClientId(provider, env));
    url.searchParams.set("client_secret", getProviderClientSecret(provider, env));
    url.searchParams.set("access_token", accessToken);
    url.searchParams.set("service_provider", "NAVER");
    await fetchImpl(url.toString());
    return;
  }
  if (provider === "line") {
    const form = new URLSearchParams({
      access_token: accessToken,
      client_id: getProviderClientId(provider, env),
      client_secret: getProviderClientSecret(provider, env),
    });
    await fetchImpl("https://api.line.me/oauth2/v2.1/revoke", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    return;
  }
  if (provider === "google") {
    await fetchImpl("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: accessToken }).toString(),
    });
  }
}

function getProviderClientId(provider, env) {
  if (provider === "kakao") return readOptionalString(env.KAKAO_OAUTH_CLIENT_ID ?? env.KAKAO_REST_API_KEY, 512);
  if (provider === "naver") return readOptionalString(env.NAVER_OAUTH_CLIENT_ID, 512);
  if (provider === "line") return readOptionalString(env.LINE_OAUTH_CHANNEL_ID, 512);
  if (provider === "google") return readOptionalString(env.GOOGLE_OAUTH_CLIENT_ID, 512);
  return null;
}

function getProviderClientSecret(provider, env) {
  if (provider === "kakao") return readOptionalString(env.KAKAO_OAUTH_CLIENT_SECRET, 2048);
  if (provider === "naver") return readOptionalString(env.NAVER_OAUTH_CLIENT_SECRET, 2048);
  if (provider === "line") return readOptionalString(env.LINE_OAUTH_CHANNEL_SECRET, 2048);
  if (provider === "google") return readOptionalString(env.GOOGLE_OAUTH_CLIENT_SECRET, 2048);
  return null;
}

function readClientRedirectUri(value, env) {
  const redirectUri = readOptionalString(value, 1024) ?? DEFAULT_REDIRECT_URI;
  const allowed = String(env.OAUTH_REDIRECT_URIS ?? DEFAULT_REDIRECT_URI)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!allowed.includes(redirectUri)) throw oauthError(400, "oauth_redirect_invalid", "로그인 반환 주소가 허용되지 않았습니다.");
  return redirectUri;
}

function readProviderRedirectUri(env) {
  const value = readOptionalString(env.OAUTH_CALLBACK_URL, 1024);
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function readProvider(value) {
  if (typeof value !== "string" || !OAUTH_PROVIDERS.includes(value)) {
    throw oauthError(400, "oauth_provider_invalid", "지원하지 않는 로그인 방식입니다.");
  }
  return value;
}

async function encryptProviderToken(value, env) {
  const key = await getEncryptionKey(env);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(value)),
  );
  return `v1.${encodeBase64Url(iv)}.${encodeBase64Url(new Uint8Array(encrypted))}`;
}

async function decryptProviderToken(value, env) {
  const [version, ivPart, cipherPart] = String(value).split(".");
  if (version !== "v1" || !ivPart || !cipherPart) throw new Error("invalid encrypted token");
  const key = await getEncryptionKey(env);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: decodeBase64Url(ivPart) },
    key,
    decodeBase64Url(cipherPart),
  );
  return JSON.parse(new TextDecoder().decode(decrypted));
}

async function getEncryptionKey(env) {
  const secret = readOptionalString(env.AUTH_PROVIDER_TOKEN_KEY, 512);
  if (!secret) throw oauthError(503, "oauth_token_storage_unavailable", "로그인 보안 저장소가 설정되지 않았습니다.");
  return crypto.subtle.importKey("raw", await sha256Bytes(secret), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function readJsonObject(request) {
  try {
    const value = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("object required");
    return value;
  } catch {
    throw oauthError(400, "invalid_json", "요청 JSON 형식이 올바르지 않습니다.");
  }
}

async function readJsonResponse(response) {
  try {
    const value = await response.json();
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function readRequiredString(value, field, maxLength) {
  const normalized = readOptionalString(value, maxLength);
  if (!normalized) throw oauthError(400, "missing_field", `${field} 값이 필요합니다.`);
  return normalized;
}

function readOptionalString(value, maxLength) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) return null;
  return normalized;
}

async function sha256Hex(value) {
  return Array.from(await sha256Bytes(value), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Bytes(value) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

function randomToken(byteLength) {
  return encodeBase64Url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

function encodeBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function oauthError(status, code, message) {
  const error = new Error(message);
  error.name = "OAuthHttpError";
  error.status = status;
  error.code = code;
  return error;
}
