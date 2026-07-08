# WeatherON Android Manual Action Packet

> 생성일: 2026-07-08
> 목적: 자동 빌드/검증 이후 사람이 직접 처리해야 하는 Android 출시 액션을 한 장으로 유지한다.

## 1. 현재 출시 상태

| 항목 | 값 |
|---|---|
| preview APK build | `N/A - local Gradle release APK` |
| APK artifact | apps/mobile/android/app/build/outputs/apk/release/app-release.apk |
| production AAB build | `8d392e45-5aae-42a3-a196-59cb00153b28` |
| production AAB 상태 | FINISHED |
| AAB artifact | https://expo.dev/artifacts/eas/5n1D01__lz03aiLZ6KqtJcTEPTwDEQnJgWCtiyrGNa8.aab |
| Play 제출 blocker | 9 |
| 실기기 QA 미검증 | 0 |
| 스토어 스크린샷 issue | 0 |
| Play 입력값 누락 | 9 |
| 폐쇄 테스트 대기 항목 | 13 |

## 2. 작업 순서

| 우선 | 작업 | 완료 기준 | 상태 |
|---|---|---|---|
| 1 | 최신 MVP preview APK | `npm run build:android:preview:no-wait`는 EAS 외부 업로드가 포함되므로 사용자 승인 후 실행 | 최신 소스 반영됨 |
| 2 | 실기기 QA | N/A - local Gradle release APK 빌드 완료 후 APK 재설치 | 빌드 LOCAL BUILD SUCCESS |
| 3 | 스토어 스크린샷 | `assets/store/android-screenshots/`에 5장 저장 | 완료 |
| 4 | Play 제출 입력값 | `WeatherON_ANDROID_STORE_INPUTS.local.json` 작성 후 `npm run apply:android-store-inputs` 실행 | 9개 issue · 누락 9 |
| 5 | 폐쇄 테스트 준비 | `WeatherON_ANDROID_CLOSED_TEST_INPUTS.local.json` 작성 후 `npm run apply:android-closed-test-inputs` 실행. 14일 운영 안에 코디 포함 build 검증 | 13개 대기 · 입력 13개 issue |
| 6 | Production AAB | `npm run check:eas-production-build-status -- <build-id>` 기준 FINISHED 확인 | 완료 |
| 7 | 스토어 blocker | `npm run check:android-store-submit-ready` 기준 해소 | 9개 잔존 |

## 3. 실기기 QA 기입표

| ID | 항목 | 기대 결과 | 결과 | 메모 |
|---|---|---|---|---|
| D1 | APK 설치 | 설치 성공, 경고 후 계속 설치 가능 | 통과 | 기존 서명 불일치 앱 삭제 후 ADB install 완료, 패키지 com.weatheron.mobile 설치 확인 |
| D2 | 첫 실행 | 크래시 없이 온보딩 진입 | 통과 | pm clear 후 MainActivity 실행, O1 온보딩 진입, crash log buffer 비어 있음 |
| D3 | 내부 문구 노출 | `H1`, `Guest`, `READY`, `OUTER` 같은 개발 문구 미노출 | 보류 | H1/Guest/READY/OUTER 등 내부 route/dev label은 미노출. Android 권한 팝업 앱명 WeatherON Dev 노출은 출시 label 확정 필요 |
| D4 | 홈 진입 | 홈 카드, 코디, 우산, 알림, 하단탭 표시 | 통과 | 위치 없이 계속 후 홈 진입, 홈 카드/목적지 필요/날씨 연결됨/하단탭 표시 정상 |
| D4-1 | 하단 탭 IA | 출시 후보 기준 `홈/코디/출발/MY` 표시, `소셜/우산/강수` 직접 탭 없음 | 통과 | `0.1.0 (7)` 실기기에서 홈/코디/출발/MY 4탭 표시와 C1~C4 코디 활성 탭 매핑 확인 |
| D4-2 | 핵심 클릭 흐름 | `npm run check:android-core-flow` 기준 홈 CTA, 코디 탭 추천/상세/저장/옷장 진입, 하단 탭 가림 없음 | 통과 | 2026-07-08 C4 저장 완료 CTA 하단 여백 보정 후 web core-flow와 실기기 재확인 통과. 실기기 bounds 기준 저장 완료 버튼 bottom 1745, 탭바 top 2164 |
| D4-3 | 홈 목적지 카드 | 상단 현재 위치 날씨, 하단 목적지 선택 카드, 목적지 기준 `나갈 시간/비 그침/챙길 것` 카드 표시 | 통과 | local release APK 재빌드/재설치 후 실기기 홈에서 현재 위치 날씨, 목적지 선택 카드, 목적지 정보 3개 카드 확인. 캡처 `/tmp/weatheron-qa-home.png`, UI tree `/tmp/weatheron-ui-home.xml` |
| D5 | 상태 저장 | 앱 완전 종료/재실행 후 온보딩/설정 상태 유지 | 통과 | local release APK 0.1.0 (6) 재실행 후 홈, 저장 목적지, 현재 지역명, 하단 탭 상태 유지 확인 |
| D6 | Android 뒤로가기 | 주요 화면에서 예상 경로로 복귀 | 통과 | 출발 탭에서 Android Back 입력 후 홈 탭으로 복귀, crash buffer 비어 있음 |
| D7 | 위치 권한 허용 | 현재 위치 또는 fallback 메시지 표시, 크래시 없음 | 통과 | local release APK 0.1.0 (6)에서 위치 권한 허용 후 홈 상단 실제 지역명 `고양시 덕양구 지축동`, 위치 상태 `현재 위치`, 날씨 카드 표시 확인. crash buffer 비어 있음 |
| D8 | 위치 권한 거부 | 앱 사용 가능, 수동 위치/목적지 흐름 유지 | 통과 | ACCESS_FINE_LOCATION/COARSE_LOCATION revoke 후 홈이 `기본 위치 서울`, 위치 상태 `수동`으로 전환되고 목적지 비교/출발 판단 흐름 유지. crash buffer 비어 있음 |
| D9 | 목적지 검색 | 1순위 국내 장소(Kakao Local 또는 fallback) 검색·저장 확인 후 2순위 해외 장소(Google 또는 fallback) 보조 확인 | 통과 | local release APK 0.1.0 (6)에서 잠실/Tokyo Station 검색·선택·저장 확인. 해외 보조 fixture는 중화권 제외 기준에 맞춰 센트럴 파크로 소스 갱신 |
| D10 | 화면 밀도 | 작은 화면에서 가로 overflow/버튼 잘림/하단 탭 CTA 가림 없음 | 통과 | 실기기 wm size 720x1600 override에서 홈 주요 카드, 하단 탭, 스크롤 접근성 확인. 가로 overflow/CTA 가림 없음. 이후 1084x2412로 원복 |
| D11 | 다크/라이트 | 텍스트 대비와 버튼 상태 정상 | 통과 | cmd uimode night yes/no로 G2 다크/라이트 확인. 텍스트 대비, 버튼, 하단 탭 표시 정상. 캡처 `/tmp/weatheron-qa-g2-dark.png`, `/tmp/weatheron-qa-g2-transport-after.png` 확인. crash log fatal/ANR 패턴 없음 |
| D12 | 네트워크 끊김 | 빈 화면 없이 최근/기본 예보 안내 표시 | 통과 | Wi-Fi/데이터 off 후 Active default network none 상태에서 홈 빈 화면 없음. `최근 예보로 유지 중`, `최근 예보`, `연결 전까지 마지막 예보로 판단 유지` 표시. 네트워크 원복 확인 |
| D13 | 알림 신뢰성 | 알림 권한 허용 후 테스트 알림 예약, 5초 내 수신, 알림 탭 딥링크, 앱 재실행 후 예약 상태 확인 | 통과 | POST_NOTIFICATIONS granted. M2 테스트 알림 발송 후 5초 내 `weatheron:test:1783049994330` 시스템 게시, 제목 `WeatherON 테스트 알림`, route M2 payload 확인. 알림 탭 후 M2 복귀, 테스트 알림 잔존 없음, 재실행 후 `테스트 알림 수신·탭 확인됨`/예약 상태 유지 |
| D14 | 이동수단 드롭다운 | G2에서 이동수단 드롭다운 표시, 수단 선택 즉시 리스트 닫힘, 선택값/계산식 반영 | 통과 | 실기기에서 `자동/도보/자차/대중교통` 옵션과 `대중교통은 배차/환승 변동 가능` 문구 확인. `도보` 선택 후 버튼이 `이동수단 도보, 선택 목록 열기`로 돌아오고 옵션 노드 잔존 없음. 캡처 `/tmp/weatheron-qa-g2-transport-open.png`, `/tmp/weatheron-qa-g2-transport-after.png` |
| 우선순위 | 입력 | 기대 결과 | 판정 증거 |
| 1 | `잠실` | 국내 장소 결과 표시, 주소/국가/카테고리 확인 가능 | 결과 카드 선택 후 `목적지 저장하고 비교` 활성 |
| 1 | `잠실 야구장` | 국내 별칭 검색 결과 표시 | 저장 후 출발 목록/상세에서 같은 목적지 유지 |
| 2 | `Tokyo Station` | 일본 장소 결과 표시 | 국가/주소/시간대가 해외 장소로 보임 |
| 2 | `도쿄 역` | 한국어 해외 별칭 검색 결과 표시 | 결과 선택 및 저장 가능 |
| 2 | `東京駅` | 현지어 검색 결과 표시 | 결과 선택 및 저장 가능 |
| 2 | `센트럴 파크` | 일반 해외 장소 결과 표시 | 결과 선택 및 저장 가능 |
| 단계 | 기대 결과 | 판정 증거 |
| 권한 허용 | Android 알림 권한 허용 후 M2에서 권한 정상 표시 | M2 권한 태그, Android 앱 알림 권한 상태 |
| 테스트 발송 | 테스트 알림 버튼 탭 후 예약/발송 이력 표시 | 최근 이력에 `WeatherON 테스트 알림` 또는 발송 상태 기록 |
| 5초 수신 | 5초 내 시스템 알림 수신 | 알림 shade 또는 lockscreen 알림 캡처 |
| 딥링크 | 알림 탭 시 M2 알림 설정으로 이동 | 앱 foreground 전환과 M2 도착 확인 |
| 재실행 | 앱 재실행 후 예약 상태/이력 표시가 깨지지 않음 | M2 재진입 후 빈 화면/중복 예약 없음 |

## 4. 스토어 스크린샷 캡처표

| 순서 | 파일명 | 화면 | 앱 내 이동 | 캡처 조건 |
|---|---|---|---|---|
| 1 | `phone-01-home.png` | H1 홈 | 하단 홈 | 현재 날씨, 목적지 상태, 알림 진입이 보임 |
| 2 | `phone-02-destination-search.png` | P1 목적지 검색 | 하단 출발 > 목적지 추가 | Kakao Local 결과 또는 fallback 결과가 보임 |
| 3 | `phone-03-destination-care.png` | G2 목적지 케어 | 하단 출발 > 목적지 카드 | 목적지 날씨와 케어 ON/OFF 상태가 보임 |
| 4 | `phone-04-notification-center.png` | M2 알림 센터 | 홈 알림 > 알림 센터 | 알림 목록과 조건 설정 진입이 보임 |
| 5 | `phone-05-settings-policy.png` | M/R 정책 허브 | 하단 MY > 설정/정책 | 개인정보, 알림, 광고 설정 접근이 보임 |

## 5. Play 제출 입력값 회신표

| 항목 | 회신값 | 메모 |
|---|---|---|
| Google Play 공개 개발자 이메일 |  | 필수 |
| 개발자 웹사이트 URL 또는 미입력 |  | 선택 |
| 개인정보처리방침 공개 URL |  | HTTPS 필수 |
| 운영자명 | 최대현 / WeatherON | 확정 |
| 고객센터 연락처 | support@weatheron.app | 이메일 |
| 개인정보 보호책임자 성명 | 최대현 | 확정 |
| 개인정보 보호책임자 직책 | 개인정보 보호책임자 | 확정 |
| 개인정보 보호책임자 연락처 | support@weatheron.app | 이메일 |
| 개인정보처리방침 시행일 | 비공개 테스트 시작일 | 확정 |
| 광고/사용 로그 보유기간 | 테스트 종료 후 1개월 | 확정 |
| 이메일 인증 발송 서비스 | 현재 이메일 인증 발송 서비스를 사용하지 않습니다. | 미도입 |
| 앱 카테고리 | 날씨 | 1차 제출 기준 |
| 광고 포함 여부 | 아니오 | 현재 APK에 AdMob/광고 SDK 미포함 |
| 타겟 연령 |  | 권장 초안: 만 14세 이상 |
| Play Console 계정 유형 |  | 개인 신규/개인 기존/조직 |

## 6. 폐쇄 테스트 회신표

| 항목 | 회신값 |
|---|---|
| Play Console 계정 유형 | 개인 신규 / 개인 기존 / 조직 |
| 신규 개인 개발자 계정 여부 | 예 / 아니오 |
| 폐쇄 테스트 필요 여부 | 필요 / 불필요 / 권장 운영 |
| 테스터 그룹명 |  |
| 테스트 시작일 |  |
| 테스트 종료일 |  |
| opt-in 링크 |  |

## 7. 현재 blocker

- 개발자 이메일 확정 필요
- 개발자 웹사이트 입력 여부 결정 필요
- 개인정보처리방침 공개 URL 확정 필요
- 콘텐츠 등급 설문 완료 필요
- 정책/연령 문구 법무 검토 필요
- Android 스크린샷 캡처 필요
- Play Console 계정 유형 확인 필요
- 폐쇄 테스트 필요 여부 확정 필요
- 폐쇄 테스트 테스터 그룹 준비 필요

## 8. 반영 명령

```bash
npm run sync:android-device-qa-env
npm run apply:android-device-qa-results
npm run check:android-store-screenshots-ready
npm run apply:android-store-safe-defaults
npm run apply:android-store-inputs
npm run check:android-closed-test-ready
npm run check:android-store-submit-ready
npm run report:android-release-action-board
npm run check:android-local-release-ready
```

## 9. 참조 문서

| 문서 | 목적 |
|---|---|
| `WeatherON_ANDROID_DEVICE_QA_PACKET.md` | 실기기 QA |
| `WeatherON_ANDROID_STORE_SCREENSHOT_PACKET.md` | 스토어 스크린샷 |
| `WeatherON_ANDROID_STORE_INPUTS_PACKET.md` | Play/개인정보 입력값 |
| `WeatherON_ANDROID_PRIVACY_POLICY_PACKET.md` | 개인정보처리방침 공개 URL |
| `WeatherON_ANDROID_CLOSED_TEST_PACKET.md` | 폐쇄 테스트 |
| `WeatherON_ANDROID_PLAY_UPLOAD_PACKET.md` | AAB 업로드 |
| `WeatherON_ANDROID_RELEASE_ACTION_BOARD.md` | 전체 상태판 |
