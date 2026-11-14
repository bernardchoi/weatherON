// User-approved 2026-11-13: color only; source coordinates, alpha, eyes and rig preserved.
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const require=createRequire(import.meta.url); const {PNG}=require('pngjs');
const root='apps/mobile/assets/characters/';
const contract=JSON.parse(execFileSync('git',['show','4c1b37b8e0a4e4234637fd06dbde984ccb2ba177:'+root+'rain-rig-contract.json']));
for(const name of ['rain-rig-source','main-rain']){
 const p=root+name+'.png'; const png=PNG.sync.read(execFileSync('git',['show','4c1b37b8e0a4e4234637fd06dbde984ccb2ba177:'+p],{maxBuffer:20e6}));
 let changed=0;
 for(let y=0;y<png.height;y++)for(let x=0;x<png.width;x++){
  const sx=name==='main-rain'?(x-contract.outerTransform.translate[0])/contract.outerTransform.scale:x;
  const sy=name==='main-rain'?(y-contract.outerTransform.translate[1])/contract.outerTransform.scale:y;
  const face=sx>=270&&sx<=835&&sy>=480&&sy<=890;
  const belly=sx>=425&&sx<=690&&sy>=910&&sy<=1140;
  if(!face&&!belly)continue;
  const i=(y*png.width+x)*4, r=png.data[i],g=png.data[i+1],b=png.data[i+2],a=png.data[i+3];
  // Excludes teal linework/eyes/mouth, yellow accents and all transparent pixels.
  if(a===0||r<220||g<170||b<165||r-g<4||r-g>70||g-b<0||g-b>25)continue;
  const blush=Math.max(0,Math.min(1,((r-g)-25)/20));
  png.data[i+1]=Math.min(255,g+Math.round(6+10*blush));
  png.data[i+2]=Math.max(0,Math.min(255,b+Math.round(-2+12*blush)));
  changed++;
 }
 writeFileSync(p,PNG.sync.write(png));console.log(name+': '+changed+' skin pixels color-adjusted; alpha/registration untouched');
}
