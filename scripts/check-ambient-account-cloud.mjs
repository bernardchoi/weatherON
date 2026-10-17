// Synthetic M1/M3 render review. React Native Web is not UIKit/iPhone QA.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(process.argv[2] || '/tmp/weatheron-ambient-account-cloud');
const require = createRequire(root + '/package.json');
const puppeteer = require('puppeteer');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
fs.mkdirSync(output, { recursive: true });
const records = [];
const previousReview = process.argv[3] ? path.resolve(process.argv[3]) : null;
const baseline = '02f68c1b5d7240b3e2b62728610c893715334edb';
const standard = { width: 390, height: 844, scale: 1, lang: 'ko' };
const cases = [standard, { width: 440, height: 956, scale: 1, lang: 'ko' },
  { width: 320, height: 568, scale: 1.6, lang: 'en' },
  { width: 320, height: 568, scale: 2, lang: 'ja' }];

// Serve only public app artwork/fonts and this generated fixture, never repo config.
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const asset = url.pathname.startsWith('/repo/');
  const file = asset ? path.resolve(root, url.pathname.slice(6))
    : path.resolve(output, url.pathname === '/' ? 'index.html' : url.pathname.slice(1));
  const allowed = asset ? file.startsWith(root + '/assets/') || file.startsWith(root + '/apps/mobile/assets/fonts/')
    : ['index.html', 'bundle.js'].includes(path.relative(output, file));
  if (!allowed) { response.writeHead(403).end(); return; }
  try {
    const types = { '.js': 'text/javascript', '.html': 'text/html', '.png': 'image/png', '.otf': 'font/otf' };
    response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    response.end(fs.readFileSync(file));
  } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await puppeteer.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true, args: ['--no-sandbox'] });

async function capture(stage, route, mode, variant = standard, extra = {}) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  try {
    await page.setViewport({ width: variant.width, height: variant.height, deviceScaleFactor: 1 });
    const params = new URLSearchParams({ route, mode, scale: String(variant.scale), lang: variant.lang, ...extra });
    await page.goto(`http://127.0.0.1:${server.address().port}/?${params}`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    const name = `${stage}-${route}-${mode}-${variant.width}-${variant.scale}-${variant.lang}${extra.account ? '-' + extra.account : ''}${extra.needs ? '-' + extra.needs : ''}${extra.reduce ? '-reduced' : ''}`;
    const geometry = await page.evaluate(() => {
      const scroll = [...document.querySelectorAll('div')].find(e => getComputedStyle(e).overflowY === 'auto');
      return { viewport: scroll.clientHeight, content: scroll.scrollHeight, horizontalOverflow: scroll.scrollWidth > scroll.clientWidth + 1,
        clippedControls: [...document.querySelectorAll('[role=button],[role=switch]')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.getAttribute('aria-label')),
        shortControls: [...document.querySelectorAll('[role=button],[role=switch]')].filter(e => e.getBoundingClientRect().height < 43.5).length,
        loadedImages: [...document.images].every(e => e.complete && e.naturalWidth > 0),
        koreanInForeignText: window.fixture.scale > 1 && /[가-힣]/.test(document.body.innerText) };
    });
    assert.deepEqual(errors, [], name + ' runtime error');
    assert.equal(geometry.loadedImages, true, name + ' missing image');
    if (stage === 'after') {
      assert.equal(geometry.horizontalOverflow, false, name + ' horizontal overflow');
      assert.deepEqual(geometry.clippedControls, [], name + ' clipped control');
      assert.equal(geometry.shortControls, 0, name + ' control under 44px');
      assert.equal(geometry.koreanInForeignText, false, name + ' untranslated Korean');
      if (!extra.account && !extra.needs && variant.scale === 1) assert.equal(geometry.content, geometry.viewport, name + ' default overflow');
    }
    await page.screenshot({ path: path.join(output, name + '.png') });
    await page.evaluate(() => {
      const scroll = [...document.querySelectorAll('div')].find(e => getComputedStyle(e).overflowY === 'auto');
      scroll.scrollTop = scroll.scrollHeight;
    });
    const lastVisible = await page.evaluate(() => {
      const version = [...document.querySelectorAll('div')].find(e => e.childNodes.length === 1 && e.textContent === 'WeatherON v1.0.0');
      const rect = version.getBoundingClientRect();
      return rect.top >= 59 && rect.bottom <= innerHeight - 88 + 1;
    });
    if (stage === 'after') assert.equal(lastVisible, true, name + ' last item inaccessible');
    if (variant.scale > 1) await page.screenshot({ path: path.join(output, name + '-bottom.png') });
    if (stage === 'after' && variant === standard && mode === 'light' && !extra.needs && !extra.reduce) {
      if (route === 'M1') {
        for (const label of [extra.account === 'connected' ? '관리' : extra.account === 'terms' ? '약관 동의' : '계정 연결', '앱 권한 관리', '스마트 알림 설정', '표시 설정', '정책 및 법적 고지']) {
          const button = await page.$(`[aria-label="${label}"]`); await button.click();
        }
        assert.deepEqual(await page.evaluate(() => window.actions), [extra.account === 'connected' ? 'A4' : 'gate', 'M4', 'M2', 'M3', 'R1']);
      } else {
        for (const label of ['온도 °F', '거리 마일', '테마 다크']) {
          const button = await page.$(`[aria-label="${label}"]`); await button.click();
          await page.waitForFunction(label => document.querySelector(`[aria-label="${label}"]`).getAttribute('aria-selected') === 'true', {}, label);
        }
        const toggle = await page.$('[role=switch]'); await toggle.click();
        await page.waitForFunction(() => document.querySelector('[role=switch]').getAttribute('aria-checked') === 'true');
        const back = await page.$('[aria-label="뒤로"]'); await back.click();
        assert.deepEqual(await page.evaluate(() => window.actions), ['M1']);
      }
    }
    records.push({ stage, route, mode, ...variant, ...extra, ...geometry, lastVisible });
  } finally { await page.close(); }
}
function build(before) {
  const env = { ...process.env };
  if (before) env.WEATHERON_CLOUD_BASELINE = baseline; else delete env.WEATHERON_CLOUD_BASELINE;
  execFileSync(process.execPath, [path.join(root, 'scripts/build-ambient-account-cloud.mjs'), output], { cwd: root, env, stdio: 'pipe' });
}
try {
  build(true);
  for (const route of ['M1', 'M3']) for (const mode of ['light', 'dark']) await capture('before', route, mode);
  build(false);
  for (const route of ['M1', 'M3']) for (const mode of ['light', 'dark']) {
    for (const variant of cases) await capture('after', route, mode, variant);
    await capture('after', route, mode, standard, { reduce: '1' });
  }
  for (const account of ['terms', 'connected']) for (const mode of ['light', 'dark']) await capture('after', 'M1', mode, standard, { account });
  for (const needs of ['location', 'notification']) await capture('after', 'M1', 'light', standard, { needs });
  GlobalFonts.registerFromPath(path.join(root, 'apps/mobile/assets/fonts/Pretendard-Regular.otf'), 'Pretendard');
  for (const route of ['M1', 'M3']) for (const mode of ['light', 'dark']) {
    const core = route === 'M1';
    const file = path.join(root, 'docs/design/ambient-surface-pages-20261009', core ? 'WeatherON-01A-Core-Weather-20261009' : 'WeatherON-04A-Account-iOS-20261009', 'images', core ? `01-core-ios-${mode}-v3.png` : `06-settings-ios-${mode}-v3.png`);
    const reference = await loadImage(file);
    const crop = core ? [1149, 77, 352, 852] : mode === 'light' ? [84, 60, 433, 862] : [92, 63, 426, 876];
    const canvas = createCanvas(1170, 1010), ctx = canvas.getContext('2d');
    ctx.fillStyle = '#edf2f7'; ctx.fillRect(0, 0, 1170, 1010); ctx.fillStyle = '#111738'; ctx.font = '18px Pretendard';
    ctx.fillText('승인 v3 (폭만 정규화)', 12, 28); ctx.fillText('수정 전 · Cloud', 402, 28); ctx.fillText('수정 후 · Cloud', 792, 28);
    ctx.drawImage(reference, ...crop, 0, 45, 390, crop[3] * 390 / crop[2]);
    for (const [index, stage] of ['before', 'after'].entries()) ctx.drawImage(await loadImage(path.join(output, `${stage}-${route}-${mode}-390-1-ko.png`)), 390 * (index + 1), 45);
    ctx.fillText('원본 / RN Web 대체 재질 비교 · UIKit Glass, iPhone, 햅틱 검증 아님', 12, 995);
    fs.writeFileSync(path.join(output, `comparison-${route}-${mode}.png`), canvas.toBuffer('image/png'));
    if (previousReview) {
      const review = createCanvas(1170,1100), surface = review.getContext('2d');
      surface.fillStyle='#edf2f7';surface.fillRect(0,0,1170,1100);
      surface.drawImage(reference,...crop,0,60,390,crop[3]*390/crop[2]);
      surface.drawImage(await loadImage(path.join(previousReview,`after-${route}-${mode}-390-1-ko.png`)),390,60);
      surface.drawImage(await loadImage(path.join(output,`after-${route}-${mode}-390-1-ko.png`)),780,60);
      // Paint labels last so no source crop can cover them.
      surface.fillStyle='#edf2f7';surface.fillRect(0,0,1170,55);
      surface.fillStyle='#111738';surface.font='20px Pretendard';
      surface.fillText('승인 v3 · 폭 정규화',12,32);surface.fillText('1차 수정 · Cloud',402,32);surface.fillText('깊이·아이콘 완성 · Cloud',792,32);
      surface.font='18px Pretendard';surface.fillText('합성 데이터 / RN Web / 정적 표면 · UIKit Glass, iPhone, 햅틱 검증 아님',12,1080);
      fs.writeFileSync(path.join(output,`completion-${route}-${mode}.png`),review.toBuffer('image/png'));
    }

  }
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ baseline, boundary: 'Actual screen JSX + RN Web, synthetic iOS Platform and fontScale, fixed safe area 59/88, native Glass unavailable: opaque fallback. No UIKit, device, persistence, live account or physical haptic validation.', records }, null, 2));
  console.log(`PASS ${records.length} cloud renders: M1/M3 light/dark, default/large/small, EN/JA fontScale, account/permission/transparency states; images, 44px targets, horizontal overflow, last-item scroll access and mocked callbacks. ${output}`);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
