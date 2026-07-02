# WeatherON Android Device QA Session

> 목적: 최신 Android preview APK 실기기 재설치 QA 결과를 한 세션 단위로 기록한다.
> 기준일: 2026-06-29

---

## 1. QA 대상

### 2026-07-01 Cloudflare public proxy preview APK

| 항목 | 값 |
|---|---|
| EAS build id | `802540a2-77a2-40cb-9b3b-15d9b3984ae2` |
| Build 상태 | `FINISHED` |
| Build 링크 | https://expo.dev/accounts/weatheron/projects/weatheron/builds/802540a2-77a2-40cb-9b3b-15d9b3984ae2 |
| APK artifact | https://expo.dev/artifacts/eas/c5GZmnH_LlJTr8f3ysnwjX1BTjQGcoiUcfL1DEOayd4.apk |
| App version | `0.1.0 (5)` |
| Public proxy | `https://weatheron-api.weatheron.workers.dev` |
| 사전 체크 | `check:public-weather-proxy`, `check:android-preview-preflight` 통과 |
| 설치 방식 | 기존 서명 불일치 앱 삭제 후 npm run install:android-preview-apk / ADB install |
| 테스트 기기 | A142 / adb 000841458003652 |
| 테스트 일시 | 2026-07-02 12:50 KST |

### 이전 QA 기준

| 항목 | 값 |
|---|---|
| EAS build id | `819b6cba-7757-48a3-9f8e-92a4efd9c17c` |
| Build 상태 | `FINISHED` |
| Build 링크 | https://expo.dev/accounts/weatheron/projects/weatheron/builds/819b6cba-7757-48a3-9f8e-92a4efd9c17c |
| APK artifact | https://expo.dev/artifacts/eas/bxWR-_rZCG9X8TmXwj_ni6LS1m_5BR5egVy3X8X-HQE.apk |
| App version | `0.1.0 (4)` |
| EAS archive 업로드 | `62.6 MB` |
| 사전 체크 | `npm run check:android-release` 통과 |
| 보조 QA | `WeatherON_ANDROID_WEB_EXPORT_QA.md` |
| ADB 상태 | `WeatherON_ANDROID_ADB_STATUS.md` |
| 설치 상태 | `WeatherON_ANDROID_INSTALL_STATUS.md` |

---

## 2. 실기기 환경

| 항목 | 값 |
|---|---|
| 테스트 기기 | A142 / adb 000841458003652 |
| Android 버전 | 16 |
| 화면 크기 | 1084x2412 |
| 네트워크 | Wi-Fi |
| 설치 방식 | 기존 서명 불일치 앱 삭제 후 npm run install:android-preview-apk / ADB install |
| 테스트 일시 | 2026-07-02 12:50 KST |

---

## 3. 필수 판정

| ID | 항목 | 기대 결과 | 결과 | 메모 |
|---|---|---|---|---|
| D1 | APK 설치 | 설치 성공, 경고 후 계속 설치 가능 | 통과 | 기존 서명 불일치 앱 삭제 후 ADB install 완료, 패키지 com.weatheron.mobile 설치 확인 |
| D2 | 첫 실행 | 크래시 없이 온보딩 진입 | 통과 | pm clear 후 MainActivity 실행, O1 온보딩 진입, crash log buffer 비어 있음 |
| D3 | 내부 문구 노출 | `H1`, `Guest`, `READY`, `OUTER` 같은 개발 문구 미노출 | 보류 | H1/Guest/READY/OUTER 등 내부 route/dev label은 미노출. Android 권한 팝업 앱명 WeatherON Dev 노출은 출시 label 확정 필요 |
| D4 | 홈 진입 | 홈 카드, 코디, 우산, 알림, 하단탭 표시 | 통과 | 위치 없이 계속 후 홈 진입, 홈 카드/목적지 필요/날씨 연결됨/하단탭 표시 정상 |
| D4-1 | 하단 탭 IA | MVP 기준 `홈/출발/MY` 표시, `코디/소셜/우산/강수` 직접 탭 없음 | 통과 | 하단 탭 홈/출발/MY 구성 확인, MY 탭과 알림 설정 진입 확인 |
| D4-2 | 핵심 클릭 흐름 | `npm run check:android-core-flow` 기준 홈 CTA, 코디 기준 저장, 옷장 추가, 하단 탭 가림 없음 | 보류 | 온보딩-홈-MY-알림 설정 핵심 연결은 확인. 목적지/코디/소셜 전체 핵심 클릭 플로우는 이번 실기기 세션 미실행 |
| D5 | 상태 저장 | 앱 완전 종료/재실행 후 온보딩/설정 상태 유지 | 미검증 | 최신 빌드 기준 앱 재실행 후 목적지/설정 상태 유지 미실행 |
| D6 | Android 뒤로가기 | 주요 화면에서 예상 경로로 복귀 | 미검증 | 최신 빌드 기준 Android 뒤로가기 QA 미실행 |
| D7 | 위치 권한 허용 | 현재 위치 또는 fallback 메시지 표시, 크래시 없음 | 미검증 | 최신 빌드 기준 위치 허용 플로우 미실행 |
| D8 | 위치 권한 거부 | 앱 사용 가능, 수동 위치/목적지 흐름 유지 | 미검증 | 최신 빌드 기준 위치 거부 fallback 미실행 |
| D9 | 목적지 검색 | 1순위 국내 장소(Kakao Local 또는 fallback) 검색·저장 확인 후 2순위 해외 장소(Google 또는 fallback) 보조 확인 | 미검증 | 최신 빌드 기준 목적지 검색/선택 실기기 QA 미실행 |
| D10 | 화면 밀도 | 작은 화면에서 가로 overflow/버튼 잘림/하단 탭 CTA 가림 없음 | 미검증 | 최신 빌드 기준 작은 화면/긴 텍스트 실기기 QA 미실행 |
| D11 | 다크/라이트 | 텍스트 대비와 버튼 상태 정상 | 미검증 | 최신 빌드 기준 라이트/다크 대비 QA 미실행 |
| D12 | 네트워크 끊김 | 빈 화면 없이 최근/기본 예보 안내 표시 | 미검증 | 최신 빌드 기준 오프라인 상태 QA 미실행 |
| D13 | 알림 신뢰성 | 알림 권한 허용 후 테스트 알림 예약, 5초 내 수신, 알림 탭 딥링크, 앱 재실행 후 예약 상태 확인 | 보류 | 알림 권한 허용, 권한 정상/예약 완료/예약 1건, 테스트 알림 1건 발송 예약, 앱 단독 crash/log 오류 없음 확인. 시스템 알림 수신/알림 탭 딥링크는 다른 앱 알림 노출 위험 때문에 자동 확인 보류 |

---

## 4. 실행 순서

1. `npm run check:android-adb-ready`로 ADB 연결과 화면 크기를 확인한다.
2. `npm run install:android-preview-apk`로 최신 APK artifact를 실기기에 재설치한다.
3. 앱 데이터를 초기화한 뒤 첫 실행 D1~D4-2를 확인한다.
4. 목적지 1개를 저장하고 앱을 완전 종료/재실행해 D5를 확인한다.
5. 목적지 검색·설정은 국내 장소를 1순위로 먼저 완료하고, 해외 장소는 2순위 보조 케이스로 확인한다.
6. 권한 허용/거부, 네트워크 끊김, Wi-Fi/LTE 전환을 확인한다.
7. 알림 설정에서 테스트 알림을 보내고 5초 내 수신, 알림 탭 딥링크, 앱 재실행 후 예약 상태를 확인한다.
8. 통과 화면은 스토어 스크린샷 후보로 캡처한다.
9. 실패가 있으면 아래 실패 기록에 같은 build id로 남긴다.

스토어 스크린샷 후보 캡처는 화면을 직접 연 뒤 아래 명령으로 저장한다.

```bash
npm run capture:android-store-screenshot -- phone-01-home.png
```

QA 결과는 JSON으로 일괄 반영할 수 있다.

| 파일 | 목적 |
|---|---|
| `WeatherON_ANDROID_DEVICE_QA_RESULTS.example.json` | D1~D13 결과 입력 샘플 |
| `WeatherON_ANDROID_DEVICE_QA_RESULTS.local.json` | 실제 로컬 QA 결과. `.gitignore` 대상 |

```bash
npm run prepare:android-release-local-files
npm run apply:android-device-qa-results
npm run report:android-release-action-board
```

---

## 5. 실패 기록

| 시간 | 화면 | 증상 | 재현 단계 | 심각도 | 후속 |
|---|---|---|---|---|---|
| 2026-07-01 | H1 홈 | 홈의 목적지 도쿄는 `28도/흐림`, 출발/목적지 상세는 `27° -> 24°`로 표시되어 같은 목적지의 날씨 값이 일관되지 않음 | `802540a2-77a2-40cb-9b3b-15d9b3984ae2` 설치 후 홈, 출발, 목적지 상세 비교 | High | 홈/출발/상세가 동일 weather snapshot을 참조하도록 데이터 매핑 정리 필요 |
| 2026-07-01 | D1 출발 | 목적지 보조 라벨이 `도쿄 — 도`, `Starfield — County`처럼 어색하게 표시됨 | 출발 탭 목적지 카드 확인 | Low | 행정구역 raw suffix 대신 도시/국가/장소 유형 기준 라벨 포맷 적용 |
| 2026-07-01 | G2 목적지 상세 | 첫 진입 viewport에서 `알림 조건` 하단 영역이 bottom nav 아래로 걸쳐 UI tree bounds가 뒤집힘. 스크롤 후에는 정상 표시 | 도쿄 상세 진입 후 하단 영역 확인 | Medium | 상세 화면 하단 padding과 초기 스크롤 콘텐츠 높이 보정 |
| 2026-07-01 | A1 알림 설정 | 목적지 상세의 `상세`에서 알림 설정으로 이동하면 하단 탭 selected 상태가 `출발`이 아니라 `MY`로 바뀜 | 도쿄 상세 하단 `상세` 탭 | Low | 출발 흐름에서 진입한 알림 설정은 출발 탭 context 유지 또는 full-screen settings로 분리 |
| 2026-07-01 | P1 목적지 검색 | ADB 자동 입력이 기기 한글 키보드 레이아웃으로 깨져 영어/한국어 검색 결과 자동 검증 불가 | 검색 필드에 `Osaka` 입력 시 한글 자모로 입력됨 | Low | 실기기 수동 QA 또는 테스트 전용 IME/입력 helper 필요 |
| 2026-06-28 | O3/H1 위치 권한 | 권한 팝업은 표시되나 실제 위치 좌표/현재 위치 날씨가 반영되지 않음 | 실기기에서 위치 권한 허용 후 홈 확인 | High | 권한 완료 핸들러가 실제 GPS 요청 대신 기본 위치를 세팅하던 문제 수정. 새 preview APK 재빌드 필요 |
| 2026-06-28 | H1 홈 | `현재 위치 재확인 중`과 `날씨 갱신 실패`가 함께 노출됨 | `419e3d2c-135b-41a1-88f6-3321ad5115f1` 설치 후 홈 확인 | High | APK가 localhost weather proxy를 바라보지 않도록 runtime fallback 방어 추가. live weather는 public HTTPS proxy 필요 |
| 2026-06-30 | 미공개 소셜 레이어 | 사용자 화면에 소셜/ON Square 진입 노출 금지 | 최신 web export 기준 하단 탭 미노출 확인 | Medium | 최초 출시 이후 업데이트 후보로 분리 |
| 2026-06-28 | O2 코디 | 하단 고정 탭이 코디 화면 하단 액션을 일부 가림 | `819b6cba-7757-48a3-9f8e-92a4efd9c17c` 설치 후 코디 탭 확인 | Medium | 소스 수정 및 `npm run check:android-core-flow` 하단 탭 가림 회귀검사 완료. 새 preview APK에서 D10 재검증 필요 |
| 2026-06-28 | O2 코디 | 시간대 판단 시간이 ISO 원문으로 줄바꿈 표시됨 | web export 코디 스크롤 화면 확인 | Low | `08:00`, `09:00`, `12:00` 표시로 수정 완료. 새 preview APK에서 확인 필요 |
| 2026-06-30 | H1 홈 | 오프라인 상태에서도 `날씨 연결됨` 문구가 유지될 수 있음 | `819b6cba-7757-48a3-9f8e-92a4efd9c17c` 설치 후 Wi-Fi/모바일 데이터 차단 | Low | 홈 상태 pill을 `최근 예보`/`기본 예보`/`예보 확인 중`으로 분기. 새 APK에서 D12 재검증 필요 |

---

## 6. 완료 기준

- D1~D6은 모두 통과해야 다음 store screenshot 캡처 단계로 이동한다.
- D7~D13 중 실패가 있으면 `WeatherON_ANDROID_APK_QA_체크리스트.md`와 이 문서에 같은 build id로 기록한다.
- 치명도 높은 크래시, 빈 화면, 설치 실패가 있으면 새 preview build 전 원인 분석 문서를 추가한다.

---

## 7. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-06-27 | 최신 APK `8a0b9f32-260b-4b64-b335-b4b30113b3a1` 기준 실기기 QA 세션 문서 추가 |
| 2026-06-28 | 최신 APK `deb142d7-a9a8-44e5-85ba-6eb0e5b0dd95` 기준으로 갱신, 하단 탭 IA 항목 추가 |
| 2026-06-28 | 최신 APK 재설치 QA 실행 순서 추가 |
| 2026-06-30 | 소셜 레이어 최초 출시 미공개 기준으로 QA 항목 갱신 |
| 2026-06-28 | `S1 ON Square` 반영 APK `da28ef88-3adb-4a25-858d-9e2e4ba62245` 기준으로 갱신 |
| 2026-06-28 | ADB 기반 스토어 스크린샷 캡처 명령 연결 |
| 2026-06-28 | ADB 연결 상태 리포트 `WeatherON_ANDROID_ADB_STATUS.md` 연결 |
| 2026-06-28 | 최신 preview APK 설치 자동화 `install:android-preview-apk` 연결 |
| 2026-06-28 | 실기기 QA 결과 JSON 자동 반영 명령 추가 |
| 2026-06-28 | `H3/H4/H5` 홈 활성 탭 보정 및 Android `versionCode=2` build `7c857db8-da31-4c95-88d8-0455546c1c4d` 기준으로 갱신 |
| 2026-06-28 | 실기기 위치 권한 허용 후 현재 위치 날씨 미반영 이슈 기록 |
| 2026-06-28 | 위치 권한 수정 preview build `419e3d2c-135b-41a1-88f6-3321ad5115f1` 완료 및 D7 재검증 대상으로 갱신 |
| 2026-06-28 | 홈 스크린샷에서 weather proxy 연결 실패 상태 확인, localhost proxy 실기기 사용 금지 기록 |
| 2026-06-28 | weather proxy 연결 정상 preview build `29665e88-4da7-41f2-8178-9e85de34ecee` 기준으로 갱신 || 2026-06-28 | 실기기 QA 결과 JSON 반영 |
| 2026-06-28 | UI polish preview build `819b6cba-7757-48a3-9f8e-92a4efd9c17c` 실기기 자동 QA 결과 반영 |
| 2026-06-28 | S1 소셜 문구, O2 하단 탭 가림, O2 시간 표기 수정. web export 캡처 검증 완료, 새 APK 재검증 대기 |
| 2026-06-29 | `819b6cba-7757-48a3-9f8e-92a4efd9c17c` build 상태와 APK artifact 재확인. 현재 ADB 연결 기기 없음. 소스/web export 기준 홈·코디·출발·MY·소셜 내부 문구 미검출, 새 APK 재빌드 후 실기기 재검증 필요 |
| 2026-06-29 | 목적지 추가 화면에 장소 카테고리 이미지와 선택 목적지 히어로 이미지를 반영. web export 캡처 `/private/tmp/weatheron-destination-add-image-pass.png` 기준 이미지 로드와 내부 문구 미검출 확인 || 2026-06-29 | 실기기 QA 결과 JSON 반영 |
| 2026-06-30 | 홈 날씨 상태 문구가 provider status 전체를 보도록 보정. 오프라인/실패 시 `실시간 예보`로 남지 않게 함 |
| 2026-06-30 | `npm run check:android-core-flow`에 목적지/강수/코디 하단 CTA가 하단 탭에 가리지 않는지 확인하는 회귀검사 추가 |
| 2026-07-01 | Cloudflare public proxy preview APK `802540a2-77a2-40cb-9b3b-15d9b3984ae2` 실기기 설치 QA. 홈/알림 사이드바/출발/MY/계정 관리/목적지 상세/알림 설정 연결/재실행/crash buffer 확인 |
| 2026-07-02 | D13 알림 신뢰성 실기기 QA 항목 추가 |
| 2026-07-02 | 실기기 QA 결과 JSON 반영 |
