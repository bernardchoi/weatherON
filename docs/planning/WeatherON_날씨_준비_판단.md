# 날씨 준비 판단 계약 · 2026-10-22

기준 체크아웃: `13bb16f28c1d8bb174fef477d1f0194fe4e0c270`. 구현 브랜치: `fix/weather-guidance-context`. 기존 MVP PRD·서비스 계획과 최신 추위 코디 개선을 확인한 뒤 필요한 날씨 계약만 맞췄다. 여행 확장·스플래시·배포는 범위 밖이다.

## 생성 경로와 문맥

| 표면 | 생성 경로 | 근거 범위 |
|---|---|---|
| 홈 상단 기온·체감 | `HomeScreen → currentWeather` | 현재 위치·관측 시각. 목적지 예보로 바꾸지 않음 |
| iOS 홈 준비 문구 | `HomeScreen → buildHomePreparation → getPreparationThermal / judgePreparationConditions` | 선택 목적지의 계산된 도착 시각을 덮는 실제 시간별 예보 한 구간. 도착 기준 일정은 목표 도착 시각, 출발 기준 일정은 출발+이동시간 |
| Android 홈 동행 문구 | `getHomeCompanionMessage → buildHomePreparation` | 현재 위치의 최신 관측. 목적지 도착 예보로 가장하지 않음 |
| 출발 준비 검사 | `buildOutingCheck → buildHomePreparation` | 선택 시각의 해당 위치 예보. 기온 하락 비교는 양쪽 일반 기온이 확인될 때만 추가 |
| 오늘 코디·홈 코디 카드 | iOS `useWeatherOnAppState → buildTodayOutfit → recommendOutfit → getWeatherSignals`; Android 기존 `recommendOutfit` 경로 | iOS는 선택 위치 현재 체감/대체 기온+남은 당일 실제 예보. `daily: undefined`, 지난 새벽·다음 날 제외 유지. Android 기존 스냅샷 범위 유지 |
| 내일 코디 | `TomorrowBriefScreen → buildTomorrowWeather → recommendOutfit` | 해당 위치 내일 일 예보와 내일 시간별 예보. 현재 체감·습도·UV·미세먼지 제거 유지 |
| 목적지 코디 | `DestinationCareScreen / DestinationListScreen → recommendOutfit` | 해당 목적지의 별도 스냅샷. 도착 시각 한 구간이라고 재표기하지 않음 |
| 목적지 목록의 도착 근거 | `DestinationListScreen → forecastAt / buildHomePreparation` | 각 목적지·일정별 도착 예보 |
| 코디 시간대별 설명 | `recommendOutfit → getTimeAdviceText → getWeatherSignals` | 각 시간대의 독립 스냅샷. 현재 체감·습도·UV·미세먼지 전용 금지 |
| 출발 시각 | `buildDestinationCare`, 경로·일정 유틸, `getHomeDepartureSummary` | 이동시간·준비 여유·일정. 날씨 문구 규칙과 합치지 않음 |

`feelsLikeMessage`는 현재 체감 차이를 설명하는 표시용 문구다. 위 준비물·코디 분류를 대신하지 않는다. 우산·신발 추천도 기존 `getWeatherSignals`를 사용하므로 새 구조화 신호를 공유한다. 알림 임계값·사용자 알림 설정은 이번 변경에서 바꾸지 않는다.

## 공유 판단과 우선순위

`packages/shared/src/rules/thermalJudgment.ts`의 순수 함수로 온도 판단, 강수 형태·바람 판단, 안전한 동의 문구 변형을 공유한다. `weatherSignals.ts`는 전달받은 범위만 집계한다. 서로 다른 장소·시간의 스냅샷을 합치지 않는다.

1. 결측·오래된 관측·검증되지 않은 위치·지난 일정은 신뢰 상태를 먼저 알린다. 확인된 개별 신호까지 다른 필드의 실패 때문에 버리지 않는다.
2. 우박의 실외 이동 확인, 눈·혼합 강수의 미끄럼/방수, 강수+강풍의 방수 행동을 우선한다.
3. 강풍과 보온·영하·더위 행동을 함께 남긴다. 비·눈 문구가 보온 안내를 없애거나 우산만 권하는 것으로 끝나지 않게 한다.
4. 이후 일교차·선선함·온화함을 안내한다. 맑음·일교차가 추위나 강풍 준비를 대신하지 않는다.

| 제품 조건 | 구조화 판단·행동 |
|---|---|
| 현재 기온/체감 ≤8℃, 범위 최저 ≤8℃, 또는 범위 최고 ≤12℃ | `cold`: 보온 겉옷+따뜻한 상의. 기존 겨울/보온 태그 후보 선택 유지 |
| 위 추위 중 기온/체감/범위 최저가 0℃ 미만 | `freezing`: 두툼한 겉옷+목도리 |
| 추위와 최고 ≥31℃가 함께 존재 | 보온을 유지하고 더운 시간 겉옷 벗기·물 준비 추가. 하나의 평균 기온으로 상쇄하지 않음 |
| 추위가 아니며 체감/대체 기온 ≥27℃, 일반 기온 ≥29℃, 최고 ≥31℃이면서 체감/대체 ≥22℃, 또는 습도 ≥70%이면서 체감/대체 ≥26℃ | `hot`: 통풍 좋은 옷+물·휴식 |
| 추위/더위가 아니며 체감/대체 ≤18℃, 또는 최고 <29℃·최저 ≤17℃·변동 ≥7℃, 또는 바람 ≥7m/s·체감/대체 <24℃ | 겉옷 준비. 큰 일교차이면 입고 벗기 행동 |
| 확인된 강수 상태, 확률 ≥50%, 또는 양 >0mm | `wet`: 형태별 준비. 확률/양만으로 비나 눈을 단정하지 않음 |
| 바람 ≥7m/s; 강수와 바람 ≥8m/s | `windy`; `windAndWet`: 추위/서늘함에는 바람을 막는 옷, 더위에는 날릴 물건 정리와 물 준비. 강수 동반 시 방수 행동 |
| 온도 판단 근거 없음 | 기온 재확인. 온화함·가벼운 옷·현재 차림이 충분하다는 보장 금지 |

이 수치는 WeatherON의 옷차림 휴리스틱이며 공식 기상특보·의학·안전 기준이 아니다. 기존 최저 8℃/최고 18℃ 조합보다 범위 최저의 추위 보호를 넓혔다. 최고가 높거나 다른 필드가 누락돼도 확인된 추운 시간대가 얇은 옷 안내로 바뀌지 않게 하며, 고온 시간은 별도 행동으로 남긴다.

## 데이터·문구 계약

- 계산 단위는 ℃·m/s·mm·%. 화면 단위 변환과 정수 반올림은 판단 뒤에 수행한다. 음수·실제 0은 유효하다.
- `NaN`·무한대·숫자 아닌 값, 음수 강수/풍속, 0–100 밖 확률·습도, 가용성 플래그가 거짓인 값은 판단 근거로 사용하지 않는다. WeatherKit의 확인 플래그도 보존한다. 온도 -100–70℃ 범위는 단위 오류·손상값 방어 범위이며 날씨 경보 임계값이 아니다. 입력만으로 모든 단위 오표기를 탐지할 수는 없으며 provider adapter의 정규화가 전제다.
- 최신 여부는 기존 15분 TTL, 미래 관측 허용 1분, `stale/cache/fallback/locationUnverified` 규칙을 사용한다. 미래 시각 예보는 최신 스냅샷의 실제 구간이 덮을 때만 사용한다.
- 선택 시각 예보가 없으면 현재 자료를 쓸 수 있으나 `목적지 현재 날씨`와 `선택 시각 예보 없음 · 현재 기준`을 표시한다. 예보 기온 결측을 현재 체감으로 채우지 않는다.
- 일자 경계는 위치 IANA 시간대의 기존 변환 경로를 사용한다. 오늘 코디는 당일 남은 ISO 시각 예보만 사용한다. 부분 결측의 완전성 상태와 확인된 온도·강수·바람 신호는 별개다.
- `thermalPreparation`은 7종×2개의 동의 문구를 준비한다. 같은 위치·시간 구간은 같은 변형을 선택하며 렌더마다 무작위로 바뀌지 않는다. 위치 ID와 예보 시각만 내부 선택 키로 쓰고 주소·좌표·계정은 사용하지 않는다.
- 강수·강풍·보온 문구를 조합해도 영어·일본어 번역을 유지한다. 여러 줄은 알려진 문구 블록부터 번역하고, 번역이 없는 경고는 원문을 보존한다. 일반적 낙관 문구로 대체하지 않는다.
- iOS 안내는 `hangul-word` 줄바꿈을 적용하고 줄 수 제한을 두지 않는다. 긴 경고는 필요한 높이로 늘어나며 기존 스크롤·레이아웃 구성을 유지한다.
- 로컬 규칙과 정적 번역만 사용한다. 범용 LLM/API 호출·추가 추적·런타임 의존성을 도입하지 않는다.

## 문구 예시

| 상황 | 안내 예시 |
|---|---|
| 현재 3℃·체감 2℃, 목적지 도착 6℃ | 현재 코디는 보온 겉옷/따뜻한 상의. 홈은 `목적지 도착 무렵 · 10/22 08:40`, `추운 날씨에 맞춰요. / 따뜻한 상의와 보온 겉옷을 준비해요.`, 근거 `기온 6℃` |
| 영하 | `영하의 추위에 대비해요. / 두툼한 겉옷과 목도리를 챙겨요.` |
| 6℃·비·9m/s | `비와 바람이 겹쳐요. / 방수 겉옷을 챙겨요. / 보온 겉옷과 따뜻한 상의도 챙겨요.` |
| 눈·추위 | `눈 소식이 있어요. / 미끄럼 적은 신발로 나가요. / 보온 겉옷과 따뜻한 상의도 챙겨요.` |
| 온화한 22℃ | `온화한 기온이에요. / 활동하기 편한 차림으로 준비해요.` |
| 더운 35℃ | `더위에 대비해요. / 통풍 좋은 옷과 물을 챙겨 쉬어가요.` |
| 14–25℃의 큰 변동 | `시간대별 기온 차가 커요. / 벗고 입기 편한 겉옷을 챙겨요.` |

`/`는 줄바꿈 예시다. 실제 변형은 동일한 행동 범위 안에서 결정된다.

## 변경 파일과 검증

- 공통 판단: `thermalJudgment.ts`(신규), `weatherSignals.ts`, `outfit.ts`, `rules/index.ts`, `constants.ts`(규칙 0.6.0).
- 모바일: `homeOuting.ts`, `homeCompanion.ts`, `todayOutfit.ts`, `HomeScreen.tsx`, `localization.ts`, `locales/en.json`, `locales/ja.json`.
- 회귀: `scripts/check-weather-guidance.mjs`(신규, 날씨/코디 회귀 묶음에 포함), `check-weather-outfit-regressions.mjs`, `check-home-outing.mjs`, `check-ios-home-experience.mjs`, `check-home-plan-width.mjs`, `check-shared-rules.mjs`, `check-android-product-quality.mjs`의 바뀐 생성 경로·테스트 fixture 계약.
- 기존 홈 검사에 빠져 있던 최신 상태/콜백 mock도 보완했다. 본체의 스플래시·선택 동작·애니메이션은 변경하지 않았다.
- 문서: 이 판단 계약, MVP PRD F1/F3, 서비스 계획의 계약 링크만 정리했다.

최종 실행 결과와 실기기 미검증 범위는 아래 검증 기록에 적는다.

### 최종 검사 결과

아래 12개 검사가 최종 소스에서 모두 통과했다. 실행 로그는 `/tmp/weatheron-final-checks.json`과 `/tmp/weatheron-*.log`에 있다. 새 `check-weather-guidance.mjs`는 `check-weather-outfit-regressions.mjs`에서 자동 실행한다.

| 실행 | 결과 |
|---|---|
| `node scripts/check-weather-outfit-regressions.mjs` | 통과: 새 조건/언어 행렬, 기존 추위 코디, 알림 회귀 포함 |
| `node scripts/check-shared-rules.mjs` | 통과 |
| `node scripts/check-home-outing.mjs` | 통과: 현재/도착·위치 분리, 실제 JSX, 강수 형태·결측·저장 가용성 |
| `node scripts/check-today-outfit.mjs` | 통과: 남은 당일, 지난 최저 제외, 시간대·DST, 결측·캐시 |
| `node scripts/check-ios-home-experience.mjs` | 통과: 동행 문구·일정·접근성 상태 모의 검사 |
| `node scripts/check-home-plan-width.mjs` | 통과: 320–440pt, 글자 1–2배, 실제 JSX의 레이아웃 계약 |
| `node --no-warnings scripts/check-correctness-batch.mjs` | 통과: 시간대별 내일 예보·경로·권한·TTL 등 기존 회귀 |
| `node --no-warnings scripts/check-ios-widget-sync.mjs` | 통과: 동작/네이티브 소스 계약. Swift 실행 아님 |
| `node scripts/check-android-widget.mjs` | 통과: Android 연결/소스 계약. 실기기 아님 |
| `node scripts/generate-mobile-locales.mjs --check` | 통과: 2,234개 원문·영어·일본어 카탈로그 |
| `tsc --noEmit -p apps/mobile/tsconfig.json` | 통과 |
| `git diff --check` | 통과 |

새 회귀는 3℃/체감 2℃/도착 6℃, 영하·실제 0·소수 경계, 온화/고온, 강풍·비·눈·얼음/우박, 큰 일교차, 추위+고온 상충, 부분 실패, 숫자 sentinel, 오래된/미래 관측, 당일/내일/다른 목적지, 단위 표시, 렌더 안정성, 모든 동의 문구와 조합 경고의 영어/일본어 번역, 번역 미등록 경고 원문 보존을 포함한다. 현재 기온 가용성이 없을 때 비교 기온차를 만들지 않는 것도 검사한다.

초기 환경에서 `react-native-svg`가 설치되어 있지 않아 전체 타입 검사가 실패했다. npm 기본 캐시 쓰기 오류와 일반 install의 기존 peer 충돌을 피하고, 저장소가 이미 지정한 15.15.4 패키지만 임시 캐시에서 복원했다. 선언·lockfile 변경은 없으며 최종 타입 검사는 통과했다. 현재 차단 항목은 없다.

### 화면 검증과 한계

In-app Browser 플러그인이 제공되지 않아 저장소 지침에 따라 설치된 Puppeteer/Chromium으로 DOM·반복 스크린샷을 확인했다. URL은 `http://127.0.0.1:4178/`, 제목은 `WeatherON guidance QA`다.

실제 `HomeScreen.tsx`의 `HomeDecisionHero`와 사용한 스타일을 추출해 RN Web 어댑터에서 렌더링했다. 검사 흐름은 현재 3℃/체감 2℃ → 도착 6℃ 보온 안내 → 비+9m/s 전환 → 방수+보온 안내 유지 → 상세 열기 콜백이다. 390×844/글자 1배, 360×780/1.4배, 320×740/2배 모두 빈 화면·오류 overlay·관련 콘솔 오류·가로 넘침·안내 문구 잘림이 없었다. 경고 Text의 실제 clientHeight와 scrollHeight가 일치했다. 제목·URL·버튼 전환·콜백 결과도 확인했다.

스크린샷은 `/tmp/weather-guidance-ui/home-390-font100.png`, `wind-rain-360-font140.png` 및 같은 디렉터리의 320px/2배 등 6장이다. 어댑터에서는 iOS `flex: 0`의 크기 의미와 한글 단어 단위 줄바꿈을 Web에 대응시켰다. 가상 조건 토글·상세 콜백 확인 영역은 검증용이며 제품 UI에 추가하지 않았다. 이미지·애니메이션·전체 앱 내비게이션·실시간 API 통합 검증은 이 화면 검사에 포함되지 않는다.

실제 iPhone의 네이티브 한글 줄바꿈·Dynamic Type·배경/카드 간격·VoiceOver·실제 위치/네트워크 전환은 미검증이다. iOS 빌드·Xcode Cloud·TestFlight·배포는 실행하지 않았다. 스플래시 파일 변경은 없고, 커밋·푸시·PR·main 병합도 하지 않았다. HEAD는 기준 커밋에 그대로 있으며 별도 수정 브랜치의 미커밋 변경으로 남긴다.
