# WeatherON Android Real Device QA - 2026-07-20

## 1. Target

| 항목 | 값 |
|---|---|
| APK | `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` |
| Build 방식 | local Gradle release APK with `WEATHERON_BUILD_VARIANT=qa EAS_BUILD_PROFILE=qa` |
| Version | `1.0.0 (10)` |
| SHA-256 | `c4cd28b1c92565710b3d53233019896fdc0c9ac463a88be839f33792bbe82450` |
| Size | `100M` |
| Device | A142 / adb `000841458003652` |
| Android | 16 |
| Screen | 1084x2412 / override density 375 |
| Tested at | 2026-07-20 18:55-20:06 KST |

## 2. Commands

```bash
npm run check:platform-versions
npm run check:android-release
npx tsc -p apps/mobile/tsconfig.json --noEmit
git diff --check
WEATHERON_BUILD_VARIANT=qa EAS_BUILD_PROFILE=qa ./gradlew :app:assembleRelease --console=plain
adb -s 000841458003652 install -r -d apps/mobile/android/app/build/outputs/apk/release/app-release.apk
adb -s 000841458003652 shell am start -W -n com.weatheron.mobile/.MainActivity
adb -s 000841458003652 shell dumpsys package com.weatheron.mobile
adb -s 000841458003652 shell dumpsys notification --noredact
adb -s 000841458003652 logcat -b crash -d
```

## 3. Result

| ID | 항목 | 결과 | 증거 |
|---|---|---|---|
| D1 | APK 설치 | 통과 | `adb install -r -d` Success |
| D2 | 첫 실행 | 통과 | COLD launch `TotalTime=205ms`, MainActivity foreground |
| D3 | 내부 문구 노출 | 통과 | 주요 화면 캡처에서 route/dev label 미노출 |
| D4 | 홈 진입 | 통과 | 홈 카드, 현재 날씨, 목적지 기준 카드, 하단탭 렌더링 |
| D4-1 | 하단 탭 IA | 통과 | 홈/코디/출발/MY 탭 이동 확인 |
| D4-2 | 핵심 클릭 흐름 | 통과 | follow-up에서 코디 목록 -> 상세 -> 저장 -> 목록 복귀 확인 |
| D5 | 상태 저장 | 통과 | 재설치 후 기존 목적지/권한/MY 버전 상태 유지 |
| D6 | Android 뒤로가기 | 보류 | 오늘 회차에서 별도 back flow 미수행 |
| D7 | 위치 권한 허용 | 통과 | `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` granted |
| D8 | 위치 권한 거부 | 통과 | follow-up에서 location revoke 후 `기본 위치 서울`/`수동` 홈 유지, crash 0 lines. 테스트 후 권한 복구 |
| D9 | 목적지 검색 | 통과 | follow-up에서 `Jamsil` 검색, `잠실야구장` 선택/저장/상세 확인. 테스트 목적지 삭제 완료 |
| D10 | 화면 밀도 | 통과 | 1084x2412 실기기 화면에서 주요 카드/탭 가림 없음 |
| D11 | 다크/라이트 | 통과 | follow-up에서 `cmd uimode night yes` 홈 확인, crash 0 lines. 테스트 후 `night no` 복구 |
| D12 | 네트워크 끊김 | 통과 | follow-up에서 Wi-Fi/data off, active default network none, 홈 빈 화면 없음. 테스트 후 network 복구 |
| D13 | 알림 신뢰성 | 통과 | QA 패널 노출, 테스트 알림 5초 수신, shade 노출, 알림 탭 후 M2 복귀 및 `탭 확인됨` 반영 |

## 4. Evidence

| 파일 | 내용 |
|---|---|
| `screens/01-launch.png` | 홈 첫 화면 |
| `screens/02-cody-tab.png` | 코디 탭 |
| `screens/03-departure-tab.png` | 출발 탭 |
| `screens/04-my-tab.png` | MY 탭과 `WeatherON v1.0.0` |
| `screens/05-alert-settings-top.png` | 스마트 알림 설정 상단 |
| `screens/07-alert-settings-qa-panel.png` | `개발용 알림 QA` 패널 |
| `screens/09-weatheron-notification-shade-cropped.png` | OS notification shade 내 WeatherON 알림 |
| `screens/10-after-notification-open.png` | 알림 탭 후 M2 복귀, `탭 확인됨` |
| `logs/dumpsys-package.txt` | versionCode/versionName/권한 상태 |
| `logs/dumpsys-notification-weatheron.txt` | `weatheron:test:M2:*` NotificationRecord |
| `logs/logcat-crash.txt` | crash buffer 0 lines |
| `logs/logcat-weatheron.txt` | 알림 탭 후 WeatherON 관련 로그 |
| `follow-up/report.md` | 코디 상세, 목적지 검색, 권한 거부, 다크모드, 네트워크 차단 follow-up 결과 |

## 5. Notes

- `uiautomator dump`는 `ERROR: could not get idle state.`로 실패. 이번 회차는 screenshot, `dumpsys activity`, `dumpsys package`, `dumpsys notification`, logcat 중심으로 증거 확보.
- Gradle 첫 실행은 sandbox의 `~/.gradle` lock 접근 제한으로 실패했고, 승인 후 동일 빌드를 재실행해 성공.
- Gradle warning은 `NODE_ENV` 미지정, SDK XML version, Gradle 9 deprecated feature 경고만 확인. 빌드 실패나 앱 크래시는 없음.
- follow-up에서 테스트 목적지, 권한, 라이트 모드, 네트워크 상태를 모두 원상복구.
