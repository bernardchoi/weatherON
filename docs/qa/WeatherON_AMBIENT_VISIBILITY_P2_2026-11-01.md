# P2 날씨 배경 가시성

> 자료 보존: `artifacts/` 원자료는 로컬에 보존하며 이번 커밋에는 포함하지 않음. 아래 원자료 상대 링크는 로컬 작업 폴더에서 확인 가능함.

최신 결과: [보간 전후 실기기 계측 완료](WeatherON_AMBIENT_INTERPOLATION_DEVICE_2026-11-01.md). 주 비교 22개·보완 2개 원자료 검산을 마쳤음. CPU 감소는 확인되지 않았고 GPU 부담 증가 없음으로 판정하지 않음. 아래는 이전 배치의 당시 기록이며 최신 완료 상태와 구분함.

상태: 소스·격리 브라우저·독립 네이티브 레이어 QA 기록 확보. 사용자 지시에 따라 프레임·CPU/GPU는 최종 미검증으로 마무리함. 독립 QA 앱의 수치는 참고 기록이며 성능 통과 판정이 아님. 전체 앱/TestFlight QA는 미완료. 최신 [실기기 후속 보고서](WeatherON_AMBIENT_VISIBILITY_NATIVE_FOLLOWUP_2026-11-01.md) 및 [성능 실측 결과](WeatherON_AMBIENT_PERFORMANCE_2026-11-01.md) 참조.
기준 소스: main `2670d86c863acf19fffb6fc44d611500c65583ad` + 작업 디프. 커밋·배포 수행 안 함.

후속: 햇살의 중복 불투명도 보간만 2단계→1단계로 정리했음. 전후 12쌍 브라우저 캡처가 픽셀 동일했음. CPU 증가 원인은 호출 스택 부재로 미확정이며 실기기 성능 상태는 미검증 유지함. 자세한 근거는 성능 보고서의 후속 조사 절 참조. 기존 아래 캡처·기기 수치는 이 보간 정리 전 소스의 기록임.

## 변경 범위

`AmbientWeatherLayer.tsx`의 기존 표현 값만 수정함.

| 표현 | 조정 | 유지 |
|---|---|---|
| 햇살 | 다크 광원/후광 알파 08→10, 광선 04→08. 라이트 광선 3C→64, 22→40 | 화면 밖 광원, 투명 끝점, 기존 후광·광선 4개, 태양 그림 없음 |
| 구름 | 라이트 중심 알파 C0→E0, 기존 호흡 불투명도 범위 약 .10–.24→.16–.32, 다크 추가 감쇠 /3→/2.5 | 3개 볼륨, 위치·크기·속도 |
| 비 | 1×12→1.25×14, 불투명도 .34→.42 | 입자 수·주기·바람 이동 |
| 눈 | 3×3→4×4, 불투명도 .55→.62, 라이트 잉크 #47758F | 입자 수·주기·바람 이동 |

`AmbientSurfaceBackground`, `AmbientBaseFlow`, `ambientSurface`, `brandPalette`, `ambientWeatherMotion`, Home 호출부와 루트 `HomeAmbientHost`를 확인했음. 공통 바탕/읽기 토큰을 바꾸면 모든 날씨와 다른 화면까지 영향이 가므로 수정하지 않았음. 새 의존성·렌더링 레이어·애니메이션·입자를 추가하지 않았음. Android 별도 배경 경로도 변경하지 않았음.

## 읽기 영역 및 정적 정책

- 비·눈은 실제 읽기 영역과 스크롤 값으로 기존 96.5% 감쇠 유지함. 새 입자 불투명도 상한도 읽기 영역에서 비 .0147, 눈 .0217로 제한됨.
- 넓은 햇살·구름은 기존처럼 읽기 영역과 겹칠 수 있음. 테마별 최대 농도를 모두 겹치는 보수적 계산으로 본문/보조 글자/강조 글자 4.5:1, 액션 색/워드마크 3:1 기준 통과함. 최종 다크 맑음 보조 글자 4.65:1, 강조 글자 4.64:1. 라이트 보조 글자 4.82:1. 실제 화면 전체 및 아이콘의 현장 가독성 검증을 대체하지 않음.
- Reduce Motion·저전력에서 공통 시계 정지/위상 0 복귀 유지함. 정적 위상에서도 비·눈이 남고 읽기 영역 감쇠가 작동하는 검사를 라이트/다크 모두 추가했음.
- Reduce Transparency에서는 기존대로 날씨 레이어 생략함. 이 정책에서 배경 날씨 구분을 새로 강제하지 않았음.

## 비교 기록

[전후 캡처 및 움직임 재생](artifacts/ambient-visibility-20261101/index.html) · [8조건 비교 이미지](artifacts/ambient-visibility-20261101/comparison.png) · [픽셀 변화 기록](artifacts/ambient-visibility-20261101/comparison.json) · [소스 해시](artifacts/ambient-visibility-20261101/source-hashes.json)

동일 Mac의 설치된 Chrome, headless, 440×956, DPR 1. 맑음·흐림·비·눈 × 라이트/다크 8조건. 실제 TSX 레이어와 기존 Animated를 웹 경계로 불러왔음. `experimental_backgroundImage`만 웹 backgroundImage로 연결하고 네이티브 텍스처는 제외했음. 글자·버튼은 읽기 영역 확인용 fixture이며 실제 Home 화면이 아님.

각 조건 전후 공통 위상 0/.25/.5/.75, 읽기 감쇠 오프셋 400 캡처 및 공통 16초 시계의 초반 연속 12프레임을 남겼음. 연속 기록별 실제 캡처 시각은 `*-motion.json`에 있음. 재생 페이지는 기록 프레임을 300ms 간격으로 반복하므로 원래 속도나 프레임 지연을 측정하지 않음. 전후 위상 .5 픽셀 변화는 8조건 모두 확인했음. 화면 전체 평균 채널 차이는 0.29–0.86/255로 조정 폭이 작으며, 이것만으로 체감 가시성이나 성능 개선을 판정하지 않음.

처음 만든 후 캡처는 Vite가 수정 전 모듈을 제공해 전후 차이가 0이었음. 서버 재시작 후 DOM의 다크 구름 위상 0 불투명도 .104(기존 .06)를 확인하고 후 캡처 전부 다시 생성했음. 최종 산출물은 재생성 결과임.

## 1차 검증 결과와 한계

아래 기기 연결 실패는 1차 기록임. 이후 실제 기기 연결 및 독립 네이티브 QA를 진행했으며 후속 보고서에서 증거 범위를 갱신했음.

| 항목 | 결과/근거 |
|---|---|
| TypeScript | `tsc --noEmit -p apps/mobile/tsconfig.json` 통과 |
| 날씨/정적/읽기 감쇠 | `check-ambient-response.mjs` 통과. 정적 위상과 라이트/다크 검사 확장 |
| 라이프사이클/접근성/대비/그라디언트 | `check-ambient-surface-regressions.mjs` 통과. 설치된 RN 파서 사용 |
| 탭 이동/복귀 | `check-home-ambient-host.mjs` 소스 실행 검사 통과: 같은 캔버스, 숨김 정지, 최신 날씨/테마 복귀 |
| 앱 background→active | 소스 하네스 검사 통과. 실제 앱 재진입 미검증 |
| 스크롤 | 네이티브 값 그래프 소스 검사 및 fixture 오프셋 캡처 통과. 실제 앱 스크롤/탭 UI 조작 미검증 |
| 실제 iPhone 저전력·OS Reduce Motion | 미검증. CoreDeviceService 초기화 시간 초과. 권한 범위 밖 재시도도 완료되지 않아 중단 |
| 실제 iPhone 프레임 지연·CPU/GPU·발열 | 미검증. 동일 기기 전후 측정 없음. 정지 캡처나 웹 움직임 기록으로 성능 통과 판정 안 함 |
| 네이티브 그라디언트 그리기/텍스처/VoiceOver | 미검증. 소스·파서 검사는 실제 렌더링/조작 증거가 아님 |
| 배포 후보 QA | Xcode Cloud→TestFlight→동일 iPhone 전후 측정 필요. 빌드/배포 수행 안 함 |

[회귀 로그](artifacts/ambient-visibility-20261101/regression.log), [날씨/읽기 검사](artifacts/ambient-visibility-20261101/response.log), [호스트 검사](artifacts/ambient-visibility-20261101/host.log).

재현용 fixture는 artifacts의 `harness`에 보관함. 프로젝트 루트의 `tmp/ambient-visibility-qa`로 복사 후 `vite --config tmp/ambient-visibility-qa/vite.config.mjs`로 실행 가능함. baseline 소스는 `AmbientWeatherLayer.before.tsx`, 최종 소스는 `AmbientWeatherLayer.after.tsx`로 보관함. 소스 교체 후 서버 재시작이 필요함. 캡처 도구는 설치된 macOS Chrome 경로를 사용하며 네이티브 성능 측정 도구가 아님.
