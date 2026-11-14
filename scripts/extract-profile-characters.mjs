// Deterministic extraction from approved sheets. No redraw/recolor or generated replacement.
// Usage: node scripts/extract-profile-characters.mjs <directory containing original sheets>
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const dir=process.argv[2]; if(!dir) throw new Error('Original sheet directory required');
const sources=['WeatherON-profile-11-proposal.png','WeatherON-wind-mist-12-generation-source.png'];
const inputs=await Promise.all(sources.map(s=>loadImage(resolve(dir,s))));
const rows=[['solar',0,[60,30,490,490]],['rain',0,[550,30,980,490]],['storm',0,[1020,30,1470,490]],['wind',1,[50,520,500,960]],['frost',0,[550,520,980,960]],['mist',1,[1010,540,1460,960]]];
const manifest={version:1,sourceFiles:sources.map(name=>({name,sha256:createHash('sha256').update(readFileSync(resolve(dir,name))).digest('hex')})),characters:[]};
for(const [id,source,box] of rows){
 const [x,y,x2,y2]=box,w=x2-x,h=y2-y,canvas=createCanvas(512,512),ctx=canvas.getContext('2d');
 ctx.drawImage(inputs[source],x,y,w,h,Math.floor((512-w)/2),Math.floor((512-h)/2),w,h);
 const png=canvas.toBuffer('image/png');writeFileSync(`apps/mobile/assets/characters/profile/${id}.png`,png);
 manifest.characters.push({id,source:sources[source],crop:box,canvas:[512,512],operation:'unscaled crop centered on transparent canvas',sha256:createHash('sha256').update(png).digest('hex')});
}
writeFileSync('apps/mobile/assets/characters/profile/provenance.json',JSON.stringify(manifest,null,2)+'\n');
