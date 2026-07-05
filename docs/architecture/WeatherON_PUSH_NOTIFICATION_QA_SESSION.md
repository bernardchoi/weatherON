# WeatherON Push Notification QA Session

## 1. 범위

| 항목 | 상태 | 증거 |
| --- | --- | --- |
| 실제 기기 설치 | 통과 | `000841458003652`, `com.mvp.weatheron/.MainActivity` |
| 최신 release APK 빌드 | 통과 | `./gradlew :app:assembleRelease --console=plain`, 2026-07-04 21:30 KST |
| 실제 기기 알림 권한 | 통과 | `POST_NOTIFICATIONS: granted=true` |
| 확인 알림 수신 | 통과 | 앱 UI `확인 알림 수신 확인됨`, system notification key `weatheron:test:1783164105758` |
| 알림 정시성 | 통과 | 예약 id 시각 20:21:45.758 KST, notification update 20:21:51.257 KST, 약 5.5초 |
| 실패 케이스 문구 | 통과 | 권한 revoke 후 `알림 권한 필요`, `권한 확인 필요 · 스마트 알림 관리`, `알림 설정` 확인 |
| 확인 알림 클릭 딥링크 | 통과 | notification key `weatheron:test:1783164705089` 탭 후 M2 `스마트 알림 설정` 이동 |
| H3 알림함 클릭 딥링크 | 통과 | notification key `weatheron:test:H3:1783167761610` 탭 후 H3 `알림 센터` 이동 |
| H5 강수 알림 클릭 딥링크 | 통과 | notification key `weatheron:test:H5:1783167583026` 탭 후 H5 `강수 타임라인` 이동 |
| G2 목적지 알림 클릭 딥링크 | 통과 | notification key `weatheron:smart:destination-change:google-ChIJf6ZNmBDnAGARzJXusFHTcn4` 탭 후 G2 `신사이바시역` 이동 |

## 2. 기기/빌드

| 항목 | 값 |
| --- | --- |
| 기기 serial | `000841458003652` |
| Android | `16` |
| 패키지 | `com.mvp.weatheron` |
| Activity | `com.mvp.weatheron/.MainActivity` |
| version | `0.1.0 (6)` |
| APK | `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` |
| APK sha256 | `521c4f02ec9fbdfcda9e4834b7881124f5699b243b0097a0529b38ccb98d72b1` |

## 3. 실행 로그 요약

```text
adb devices
000841458003652 device

./gradlew :app:assembleRelease --console=plain
BUILD SUCCESSFUL in 16s

adb -s 000841458003652 install -r -d apps/mobile/android/app/build/outputs/apk/release/app-release.apk
Success

adb -s 000841458003652 shell dumpsys package com.mvp.weatheron
versionCode=6
versionName=0.1.0
android.permission.POST_NOTIFICATIONS: granted=true
```

## 4. 수신/정시성 증거

| 이벤트 | 시각 |
| --- | --- |
| QA 화면 기준 발송 시작 | 2026-07-04 20:21:33 KST |
| test notification identifier | `weatheron:test:1783164105758` |
| identifier 기준 예약 생성 | 2026-07-04 20:21:45.758 KST |
| system notification update | 2026-07-04 20:21:51.257 KST |
| 앱 UI 수신 상태 확인 | 2026-07-04 20:22:04 KST |

확인된 UI 문구:

```text
스마트 알림 확인됨
확인 알림 수신 확인됨
수신 확인 · 수신 확인됨
확인 알림 다시 보내기
```

확인된 system notification key:

```text
0|com.mvp.weatheron|0|weatheron:test:1783164105758|10299
0|com.mvp.weatheron|0|weatheron:smart:rain-1h|10299
```

## 5. 실패 케이스/복구 문구

권한 거부 재현:

```text
adb -s 000841458003652 shell pm revoke com.mvp.weatheron android.permission.POST_NOTIFICATIONS
```

확인된 권한 상태:

```text
android.permission.POST_NOTIFICATIONS: granted=false
```

확인된 UI 문구:

```text
목적지 저장 전 · 수동 위치 · 알림 권한 필요
위치 수동 · 알림 설정
권한 확인 필요 · 스마트 알림 관리
알림 설정
```

복구:

```text
adb -s 000841458003652 shell pm grant com.mvp.weatheron android.permission.POST_NOTIFICATIONS
```

최종 권한 상태:

```text
android.permission.POST_NOTIFICATIONS: granted=true
```

## 6. 알림 클릭 딥링크

알림 셰이드 열람/탭은 사용자 승인 후 진행함.

M2에서 route별 QA 알림 발송을 추가해 실제 OS 알림 수신/클릭으로 H3/H5를 단독 검증함. 테스트 알림 identifier에 route를 포함하고, 응답 payload가 비어도 identifier에서 route를 복구함.

### 6.1 M2 확인 알림 클릭

확인 알림 재발송:

```text
2026-07-04 20:31:47 KST
```

수신 확인:

```text
0|com.mvp.weatheron|0|weatheron:test:1783164705089|10299
```

알림 셰이드에서 확인된 WeatherON 알림:

```text
WeatherON 확인 알림
알림을 누르면 스마트 알림 설정으로 이동함
```

탭 후 확인된 화면 문구:

```text
스마트 알림 설정
스마트 알림 확인됨
확인 알림 수신 확인됨
수신 확인 · 수신 확인됨
```

결론:

- M2 딥링크 이동 통과.

### 6.2 H3 알림함 클릭

발송:

```text
2026-07-04 21:22:30 KST
```

수신 확인:

```text
2026-07-04 21:23:13 KST
0|com.mvp.weatheron|0|weatheron:test:H3:1783167761610|10299
```

알림 셰이드에서 확인된 WeatherON 알림:

```text
WeatherON 알림함 확인
알림을 누르면 알림함으로 이동함
```

탭 후 확인된 화면 문구:

```text
알림 센터
3개 활성 · 읽지 않음 1개
알림을 열면 관련 화면으로 이동하고 읽음 상태가 남음
WeatherON 확인 알림
열림 · 알림 센터 이동
```

결론:

- H3 딥링크 이동 통과.

### 6.3 H5 강수 알림 클릭

앱 재기동 후 M2 예약 상태:

```text
예약 완료 · 예약 1건
```

수신 시각/키:

```text
2026-07-04 20:38:40 KST
0|com.mvp.weatheron|0|weatheron:smart:rain-1h|10299
```

알림 셰이드에서 확인된 WeatherON 알림:

```text
강수 알림
비 시작 전 미리 알림
```

탭 후 확인된 화면 문구:

```text
강수 타임라인
뚜렷한 비 예보 없음
시작
최대
그침
30분 단위 강수량
외출 가이드
```

결론:

- H5 딥링크 이동 통과.

추가로 route별 QA 알림에서도 검증함:

```text
발송: 2026-07-04 21:19:30 KST
수신: 2026-07-04 21:20:00 KST
0|com.mvp.weatheron|0|weatheron:test:H5:1783167583026|10299
```

탭 후 확인된 화면 문구:

```text
강수 타임라인
뚜렷한 비 예보 없음
30분 단위 강수량
외출 가이드
```

### 6.4 G2 목적지 알림 클릭

목적지 저장:

```text
검색어: Shinsaibashi station
선택 결과: 신사이바시역
저장 후 화면: 신사이바시역 · 목적지 기준 알림 미리보기
```

G2 진입 후 확인된 화면 문구:

```text
신사이바시역
목적지 기준 알림 미리보기
출발시간 역산
케어 ON
날씨 비교 · 알림
강수 30% → 6% · 12:00/12:30/12:40
```

목적지 저장 후 실제 목적지 알림 수신:

```text
0|com.mvp.weatheron|0|weatheron:smart:destination-change:google-ChIJf6ZNmBDnAGARzJXusFHTcn4|10299
```

알림 셰이드에서 확인된 WeatherON 알림:

```text
신사이바시역 알림
강수 99% · 출발 60분 전 알림
```

탭 후 확인된 화면 문구:

```text
신사이바시역
목적지 기준 알림 미리보기
출발시간 역산
케어 ON
날씨 비교 · 알림
```

결론:

- G2 딥링크 이동 통과.
