# WeatherON Map Provider Cost Comparison

> 기준일: 2026-06-28
> 목적: 해외 장소 검색/지도 provider 선택 시 Google Maps와 Mapbox 비용 차이, 적용 원칙, 추후 재검토 기준을 남긴다.

## 1. 결론

| 항목 | 결정 |
|---|---|
| 국내 장소 검색 | Kakao Local 우선, T-map은 Phase 4 이후 이동/경로 고도화 후보 |
| 해외 장소 검색 | Google Maps Geocoding 우선 |
| 해외 POI 고도화 | Google Places API는 필요 시 선택 도입 |
| Mapbox | 현재 기본 provider로 쓰지 않음. 비용 절감 대안으로 보관 |
| API 키 필요성 | 당장은 Kakao Local과 KMA가 우선. Google Maps 키는 해외 장소 검색 개발 착수 시 필요. Mapbox 키는 당장 불필요 |

Google Maps는 Mapbox보다 단가가 높지만 해외 POI 품질, 장소 데이터 신뢰도, Google 생태계 연동성이 강하다. WeatherON의 해외 기능은 여행 플래너/목적지 케어의 신뢰도가 중요하므로 1차 선택은 Google로 둔다.

## 2. 비용 비교 요약

공식 가격표 기준이며 실제 청구는 SKU, 월간 호출량, 국가별 세금, 크레딧/프로모션 적용 여부에 따라 달라질 수 있다.

| 기준 | Google Maps Platform | Mapbox |
|---|---:|---:|
| Geocoding 무료 구간 | 월 10,000건 수준 | Temporary Geocoding 월 100,000건 수준 |
| Geocoding 초과 단가 | 약 USD 5 / 1,000건 구간 | 약 USD 0.75 / 1,000건 구간 |
| Places/POI 검색 | Text Search, Nearby Search 등 Places SKU는 Geocoding보다 비쌈 | Search/Geocoding 중심 단가가 낮은 편 |
| 지도 표시 | Maps SDK/지도 로드 SKU 기준 별도 과금 | MAU 또는 map load 기준 별도 과금 |
| 비용 성향 | 비싸지만 POI 품질/커버리지 강점 | 저렴하지만 WeatherON 해외 POI 신뢰도 검증 필요 |

## 3. 월 호출량 예시

Geocoding 단순 비교용 예시다. Places API, 지도 표시, 자동완성, Directions, 캐시 정책은 별도 계산한다.

| 월 호출량 | Google Maps 예상 | Mapbox 예상 | 메모 |
|---:|---:|---:|---|
| 10,000건 | 무료 구간 가능 | 무료 구간 가능 | 초기 MVP는 두 provider 모두 비용 부담 낮음 |
| 100,000건 | 약 USD 450 수준 | 무료 구간 가능 | Mapbox가 비용상 유리 |
| 500,000건 | 약 USD 2,050 수준 | 약 USD 300 수준 | 대량 검색 시 Mapbox 비용 우위 큼 |

## 4. WeatherON 적용 원칙

1. 해외 장소 검색은 Google Maps Geocoding으로 시작한다.
2. Google Places API는 장소 세부 정보, POI 품질, 영업정보가 필요한 화면에서만 선택 호출한다.
3. 자동완성/검색 입력은 debounce, 최소 글자 수, 서버 캐시를 적용한다.
4. 같은 검색어/좌표 결과는 서버에서 캐시한다.
5. Mapbox는 비용 압박이 실제로 발생하거나 Google Places 비용이 과도할 때 대안 실험으로 검토한다.
6. API 키는 앱에 직접 넣지 않고 서버 프록시/Secret Manager 계층에서만 사용한다.

## 5. 재검토 트리거

| 트리거 | 조치 |
|---|---|
| 해외 장소 검색 월 50,000건 초과 | Google 월 예상 비용 재산정 |
| Google Places 호출이 Geocoding 호출의 20% 초과 | Places 호출 조건 축소 또는 캐시 강화 |
| 월 Google Maps 비용 USD 100 초과 | Mapbox 대안 PoC 검토 |
| 해외 POI 검색 품질 이슈 증가 | Google Places 확장 또는 provider 혼합 검토 |
| Mapbox 도입 검토 | 개인정보처리방침/보안정책/Secret 관리 문서 동시 갱신 |

## 6. 문서 반영 기준

- 기획/제안 문서에는 “국내 Kakao/T-map, 해외 Google”을 기준으로 쓴다.
- Mapbox는 기본 스택으로 쓰지 않고 “비용 절감 대안”으로만 표기한다.
- Google Maps 키는 해외 장소 검색 개발 착수 시 발급한다.
- Mapbox 키는 대안 PoC가 확정되기 전까지 발급하지 않는다.

## 7. 출처

- Google Maps Platform Pricing: https://developers.google.com/maps/billing-and-pricing/pricing
- Google Geocoding API Usage and Billing: https://developers.google.com/maps/documentation/geocoding/usage-and-billing
- Mapbox Pricing: https://www.mapbox.com/pricing

## 8. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-06-28 | Google Maps vs Mapbox 비용 비교와 WeatherON provider 결정 기준 최초 정리 |
