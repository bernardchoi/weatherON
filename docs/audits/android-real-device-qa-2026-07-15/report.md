# WeatherON Android Real Device QA - 2026-07-15

## 환경

| 항목 | 값 |
|---|---|
| 기기 serial | `000841458003652` |
| 기기 | `A142 / Pacman` |
| 화면 | `1084x2412`, density override `375` |
| 패키지 | `com.weatheron.mobile` |
| 설치 버전 | `0.1.0 (9)` |
| 설치 파일 | `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` |
| APK SHA-256 | `512dd18f4c32de3f83f20c041b32bfcf77d5e7f9d96e924412b903b9bdefc47b` |
| 설치 결과 | `adb install -r -d` 성공 |
| 실행 결과 | `am start -W` 성공, `WARM`, `125ms` |

## 통과

| 항목 | 결과 | 증거 |
|---|---|---|
| ADB 연결 | 통과 | `npm run check:android-adb-ready` |
| TypeScript | 통과 | `npx tsc -p apps/mobile/tsconfig.json --noEmit` |
| 공백 검사 | 통과 | `git diff --check` |
| shared rules | 통과 | `npm run check:shared` |
| 제품 품질 | 통과 | `npm run check:android-product-quality` |
| release APK 빌드 | 통과 | `./gradlew :app:assembleRelease --console=plain` |
| 설치/버전 | 통과 | `versionCode=9`, `versionName=0.1.0` |
| 앱 실행 | 통과 | `com.weatheron.mobile/.MainActivity` foreground, pid `24323` |
| 홈 | 통과 | 현재 날씨, 코디, 목적지, 출발/비/준비 카드 표시 |
| 코디 | 통과 | 코디 탭 렌더링 확인 |
| 출발 목록 | 통과 | 목적지 2곳, 출발 시간, 강수 정보, 알림 상태 표시 |
| 목적지 상세 | 통과 | 저장 완료, 출발시간 역산, 날씨 비교, 케어 ON 표시 |
| 이동수단 선택 | 통과 | 자동/도보/자차/대중교통 시트가 탭바와 겹침 없이 표시 |
| MY | 통과 | 게스트 모드, 준비 상태, 권한/알림/정책 진입점 표시 |
| 권한 관리 | 통과 | 위치 권한과 알림 권한이 분리되어 허용 상태로 표시 |
| 스마트 알림 설정 | 통과 | 권한/예약 상태, 알림 종류, 고급 설정 표시 |
| 앱 내부 알림 패널 | 통과 | 읽지 않은 알림 2개, 최근 완료 3건 표시 |
| OS 알림 기록 | 통과 | `dumpsys notification` 기준 `numPostedByApp=10` |
| 크래시 | 통과 | app pid logcat fatal/exception/anr 패턴 없음, crash buffer 0줄 |

## 확인 필요

| 항목 | 관찰 | 영향 |
|---|---|---|
| release config 문서 불일치 | 해결됨: `npm run check:android-release` 통과 | 릴리즈 문서가 `versionCode=9`와 동기화됨 |
| device QA ready 문서 불일치 | 해결됨: `npm run check:android-device-qa-ready` 통과 | QA 패킷 문서가 `0.1.0 (9)`와 동기화됨 |
| release consistency 상태 불일치 | 해결됨: `npm run check:android-release-consistency` 통과 | 릴리즈 증거 문서 일괄 재생성 완료 |
| UI XML dump | `uiautomator dump`가 `ERROR: could not get idle state.`로 실패 | 이번 회차는 스크린샷/로그 중심으로 증거 확보 |
| OS 알림창 첫 화면 | 첫 화면에는 WeatherON 알림이 직접 노출되지 않음 | 게시 기록은 `dumpsys notification`으로 확인됨 |

## 증거 파일

- Screenshots: `docs/audits/android-real-device-qa-2026-07-15/screens/`
- Logs: `docs/audits/android-real-device-qa-2026-07-15/logs/`
- Failed UI dump: `docs/audits/android-real-device-qa-2026-07-15/ui/01-launch.xml`
- App logcat: `docs/audits/android-real-device-qa-2026-07-15/logs/logcat-pid-24323.txt`
- Crash buffer: `docs/audits/android-real-device-qa-2026-07-15/logs/logcat-crash.txt`
- Notification dump: `docs/audits/android-real-device-qa-2026-07-15/logs/dumpsys-notification.txt`

## 결론

실기기 기준 앱 설치, 실행, 핵심 탭, 목적지 상세, 이동수단 선택, 권한, 알림 설정, 앱 내부 알림 패널은 통과. 크래시 증거 없음. Android release/QA 문서 동기화 후 `npm run check:android-local-release-ready`까지 통과함.
