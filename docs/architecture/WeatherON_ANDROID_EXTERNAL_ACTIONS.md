# WeatherON Android 외부 의존 액션 목록

> 목적: 로컬에서 완료 가능한 준비와 계정/심사/공개 URL처럼 외부에서 직접 처리해야 하는 항목을 분리한다.
> 기준일: 2026-06-28

---

## 1. 현재 차단 요약

| 구분 | 상태 | 다음 액션 |
|---|---|---|
| Expo/EAS | 로그인 완료 | 필요 시 `npm run check:eas-login-state` 재확인 |
| EAS project | 연결 완료 | `apps/mobile/app.json`의 project id 유지 |
| Android preview APK | 최신 문서 기준 `419e3d2c-135b-41a1-88f6-3321ad5115f1` FINISHED | 실기기 연결 후 재설치 QA |
| 최신 MVP 수정 반영 preview build | quota 대기 | 사용자 승인 후 실행했으나 EAS Free plan Android build quota 소진. 2026-07-01 reset 후 재시도 |
| ADB/실기기 | 미연결 | USB 디버깅 허용 후 `npm run check:android-adb-ready` 재실행 |
| EAS archive 최적화 | inspect 기준 75MB 회복 | `android/app/build` 등 native 산출물 제외와 applicationId 보정 후 재측정 완료 |
| Play Console | 계정/앱 미확정 | 개발자 계정 유형 확인, 앱 대시보드 생성 |
| 개인정보처리방침 | 공개 URL 미확정 | HTML 초안의 placeholder 제거 후 공개 URL 확보 |
| 개발자 연락처 | 미확정 | `WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md` 기준으로 이메일, 운영자명, 웹사이트 입력 여부 확정 |
| 스크린샷 | 기존 5장 파일 존재 | 최신 MVP APK 설치 후 필요 시 재캡처 |

---

## 2. Expo/EAS 진행 순서

```bash
npm run eas:login
npm run check:eas-login-state
npm run eas:init
npm run check:android-local-release-ready
npm run build:android:preview
npm run build:android:preview:no-wait
npm run check:eas-build-status -- <eas-build-id>
```

완료 기준:
- `check:eas-login-state`가 Expo 계정명을 반환한다.
- `eas:init` 후 EAS project id가 연결된다.
- `build:android:preview`가 APK 다운로드 링크를 반환한다.

현재 완료 기록:
- Expo 계정: `weatheron`, `dev@weatheron.app`
- EAS project id: `3bf39144-92a4-48a9-8bd8-ae09daf2a817`
- Preview build: `25a68bd4-6177-49ce-925d-58ff9d643f03`
- Build link: https://expo.dev/accounts/weatheron/projects/weatheron/builds/25a68bd4-6177-49ce-925d-58ff9d643f03
- Product quality build: `0afbdf0c-f617-43f5-8dd6-5466f862a40b` (`FINISHED`)
- Product quality build link: https://expo.dev/accounts/weatheron/projects/weatheron/builds/0afbdf0c-f617-43f5-8dd6-5466f862a40b
- Product quality artifact: https://expo.dev/artifacts/eas/lzz4uwe8glM_N7pk1nm3aNUiSdMxCnPQA23YSQo8okI.apk
- Latest product polish build: `ffe1ec96-c5a2-44d8-9a7d-b3a3a131d66a` (`FINISHED`)
- Latest product polish build link: https://expo.dev/accounts/weatheron/projects/weatheron/builds/ffe1ec96-c5a2-44d8-9a7d-b3a3a131d66a
- Latest product polish artifact: https://expo.dev/artifacts/eas/ZpyJcTO7rm9QLjgyO36Wwr1FiIjiBI9HDdFnTnsWcnk.apk
- Archive optimized build: `8a0b9f32-260b-4b64-b335-b4b30113b3a1` (`FINISHED`)
- Latest archive optimized build: `da28ef88-3adb-4a25-858d-9e2e4ba62245` (`FINISHED`)
- Latest versionCode=2 QA build: `7c857db8-da31-4c95-88d8-0455546c1c4d` (`FINISHED`)
- Latest versionCode=2 QA build link: https://expo.dev/accounts/weatheron/projects/weatheron/builds/7c857db8-da31-4c95-88d8-0455546c1c4d
- Latest versionCode=2 QA artifact: https://expo.dev/artifacts/eas/Xo-hMSzJaJpw--znFpD2N082Pyw1RSF3ynB9Kz1ppCI.apk
- Archive upload size: `62.6 MB`
- Latest tracked preview build: `419e3d2c-135b-41a1-88f6-3321ad5115f1` (`FINISHED`)
- Latest tracked preview artifact: https://expo.dev/artifacts/eas/Cq_28HC_Rdep_5qC2b8n_oGL8K6WC-dgZfFPRyO9Qqc.apk
- 현재 ADB 상태: 기기 미감지
- 최신 로컬 MVP 수정 반영 build: 사용자 승인 후 `npm run build:android:preview:no-wait` 실행했으나 EAS Free plan Android build quota 소진으로 실패. reset은 2026-07-01 예정
- 최신 archive inspect: 2026-06-30 `/tmp/weatheron-eas-inspect` 75MB. `android/app/build` 제외 및 native `applicationId 'com.weatheron.mobile'` 보정 완료

---

## 3. Play Console 입력 전 필요한 확정값

| 항목 | 현재 상태 | 필요 입력 |
|---|---|---|
| 개발자 이메일 | 미정 | Play Console 연락처로 사용할 이메일 |
| 개발자 웹사이트 | 미정 | 입력 여부 결정. 없으면 개인정보처리방침 공개 URL과 별도 검토 |
| 운영자명 | placeholder | 회사명/개인사업자명 또는 서비스 운영자명 |
| 개인정보 보호책임자 | placeholder | 담당자명, 직책, 연락처 |
| 개인정보처리방침 시행일 | placeholder | 실제 공개 시행일 |
| 로그 보유기간 | placeholder | 광고/사용 로그 보유기간 개월 수 |
| 이메일 발송 서비스 | placeholder | 실제 도입 서비스명 또는 미도입 문구 |
| 앱 카테고리 | 확정 | 1차 제출 기준 `날씨` |
| 타겟 연령 | 법무 검토 필요 | 만 14세 이상 기준 유지 여부 |
| 광고 포함 여부 | 확정 | 현재 APK에 AdMob/광고 SDK 미포함. 1차 제출 기준 `아니오` |

---

## 4. 확인 명령

```bash
npm run check:android-local-release-ready
npm run check:android-store-submit-ready
```

판단 기준:
- `check:android-local-release-ready`는 EAS 로그인 전에도 통과해야 한다.
- `check:android-local-release-ready` 실행 시 store submission blocker 리포트도 report-only로 갱신된다.
- `check:android-store-submit-ready`는 Play 제출 직전 blocker가 0개일 때만 통과해야 한다.

---

## 5. 관련 문서

- `docs/architecture/WeatherON_ANDROID_출시_준비_프로세스.md`
- `docs/architecture/WeatherON_ANDROID_RELEASE_READINESS_REPORT.md`
- `docs/architecture/WeatherON_ANDROID_STORE_SUBMISSION_BLOCKERS.md`
- `docs/architecture/WeatherON_ANDROID_STORE_등록자료.md`
- `docs/architecture/WeatherON_ANDROID_APK_QA_체크리스트.md`
- `docs/architecture/WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md`
