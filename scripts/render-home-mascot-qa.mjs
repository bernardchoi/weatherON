// Non-device visual harness of the actual RN component through react-native-web.
// Does not validate iOS native Glass, full Home layout, battery or frame pacing.
import { build } from 'esbuild';
import { mkdirSync, writeFileSync, realpathSync } from 'node:fs';
import { createServer } from 'node:http';
import puppeteer from 'puppeteer';
import {createCanvas,loadImage} from '@napi-rs/canvas';
const dir='/tmp/weatheron-character-render'; mkdirSync(dir,{recursive:true});
const entry=`import React from 'react'; import {createRoot} from 'react-dom/client';
import {HomeWeatherMascot} from './apps/mobile/src/components/HomeWeatherMascot';
import {resolveHomeMascotState} from './apps/mobile/src/utils/homeMascotState';
const samples=[['맑음','clear',18,'day'],['비 오는 밤','rain',18,'night'],['눈','snow',-2,'day'],['더위','clear',35,'day'],['바람','cloud',18,'day'],['미확인','clear',18,'unknown']];
function App(){const [enabled,setEnabled]=React.useState(true);window.setMascotMotion=setEnabled;return <><h1>실제 컴포넌트 · 비실기기 렌더 확인</h1><p>기본 눈 오버레이·우산 원본 마스크 파츠·부채·손·팔 부분 모션. 네이티브 iOS 검증 아님.</p>{['light','dark'].map(mode=><section style={{background:mode==='dark'?'#102B38':'#E9F6F8',color:mode==='dark'?'#F4F8F8':'#183844',padding:16}}><h2>{mode}</h2><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{samples.map(([label,condition,tempC,daylight])=><article data-sample={label} style={{width:140}}><h3>{label}</h3><HomeWeatherMascot state={resolveHomeMascotState({condition,tempC,daylight,reliable:daylight!=='unknown'})} size={label==='더위'?80:120} active={enabled} visible reducedMotion={false} lowPowerMode={false} wind={label==='바람'?.6:0} accentColor={mode==='dark'?'#87BFC8':'#4B9EAD'}/></article>)}</div></section>)}<h2>홈 표시 크기 / 동작 줄이기</h2><div style={{display:'flex',gap:20,background:'#E9F6F8',padding:20}}>{[80,56].map(size=><div data-reduced={size}><HomeWeatherMascot state={resolveHomeMascotState({condition:'rain',tempC:18,daylight:'day',reliable:true})} size={size} active={enabled} visible reducedMotion={true} lowPowerMode={false}/><span>{size}pt</span></div>)}</div><h2>파츠 경계 확대 검수</h2>{['light','dark'].map(mode=><div style={{display:'flex',background:mode==='dark'?'#102B38':'#E9F6F8'}}>{['clear','rain','heat'].map(condition=><HomeWeatherMascot state={resolveHomeMascotState({condition:condition==='heat'?'clear':condition,tempC:condition==='heat'?35:18,daylight:'day',reliable:true})} size={320} active={enabled} visible reducedMotion={false} lowPowerMode={false}/>)}</div>)}</>};createRoot(document.getElementById('root')).render(<App/>);`;
const result=await build({stdin:{contents:entry,loader:'jsx',resolveDir:process.cwd()},bundle:true,write:false,platform:'browser',format:'iife',preserveSymlinks:true,resolveExtensions:['.web.tsx','.web.ts','.web.jsx','.web.js','.tsx','.ts','.jsx','.js','.json'],alias:{'react-native':'react-native-web',react:realpathSync('node_modules/react'),'react-dom':realpathSync('node_modules/react-dom')},loader:{'.png':'dataurl'},define:{global:'globalThis','process.env.NODE_ENV':'"production"'},plugins:[{name:'native-boundary',setup(b){b.onResolve({filter:/localization\/react-native$/},()=>({path:import.meta.resolve('react-native-web').replace('file://','')}));}}]});
const html='<!doctype html><meta charset="utf-8"><style>body{font-family:Arial;margin:24px}h1{font-size:22px}h2{font-size:18px}h3{font-size:14px}section{margin-bottom:12px;border-radius:16px}p{font-size:13px}</style><div id="root"></div><script>'+result.outputFiles[0].text+'</script>';
writeFileSync(dir+'/index.html',html);
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html)}).listen(0,'127.0.0.1');
await new Promise(r=>server.once('listening',r));
let browser;
try{
 browser=await puppeteer.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-first-run']});
 const page=await browser.newPage();await page.setViewport({width:1100,height:960,deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle0'});await new Promise(r=>setTimeout(r,400));
 const sample=()=>page.evaluate(()=>({fanFront:document.querySelector('[data-testid="home-mascot-fan-front"]')?.getAttribute('style'),fanHead:document.querySelector('[data-testid="home-mascot-fan-head"]')?.outerHTML,fan:document.querySelector('[data-testid="home-mascot-fan-part"]')?.getAttribute('style'),fanBody:document.querySelector('[data-testid="home-mascot-fan-body"]')?.outerHTML,umbrella:document.querySelector('[data-testid="home-mascot-umbrella-part"]')?.getAttribute('style'), body:document.querySelector('[data-sample="비 오는 밤"] svg')?.outerHTML, moving:document.querySelector('[data-sample="맑음"] [data-testid="home-weather-mascot"] > div:last-child')?.getAttribute('style'), reduced:document.querySelector('[data-reduced="80"] [data-testid="home-weather-mascot"] > div:last-child')?.getAttribute('style')}));
 const before=await sample();await page.screenshot({path:dir+'/frame-a.png',fullPage:true});await new Promise(r=>setTimeout(r,1600));const after=await sample();await page.screenshot({path:dir+'/frame-b.png',fullPage:true});
 const blink = await page.evaluate(async()=>{
  const frames=new Set();let seen=false;let closedAgain=false;
  const start=Date.now();while(Date.now()-start<6500){
   const overlay=document.querySelector('[data-sample="맑음"] [data-testid="home-mascot-eye-part"]');
   if(overlay){seen=true;frames.add(overlay.querySelector('img')?.src ?? overlay.outerHTML);}else if(seen){closedAgain=true;}
   await new Promise(r=>setTimeout(r,10));
  }return {frameVariants:frames.size,seen,returnedOpen:closedAgain};
 });
 if(!blink.seen||blink.frameVariants<2||!blink.returnedOpen)throw Error('Blink sequence not observed '+JSON.stringify(blink));
 if(before.fan===after.fan||before.fanBody!==after.fanBody||before.fanHead!==after.fanHead||before.fan!==before.fanFront||after.fan!==after.fanFront)throw Error('Fan must move independently of fixed body');
 await page.evaluate(()=>window.setMascotMotion(false));await new Promise(r=>setTimeout(r,150));
 const stopped=await sample();if(!/rotate\(0deg\)/.test(stopped.fan))throw Error('Fan did not return to neutral '+stopped.fan+' errors: '+JSON.stringify(errors));
 await page.screenshot({path:dir+'/stopped.png',fullPage:true});
 await page.evaluate(()=>window.setMascotMotion(true));
 const sheet=createCanvas(960,720),ctx=sheet.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,960,720);
 const rigs=await page.$$('[data-testid="home-mascot-fan-rig"]');
 for(let frame=0;frame<12;frame++){
  for(let mode=0;mode<2;mode++){
   const box=await rigs[mode+2].boundingBox();const png=await page.screenshot({clip:box,captureBeyondViewport:true});
   writeFileSync(dir+`/fan-${mode}-${frame}.png`,png);
   const im=await loadImage(png);const x=(frame%6)*160,y=Math.floor(frame/6)*360+mode*180;
   ctx.drawImage(im,x,y,160,160);ctx.fillStyle='#333';ctx.font='12px sans-serif';ctx.fillText(`${mode?'dark':'light'} · frame ${frame}`,x+6,y+174);
  }
  await new Promise(r=>setTimeout(r,100));
 }
 writeFileSync(dir+'/fan-sequence.png',sheet.toBuffer('image/png'));
 if(before.umbrella===after.umbrella||before.body!==after.body)throw Error('Umbrella must move independently of fixed body');
 if(errors.length)throw Error(errors.join('\n'));
 if(before.moving===after.moving)throw Error('Expected actual Animated transform to change');
 if(before.reduced!==after.reduced)throw Error('Reduced Motion changed unexpectedly');
 writeFileSync(dir+'/result.json',JSON.stringify({before:{...before,body:'omitted',fanBody:'omitted',fanHead:'omitted'},after:{...after,body:'omitted',fanBody:'omitted',fanHead:'omitted'},blink,fanStopped:stopped.fan,errors,scope:'actual component via RN web; not native iOS/full Home'},null,2));
 console.log('PASS actual browser blink half/closed/open; umbrella/fan move with stationary bodies; fan returns to neutral; reduced-motion stays static; no page errors. '+dir);
}finally{await browser?.close();server.close();}
