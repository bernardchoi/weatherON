# 고온 안내·코디 회귀 검증 — 2026-10-08

## 후속: 고온 대기 예약 갱신

기준 커밋 `3c617c727ded2144e877f239e8c2ab889d85612f`의 clean 작업 트리에서 후속 수정했다. 기존 저장소 지침을 다시 확인했으며 `.agents/skills`는 없다. 후속 수정·검증 완료 당시에는 커밋·push하지 않았다. 이후 2026-10-08 사용자가 알림 관련 수정의 커밋·일반 push를 별도로 승인했다. 이번 게시 범위는 알림 규칙/어댑터, 관련 회귀 테스트와 문서 5개이며 PR·병합·배포는 포함하지 않는다.

- `notifications.ts`: 같은 등급/시작일이라도 위치 id와 시간대가 다르면 별도 고온 이벤트 키를 사용한다. 예보 기간/최고 기온 변경은 같은 이벤트의 표시 갱신이며 별도 전달 이벤트로 만들지 않는다.
- `localNotifications.ts`: 대기 예약 지문에 예약 시각(일회성), 시간대, 이벤트 키, 제목, 본문, 딥링크, 언어 revision을 포함한다. 동일 입력은 보존하고 변경된 대기 요청만 취소·재예약한다. 반복 알림은 계산된 다음 날짜 대신 반복 시각 규칙을 비교하여 불필요한 교체를 막는다.
- SQLite의 기존 string-map/테이블 계약은 유지하되 최신 상태는 `received:v3:`, `pending:v3:`, `cancelled:v3:`, `unknown:v3:` 키로 구분한다. 실제 이벤트 키로 상태를 연결하며 위치 없는 레거시 키에는 현재 지역을 붙이지 않는다. 수신 근거는 표시된 알림/수신 콜백/응답 콜백이고 OS 알림의 실제 date를 기록한다. 아래 전달 상태 보강 절을 따른다.
- `check-weather-outfit-regressions.mjs`: 위치/시간대/시각/제목/본문/언어 변경, 동일 입력 유지, 무관 반복 알림 보존, 이전 이벤트가 같은 identifier로 표시된 경우, native 대기 상태가 남아 있어도 수신 증거 우선, 문구 변경/모듈 재시작 후 재발송 금지, 기존 string 기록 호환을 production 어댑터 mock으로 검증한다.

후속 실행 결과: 신규 고온·코디 회귀, shared rules, review regressions, iOS reliability, correctness batch, 다국어 2,064개 문구, strict TypeScript, `git diff --check` 모두 PASS. 실제 기기 수신·정시성·OS 예약 구현과 Xcode 빌드는 미실행이다.

제한: 기존 무범위 고온 deliveryKey에는 위치/시간대가 없으므로 새로운 위치별 이벤트에 과거 전달을 확정적으로 연결할 수 없다. 기존 표시/저장 기록은 유지하지만 업그레이드 첫 위치별 안내가 추가로 한 번 올 수 있다. 수신 증거가 없고 native 요청도 사라진 지난 예약은 전달 완료로 추정하지 않고 확인 불가로 저장한다. 동일 키의 자동 재발송을 억제하므로 실제 미전달 건을 놓칠 수 있고, OS 누락과 실제 전달을 완벽하게 구분하지 못한다. 실기기 검증은 **한국시간 2026-10-08 저녁 또는 2026-10-09 예정·미실행**으로 유지한다. 기기에서 위치/시간대 변경 후 예약 교체, 고온 기간 변경 후 본문 갱신, 수신 후 동일 이벤트 재발송 금지와 알림 OFF 정리를 추가 확인한다.

## 후속 보강: 전달 근거와 OS 조회 실패

이번 보강 시작 시 HEAD는 `3c617c727ded2144e877f239e8c2ab889d85612f`였고 앞선 로컬 수정 5개를 보존했다. 보강 완료 후 별도 승인을 받아 이 알림 수정 5개만 커밋·일반 push한다. 아이콘 패키지와 다른 변경은 포함하지 않으며 PR·병합·배포는 하지 않는다.

| 저장 상태 | 의미와 전이 |
| --- | --- |
| `received:v3:<event key>` | 실제 표시/수신/탭 응답 근거가 있다. 같은 이벤트 자동 재발송을 막는다. 사용자가 읽었다거나 모든 기기에 표시됐음을 보장하는 지표는 아니다. |
| `pending:v3:<event key>` | 예정 시각을 보존한 예약/예약 시도 기록이다. OS 호출 전에 기록해 중단 후 지난 시도의 무조건 재예약을 막는다. OS에서 아직 예약 중이면 유지한다. |
| `cancelled:v3:<event key>` | 아직 미래인 예약이 정상 OS 조회에서 없거나, 취소 후 제거가 확인된 상태다. 전자는 취소 주체를 알 수 없다. 수신 근거가 아니며 미래에 다시 활성화하면 재예약할 수 있다. |
| `unknown:v3:<event key>` | 수신 근거 없이 시간이 지난 예약이 OS에 없거나, 예정 시각이 지난 예약을 취소했거나, 추정 전달이 섞인 v2 전달 기록이다. 자동 재발송을 막고 실제 전달로 단정하지 않는다. 뒤늦은 수신 근거가 확인되면 received로 전환한다. |

- 구버전 원시 문자열과 pending:v2는 실제 예약/예정 시각으로 위 상태에 이관한다. delivered:v2에는 이전의 추정 완료가 섞였으므로 확인 불가로 이관하고, 정확한 이벤트 키의 수신 근거가 있는 경우에만 수신 확인으로 승격한다. 위치/시간대가 없는 기록은 원래 키로 보존하며 새 지역 알림에 임의 연결하지 않는다.
- 시작 시 예약 목록 또는 알림센터 조회가 실패하면 `verification-failed`를 반환하고 예약·기록을 변경하지 않는다. 실패를 빈 목록으로 처리하지 않는다. OFF 요청도 사전 조회 실패 시 완료로 보고하지 않으며 기존 예약이 남을 수 있다.
- 취소 후 OS 조회 실패나 남은 예약 발견 시 재예약 전에 중단한다. 부분 취소에서는 제거가 확인된 미래 예약만 취소로 기록하고 실패한 예약의 pending 기록을 유지한다. 예약 후 확인 실패는 pending 기록을 유지하고 다음 동기화에서 실제 목록을 다시 확인한다.
- 수신 콜백은 즉시 메모리에 근거를 게시하고 영속화는 같은 직렬 queue에서 처리한다. OS 조회/예약 호출 도중 수신돼도 새 예약을 억제하거나 직후 교체 요청을 제거하며 저장된 근거를 덮어쓰지 않는다.
- 회귀 추가 범위: 원시/v2 업그레이드와 반복 이관, 위치 없는 과거 키, 재시작, OFF→ON 미래 재예약, 수신 후 알림센터 삭제, 조회 실패 시 불변성, 취소/예약 후 확인 실패, 부분 취소, 실제로 제거되지 않은 취소, 예정 시각 경과 중 취소, 조회/예약 도중 수신 콜백 경합. 기존 위치·시간대·본문·언어 변경 교체 및 반복 알림 보존 테스트를 유지한다.

제한: OS 조회는 완전한 전달 이력 API가 아니다. 확인 불가 자동 재발송 억제는 중복을 줄이는 정책이며 미전달 복구를 보장하지 않는다. 기존 기록 보존 한도인 최근 8일·최대 40개를 유지하므로 무기한 중복 방지 보장은 없다. 구버전의 사라진 지역 정보·전달 근거는 복원할 수 없어 업데이트 첫 지역별 안내가 추가로 올 수 있다. 기기 네이티브 전달과 Xcode 빌드는 미검증이다.

최종 실행 결과(이번 보강 후 모두 exit code 0):

| 실행 명령 | 결과 |
| --- | --- |
| `node scripts/check-weather-outfit-regressions.mjs` | PASS — 기존 4개 수정, 예약 교체, v3 이관, 조회 실패, 재시작, 취소, 수신/탭 경합 |
| `node scripts/check-shared-rules.mjs` | PASS |
| `node scripts/check-review-regressions.mjs` | PASS — 실제 취소 미완료 시 남은 예약 건수도 유지 |
| `node scripts/check-ios-reliability.mjs` | PASS — 76개 SQL 실패 지점 및 기존 알림/날씨 신뢰성 회귀 |
| `node scripts/check-correctness-batch.mjs` | PASS |
| `node scripts/generate-mobile-locales.mjs --check` | PASS — 2,064개 문구 |
| `node node_modules/typescript/bin/tsc --noEmit -p apps/mobile/tsconfig.json` | PASS |
| `git diff --check` | PASS — 줄바꿈 자동 변환 안내만 있으며 공백 오류 없음 |

네이티브 알림 경계는 mock 검증이다. 테스트 중 발견한 취소 미완료의 예약 건수 누락을 수정했고 최종 전체 실행은 위와 같이 통과했다.

실기기 검증: **한국시간 2026-10-08 저녁 또는 2026-10-09 예정·미실행**.

1. 위치/시간대/본문 변경 후 예약 시각과 내용 교체, 무관 반복 알림 유지.
2. 앱 실행 중 수신과 탭 후 재실행 시 같은 이벤트가 다시 오지 않는지 확인.
3. 앱 종료 중 수신 후 알림센터를 지우고 재실행하여 중복이 없는지 확인. 이는 전달 보장 검증을 대신하지 않는다.
4. OFF로 미래 예약 제거 후 ON에서 정상 재예약되는지 확인하고 기존 설치에서 업그레이드 동작을 확인.

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
