# P2 보간 수정 전후 실기기 계측 결과

> 자료 보존: `artifacts/` 원자료는 로컬에 보존하며 이번 커밋에는 포함하지 않음. 아래 원자료 상대 링크는 로컬 작업 폴더에서 확인 가능함.

상태: **독립 네이티브 QA 앱의 일반 모션 계측·원자료 검산 완료. CPU 감소 효과는 확인되지 않았음. 성능 개선 통과로 판정하지 않음.** 전체 앱/TestFlight 성능 검증과 구분함.

## 결과

- 다크·맑음의 같은 상태 표시 4쌍: CPU 평균 **11.37→11.40%, +0.03%p**. 쌍별 변화는 −1.17~+1.08%p로 감소/증가가 각각 2쌍임. 한 코어 100% 기준이며, CPU 감소가 일관되게 재현되지 않았음.
- 주 비교 22개 기록의 Core Animation 기록별 평균 FPS 범위: 전 **59.49–59.63**, 후 **59.50–59.63**. 기기 표시의 추정치이며 앱 전용 FPS로 해석하지 않음.
- QA PID에 해당하는 hitch: 전 **0회**, 후 **1회·16.67ms**. 후 다크·흐림에서 관찰됐음. 평균 FPS가 약 60이어도 지연이 없었다고 판정하지 않음.
- 기기 전체 GPU 사용률의 짝별 평균 차이 절댓값 최대 **3.71%p**. 라이트·맑음은 **49.19→52.90%, +3.71%p**였음. 앱 전용 GPU 시간이나 인과적 회귀 증거가 아니며, GPU 부담 증가 없음으로 승인하지 않음.
- 주 비교는 22개, 보완은 2개로 총 24개 기록임. 마지막 보완 쌍은 시작·종료 상태 아이콘이 보이지 않았고 새 실행 세션이므로 주 CPU 비교와 합치지 않았음. 보완 CPU 11.89→11.64%는 별도 관찰값임.

## 날씨·테마별 기본 대조

각 행은 같은 기기·날씨·테마·화면·관측 상태 표시의 전후 한 쌍임. 다크·흐림은 상태 검수를 통과한 교체 쌍임. GPU는 기기 전체, CPU/hitch는 QA 프로세스임.

| 조건 | CPU % 전→후 | CA 평균 FPS 전→후 | 기기 GPU % 전→후 | hitch 전→후 |
|---|---:|---:|---:|---:|
| 다크·맑음 | 12.29 → 11.12 | 59.62 → 59.57 | 50.87 → 50.25 | 0 → 0 |
| 다크·흐림 | 14.67 → 16.03 | 59.49 → 59.62 | 38.30 → 38.19 | 0 → 1 |
| 다크·비 | 34.00 → 34.09 | 59.62 → 59.62 | 38.19 → 38.06 | 0 → 0 |
| 다크·눈 | 37.32 → 35.75 | 59.63 → 59.56 | 38.19 → 38.00 | 0 → 0 |
| 라이트·맑음 | 12.02 → 12.82 | 59.56 → 59.56 | 49.19 → 52.90 | 0 → 0 |
| 라이트·흐림 | 14.49 → 14.39 | 59.51 → 59.63 | 43.75 → 43.94 | 0 → 0 |
| 라이트·비 | 32.19 → 32.82 | 59.62 → 59.51 | 43.94 → 44.00 | 0 → 0 |
| 라이트·눈 | 37.13 → 34.48 | 59.50 → 59.62 | 44.00 → 43.81 | 0 → 0 |

## 다크·맑음 주 비교 반복

같은 초승달 상태 표시와 같은 QA PID 46166에서 비교한 4쌍임. UI 상태 아이콘의 의미를 별도로 확정하지 않았으며, 기호가 바뀌거나 달랐던 쌍은 보수적으로 제외했음. 계획한 반복 중 상태가 달랐던 쌍을 그대로 평균에 넣지 않았음.

| 배치 | CPU 전 % | CPU 후 % | 차이 %p |
|---|---:|---:|---:|
| matrix | 12.29 | 11.12 | -1.17 |
| repeat-2 | 10.98 | 10.95 | -0.03 |
| repeat-3 | 10.79 | 11.01 | +0.22 |
| repeat-4 | 11.43 | 12.51 | +1.08 |

보완 `replacement-clear-final`은 PID 46425의 같은 실행 세션·바탕·텍스처·시계에서 전후를 비교했음. 양쪽 상태 표시가 없었으므로 주 비교와 합치지 않았음. 5쌍을 무조건 합쳐 CPU 개선 수치로 보고하지 않음. 표본·순서·기기 상태 영향을 모두 분리한 인과 실험이 아니며, 작은 효과의 존재/부재를 단정하지 않음.

## 실행물과 조건

- iPhone 16 Pro Max, iOS 27.2, Xcode/Instruments 27.2 (27B52), USB 충전, 물리 화면 1320×2868. `com.weatheron.mobile.ambientqa` 1.0.0 (41), 로컬 Debug 네이티브 + 임베디드 production JS임. 기존 TestFlight Build 58은 변경하지 않았음.
- 수정 전은 가시성 보완 후의 2단계 보간, 수정 후는 1단계 보간임. 최초 가시성 보완 전 소스와의 대조가 아님. 전 `4cd4aff251e95e778e2da8976a2bb159f094241c0b3527c9225254e2d01755f8`, 후 `242ecf4a43d9a1afc63ffc3dffecc28a85aad6c70e671563aeeee9337f817636`. 설치 빌드의 JS·QA 소스 식별은 [build.json](artifacts/ambient-visibility-20261101/performance/focus-controlled-device/build.json)에 보존했음.
- 맑음·흐림·비·눈 × 라이트/다크, 낮/가을 fixture, 바람 3m/s, 강수 2mm, 고정 읽기 영역·스크롤 위치. 저전력/움직임 줄이기는 모두 꺼짐이 시작·종료 캡처에 표시됐음. 실제 공급자 날씨가 아님.
- 사용자 방해금지 설정 확인 후 수집했음. 상태 기호는 실행 중 달라져 전체 기간에 같은 OS 모드가 유지됐다고 주장하지 않음. 각 쌍의 시작/종료 표시가 같은 자료만 비교하고, 마지막 무표시 쌍은 별도 집계했음. 채택한 시작/종료 캡처에 알림 배너는 관찰되지 않았음.
- QA 복사본에서 공통 `AmbientSurfaceBackground`·`AmbientBaseFlow`·네이티브 텍스처·시계를 유지하고 날씨 컴포넌트만 교체했음. 전후 전환 시 텍스처 생성 횟수·크기가 유지됨을 확인했음. 제품 공통 배경은 HEAD와 동일하며, 날씨 소스는 빌드 해시와 일치함.

## 계측·검산·제외

최소 4초 안정화 후 Activity Monitor + Core Animation FPS + Hitches + GPU 구성으로 각 20초 기록을 수집했음. 2–18초의 공통 16초 주기를 분석했음. CPU/hitch는 QA PID로 필터하고, FPS는 기기 표시 추정치, GPU는 기기 전체 사용률로 구분했음. 모든 채택 기록에서 CPU/FPS/GPU coverage 16초, 분석 구간을 포함한 실제 display frame 데이터, 완료 로그, Nominal 열 상태를 검산했음. 24개 XML 재집계와 저장 수치가 같았음. 정지 캡처는 조건 검수에만 사용했음.

최종 배치 30개 중 상태 기호 전환·불일치·일시적 시스템 UI가 보인 3쌍(번호 3/4, 17/18, 27/28) 전체를 제외했음. 성능 수치의 유불리와 구분해 쌍 단위로 제외하고 원자료는 보존했음. [조건 검수](artifacts/ambient-visibility-20261101/performance/focus-controlled-device/condition-review.json)와 [시작/종료 검수 이미지 1](artifacts/ambient-visibility-20261101/performance/focus-controlled-device/headers-01.png), [2](artifacts/ambient-visibility-20261101/performance/focus-controlled-device/headers-02.png), [3](artifacts/ambient-visibility-20261101/performance/focus-controlled-device/headers-03.png), [4](artifacts/ambient-visibility-20261101/performance/focus-controlled-device/headers-04.png), [5](artifacts/ambient-visibility-20261101/performance/focus-controlled-device/headers-05.png) 참조.

번호 14는 기록 저장 후 Mac 임시 디렉터리 할당 실패로 XML 내보내기가 중단됐음. 원본 trace에서 다시 내보내 CPU/FPS/GPU 16초 coverage와 프레임 구간을 확인한 뒤 복구했음. 계측 구간을 다시 만들거나 누락을 0으로 채우지 않았음. 이번 작업의 Xcode 중간 파일 880MB를 정리했고, 닫힌 작업 소유 커널 임시 기록은 원본/해제 스트림 SHA-256 일치를 확인한 gzip으로 보존했음. `.trace` 묶음과 설치 앱은 유지했고, 압축 후 원본 trace 재내보내기도 검증했음. [공간 복구 감사](artifacts/ambient-visibility-20261101/performance/focus-controlled-device/space-recovery.json) 참조. 압축은 각 계측 종료 후 수행했음.

이전 배치의 바탕 재마운트·임의 텍스처 원점 변경, 알림 배너가 섞인 기록은 최종 집계에 합치지 않았음. 기존 +3.22%p 증가 수치와 이번 보간 대조는 기준 소스/조건이 달라 직접 차감하지 않음. 과거 증가 원인은 확정하지 못했음.

## 증거와 한계

[최종 원자료 24개](artifacts/ambient-visibility-20261101/performance/focus-controlled-device/validated-results.json) · [조건별 요약](artifacts/ambient-visibility-20261101/performance/focus-controlled-device/summary.json) · [비교 CSV](artifacts/ambient-visibility-20261101/performance/focus-controlled-device/comparison.csv) · [상태/완료 시각](artifacts/ambient-visibility-20261101/performance/focus-controlled-device/status.json) · [재집계 코드](artifacts/ambient-visibility-20261101/performance/focus-controlled-device/summarize.py).

원시 XML·로그·조건 캡처는 각 조건 폴더에 있으며 원본 trace는 `/private/tmp/weatheron-focus-controlled-traces`에 있음. 기본 수집은 `run.py`, 교체 수집은 `replace_conditions.py` 및 `replace_clear_final.py`를 사용했음. 내보내기 실패 복구는 `matrix/light-rain-after/export-recovered`에 보존했음.

실제 전체 Home/AppNavigator, TestFlight/최종 Release, 저전력·움직임 줄이기에서 이번 변형의 성능, 야간/다른 강도/다른 기기, 장기 발열·배터리, 앱 전용 GPU 시간은 미검증임. 기존 기기 기능 관찰과 이번 일반 모션 계측을 합산하지 않음. CPU 감소·GPU 무회귀·전체 제품 성능 통과로 판정하지 않음.

제품 코드 추가 변경·커밋·push·배포는 하지 않았음. QA 두 프로세스 종료와 화면 유지 해제를 확인했음. 집중 모드는 사용자가 원래 설정으로 돌릴 수 있으며, 원복 완료를 확인했다고 보고하지 않음.
