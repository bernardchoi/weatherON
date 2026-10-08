# 고온 안내·코디 회귀 검증 — 2026-10-08

## 시작 상태와 범위

- Windows 작업 경로: `C:\Users\dhcho\Documents\Codex\2026-10-08\task\weatherON`.
- 시작 브랜치 `fix/ios-data-notification-weather`, HEAD `cc5773aaa54d531fbe0a0a3cf68e75c80ca4d353`. 원격 main `015e8adc4e4ee32f02203f8bc1dde9ce92fd387e`, main보다 6커밋 앞섬을 재확인했다. 새 사본의 수정 전 상태는 clean이었다.
- 기존 Windows 저장소 3개는 읽기만 했으며 모두 clean이었다. 사용자 변경·기존 커밋을 덮어쓰지 않았다. push, PR, merge, 배포는 수행하지 않았다.
- 저장소 `AGENTS.md`의 iOS Xcode 27 / Xcode Cloud 지침을 확인했다. 체크아웃에 `.agents/skills`와 하위 `AGENTS.md`는 없었다. 이번 작업은 규칙·화면 문구·기획·코드 검증이며 디자인시스템 변경은 없다.

## 구현과 판단 근거

| 항목 | 구현 | 주요 파일 |
| --- | --- | --- |
| 1. 폭염 예측 기준 | 현재 feels-like를 미래 일반 기온 최대값에 섞던 코드를 제거했다. 공통 예보에는 미래 체감온도가 없으므로 일반 기온 33/35℃, 2일 연속의 **앱 자체 고온 안내**로 표현한다. 공식 폭염주의보/경보 도달 주장은 제거했다. stale/fallback과 시간대 없는 해외 예보는 보류한다. | `packages/shared/src/rules/notifications.ts`, `types/weather.ts`, `WeatherON_API_연동_대기목록.md` |
| 2. 날짜·발송 시점 | 과거 예보와 현지 18시 이후 지난 시작일을 제외하고 가장 가까운 연속 고온 기간을 선택한다. UTC/offset hourly 날짜는 예보 지역 시간대로 묶는다. 실제 시작일·기간·일최고 일반 기온을 표시하고 현지 시작일 07:30에 예약한다. 당일 07:30 이후 18:00 전 갱신은 5초 후 예약한다. 날짜가 없는 알림은 보류한다. | `notifications.ts`, `apps/mobile/src/data/demoState.ts`, `types/recommendation.ts` |
| 3. 코디 날씨 적합도 | 임의 `matchPct`를 모델에서 제거했다. 추천된 품목의 보유 수/총 수와 미보유 품목명을 계산한다. C4는 규칙 기반 추천이며 보유 수가 날씨 적합도 점수가 아님을 설명한다. 목적지·내일 화면의 같은 퍼센트 표시도 제거했다. | `outfit.ts`, `types/recommendation.ts`, `OutfitDetailScreen.tsx`, `DestinationCareScreen.tsx`, `DestinationListScreen.tsx`, `TomorrowBriefScreen.tsx` |
| 4. 우천 코디 우선순위 | 겉옷·신발·액세서리는 계절/온열 조건을 먼저 적용하고 비 태그를 필수로 확인한 후보 안에서 보유품을 우선한다. 더운 비오는 날 모자/샌들이 미보유 우산/방수 신발을 밀어내지 않는다. 대응 후보가 없으면 온열 조건에 맞는 품목으로 fallback하되 C4에 부족 슬롯을 알린다. 미보유 추천품은 `추가 준비`로 표시한다. | `wardrobeSelect.ts`, `outfit.ts`, C4/G2/H7 화면 |

33/35℃는 기존 안내 구간을 유지한 제품 규칙이며 정확성/안전성을 검증한 공식 임계값이 아니다. [기상청 발표 기준](https://www.weather.go.kr/w/forecast/guide/standard.do)은 일최고 **체감온도**를 사용한다. Open-Meteo 원응답의 `apparent_temperature`와 WeatherKit `temperatureApparent`는 정규화된 미래 예보·SQLite 저장 계약에 유지되지 않는다. [Open-Meteo 정의](https://open-meteo.com/en/docs)의 apparent temperature는 습도·바람·일사 등을 고려하며 기상청 산식과 동등하다고 확인하지 않았다.

`officialSpecialAlert` 조회·정규화·표시 경로는 유지했다. 내부 기존 heatwave rule id는 저장 설정과의 호환을 위해 유지하며 앱 안내 dedupe key에 `app-high-temperature-v1:`을 붙여 기존 특보 도달 예상 문구와 분리했다. 기존 호우 예보 기준과 알림 정책(방해 최소화/기기 조용한 시간)은 유지된다. EN/JA 문구를 갱신하고 동적으로 생성되는 공식 특보 제목 번역 키도 유지했다.

## 실제 실행한 코드 검증

환경: Windows, Node `v24.18.1`, npm `11.16.0`, lockfile 기준 `npm ci`. iOS 네이티브 경계는 mock이며 실제 계정/기기/실서비스를 조작하지 않았다.

| 명령 | 결과 | 검증 범위 |
| --- | --- | --- |
| `node scripts/check-weather-outfit-regressions.mjs` | PASS | 현재 체감 혼입 금지, 33/35 경계·연속 날짜, 가장 가까운 기간, 과거/저녁/stale/fallback 제외, 해외 UTC 날짜·DST, 목적지, 공식 특보 분리, 여름 비 대응 우선/겨울 유지, 무관 의류 보유 불변성, 추가 준비/부족 슬롯, 실제 로컬 알림 어댑터의 미래 DATE 예약·중복 유지·해제(mock) |
| `node scripts/check-shared-rules.mjs` | PASS | 공유 추천 규칙, 공급자 정규화·공식 특보 처리, 모바일 소스 번들 |
| `node scripts/check-review-regressions.mjs` | PASS | SQLite 저장 실패/재시도, 사진 교체 트랜잭션, 알림 동시 처리/해제 검증, 해외 시간대/캐시 |
| `node scripts/check-ios-reliability.mjs` | PASS | 마이그레이션 SQL 76개 실패 지점, 알림 네이티브 실패·재시도·빠른 토글, 날씨 partial/slow failure·캐시·late response(mock) |
| `node scripts/check-correctness-batch.mjs` | PASS | 현재 위치 복구, 내일 현지 날짜·DST, 재인증 계정 보호, 경로 시각, iOS 시간대 trigger, TTL, 강수 토글(mock) |
| `node scripts/generate-mobile-locales.mjs --check` | PASS | EN/JA 2,064개 메시지, 키/placeholder/한국어 잔존/locale policy 검사 |
| `node node_modules/typescript/bin/tsc --noEmit -p apps/mobile/tsconfig.json` | PASS | 모바일과 경로로 참조된 shared 소스의 strict TypeScript 검사 |
| `git diff --check` | PASS | whitespace 검사 |

검사 초기 실패도 해결했다: esbuild의 샌드박스 상위 경로 접근은 승인된 일반 실행으로 재실행했고, 기존 검사에 Google Sans `.ttf` loader, 신규 outfit 버전 기대값, 최신 hydration ref·파일시스템/현지화 mock을 보완했다. Windows CRLF 때문에 import 제거가 실패한 정확성 harness는 `\r?\n`을 허용하도록 수정했다. 회귀 assertion은 약화하지 않았다. 별도 lint 스크립트는 없다.

## 실기기 일정과 미검증

**실기기 검증 예정: 한국시간 2026-10-08 저녁 또는 2026-10-09. 상태: 미실행.** 과거 기기 통과 기록을 이번 수정의 통과로 간주하지 않는다. Windows에서는 iOS Xcode 빌드/실행을 하지 않았고 현재 Mac은 오프라인이다. 이번 코드의 실제 OS 예약 정시성·앱 종료 후 수신·실제 upstream 예보/특보·작은 화면 문구 줄바꿈·VoiceOver·기기 이동 시간대 전환은 아직 검증하지 않았다. 배포/설치는 별도 승인된 절차에서 진행한다.

짧은 실기기 체크리스트:

1. QA 예보로 2~3일 뒤 고온을 설정해 H3·푸시에 실제 시작일, 일반 기온, 앱 안내 구분이 표시되고 당일 즉시 예약되지 않는지 확인한다. 공식 특보 데이터는 기존 공식 경로에만 나타나야 한다.
2. 시작일 현지 07:30 전/후와 18:00 이후, 해외 시간대에서 예약 시각을 확인한다. 반복 갱신·재실행 시 중복이 없고 알림 OFF 시 예약이 사라지는지 확인한다. 방해 최소화 정책 적용 상태도 기록한다.
3. C4에서 적합도 %가 없고 추천 품목 보유 수와 추가 준비 목록이 일치하는지 확인한다. 무관한 겨울 목도리·장갑 보유를 바꿔 여름 추천 준비 상태가 변하지 않는지 확인한다.
4. 더운 우천 + 보유 샌들/모자 + 미보유 우산/방수 신발에서 비 대응품·여름 온열 조건·추가 준비 표시를 확인한다. 후보 부족 시 경고, 겨울 우천/맑은 날 회귀도 확인한다.
5. C4/G2/H7에서 KO/EN/JA, 작은 화면·큰 글자·스크린리더로 새 문구를 확인한다.
