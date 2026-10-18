import assert from 'node:assert/strict';
import {sortPlaceSearchResults} from '../apps/mobile/src/utils/placeSearchRanking.ts';
import worker from '../apps/server/src/worker.mjs';
import { getPlaceSearchQueryAlias } from '../packages/shared/src/fixtures/placeSearchAliases.ts';
const original=globalThis.fetch;const calls=[];
globalThis.fetch=async input=>{const url=new URL(String(input));calls.push(url);return new Response(JSON.stringify({documents:[{id:'seoul-station',place_name:'서울역',road_address_name:'서울 중구 한강대로 405',category_name:'교통 > 기차역',x:'126.9706',y:'37.5547'}],meta:{is_end:true}}));};
try{
 for(const q of ['Seoul Station','seoulstation',' SEOUL   STATION ','서울 역']){
  assert.equal(getPlaceSearchQueryAlias(q),'서울역');
  const r=await worker.fetch(new Request('https://test/places/search?sort=accuracy&q='+encodeURIComponent(q)),{KAKAO_REST_API_KEY:'test',KAKAO_LOCAL_KEYWORD_URL:'https://kakao.test/search'});
  assert.equal(r.status,200);const results=await r.json();assert.equal(results[0].name,'서울역');assert.equal(results[0].countryCode,'KR');assert.equal(results[0].provider,'kakao');
 }
 assert.ok(calls.length>0);for(const url of calls)assert.equal(url.searchParams.get('query'),'서울역');
}finally{globalThis.fetch=original;}
console.log('PASS shared/server Seoul Station aliases, KR routing and actual provider candidate');

const exact={id:'station',name:'서울역',address:'서울',category:'custom',countryCode:'KR',coordinate:{latitude:37.55,longitude:126.97},distanceMeters:13000};
const nearby={...exact,id:'office',name:'서울역 인근 업체',distanceMeters:12000};
assert.equal(sortPlaceSearchResults([nearby,exact],getPlaceSearchQueryAlias('Seoul Station'),{coordinate:exact.coordinate},true)[0].id,'station');
console.log('PASS English alias ranking keeps exact station above nearer businesses');
