# WeatherON Android Device QA Session

> 목적: 최신 Android preview APK 실기기 재설치 QA 결과를 한 세션 단위로 기록한다.
> 기준일: 2026-06-29

---

## 1. QA 대상

### 2026-07-10 local release APK v8 재검증 (아이콘 어포던스 폴리시 이후)

| 항목 | 값 |
|---|---|
| EAS build id | `N/A - local Gradle release APK` |
| Build 상태 | `LOCAL BUILD SUCCESS` |
| Build 링크 | N/A |
| APK artifact | `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` |
| App version | `0.1.0 (8)` |
| APK sha256 | `b659ebbdb843be6cffbbc6a6578055d6cb4493e53b7a1ef34a1a077c8ea81fcd` |
| 테스트 기기 | A142 / adb 000841458003652 |
| 테스트 일시 | 2026-07-10 11:38-11:44 KST |
| QA 리포트 | `docs/audits/android-real-device-v8-2026-07-10-r2/report.md` |
| 주요 결과 | `c98a58ad5` 아이콘 어포던스 폴리시 커밋 반영 후 재빌드/재설치. 이전 v8 리포트에서 no-op으로 보고된 코디 `상세 보기` → C4 이동을 픽셀 좌표 기준으로 재확인한 결과 정상 동작 확인. 코디 상세 back, 출발, MY, 알림 사이드바, Android 뒤로가기 모두 정상. crash/ANR/FATAL 패턴 없음 |
| 남은 개선 | 코디 `상세 보기` no-op 재현 실패 — 이전 세션의 일시적 탭 미스 또는 이번 아이콘 폴리시로 인한 터치 영역 확대가 원인일 가능성. 코드 변경 없이 종결. O 시리즈 온보딩/D9 목적지 검색/D13 알림 발송/권한 거부 상태는 이번 세션에서 미검증 |

### 2026-07-09 local release APK Product QA

| 항목 | 값 |
|---|---|
| EAS build id | `N/A - local Gradle release APK` |
| Build 상태 | `LOCAL BUILD SUCCESS` |
| Build 링크 | N/A |
| APK artifact | `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` |
| App version | `0.1.0 (7)` |
| APK sha256 | `648b3a8343cc3becdfe266e1bcaabe63ee9dafbef2cbc9af3ee478fd105f6ba1` |
| 테스트 기기 | A142 / adb 000841458003652 |
| 테스트 일시 | 2026-07-09 11:19-11:22 KST |
| QA 리포트 | `docs/audits/ui-ux-real-device-qa-2026-07-09-1122/report.md` |
| 주요 결과 | `ExpoLinearGradient` native ViewManager 미등록 릴리즈 크래시를 RN View 배경 레이어로 대체해 해결. 재빌드/재설치 후 홈, 코디, 출발, MY, 알림 사이드바 스와이프 닫힘 확인. crash log 비어 있음. |
| 남은 개선 | 코디 탭 첫 화면 하단에서 다음 카드 일부가 탭바 뒤로 이어져 보이는 컷 기준 재검토 필요. |

### 2026-07-08 local release APK Outfit Tab QA

| 항목 | 값 |
|---|---|
| EAS build id | `N/A - local Gradle release APK` |
| Build 상태 | `LOCAL BUILD SUCCESS` |
| Build 링크 | N/A |
| APK artifact | `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` |
| App version | `0.1.0 (7)` |
| APK sha256 | `97b96dfc5bb4c8ecc6e83ea258916cd935dba3e23afcc37da732e0f8b0c91235` |
| 테스트 기기 | A142 / adb 000841458003652 |
| 테스트 일시 | 2026-07-08 17:36-18:11 KST |
| QA 리포트 | `docs/audits/ui-ux-real-device-qa-2026-07-08-1736/report.md` |
| 주요 결과 | crash/ANR 없음. 홈/코디/출발/MY 4탭, 코디 추천, 코디 상세, 코디 저장 완료 상태, 출발, MY, 알림 사이드바 스와이프 닫힘 확인. C4 저장 완료 CTA 하단 여백 보정 후 버튼 bottom 1745, 탭바 top 2164로 약 419px 여유 확인. |
| 남은 개선 | 없음. C4 저장 완료 CTA 하단 여백 이슈 해결 확인. |

### 2026-07-08 local release APK UI/UX QA

| 항목 | 값 |
|---|---|
| EAS build id | `N/A - local Gradle release APK` |
| Build 상태 | `LOCAL BUILD SUCCESS` |
| Build 링크 | N/A |
| APK artifact | `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` |
| App version | `0.1.0 (7)` |
| 테스트 기기 | A142 / adb 000841458003652 |
| 테스트 일시 | 2026-07-08 00:11-00:21 KST |
| QA 리포트 | `docs/audits/ui-ux-real-device-qa-2026-07-08-0011/report.md` |
| 주요 결과 | crash/ANR 없음. 홈, 출발 목록, 신사이바시 상세, 도착 편집기, 이동수단 드롭다운, MY, 권한, 스마트 알림 설정 확인. 해외 목적지에서 비현실 도보 시간과 전날 출발 시간 미노출 확인. |
| 해결 확인 | 도착 시간 편집기와 이동수단 드롭다운 동시 표시 시 탭바 겹침 없음. 장거리 도보 옵션은 `장거리 목적지는 도보 제외`로 비활성 표시. |
| 남은 개선 | 스마트 알림 설정 `실제 수신` 라벨 줄바꿈 확인. 후속 코드에서 라벨 폭 보정, 재실기기 확인 필요. |

### 2026-07-07 local release APK UI/UX QA

| 항목 | 값 |
|---|---|
| EAS build id | `N/A - local Gradle release APK` |
| Build 상태 | `LOCAL BUILD SUCCESS` |
| Build 링크 | N/A |
| APK artifact | `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` |
| App version | `0.1.0 (7)` |
| 테스트 기기 | A142 / adb 000841458003652 |
| 테스트 일시 | 2026-07-07 21:00-21:08 KST |
| QA 리포트 | `docs/audits/ui-ux-real-device-qa-2026-07-07-2100/report.md` |
| 주요 결과 | crash/ANR 없음. 홈, 출발 목록, 신사이바시 상세, 도착 편집기, 이동수단 드롭다운, MY, 권한, 스마트 알림 설정 확인. |
| 남은 개선 | 홈 목적지 칩 말줄임, 홈 핵심 행동 카드 하단 밀림, 스마트 알림 설정 `실제 수신` 라벨 줄바꿈 |

### 2026-07-04 local release APK for Home/G1/G2 QA

| 항목 | 값 |
|---|---|
| EAS build id | `N/A - local Gradle release APK` |
| Build 상태 | `LOCAL BUILD SUCCESS` |
| Build 링크 | N/A |
| APK artifact | `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` |
| App version | `0.1.0 (6)` |
| Public proxy | `https://weatheron-api.weatheron.workers.dev` |
| 사전 체크 | `npm run check:android-adb-ready`, `./gradlew :app:assembleRelease --console=plain`, `npm run install:android-preview-apk` 통과 |
| 설치 방식 | ADB install release APK |
| 테스트 기기 | A142 / adb 000841458003652 |
| 테스트 일시 | 2026-07-04 16:10 KST |

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
| 설치 방식 | ADB install release APK |
| 테스트 일시 | 2026-07-03 12:48 KST |

---

## 3. 필수 판정

| ID | 항목 | 기대 결과 | 결과 | 메모 |
|---|---|---|---|---|
| D1 | APK 설치 | 설치 성공, 경고 후 계속 설치 가능 | 통과 | 기존 서명 불일치 앱 삭제 후 ADB install 완료, 패키지 com.weatheron.mobile 설치 확인 |
| D2 | 첫 실행 | 크래시 없이 온보딩 진입 | 통과 | pm clear 후 MainActivity 실행, O1 온보딩 진입, crash log buffer 비어 있음 |
| D3 | 내부 문구 노출 | `H1`, `Guest`, `READY`, `OUTER` 같은 개발 문구 미노출 | 보류 | H1/Guest/READY/OUTER 등 내부 route/dev label은 미노출. Android 권한 팝업 앱명 WeatherON Dev 노출은 출시 label 확정 필요 |
| D4 | 홈 진입 | 홈 카드, 코디, 우산, 알림, 하단탭 표시 | 통과 | 위치 없이 계속 후 홈 진입, 홈 카드/목적지 필요/날씨 연결됨/하단탭 표시 정상 |
| D4-1 | 하단 탭 IA | 출시 후보 기준 `홈/코디/출발/MY` 표시, `소셜/우산/강수` 직접 탭 없음 | 통과 | `0.1.0 (7)` 실기기에서 홈/코디/출발/MY 4탭 표시와 C1~C4 코디 활성 탭 매핑 확인 |
| D4-2 | 핵심 클릭 흐름 | `npm run check:android-core-flow` 기준 홈 CTA, 코디 탭 추천/상세/저장/옷장 진입, 하단 탭 가림 없음 | 통과 | 2026-07-08 C4 저장 완료 CTA 하단 여백 보정 후 web core-flow와 실기기 재확인 통과. 실기기 bounds 기준 저장 완료 버튼 bottom 1745, 탭바 top 2164 |
| D4-3 | 홈 목적지 카드 | 상단 현재 위치 날씨, 하단 목적지 선택 카드, 목적지 기준 `나갈 시간/비 그침/챙길 것` 카드 표시 | 통과 | local release APK 재빌드/재설치 후 실기기 홈에서 현재 위치 날씨, 목적지 선택 카드, 목적지 정보 3개 카드 확인. 캡처 `/tmp/weatheron-qa-home.png`, UI tree `/tmp/weatheron-ui-home.xml` |
| D5 | 상태 저장 | 앱 완전 종료/재실행 후 온보딩/설정 상태 유지 | 통과 | local release APK 0.1.0 (6) 재실행 후 홈, 저장 목적지, 현재 지역명, 하단 탭 상태 유지 확인 |
| D6 | Android 뒤로가기 | 주요 화면에서 예상 경로로 복귀 | 통과 | 출발 탭에서 Android Back 입력 후 홈 탭으로 복귀, crash buffer 비어 있음 |
| D7 | 위치 권한 허용 | 현재 위치 또는 fallback 메시지 표시, 크래시 없음 | 통과 | local release APK 0.1.0 (6)에서 위치 권한 허용 후 홈 상단 실제 지역명 `고양시 덕양구 지축동`, 위치 상태 `현재 위치`, 날씨 카드 표시 확인. crash buffer 비어 있음 |
| D8 | 위치 권한 거부 | 앱 사용 가능, 수동 위치/목적지 흐름 유지 | 통과 | ACCESS_FINE_LOCATION/COARSE_LOCATION revoke 후 홈이 `기본 위치 서울`, 위치 상태 `수동`으로 전환되고 목적지 비교/출발 판단 흐름 유지. crash buffer 비어 있음 |
| D9 | 목적지 검색 | 1순위 국내 장소(Kakao Local 또는 fallback) 검색·저장 확인 후 2순위 해외 장소(Google 또는 fallback) 보조 확인 | 통과 | local release APK 0.1.0 (6)에서 잠실/Tokyo Station 검색·선택·저장 확인. 해외 보조 fixture는 중화권 제외 기준에 맞춰 센트럴 파크로 소스 갱신 |
| D10 | 화면 밀도 | 작은 화면에서 가로 overflow/버튼 잘림/하단 탭 CTA 가림 없음 | 통과 | 실기기 wm size 720x1600 override에서 홈 주요 카드, 하단 탭, 스크롤 접근성 확인. 가로 overflow/CTA 가림 없음. 이후 1084x2412로 원복 |
| D11 | 다크/라이트 | 텍스트 대비와 버튼 상태 정상 | 통과 | cmd uimode night yes/no로 G2 다크/라이트 확인. 텍스트 대비, 버튼, 하단 탭 표시 정상. 캡처 `/tmp/weatheron-qa-g2-dark.png`, `/tmp/weatheron-qa-g2-transport-after.png` 확인. crash log fatal/ANR 패턴 없음 |
| D12 | 네트워크 끊김 | 빈 화면 없이 최근/기본 예보 안내 표시 | 통과 | Wi-Fi/데이터 off 후 Active default network none 상태에서 홈 빈 화면 없음. `최근 예보로 유지 중`, `최근 예보`, `연결 전까지 마지막 예보로 판단 유지` 표시. 네트워크 원복 확인 |
| D13 | 알림 신뢰성 | 알림 권한 허용 후 테스트 알림 예약, 5초 내 수신, 알림 탭 딥링크, 앱 재실행 후 예약 상태 확인 | 통과 | POST_NOTIFICATIONS granted. M2 테스트 알림 발송 후 5초 내 `weatheron:test:1783049994330` 시스템 게시, 제목 `WeatherON 테스트 알림`, route M2 payload 확인. 알림 탭 후 M2 복귀, 테스트 알림 잔존 없음, 재실행 후 `테스트 알림 수신·탭 확인됨`/예약 상태 유지 |
| D14 | 이동수단 드롭다운 | G2에서 이동수단 드롭다운 표시, 수단 선택 즉시 리스트 닫힘, 선택값/계산식 반영 | 통과 | 실기기에서 `자동/도보/자차/대중교통` 옵션과 `대중교통은 배차/환승 변동 가능` 문구 확인. `도보` 선택 후 버튼이 `이동수단 도보, 선택 목록 열기`로 돌아오고 옵션 노드 잔존 없음. 캡처 `/tmp/weatheron-qa-g2-transport-open.png`, `/tmp/weatheron-qa-g2-transport-after.png` |

---

## 4. D9/D13 상세 판정 기준

### D9 목적지 검색 상세 케이스

| 우선순위 | 입력 | 기대 결과 | 판정 증거 |
|---|---|---|---|
| 1 | `잠실` | 국내 장소 결과 표시, 주소/국가/카테고리 확인 가능 | 8건 표시, `석촌호수 서호` 선택 후 `목적지 저장하고 비교` 활성, 저장 후 출발 목록 `송파구` 카드 반영 |
| 1 | `잠실 야구장` | 국내 별칭 검색 결과 표시 | 소스 보정 완료. `잠실/잠실 야구장/잠실종합운동장`은 `잠실야구장` 후보를 우선 병합 |
| 2 | `Tokyo Station` | 일본 장소 결과 표시 | 소스 보정 완료. fixture/Open-Meteo/proxy fallback에서 `도쿄역`, 주소, `JP`, `Asia/Tokyo` 우선 후보 병합 |
| 2 | `도쿄 역` | 한국어 해외 별칭 검색 결과 표시 | 소스 보정 완료. `Tokyo Station` 별칭으로 정규화 |
| 2 | `東京駅` | 현지어 검색 결과 표시 | 소스 보정 완료. `Tokyo Station` 별칭으로 정규화 |
| 2 | `센트럴 파크` | 일반 해외 장소 결과 표시 | 소스 보정 완료. `Central Park`, 주소, `GLOBAL`, `America/New_York` 후보 병합 |

> QA 기준은 국내 장소를 먼저 확인하고 해외/현지어는 보조 확인한다. 이 기준은 테스트 순서일 뿐 앱 화면 문구로 노출하지 않는다.

### D13 알림 신뢰성 상세 케이스

| 단계 | 기대 결과 | 판정 증거 |
|---|---|---|
| 권한 허용 | Android 알림 권한 허용 후 M2에서 권한 정상 표시 | `POST_NOTIFICATIONS granted=true`, M2 `권한 정상`, `예약 완료`, `예약 3건` 확인 |
| 테스트 발송 | 테스트 알림 버튼 탭 후 예약/발송 이력 표시 | `다시 보내기` 탭 후 5초 내 `weatheron:test:*` 게시 확인 |
| 5초 수신 | 5초 내 시스템 알림 수신 | 시스템 목록에서 `weatheron:test:*` 확인, 앱 화면 `스마트 알림 확인됨`/`수신 확인` 갱신 확인 |
| 딥링크 | 알림 탭 시 M2 알림 설정으로 이동 | 알림 탭 후 `스마트 알림 설정` 화면 유지/도착, `탭 확인` 상태 반영 |
| 재실행 | 앱 재실행 후 예약 상태/이력 표시가 깨지지 않음 | local APK 재설치/실행 후 홈 정상 렌더링과 저장 목적지 유지 확인, 테스트 알림 탭 후 `weatheron:test:*` 잔존 없음 |

---

## 5. 실행 순서

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

## 6. 실패 기록

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

## 7. 완료 기준

- D1~D6은 모두 통과해야 다음 store screenshot 캡처 단계로 이동한다.
- D7~D13 중 실패가 있으면 `WeatherON_ANDROID_APK_QA_체크리스트.md`와 이 문서에 같은 build id로 기록한다.
- 치명도 높은 크래시, 빈 화면, 설치 실패가 있으면 새 preview build 전 원인 분석 문서를 추가한다.

---

## 8. 변경 이력

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
| 2026-07-02 | D9 목적지 검색과 D13 알림 신뢰성 상세 판정 기준 추가 |
| 2026-07-02 | D9 검색 보정 및 D13 테스트 알림 dismiss 소스 보강 |
| 2026-07-02 | local release APK `0.1.0 (6)` 기준 D9/D13 재검증 통과. D9 키보드 footer 가림, D13 수신/탭 상태 표시와 테스트 알림 잔존 문제 수정 |
| 2026-07-03 | local release APK `0.1.0 (6)` 재빌드/재설치 후 D7/D8/D10/D11/D12/D13 최신 설치본 기준 재판정 통과. 위치/알림 권한, 네트워크, 화면 크기, 라이트 모드 원복 확인 || 2026-07-03 | 실기기 QA 결과 JSON 반영 |
| 2026-07-04 | local release APK `0.1.0 (6)` 재빌드/재설치 후 홈 목적지 선택 카드와 목적지 정보 3개 카드 확인. G2 이동수단 드롭다운 옵션 표시, 대중교통 안내 문구, 수단 선택 후 자동 닫힘 확인 |
| 2026-07-04 | 실기기 `000841458003652`에서 G1 목적지 요약 카드 축소 UI, G2 도착 희망 시/분 스크롤 선택, 이동수단 드롭다운 자동 닫힘, G2 다크/라이트 색상 대비, crash log fatal/ANR 패턴 없음 확인 |
| 2026-07-08 | local release APK `0.1.0 (7)` 재빌드/재설치 후 홈/출발/신사이바시 상세/MY/권한/스마트 알림 설정 재확인. G2 도착 편집기+이동수단 드롭다운 탭바 겹침 없음, 해외 장거리 도보 시간 미노출, crash/fatal/ANR 패턴 없음 확인 |
| 2026-07-08 | local release APK `0.1.0 (7)` 재빌드/재설치 후 코디 탭 복원 QA. 홈/코디/출발/MY 4탭, C1 추천, C4 상세, 저장 완료 상태, 알림 사이드바 스와이프 닫힘 확인. C4 저장 완료 CTA 하단 여백 이슈 초기 발견 |
| 2026-07-08 | C4 저장 완료 CTA 하단 여백 보정 후 local release APK 재빌드/재설치. 저장 완료 버튼 bottom 1745, 탭바 top 2164로 약 419px 여유 확인. D4-2 통과로 갱신 |
