# WeatherON Android 실기기 UI/UX QA

일시: 2026-07-05
기기: `000841458003652`
앱: `com.weatheron.mobile`, versionCode `6`, versionName `0.1.0`
빌드: `./gradlew assembleRelease --console=plain`
설치: `adb install -r -d apps/mobile/android/app/build/outputs/apk/release/app-release.apk`

## 결론

비공개 테스트 진입 전 핵심 플로우는 동작함.
크래시 로그는 없음.
다만 아래 UI/UX 이슈는 비공개 테스트 전 정리 권장.

## 확인 범위

- 최초 진입: 소개 시작, 홈 이동
- 온보딩: 소개, 스마트 케어, 목적지 선택
- 목적지 추가: 검색 입력, 빈 결과, 키보드 상태
- 홈: 현재 날씨, 목적지 빈 상태, 하단 탭
- 알림: 알림 사이드바, 알림 센터
- MY: 관리 메뉴, 스타일 태그 설정
- 스타일 설정: 선택 UI, 저장 CTA, 다음 단계
- 로그: crash buffer, 앱 PID logcat

## 핵심 이슈

1. 스타일 설정 첫 화면 하단 미리보기 일부가 하단 내비게이션 영역과 겹치거나 잘림
   - 근거: `screens/12-style-profile.png`, `ui/12-style-profile.xml`
   - 영향: 사용자가 저장/다음 흐름을 보기 전 화면이 덜 완성돼 보임
   - 권장: 하단 padding/safe area 보정, 미리보기 카드 높이 조정

2. 알림 센터에 `조건 설정` 진입점이 직접 노출됨
   - 근거: `screens/10-notification-center.png`, `ui/10-notification-center.xml`
   - 영향: "기준만 고르면 자동 조정" UX와 충돌 가능
   - 권장: 알림 카드별 조건 버튼은 고급 설정으로 이동하거나 숨김

3. MY 화면에 설정 진입점이 다소 많음
   - 근거: `screens/11-my.png`, `ui/11-my.xml`
   - 예: 오늘 준비 `설정`, 앱 권한 관리, 스마트 알림 설정
   - 영향: MVP 사용자가 어디서 무엇을 바꿔야 하는지 혼란 가능
   - 권장: 권한/스마트 알림/오늘 준비 설정의 역할 분리 또는 중복 축소

4. 온보딩 CTA가 하단 시스템 내비게이션 바로 위까지 붙음
   - 근거: `screens/03-smartcare.png`, `screens/14-after-style-next.png`
   - 영향: 터치는 가능하지만 작은 화면/제스처 환경에서 답답해 보임
   - 권장: 하단 CTA 영역 여백 확대

5. ADB 자동 입력으로 장소 검색 결과 품질 검증 불가
   - 근거: `screens/06-place-search-seoul.png`, `ui/06-place-search-seoul.xml`
   - 현상: `Seoul` 입력이 한국어 IME 조합 문자열로 들어감
   - 판단: 앱 버그로 확정하지 않음. 수동 입력 실기기 재검증 필요

## 정상 확인

- release APK 빌드 성공
- APK 설치 성공
- cold launch 성공, `TotalTime: 248ms`
- 소개 시작, 온보딩 단계 이동, 하단 탭 이동 정상
- 홈 알림 버튼 접근성 라벨 정상: `알림 열기, 읽지 않음 0개`
- 알림 권한 전 예시, 전체 읽음 비활성 상태 정상
- 스타일 설정 스크롤 후 저장 CTA 노출 정상
- 스타일 다음 단계는 직접 조건 편집이 아니라 간단 기준 선택 화면으로 이동
- `logcat-crash.txt` 0 byte
- PID logcat에서 `FATAL`, `AndroidRuntime`, `ReactNativeJS`, `TypeError`, `ReferenceError` 패턴 없음

## 증거 파일

- 스크린샷: `docs/audits/android-real-device-uiux-2026-07-05/screens/`
- UI 덤프: `docs/audits/android-real-device-uiux-2026-07-05/ui/`
- 로그: `docs/audits/android-real-device-uiux-2026-07-05/logcat-crash.txt`
- 로그: `docs/audits/android-real-device-uiux-2026-07-05/logcat-pid-22712.txt`

## 수정 후 재확인

일시: 2026-07-05

- 온보딩 2페이지 정보량 축소 확인
- `알림을 간단히 켤까요?` 화면에서 CTA가 첫 화면 안에 노출됨
- MY 화면에서 `스타일 태그 설정` 메뉴 미노출 확인
- 알림 센터의 카드별 `조건` 반복 버튼 제거, 상단 `조건 설정` 단일 진입 유지
- release APK 빌드 성공
- 실기기 설치 및 cold launch 성공, `TotalTime: 211ms`
- crash buffer 0 byte
- 오류 패턴 `FATAL`, `AndroidRuntime`, `TypeError`, `ReferenceError`, `Unhandled`, `SyntaxError`, `Invariant Violation` 없음
- 추가 증거: `screens/15-fix-smartcare.png`, `screens/16-fix-my.png`

## 비공개 테스트 전 최종 점검

일시: 2026-07-05
범위: WeatherON Android MVP1, 비공개 테스트 후보 빌드의 온보딩/홈/알림/MY 실기기 UX 확인

### 결론

- 비공개 테스트 전 실기기 핵심 UI/UX 점검 통과
- 온보딩 2페이지 정보 과밀 해소 확인
- MVP1 범위 밖인 코디/스타일 설정 노출 없음 확인
- release readiness 로컬 게이트 통과
- 실기기 cold launch 성공, `TotalTime: 234ms`
- crash buffer 0 byte
- 오류 패턴 `FATAL`, `AndroidRuntime`, `TypeError`, `ReferenceError`, `Unhandled`, `SyntaxError`, `Invariant Violation` 없음

### 확인 화면

- 진입: `screens/17-final-entry.png`, `ui/17-final-entry.xml`
- 온보딩 2페이지: `screens/18-final-smartcare.png`, `ui/18-final-smartcare.xml`
- 홈: `screens/19-final-home.png`, `ui/19-final-home.xml`
- 알림 패널: `screens/20-final-notification-panel.png`, `ui/20-final-notification-panel.xml`
- 알림 센터: `screens/21-final-notification-center.png`, `ui/21-final-notification-center.xml`
- MY: `screens/22-final-my.png`, `ui/22-final-my.xml`
- 로그: `logcat-final-crash.txt`, `logcat-final-pid-25500.txt`

### 근거

- `npm exec --workspace @weatheron/mobile tsc -- --noEmit` 통과
- `npm run check:android-product-quality` 통과
- `git diff --check` 통과
- `npm run check:android-local-release-ready` 통과
- `./gradlew assembleRelease --console=plain` 통과
- `adb install -r -d apps/mobile/android/app/build/outputs/apk/release/app-release.apk` 성공
- 공개 사용자 소스는 앱 비공개 테스트 전 상태라 현재 신뢰 가능한 외부 불만/리뷰 신호 없음
