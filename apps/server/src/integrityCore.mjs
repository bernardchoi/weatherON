import { Buffer } from "node:buffer";
import { verifyAssertion, verifyAttestation } from "node-app-attest";

export const INTEGRITY_HEADERS = Object.freeze({
  assertion: "x-weatheron-integrity-assertion",
  challenge: "x-weatheron-integrity-challenge",
  challengeId: "x-weatheron-integrity-challenge-id",
  keyId: "x-weatheron-integrity-key-id",
});

const DEFAULT_CHALLENGE_TTL_SECONDS = 2 * 60;
const MAX_JSON_BODY_BYTES = 96 * 1024;
const MAX_WARDROBE_BODY_BYTES = 1_600_000;
const PROTECTED_PURPOSES = new Set([
  "GET /auth/session",
  "POST /auth/logout",
  "POST /account/terms",
  "POST /account/delete",
  "POST /wardrobe/analyze",
]);

export function isAppIntegrityRoute(pathname) {
  return pathname.startsWith("/app-integrity/");
}

export async function handleAppIntegrityRoute(request, env = {}, { requireSession }) {
  try {
    const database = requireDatabase(env);
    const session = await requireSession(request, database);
    const url = new URL(request.url);
    const routeKey = `${request.method.toUpperCase()} ${url.pathname}`;
    if (routeKey === "POST /app-integrity/challenge") return await createChallenge(request, database, env, session);
    if (routeKey === "POST /app-integrity/attest") return await registerAttestation(request, database, env, session);
    if (routeKey === "GET /app-integrity/status") return await readIntegrityStatus(database, env, session);
    throw new IntegrityHttpError(404, "not_found", "요청한 앱 무결성 API가 없습니다.");
  } catch (error) {
    return integrityErrorResult(error);
  }
}

export async function verifyAppIntegrityRequest(request, database, env, { session, routeKey }) {
  const mode = readIntegrityMode(env);
  if (mode === "off" || !PROTECTED_PURPOSES.has(routeKey)) return { status: "off", mode };

  try {
    const keyId = readHeader(request, INTEGRITY_HEADERS.keyId, 512);
    const challengeId = readHeader(request, INTEGRITY_HEADERS.challengeId, 120);
    const challengeValue = readHeader(request, INTEGRITY_HEADERS.challenge, 512);
    const assertionBase64 = readHeader(request, INTEGRITY_HEADERS.assertion, 24_000);
    if (!keyId || !challengeId || !challengeValue || !assertionBase64) {
      throw new IntegrityHttpError(401, "integrity_assertion_missing", "앱 무결성 확인 정보가 없습니다.");
    }

    const nowIso = new Date().toISOString();
    const challenge = await database
      .prepare(
        `SELECT id, user_id, session_id, challenge_hash, purpose, expires_at, consumed_at
         FROM app_integrity_challenges WHERE id = ?`,
      )
      .bind(challengeId)
      .first();
    if (
      !challenge ||
      challenge.consumed_at ||
      challenge.expires_at <= nowIso ||
      challenge.user_id !== session.user_id ||
      challenge.session_id !== session.session_id ||
      challenge.purpose !== routeKey ||
      challenge.challenge_hash !== (await sha256Hex(challengeValue))
    ) {
      throw new IntegrityHttpError(409, "integrity_challenge_invalid", "앱 무결성 challenge가 만료되었거나 일치하지 않습니다.");
    }

    const consumeResult = await database
      .prepare(
        "UPDATE app_integrity_challenges SET consumed_at = ? WHERE id = ? AND consumed_at IS NULL AND expires_at > ?",
      )
      .bind(nowIso, challengeId, nowIso)
      .run();
    if (Number(consumeResult?.meta?.changes ?? 0) !== 1) {
      throw new IntegrityHttpError(409, "integrity_challenge_used", "이미 사용한 앱 무결성 challenge입니다.");
    }

    const key = await database
      .prepare(
        `SELECT key_id, user_id, public_key_pem, assertion_counter, bundle_identifier, status
         FROM app_integrity_keys WHERE key_id = ?`,
      )
      .bind(keyId)
      .first();
    if (!key || key.status !== "active" || key.user_id !== session.user_id) {
      throw new IntegrityHttpError(401, "integrity_key_unregistered", "등록되지 않은 앱 무결성 키입니다.");
    }

    const bodyText = await readBodyText(
      request,
      routeKey === "POST /wardrobe/analyze" ? MAX_WARDROBE_BODY_BYTES : MAX_JSON_BODY_BYTES,
    );
    const clientData = JSON.stringify({
      challenge: challengeValue,
      method: request.method.toUpperCase(),
      path: new URL(request.url).pathname,
      bodyHash: await sha256Hex(bodyText),
    });
    const result = verifyAssertion({
      assertion: decodeBase64(assertionBase64, "assertion"),
      payload: clientData,
      publicKey: key.public_key_pem,
      bundleIdentifier: key.bundle_identifier,
      teamIdentifier: readTeamIdentifier(env),
      signCount: Number(key.assertion_counter),
    });
    const updateResult = await database
      .prepare(
        `UPDATE app_integrity_keys
         SET assertion_counter = ?, last_asserted_at = ?, updated_at = ?
         WHERE key_id = ? AND assertion_counter < ? AND status = 'active'`,
      )
      .bind(result.signCount, nowIso, nowIso, keyId, result.signCount)
      .run();
    if (Number(updateResult?.meta?.changes ?? 0) !== 1) {
      throw new IntegrityHttpError(409, "integrity_assertion_replayed", "앱 무결성 assertion이 재사용됐습니다.");
    }
    return { status: "verified", mode, keyId };
  } catch (error) {
    const normalized = normalizeIntegrityError(error);
    await recordIntegrityEvent(database, {
      userId: session.user_id,
      sessionId: session.session_id,
      routeKey,
      outcome: "failed",
      code: normalized.code,
    });
    console.warn(JSON.stringify({ event: "app_integrity_failed", route: routeKey, code: normalized.code, mode }));
    if (mode === "enforce") throw normalized;
    return { status: "failed", mode, code: normalized.code };
  }
}

async function createChallenge(request, database, env, session) {
  const body = await readJsonObject(request);
  const purpose = readRequiredString(body.purpose, "purpose", 120);
  if (purpose !== "attestation" && !PROTECTED_PURPOSES.has(purpose)) {
    throw new IntegrityHttpError(400, "integrity_purpose_invalid", "지원하지 않는 앱 무결성 요청입니다.");
  }
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const challengeId = crypto.randomUUID();
  const challenge = randomToken(32);
  const expiresAt = new Date(now + readChallengeTtl(env) * 1000).toISOString();
  await database.batch([
    database.prepare("DELETE FROM app_integrity_challenges WHERE expires_at < ? OR consumed_at IS NOT NULL").bind(nowIso),
    database
      .prepare(
        `INSERT INTO app_integrity_challenges
         (id, user_id, session_id, challenge_hash, purpose, expires_at, consumed_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NULL, ?)`,
      )
      .bind(challengeId, session.user_id, session.session_id, await sha256Hex(challenge), purpose, expiresAt, nowIso),
  ]);
  return { status: 201, payload: { challengeId, challenge, purpose, expiresAt } };
}

async function registerAttestation(request, database, env, session) {
  const body = await readJsonObject(request);
  const challengeId = readRequiredString(body.challengeId, "challengeId", 120);
  const challengeValue = readRequiredString(body.challenge, "challenge", 512);
  const keyId = readRequiredString(body.keyId, "keyId", 512);
  const deviceId = readRequiredString(body.deviceId, "deviceId", 120);
  const attestationBase64 = readRequiredString(body.attestationObject, "attestationObject", 96_000);
  const nowIso = new Date().toISOString();
  const challenge = await database
    .prepare(
      `SELECT id, user_id, session_id, challenge_hash, purpose, expires_at, consumed_at
       FROM app_integrity_challenges WHERE id = ?`,
    )
    .bind(challengeId)
    .first();
  if (
    !challenge ||
    challenge.consumed_at ||
    challenge.expires_at <= nowIso ||
    challenge.user_id !== session.user_id ||
    challenge.session_id !== session.session_id ||
    challenge.purpose !== "attestation" ||
    challenge.challenge_hash !== (await sha256Hex(challengeValue))
  ) {
    throw new IntegrityHttpError(409, "integrity_challenge_invalid", "앱 무결성 challenge가 만료되었거나 일치하지 않습니다.");
  }
  const consumed = await database
    .prepare("UPDATE app_integrity_challenges SET consumed_at = ? WHERE id = ? AND consumed_at IS NULL AND expires_at > ?")
    .bind(nowIso, challengeId, nowIso)
    .run();
  if (Number(consumed?.meta?.changes ?? 0) !== 1) {
    throw new IntegrityHttpError(409, "integrity_challenge_used", "이미 사용한 앱 무결성 challenge입니다.");
  }

  let verified;
  let bundleIdentifier;
  let lastError;
  for (const candidate of readBundleIdentifiers(env)) {
    try {
      verified = verifyAttestation({
        attestation: decodeBase64(attestationBase64, "attestationObject"),
        challenge: challengeValue,
        keyId,
        bundleIdentifier: candidate,
        teamIdentifier: readTeamIdentifier(env),
        allowDevelopmentEnvironment: readBoolean(env.APP_ATTEST_ALLOW_DEVELOPMENT),
      });
      bundleIdentifier = candidate;
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (!verified || !bundleIdentifier) {
    await recordIntegrityEvent(database, {
      userId: session.user_id,
      sessionId: session.session_id,
      routeKey: "POST /app-integrity/attest",
      outcome: "failed",
      code: "integrity_attestation_invalid",
    });
    console.warn(JSON.stringify({
      event: "app_attestation_failed",
      code: "integrity_attestation_invalid",
      reason: lastError instanceof Error ? lastError.message : "verification_failed",
    }));
    throw new IntegrityHttpError(401, "integrity_attestation_invalid", "Apple App Attest 검증에 실패했습니다.");
  }

  await database.batch([
    database
      .prepare("UPDATE app_integrity_keys SET status = 'replaced', updated_at = ? WHERE user_id = ? AND device_id = ? AND key_id <> ?")
      .bind(nowIso, session.user_id, deviceId, keyId),
    database
      .prepare(
        `INSERT INTO app_integrity_keys
         (key_id, user_id, device_id, public_key_pem, bundle_identifier, environment, assertion_counter, status, created_at, updated_at, last_asserted_at)
         VALUES (?, ?, ?, ?, ?, ?, 0, 'active', ?, ?, NULL)
         ON CONFLICT(key_id) DO UPDATE SET
           user_id = excluded.user_id,
           device_id = excluded.device_id,
           public_key_pem = excluded.public_key_pem,
           bundle_identifier = excluded.bundle_identifier,
           environment = excluded.environment,
           assertion_counter = 0,
           status = 'active',
           updated_at = excluded.updated_at`,
      )
      .bind(
        keyId,
        session.user_id,
        deviceId,
        verified.publicKey,
        bundleIdentifier,
        verified.environment,
        nowIso,
        nowIso,
      ),
  ]);
  return { status: 200, payload: { registered: true, keyId, environment: verified.environment } };
}

async function readIntegrityStatus(database, env, session) {
  const rows = await database
    .prepare(
      `SELECT key_id, device_id, environment, assertion_counter, status, created_at, updated_at, last_asserted_at
       FROM app_integrity_keys WHERE user_id = ? AND status = 'active' ORDER BY updated_at DESC`,
    )
    .bind(session.user_id)
    .all();
  return { status: 200, payload: { mode: readIntegrityMode(env), devices: rows?.results ?? [] } };
}

async function recordIntegrityEvent(database, { userId, sessionId, routeKey, outcome, code }) {
  try {
    await database
      .prepare(
        `INSERT INTO app_integrity_events (id, user_id, session_id, route_key, outcome, code, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(crypto.randomUUID(), userId ?? null, sessionId ?? null, routeKey, outcome, code, new Date().toISOString())
      .run();
  } catch (error) {
    console.error(JSON.stringify({ event: "app_integrity_event_write_failed", reason: error instanceof Error ? error.message : String(error) }));
  }
}

function integrityErrorResult(error) {
  const normalized = normalizeIntegrityError(error);
  return { status: normalized.status, payload: { error: normalized.code, message: normalized.message } };
}

function normalizeIntegrityError(error) {
  if (error instanceof IntegrityHttpError) return error;
  return new IntegrityHttpError(401, "integrity_verification_failed", "앱 무결성을 확인하지 못했습니다.");
}

function requireDatabase(env) {
  if (!env.WEATHERON_DB) throw new IntegrityHttpError(503, "account_storage_unavailable", "계정 저장소가 아직 연결되지 않았습니다.");
  return env.WEATHERON_DB;
}

async function readJsonObject(request) {
  const text = await readBodyText(request);
  try {
    const value = text ? JSON.parse(text) : {};
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("object required");
    return value;
  } catch {
    throw new IntegrityHttpError(400, "invalid_json", "요청 JSON 형식이 올바르지 않습니다.");
  }
}

async function readBodyText(request, maxBytes = MAX_JSON_BODY_BYTES) {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new IntegrityHttpError(413, "request_too_large", "요청 데이터가 너무 큽니다.");
  }
  return text;
}

function readHeader(request, name, maxLength) {
  const value = request.headers.get(name)?.trim() ?? "";
  return value && value.length <= maxLength ? value : null;
}

function readRequiredString(value, field, maxLength) {
  if (typeof value !== "string" || !value.trim() || value.length > maxLength) {
    throw new IntegrityHttpError(400, "missing_field", `${field} 값이 필요합니다.`);
  }
  return value.trim();
}

function decodeBase64(value, field) {
  try {
    const decoded = Buffer.from(value, "base64");
    if (!decoded.length) throw new Error("empty");
    return decoded;
  } catch {
    throw new IntegrityHttpError(400, "invalid_field", `${field} 형식이 올바르지 않습니다.`);
  }
}

function readIntegrityMode(env) {
  const value = String(env.APP_INTEGRITY_MODE ?? "monitor").toLowerCase();
  return value === "off" || value === "enforce" ? value : "monitor";
}

function readTeamIdentifier(env) {
  const value = String(env.APPLE_TEAM_IDENTIFIER ?? "").trim();
  if (!value) throw new IntegrityHttpError(503, "integrity_server_not_configured", "Apple Team ID가 설정되지 않았습니다.");
  return value;
}

function readBundleIdentifiers(env) {
  const values = String(env.APP_ATTEST_BUNDLE_IDS ?? env.APPLE_CLIENT_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (!values.length) throw new IntegrityHttpError(503, "integrity_server_not_configured", "App Attest Bundle ID가 설정되지 않았습니다.");
  return values;
}

function readChallengeTtl(env) {
  const value = Number(env.APP_INTEGRITY_CHALLENGE_TTL_SECONDS);
  return Number.isSafeInteger(value) && value > 0 ? value : DEFAULT_CHALLENGE_TTL_SECONDS;
}

function readBoolean(value) {
  return String(value ?? "").toLowerCase() === "true";
}

function randomToken(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Buffer.from(digest).toString("hex");
}

export class IntegrityHttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
