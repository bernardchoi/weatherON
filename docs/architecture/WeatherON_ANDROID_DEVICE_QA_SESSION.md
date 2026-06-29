# WeatherON Android Device QA Session

> 목적: 최신 Android preview APK 실기기 재설치 QA 결과를 한 세션 단위로 기록한다.
> 기준일: 2026-06-29

---

## 1. QA 대상

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
| 네트워크 | Wi-Fi / 모바일 데이터 / 오프라인 재검증 |
| 설치 방식 | npm run install:android-preview-apk / ADB install |
| 테스트 일시 | 2026-06-29 00:41 KST |

---

## 3. 필수 판정

| ID | 항목 | 기대 결과 | 결과 | 메모 |
|---|---|---|---|---|
| D1 | APK 설치 | 설치 성공, 경고 후 계속 설치 가능 | 통과 | ADB install 완료, 패키지 com.weatheron.mobile 설치 확인 |
| D2 | 첫 실행 | 크래시 없이 온보딩 진입 | 통과 | MainActivity 실행, 앱 프로세스 유지, crash log buffer 비어 있음 |
| D3 | 내부 문구 노출 | `H1`, `Guest`, `READY`, `OUTER` 같은 개발 문구 미노출 | 실패 | 소셜 화면에 MVP, Weather Note, Solar/Rain/Mist 문구 노출. 819b APK에는 로컬 수정 미반영 |
| D4 | 홈 진입 | 홈 카드, 코디, 우산, 알림, 하단탭 표시 | 통과 | 홈 카드, 워드마크, 코디 이미지, 목적지 CTA, 하단탭 표시 정상 |
| D4-1 | 하단 탭 IA | 목업 기준 `홈/코디/출발/MY/소셜` 표시, `우산/강수` 직접 탭 없음 | 통과 | 하단 탭 홈/코디/출발/MY/소셜 구성 확인 |
| D4-2 | 소셜 탭 | 하단 `소셜` 탭 진입 시 `ON Square` 체크인/컴패니언 화면 표시, 알림센터로 바로 열리지 않음 | 통과 | 소셜 탭에서 ON Square 체크인/컴패니언 화면 표시 |
| D5 | 상태 저장 | 앱 완전 종료/재실행 후 온보딩/설정 상태 유지 | 보류 | force-stop 후 홈 상태 유지는 확인. 목적지 저장 상태 재확인은 미실행 |
| D6 | Android 뒤로가기 | 주요 화면에서 예상 경로로 복귀 | 통과 | 소셜 탭에서 Android 뒤로가기 후 홈 화면 복귀, 크래시 없음 |
| D7 | 위치 권한 허용 | 현재 위치 또는 fallback 메시지 표시, 크래시 없음 | 통과 | 현재 위치 사용 중, 현재 위치 반영, 날씨 연결됨 표시 |
| D8 | 위치 권한 거부 | 앱 사용 가능, 수동 위치/목적지 흐름 유지 | 통과 | 위치 권한 revoke 후 기본 위치 서울 성수동 fallback, 날씨/코디 유지, 크래시 없음. 권한은 QA 후 재허용 |
| D9 | 목적지 검색 | Kakao Local 결과 또는 fallback 결과 표시 | 보류 | 목적지 목록/미리보기 화면은 정상. 검색 입력 플로우는 이번 자동 QA에서 미실행 |
| D10 | 화면 밀도 | 작은 화면에서 가로 overflow/버튼 잘림 없음 | 실패 | 1084x2412에서 주요 화면은 표시되나 하단 고정 탭이 코디 하단 콘텐츠를 일부 가림 |
| D11 | 다크/라이트 | 텍스트 대비와 버튼 상태 정상 | 통과 | 시스템 라이트 모드 전환 후 홈 주요 텍스트/카드/버튼 대비 정상, 크래시 없음. QA 후 다크 모드 복구 |
| D12 | 네트워크 끊김 | 빈 화면 없이 캐시/fallback 안내 표시 | 통과 | Wi-Fi/모바일 데이터 차단 후에도 홈/코디 UI 유지, 빈 화면/크래시 없음. 오프라인인데 연결됨으로 남는 문구는 UX 개선 후보 |

---

## 4. 실행 순서

1. `npm run check:android-adb-ready`로 ADB 연결과 화면 크기를 확인한다.
2. `npm run install:android-preview-apk`로 최신 APK artifact를 실기기에 재설치한다.
3. 앱 데이터를 초기화한 뒤 첫 실행 D1~D4-2를 확인한다.
4. 목적지 1개를 저장하고 앱을 완전 종료/재실행해 D5를 확인한다.
5. 권한 허용/거부, 네트워크 끊김, Wi-Fi/LTE 전환을 확인한다.
6. 통과 화면은 스토어 스크린샷 후보로 캡처한다.
7. 실패가 있으면 아래 실패 기록에 같은 build id로 남긴다.

스토어 스크린샷 후보 캡처는 화면을 직접 연 뒤 아래 명령으로 저장한다.

```bash
npm run capture:android-store-screenshot -- phone-01-home.png
```

QA 결과는 JSON으로 일괄 반영할 수 있다.

| 파일 | 목적 |
|---|---|
| `WeatherON_ANDROID_DEVICE_QA_RESULTS.example.json` | D1~D12 결과 입력 샘플 |
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
| 2026-06-28 | O3/H1 위치 권한 | 권한 팝업은 표시되나 실제 위치 좌표/현재 위치 날씨가 반영되지 않음 | 실기기에서 위치 권한 허용 후 홈 확인 | High | 권한 완료 핸들러가 실제 GPS 요청 대신 기본 위치를 세팅하던 문제 수정. 새 preview APK 재빌드 필요 |
| 2026-06-28 | H1 홈 | `현재 위치 재확인 중`과 `날씨 갱신 실패`가 함께 노출됨 | `419e3d2c-135b-41a1-88f6-3321ad5115f1` 설치 후 홈 확인 | High | APK가 localhost weather proxy를 바라보지 않도록 runtime fallback 방어 추가. live weather는 public HTTPS proxy 필요 |
| 2026-06-28 | S1 소셜 | `MVP`, `Weather Note`, `Solar/Rain/Mist` 문구 노출 | `819b6cba-7757-48a3-9f8e-92a4efd9c17c` 설치 후 소셜 탭 확인 | Medium | 소스 수정 완료. 새 preview APK에서 D3 재검증 필요 |
| 2026-06-28 | O2 코디 | 하단 고정 탭이 코디 화면 하단 액션을 일부 가림 | `819b6cba-7757-48a3-9f8e-92a4efd9c17c` 설치 후 코디 탭 확인 | Medium | 소스 수정 완료. 새 preview APK에서 D10 재검증 필요 |
| 2026-06-28 | O2 코디 | 시간대 판단 시간이 ISO 원문으로 줄바꿈 표시됨 | web export 코디 스크롤 화면 확인 | Low | `08:00`, `09:00`, `12:00` 표시로 수정 완료. 새 preview APK에서 확인 필요 |
| 2026-06-29 | H1 홈 | 오프라인 상태에서도 `날씨 연결됨` 문구가 유지됨 | `819b6cba-7757-48a3-9f8e-92a4efd9c17c` 설치 후 Wi-Fi/모바일 데이터 차단 | Low | 빈 화면/크래시 없음. 오프라인 상태 문구 개선 필요 |

---

## 6. 완료 기준

- D1~D6은 모두 통과해야 다음 store screenshot 캡처 단계로 이동한다.
- D7~D12 중 실패가 있으면 `WeatherON_ANDROID_APK_QA_체크리스트.md`와 이 문서에 같은 build id로 기록한다.
- 치명도 높은 크래시, 빈 화면, 설치 실패가 있으면 새 preview build 전 원인 분석 문서를 추가한다.

---

## 7. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-06-27 | 최신 APK `8a0b9f32-260b-4b64-b335-b4b30113b3a1` 기준 실기기 QA 세션 문서 추가 |
| 2026-06-28 | 최신 APK `deb142d7-a9a8-44e5-85ba-6eb0e5b0dd95` 기준으로 갱신, 하단 탭 IA 항목 추가 |
| 2026-06-28 | 최신 APK 재설치 QA 실행 순서 추가 |
| 2026-06-28 | 하단 `소셜` 탭 `S1 ON Square` 분리 QA 항목 추가 |
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
