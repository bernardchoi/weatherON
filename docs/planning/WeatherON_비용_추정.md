# WeatherON 비용·수익화 추정 문서

> 검토 기준일: **2026-10-03**. 검토안을 반영한 living 문서이며 실제 청구서나 확정 판매가격이 아니다.
> 출시 범위는 [기능 출시 로드맵](WeatherON_기능_출시_로드맵.md), 지도별 상세 비교는 [지도 비용 비교](../architecture/WeatherON_MAP_PROVIDER_COST_COMPARISON.md)를 함께 본다.
> 환산은 **가정 환율 USD 1 = ₩1,500**, 별도 표시가 없으면 공급자 세금·환전 수수료 제외다. MAU만으로 비용이나 광고 매출을 확정하지 않는다.

## 1. 현재 구현, 과거 운영 확인, 계획의 구분

| 구분 | 확인 범위 |
|---|---|
| 현재 저장소 구현 | main `015e8adc` 기준 Workers 프록시, D1 계정/설정, SQLite Durable Objects 출발 예약·APNs 재시도, Workers AI 옷장 사진 분석. iOS WeatherKit, Android 한국 KMA 및 해외/KMA 실패 fallback Open-Meteo. 장소 검색 타임존 보정도 Open-Meteo 사용 |
| 과거 운영 확인 | [2026-09-20 운영 재검토](../policy/WeatherON_정책_운영설정_재검토_2026-09-20.md): Workers Free 활성, D1 APAC, Workers Logs/Traces 비활성, 당시 확인한 Worker 배포일 9월 5일. 오늘의 배포·플랜·사용량 증거가 아님 |
| 미구현/목업 | AdMob Google 모바일 배너와 실제 구독 결제는 미구현. Premium 화면의 가격/결제 UI는 목업이고 CTA는 G5로 이동. AdPlacementScreen은 네이티브 광고 목업으로 배너 SDK 구현 증거가 아님 |
| 후속 계획 | Gemini 홈 추천/AI 코디/여행, R2 저장은 향후 기능. 현재 운영비에 이미 발생하는 비용처럼 합산하지 않음 |
| 미확인 | 현재 프로덕션 배포, 유료 플랜 가입, 공급자별 실제 사용량·청구액·앱 승인 상태. 저장소 설정만으로 확정 불가 |

구현 근거: [proxyCore.mjs](../../apps/server/src/proxyCore.mjs), [wardrobeCore.mjs](../../apps/server/src/wardrobeCore.mjs), [departurePushCore.mjs](../../apps/server/src/departurePushCore.mjs), [모바일 providers](../../apps/mobile/src/providers), [화면](../../apps/mobile/src/screens). Open-Meteo는 모바일 직접 호출과 프록시 호출을 모두 계측해야 한다. 서버의 최대 500개 항목 메모리 `Map` 캐시는 isolate별이며 전역·영속 캐시가 아니다. foreground 갱신과 UI의 1분 시계 tick을 구분하고 tick마다 API가 호출된다고 계산하지 않는다.

## 2. 날씨·장소·경로 API

공식 조건 확인일: 2026-10-03. 무료량은 사용 자격·계정·SKU 조건을 만족할 때만 적용된다.

| API | 비용/한도 | WeatherON 산정 주의 |
|---|---|---|
| Open-Meteo | 비상업 Free: 분 600 / 시간 5,000 / 일 10,000 / 월 300,000 calls. 상업 Standard $29/월·100만 calls, Professional $99/월·500만 calls | 광고·구독뿐 아니라 광고 없는 상업 제품도 Free 부적격일 수 있음. Standard 가정 환산 **₩43,500/월**. 상용 출시를 ₩0으로 잡지 않음 |
| WeatherKit | 멤버십에 월 50만 calls 포함, 월 **총 100만 calls** tier $49.99 | 50만+100만이 아님. Apple Developer 연 $99는 빌드/배포와 공유하는 회비로 한 번만 계상 |
| KMA | 승인된 계정·상품의 활용 한도 확인 필요 | API Hub와 data.go.kr의 쿼터를 혼합하지 않음. 현재 계정 승인량 미확인 |
| Kakao Local | 주소/좌표/키워드/카테고리 검색 각각 일 10만건. 키워드·카테고리 초과 ₩2/건, 좌표 관련 초과 ₩0.5/건 | 검색 한 번이 최대 2페이지 호출을 만들 수 있음. 개별 API와 월 통합 300만건 쿼터 모두 확인 |
| Kakao Map 경로 | 대중교통·도보·자전거 각각 일 1,000건, 초과 ₩10/건 | 현재 publictraffic endpoint 지원과 상세 경로 UI의 계획을 구분. 반복 예약·재시도 포함 |
| Kakao Mobility 자동차 Directions | 일 10,000건, 초과 ₩8/건 | 위 Map 경로 상품과 다른 상품·쿼터 |
| Google Geocoding | 월 10,000건 무료, 이후 초기 구간 $5/1,000건, 볼륨 구간별 할인 | 월 10만건 $450, 50만건 $2,050. Places·지도 표시·경로는 별도 |
| Google Distance Matrix Legacy | Basic 월 10,000 elements 무료·초기 초과 $5/1,000, Advanced 월 5,000·$10/1,000 | 현재 해외 소요시간 경로. `departure_time=now`를 쓰는 교통정보 요청은 Advanced 가능. elements = 출발지 수 × 목적지 수 |

근거: [Open-Meteo 약관](https://open-meteo.com/en/terms), [가격·call 산식](https://open-meteo.com/en/pricing#plans), [WeatherKit](https://developer.apple.com/weatherkit/), [Apple 회비](https://developer.apple.com/programs/enroll/), [Kakao 쿼터](https://developers.kakao.com/docs/ko/getting-started/quota), [2026-07-21 Kakao 변경 공지](https://devtalk.kakao.com/t/api-notice-on-new-kakao-map-api-features-and-free-quota-policy/150222), [Mobility 가격](https://developers.kakaomobility.com/price/), [Google 가격](https://developers.google.com/maps/billing-and-pricing/pricing), [Distance Matrix 과금](https://developers.google.com/maps/documentation/distance-matrix/usage-and-billing).

Open-Meteo는 변수 수·기간·모델·다중 좌표에 따라 가중 calls가 생긴다. **HTTP 요청 수 = 과금 calls**로 자동 간주하지 않는다. 상업용 endpoint·키 전환과 attribution은 별도 구현·계약 확인 사항이다.

Kakao 무료 자격은 개발자 계정에서 처음 기능을 활성화한 앱인지 확인해야 한다. 2026-07-21 이전 사용 앱은 기존 무료 쿼터 유지 공지가 있으므로 활성화 이력도 대조한다. 월 통합 쿼터와 API별 일 쿼터, 앱 설정을 함께 확인한다. 유료 사용 설정·월렛이 없으면 한도 초과 시 429가 발생할 수 있으며 표시 단가는 VAT 별도다. 공시 요금 확인은 실제 계정의 무료 자격 확인을 대신하지 않는다.

경로 비용은 외부 지도 URL 연결과 자체 경로 조회를 분리한다. 자체 비용은 활성 사용자 × 확정 검색/상세 진입 × 페이지/후보 수 × 갱신·재시도이며, 구간 날씨는 중복 제거한 좌표·예보 시간대별로 산정한다. 신규 공급자 도입·Google Routes 상세 경로는 별도 검토다.

## 3. 서버·AI·빌드 비용

### Cloudflare (2026-10-03 공식 표)

| 상품 | Free | Paid 포함량 및 초과 단가 |
|---|---|---|
| Workers | 일 10만 requests, 요청당 CPU 10ms | 최소 $5/월에 월 1,000만 requests·3,000만 CPU-ms. 초과 $0.30/100만 requests, $0.02/100만 CPU-ms |
| D1 | 일 500만 rows read·10만 rows written, 총 5GB | 월 250억 read·5,000만 write, 5GB 포함. 초과 $0.001/100만 read, $1/100만 write, $0.75/GB-month |
| Durable Objects compute | 일 10만 requests·13,000 GB-s | 월 100만 requests·400,000 GB-s. 초과 $0.15/100만 requests, $12.50/100만 GB-s |

근거: [Workers](https://developers.cloudflare.com/workers/platform/pricing/), [D1](https://developers.cloudflare.com/d1/platform/pricing/), [DO](https://developers.cloudflare.com/durable-objects/platform/pricing/). DO SQLite의 행 읽기·쓰기·저장 비용은 compute와 별도이며 D1 저장 단가를 그대로 대입하지 않는다. 상품별 포함량은 같은 계정의 다른 앱 사용량도 고려한다.

출발 예약의 alarm 호출, APNs 실패 시 매분 재시도 및 출발 후 최대 1시간 만료 구간을 요청·실행·스토리지 모델에 포함한다. Free 초과가 자동 유료 결제라고 가정하지 않는다. Paid $5는 가정 시나리오이며 가입 확인이 아니다. R2는 후속 계획으로만 분리한다. 2026-12-01 observability 요금 변경은 미래 조건으로 재검토하며 오늘의 비용에 소급 반영하지 않는다.

### 현재 AI: 옷장 사진 분석

`wardrobeCore.mjs`의 Workers AI **Gemma 4 26B A4B IT**는 사진당 1~3회 추론, pass당 최대 출력 1,024 tokens를 사용한다. 사용자당 하루 100장 기술 제한은 계정 공통 비용 상한이 아니다.

- [모델 공식 단가](https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/): 입력 $0.10/100만 tokens, 출력 $0.30/100만 tokens (2026-10-03).
- [Workers AI 과금](https://developers.cloudflare.com/workers-ai/platform/pricing/): 계정 공유 일 10,000 neurons 무료. Free 초과는 차단, Paid는 초과 $0.011/1,000 neurons. 토큰 환산과 neurons 청구를 중복 합산하지 않는다.
- `Σ(pass 입력 tokens × 0.10 + 출력 tokens × 0.30) / 1,000,000`은 모델 단가 기준 추정이며, 청구는 실제 neurons와 일별 무료량으로 대조한다.
- 사진 바이트 수로 이미지 tokens를 추정하지 않는다. pass별 입력/출력 tokens·neurons, 재시도/거절률, 일 사용자/사진 수, 계정 전체 사용량을 측정한 뒤 일·월 비용 상한 및 차단/fallback을 정한다. 측정 전 AI 무제한 유료 혜택을 약속하지 않는다.

### 향후 Gemini 기능: 기존 가정의 산술 정정

현재 옷장 AI 비용과 별개인 **2026-06 모델 가정**(Gemini 2.5 Flash 입력 $0.30/100만, 출력 $2.50/100만 tokens)을 보존한다. 신규 채택 시 단가 재검증이 필요하다. 홈 AI, 7일 코디 개인화, 장거리 AI는 출시 약속이 아니다.

| 미래 기능 | MAU 1,000 가정 | 회당 입력/출력 tokens | 월 USD |
|---|---|---|---:|
| 홈 AI 카드 | 전원 매일 1회 × 30일, 즉 **DAU = MAU** | 500 / 300 | 27.0000 |
| AI 코디 개인화 | 10% × 월 4회 | 600 / 500 | 0.5720 |
| 장거리 AI 플래너 | 5% × 월 1회 | 2,000 / 1,500 | 0.2175 |
| 합계 | 위 가정 전체 활성화 | | **27.7895** |

합계는 가정 환율로 **₩41,684.25/월**. 홈 카드만 MAU 1,000일 때 ₩40,500, 5,000일 때 **$135 = ₩202,500**다. 기존 “MAU 1천~5천 전체 ₩3~4만” 추정은 폐기한다. 실제 DAU·활성 비율·호출 빈도·캐시가 다르면 다시 계산한다.

### 빌드와 멤버십

저장소 [AGENTS.md](../../AGENTS.md) 정책은 Android Expo EAS, iOS Xcode Cloud다. [Expo 공식 가격](https://expo.dev/pricing)은 Free Android 월 15 builds, Starter $19/월에 $45 build credit 및 추가 사용 과금이다. [Xcode Cloud](https://developer.apple.com/xcode-cloud/)는 멤버십에 월 25 compute hours 포함, 월 총 100 hours tier $49.99다 (2026-10-03). Apple Developer 연 $99를 WeatherKit·Xcode Cloud·스토어 배포 항목마다 중복 더하지 않는다. 실제 빌드 빈도·플랜·스토어 등록비·도메인 비용은 별도 계정 확인 대상이다.

## 4. 수익화 순서와 배너 검증안

**사용자 확인 방향: Google 모바일 배너 광고 먼저, 프리미엄 월 구독은 나중.** 이번 반영은 문서 검토안이며 SDK·상품·가격·배포 변경 승인이 아니다.

1. 소규모 핵심 앱 출시 → 안정성·알림 신뢰성·반복 사용 확인.
2. 준비 요건 충족 후 제한된 배너 활성화 → 앱 내 실제 impressions, match/show rate, eCPM, 재방문 변화 측정.
3. 완성된 유료 가치를 검증한 뒤 월간 프리미엄 상품 **하나** 도입 검토. 월 ₩2,900은 검증 기준안, ₩1,900/₩3,900은 대안이다. 세 플랜 동시 출시가 아니다. 연 ₩19,900은 과거 제안으로 승인된 출시 상품이 아니다.

첫 출시에서 SDK 도입을 미루거나 내부 테스트 광고로 검증하고 실광고 활성화는 분리할 수 있다. 단순히 배너를 숨겨도 탑재·초기화된 SDK의 수집이 없어지는 것은 아니다. [미게시 앱 등록/설정](https://support.google.com/admob/answer/9989980), [앱 준비 상태](https://support.google.com/admob/answer/10564477), [app-ads.txt](https://support.google.com/admob/answer/14538460) 조건과 스토어 연결·승인에 따라 초기 송출이 제한될 수 있다. QA는 [테스트 광고](https://developers.google.com/admob/ios/test-ads)만 사용한다.

[ATT](https://developers.google.com/admob/ios/privacy/strategies)는 tracking/IDFA 이용에 관한 조건이지 모든 광고에 자동 필수인 팝업이 아니다. [UMP](https://developers.google.com/admob/ios/privacy), 동의/철회 경로, 실제 SDK 처리에 맞는 개인정보 고지·스토어 privacy labels/data safety를 준비한다. UMP나 비개인화 광고만으로 한국 법규 전체 충족을 주장하지 않는다.

### 광고 월매출 민감도: 시장 평균이 아닌 예시

`무료 광고 대상 DAU × 1인당 일 요청 3 × 매칭률 85% × 표시율 90% × 30일 × eCPM / 1,000`

| 무료 광고 DAU | 월 impressions | eCPM ₩300 | eCPM ₩800 | eCPM ₩1,500 |
|---:|---:|---:|---:|---:|
| 100 | 6,885 | ₩2,065.50 | **₩5,508** | ₩10,327.50 |
| 500 | 34,425 | ₩10,327.50 | **₩27,540** | ₩51,637.50 |

위 수익은 비용·세금 차감 전 시나리오다. 위젯/Live Activity 사용은 앱 내 광고 노출이 아니다. 기존 “MAU 1만 → 월 ₩30~80만”은 impressions 근거가 없어 예산 근거로 사용하지 않는다. Standard Open-Meteo $29만 가정해도 이 두 중앙 시나리오의 광고 매출보다 크므로 광고만으로 비용 회수를 보장하지 않는다.

## 5. 월 구독 검증안과 단위 경제성

무료는 **현재 목적지 3개**를 유지한다. Premium 목업의 무료 1개 문구를 정책 근거로 삼지 않는다. 초기 유료 후보는 광고 제거, 추가 목적지, **구현·검증이 완료된 고급 출발 알림**이다. 아직 완성되지 않은 AI·GPX·여행·7일 코디를 첫 유료 혜택으로 판매하지 않는다.

VAT 포함 소비자가에 대한 예시: `월 가격 / 1.1 × (1 − 스토어 수수료)`.

| 월 소비자가 (대안 비교) | 수수료 15% 시 | 수수료 30% 시 |
|---:|---:|---:|
| ₩1,900 | ₩1,468 | ₩1,209 |
| **₩2,900 (검증 기준)** | **₩2,241** | **₩1,845** |
| ₩3,900 | ₩3,014 | ₩2,482 |

원 단위 반올림. 변수 API·환불·구독 전환으로 사라지는 광고 매출·고정 운영비 차감 전이며 순이익이 아니다. [Google 자동 갱신 구독 수수료](https://support.google.com/googleplay/android-developer/answer/112622)는 한국 기본 모델 15%, [Apple Small Business Program](https://developer.apple.com/app-store/small-business-program/) 15%는 자격 충족·승인 시에만 적용한다. [Apple 일반 구독](https://developer.apple.com/app-store/subscriptions/)은 첫 유료 1년 30%, 이후 15% 구조다. [한국 Google VAT 안내](https://support.google.com/googleplay/android-developer/answer/138000)에 따른 신고·납부 책임은 개발자 소재지·사업자 상태에 따라 달라지므로 스토어가 모든 세금을 처리한다고 가정하지 않는다.

구독자 200~400명 × ₩2,900 = **총 결제 ₩580,000~1,160,000**, 위 VAT·15% 모델에서는 **₩448,182~896,364**(운영비 차감 전)다. 과거 2~4% 전환율도 실측이 아닌 가정이다. 연간 상품을 후속 검토할 때 MRR은 연 매출/12로 정규화하고 연 가격을 LTV로 부르지 않는다. LTV는 갱신·이탈·환불·마진의 관측이 필요하다.

한국 App Store 월 가격 비교(2026-10-03 검토값): [AccuWeather](https://apps.apple.com/kr/app/id300048137) Premium ₩3,300 / Premium+ ₩6,600, [CARROT Weather](https://apps.apple.com/kr/app/carrot-weather-alerts-radar/id961390574) ₩6,500, [Weather on the Way](https://apps.apple.com/kr/app/weather-on-the-way/id1471394318) ₩4,000. 기능·플랫폼·데이터 범위가 다른 비교 맥락이며 WeatherON 지불의사나 최종 가격의 증거가 아니다.

출시 전 결제 성공/실패, 복원, 갱신, 해지, 환불, entitlement 부여·회수 및 기기 간 일관성을 검증한다. [전자상거래법](https://www.law.go.kr/법령/전자상거래등에서의소비자보호에관한법률)에 따른 한국 무료 체험·할인 후 유료 전환에 적용되는 사전 고지·동의 요건도 실제 상품 조건에 맞춰 확인한다. 초기 전환율 외 **1·2차 갱신율, 취소/환불, 프리미엄 주간 사용, 사용자별 p50/p95 API 원가**를 추적한다.

## 6. 예산 확정 전 남은 입력값

- 일별 활성 사용자와 플랫폼/국가 구성, 모바일 직접 호출+프록시의 공급자별 과금 단위, 캐시 적중률, 페이지 수, 재시도.
- Cloudflare 현재 플랜/배포/계정 공통 사용량, D1 행 스캔/쓰기, DO alarm·GB-s·SQLite I/O/저장, AI pass별 tokens/neurons.
- KMA 승인 쿼터, Kakao 무료 적용 앱/월렛·통합 한도, Google 실제 SKU, Open-Meteo 상업용 전환 조건.
- AdMob 승인·동의 상태와 impressions/eCPM, 스토어 수수료 자격·VAT 상태, 구독 유지율, 빌드/도메인·스토어 실제 청구서.

이 값이 없으므로 “초기 전부 무료”, “월 총비용 확정”, “흑자”를 선언하지 않는다. 지출 경보와 상한은 계측 후 설정하는 후속 구현 항목이다.

## 변경 이력

- **2026-10-03**: 상용 API·현재 AI·서버/빌드 비용 정정, Gemini 산술 교정, 배너→월 구독 검토안과 단위 경제성 추가. 구현/과거 운영/미래 계획/가정/실제 청구 구분.
- **2026-09-08**: 일상 이동 경로 확장 비용 항목 추가.
- **2026-08-08**: 플랫폼별 날씨 provider 범위 정정.
- **2026-06-29**: MVP 검증→안정화→확장 기준 반영.
- **2026-06-20**: 비-AI API 및 Gemini 가정 추정 문서 신설.
