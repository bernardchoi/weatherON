# 실제 시뮬레이터 권한 검증 — 2026-10-31

전용 WeatherON-P2-Isolated(iPhone 18 Pro, iOS 27.0)에서 격리 앱 설치·실행 후 아래 검사 완료함. 실제 iPhone 및 실서비스 계정은 건드리지 않았음. 이 결과는 시뮬레이터 증거이며 TestFlight/배포 후보 검증과 다름.

## 격리 조건

- 번들 ID com.weatheron.mobile이지만 전용 시뮬레이터에만 설치함. 실제 기기의 동일 앱은 변경하지 않았음.
- 인증·날씨 API 주소는 http://127.0.0.1:1, dotenv 비활성화, fixture 설정 사용. 화면 날씨값은 실서비스 날씨 정확도 증거가 아님.
- 위치는 simctl로 서울시청 부근 고정 테스트 좌표를 주입함. 사용자 실제 위치를 쓰지 않았음.
- 두 번째 프로필은 이 시뮬레이터의 테스트 앱만 제거·재설치해서 준비함. 앱 첫 화면과 위치/알림 OS 팝업이 다시 나타난 것으로 새 상태 확인함.
- 최종 네이티브 SQLite 조회 항목은 accountLinked/locationReady/permissionReady/onboardingCompleted/weatherLocationMode로 한정함. 토큰·계정 정보는 조회하지 않았음.

## 실제 검사 결과

| 시나리오 | 관찰 결과 |
| --- | --- |
| 위치 거절 | 온보딩 O7에서 실제 OS ‘허용 안 함’ 선택. 보류·다음 버튼 유지 |
| 위치 거절 후 재시작 | O7 및 다음 버튼 유지, 자동 재요청 없음. runtime snapshot seq 11~12 |
| 알림 거절 | 온보딩 O5에서 실제 OS ‘허용 안 함’ 선택. 보류·다음 버튼 유지 |
| 알림 거절 후 재시작 | O5 및 다음 버튼 유지, 자동 재요청 없음. runtime snapshot seq 16~17 |
| OS 거절 → 허용 | 설정 > 앱 > WeatherON에서 위치 ‘앱을 사용하는 동안’, 알림 허용 켬. 앱 복귀 시 알림 허용 표시 확인. 직접 고른 수동 위치 유지 |
| OS 허용 → 철회 | 알림 허용 끔, 위치 ‘안 함’ 선택 후 앱 복귀. 위치 변경으로 앱이 다시 시작되어도 홈 진입·수동 위치 유지. 알림 철회 자체는 OS 스위치 값 0으로 확인했으며 이 단계의 앱 알림 문구는 별도로 캡처하지 않았음 |
| 위치 나중에 | 새 프로필 O7에서 요청 없이 O5 진입, OS 팝업 없음 |
| 알림 나중에 | 새 프로필 O5에서 요청 없이 O6 진입, OS 팝업 없음 |
| 나중에 후 재시작 | O6 그대로 복구, 첫 안내/권한 요청 반복 없음. later-restart.txt |
| 나중에 후 게스트 홈 | 목적지 나중에 선택 → 홈 → MY에서 게스트 모드 확인. 계정 gate 강제 진입 없음 |
| 필요 시 위치 허용 | MY > 앱 권한 관리 > 기존 위치 gate에서 실제 OS ‘앱을 사용하는 동안 허용’. 원래 M4로 돌아와 허용됨·현재 위치 기준 확인 |
| 필요 시 알림 허용 | 기존 알림 gate에서 실제 OS ‘허용’. M4에서 위치·알림 모두 허용됨 확인. allowed-both.txt |
| 수동→현재 위치 수정 검증 | 아래 결함 수정 빌드에서 위치 철회·복귀·재허용으로 동일 조건 재구성. ‘현재 위치 사용’이 실제 조회를 시작하고 허용됨·현재 위치 기준으로 전환. fixed-current-location.txt |
| 최종 재시작 | 홈에 서울시청 테스트 위치·‘내 위치로 보는 중’ 표시. SQLite도 accountLinked=0, locationReady=1, permissionReady=1, onboardingCompleted=1, weatherLocationMode=auto 확인. restart-state.json 및 restart-home.txt/jpg |

## 재현된 문제와 최소 수정

권한이 허용됐지만 날씨 위치 모드는 manual인 상태에서 M4의 ‘현재 위치 사용’을 누르면 기존 ready gate가 바로 종료되어 실제 위치 요청은 하지 않았음. ‘현재 위치를 사용 중’ 안내만 표시되고 ‘수동 사용 중’이 그대로 남았음. granted-return-manual-bug.txt에 실제 화면 트리 보존함.

AppPermissionsScreen.tsx에서 권한 gate를 여는 조건에 `!locationReady`만 추가함. 이미 허용된 경우에는 기존 onRequestCurrentLocation을 호출해 실제 위치를 반영함. 권한 미허용 경로, 수동 위치 보존, 계정 정책과 문구 함수는 변경하지 않았음.

수정 빌드는 로컬 Release/arm64 시뮬레이터 빌드 성공 후 재설치했음. 실제 재현 조건에서 확인 중 → 허용됨·현재 위치 기준 표시 전환과 재시작 후 auto 보존까지 확인함. 시뮬레이터에는 실제 GPS가 없으므로 대기 중 위치 조회에는 테스트 좌표 업데이트를 전달했음.

## 자동 검사

- node scripts/check-permission-account-interactions.cjs: 통과. 기존 9개 권한 조합 중 이미 허용된 수동 모드가 실제 위치 요청을 호출하도록 기대값 갱신함.
- node --no-warnings scripts/check-onboarding-recovery.mjs: 통과.
- npx tsc --noEmit -p apps/mobile/tsconfig.json: 통과.
- git diff --check: 통과.

## 범위 밖

실서비스 인증·계정 연결/해제/탈퇴, 실제 원격 푸시 도착, 장시간 백그라운드, 실제 iPhone·Android·Xcode Cloud/TestFlight 검증은 수행하지 않았음. 앞선 보고서의 과거 시뮬레이터 설치 실패 상태는 이번 실제 설치·검사 결과로 갱신됨. 별도 후보였던 ‘과거 거절 gate 문구 우선 표시’는 이번에 해당 상태 조합을 실제 OS에서 재현하지 않아 수정하지 않았음.

조작 도구는 XcodeBuildMCP와 Device Hub를 사용함. 초기 일반 tap/swipe 입력이 반영되지 않는 경우 실제 touch/gesture 또는 Device Hub UI를 사용해 결과 화면까지 확인했음.
