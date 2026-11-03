# WeatherON Map Provider Cost Comparison

> 기준일: 2026-10-03 (공식 요금 재확인; 실제 계정 청구·사용량 미확인)
> 목적: 해외 장소 검색/지도 provider 선택 시 Google Maps와 Mapbox 비용 차이, 적용 원칙, 추후 재검토 기준을 남긴다.

## 1. 결론

| 항목 | 결정 |
|---|---|
| 국내 장소·경로 | Kakao Local·Kakao Map 경로 API 유지. 신규 경로 공급자 전환 없음 |
| 해외 장소 검색 | Google Maps Geocoding 우선 |
| 해외 POI 고도화 | Google Places API는 필요 시 선택 도입 |
| Mapbox | 현재 기본 provider로 쓰지 않음. 비용 절감 대안으로 보관 |
| API 키 필요성 | 기존 Kakao·Google 프록시 경로가 키를 사용. 운영 키 설정/승인 상태는 미확인. Mapbox는 미도입 |

Google Maps는 Mapbox보다 단가가 높지만 해외 POI 품질, 장소 데이터 신뢰도, Google 생태계 연동성이 강하다. WeatherON의 해외 기능은 여행 플래너/목적지 케어의 신뢰도가 중요하므로 1차 선택은 Google로 둔다.

## 2. 비용 비교 요약

공식 가격표 기준이며 실제 청구는 SKU, 월간 호출량, 국가별 세금, 크레딧/프로모션 적용 여부에 따라 달라질 수 있다.

| 기준 | Google Maps Platform | Mapbox |
|---|---:|---:|
| Geocoding 무료 구간 | 월 10,000건 수준 | Temporary Geocoding 월 100,000건 수준 |
| Geocoding 초과 단가 | 초기 구간 USD 5 / 1,000건, 10만건 초과 구간 USD 4 / 1,000건 | Temporary 10만~50만건 USD 0.75 / 1,000건. Permanent 1~50만건 USD 5 / 1,000건, 무료 없음 |
| Places/POI 검색 | Text Search, Nearby Search 등 Places SKU는 Geocoding보다 비쌈 | Search/Geocoding 중심 단가가 낮은 편 |
| 지도 표시 | Maps SDK/지도 로드 SKU 기준 별도 과금 | MAU 또는 map load 기준 별도 과금 |
| 비용 성향 | 비싸지만 POI 품질/커버리지 강점 | 저렴하지만 WeatherON 해외 POI 신뢰도 검증 필요 |

## 3. 월 호출량 예시

Geocoding 단순 비교용 예시다. Places API, 지도 표시, 자동완성, Directions, 캐시 정책은 별도 계산한다.

| 월 호출량 | Google Geocoding | Mapbox Temporary | Mapbox Permanent |
|---:|---:|---:|---:|
| 10,000건 | USD 0 | USD 0 | USD 50 |
| 100,000건 | USD 450 | USD 0 | USD 500 |
| 500,000건 | USD 2,050 | USD 300 | USD 2,500 |

50만건 계산: Google = 90,000/1,000 × $5 + 400,000/1,000 × $4; Temporary = 400,000/1,000 × $0.75; Permanent = 500,000/1,000 × $5. 세금·환전 제외, 계약 할인 없는 공시 가격 예시다. [Google 가격](https://developers.google.com/maps/billing-and-pricing/pricing), [Mapbox 가격](https://www.mapbox.com/pricing) (2026-10-03).

**저장 조건이 다른 상품을 같은 대안으로 취급하지 않는다.** Mapbox Temporary 결과는 캐싱·저장이 금지되고 Permanent는 저장 용도다. 목적지 저장에 Temporary의 저렴한 단가를 그대로 적용할 수 없다. [Mapbox Geocoding 저장 조건](https://docs.mapbox.com/api/search/geocoding/). Google도 결과 종류별 캐시·저장 제한과 place ID 예외 등 [Geocoding 정책](https://developers.google.com/maps/documentation/geocoding/policies)을 확인해야 한다. 일반적인 “좌표 캐시 강화”를 모든 provider에 적용하지 않는다.

## 4. WeatherON 적용 원칙

1. 해외 장소 검색은 Google Maps Geocoding으로 시작한다.
2. Google Places API는 장소 세부 정보, POI 품질, 영업정보가 필요한 화면에서만 선택 호출한다.
3. 자동완성/검색 입력은 debounce와 최소 글자 수로 호출을 줄인다.
4. 검색어/좌표 결과의 캐시·저장은 provider별 허용 데이터·기간·표시 조건을 확인한 범위에서만 적용한다. 현재 서버 메모리 Map 캐시는 최대 500개 항목의 isolate별 캐시이며 전역·영속 캐시가 아니다.
5. Mapbox는 비용 압박이 실제로 발생하거나 Google Places 비용이 과도할 때 대안 실험으로 검토한다.
6. API 키는 앱에 직접 넣지 않고 서버 프록시/Cloudflare Worker Secrets 계층에서만 사용한다.

## 5. 재검토 트리거

| 트리거 | 조치 |
|---|---|
| 해외 장소 검색 월 50,000건 초과 | Google 월 예상 비용 재산정 |
| Google Places 호출이 Geocoding 호출의 20% 초과 | Places 호출 조건 축소 또는 약관상 허용된 캐시 검토 |
| 월 Google Maps 비용 USD 100 초과 | Mapbox 대안 PoC 검토 |
| 해외 POI 검색 품질 이슈 증가 | Google Places 확장 또는 provider 혼합 검토 |
| Mapbox 도입 검토 | 개인정보처리방침/보안정책/Secret 관리 문서 동시 갱신 |

## 5-1. 국내 쿼터와 현재 해외 경로 비용

공식 조건 확인일 2026-10-03. [Kakao 7월 21일 공지](https://devtalk.kakao.com/t/api-notice-on-new-kakao-map-api-features-and-free-quota-policy/150222)와 [쿼터 표](https://developers.kakao.com/docs/ko/getting-started/quota) 기준 Local 주소/좌표/키워드/카테고리 각각 일 10만건, 키워드·카테고리 초과 ₩2/건, 좌표 관련 ₩0.5/건이다. Map 대중교통·도보·자전거는 각각 일 1,000건, 초과 ₩10/건이다. 개발자 계정의 첫 기능 활성화 앱 무료 자격, 월 통합 300만건, 월렛·유료 사용 설정을 함께 확인한다. 2026-07-21 이전 사용 앱의 기존 무료 쿼터 유지 예외도 활성화 이력과 대조한다. 미설정 상태에서 한도 초과 시 429가 발생할 수 있으며 VAT 별도다. [Kakao Mobility 자동차 Directions](https://developers.kakaomobility.com/price/) 일 1만건·초과 ₩8은 별도 상품이다.

현재 [proxyCore.mjs](../../apps/server/src/proxyCore.mjs)는 Kakao publictraffic endpoint와 해외 Google Distance Matrix **Legacy**를 지원한다. Google Routes 상세 경로 도입 계획과 혼동하지 않는다. 검색은 최대 2페이지, 갱신·재시도·반복 예약도 호출량에 포함한다.

Distance Matrix는 HTTP 요청 수가 아니라 **elements = origins × destinations** 기준이다. Basic은 월 1만 elements 무료·초기 초과 $5/1,000, Advanced는 월 5천 무료·$10/1,000이며 이후 볼륨 구간은 공식 표를 따른다. 자동차 `departure_time=now` 등 교통정보 요청은 Advanced SKU가 될 수 있으므로 Basic 단가만 적용하지 않는다. [공식 과금](https://developers.google.com/maps/documentation/distance-matrix/usage-and-billing), [가격표](https://developers.google.com/maps/billing-and-pricing/pricing).

실제 운영 SKU·쿼터·청구액은 미확인이다. 날씨·서버·AI 비용 및 수익화 가정은 [비용 추정](../planning/WeatherON_비용_추정.md)을 따른다.

## 6. 문서 반영 기준

- 기획/제안 문서에는 “국내 Kakao, 해외 Google”을 기준으로 쓴다.
- Mapbox는 기본 스택으로 쓰지 않고 “비용 절감 대안”으로만 표기한다.
- Google Maps의 기존 해외 검색·소요시간 구현과 실제 운영 키/승인 상태를 구분한다. 이번 문서 작업은 키를 발급하거나 변경하지 않는다.
- Mapbox 키는 대안 PoC가 확정되기 전까지 발급하지 않는다.

## 7. 출처

- Google Maps Platform Pricing: https://developers.google.com/maps/billing-and-pricing/pricing
- Google Geocoding API Usage and Billing: https://developers.google.com/maps/documentation/geocoding/usage-and-billing
- Mapbox Pricing: https://www.mapbox.com/pricing

## 8. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-10-03 | Temporary/Permanent 저장 조건·비용 분리, Kakao 최신 쿼터와 Distance Matrix Legacy elements/SKU 반영 |
| 2026-09-08 | TMAP 전환 계획 제외. 국내 Kakao·해외 Google 원칙으로 정리 |
| 2026-06-28 | Google Maps vs Mapbox 비용 비교와 WeatherON provider 결정 기준 최초 정리 |
