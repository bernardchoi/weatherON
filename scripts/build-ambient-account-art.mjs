// Static M1/M3 matte field: deterministic curves + balanced grain, no frame/runtime generation.
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const width = 512, height = 1100, check = process.argv.includes('--check');
const gaussian = (distance, spread) => Math.exp(-distance * distance / (2 * spread * spread));
const clamp = value => Math.max(0, Math.min(255, Math.round(value)));
const luminance = rgb => rgb.map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum,v,i) => sum + v * [.2126,.7152,.0722][i], 0);
const contrast = (a,b) => (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
function save(file, bytes) {
  if (check) assert.ok(readFileSync(file).equals(bytes), `${file} must reproduce from its code source`);
  else writeFileSync(file, bytes);
  console.log(`${check ? 'PASS' : 'WROTE'} ${file} ${bytes.length} bytes ${createHash('sha256').update(bytes).digest('hex')}`);
}
for (const mode of ['light','dark']) {
  const dark = mode === 'dark', canvas = createCanvas(width,height), ctx = canvas.getContext('2d');
  const pixels = ctx.createImageData(width,height);
  const text = luminance(dark ? [246,248,255] : [17,23,56]);
  const secondary = luminance(dark ? [185,205,239] : [71,84,119]);
  const functional = luminance(dark ? [255,209,122] : [170,44,31]);
  let minimum = Infinity;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const u=x/(width-1), v=y/(height-1);
    // Sweeping off-screen folds, not bands with straight gradient boundaries.
    const warped = .008 * Math.sin(12*u+3*v) + .004 * Math.sin(31*u-9*v);
    const horizon = v + .42*u - .075*u*u + warped;
    const broad = gaussian(horizon-.46,.105) + .68*gaussian(horizon-.87,.13);
    const edge = gaussian(horizon-.36,.008) + .60*gaussian(horizon-.76,.012);
    const shoulder = gaussian(horizon-.40,.035) + .55*gaussian(horizon-.81,.043);
    const shade = gaussian(horizon-.50,.075) + .6*gaussian(horizon-.94,.09);
    const upperLight = gaussian(u-1.03,.64)*gaussian(v+.10,.43);
    // Two scales of density, fixed seed, symmetric around zero (no white veil).
    let seed = Math.imul(x+1,374761393) ^ Math.imul(y+1,668265263);
    seed = Math.imul(seed ^ (seed >>> 13),1274126177);
    const grain = (((seed ^ (seed >>> 16)) >>> 0)/4294967295-.5) * (dark ? 2.0 : 2.4);
    const density = .35*Math.sin(x*.57+y*.19)*Math.sin(y*.41-x*.13);
    const base = dark ? [10+6*upperLight,31+10*upperLight,54+17*upperLight]
      : [238-3*v-3*u,248-3*v-2*u,254.5-1.5*v];
    const rgb = base.map((channel,i) => clamp(channel + (dark
      ? [5,8,12][i]*broad + [5,6,8][i]*edge + [3,4,5][i]*shoulder - [4,6,8][i]*shade
      : [7,4,2][i]*broad + [9,6,3][i]*edge + [4,3,1][i]*shoulder - [12,9,5][i]*shade) + grain+density));
    minimum = Math.min(minimum, contrast(text,luminance(rgb)), contrast(secondary,luminance(rgb)), contrast(functional,luminance(rgb)));
    const offset=(y*width+x)*4;
    pixels.data.set([...rgb,255],offset);
  }
  assert.ok(minimum >= 4.5, `${mode} text contrast minimum ${minimum}`);
  ctx.putImageData(pixels,0,0);
  save(`assets/ambient-surface-runtime-v1/reading-account-${mode}.png`,canvas.toBuffer('image/png'));
  console.log(`${mode} every-pixel text/secondary/functional contrast >= ${minimum.toFixed(2)}:1; 512×1100 = 2.15 MiB decoded per theme`);
}
const svg=readFileSync('assets/ambient-surface-runtime-v1/source/policy-document.svg','utf8');
assert.match(svg,/viewBox="0 0 24 24"/);assert.match(svg,/stroke-width="1.75"/);assert.match(svg,/fill="none"/);
const icon=createCanvas(96,96), context=icon.getContext('2d');
context.drawImage(await loadImage(Buffer.from(svg.replace('currentColor','#111738'))),0,0,96,96);
save('assets/ambient-surface-runtime-v1/ui-outline/policy-document.png',icon.toBuffer('image/png'));
