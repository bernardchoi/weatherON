# WeatherON Android Privacy Policy Packet

> 생성일: 2026-07-20
> 목적: Google Play 제출 전 개인정보처리방침 placeholder 제거와 공개 HTTPS URL 준비를 별도로 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 개인정보처리방침 파일 | `docs/policy/weatheron_privacy_policy.html` |
| Play 제출 blocker | 9 |
| 남은 placeholder 수 | 0 |
| 입력 JSON 파일 | /Users/daehyeonchoi/Claude/Projects/스마트 날씨 앱/docs/architecture/WeatherON_ANDROID_STORE_INPUTS.local.json |

## 2. 남은 placeholder

- 없음

## 3. 개인정보처리방침 회신값

| 항목 | 회신값 | 메모 |
|---|---|---|
| 개인정보처리방침 공개 URL |  | HTTPS 필수 |

## 4. 공개 전 확인

1. 위 회신값으로 `WeatherON_ANDROID_STORE_INPUTS.local.json` 작성
2. `npm run apply:android-store-inputs` 실행
3. `docs/policy/weatheron_privacy_policy.html`에서 placeholder 0개 확인
4. HTML 파일을 공개 HTTPS URL에 배포
5. 공개 URL을 Play Console 앱 콘텐츠 > 개인정보처리방침에 입력
6. `npm run check:android-store-submit-ready` 재실행

## 5. 확인 명령

```bash
npm run apply:android-store-inputs
npm run check:android-store-submit-ready
npm run report:android-privacy-policy-packet
```

## 6. 주의

- `privacyPolicyUrl`은 `https://` 공개 URL이어야 한다.
- `example.com`, `담당자명` 같은 샘플 값은 적용 스크립트에서 실패 처리된다.
- 정식 제출 전 법무 검토 필요.
