# P1 Live Activity 예약·종료 / 백그라운드 알림 — 2026-10-30 KST

## 판정

부분 수정, TestFlight 실기기 게이트 미완료임. `909a073`은 pending 토큰 대기와 등록 실패를 구분한 변경이며, 등록·종료 해결의 증거가 아님. 이번 작업은 `d16ae98` 작업 트리에서 수행함. 기존 수정 파일과 개인 일정은 보존함. 새 빌드·설치·서버 배포·푸시 없음.

- [10/23 기록](../live-activity-end-2026-10-23/RESULTS.md): Build 56의 즉시 시작 활동이 두 번 종료됐음. 두 번째 백그라운드는 약 3분 44초이며 APNs 응답은 확보 못 했음. 18:00 먼 미래 예약은 토큰 발급/등록 미확인임. 마지막 복원도 확정하지 못한 기록으로 유지함.
- [10/24 기록](../testflight-feedback-3-background-2026-10-24/RESULTS.md): 20.2분 앱 진입 없이 대기한 뒤 화면 복구 및 갱신 확인함. 복구 중 Spotlight 진입 시도가 있어 전체 약 26분을 연속 관찰로 계산하면 안 됨. 수시간·하룻밤·오프라인 수신 증거가 아님.
- 이번 회차 수시간·하룻밤 시험은 시작하지 않았음. 실제 관찰 시간 0시간, 중단 여부 해당 없음. 가상 타이머/서버 모의 응답을 실시간 관찰로 환산하지 않음.

## 현재 기기 단계별 추적

| 단계 | 이번 회차 증거 / 한계 | 다음 통과 조건 |
| --- | --- | --- |
| 설치 버전 | 17:31 KST 미러링 MY 화면의 `WeatherON v1.0.0`, 17:36 TestFlight 현재 테스트 중 `1.0.0 (56)` 및 `열기` 확인. 업데이트/설치 조작 없음. `xcrun devicectl list devices --timeout 10` 시간 초과 | UI상 설치 Build 56 확인. 다음 후보는 새 빌드 번호와 실제 실행 앱 일치 확인 |
| 서명 권한 | 현재 설치 바이너리에서 재확인 못 함. Build 56 권한 정상은 과거 기록임 | Xcode Cloud 해당 Archive와 배포 메타데이터의 앱 APNs production/App Attest/App Group/Apple Sign In, 확장 WeatherKit/App Group 확인. `ci_post_xcodebuild.sh` 통과 |
| 토큰 발급 | 이번 시험용 활동 생성 안 함. 실제 토큰 관찰 없음 | native `active/scheduled/lifecycle` 및 토큰 **존재 여부만** 기록. 토큰 원문 저장 금지 |
| 서버 등록 | 실제 인증/App Attest/등록 응답 미수집. 자동 검사는 경계 모의임 | 동일 시험의 인증/무결성 통과, 등록 응답 `scheduled:true` 확보. 실패 시 HTTP 상태와 허용된 오류 코드만 기록 |
| 서버 예약 | 코드상 Durable Object transaction에서 job 저장 및 alarm 설정 후 응답함 | 해당 시험의 저장/알람 설정 성공을 확인. 로컬 pending이나 UI 문구로 대체 불가 |
| APNs 응답 | 이번 실서비스 요청 없음. 모의 200/503/410 및 네트워크 예외만 검사 | `departure_end_push`의 시각/status/reason/environment 수집. 200은 APNs 접수이며 기기 종료 증거가 아님 |
| 기기 종료 | 이번 시험 관찰 없음. 과거 Build 56 즉시 시작 2회와 구분 | 앱 재진입 전 잠금 화면과 Dynamic Island 양쪽 제거 관찰, 최초 관찰 시각 기록 |

원시 native status JSON에는 토큰이 있으므로 통째로 콘솔/파일에 남기지 않음. 인증 헤더, APNs URL의 토큰 경로, 요청 body, 사용자/목적지/좌표도 수집하지 않음. 서버 기존 로그는 event/status/검증된 reason/environment만 기록함. 단독 시험 시간대를 사용해 사건을 대조하고, 개인정보가 있는 화면은 감사 폴더에 저장하지 않음.

## 기존 처리 확인 및 이번 수정 범위

영향 범위는 iOS `departureLiveActivity.ios.ts`와 실제 브리지를 실행하는 `check-departure-push.mjs`임. 호출자는 앱 상태 자동 동기화, 목적지 케어 화면 상태 조회/취소, native 토큰 이벤트임. 플랫폼 공용 타입·Android·서버 계약·export·설정 변경 없음. 개인 저장 데이터 삭제나 인증 완화 없음.

| 항목 | 기존 처리 | 이번 조치 / 한계 |
| --- | --- | --- |
| 먼 미래 예약 | iOS 26 `request(... start: departure-60분)` / `.pending` 추적. 토큰이 없으면 서버 요청 생략 | pending 토큰 없음은 `automaticEndScheduled:undefined` 유지. 성공/실패로 단정 안 함 |
| 활성화 후 토큰 없음 | 이벤트를 기다리며 실패 상태만 반환 | 실행 가능한 동안 15초→최대 5분 간격으로 native 재조회 추가 |
| 등록 거절 | 예외만 재시도하고 `scheduled:false` 응답은 중단 | 음수 응답도 재시도하도록 수정 |
| 토큰 회전 | native `pushTokenUpdates`; 서버는 activity별 job 덮어쓰기 | JS 등록 요청 직렬화로 이전 요청이 새 토큰 뒤에 도착하는 경합 방지. 이전 응답을 새 상태 성공으로 캐시하지 않음 |
| 시간 변경 | Activity attributes의 출발 시각이 다르면 기존 활동 종료 후 새 활동 생성 | 기존 유지. 빠른 변경은 자동 동기화 revision/queue로 최신 입력 반영 검사 |
| 케어 OFF / 취소 | native 전체 활동 종료 및 observer/work item 취소 | JS 등록 재시도와 캐시도 무효화. 취소 뒤 늦게 실패한 등록이 재시도를 재생성하지 않도록 수정 |
| 늦은 토큰 이벤트 | 이벤트에 담긴 이전 활동 상태를 그대로 등록 | 현재 native 상태를 재조회해 종료/교체된 활동의 늦은 이벤트 무시 |
| 중복 활동 | native 일치 활동 재사용, 나머지 종료; 자동 sync queue | 소스 계약 검사 통과. 실제 여러 활동 생성/회전은 후보 실기기 필요 |
| 알림 예약·취소 | `notificationSync` 최신 의도 직렬화, 실패 재시도, OS 예약 목록 검증, foreground 재조정 | 기존 사용자 수정 보존. 알림함 탭/OS 응답/수신은 아래 별도 게이트 유지 |

서버에는 취소 API가 없음. 이미 등록된 이전 활동의 job은 native 종료 후에도 이전 출발 시각까지 남을 수 있고, APNs terminal 응답 또는 최대 1시간 재시도 만료로 폐기됨. 이번 수정은 이미 진행 중인 서버 요청을 취소하지 않음. 새 활동은 다른 activity ID이므로 이전 종료 푸시가 새 활동을 종료시키는 계약은 아님. 서버 토큰 즉시 폐기를 이번 결과로 주장하지 않음.

## 실행한 자동 검사

모두 통과함. native/인증/네트워크 모의와 실제 기기 증거를 구분함.

- `node scripts/check-departure-push.mjs`: validation/auth/App Attest 호출/JWT/APNs payload, 미래 알람, 503·통신 예외 재시도와 복구, 410/만료 폐기, 전송 중 서버 토큰 회전 보존. 실제 iOS TS 브리지에서 pending/active 토큰 없음, 등록 실패/음수 응답, 재시도 성공, 중복 등록 억제, 전송 중 회전 순서, 시간 변경, 케어 OFF, 명시 취소, 늦은 이벤트/실패 검사. Swift ActivityKit 자체는 실행하지 않음.
- `node scripts/check-ios-live-activity.mjs`: native pending/일치 재사용/다른 활동 종료/표면 구성 등 소스 계약.
- `node --no-warnings scripts/check-ios-reliability.mjs`: 기존 OS 예약·취소 실패, 검증 재시도, 빠른 토글, foreground 재조정 및 날씨 복귀 경합. 경계 모의임.
- `node scripts/check-departure-activity-intent.mjs`: 프리뷰 보존/저장 교체/케어 OFF.
- `node scripts/check-ios-deep-links.mjs`: cold/warm 반복 URL, 잘못된 URL, 취소된 effect. OS 알림 배너 탭 증거는 아님.
- `node --no-warnings scripts/check-shared-rules.mjs`, `node scripts/check-cloudflare-request-logging.mjs`, `node_modules/.bin/tsc --noEmit -p apps/mobile/tsconfig.json`.

## TestFlight 후보 재현 절차와 통과 기준

Xcode Cloud에서 수정 커밋으로 Archive → 서명 gate → Apple 처리 → TestFlight 설치 완료 후 진행함. iOS EAS 사용 안 함. 로컬 개발 빌드로 배포 권한 증거를 대체하지 않음. QA-A/QA-B라는 시험 목적지만 사용하고 개인 일정은 변경하지 않음. 시작 전 테스트 계정·기기 시각대·iOS 버전·후보 빌드·알림/Live Activity 허용·집중 모드/요약·네트워크를 기록함. 계정/무결성 실패를 APNs 실패로 분류하지 않음.

| 시험 | 조작 | 통과 기준 | 이번 실기기 결과 |
| --- | --- | --- | --- |
| 즉시 시작 | QA-A 출발 T+5분, 시작/토큰 존재/서버 등록 확인 후 홈으로 나감. 앱 다시 열지 않음 | 등록→예약→APNs→잠금 화면/Island 종료를 각각 기록. 출발+30초 내 제거를 QA 목표로 측정하며 OS 보장으로 쓰지 않음 | 미실행 |
| 먼 미래 활성화 | QA-A T+3시간, 시작 T+2시간. pending 상태에서 백그라운드 전환, 활성화·토큰 발급·등록·종료까지 관찰 | 앱 재개 없이 시작 시각의 활성화 및 출발 종료 확인. 토큰 이벤트 때 주어진 실행 시간에 인증·등록이 완료돼야 함. 등록이 앱 재진입 후에만 됐다면 실패 | 미실행 |
| 장시간 백그라운드 | 위 시험과 별도로 최소 3시간 앱 미진입. 다음은 8시간 이상 하룻밤, 시작 예정 시각이 대기 종료 전에 오도록 예약 | 실제 시작/종료/경과와 관찰 중단을 기록. 복귀 전 표면·알림 수신, 복귀 후 목적지·날씨 갱신 확인 | 미시작, 각각 관찰 0시간 |
| 등록 전 단절/복구 | 시험 생성 직후 통신 단절, 아직 등록 미확정임을 확인. foreground에서 복구하고 15초~5분 재시도/등록 확인 | 성공 응답 이전 성공 표시 없음. 반복 등록/중복 활동 없음. 인증 실패와 네트워크 실패 구분 | 모의 경계만 통과 |
| 등록 후 단절/복구 | 등록 후 출발을 포함해 기기 통신 단절, 앱 진입 없이 출발+5분 이내 복구 | APNs 응답과 기기 전달을 구분. 오프라인 정시 종료를 보장하지 않음. 복구 시각/제거 지연과 미종료 여부 기록 | 미실행 |
| 회전 | 토큰 이벤트가 발생하는 시험의 존재 여부/회전 횟수만 관찰 | 최신 토큰 등록 후 이전 토큰 job 덮어쓰기 및 종료 확인. 실제 회전 미발생이면 미검증 유지 | JS/서버 모의만 통과 |
| 변경·OFF·취소·중복 | QA-A 시간 2회 변경, QA-B 명시 선택, OFF/ON, 취소를 각각 독립 시행 | 기존 표면/예약 제거, 최신 활동 하나만 남음. 이전 종료 시각이 새 활동을 끝내지 않음. OFF에서 OS 예약 목록 비어 있음 | 자동 검사만 통과 |

토큰 회전은 재시작만으로 발생했다고 가정하지 않음. 시스템 시계 조작으로 대기를 단축하지 않음. 3시간/8시간이 실제로 지나기 전 통과 처리하지 않음. 미러링 단절은 관찰 공백으로, 앱 재개/Spotlight 진입 시도는 연속 백그라운드 중단 가능성으로 기록함. 잠금 화면은 미러링 홈 화면으로 대체하지 않고 실제 iPhone에서 확인함.

알림은 각 행을 독립 시행함. 예약 목록에 있다는 사실은 수신 증거가 아님. 앱의 `sent`/`scheduled` 이력도 배달 성공으로 계산하지 않음.

| 알림 시험 | 조작 / 통과 기준 | 이번 실기기 결과 |
| --- | --- | --- |
| 수신 | QA-A에 대한 실제 출발 알림을 OS에 예약 후 백그라운드 대기. 예정/실제 수신 시각·배너·잠금 화면을 기록. JS received 콜백 부재만으로 미수신 단정 안 함 | 미실행 |
| 잠금 화면 탭 | 수신된 QA-A 알림을 잠금 화면에서 탭. cold restore 완료 뒤 G2와 QA-A 선택 확인 | 미실행 |
| 배너 탭 | 별도 QA-B 알림 배너를 warm 상태에서 탭. QA-B의 상세/일정 확인, 이전 선택 QA-A 잔존 시 실패 | 미실행 |
| 앱 알림함 탭 | OS 알림과 분리해 알림함의 QA-A 항목 탭. 읽음 처리·QA-A G2 이동 확인 | 미실행 |
| 없는 목적지 | 시험용 QA-B 삭제 후 해당 알림 탭. 다른 목적지를 열지 않고 목록 G1으로 이동 | 미실행 |
| 오프라인 수신 | 미리 예약된 로컬 알림의 단절 중 배달과 탭 후 캐시 목적지 이동 확인. 새 날씨/일정 계산까지 성공했다고 해석하지 않음 | 미실행 |

각 시험 기록 필드: 시험 ID, 후보 빌드/커밋, 시작·예정 시작·출발·네트워크 단절/복구·최초 수신·탭·최초 종료 관찰 시각(KST/UTC), 앱 전경/배경, 관찰 중단 구간, 토큰 존재/회전 횟수, 등록 상태/허용 오류 코드, APNs 상태/reason, 잠금 화면/Island 결과, 이동 표면과 QA 목적지 일치, 실제 경과 시간. 값이 없으면 미수집으로 남김.

## OS 경계와 남은 위험

[Apple 예약 API](https://developer.apple.com/documentation/activitykit/activity/request(attributes:content:pushtype:style:alertconfiguration:start:))는 예약된 활동의 백그라운드 시작을 설명함. [Apple 토큰/푸시 문서](https://developer.apple.com/documentation/activitykit/starting-and-updating-live-activities-with-activitykit-push-notifications)는 비동기 토큰 발급 및 회전 때 앱에 주어지는 백그라운드 실행 시간을 설명함. 무기한 JS 실행을 보장하지 않으며, 이 앱의 Expo 이벤트→계정 복원/App Attest→HTTP 요청이 그 시간 안에 완료되는지는 위 후보에서 검증해야 함.

native `DispatchQueue.asyncAfter` 종료는 프로세스가 실행될 때의 보조 경로임. staleDate는 종료 명령이 아님. 서버 등록 전 suspension, 토큰 없는 로컬 fallback, 네트워크 단절, 권한 OFF, 강제 종료 뒤 처리의 정시 동작을 보장하지 않음. 이미 OS에 등록된 로컬 알림과 새 예보를 가져와 생성해야 하는 알림도 구분함. 서버 재시도 1시간은 APNs 접수 실패에 대한 한도이며 접수 200 뒤 기기 재전송 확인 기능이 아님. 현재 모든 알림 표면·수시간/하룻밤·강제 종료를 해결 완료로 표시할 근거 없음.

## 배포 후보 후속 — 2026-10-30 17:46 KST

사용자가 현재 수정사항 커밋·main 푸시 및 Xcode Cloud/TestFlight 후보 생성을 승인했음. 코드 변경 11개와 본 감사 기록을 대상으로 함. 과거 미추적 개인 실기기 캡처/원시 로그/기타 보관 문서는 작업 폴더에 보존함.

배포 전 departure-push, ios-reliability, route-selected-time, ios-widget-guidance-time(168건), ios-live-activity, shared-rules, TypeScript, platform-versions, widget-native-weather(Swift typecheck 포함), localization(2280 메시지) 재검사 모두 통과함. 앱 소스 버전 1.0.0 (41)은 Cloud 자동 증가 배포 번호와 구분함.

App Store Connect IAB가 `authResult=FAILED` 로그인 화면으로 이동했음. Apple 로그인·2단계 인증 복구를 사용자에게 요청했음. 후보 시작/Archive/Apple 처리/그룹 배포/설치는 아직 미수행임. 시험용 일정도 아직 생성하지 않았으며 즉시 시작·미래 예약·네트워크 단절/복구 실기기 시험은 미시작임. 수시간·하룻밤 실제 관찰은 각각 0시간으로 유지함.
