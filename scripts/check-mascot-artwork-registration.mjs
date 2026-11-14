// Protect approved geometry while presentation polish is in progress.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const {PNG}=createRequire(import.meta.url)('pngjs');
const files = execFileSync('git', ['ls-files', 'apps/mobile/assets/characters'], {encoding:'utf8'}).trim().split('\n');
for (const file of files) {
  if(file.endsWith('/rain-rig-source.png') || file.endsWith('/main-rain.png')) continue;
  assert.deepEqual(readFileSync(file), execFileSync('git', ['show', `4c1b37b8e0a4e4234637fd06dbde984ccb2ba177:${file}`], {maxBuffer: 20 * 1024 * 1024}), `Approved artwork/contract changed: ${file}`);
}
const png=readFileSync('apps/mobile/assets/characters/rain-rig-source.png');
assert.equal(png.readUInt32BE(16),1199); assert.equal(png.readUInt32BE(20),1312);
const contract=JSON.parse(readFileSync('apps/mobile/assets/characters/rain-rig-contract.json','utf8'));
assert.deepEqual(contract.sourceSize,[1199,1312]); assert.deepEqual(contract.rotationOrigin,[720,940]);
assert.equal(contract.maxAngleDegrees,0.6);
for(const name of ['rain-rig-source','main-rain']) {
 const path=`apps/mobile/assets/characters/${name}.png`;
 const old=PNG.sync.read(execFileSync('git',['show','4c1b37b8e0a4e4234637fd06dbde984ccb2ba177:'+path],{maxBuffer:20e6}));
 const now=PNG.sync.read(readFileSync(path));
 assert.equal(old.width,now.width);assert.equal(old.height,now.height);let count=0;
 for(let i=0;i<old.data.length;i+=4){
  assert.equal(now.data[i+3],old.data[i+3],`alpha ${name}:${i}`);
  assert.equal(now.data[i],old.data[i],`red ${name}:${i}`);
  if(old.data[i+1]===now.data[i+1]&&old.data[i+2]===now.data[i+2])continue;
  count++;
  let x=(i/4)%old.width,y=Math.floor(i/4/old.width);
  if(name==='main-rain'){x=(x-contract.outerTransform.translate[0])/contract.outerTransform.scale;y=(y-contract.outerTransform.translate[1])/contract.outerTransform.scale;}
  assert.ok((x>=270&&x<=835&&y>=480&&y<=890)||(x>=425&&x<=690&&y>=910&&y<=1140),'outside face/belly');
  const [r,g,b,a]=old.data.subarray(i,i+4);
  assert.ok(a>0&&r>=220&&g>=170&&b>=165&&r-g>=4&&r-g<=70&&g-b>=0&&g-b<=25,'non-skin altered');
 }
 assert.ok(count>0); console.log(`PASS ${name}: ${count} skin pixels; every alpha/red byte and all non-skin pixels preserved.`);
}
console.log(`PASS: 11 other artwork/contracts byte-identical; source size/pivot/rotation preserved.`);
