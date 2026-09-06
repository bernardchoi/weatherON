import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const platform = { OS: 'android' };
let result, stored, exchanges;
const account = { userId: 'test-user', provider: 'google', termsAccepted: true };
const mocks = {
  'react-native': { Platform: platform },
  'expo-crypto': {},
  '../config/accountEnv': { getAccountRuntimeConfig: () => ({ apiBaseUrl: 'https://test.invalid', timeoutMs: 1000 }) },
  '../utils/httpJson': { normalizeBaseUrl: v => v },
  './appIntegrity': { rememberIntegrityUser: async () => {}, ensureAppAttestEnrollment: async () => {} },
  'expo-web-browser': { openAuthSessionAsync: async () => result },
  'expo-secure-store': { setItemAsync: async (_, value) => { stored = value; } },
  'expo/fetch': { fetch: async (url) => {
    const exchange = url.endsWith('/exchange');
    if (exchange) exchanges++;
    return { ok: true, text: async () => JSON.stringify(exchange
      ? { account, sessionToken: 'test-session', expiresAt: 'later' }
      : { state: 'expected', challengeId: 'challenge', verifier: 'verifier', authorizationUrl: 'https://test.invalid/login' }) };
  } },
};
const source = readFileSync('apps/mobile/src/providers/accountAuth.ts', 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
vm.runInNewContext(js, { exports, require: name => { assert.ok(name in mocks, name); return mocks[name]; }, URL, AbortController, setTimeout, clearTimeout, console });
for (const provider of ['kakao', 'naver', 'line', 'google']) {
  stored = null; exchanges = 0;
  result = { type: 'success', url: 'weatheron://oauth/callback?state=expected&code=test' };
  assert.equal((await exports.signInWithOAuthAccount(provider)).account.userId, 'test-user');
  assert.equal(stored, 'test-session');
  assert.equal(exchanges, 1);
}
for (const response of [
  { type: 'cancel' },
  { type: 'success', url: 'weatheron://oauth/callback?state=wrong&code=test' },
  { type: 'success', url: 'weatheron://oauth/other?state=expected&code=test' },
  { type: 'success', url: 'weatheron://oauth/callback?state=expected&error=denied' },
]) {
  result = response; stored = null; exchanges = 0;
  await assert.rejects(exports.signInWithOAuthAccount('google'));
  assert.equal(stored, null);
  assert.equal(exchanges, 0);
}
await assert.rejects(exports.signInWithAppleAccount(), e => e.code === 'apple_unavailable');
platform.OS = 'web';
await assert.rejects(exports.signInWithOAuthAccount('google'), e => e.code === 'oauth_unavailable');
console.log('Android OAuth: four providers, cancellation, callback/state validation, Apple exclusion passed');
