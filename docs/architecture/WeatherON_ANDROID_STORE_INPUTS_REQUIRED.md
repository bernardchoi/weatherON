# WeatherON Android Store Inputs Required

> 목적: Google Play 제출 blocker 중 사용자가 직접 확정해야 하는 입력값을 한 곳에서 관리한다.
> 기준일: 2026-06-28

---

## 1. 제출 전 필수 입력

| 항목 | 필요한 값 | 현재 상태 |
|---|---|---|
| 개발자 이메일 | Google Play 공개 연락처 이메일 | 미정 |
| 개발자 웹사이트 | 공개 웹사이트 입력 여부 및 URL | 미정 |
| 개인정보처리방침 URL | 공개 HTTPS URL | 미정 |
| 운영자명 | 회사명, 개인사업자명 또는 서비스 운영자명 | 미정 |
| 고객센터 연락처 | 이메일 또는 전화번호 | 미정 |
| 개인정보 보호책임자 성명 | 담당자명 | 미정 |
| 개인정보 보호책임자 직책 | 직책 | 미정 |
| 개인정보 보호책임자 연락처 | 이메일 또는 전화번호 | 미정 |
| 개인정보처리방침 시행일 | 실제 공개 시행일 | 미정 |
| 광고/사용 로그 보유기간 | 개월 수 | 미정 |
| 이메일 인증 발송 서비스 | 실제 도입 서비스명 또는 미도입 문구 | 미정 |

---

## 2. Play Console 선택 필요

| 항목 | 선택지 | 현재 상태 |
|---|---|---|
| 앱 카테고리 | 날씨 / 라이프스타일 | 날씨 |
| 광고 포함 여부 | 예 / 아니오 | 아니오. 현재 APK에 AdMob/광고 SDK 미포함 |
| 타겟 연령 | 만 14세 이상 유지 여부 | 법무 검토 필요 |
| 콘텐츠 등급 | Play Console 설문 결과 | 미완료 |
| 계정 유형 | 개인 신규 / 개인 기존 / 조직 | 미확인 |
| 폐쇄 테스트 필요 여부 | 계정 유형에 따라 확정 | 미확정 |

---

## 3. 입력 후 반영 위치

| 입력값 | 반영 파일 |
|---|---|
| 스토어 연락처/카테고리/광고 여부 | `docs/architecture/WeatherON_ANDROID_STORE_등록자료.md` |
| 개인정보처리방침 placeholder | `docs/policy/weatheron_privacy_policy.html` |
| 콘텐츠 등급 설문 | `docs/architecture/WeatherON_ANDROID_CONTENT_RATING_DRAFT.md` |
| 외부 액션 상태 | `docs/architecture/WeatherON_ANDROID_EXTERNAL_ACTIONS.md` |
| blocker 리포트 | `npm run check:android-store-submit-ready`로 재생성 |

---

## 4. 우선순위

1. 개인정보처리방침 공개에 필요한 운영자명, 연락처, 보호책임자, 시행일 확정
2. Google Play 공개 연락처 이메일과 웹사이트 입력 여부 확정
3. 계정 유형 확인 후 폐쇄 테스트 필요 여부 확정
4. 최신 APK 실기기 QA 통과 후 스토어 스크린샷 캡처

---

## 5. 입력값 회신 양식

아래 값이 확정되면 `WeatherON_ANDROID_STORE_등록자료.md`, `docs/policy/weatheron_privacy_policy.html`, `WeatherON_ANDROID_STORE_SUBMISSION_BLOCKERS.md`에 반영한다.

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

---

## 6. 자동 반영 명령

확정 입력값은 JSON으로 관리한다.

| 파일 | 목적 |
|---|---|
| `WeatherON_ANDROID_STORE_INPUTS.example.json` | 입력값 샘플 |
| `WeatherON_ANDROID_STORE_INPUTS.local.json` | 실제 로컬 입력값. `.gitignore` 대상 |

실행 순서:

```bash
npm run prepare:android-release-local-files
npm run apply:android-store-inputs
npm run check:android-store-submit-ready
```

`WEATHERON_STORE_INPUTS_FILE` 또는 첫 번째 인자로 다른 JSON 경로를 지정할 수 있다.
입력 파일 없이 상태만 갱신하려면 `WEATHERON_STORE_INPUTS_REPORT_ONLY=1 npm run apply:android-store-inputs`를 사용한다.

---

## 7. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-06-27 | Google Play 제출 전 사용자 확정 입력값 문서 최초 작성 |
| 2026-06-28 | Play 제출 blocker 해소 우선순위 추가 |
| 2026-06-28 | Google Play/개인정보처리방침 입력값 회신 양식 추가 |
| 2026-06-28 | 현재 APK 의존성 기준 앱 카테고리와 광고 포함 여부 확정 |
| 2026-06-28 | 콘텐츠 등급 설문 답변 초안 문서 연결 |
| 2026-06-28 | 스토어 입력값 JSON 자동 반영 명령 추가 |
