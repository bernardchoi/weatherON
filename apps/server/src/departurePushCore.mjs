import { sign } from "node:crypto";

export const DEPARTURE_PUSH_ROUTE = "/live-activities/departure";
const MAX_BODY_BYTES = 4096;
const MAX_LEAD_MS = 65 * 60_000;
const RETRY_WINDOW_MS = 60 * 60_000;
const providerTokenCache = new Map();

export async function handleDeparturePushRoute(request, env, { requireSession, verifyAppIntegrityRequest }) {
  try {
    if (request.method !== "POST") return result(405, "method_not_allowed");
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) return result(415, "unsupported_media_type");
    const session = await requireSession(request, env.WEATHERON_DB);
    const userId = session.user_id;
    if (typeof userId !== "string" || !userId) return result(401, "session_invalid");
    const limit = await env.DEPARTURE_PUSH_RATE_LIMITER.limit({ key: userId });
    if (!limit.success) return result(429, "rate_limited");
    if (!env.APNS_PRIVATE_KEY || !env.APNS_KEY_ID || !env.APPLE_TEAM_IDENTIFIER || !env.DEPARTURE_END) {
      return result(503, "departure_push_unavailable");
    }
    const reader = request.body?.getReader();
    if (!reader) return result(400, "invalid_json");
    let size = 0;
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); return result(413, "request_too_large"); }
      chunks.push(value);
    }
    const text = Buffer.concat(chunks).toString("utf8");
    await verifyAppIntegrityRequest(new Request(request.url, { method: "POST", headers: request.headers, body: text }), env.WEATHERON_DB, env, {
      session, routeKey: `POST ${DEPARTURE_PUSH_ROUTE}`,
    });
    let body;
    try { body = JSON.parse(text); } catch { return result(400, "invalid_json"); }
    const job = normalizeDeparturePush(body, env);
    if (!job) return result(400, "invalid_departure_push");
    if (job.pushEnvironment === "sandbox" && (!env.APNS_SANDBOX_PRIVATE_KEY || !env.APNS_SANDBOX_KEY_ID)) return result(503, "departure_push_unavailable");
    const stub = env.DEPARTURE_END.get(env.DEPARTURE_END.idFromName(`${userId}:${job.activityId}`));
    const response = await stub.fetch(new Request("https://departure.internal/schedule", { method: "POST", body: JSON.stringify(job) }));
    return { status: response.status, payload: await response.json() };
  } catch (error) {
    return result(Number(error?.status) || 502, typeof error?.code === "string" ? error.code : "departure_push_failed");
  }
}

export function normalizeDeparturePush(body, env, now = Date.now()) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const { activityId, pushToken, departureAt, bundleId, pushEnvironment } = body;
  const departureMs = Date.parse(departureAt);
  const bundleIds = (env.APP_ATTEST_BUNDLE_IDS ?? "com.weatheron.mobile").split(",").map((value) => value.trim());
  if (
    typeof activityId !== "string" || !/^[A-Za-z0-9-]{1,128}$/.test(activityId) ||
    typeof pushToken !== "string" || !/^(?:[a-f0-9]{2}){32,256}$/.test(pushToken) ||
    typeof departureAt !== "string" || !Number.isFinite(departureMs) ||
    departureMs < now - 5 * 60_000 || departureMs > now + MAX_LEAD_MS ||
    !bundleIds.includes(bundleId) || !["production", "sandbox"].includes(pushEnvironment)
  ) return null;
  return { activityId, pushToken, departureMs, bundleId, pushEnvironment };
}

// One object per activity; only its token and deadline are retained until delivery/expiry.
export class DepartureEndScheduler {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }

  async fetch(request) {
    const job = await request.json(); // Internal binding only; public input is validated above.
    await this.ctx.storage.transaction(async (storage) => {
      await storage.put("job", job);
      await storage.setAlarm(Math.max(Date.now(), job.departureMs));
    });
    return Response.json({ scheduled: true });
  }

  async alarm() {
    const job = await this.ctx.storage.get("job");
    if (!job) return;
    const now = Date.now();
    if (now < job.departureMs) { await this.ctx.storage.setAlarm(job.departureMs); return; }
    if (now >= job.departureMs + RETRY_WINDOW_MS) {
      await this.ctx.storage.deleteAll();
      console.warn(JSON.stringify({ event: "departure_end_expired" }));
      return;
    }
    // Persist the next retry before network I/O, so a crashed request cannot strand a token.
    await this.ctx.storage.setAlarm(Math.min(now + 60_000, job.departureMs + RETRY_WINDOW_MS));
    try {
      const response = await sendDepartureEndPush(job, this.env);
      if (response.ok || response.status === 410 || response.status === 400) {
        await this.ctx.storage.transaction(async (storage) => {
          const latest = await storage.get("job");
          if (latest?.pushToken === job.pushToken && latest.departureMs === job.departureMs) {
            await storage.deleteAlarm();
            await storage.delete("job");
          }
        });
      }
      const failure = response.ok ? null : await response.json().catch(() => null);
      const reason = typeof failure?.reason === "string" && /^[A-Za-z]{1,64}$/.test(failure.reason) ? failure.reason : undefined;
      console.info(JSON.stringify({ event: "departure_end_push", status: response.status, reason, environment: job.pushEnvironment }));
    } catch {
      console.warn(JSON.stringify({ event: "departure_end_retry" }));
    }
  }
}

export function departureEndPayload(departureMs, now = Date.now()) {
  return { aps: {
    timestamp: Math.floor(now / 1000),
    event: "end",
    "content-state": { guidance: "출발 시각이 되었어요", isCompleted: true },
    "dismissal-date": Math.floor(departureMs / 1000) - 1,
  } };
}

export async function sendDepartureEndPush(job, env, fetchImpl = fetch) {
  const host = job.pushEnvironment === "sandbox" ? "api.sandbox.push.apple.com" : "api.push.apple.com";
  return fetchImpl(`https://${host}/3/device/${job.pushToken}`, {
    method: "POST",
    headers: {
      authorization: `bearer ${getApnsProviderToken(env, Date.now(), job.pushEnvironment)}`,
      "apns-push-type": "liveactivity",
      "apns-topic": `${job.bundleId}.push-type.liveactivity`,
      "apns-priority": "10",
      "apns-expiration": String(Math.floor((job.departureMs + RETRY_WINDOW_MS) / 1000)),
      "content-type": "application/json",
    },
    body: JSON.stringify(departureEndPayload(job.departureMs)),
    signal: AbortSignal.timeout(15_000),
  });
}

export function getApnsProviderToken(env, now = Date.now(), environment = "production") {
  const keyId = environment === "sandbox" ? env.APNS_SANDBOX_KEY_ID : env.APNS_KEY_ID;
  const teamId = env.APPLE_TEAM_IDENTIFIER;
  const pem = environment === "sandbox" ? env.APNS_SANDBOX_PRIVATE_KEY : env.APNS_PRIVATE_KEY;
  if (!/^[A-Z0-9]{10}$/.test(keyId ?? "") || !/^[A-Z0-9]{10}$/.test(teamId ?? "") || typeof pem !== "string") throw new Error("APNs credentials missing");
  const cached = providerTokenCache.get(environment);
  if (cached?.keyId === keyId && cached.teamId === teamId && cached.pem === pem && now < cached.expiresAt) return cached.token;
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const input = `${encode({ alg: "ES256", kid: keyId })}.${encode({ iss: teamId, iat: Math.floor(now / 1000) })}`;
  const signature = sign("sha256", Buffer.from(input), { key: pem, dsaEncoding: "ieee-p1363" }).toString("base64url");
  const token = `${input}.${signature}`;
  providerTokenCache.set(environment, { keyId, teamId, pem, token, expiresAt: now + 30 * 60_000 });
  return token;
}

function result(status, error) {
  return { status, payload: { error, message: status === 401 ? "로그인이 필요해요." : "출발 표시 자동 종료를 연결하지 못했어요. 잠시 후 다시 시도해 주세요." } };
}
