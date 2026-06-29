# WeatherON Android Web Export QA

> 목적: Android APK 재설치 전, 동일 모바일 앱 엔트리의 web export를 In-app browser에서 확인한 결과를 기록한다.
> 기준일: 2026-06-28

---

## 1. 검증 대상

| 항목 | 값 |
|---|---|
| 앱 엔트리 | `apps/mobile/App.tsx` |
| export 명령 | `npm run export:android-web` |
| 로컬 확인 URL | `http://127.0.0.1:8094/` |
| 브라우저 | Codex In-app browser |
| 자동 상태 점검 | `WeatherON_ANDROID_WEB_EXPORT_STATUS.md` |
| 서버 상태 점검 | `WeatherON_ANDROID_WEB_PREVIEW_SERVER_STATUS.md` |
| 기준 APK build | `0afbdf0c-f617-43f5-8dd6-5466f862a40b` |
| 후속 APK build | `8a0b9f32-260b-4b64-b335-b4b30113b3a1` (`FINISHED`) |
| 최신 보정 build | `7c857db8-da31-4c95-88d8-0455546c1c4d` (`FINISHED`) |

주의:
- `http://127.0.0.1:8089/`는 `mockups/preview` 정적 서버라 실제 모바일 앱 QA 기준으로 보지 않는다.
- 실제 Android 상태 영속화는 native 파일 저장소 기준이므로 최종 판정은 APK 실기기 재설치 후 한다.
- 하단 메뉴 최종 기준은 `홈 / 코디 / 출발 / MY / 소셜`이다. `우산`, `강수`가 하단에 보이면 구버전 preview/APK 또는 mockup preview를 보고 있는 상태로 판정한다.
- `apps/mobile/dist-web`는 예전 web export 산출물이다. 8094 미리보기는 `apps/mobile/dist`를 기준으로 서빙한다.
- Codex In-app browser가 URL 정책으로 `127.0.0.1` 자동 판독을 거부하는 경우에는 우회하지 않고 코드, 문서, 실기기 APK 기준으로 판정한다.
- Node 24 환경에서 `expo start --web --host localhost --port 8094`가 `ERR_SOCKET_BAD_PORT`로 실패하면 `npm run export:android-web` 후 `python3 -m http.server 8094 --bind 127.0.0.1` 정적 서버로 확인한다.
- 8094 미리보기 하단 메뉴가 다르면 `npm run check:android-web-preview-server`로 현재 서버 응답이 최신 `apps/mobile/dist/index.html`과 일치하는지 먼저 확인한다.

---

## 2. 확인 결과

| 항목 | 결과 |
|---|---|
| 첫 진입 | 온보딩 화면 진입 확인 |
| 내부 코드 노출 | `H1`, `C1`, `G1`, `M1` 노출 없음 |
| `Guest 홈` 노출 | 없음 |
| 추가 개발 문구 | 계정/권한/목적지 화면의 내부 코드·영어 상태값 정리 완료 |
| 390x844 | 가로 overflow 없음 |
| 430x932 | 가로 overflow 없음 |
| 홈 진입 | `홈 먼저 보기` 후 홈 화면 이동 확인 |
| 홈 하단탭 | 목업 기준 `홈`, `코디`, `출발`, `MY`, `소셜` 라벨 확인 |
| QA용 직접 탭 | `우산`, `강수` 직접 탭 제거 확인. 홈/알림 흐름 내 진입은 유지 |
| web export 번들 | `npm run check:android-web-export`로 실제 참조 JS가 mobile `AppNavigator`/`BottomNav`를 포함하고 `preview-shell` 목업 코드를 참조하지 않음을 확인 |
| web preview 서버 | `npm run check:android-web-preview-server`로 8094 응답 HTML과 `apps/mobile/dist/index.html` 일치 여부 확인 |
| 홈 계열 활성 탭 | `알림센터`, `우산`, `강수` 진입 시 하단 활성 탭은 `홈`으로 판정 |
| 홈 상태 문구 | 날씨 연결 상태와 메시지 혼선 없음 |
| 콘솔 오류 | 8093 앱 URL 기준 error/warn 없음 |
| web reload 상태 유지 | web export에서는 미증명. Android 실기기 재QA 필요 |

---

## 3. 발견 사항

| 구분 | 내용 | 조치 |
|---|---|---|
| 서버 혼동 | 8089는 모바일 앱이 아니라 mockup preview였음 | QA 문서에 기준 URL 분리 |
| 저장소 fallback | web storage 접근 환경 차이 가능성 확인 | `window.localStorage`, `document.defaultView.localStorage` fallback 보강 |
| 상태 영속화 | web export reload에서는 홈 유지가 확인되지 않음 | Android APK 실기기에서 앱 재시작 기준으로 판정 |
| 문구 정리 | 실기기 QA 전 계정/권한/목적지 화면의 내부 문구 추가 제거 | `npm run check:android-product-quality`로 반복 방지 |
| 하단 탭 IA | QA용 `우산/강수` 직접 탭이 목업과 달랐음 | `홈/코디/출발/MY/소셜`로 고정 |
| 소셜 탭 연결 | 하단 `소셜`이 알림센터를 재사용하던 임시 상태였음 | `S1 ON Square`로 분리, 알림센터는 홈/알림 설정에서 진입 |
| 홈 계열 활성 탭 | 알림센터 `H3` 진입 시 하단 활성 탭이 비어 보일 수 있었음 | `H3/H4/H5`를 모두 홈 계열로 매핑 |
| Expo web dev server | Node 24/freeport 조합에서 8094 포트 기동 실패 | web export + Python 정적 서버로 QA |

---

## 4. 다음 QA

1. `7c857db8-da31-4c95-88d8-0455546c1c4d` APK 실기기 재설치
2. 하단 탭 `홈/코디/출발/MY/소셜` 표시 확인
3. `소셜` 탭 진입 시 `ON Square` 표시 확인
4. 온보딩 완료 후 앱 완전 종료/재실행
5. 홈 유지, 목적지 저장, 옷장 상태, 권한 상태 유지 확인
6. 결과를 `WeatherON_ANDROID_APK_QA_체크리스트.md`에 기록

---

## 5. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-06-27 | In-app browser 기반 mobile web export QA 결과 최초 기록 |
| 2026-06-27 | 실기기 품질 피드백 후 내부 문구 추가 정리와 정적 품질 체크 연결 |
| 2026-06-27 | In-app browser 홈 QA에서 상태 문구 혼선 제거 확인 |
| 2026-06-28 | In-app browser 390x844에서 하단 탭 `홈/코디/출발/MY/소셜` 확인 |
| 2026-06-28 | 하단 `소셜`을 `S1 ON Square` 화면으로 분리, 알림센터 임시 연결 제거 |
| 2026-06-28 | 하단 메뉴 최종 기준과 구버전 preview/APK 판정 기준 명시 |
| 2026-06-28 | `H3/H4/H5` 진입 시 하단 활성 탭을 `홈`으로 고정 |
| 2026-06-28 | Expo web dev server 포트 오류 발생 시 정적 export 서버로 대체하는 절차 추가 |
| 2026-06-28 | Android `versionCode=2` preview build `7c857db8-da31-4c95-88d8-0455546c1c4d`를 최신 실기기 QA 대상으로 갱신 |
| 2026-06-28 | `WeatherON_ANDROID_WEB_EXPORT_STATUS.md`와 `npm run check:android-web-export`로 mobile web export/목업 preview 혼동 방지 체크 추가 |
| 2026-06-28 | `WeatherON_ANDROID_WEB_PREVIEW_SERVER_STATUS.md`와 `npm run check:android-web-preview-server`로 8094 서버 산출물 일치 여부 점검 추가 |
