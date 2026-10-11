// Actual M4/A4 JSX with isolated callbacks; no OS/account/service actions.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.resolve(process.argv[2]||'/tmp/weatheron-permission-account-cloud');
const req=createRequire(root+'/package.json'),puppeteer=req('puppeteer');
const {createCanvas,loadImage,GlobalFonts}=req('@napi-rs/canvas');
fs.mkdirSync(output,{recursive:true});
const records=[],standard={width:390,height:844,scale:1,lang:'ko'};
const variants=[standard,{width:440,height:956,scale:1,lang:'ko'},{width:320,height:568,scale:1,lang:'ko'},
  {width:320,height:568,scale:1.6,lang:'en'},{width:320,height:568,scale:2,lang:'ja'}];
const server=http.createServer((request,response)=>{
  const url=new URL(request.url,'http://localhost'),asset=url.pathname.startsWith('/repo/');
  const file=asset?path.resolve(root,url.pathname.slice(6)):path.resolve(output,url.pathname==='/'?'index.html':url.pathname.slice(1));
  const allowed=asset?file.startsWith(root+'/assets/')||file.startsWith(root+'/apps/mobile/assets/fonts/'):
    ['index.html','bundle.js'].includes(path.relative(output,file));
  if(!allowed){response.writeHead(403).end();return;}
  try{response.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.png':'image/png','.otf':'font/otf'})[path.extname(file)]||'application/octet-stream');response.end(fs.readFileSync(file));}
  catch{response.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await puppeteer.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const boundary='Actual JSX / RN Web / synthetic iOS Platform, fixed safe area 59/88, simulated fontScale; native Glass fallback. All OS/account callbacks are inert fixture records. No UIKit/iPhone/service/haptic validation.';
function build(before){const env={...process.env};if(before)env.WEATHERON_CLOUD_BASELINE='1';else delete env.WEATHERON_CLOUD_BASELINE;
  execFileSync(process.execPath,[root+'/scripts/build-ambient-account-cloud.mjs',output],{cwd:root,env,stdio:'pipe'});}
async function geometry(page){return page.evaluate(()=>{
  const scroll=[...document.querySelectorAll('div')].find(e=>getComputedStyle(e).overflowY==='auto');
  const controls=[...document.querySelectorAll('[role=button]')].filter(e=>e.getBoundingClientRect().height>0);
  return {viewport:scroll.clientHeight,content:scroll.scrollHeight,horizontalOverflow:scroll.scrollWidth>scroll.clientWidth+1,
    clippedControls:controls.filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.getAttribute('aria-label')||e.innerText),
    textOutsideControls:controls.flatMap(e=>{const b=e.getBoundingClientRect();return [...e.querySelectorAll('*')].filter(t=>t.childNodes.length===1&&t.childNodes[0].nodeType===3).filter(t=>{const r=t.getBoundingClientRect();return r.top<b.top-1||r.bottom>b.bottom+1||r.left<b.left-1||r.right>b.right+1;}).map(t=>t.textContent);}),
    shortControls:controls.filter(e=>e.getBoundingClientRect().height<43.5).length,
    loadedImages:[...document.images].every(e=>e.complete&&e.naturalWidth>0),
    koreanInForeignText:window.fixture.scale>1&&/[가-힣]/.test(document.body.innerText)};});}
async function click(page,label){const found=await page.$(`[aria-label="${label}"]`);assert.ok(found,'missing '+label);await found.click();}
async function textClick(page,text){await page.evaluate(text=>{
  const button=[...document.querySelectorAll('[role=button]')].find(e=>e.innerText===text);if(!button)throw new Error('missing '+text);button.click();
},text);}
async function capture(stage,route,mode,variant=standard,extra={}){
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const query={route,mode,scale:String(variant.scale),lang:variant.lang,account:route==='A4'?'connected':'guest',needs:route==='M4'?'notification':'',...extra};
  const name=`${stage}-${route}-${mode}-${variant.width}-${variant.scale}-${variant.lang}-${extra.state||extra.status||extra.account||extra.needs||'standard'}${extra.reduce?'-reduced':''}`;
  try{
    await page.setViewport({width:variant.width,height:variant.height,deviceScaleFactor:1});
    await page.goto(`http://127.0.0.1:${server.address().port}/?${new URLSearchParams(query)}`,{waitUntil:'networkidle0'});
    await page.evaluate(()=>document.fonts.ready);const g=await geometry(page);
    await page.screenshot({path:output+'/'+name+'.png'});
    assert.deepEqual(errors,[],name+' runtime');assert.equal(g.loadedImages,true,name+' image');
    if(stage==='after'){assert.equal(g.horizontalOverflow,false,name+' horizontal');assert.deepEqual(g.clippedControls,[],name+' clip');assert.equal(g.shortControls,0,name+' 44px');assert.deepEqual(g.textOutsideControls,[],name+' label outside button');assert.equal(g.koreanInForeignText,false,name+' translation');}
    const lastVisible=await page.evaluate(()=>{
      const scroll=[...document.querySelectorAll('div')].find(e=>getComputedStyle(e).overflowY==='auto');scroll.scrollTop=scroll.scrollHeight;
      const controls=[...scroll.querySelectorAll('[role=button]')],last=controls.at(-1),r=last.getBoundingClientRect();return r.top>=59&&r.bottom<=innerHeight-88+1;
    });
    if(stage==='after')assert.equal(lastVisible,true,name+' last action');
    if(g.content>g.viewport)await page.screenshot({path:output+'/'+name+'-bottom.png'});
    let dialog=null;
    if(stage==='after'&&route==='A4'&&query.account==='connected'&&!['signing-in','signing-out'].includes(query.status||'')){
      // Open both confirmation surfaces and cancel; never press final destructive action.
      for(const action of ['로그아웃','회원 탈퇴']){
        // Localized labels are read from the matching visible action text where catalogs differ.
        const labels=await page.evaluate(()=>[...document.querySelectorAll('[role=button]')].map(e=>e.getAttribute('aria-label')));
        const actual=variant.lang==='ko'?action:labels[action==='로그아웃'?labels.length-2:labels.length-1];
        await click(page,actual);
        await page.waitForFunction(title=>{const a=[...document.querySelectorAll('div')].filter(e=>getComputedStyle(e).overflowY==='auto');return a.length===2&&a.at(-1).innerText.startsWith(title);},{},actual);
        const info=await page.evaluate(()=>{
          const auto=[...document.querySelectorAll('div')].filter(e=>getComputedStyle(e).overflowY==='auto');
          const modalScroll=auto.at(-1);modalScroll.scrollTop=modalScroll.scrollHeight;
          const controls=[...modalScroll.querySelectorAll('[role=button]')];
          return {scrolls:auto.length,horizontal:modalScroll.scrollWidth>modalScroll.clientWidth+1,
            body:modalScroll.innerText,textOutside:controls.flatMap(e=>{const b=e.getBoundingClientRect();return [...e.querySelectorAll('*')].filter(t=>t.childNodes.length===1&&t.childNodes[0].nodeType===3).filter(t=>{const r=t.getBoundingClientRect();return r.top<b.top-1||r.bottom>b.bottom+1||r.left<b.left-1||r.right>b.right+1;}).map(t=>t.textContent);}),short:controls.some(e=>e.getBoundingClientRect().height<43.5),
            accessible:controls.every(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1;})};
        });
        assert.equal(info.horizontal,false,name+' modal horizontal');assert.equal(info.short,false,name+' modal target');assert.deepEqual(info.textOutside,[],name+' modal label outside button');assert.equal(info.accessible,true,name+' modal end');
        if(variant.lang==='ko')assert.ok(info.body.includes(action==='회원 탈퇴'?'되돌릴 수 없어요.':'서버 계정은 유지돼요.'),name+' warning');
        if(mode==='light'&&(variant===standard||variant.scale>1))await page.screenshot({path:output+'/'+name+`-${action==='회원 탈퇴'?'delete':'logout'}-dialog-bottom.png`});
        await textClick(page,variant.lang==='ko'?'취소':variant.lang==='en'?'Cancel':'キャンセル');
        await page.waitForFunction(()=>[...document.querySelectorAll('div')].filter(e=>getComputedStyle(e).overflowY==='auto').length===1);dialog=info;
      }
      assert.deepEqual(await page.evaluate(()=>window.actions),[],name+' opening/cancel invoked service');
    }
    if(stage==='after'&&variant===standard&&mode==='light'&&!extra.reduce){
      if(route==='M4'){
        const labels=await page.evaluate(()=>[...document.querySelectorAll('[role=button]')].map(e=>e.getAttribute('aria-label')).filter(Boolean));
        for(const label of labels.filter(l=>l!=='뒤로'))await click(page,label);
        const actions=await page.evaluate(()=>window.actions);
        if(extra.state==='requesting')assert.ok(!actions.some(a=>Array.isArray(a)&&a[0]==='location'));
        else if(extra.state==='denied-location')assert.ok(actions.includes('settings'));
        else if(extra.state==='manual'||extra.needs==='location')assert.ok(actions.some(a=>Array.isArray(a)&&a[0]==='location'&&a[1]==='M4'));
        else assert.ok(actions.includes('current-location'));
        assert.ok(actions.includes('H2'));
        if(extra.state==='denied-notification')assert.ok(actions.includes('settings'));
        else if(extra.state==='paused'||query.needs!=='notification')assert.ok(actions.includes('M2'));
        else assert.ok(actions.some(a=>Array.isArray(a)&&a[0]==='notification'&&a[1]==='M4'));
      }else{
        if(['signing-in','signing-out'].includes(query.status||'')){
          for(const label of ['로그아웃','회원 탈퇴'])await click(page,label);
          assert.deepEqual(await page.evaluate(()=>window.actions),[],name+' busy action');
          assert.equal(await page.evaluate(()=>document.body.innerText.includes('되돌릴 수 없어요.')),false,name+' busy modal');
        }
        if(query.account==='terms'){await click(page,'필수 약관 동의 이어가기');assert.deepEqual(await page.evaluate(()=>window.actions),['gate']);}
        if(query.account!=='guest'){await click(page,'정책 및 법적 고지 보기');assert.ok((await page.evaluate(()=>window.actions)).includes('R1'));}
      }
      await click(page,'뒤로');assert.ok((await page.evaluate(()=>window.actions)).includes('M1'));
    }
    records.push({stage,route,mode,...variant,...extra,...g,lastVisible,dialogChecked:!!dialog});
  }finally{await page.close();}
}
try{
  build(true);for(const route of ['M4','A4'])for(const mode of ['light','dark'])await capture('before',route,mode);
  build(false);for(const route of ['M4','A4'])for(const mode of ['light','dark']){
    for(const variant of variants)await capture('after',route,mode,variant);
    await capture('after',route,mode,standard,{reduce:'1'});
  }
  for(const state of ['requesting','manual','denied-location','denied-notification','skipped','paused'])await capture('after','M4','light',standard,{state});
  for(const needs of ['location','none'])await capture('after','M4','light',standard,{needs});
  for(const account of ['guest','terms'])for(const mode of ['light','dark'])await capture('after','A4',mode,standard,{account});
  for(const status of ['offline','error','signing-in','signing-out'])await capture('after','A4','light',standard,{status});
  GlobalFonts.registerFromPath(root+'/apps/mobile/assets/fonts/Pretendard-Regular.otf','Pretendard');
  for(const route of ['M4','A4'])for(const mode of ['light','dark']){
    const ref=await loadImage(root+`/docs/design/ambient-surface-pages-20261009/WeatherON-04A-Account-iOS-20261009/images/06-settings-ios-${mode}-v3.png`);
    const crop=route==='M4'?(mode==='light'?[554,60,428,862]:[557,64,424,875]):mode==='light'?[1023,60,431,862]:[1020,63,425,876];
    const canvas=createCanvas(1170,1100),ctx=canvas.getContext('2d');ctx.fillStyle='#edf2f7';ctx.fillRect(0,0,1170,1100);
    ctx.drawImage(ref,...crop,0,60,390,crop[3]*390/crop[2]);
    for(const [i,stage]of ['before','after'].entries())ctx.drawImage(await loadImage(output+`/${stage}-${route}-${mode}-390-1-ko-standard.png`),(i+1)*390,60);
    ctx.fillStyle='#edf2f7';ctx.fillRect(0,0,1170,55);ctx.fillStyle='#111738';ctx.font='20px Pretendard';
    ctx.fillText('승인 v3 · 폭 정규화',12,32);ctx.fillText('수정 전 · Cloud',402,32);ctx.fillText('수정 후 · Cloud',792,32);
    ctx.font='18px Pretendard';ctx.fillText('합성 상태 / RN Web · UIKit Glass, iPhone, 실제 권한·계정 작업 검증 아님',12,1080);
    fs.writeFileSync(output+`/comparison-${route}-${mode}.png`,canvas.toBuffer('image/png'));
  }
  fs.writeFileSync(output+'/results.json',JSON.stringify({baseline:'02f68c1b5d7240b3e2b62728610c893715334edb',boundary,records},null,2));
  console.log(`PASS ${records.length} M4/A4 cloud renders, fixtures, target/scroll/localization and confirmation-cancel checks. ${boundary}`);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
