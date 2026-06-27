# WeatherON Android 외부 의존 액션 목록

> 목적: 로컬에서 완료 가능한 준비와 계정/심사/공개 URL처럼 외부에서 직접 처리해야 하는 항목을 분리한다.
> 기준일: 2026-06-27

---

## 1. 현재 차단 요약

| 구분 | 상태 | 다음 액션 |
|---|---|---|
| Expo/EAS | 로그인 필요 | `npm run eas:login` 실행 |
| EAS project | 미연결 | 로그인 후 `npm run eas:init` 실행 |
| Android preview APK | 미생성 | EAS project 연결 후 `npm run build:android:preview` 실행 |
| Play Console | 계정/앱 미확정 | 개발자 계정 유형 확인, 앱 대시보드 생성 |
| 개인정보처리방침 | 공개 URL 미확정 | HTML 초안의 placeholder 제거 후 공개 URL 확보 |
| 개발자 연락처 | 미확정 | 이메일, 운영자명, 웹사이트 입력 여부 확정 |
| 스크린샷 | 미캡처 | preview APK 설치 후 실제 화면 캡처 |

---

## 2. Expo/EAS 진행 순서

```bash
npm run eas:login
npm run check:eas-login-state
npm run eas:init
npm run check:android-local-release-ready
npm run build:android:preview
```

완료 기준:
- `check:eas-login-state`가 Expo 계정명을 반환한다.
- `eas:init` 후 EAS project id가 연결된다.
- `build:android:preview`가 APK 다운로드 링크를 반환한다.

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
| 앱 카테고리 | 검토 필요 | 날씨 또는 라이프스타일 중 선택 |
| 타겟 연령 | 법무 검토 필요 | 만 14세 이상 기준 유지 여부 |
| 광고 포함 여부 | 검토 필요 | AdMob 실제 도입 시점 기준으로 결정 |

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
