# WeatherON QA 빌드 실기기 UI/UX 테스트 리포트

## 범위

- 일시: 2026-07-07 18:50-18:56 KST
- 기기: Android 실기기 `A142` (`000841458003652`)
- 앱: `com.weatheron.mobile`
- 빌드: release APK, `versionName=0.1.0`, `versionCode=7`
- 커밋: `3e9a9022a`
- APK: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` (`86M`)

## 빌드와 설치

- `tsc -p apps/mobile/tsconfig.json --noEmit`: 통과
- `npm run check:shared`: 통과
- `npm run check:android-release`: 통과
- `./gradlew :app:assembleRelease --console=plain`: 통과
- `adb install -r`: 성공
- 앱 로그: 크래시 버퍼 0줄, 앱 PID 로그에서 fatal/ANR/crash 없음

## 테스트 흐름

| 단계 | 화면 | 결과 |
| --- | --- | --- |
| 1 | 홈 | 정상 표시. 날씨 카드, 목적지 카드, 하단 요약 카드, 하단 탭 확인됨. |
| 2 | 출발 목록 | 정상 표시. 내수동교회와 신사이바시역 목적지 상태가 구분됨. |
| 3 | 신사이바시역 상세 | 비현실 도보 시간 대신 `경로 확인 전`, `출발 계산 보류`, `해외 경로 확인 필요`로 표시됨. |
| 4 | 도착 시간 편집기 | 5분 단위 시간 선택 UI 정상 표시. 탭바와 직접 충돌 없음. |
| 5 | 이동수단 드롭다운 | 옵션 4개 모두 보임. 도보는 `장거리 목적지는 도보 제외`로 비활성화됨. |
| 6 | MY | 계정, 준비 상태, 권한, 알림, 표시 설정, 정책 영역 정상 표시. |
| 7 | 앱 권한 관리 | 위치/알림 권한 상태와 관리 버튼 정상 표시. |

## 확인된 개선 필요점

### P1. 해외 목적지에서 이동수단 `자동` 설명이 여전히 애매함

- 증거: `screens/03-shinsaibashi-detail.png`, `screens/05-transport-dropdown.png`
- 현재 상태: 해외 경로라서 출발 계산을 보류하면서도 이동수단은 `자동`, 보조 문구는 `기본 경로 · 선택 시 재계산`으로 표시됨.
- 문제: 사용자는 `자동`이 어떤 수단인지 알기 어렵고, 실제로 재계산 가능한 것처럼 이해할 수 있음.
- 제안: 해외 경로 보류 상태에서는 이동수단 값을 `경로 확인 필요` 또는 `Google 지도 확인`으로 바꾸고, 자차/대중교통 선택 문구도 `선택 후에도 외부 경로 확인 필요`처럼 제한을 명확히 표시.

### P2. 이동수단 보조 문구가 말줄임 처리됨

- 증거: `screens/03-shinsaibashi-detail.png`, `screens/04-arrival-editor.png`
- 현재 상태: 우측 보조 문구가 `기본 경로 · 선택 시 재...`로 잘림.
- 문제: 경로 계산 보류 화면에서 가장 중요한 조건 문구가 축약되어 의미 전달이 약함.
- 제안: 보조 문구를 우측 짧은 텍스트 대신 아래 한 줄 설명으로 내리거나, `경로 확인 필요`처럼 짧게 재작성.

### P2. 홈 화면 정보 밀도가 높아 핵심 행동이 늦게 읽힘

- 증거: `screens/01-home.png`
- 현재 상태: 현재 날씨, 체감온도, 비 예측, 목적지, 하단 행동 카드가 한 화면에 많이 배치됨.
- 문제: MVP 핵심인 “언제 나가고 무엇을 챙길지”가 날씨 카드와 경쟁함.
- 제안: 홈 상단에 `오늘 나갈 준비` 요약을 더 전면화하고, 체감온도/주간 비 예측은 접힘 또는 보조 영역으로 낮추기.

### P3. 선택 목적지 강조 색이 경고처럼 보일 수 있음

- 증거: `screens/02-departure-list.png`
- 현재 상태: 선택된 내수동교회 카드가 붉은 테두리와 강조색으로 표시됨.
- 문제: 강수/주의 색과 겹쳐 선택 상태인지 경고 상태인지 즉시 구분이 약함.
- 제안: 선택 상태는 브랜드 그린/네이비 계열로, 강수 위험은 오렌지/레드 계열로 역할 분리.

### P3. 접근성 검증은 기본 구조까지만 확인됨

- 증거: `ui/*.xml`
- 현재 상태: 주요 버튼의 `content-desc`는 다수 확인됨. 탭, 시간 변경, 이동수단 선택, 권한 버튼이 접근성 트리에 노출됨.
- 한계: TalkBack 실제 음성 순서, 폰트 확대, 고대비 모드까지는 이번 QA에서 검증하지 않음.
- 제안: 다음 QA에서 TalkBack 1회, 시스템 글꼴 크게 1회, 알림 권한 off 상태 1회를 별도 체크.

## 재현 안 된 기존 우려

- 도착 시간 편집기를 연 채 이동수단 드롭다운을 열어도 옵션이 탭바에 가려지지 않음.
- 일본 목적지에서 도보 11077분 또는 전날 출발 시간이 노출되지 않음.
- 해외 목적지는 `839.8km`, `해외 경로 확인 필요`, `출발시간 계산 보류`로 표시됨.

## 증거 파일

- `screens/01-home.png`
- `screens/02-departure-list.png`
- `screens/03-shinsaibashi-detail.png`
- `screens/04-arrival-editor.png`
- `screens/05-transport-dropdown.png`
- `screens/06-my.png`
- `screens/07-permission-detail.png`
- `ui/01-home.xml` - `ui/07-permission-detail.xml`
- `logs/pid-10635.log`
- `logs/crash.log`
