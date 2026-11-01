# P2 프레임·CPU/GPU 실측 결과 — 2026-11-01

> 자료 보존: `artifacts/` 원자료는 로컬에 보존하며 이번 커밋에는 포함하지 않음. 아래 원자료 상대 링크는 로컬 작업 폴더에서 확인 가능함.

최신 결과: [보간 전후 실기기 계측 완료](WeatherON_AMBIENT_INTERPOLATION_DEVICE_2026-11-01.md). 주 비교 22개·보완 2개 원자료 검산을 마쳤음. CPU 감소는 확인되지 않았고 GPU 부담 증가 없음으로 판정하지 않음. 아래는 이전 배치의 당시 기록이며 최신 완료 상태와 구분함.

최종 검증 상태: **프레임·CPU/GPU 미검증으로 마무리함.** USB 연결 후 Instruments 오류로 미검증 마무리해 달라는 사용자 지시를 적용함. 아래 독립 QA 앱의 제한된 측정 자료는 참고 기록으로 보존하며, 제품 성능 검증 통과 근거로 사용하지 않음. CPU까지 동일한 성능이라고 판정하지 않음.

## CPU 증가 후속 조사 및 최소 수정

최종 상태는 프레임·CPU/GPU **실기기 미검증**으로 유지함. 아래 기존 수치는 후속 수정 전 소스에 대한 참고 기록이며, 현재 소스의 성능 증거가 아님. 이번 후속에서는 기기 실행·계측·배포를 수행하지 않았음.

- 다크·맑음의 가시성 수정 전후 차이는 4개 그라디언트의 색 알파뿐이었음. 레이어 수·크기·이동 속도·네이티브 공통 시계·불투명도 곡선은 같았음. `AmbientSurfaceBackground`, `AmbientBaseFlow`, 호출부·토큰에는 이 조건의 추가 실행 분기가 없었음.
- 설치된 React Native의 `RCTViewComponentView.mm`은 배경 이미지 등의 변경 시 그라디언트 레이어를 재생성함. `RCTRadialGradient.mm`은 `CAGradientLayer`를 사용함. 현재 햇살은 고정된 그라디언트에 네이티브 opacity/transform만 적용하며 매 프레임 색·레이아웃을 갱신하지 않음. 알파 증가가 CPU 증가를 일으켰다는 호출 스택 증거는 없음.
- 기존 Activity Monitor/FPS/Hitches/GPU 자료에는 CPU 함수별 호출 스택이 없어 +3.22%p의 원인을 확정할 수 없음. before→after 고정 순서의 소수 단기 기록으로 알파·합성 비용과 실행 순서/기기 상태 영향을 분리할 수 없음. **CPU 증가 원인은 미확정임.**
- 코드에서 확인한 불필요한 계산은 `phase → wave → opacity`의 2단계 보간임. `phase → opacity` 1단계로 합쳤음. 이 중복은 기존 소스에도 있었으므로 CPU 증가의 새 원인으로 주장하지 않음. 햇살 경로의 보간 노드 1개를 줄이는 최소 정리이며 +3.22%p 해소를 보장하지 않음.
- 알파·색·크기·레이어·속도·이동 경로를 유지했음. 새로운 캐시/래스터화 옵션·의존성·입자를 추가하지 않았음. Reduce Motion/저전력의 위상 0 정지 정책도 유지함.

검증: 기존 In-app browser로 다크·맑음 fixture를 우선 확인했음. 같은 Chrome·440×956·DPR 1에서 라이트/다크 × 위상 0/.125/.25/.5/.75/1의 전후 12쌍을 반복 캡처함. 12쌍 모두 변경 채널 0개, 그라디언트·transform·불투명도 동일했음. 네이티브 텍스처를 제외한 격리 브라우저 가시성 증거이며 성능 증거가 아님. 낮/해질녘 × 라이트/다크 × 101개 위상의 기존 밝기 곡선 동등성 검사(404개), TypeScript, ambient response/surface regression/Home host 검사를 통과했음.

[전후 캡처 비교 JSON](artifacts/ambient-visibility-20261101/interpolation-followup/comparison.json) · [수정 전](artifacts/ambient-visibility-20261101/interpolation-followup/before/dark-0.5.png) · [수정 후](artifacts/ambient-visibility-20261101/interpolation-followup/after/dark-0.5.png) · [후속 소스 해시](artifacts/ambient-visibility-20261101/interpolation-followup/source-hashes.json) · [회귀 로그](artifacts/ambient-visibility-20261101/interpolation-followup/regression.log).

## 결과

- Core Animation 평균 FPS 범위: 수정 전 59.44–59.68, 수정 후 59.51–59.63. 양쪽 모두 약 60 FPS였음.
- 1차 8조건의 QA 앱 hitch는 전후 각각 1회, 각각 16.67ms였음. 전: 라이트·흐림, 후: 다크·눈. 다크·눈 재측정에서는 양쪽 모두 0회였음. 최초 hitch 기록을 지우거나 0으로 합치지 않았음.
- 기기 GPU 평균 사용률의 전후 차이 절댓값은 1차 최대 0.42%p, 재측정 최대 0.75%p였음. 앱 전용 GPU 시간이 아니라 기기 전체 사용률임.
- CPU는 조건별·반복별 변동이 있었음. 라이트·흐림의 1차 14.96→21.00%는 재측정 20.45→20.55%로 큰 차이가 재현되지 않았음.
- **다크·맑음의 CPU 증가 방향은 재측정에서도 관찰됐음.** 1차 10.90→15.07%, 재측정 11.67→14.89%(+3.22%p). 이 조건을 ‘부담 증가 없음’으로 판정하지 않음. CPU는 한 코어 100% 기준임.
- 모든 유효 기록의 열 상태는 Nominal이었음. 관찰한 CPU 1초 표본 최고값은 59.72%였음.

## 1차 동일 조건 대조

| 조건 | CPU % 전→후 | FPS 전→후 | 기기 GPU % 전→후 | hitch 전→후 |
|---|---:|---:|---:|---:|
| 라이트·맑음 | 16.49 → 15.36 | 59.62 → 59.56 | 47.88 → 47.46 | 0 → 0 |
| 라이트·흐림 | 14.96 → 21.00 | 59.44 → 59.62 | 43.94 → 43.94 | 1 → 0 |
| 라이트·비 | 49.07 → 48.45 | 59.57 → 59.62 | 44.13 → 44.00 | 0 → 0 |
| 라이트·눈 | 52.26 → 52.46 | 59.56 → 59.51 | 44.00 → 44.00 | 0 → 0 |
| 다크·맑음 | 10.90 → 15.07 | 59.57 → 59.57 | 50.13 → 50.13 | 0 → 0 |
| 다크·흐림 | 21.97 → 13.39 | 59.68 → 59.57 | 38.19 → 38.30 | 0 → 0 |
| 다크·비 | 48.17 → 34.20 | 59.51 → 59.63 | 38.19 → 38.25 | 0 → 0 |
| 다크·눈 | 51.35 → 51.44 | 59.56 → 59.56 | 38.18 → 38.30 | 0 → 1 |

## 관심 조건 재측정

| 조건 | CPU % 전→후 | FPS 전→후 | 기기 GPU % 전→후 | hitch 전→후 |
|---|---:|---:|---:|---:|
| 라이트·흐림 | 20.45 → 20.55 | 59.57 → 59.56 | 44.00 → 43.94 | 0 → 0 |
| 다크·맑음 | 11.67 → 14.89 | 59.62 → 59.57 | 50.19 → 50.19 | 0 → 0 |
| 다크·눈 | 55.44 → 51.18 | 59.49 → 59.56 | 38.81 → 38.06 | 0 → 0 |

## 측정 범위와 방법

- 동일 iPhone 16 Pro Max, iOS 27.2 (24B119), Xcode/Instruments 27.2 (27B52). USB 연결·충전 상태 유지. 미러링을 종료하고 잠금 해제된 실제 기본 디스플레이 1320×2868에서 QA 앱을 전경에 유지했음.
- 독립 `com.weatheron.mobile.ambientqa` 1.0.0 (41), 같은 네이티브 바이너리/PID 44920의 before/after 컴포넌트 사용. 로컬 Debug 네이티브 빌드 + 임베디드 production JS임. 기존 TestFlight Build 58은 유지했음.
- 날씨는 명시적 fixture. 실제 공급자 날씨·예보가 아님. 낮/가을, 바람 3m/s, 강수 2mm, 같은 크기·읽기 영역. 라이트/다크와 맑음/흐림/비/눈을 고정했음. 저전력과 움직임 줄이기는 모두 꺼짐 상태였음.
- 실행 URL 허용 목록으로 조건을 지정한 뒤 최소 4초 안정화. 공통 16초 애니메이션 주기를 포함하도록 각 20초 기록에서 2–18초 구간만 시간 가중 집계했음. 각 유효 기록의 CPU/FPS coverage는 정확히 16초였음.
- Activity Monitor + Core Animation FPS + Hitches + GPU 구성으로 기기를 기록하고 **CPU/hitch는 QA PID만 필터**했음. PID 직접 선택이 불안정해 기기 단위 수집을 사용했음. 두 변형 모두 같은 계측 구성을 적용했음.
- GPU는 기기 전체 하드웨어 사용률이고 FPS는 Core Animation 추정 렌더링 수치임. hitch는 해당 QA PID의 실제 계측 이벤트임. 정지 캡처를 성능 증거로 사용하지 않았음.
- CPU 단위는 실제 누적 CPU time 차이/구간 duration과 대조 검산했음. 예: 보고 표본 46.5831%, CPU time으로 유도한 값 46.5865%. XML id/ref와 단위를 해석했고 누락 표본을 0으로 채우지 않았음.
- 잠금 화면 FPS 0, 개별 PID 선택 시도, 1.10초 후 연결이 종료된 사전 기록, 시작/저장 실패 기록은 최종 대조에서 제외했음. 완결된 시간 제한 기록·coverage·프레임 수명 데이터·열 상태를 확인한 22개만 결과로 사용했음.

## 증거와 재현

[1차 원자료 JSON](artifacts/ambient-visibility-20261101/performance/all-process-filtered/results.json) · [재측정 JSON](artifacts/ambient-visibility-20261101/performance/repeat/results.json) · [비교 CSV](artifacts/ambient-visibility-20261101/performance/comparison.csv) · [빌드/소스 식별](artifacts/ambient-visibility-20261101/performance/status.json).

각 조건 폴더에 실제 화면 `screen.png`, 원시 XML, `metrics.json`, 기록 로그가 있음. raw trace는 `/private/tmp/weatheron-p2-performance-all`과 `/private/tmp/weatheron-p2-performance-repeat`에 보존했음. 수집 로직은 [collect.py](artifacts/ambient-visibility-20261101/performance/collect.py), 집계 로직은 [analyze.py](artifacts/ambient-visibility-20261101/performance/analyze.py)임. 두 배치의 ROOT/TRACES 경로를 각각 지정해 실행했으며 기존 trace를 덮어쓰지 않았음.

## 남은 범위

실제 전체 Home/AppNavigator, TestFlight/최종 Release 바이너리, 다른 기기·강수 강도·야간 조건의 성능으로 일반화하지 않음. 저전력/움직임 줄이기의 기기 동작 관찰은 기존 [네이티브 후속 보고서](WeatherON_AMBIENT_VISIBILITY_NATIVE_FOLLOWUP_2026-11-01.md)에 별도 기록돼 있으며, 이번 CPU/GPU 수치는 일반 모션 조건임. 단기·소수 반복 자료로 인과적 성능 개선이나 CPU 무회귀를 단정하지 않음.

제품 코드 추가 변경·커밋·push·배포·스토어 제출은 수행하지 않았음. 계측용 앱 종료로 앱 실행 중 화면 유지 기능을 해제했음. OS 자동 잠금·저전력·움직임 줄이기 설정은 변경하지 않았음.
