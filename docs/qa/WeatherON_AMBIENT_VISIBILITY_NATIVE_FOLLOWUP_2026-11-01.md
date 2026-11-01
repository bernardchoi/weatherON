# P2 실기기 후속 검증

> 자료 보존: `artifacts/` 원자료는 로컬에 보존하며 이번 커밋에는 포함하지 않음. 아래 원자료 상대 링크는 로컬 작업 폴더에서 확인 가능함.

최신 결과: [보간 전후 실기기 계측 완료](WeatherON_AMBIENT_INTERPOLATION_DEVICE_2026-11-01.md). 주 비교 22개·보완 2개 원자료 검산을 마쳤음. CPU 감소는 확인되지 않았고 GPU 부담 증가 없음으로 판정하지 않음. 아래는 이전 배치의 당시 기록이며 최신 완료 상태와 구분함.

독립 네이티브 레이어 QA 및 일반 모션 참고 수치를 확보했음. 사용자 지시에 따라 프레임·CPU/GPU 최종 검증 상태는 미검증으로 마무리함. 최신 [프레임·CPU/GPU 실측 결과](WeatherON_AMBIENT_PERFORMANCE_2026-11-01.md) 참조. 전체 앱/TestFlight QA는 미완료임.

## 실제 실행물

- 같은 iPhone 16 Pro Max, iOS 27.2 (24B119), 로컬 Xcode 27.2 (27B52).
- 기존 TestFlight `com.weatheron.mobile` 1.0.0 (58)은 유지했음. MY→홈 복귀를 관찰했으나 이번 수정본의 결과로 합산하지 않았음.
- 독립 `com.weatheron.mobile.ambientqa` 1.0.0 (41), 표시명 WeatherON Ambient QA를 개발 서명으로 빌드·설치·실행했음. **TestFlight 배포 후보가 아님.**
- 같은 네이티브 바이너리 안에서 before/after 버튼으로 실제 `AmbientSurfaceBackground`와 `AmbientBaseFlow`를 사용하고, `AmbientWeatherLayer`만 저장된 수정 전/현재 소스로 바꿨음. 실제 네이티브 텍스처도 포함함.
- QA용 복사 프로젝트만 bundle ID·표시명·권한을 분리하고 위젯 임베딩을 제외했음. 원본 프로젝트·원본 앱 데이터·공용 App Group 데이터를 변경하지 않았음. fixture는 실제 Home UI나 AppNavigator가 아님.
- [빌드 식별/번들 해시](artifacts/ambient-visibility-20261101/native-followup/build.json), [소스 해시](artifacts/ambient-visibility-20261101/native-followup/manifest.json), [빌드 결과](artifacts/ambient-visibility-20261101/native-followup/build.log), [fixture 소스](artifacts/ambient-visibility-20261101/native-followup/ambient-qa.tsx).

## 같은 기기 비교

[실기기 전후 비교·움직임 기록](artifacts/ambient-visibility-20261101/native-followup/index.html) · [감소 효과 8조건 비교 이미지](artifacts/ambient-visibility-20261101/native-followup/static-comparison.png) · [캡처 시각](artifacts/ambient-visibility-20261101/native-followup/captures.json)

미러링 창을 같은 크기로 유지한 612×1354 캡처임. 기기 원본 해상도의 스크린샷과 구분함.

| 조건 | 결과 |
|---|---|
| 일반 모션: 맑음·흐림·비·눈 × 라이트/다크 | 같은 기기에서 전후 8조건 관찰·캡처. 각 before/after 6프레임 연속 기록. native phase의 시간 동기화는 하지 않았으므로 픽셀 강도/속도 개선 수치를 도출하지 않음 |
| OS 저전력 켜짐 | 설정 화면과 앱 `lowPower true`, `reduceMotion false` 확인. 전후 8조건의 위상 0 정적 표현 유지 관찰·캡처 |
| OS 움직임 줄이기 켜짐 | 설정 화면과 앱 `reduceMotion true`, `lowPower false` 확인. 전후 8조건의 위상 0 정적 표현 유지 관찰·캡처 |
| 글자·버튼 | fixture의 본문·보조 글자·버튼을 양 테마에서 읽을 수 있었음. 실제 Home 전체 UI/아이콘/보조 기술 검증으로 확대하지 않음 |
| 배경 숨김·재노출 | 독립 앱에서 before/after 각각 `onScreen` 제어 시 배경 숨김과 복귀 확인. 실제 탭 내비게이션과 구분함 |
| 앱 재진입 | 독립 QA 앱의 before/after 각각 홈 화면으로 나갔다가 아이콘으로 복귀했을 때 렌더 재개 확인. 강제 종료 후 냉시작/전체 앱 복구와 구분함 |
| 스크롤 | 제스처 시도했으나 콘텐츠의 실제 이동을 확인하지 못했음. 통과 처리하지 않음. 기존 소스 값 그래프 테스트만 통과 상태 |

미러링 캡처는 정지 상태에서도 압축에 따른 미세한 픽셀 차이가 있었음. 저전력 정지 관찰 구간의 배경 crop 평균 채널 차이도 0.172/255였음. 따라서 [프레임 픽셀 기록](artifacts/ambient-visibility-20261101/native-followup/frame-comparison.json)은 재생/자료 점검용이며, 정지 여부·프레임률·hitch·CPU/GPU 부담의 증거로 사용하지 않았음. 정적 정책 판정은 OS 상태 전달, 기존 시계 정지 코드, 정적 날씨 표현 관찰을 함께 본 제한된 결과임.

## 성능 계측 시도

최신 상태: 잠금 해제된 실제 기본 디스플레이에서 22개 유효 기록을 수집·검산했음. 다크·맑음 CPU 증가가 재측정에서도 관찰돼 동일 성능으로 일괄 판정하지 않았음. [성능 계측 후속 기록](WeatherON_AMBIENT_PERFORMANCE_2026-11-01.md) 참조. 아래 연결 실패는 이전 시도 기록임.

처음에는 네트워크 연결에서 앱 이름/PID로 Instruments 연결을 시도했음. 이후 사용자가 USB를 연결했고 `xcdevice`에서 같은 기기의 `interface usb`, `available true`를 확인했음. USB 상태에서 같은 QA PID로 Time Profiler를 재시도했지만 exit 13, `Timed out waiting for device to boot`로 실패했음. [계측 시도 로그](artifacts/ambient-visibility-20261101/native-followup/profiler.log).

위 초기 시도에서는 유효한 CPU/GPU·프레임 지연·발열 대조 측정이 없었음. 이후 확보한 최신 수치는 성능 실측 결과 보고서에 분리했음. USB 연결 전후의 조건을 합쳐 성능을 비교하지 않았으며, 미러링 움직임/정지 캡처/빌드 성공을 성능 통과로 보고하지 않았음.

## 설정 복원과 남은 항목

- 저전력과 움직임 줄이기를 모두 원래 꺼짐으로 복원했음. 설정 캡처와 QA 앱의 `lowPower false · reduceMotion false`로 확인했음. 적응형 전력/알림, 프레임률 제한 등 다른 설정은 변경하지 않았음.
- USB 연결 과정에서 iPhone 사용으로 미러링이 끊겼음. 해당 시점 캡처 4개는 [session-notes.json](artifacts/ambient-visibility-20261101/native-followup/session-notes.json)에 제외 대상으로 표시했음. 이후 정상 상태의 숨김/복귀 및 재진입을 별도로 다시 확인했음.
- 남음: 수정본 실제 전체 앱의 스크롤·탭 이동·재진입, 실제 Home 글자·아이콘·버튼 가독성, VoiceOver, 전체 앱에서 같은 기기·같은 조건의 CPU/GPU·프레임 지연 측정. 독립 QA 앱의 일반 모션 수치는 별도 실측 완료했음.
- 배포 후보 QA는 사용자 지침대로 Xcode Cloud→TestFlight 빌드로 수행해야 함. 이번 작업에서는 커밋·push·Xcode Cloud/TestFlight 배포·스토어 제출을 수행하지 않았음.

독립 QA 앱과 임시 빌드 경로 `/private/tmp/weatheron-ambient-device`, `/private/tmp/weatheron-ambient-device-derived`는 재현을 위해 남겼음.
