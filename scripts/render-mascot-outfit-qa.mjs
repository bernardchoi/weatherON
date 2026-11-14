// Non-device visual harness of the actual RN component through react-native-web.
// Does not validate iOS native Glass, full Home layout, battery or frame pacing.
import { build } from 'esbuild';
import { mkdirSync, writeFileSync, realpathSync } from 'node:fs';
import { createServer } from 'node:http';
import puppeteer from 'puppeteer';
import {createCanvas,loadImage} from '@napi-rs/canvas';
const dir='/tmp/weatheron-outfit-render'; mkdirSync(dir,{recursive:true});
const entry=`import React from 'react'; import {createRoot} from 'react-dom/client';
import {HomeWeatherMascot} from './apps/mobile/src/components/HomeWeatherMascot';
import {resolveHomeMascotState} from './apps/mobile/src/utils/homeMascotState';
import {withMascotClothing} from './apps/mobile/src/utils/mascotOutfit';
const cases=[['가벼운 차림','light','clear',22],['겉옷','outer','cloud',15],['방한복','winter','snow',-3],['우비 + 우산','raincoat','rain',18],['방한복 + 우산','winter','rain',3],['가벼운 차림 + 부채','light','clear',35]];
function App(){const [reduced,setReduced]=React.useState(true);window.setOutfitReduced=setReduced;return <><h1>코디 연동 대표 의상 · 실제 컴포넌트</h1><p>추천 의류 유형 표현 / 사용자 옷 사진 재현 아님 / 네이티브 실기기 검증 전</p>{['light','dark'].map(mode=><section style={{background:mode==='dark'?'#102B38':'#E9F6F8',color:mode==='dark'?'#F4F8F8':'#183844',padding:20}}>{[200,80,56].map(size=><div style={{display:'flex',gap:12,marginBottom:16}}>{cases.map(([label,clothing,condition,tempC])=><article style={{width:200}}><h3>{label} · {size}pt</h3><HomeWeatherMascot state={withMascotClothing(resolveHomeMascotState({condition,tempC,daylight:'day',reliable:true}),clothing)} darkMode={mode==='dark'} size={size} active visible reducedMotion={reduced} lowPowerMode={false}/></article>)}</div>)}</section>)}</>};createRoot(document.getElementById('root')).render(<App/>);`;
const result=await build({stdin:{contents:entry,loader:'jsx',resolveDir:process.cwd()},bundle:true,write:false,platform:'browser',format:'iife',preserveSymlinks:true,resolveExtensions:['.web.tsx','.web.ts','.web.jsx','.web.js','.tsx','.ts','.jsx','.js','.json'],alias:{'react-native':'react-native-web',react:realpathSync('node_modules/react'),'react-dom':realpathSync('node_modules/react-dom')},loader:{'.png':'dataurl'},define:{global:'globalThis','process.env.NODE_ENV':'"production"'},plugins:[{name:'native-boundary',setup(b){b.onResolve({filter:/localization\/react-native$/},()=>({path:import.meta.resolve('react-native-web').replace('file://','')}));}}]});
const html='<!doctype html><meta charset="utf-8"><style>body{font-family:Arial;margin:24px}h1{font-size:22px}h2{font-size:18px}h3{font-size:14px}section{margin-bottom:12px;border-radius:16px}p{font-size:13px}</style><div id="root"></div><script>'+result.outputFiles[0].text+'</script>';
writeFileSync(dir+'/index.html',html);
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html)}).listen(0,'127.0.0.1');
await new Promise(r=>server.once('listening',r));
let browser;
try {browser=await puppeteer.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-first-run']});const page=await browser.newPage();await page.setViewport({width:1360,height:960,deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle0'});await page.screenshot({path:dir+'/outfit.png',fullPage:true});const clothing=()=>page.evaluate(()=>Array.from(document.querySelectorAll('[data-testid^="home-mascot-clothing-"]')).map(n=>n.outerHTML));
const initial=await clothing();await page.evaluate(()=>window.setOutfitReduced(false));await new Promise(r=>setTimeout(r,200));
const parts=()=>page.evaluate(()=>[document.querySelector('[data-testid="home-mascot-umbrella-part"]')?.getAttribute('style'),document.querySelector('[data-testid="home-mascot-fan-part"]')?.getAttribute('style')]);
const before=await parts();await new Promise(r=>setTimeout(r,1100));const after=await parts();if(before.some((p,i)=>p===after[i]))throw Error('Clothed props must animate');
if(JSON.stringify(initial)!==JSON.stringify(await clothing()))throw Error('Clothing geometry drifted');
await page.evaluate(()=>window.setOutfitReduced(true));await new Promise(r=>setTimeout(r,200));const stopped=await parts();await new Promise(r=>setTimeout(r,300));if(JSON.stringify(stopped)!==JSON.stringify(await parts()))throw Error('Reduced motion did not stop clothed props');
if(errors.length)throw Error(errors.join('\n'));console.log('PASS 36 actual component clothing samples light/dark at 200/80/56pt, no render errors. '+dir+'/outfit.png');}finally{await browser?.close();server.close();}
