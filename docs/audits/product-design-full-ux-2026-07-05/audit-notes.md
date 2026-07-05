# WeatherON 전체 UX 리서치 및 실기기 QA

> 작성일: 2026-07-05
> 제품: WeatherON Android MVP
> 대상: 외출 전 날씨, 목적지, 강수/출발 알림을 빠르게 확인하려는 일반 사용자
> 범위: 신규 온보딩, 홈, 목적지/출발, 알림함, MY, 권한, 스마트 알림 설정
> 기기: A142, Android 16, 1084x2412

## 1. 요약

WeatherON의 핵심 UX 방향은 맞음. 홈과 출발 탭은 “오늘 외출 준비”라는 목적이 잘 드러나고, 목적지 없음 상태에서도 다음 행동이 명확함. 알림 권한 흐름도 앱 내 설명 후 OS 권한 요청으로 이어져 Android 13+ 권한 맥락 요청 원칙과 맞음. 다만 출시 전 기준으로는 `WeatherON Dev` 앱명, 신규 사용자에게 보이는 알림 배지/테스트성 알림, 목적지 검색 실입력 검증 미완료가 가장 큰 리스크임. 화면 품질은 전반적으로 안정적이나 온보딩 2/3과 빈 상태 화면에서 세로 밀도와 하단 CTA 위치가 아슬함. 크래시/JS 에러는 앱 PID 기준 0건이었고, 확인 알림은 실제 Android notification manager에 등록됨.

## 2. 공개 근거

- Android 13+는 알림을 기본 off로 두고 앱이 권한 요청 전 맥락을 설명하는 것을 권장함: https://developer.android.com/develop/ui/compose/notifications/notification-permission
- Android vitals는 cold startup 5초 이상, warm startup 2초 이상, hot startup 1.5초 이상을 과도한 시작 시간으로 봄: https://developer.android.com/topic/performance/vitals/launch-time
- Android 런타임 권한은 OS/기기별 차이와 사용자의 사후 권한 변경 때문에 실제 기기 검증이 중요함: https://arxiv.org/abs/2106.13012
- 알림 피로/스팸 문제는 Android 13 알림 권한 변화의 배경으로 공개적으로 반복 언급됨: https://www.wired.com/story/android-13-notifications-permission/

공개 소스는 WeatherON 자체 사용자 불만이 아니라 날씨/알림/권한 UX의 일반 리스크 근거임.

## 3. 실기기 증거

| Step | 화면 | 상태 |
|---|---|---|
| 01 | `screenshots/01-initial.png` | 시작 화면 정상. 상단 여백 과다 |
| 02 | `screenshots/02-onboarding-value.png` | 온보딩 1/3 정상. 카드 밀도 약간 높음 |
| 03 | `screenshots/03-onboarding-style.png` | 온보딩 2/3 정상. 하단 CTA가 네비게이션 바와 가까움 |
| 04 | `screenshots/04-onboarding-destination.png` | 온보딩 3/3 정상. 검색 안내 일부 모호 |
| 05 | `screenshots/05-destination-search.png` | 목적지 검색 진입 정상 |
| 06 | `screenshots/06-destination-search-results.png` | ADB 영문 입력이 한글 IME 조합으로 들어가 결과 0건. 수동 입력 재검증 필요 |
| 07 | `screenshots/07-home-empty-destination.png` | 홈 정상. 목적지 없음 상태 명확 |
| 08 | `screenshots/08-notification-center.png` | 알림함 정상. 신규 상태에서 unread/대기 표현이 혼란 가능 |
| 09 | `screenshots/09-notification-deeplink-result.png` | 알림 항목 탭 후 홈 이동 및 배지 감소 정상 |
| 10 | `screenshots/10-depart-tab.png` | 출발 탭 정상. 빈 상태 하단 여백 큼 |
| 11 | `screenshots/11-my.png` | MY 정상. 관리 항목 구분 가능 |
| 12 | `screenshots/12-permissions.png` | 권한 관리 정상. fallback 설명 좋음 |
| 13 | `screenshots/13-notification-permission-prompt.png` | 앱 내 권한 gate 정상 |
| 14 | `screenshots/14-os-notification-permission.png` | OS 알림 권한 프롬프트 정상. 앱명이 WeatherON Dev로 노출 |
| 15 | `screenshots/15-notification-permission-allowed.png` | 허용 후 상태 반영 정상 |
| 16 | `screenshots/16-notification-test-sent.png` | 수신 확인 예약 상태 표시 |
| 17 | `screenshots/17-notification-test-after-wait.png` | 5초 후에도 화면 상태 문구가 유지되어 완료 피드백 부족 |
| 18 | `screenshots/18-alert-advanced-settings.png` | 고급 설정 접힘/펼침 정상. 기본 UX를 방해하지 않음 |

## 4. 우선순위 이슈

### P0 없음

실기기 순회 중 크래시, 빈 화면, 네비게이션 단절은 발견하지 못함.

### P1. 출시 앱명이 `WeatherON Dev`로 노출됨

- 증거: `screenshots/14-os-notification-permission.png`
- 영향: OS 권한 프롬프트에서 사용자가 개발 빌드로 인식할 수 있음.
- 권장: release label을 `WeatherON`으로 확정하고 D3 내부 문구 노출 항목 해소.

### P1. 목적지 검색 실사용 검증이 아직 약함

- 증거: `screenshots/06-destination-search-results.png`
- 관찰: ADB 입력이 한글 IME 조합으로 들어가 검색 결과 검증이 실패함.
- 해석: 앱 결함으로 단정할 수 없지만, MVP1 핵심인 목적지 저장/출발 알림의 전제라 별도 수동 검증 필요.
- 권장: 실제 손입력으로 `서울역`, `인천공항`, `강남역` 검색-선택-저장-재시작 유지까지 확인.

### P1. 신규 사용자에게 알림 배지/대기 표현이 먼저 보임

- 증거: `screenshots/07-home-empty-destination.png`, `screenshots/08-notification-center.png`
- 관찰: 앱 데이터 초기화 후에도 홈 알림 배지와 알림함 unread가 보임.
- 영향: 권한을 아직 허용하지 않은 사용자가 “이미 놓친 알림이 있다”고 오해할 수 있음.
- 권장: 신규 상태에서는 샘플 알림을 “예시”로 라벨링하거나 배지 카운트에서 제외.

### P2. 온보딩 하단 CTA 안전 여백 부족

- 증거: `screenshots/03-onboarding-style.png`
- 관찰: 큰 화면에서도 `나중에 할게요`가 하단 네비게이션 바에 가까움.
- 영향: 작은 화면/큰 글자 설정에서 버튼 가림 위험.
- 권장: 온보딩 하단 CTA 영역에 safe-area padding 추가, 2/3 단계 카드 수직 밀도 축소.

### P2. 알림 수신 확인 완료 피드백 부족

- 증거: `screenshots/16-notification-test-sent.png`, `screenshots/17-notification-test-after-wait.png`, `notification-dumpsys-weatheron-after-test.txt`
- 관찰: 실제 notification manager에는 `강수 알림`이 등록됐지만 화면은 계속 `스마트 알림 확인 중`으로 보임.
- 영향: 사용자는 알림 발송 완료를 앱 안에서 확인하기 어려움.
- 권장: 예약 후 수신 확인 완료 상태를 별도 체크/완료 카드로 전환.

### P2. 빈 상태 화면의 하단 여백이 큼

- 증거: `screenshots/10-depart-tab.png`
- 영향: 기능이 덜 완성된 느낌을 줄 수 있음.
- 권장: 목적지 없음 상태에서 “샘플 목적지 케어 미리보기” 또는 “테스트할 추천 장소”를 추가하되 기본 저장은 하지 않음.

## 5. 정상 확인

- release APK 빌드 성공: `./gradlew assembleRelease --console=plain`
- 앱 설치 성공: `adb install -r -d .../app-release.apk`
- cold launch `TotalTime: 267ms`
- 앱 PID 기준 크래시/JS 에러 패턴 0건: `logcat-weatheron-pid-errors.txt`
- 알림 권한 허용 후 Android notification manager에 WeatherON 알림 등록 확인: `notification-dumpsys-weatheron-after-test.txt`
- 알림 항목 탭 후 홈 이동 및 unread 배지 감소 확인
- 고급 설정은 접힌 상태로 유지되어 기본 UX를 방해하지 않음

## 6. 기회 맵

### 이번 주 수정

1. release 앱명 `WeatherON Dev` 제거
2. 신규 상태 알림 배지/샘플 알림 정책 정리
3. 알림 수신 확인 완료 피드백 추가
4. 온보딩 2/3 safe-area padding 보강

### 이번 분기 수정

1. 목적지 없음 상태를 더 풍부하게 만들되 자동 저장은 하지 않는 미리보기 제공
2. 목적지 검색 수동 QA 루틴 문서화 및 실제 한국어 검색어 세트 자동/수동 분리
3. 작은 화면/큰 글자 설정 별도 실기기 QA

### 추가 리서치 필요

1. 10~30명 MVP1 테스터가 목적지 검색과 알림 신뢰성을 실제로 이해하는지
2. 알림 빈도/배지 표현이 피로감을 만드는지
3. 비 시작/그침 알림을 실제 외출 판단에 쓰는지

## 7. 핵심 이슈 수정 반영

작성일: 2026-07-05

- `WeatherON Dev` 노출 방지: 기본/preview/production config는 `WeatherON`, development profile만 `WeatherON Dev`로 분리.
- 로컬 release APK 메타데이터 확인: `application-label:'WeatherON'`.
- 신규 사용자 알림 배지 정책: 알림 권한 전 상태는 `권한 전 예시 · 배지 제외`로 표시하고 unread 카운트에서 제외.
- 알림 수신 확인 피드백: 예약 성공 시 `5초 뒤 발송 예약됨`, 화면 문구는 `발송 예약됨 · 잠시 뒤 도착`으로 구분.
- 온보딩 2/3, 3/3 하단 CTA 여백 보강.
- 검증: `check:shared`, mobile `tsc --noEmit`, `check:android-product-quality`, `check:android-build-ready`, `check:android-release`, `gradlew assembleRelease`, `aapt dump badging`, 실기기 APK install 통과.
- 추가 실기기 재덤프: 기기 잠금 해제 후 `post-fix/01-current-focused.*`, `post-fix/02-home.*`, `post-fix/03-notification-sidebar.*` 캡처 완료.
- 재덤프 확인: 홈 알림 버튼은 `알림 열기, 읽지 않음 0개`, 알림 패널은 `권한 전 예시 · 배지 제외`, `권한 전 예시 알림 · 배지 제외`, `예시` 표시 확인.
