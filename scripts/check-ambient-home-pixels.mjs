import {createCanvas,loadImage} from '@napi-rs/canvas';
import assert from 'node:assert/strict';
const actual=process.argv[2], mode=process.argv[3]??'light';
assert.ok(actual,'Pass an original physical Home screenshot path, then light/dark.');
async function profile(file,scale,x,top){const im=await loadImage(file),c=createCanvas(im.width,im.height),ctx=c.getContext('2d');ctx.drawImage(im,0,0);const d=ctx.getImageData(0,0,im.width,im.height).data;const values=[];for(let y=360;y<700;y++){const i=((top+y*scale)*im.width+x)*4;values.push((d[i]+d[i+1]+d[i+2])/3)}return {span:Math.max(...values)-Math.min(...values),roughness:values.slice(1).reduce((a,v,i)=>a+Math.abs(v-values[i]),0)/(values.length-1)}}
const reference=await profile(`docs/design/ambient-surface-pages-20261009/WeatherON-01A-Core-Weather-20261009/images/01-core-ios-${mode}-v3.png`,1,375,77);
const observed=await profile(actual,3,1281,186);
console.log({mode,reference,observed,criterion:'Right background margin, contentY360–699, excluding text/garments/dock. Minimum visible field span75% of approved original. Grain/animation/screenreader not validated.'});
assert.ok(observed.span>=reference.span*.75,'Physical background field still too flat compared with approved original.');
console.log('PASS: physical field contrast span; visual fidelity still requires original-image review.');
