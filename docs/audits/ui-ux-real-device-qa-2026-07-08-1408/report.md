# WeatherON 실기기 QA 리포트

- 일시: 2026-07-08 14:08-14:29 KST
- 기기: A142, 1084x2412
- 앱: `com.weatheron.mobile`
- 기준 커밋: `6457969e1`
- APK: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`

## 요약

- 릴리즈 APK 최초 실행 시 즉시 종료됨.
- 원인: `react@19.2.7`과 `react-native-renderer@19.0.0` 버전 불일치.
- 조치: `react`, `react-dom`, `apps/mobile`의 `react`를 `19.0.0`으로 고정하고 lockfile 재생성.
- 재빌드: `./gradlew :app:assembleRelease --rerun-tasks` 성공.
- 재설치 후 앱 정상 실행 확인.

## 검증 결과

| 항목 | 결과 | 증적 |
| --- | --- | --- |
| 릴리즈 APK 설치 | 통과 | `adb install -r` 성공 |
| 앱 실행 | 통과 | PID `6863`, focus `com.weatheron.mobile/.MainActivity` |
| 홈 화면 | 통과 | `screens/01-home.png`, `ui/01-home.xml` |
| 홈 상단 날씨 아이콘 | 통과 | Pad 내부에서 잘림 없이 확대 상태 확인 |
| 출발 탭 | 통과 | `screens/02-departure.png`, `ui/02-departure.xml` |
| MY 탭 | 통과 | `screens/03-my.png`, `ui/03-my.xml` |
| 알림 패널 | 통과 | `screens/04-notifications.png`, `ui/04-notifications.xml` |
| 알림 설정 이동 | 통과 | `screens/05-notification-settings.png`, `ui/05-notification-settings.xml` |
| 알림 권한 요청 | 통과 | `screens/07-os-notification-permission.png` |
| 알림 권한 허용 반영 | 통과 | `screens/08-notification-permission-granted.png`, package dump `POST_NOTIFICATIONS: granted=true` |
| 확인 알림 생성 | 부분 통과 | `dumpsys-notification.txt`에 `com.weatheron.mobile`, `강수 알림` 레코드 존재. 셰이드 첫 화면 캡처에는 다른 알림에 밀려 미노출 |
| 런타임 크래시 | 통과 | `logs/crash.log` 0 bytes |

## 검증 명령

- `npm ls react react-dom react-native --workspaces --depth=0`
- `npx tsc --noEmit -p apps/mobile/tsconfig.json`
- `./gradlew :app:assembleRelease --rerun-tasks`
- `adb -s 000841458003652 install -r apps/mobile/android/app/build/outputs/apk/release/app-release.apk`
- `adb -s 000841458003652 shell am start -n com.weatheron.mobile/.MainActivity`
- `adb -s 000841458003652 shell dumpsys package com.weatheron.mobile`
- `adb -s 000841458003652 shell dumpsys notification --noredact`

## 남은 확인

- 확인 알림은 시스템 레코드로 생성 확인됨. 다만 알림 셰이드 첫 화면에 바로 보이는지까지는 다른 기기 알림이 많아 별도 정리 상태에서 재확인 필요.
- 위치 권한은 이번 경로에서 요청하지 않았고 `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`은 미허용 상태임.
