# WeatherON Android Manual Action Packet

> 생성일: 2026-06-30
> 목적: 자동 빌드/검증 이후 사람이 직접 처리해야 하는 Android 출시 액션을 한 장으로 유지한다.

## 1. 현재 출시 상태

| 항목 | 값 |
|---|---|
| preview APK build | `419e3d2c-135b-41a1-88f6-3321ad5115f1` |
| APK artifact | https://expo.dev/artifacts/eas/Cq_28HC_Rdep_5qC2b8n_oGL8K6WC-dgZfFPRyO9Qqc.apk |
| production AAB build | `90912651-fc84-47d0-91ce-9be096c2ff05` |
| production AAB 상태 | FINISHED |
| AAB artifact | https://expo.dev/artifacts/eas/qCf2bVWNWVs_bgzWZlbMvlacPn0Y3OyxPo0rUvSQHa4.aab |
| Play 제출 blocker | 17 |
| 실기기 QA 미검증 | 14 |
| 스토어 스크린샷 issue | 0 |
| Play 입력값 누락 | 9 |
| 폐쇄 테스트 대기 항목 | 13 |

## 2. 작업 순서

| 우선 | 작업 | 완료 기준 | 상태 |
|---|---|---|---|
| 1 | 최신 MVP preview APK | 현재 소스 0.1.0 (5) 기준 새 APK 필요. EAS Free plan Android build quota 소진. 2026-07-01 reset 후 재시도 필요 | quota 대기 · 현재 APK 0.1.0 (3) |
| 2 | 실기기 QA | 새 preview APK 생성 후 D1~D12 판정 | 14개 미검증 |
| 3 | 스토어 스크린샷 | `assets/store/android-screenshots/`에 5장 저장 | 완료 |
| 4 | Play 제출 입력값 | `WeatherON_ANDROID_STORE_INPUTS.local.json` 작성 후 `npm run apply:android-store-inputs` 실행 | 9개 issue · 누락 9 |
| 5 | 폐쇄 테스트 준비 | `WeatherON_ANDROID_CLOSED_TEST_INPUTS.local.json` 작성 후 `npm run apply:android-closed-test-inputs` 실행 | 13개 대기 · 입력 13개 issue |
| 6 | Production AAB | `npm run check:eas-production-build-status -- <build-id>` 기준 FINISHED 확인 | 완료 |
| 7 | 스토어 blocker | `npm run check:android-store-submit-ready` 기준 해소 | 17개 잔존 |

## 3. 실기기 QA 기입표

| ID | 항목 | 기대 결과 | 결과 | 메모 |
|---|---|---|---|---|
| D1 | APK 설치 | 설치 성공, 경고 후 계속 설치 가능 | 미검증 | 최신 build에서 재검증 필요 |
| D2 | 첫 실행 | 크래시 없이 온보딩 진입 | 미검증 | 최신 build에서 재검증 필요 |
| D3 | 내부 문구 노출 | `H1`, `Guest`, `READY`, `OUTER` 같은 개발 문구 미노출 | 미검증 | 최신 build에서 재검증 필요 |
| D4 | 홈 진입 | 홈 카드, 코디, 우산, 알림, 하단탭 표시 | 미검증 | 최신 build에서 재검증 필요 |
| D4-1 | 하단 탭 IA | MVP 기준 `홈/출발/MY` 표시, `코디/소셜/우산/강수` 직접 탭 없음 | 미검증 | 최신 build에서 재검증 필요 |
| D4-2 | 핵심 클릭 흐름 | `npm run check:android-core-flow` 기준 홈 CTA, 코디 기준 저장, 옷장 추가, 하단 탭 가림 없음 | 미검증 | 최신 build에서 재검증 필요 |
| D5 | 상태 저장 | 앱 완전 종료/재실행 후 온보딩/설정 상태 유지 | 미검증 | 최신 build에서 재검증 필요 |
| D6 | Android 뒤로가기 | 주요 화면에서 예상 경로로 복귀 | 미검증 | 최신 build에서 재검증 필요 |
| D7 | 위치 권한 허용 | 현재 위치 또는 fallback 메시지 표시, 크래시 없음 | 미검증 | 최신 build에서 재검증 필요 |
| D8 | 위치 권한 거부 | 앱 사용 가능, 수동 위치/목적지 흐름 유지 | 미검증 | 최신 build에서 재검증 필요 |
| D9 | 목적지 검색 | Kakao Local 결과 또는 fallback 결과 표시 | 미검증 | 최신 build에서 재검증 필요 |
| D10 | 화면 밀도 | 작은 화면에서 가로 overflow/버튼 잘림/하단 탭 CTA 가림 없음 | 미검증 | 최신 build에서 재검증 필요 |
| D11 | 다크/라이트 | 텍스트 대비와 버튼 상태 정상 | 미검증 | 최신 build에서 재검증 필요 |
| D12 | 네트워크 끊김 | 빈 화면 없이 최근/기본 예보 안내 표시 | 미검증 | 최신 build에서 재검증 필요 |

## 4. 스토어 스크린샷 캡처표

| 순서 | 파일명 | 화면 | 앱 내 이동 | 캡처 조건 |
|---|---|---|---|---|
| 1 | `phone-01-home.png` | H1 홈 | 하단 홈 | 현재 날씨, 코디 요약, 우산/알림 진입이 보임 |
| 2 | `phone-02-destination-search.png` | P1 목적지 검색 | 하단 출발 > 목적지 추가 | Kakao Local 결과 또는 fallback 결과가 보임 |
| 3 | `phone-03-destination-care.png` | G2 목적지 케어 | 하단 출발 > 목적지 카드 | 목적지 날씨와 케어 ON/OFF 상태가 보임 |
| 4 | `phone-04-outfit.png` | C1 코디 추천 | 하단 홈 > 코디 요약 | 날씨 기반 착장과 추천 사유가 보임 |
| 5 | `phone-05-settings-policy.png` | M/R 정책 허브 | 하단 MY > 설정/정책 | 개인정보, 알림, 광고 설정 접근이 보임 |

## 5. Play 제출 입력값 회신표

| 항목 | 회신값 | 메모 |
|---|---|---|
| Google Play 공개 개발자 이메일 |  | 필수 |
| 개발자 웹사이트 URL 또는 미입력 |  | 선택 |
| 개인정보처리방침 공개 URL |  | HTTPS 필수 |
| 운영자명 |  | 법인/개인사업자/서비스 운영자명 |
| 고객센터 연락처 |  | 이메일 권장 |
| 개인정보 보호책임자 성명 |  | 필수 |
| 개인정보 보호책임자 직책 |  | 필수 |
| 개인정보 보호책임자 연락처 |  | 이메일 또는 전화번호 |
| 개인정보처리방침 시행일 |  | 예: 2026-07-01 |
| 광고/사용 로그 보유기간 |  | 권장 초안: 12개월 |
| 이메일 인증 발송 서비스 |  | 미도입이면 `이메일 인증 미도입` |
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
- 개인정보처리방침 placeholder 제거 필요: [YYYY-MM-DD]
- 개인정보처리방침 placeholder 제거 필요: [회사명/개인사업자명]
- 개인정보처리방침 placeholder 제거 필요: [고객센터 이메일/연락처]
- 개인정보처리방침 placeholder 제거 필요: [ ]개월
- 개인정보처리방침 placeholder 제거 필요: [이메일 인증 발송 서비스]
- 개인정보처리방침 placeholder 제거 필요: [담당자명]
- 개인정보처리방침 placeholder 제거 필요: [직책]
- 개인정보처리방침 placeholder 제거 필요: [이메일/전화번호]

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
