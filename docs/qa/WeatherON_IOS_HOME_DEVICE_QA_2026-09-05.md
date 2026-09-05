# iOS 홈 실기기 QA — 2026-09-05

## 설치 기준

- 소스: `09d17d564ac38333293f0740e774c1b2df480092` (홈 개선 및 Liquid Glass 변경 포함)
- 기기: iPhone 16 Pro Max, iOS 27.0 (24A5430a)
- 앱: `com.weatheron.mobile`, 1.0.0 (36), 로컬 Debug 빌드. TestFlight 배포본과 구분해야 함.
- `WeatherON.xcworkspace` / `WeatherON` scheme, 기존 DerivedData 재사용.
- 빌드 성공, `codesign --verify --deep --strict` 통과, 기존 데이터를 유지하는 덮어설치 성공.
- 내장 `main.jsbundle`: 5,221,973 bytes, SHA-256 `3f8461f13938db65a3dc9baa11806c25ba0e6ef36993106a1de083eb01962f86`.
- `devicectl --terminate-existing --console`로 재실행. Metro 없이 홈 표시 확인.

## 실기기 관찰

| 항목 | 결과 |
| --- | --- |
| 홈 레이아웃 | 지역명, 큰 기온, 상황 문장, 출발 시간, 코디 카드 표시 확인 |
| 목적지 선택 | 선택 테두리와 출발 시간이 함께 갱신됨. 원래 선택으로 복원함 |
| 하단 탭 | 홈·코디·출발·MY 모두 이동 및 선택 캡슐 위치 확인 |
| 선택 캡슐 드래그 | 홈에서 MY까지 드래그로 전환됨 |
| 밤 배경 | 연속 관찰에서 별의 밝기 변화 확인 |
| 앱 안정성 | 조작 후 동일 앱 프로세스 PID 34881 실행 중. 수집 로그에 fatal/exception 신호 없음 |

iPhone 미러링으로 실제 기기를 조작하고 화면을 확인함. 정지 프레임과 동작 결과에 근거한 검증이며, 전환 전체 영상·FPS·프레임 드롭 수치 측정은 수행하지 않음. 짧은 280ms 전환의 모든 중간 프레임이나 유리 굴절의 세부 품질까지 검증한 결과는 아님.

## 남은 확인

- 미러링 스크롤/당김 입력으로 RefreshControl이 발동하지 않아 `날씨 확인 중이에요 → 방금 확인했어요` 실기기 표시는 미확인. 사용자에게 직접 당김 확인 요청함. 이 결과만으로 앱 새로고침 결함이라고 판정하지 않음.
- iOS 시스템의 동작 줄이기 설정을 바꾼 실기기 검증은 수행하지 않음. 기존 `node scripts/check-ios-home-experience.mjs`의 동작 줄이기·전환 취소·갱신 실패 처리 검사는 통과함.
- 실기기 라이트 모드와 비/눈 상태는 이번 실행에서 확인하지 않음.

## 로컬 증거

- 빌드: `/tmp/weatheron-home-device-build.log` (`BUILD SUCCEEDED`)
- 설치: `/tmp/weatheron-home-device-install.json`
- 실행 로그: `/tmp/weatheron-home-device-console.log`
- 최종 프로세스: `/tmp/weatheron-home-device-processes.json`
- 시각 증거: 해당 작업의 iPhone 미러링 스크린샷 출력.

초기 Debug 경고 배너는 닫고 검증함. 실행 로그에는 Metro 연결 재시도와 기존 BackgroundModes 안내가 있었음. 이 QA에서는 설정을 변경하지 않음. App Store Connect/TestFlight 업로드는 수행하지 않음.
