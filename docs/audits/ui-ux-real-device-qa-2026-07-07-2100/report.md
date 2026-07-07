# WeatherON 실기기 UI/UX QA 리포트

## 범위

- 일시: 2026-07-07 21:00-21:08 KST
- 기기: Android 실기기 `A142` (`000841458003652`)
- 앱: `com.weatheron.mobile`
- 커밋: `f5fcf56ed`
- 설치 빌드: release APK, `versionName=0.1.0`, `versionCode=7`
- APK: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` (`86M`)

## 빌드와 설치

- `tsc -p apps/mobile/tsconfig.json --noEmit`: 통과
- `npm run check:shared`: 통과
- `./gradlew :app:assembleRelease --console=plain`: 통과
- `adb install -r`: 성공
- 콜드 스타트: 성공, `TotalTime=315ms`
- 앱 로그: crash 버퍼 0줄, 앱 PID 로그 7줄, fatal/exception/ANR/crash 패턴 없음

## 테스트 흐름

| 단계 | 화면 | 상태 |
| --- | --- | --- |
| 1 | 홈 | 정상. 현재 위치 날씨, 목적지 선택, 하단 행동 카드 표시됨. |
| 2 | 출발 목록 | 정상. 선택 목적지가 초록 테두리와 체크로 구분됨. |
| 3 | 신사이바시역 상세 | 정상. 해외 경로는 `경로 확인 전`, `출발 계산 보류`, `해외 경로 확인 필요`로 표시됨. |
| 4 | 도착 시간 편집기 | 정상. 5분 단위 선택 UI 표시, 하단 탭바와 충돌 없음. |
| 5 | 이동수단 드롭다운 | 정상. 옵션이 탭바에 가리지 않음. 도보 비활성, 외부 경로 확인 문구 표시됨. |
| 6 | MY | 정상. 계정, 준비 상태, 권한, 알림, 표시 설정, 정책 진입점 확인됨. |
| 7 | 앱 권한 관리 | 정상. 위치/알림 허용 상태와 관리 버튼 표시됨. |
| 8 | 스마트 알림 설정 | 정상. 권한/예약/수신 상태와 알림 종류 표시됨. |

## 확인된 개선 필요점

### P2. 홈 목적지 칩 이름 말줄임

- 증거: `screens/01-home.png`
- 현재 상태: 선택 칩에서 `신사이바시...`로 줄임 처리됨.
- 영향: 선택 목적지를 빠르게 확인하기 어려움.
- 제안: 선택된 목적지 칩은 2줄 허용하거나, 현재 선택 목적지 이름을 카드 헤더에 별도 노출.

### P2. 홈 핵심 행동 카드가 화면 하단에 밀림

- 증거: `screens/01-home.png`
- 현재 상태: `나갈 시간`, `비 완화`, `챙길 것` 카드가 하단에 있고, 날씨 카드가 화면 대부분을 차지함.
- 영향: MVP 핵심 행동 확인까지 시선 이동이 길어짐.
- 제안: 홈 상단에 `오늘 준비` 요약을 더 압축 노출하고, 날씨 상세는 탭/상세로 분리.

### P3. 스마트 알림 설정 일부 라벨 줄바꿈

- 증거: `screens/08-smart-alert-settings.png`
- 현재 상태: `실제 수신` 라벨이 `실제 수` / `신`처럼 분리됨.
- 영향: 설정 상태 표의 읽기 흐름이 끊김.
- 제안: 좌측 라벨 컬럼 폭을 늘리거나 `수신`처럼 짧은 라벨로 변경.

### P3. 접근성은 구조 확인까지만 완료

- 증거: `ui/*.xml`
- 현재 상태: 주요 탭, 버튼, 설정 항목은 UI 트리에 노출됨.
- 한계: TalkBack 실제 읽기 순서, 폰트 확대, 고대비 모드는 이번 QA 범위에 포함하지 않음.
- 제안: 다음 실기기 QA에서 TalkBack 1회, 시스템 글꼴 크게 1회 별도 검증.

## 재현 안 된 문제

- 도착 시간 편집기와 이동수단 드롭다운이 하단 탭바에 걸리는 문제 재현 안 됨.
- 일본 목적지에서 도보 11077분, 전날 출발 시간 노출 재현 안 됨.
- 해외 목적지에서 근거 없는 150분 자동 경로 시간 노출 없음.

## 개선 확인된 항목

- 출발 목록 선택 상태가 경고색이 아닌 초록 테두리/체크로 구분됨.
- 신사이바시 상세의 이동수단이 `자동 · 확인 필요`로 표시되어 이전보다 명확함.
- 드롭다운 내 자차/대중교통 옵션에 `선택해도 Google 지도 등 외부 경로 확인 필요`가 표시됨.

## 증거 파일

- `screens/01-home.png`
- `screens/02-departure-list.png`
- `screens/03-shinsaibashi-detail.png`
- `screens/04-arrival-editor.png`
- `screens/05-transport-dropdown.png`
- `screens/06-my.png`
- `screens/07-permission-detail.png`
- `screens/08-smart-alert-settings.png`
- `ui/01-home.xml` - `ui/08-smart-alert-settings.xml`
- `logs/pid-18646.log`
- `logs/crash.log`
