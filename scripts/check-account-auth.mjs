import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import worker from "../apps/server/src/worker.mjs";

class D1DatabaseAdapter {
  constructor(database) {
    this.database = database;
  }

  prepare(sql) {
    return new D1PreparedStatementAdapter(this.database, sql);
  }

  async batch(statements) {
    this.database.exec("BEGIN IMMEDIATE");
    try {
      const results = [];
      for (const statement of statements) results.push(await statement.run());
      this.database.exec("COMMIT");
      return results;
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
  }
}

class D1PreparedStatementAdapter {
  constructor(database, sql, values = []) {
    this.database = database;
    this.sql = sql;
    this.values = values;
  }

  bind(...values) {
    return new D1PreparedStatementAdapter(this.database, this.sql, values);
  }

  async first() {
    return this.database.prepare(this.sql).get(...this.values) ?? null;
  }

  async run() {
    const result = this.database.prepare(this.sql).run(...this.values);
    return { success: true, meta: { changes: Number(result.changes) } };
  }
}

const sqlite = new DatabaseSync(":memory:");
sqlite.exec(readFileSync(new URL("../apps/server/migrations/0001_account_auth.sql", import.meta.url), "utf8"));
const database = new D1DatabaseAdapter(sqlite);
const keyPair = await crypto.subtle.generateKey(
  {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  },
  true,
  ["sign", "verify"],
);
const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
const keyId = "weatheron-test-key";
const originalFetch = globalThis.fetch;

globalThis.fetch = async (input, init) => {
  if (String(input) === "https://appleid.apple.com/auth/keys") {
    return Response.json({ keys: [{ ...publicJwk, kid: keyId, use: "sig", alg: "RS256" }] });
  }
  return originalFetch(input, init);
};

const env = {
  WEATHERON_DB: database,
  APPLE_CLIENT_IDS: "com.weatheron.mobile,com.weatheron.mobile.dev",
  WEATHERON_TERMS_VERSION: "2026-08-08",
};

try {
  const challengeResponse = await requestJson("/auth/apple/challenge", { method: "POST" });
  assert.equal(challengeResponse.response.status, 201);
  assert.ok(challengeResponse.body.challengeId);
  assert.ok(challengeResponse.body.nonce);
  assert.ok(challengeResponse.body.state);

  const nowSeconds = Math.floor(Date.now() / 1000);
  const identityToken = await createAppleIdentityToken({
    keyId,
    privateKey: keyPair.privateKey,
    claims: {
      iss: "https://appleid.apple.com",
      aud: "com.weatheron.mobile",
      exp: nowSeconds + 600,
      iat: nowSeconds,
      sub: "apple-test-user",
      email: "weatheron-test@privaterelay.appleid.com",
      nonce: await sha256Hex(challengeResponse.body.nonce),
    },
  });

  const exchangePayload = {
    challengeId: challengeResponse.body.challengeId,
    nonce: challengeResponse.body.nonce,
    state: challengeResponse.body.state,
    identityToken,
    user: "apple-test-user",
    displayName: "WeatherON Tester",
  };
  const exchange = await requestJson("/auth/apple/exchange", { method: "POST", body: exchangePayload });
  assert.equal(exchange.response.status, 200);
  assert.ok(exchange.body.sessionToken);
  assert.equal(exchange.body.account.provider, "apple");
  assert.equal(exchange.body.account.termsAccepted, false);

  const replay = await requestJson("/auth/apple/exchange", { method: "POST", body: exchangePayload });
  assert.equal(replay.response.status, 409, `Apple challenge must be single-use: ${JSON.stringify(replay.body)}`);

  const authorization = `Bearer ${exchange.body.sessionToken}`;
  const session = await requestJson("/auth/session", { headers: { authorization } });
  assert.equal(session.response.status, 200);
  assert.equal(session.body.account.email, "weatheron-test@privaterelay.appleid.com");

  const terms = await requestJson("/account/terms", {
    method: "POST",
    headers: { authorization },
    body: { requiredAccepted: true, marketingAccepted: false },
  });
  assert.equal(terms.response.status, 200);
  assert.equal(terms.body.account.termsAccepted, true);

  const logout = await requestJson("/auth/logout", { method: "POST", headers: { authorization } });
  assert.equal(logout.response.status, 200);
  const expiredSession = await requestJson("/auth/session", { headers: { authorization } });
  assert.equal(expiredSession.response.status, 401);

  console.log("account auth check passed");
} finally {
  globalThis.fetch = originalFetch;
  sqlite.close();
}

async function requestJson(path, { method = "GET", headers = {}, body } = {}) {
  const response = await worker.fetch(
    new Request(`https://weatheron-api.test${path}`, {
      method,
      headers: { ...headers, ...(body ? { "content-type": "application/json" } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
    env,
  );
  return { response, body: JSON.parse(await response.text()) };
}

async function createAppleIdentityToken({ keyId: kid, privateKey, claims }) {
  const headerPart = encodeBase64Url(JSON.stringify({ alg: "RS256", kid, typ: "JWT" }));
  const payloadPart = encodeBase64Url(JSON.stringify(claims));
  const signingInput = `${headerPart}.${payloadPart}`;
  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    privateKey,
    new TextEncoder().encode(signingInput),
  );
  return `${signingInput}.${encodeBase64Url(new Uint8Array(signature))}`;
}

function encodeBase64Url(value) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  return Buffer.from(bytes).toString("base64url");
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Buffer.from(digest).toString("hex");
}
