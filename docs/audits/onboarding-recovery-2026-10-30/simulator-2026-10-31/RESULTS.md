# 전용 시뮬레이터 후속 검증 — 2026-10-31

결과: 실제 권한 검증 미완료. 앱 설치 전 시뮬레이터 OS 부팅/서비스 단계에서 막힘. 앱 코드 추가 수정 없음. 실서비스 계정 작업 없음.

## 이번에 확보한 내용

- 전용 기기: WeatherON-P2-Isolated, 5E30AAAF-2985-4E87-BF3C-96426B829B50, iOS 27.0.
- Xcode Release/arm64, 병렬 2개, ONLY_ACTIVE_ARCH=YES, CODE_SIGNING_ALLOWED=NO로 로컬 QA 빌드 시도함. XcodeBuildMCP 호출은 300초 제한으로 두 차례 종료됨.
- 실제 WeatherON 실행 파일과 main.jsbundle 생성 확인함. 번들 바이트에서 `http://127.0.0.1:1` 격리 API 주소 포함을 assert로 확인함. 빌드 성공 로그·앱 설치 성공·앱 실행 성공은 확보하지 못함.
- 산출물 경로: `apps/mobile/ios/build/p2-derived/Build/Products/Release-iphonesimulator/WeatherON.app`. 프로젝트의 기존 무시된 build 폴더에 있어 후속 실행에 재사용 가능함.
- 빌드 설정에 EXPO_NO_DOTENV=1, EXPO_PUBLIC_ACCOUNT_API_BASE_URL=http://127.0.0.1:1, EXPO_PUBLIC_WEATHER_API_BASE_URL=http://127.0.0.1:1, EXPO_PUBLIC_WEATHER_CLIENT=fixture 지정함.

## 실제 차단 증거

1. 시뮬레이터가 Booted로 보고되지만 `get_app_container`는 15초 제한에서 응답하지 않았음.
2. 앱 설치는 `NSMachErrorDomain code=-308`, `(ipc/mig) server died`로 실패함. 설치되지 않아 launch도 실패함.
3. 전용 기기만 종료 후 재부팅했음. 접근성 연결은 `Timed out creating the simulator remote automation session`으로 실패함.
4. 캡처된 실제 화면은 앱 화면이 아닌 Apple 로고 부팅 화면임: [boot-stuck.jpg](boot-stuck.jpg).
5. 재부팅 뒤 설치 재시도도 응답하지 않았음. 검증 완료로 표시하지 않음. 전용 기기 종료 요청으로 정리함. 다른 시뮬레이터나 CoreSimulator 전역 서비스는 종료하지 않았음.

## 미확인 검사

| 항목 | 상태 |
| --- | --- |
| 위치 허용 / 거절 / 나중에 | 실제 OS 검사 미확인 |
| 알림 허용 / 거절 / 나중에 | 실제 OS 검사 미확인 |
| OS 설정에서 권한 변경 후 앱 복귀 | 미확인 |
| 앱 종료·재시작 후 권한과 온보딩 보존 | 네이티브 미확인. 이전 격리 콜백/SQLite 검사는 별도 근거임 |

## 코드에서만 확인한 후보

실제 권한이 허용된 입력과 이전 M4 gate 거절 결과를 `AppPermissionsScreen.tsx`의 실제 표시 함수에 함께 넣으면, 위치·알림 모두 `거부됨`을 반환했음. 실제 설정 앱 복귀에서는 아직 재현하지 못했으므로 이번 후속 작업에서는 수정하지 않았음. 이후 OS 검증 시 이 안내 상태를 우선 확인할 것.

후속 작업은 위 앱 산출물을 설치·실행하는 단계부터 재개할 수 있음. 부팅 화면과 설치 서비스가 정상화되기 전에는 앱 권한 검증이나 출시 준비 완료의 증거로 사용할 수 없음.
