import {createCanvas,loadImage} from '@napi-rs/canvas';
import {writeFileSync} from 'node:fs';
const actualPath=process.argv[2], mode=process.argv[3]??'light', output=process.argv[4];
if(!actualPath)throw new Error('Pass original physical Home capture, light/dark, optional metrics JSON.');
async function bitmap(file){const im=await loadImage(file),c=createCanvas(im.width,im.height),ctx=c.getContext('2d');ctx.drawImage(im,0,0);return {w:im.width,h:im.height,d:ctx.getImageData(0,0,im.width,im.height).data}}
const reference=await bitmap(`docs/design/ambient-surface-pages-20261009/WeatherON-01A-Core-Weather-20261009/images/01-core-ios-${mode}-v3.png`), actual=await bitmap(actualPath);
const zones={upper:[220,65,275,100],middle:[300,350,335,425],lower:[310,605,336,650]};
function sample(b,x,y,isActual){const px=Math.round(isActual?x*440/352*3:36+x),py=Math.round(isActual?186+y*860/851*3:77+y),i=(py*b.w+px)*4;return Array.from(b.d.slice(i,i+3))}
function metrics(b,box,isActual){let colors=[],rough=[];for(let y=box[1];y<box[3];y++)for(let x=box[0];x<box[2];x++){const c=sample(b,x,y,isActual);colors.push(c);if(y>box[1]){const p=sample(b,x,y-1,isActual);rough.push(Math.abs(c.reduce((a,v)=>a+v,0)/3-p.reduce((a,v)=>a+v,0)/3))}}const mean=[0,1,2].map(ch=>colors.reduce((a,c)=>a+c[ch],0)/colors.length);const luma=colors.map(c=>c.reduce((a,v)=>a+v,0)/3),average=luma.reduce((a,v)=>a+v,0)/luma.length;return {meanRGB:mean.map(v=>+v.toFixed(2)),luminanceSD:+Math.sqrt(luma.reduce((a,v)=>a+(v-average)**2,0)/luma.length).toFixed(3),neighborRoughness:+(rough.reduce((a,v)=>a+v,0)/rough.length).toFixed(3)}}
const report={mode,actualPath,method:'Original pixels only; equal content-height/relative-width mapping; three clear regions avoiding status text, garment images and dock. Rain example vs dry live data is not copied.',zones:{}};
for(const[name,box]of Object.entries(zones)){const r=metrics(reference,box,false),a=metrics(actual,box,true);report.zones[name]={reference:r,actual:a,RGBdifference:a.meanRGB.map((v,i)=>+(v-r.meanRGB[i]).toFixed(2))}}
console.log(JSON.stringify(report,null,2));if(output)writeFileSync(output,JSON.stringify(report,null,2)+'\n');
