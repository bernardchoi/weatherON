# WeatherON Android Build Status

> 생성일: 2026-07-15
> 목적: 최신 Android QA 대상 빌드 상태와 artifact 생성 여부를 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| EAS build id | `N/A - local Gradle release APK` |
| Build 상태 | LOCAL BUILD SUCCESS |
| Platform | ANDROID |
| Profile | release-local |
| Version | `0.1.0 (9)` |
| Build 링크 | N/A |
| APK artifact | `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` |
| APK sha256 | `512dd18f4c32de3f83f20c041b32bfcf77d5e7f9d96e924412b903b9bdefc47b` |
| APK size | 98M |

## 2. 확인 명령

```bash
npm run check:android-device-qa-ready
```

## 3. 다음 액션

- Play 제출 blocker 중 스토어 입력값, 폐쇄 테스트 운영값, 정책/제출 외부 입력을 확정
- 비공개 테스트·실기기 QA 기준은 local release APK `0.1.0 (9)`으로 통일

## 4. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-07-01 | build `802540a2-77a2-40cb-9b3b-15d9b3984ae2` 상태 FINISHED 확인 |
| 2026-07-03 | local release APK `0.1.0 (6)` QA 대상으로 갱신 |
| 2026-07-03 | local release APK 재빌드/재설치 후 D7/D8/D10/D11/D12/D13 실기기 재판정 완료 |
| 2026-07-08 | local release APK `0.1.0 (7)` 재빌드. APK sha256 `4f7a1a8906b65043205eda515a77c80f3aea67c0e014ac17f65fbcfce467573d` 기록 |
| 2026-07-08 | C4 저장 완료 CTA 하단 여백 보정 후 local release APK 재빌드. APK sha256 `fceb374cffb2866f6393fb08f925e26b1daf0f2c8077c91c06e23ab01731a947` 기록 |
| 2026-07-08 | 제품 품질 체크 규칙에 맞춰 상수명 정리 후 local release APK 최종 재빌드. APK sha256 `97b96dfc5bb4c8ecc6e83ea258916cd935dba3e23afcc37da732e0f8b0c91235` 기록 |
| 2026-07-13 | 최신 리소스 local release APK `0.1.0 (8)` 재빌드·실기기 QA 완료. APK sha256 `23bc1a7900c0928d914c0b39b7048d45c9ff24a3738484e50f52cb6bc1dd491a` 기록 |
| 2026-07-15 | local release APK `0.1.0 (9)` 재빌드·실기기 QA 완료. APK sha256 `512dd18f4c32de3f83f20c041b32bfcf77d5e7f9d96e924412b903b9bdefc47b` 기록 |
