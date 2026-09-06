# Android 계정 연결·탭 음영 검증

2026-09-06. A142 Android 16 실기기, 기존 데이터를 보존한 `com.weatheron.mobile.designqa` release APK로 검사함.

## 수정

- BottomNav의 Android 기본 사각 ripple을 제거하고 둥근 눌림 상태 배경으로 변경. 선택 아이콘의 Material 캡슐·탭 접근성·선택 동작 유지. radius만 설정하는 첫 시도는 실기기에서 사각 리플이 남아 채택하지 않음.
- AccountConnectScreen의 iOS 전용 공급자 조회 제한 제거. Apple 가용성 조회는 iOS에서만 수행.
- accountAuth의 OAuth 실행을 Android에도 허용. 기존 브라우저 인증·콜백·서버 교환·SecureStore 재사용. callback 경로와 state 검사 유지·보강.
- 계정 기준 문서에 Android 지역별 순서 및 운영 공급자 조회 결과 갱신. 한국은 카카오·네이버·Google, 추가 선택에 LINE. Apple 제외.
- [Expo WebBrowser 공식 문서](https://docs.expo.dev/versions/v56.0.0/sdk/webbrowser/)의 Android 인증 세션과 앱 scheme 복귀 방식에 맞춰 기존 구현 재사용.

## 확인 결과

- TypeScript, `node scripts/check-android-account.mjs`, `node scripts/check-account-region.mjs`, `node scripts/check-account-auth.mjs`, `git diff --check` 통과.
- 앱 회귀 검사는 네 OAuth 공급자 성공 경로·취소·잘못된 state/콜백·오류 응답·Apple 차단·웹 차단을 mock 환경에서 실행. 실제 외부 계정 인증 성공으로 간주하지 않음.
- 최종 release APK 빌드·실기기 업데이트 설치 성공. 기존 목적지·설정 유지.
- 최종 탭 누름 중 캡처에서 사각 음영 없이 둥근 상태 배경 확인.
- 실기기 계정 화면에서 카카오·네이버·Google·LINE 표시, Apple 없음.
- 카카오 `accounts.kakao.com` 로그인 폼, 네이버 `nid.naver.com`, Google `accounts.google.com` 진입 확인. 세 공급자 브라우저 닫기 후 취소 메시지와 앱 복귀 확인.
- LINE `access.line.me` 브라우저 진입 확인. 수집 시 웹 콘텐츠가 로딩 상태여서 로그인 폼 완료 렌더링·취소 메시지까지는 검증하지 않음.
- 개인 계정 자격 증명 입력·로그인 동의·실제 토큰 교환·약관·재실행 세션 복원은 미검증. 기존 제품 앱 업데이트·스토어 배포는 수행하지 않음.
- 시스템 transition_animation_scale은 원래 값 1로 복원.

[공급자 화면](evidence/android-account-2026-09-06/providers.png) · [수정 전 사각 리플](evidence/android-account-2026-09-06/tab-pressed.png) · [최종 둥근 눌림 표시](evidence/android-account-2026-09-06/tab-pressed-fixed.png)
