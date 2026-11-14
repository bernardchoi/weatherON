import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
const source = stripTypeScriptTypes(readFileSync('apps/mobile/src/state/alertPreferenceGroups.ts', 'utf8')).replace(/^export /gm, '');
const { getAlertGroupState, toggleAlertGroup, alertPreferenceGroups } = new Function(`${source}; return {getAlertGroupState,toggleAlertGroup,alertPreferenceGroups};`)();
const keys = ['rainDetail','weatherAlerts','routine','bedtime','destination','quietHours'];
for (let bits=0;bits<64;bits++) {
 const p=Object.fromEntries(keys.map((key,i)=>[key,Boolean(bits & (1<<i))]));
 const original=JSON.stringify(p);
 for(const [group,members] of Object.entries(alertPreferenceGroups)) {
  const state=getAlertGroupState(p,group);
  assert.equal(JSON.stringify(p),original,'read never migrates settings');
  const next=toggleAlertGroup(p,group);
  for(const key of keys) assert.equal(next[key],members.includes(key)?state===false:p[key]);
  assert.equal(JSON.stringify(p),original,'updates are immutable');
  assert.equal(getAlertGroupState(next,group),state===false);
  assert.equal(getAlertGroupState(toggleAlertGroup(next,group),group),state!==false);
  assert.equal(next.quietHours,p.quietHours,'legacy quiet preference preserved');
 }
}
const screen=readFileSync('apps/mobile/src/screens/AlertSettingsScreen.tsx','utf8');
assert.equal((screen.match(/<AdvancedToggleRow /g)||[]).length,3);
assert.ok(!screen.includes('세부 알림 맞추기'));
assert.ok(screen.includes('accessibilityState={{ checked, disabled }}'));
assert.ok(screen.includes('일부 켜짐'));
console.log('PASS: 64 legacy combinations × 3 groups; immutable/atomic group updates, mixed states, quiet preference preservation, three controls.');
assert.ok(!screen.includes('하루 3번까지 보내요'), 'Do not promise a delivery cap that only limits pending schedules');
assert.ok(screen.includes('.map((part) => translateText(part, language)).join(", ")'), 'Translate label and state before composing accessibility text');
const localization = stripTypeScriptTypes(readFileSync('apps/mobile/src/localization/localization.ts','utf8'))
 .replace(/^import .*;\n/gm,'').replace(/^export /gm,'');
const catalogs=Object.fromEntries(['en','ja'].map(lang=>[lang,JSON.parse(readFileSync(`apps/mobile/src/localization/locales/${lang}.json`,'utf8'))]));
const {translateText}=new Function('en','ja','getCalendars','getLocales','resolveLocalePolicy',`${localization};return {translateText};`)(catalogs.en,catalogs.ja,()=>[],()=>[],()=>({language:'ko'}));
for(const language of ['en','ja']) for(const title of ['날씨 알림','하루 준비','출발 알림']) for(const status of ['켜짐','꺼짐','일부 켜짐','사용 불가']) {
 const label=[title,status].map(part=>translateText(part,language)).join(', ');
 assert.doesNotMatch(label,/[가-힣]/u);
 assert.ok(label.includes(', '));
}
console.log('PASS: EN/JA accessibility labels for all three groups and all states; accurate interruption copy.');
