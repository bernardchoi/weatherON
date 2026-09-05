// Run with wrangler dev --port 8798 --compatibility-date 2026-07-01 --compatibility-flags nodejs_compat scripts/check-departure-push-runtime.mjs, then curl localhost:8798.
import { getApnsProviderToken } from '../apps/server/src/departurePushCore.mjs';
export default {
  async fetch() {
    const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    const bytes = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey));
    const pem = `-----BEGIN PRIVATE KEY-----\n${btoa(String.fromCharCode(...bytes))}\n-----END PRIVATE KEY-----`;
    const token = getApnsProviderToken({ APNS_PRIVATE_KEY: pem, APNS_KEY_ID: 'ABCDEFGHIJ', APPLE_TEAM_IDENTIFIER: 'KLMNOPQRST' });
    const parts = token.split('.');
    const valid = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pair.publicKey, Buffer.from(parts[2], 'base64url'), new TextEncoder().encode(parts.slice(0, 2).join('.')));
    if (!valid) throw new Error('APNs JWT signature verification failed');
    return Response.json({ ok: true, runtime: 'workerd', signatureVerified: true });
  },
};
