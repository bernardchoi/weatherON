# WeatherON Android Preview APK QA 체크리스트

> 목적: `npm run build:android:preview`로 생성한 Android APK를 실제 기기 또는 에뮬레이터에서 검증하는 기준을 유지한다.
> 기준일: 2026-06-28

---

## 1. QA 전제

| 항목 | 기준 |
|---|---|
| 빌드 산출물 | EAS `preview` profile APK |
| 빌드 명령 | `npm run build:android:preview` |
| 비대기 빌드 | `npm run build:android:preview:no-wait` |
| 빌드 상태 확인 | `npm run check:eas-build-status -- <eas-build-id>` |
| 사전 로컬 게이트 | `npm run check:android-build-ready` |
| 설치 대상 | Android 실제 기기 우선, 필요 시 에뮬레이터 |
| 네트워크 | Wi-Fi/LTE 각각 최소 1회 |
| 위치 권한 | 허용/거부/다시 묻지 않음 케이스 확인 |

---

## 2. 빌드 전 확인

```bash
npm run check:android-build-ready
npm run check:android-product-quality
npm run check:eas-login-state
npm run build:android:preview
npm run check:eas-build-status -- <eas-build-id>
```

확인 기준:
- `check:android-build-ready`가 통과해야 한다.
- `check:android-product-quality`가 내부 코드/개발 문구 노출을 차단해야 한다.
- `check:eas-login-state`가 Expo 계정명을 반환해야 한다.
- `build:android:preview`가 APK 다운로드 링크를 반환해야 한다.
- `build:android:preview:no-wait`로 시작한 경우 `check:eas-build-status`가 `FINISHED`를 반환해야 APK QA로 넘어간다.

---

## 3. 설치/실행 기본 체크

| 순서 | 항목 | 기대 결과 | 상태 |
|---|---|---|---|
| A1 | APK 설치 | 설치 성공, 경고 후 계속 설치 가능 | 통과 |
| A2 | 첫 실행 | 앱 크래시 없음 | 통과 |
| A3 | 앱 아이콘 | WeatherON 아이콘 정상 표시 | 실기기 확인 필요 |
| A4 | 스플래시 | 배경색/아이콘 깨짐 없음 | 미검증 |
| A5 | 다크/라이트 모드 | 텍스트 대비와 주요 버튼 정상 | 미검증 |
| A6 | 앱 재시작 | 온보딩/목적지/옷장/권한 상태 유지 | 재빌드 후 검증 필요 |

---

## 4. 필수 플로우

| 플로우 | 화면 | 핵심 확인 |
|---|---|---|
| 온보딩 | O1~O6 | 첫 진입, 지역/목적지 안내, 권한 게이트 이동 |
| 홈 | H1 | 현재 날씨, 코디, 우산, 알림 카드 표시 |
| 계정 게이트 | A2/A3 | 저장 액션 후 원래 화면 복귀 |
| 위치 권한 | O3 | 허용/거부/나중에 설정 모두 앱 중단 없음 |
| 목적지 검색 | P1 | Kakao Local 결과, 선택 후 날씨/케어 반영 |
| 목적지 홈 | G1/G2 | 저장 목적지, 케어 ON/OFF, 공유 상태 반영 |
| 목적지 허브 | P3 | 저장 목록, provider, 상태 pill 정상 |
| 코디 | C1/C2/C3/C4 | 추천/상세/옷장/저장 게이트 연결 |
| 정책 | R1~R7 | 약관/개인정보/광고/알림 문구 표시 |

---

## 5. Android 중점 QA

| 항목 | 체크 기준 | 상태 |
|---|---|---|
| 위치 권한 허용 | 현재 위치 날씨 갱신 또는 fallback 메시지 표시 | 실패: `7c857db8-da31-4c95-88d8-0455546c1c4d`에서 권한 허용 후 현재 위치 날씨 미반영 |
| 위치 권한 거부 | 앱 사용 가능, 수동 목적지 검색 가능 | 미검증 |
| 위치 서비스 꺼짐 | fallback 안내 표시, 크래시 없음 | 미검증 |
| 네트워크 끊김 | 최근/기본 예보 상태 표시, 빈 화면 없음, `실시간 예보`로 오인 표시 없음 | 미검증 |
| 작은 화면 | 360x800급에서 가로 overflow 없음 | 미검증 |
| 큰 화면 | 430x932급에서 카드 간격/버튼 정상 | 미검증 |
| 앱 백그라운드/복귀 | 상태 유지, 중복 알림/중복 저장 없음 | 미검증 |
| 알림 신뢰성 | 테스트 알림 예약, 5초 내 시스템 알림 수신, 알림 탭 M2 딥링크, 앱 재실행 후 예약/이력 상태 확인 | 미검증 |
| Android 뒤로가기 | 주요 화면에서 예상 경로로 이동 | 미검증 |
| 입력 키보드 | P1 검색 입력 시 버튼/결과 가림 없음 | 미검증 |

---

## 6. API/데이터 QA

| 항목 | 기준 | 상태 |
|---|---|---|
| KMA proxy | 한국 현재 위치/기본 위치 날씨 정상 | 미검증 |
| Kakao Local | `잠실`, `잠실 야구장` 국내 검색 결과 provider `kakao` 또는 fallback, 선택/저장 가능 | 미검증 |
| Open-Meteo | 목적지/해외 fallback 날씨 정상 | 미검증 |
| Google Maps | `Tokyo Station`, `도쿄 역`, `東京駅`, `센트럴 파크` 해외/현지어 검색 결과 선택 가능. 키 없으면 fixture/fallback 유지 | 미검증 |
| API 키 노출 | APK 앱 환경에 provider secret 미포함 | 미검증 |

사전 smoke:

```bash
WEATHERON_PROXY_SMOKE=1 npm run check:weather-proxy
WEATHERON_PLACE_SMOKE=1 npm run check:place-search
WEATHERON_LIVE_SMOKE=1 npm run check:weather-live
```

---

## 7. 기록 양식

| 항목 | 값 |
|---|---|
| 이전 APK 빌드 링크 | https://expo.dev/accounts/weatheron/projects/weatheron/builds/7c857db8-da31-4c95-88d8-0455546c1c4d |
| 이전 EAS build id | `7c857db8-da31-4c95-88d8-0455546c1c4d` |
| QA 대상 APK 빌드 링크 | https://expo.dev/accounts/weatheron/projects/weatheron/builds/802540a2-77a2-40cb-9b3b-15d9b3984ae2 |
| QA 대상 EAS build id | `802540a2-77a2-40cb-9b3b-15d9b3984ae2` |
| QA 대상 build 상태 | `FINISHED` |
| APK artifact | https://expo.dev/artifacts/eas/c5GZmnH_LlJTr8f3ysnwjX1BTjQGcoiUcfL1DEOayd4.apk |
| 보조 web export QA | `WeatherON_ANDROID_WEB_EXPORT_QA.md` |
| 실기기 QA 세션 | `WeatherON_ANDROID_DEVICE_QA_SESSION.md` |
| 테스트 기기 | A142 / adb `000841458003652` |
| Android 버전 | 16 |
| 테스트 일시 | 2026-07-01 KST |
| 네트워크 | Wi-Fi, Cloudflare public proxy |
| 통과 여부 | 부분 통과. 설치/실행/홈/알림 사이드바/출발/MY/계정 관리/목적지 상세/재실행/crash buffer 통과 |
| 주요 이슈 | 홈-출발-상세 목적지 날씨 값 불일치, 목적지 상세 첫 진입 하단 영역 걸침, 알림 설정 진입 시 탭 context가 MY로 전환, 장소 검색 자동 입력 미검증 |
| 보조 확인 | `check:public-weather-proxy`, `check:android-preview-preflight` 통과. 실기기 crash buffer 비어 있음 |
| 후속 조치 | 날씨 snapshot 통합, 목적지 상세 하단 padding 보정, 출발 context 알림 설정 라우팅 정리, 수동 장소 검색 QA |

---

## 8. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-06-27 | Android preview APK QA 체크리스트 최초 작성 |
| 2026-06-27 | EAS 로그인 확인 명령을 `check:eas-login-state` 기준으로 변경 |
| 2026-06-27 | EAS preview APK build id와 실기기 설치/실행 성공 기록 |
| 2026-06-27 | 실기기 제품 완성도 이슈를 제품 완성도 감사 문서로 분리 |
| 2026-06-27 | 상태 영속화 추가에 따라 앱 재시작 QA 기준 보강 |
| 2026-06-27 | EAS no-wait 빌드와 build id 상태 확인 명령 추가 |
| 2026-06-27 | 제품 보정 build `0afbdf0c-f617-43f5-8dd6-5466f862a40b` 완료 및 QA 대상 APK로 기록 |
| 2026-06-28 | `7c857db8-da31-4c95-88d8-0455546c1c4d` 실기기 D7 위치 권한 허용 후 현재 위치 날씨 미반영 실패 기록 |
| 2026-06-28 | 하단 탭 IA 보정 build `deb142d7-a9a8-44e5-85ba-6eb0e5b0dd95` 완료 및 QA 대상 APK로 갱신 |
| 2026-06-30 | 소셜 레이어 최초 출시 미공개 기준으로 QA 대상 범위 갱신 |
| 2026-06-30 | 홈 날씨 상태 문구를 provider 상태 기준으로 분기. 오프라인/실패 시 최근/기본 예보 안내로 표시 |
| 2026-06-27 | In-app browser web export QA 결과 문서 연결 |
| 2026-06-27 | 제품 품질 정적 체크를 APK QA 사전 게이트에 추가 |
| 2026-06-27 | 내부 문구 추가 정리 후 preview build `3df4fb84-98d5-417d-865e-240e14200520` 시작 |
| 2026-06-27 | 홈 상태 표시 수정 후 최신 preview build `ffe1ec96-c5a2-44d8-9a7d-b3a3a131d66a` 완료 및 artifact 기록 |
| 2026-06-27 | `.easignore` 반영 preview build `8a0b9f32-260b-4b64-b335-b4b30113b3a1` 완료 및 artifact 기록 |
| 2026-06-27 | 실기기 QA 세션 문서 연결 |
| 2026-06-28 | UI polish preview build `819b6cba-7757-48a3-9f8e-92a4efd9c17c` 실기기 QA 결과로 갱신 |
| 2026-06-28 | 소셜 문구 제거, 하단 탭 레이아웃 보정, 코디 시간 표기 보정. 다음 APK 재검증 필요 |
| 2026-07-01 | Cloudflare public proxy preview build `802540a2-77a2-40cb-9b3b-15d9b3984ae2` 실기기 QA 결과로 갱신 |
| 2026-07-02 | D13 알림 신뢰성 실기기 QA 기준 추가 |
