# iOS 맑은 낮: 아이콘 패널 제거·배경 햇살 수정

기준 커밋: `003606266ce68cbf4b9e55834fdc20916008db63`. 브랜치: `feat/ambient-surface-foundation-home`. 검증일: 2026-10-10. 이번 후속 변경은 미커밋이며 푸시하지 않았다.

## 판정

실제 iPhone 16 Pro Max / iOS 27.0.1 라이트 Home에서 아이콘 뒤 네모가 제거되고 28pt 보조 아이콘이 짧은 상태 문구 옆에 표시됨을 확인했다. 타입·관련 소스 회귀, Xcode 27 ARM64 jobs1 증분 빌드·기존 서명 검증·덮어설치·정상 Home 실행은 통과했다.

**Ambient Surface 전체 완성도와 실제 연속 움직임·터치 체감은 완료가 아니다.** 현재 배경은 승인 시안보다 미세한 빛결·색층 깊이·입상감이 부족하다. 최종 다크 낮의 실기기 캡처와 사용자 터치/스크롤·맑은 낮 햇살 체감은 재검증 대기다. 이전 흐름/터치 실패를 이번 캡처나 빌드 성공으로 통과 처리하지 않았다.

## 실제 원인

사용자 첨부 `IMG_6996.PNG` / `IMG_6997.PNG`를 공식 Library 흐름으로 소비자 Mac에 직접 내려받아 실제 픽셀을 확인했다. 라이트 직사각형·다크 모서리가 잘린 패널은 투명한 태양 PNG의 배경이 아니다. `AmbientWeatherLayer`가 아이콘의 126pt 측정 영역 안에 더 큰 단색 광원을 넣고 `overflow: hidden`으로 잘랐기 때문이다. 광원은 아이콘 뒤 패널처럼 보였고 상태 아이콘도 72pt로 남아 있었다.

원인은 실제 애셋 투명 픽셀과 이전 JSX의 클리핑/크기 그래프를 대조해 확인했다. 새 아이콘/배경 검사를 이전 커밋의 실제 소스에 적용하면 각각 보조 아이콘 누락·28pt 아이콘 영역을 440pt 배경 대신 사용한 실패가 재현된다. 수정 소스에서 통과한다. 첨부 정지화면 자체로 이전 애니메이션 부재를 단정하지 않는다.

## 수정 범위

- `HomeScreen.tsx`: iOS 날씨 아이콘은 상태 문구 옆 28pt로 배치. 오른쪽 126pt 전용 프레임 및 아이콘 위치에 묶인 날씨 측정을 제거. 기온·상태·최고/최저·준비 문장·실제 목적지·코디·예보/선택 행동을 유지.
- `AmbientWeatherLayer.tsx`: 맑은 낮/황혼 햇살은 실제 Home 전체 배경에서 투명 끝점을 가진 확산 빛으로 표현. UI 테마와 낮밤을 별개로 판단. 다크 낮에서도 태양·햇살이며 밤 맑음만 기존 별/유성 경로를 사용한다. 불확실한 시각/날씨로 햇살을 만들지 않는다.
- 기존 흐림/강수도 아이콘 프레임에 결박되지 않도록 같은 배경 영역을 사용하며, 구름에는 단색 잘린 면 대신 확산 그라데이션을 사용했다. 기존 강수 입자는 실제 읽기 영역 및 네이티브 스크롤 값에 따라 억제한다. 효과 종류·다른 화면·API·권한·의존성을 추가하지 않았다.
- `ambientSurface.ts`: 햇살과 겹쳐도 읽히도록 iOS Home 행동색과 워드마크 색을 같은 기존 팔레트 안에서 미세 보정.
- 기존 `AmbientBaseFlow`·`AmbientTouchLayer`, 네이티브 전력 전달, 읽기/스크롤 구조는 유지. 공통 네이티브 시계와 배경·Reduce Motion·Reduce Transparency·저전력 정지 정책의 회귀 검사 통과.

근거: `docs/Project Wind/yokohama_tower_of_winds_ui_design_system.md` §1/§4.1/§6/§10, 제품 전용 `perfora_air_v1_1_experimental_addon/docs/01_experimental_direction_brief.md`의 실제 데이터·시간과 테마 분리·Text First 규칙. 최신 사용자 합의가 초기 국소 날씨 표현 범위보다 우선한다.

## 승인 시안 대비 실제 차이

최종 core iOS 라이트/다크 v3 원본을 직접 픽셀 확인했다. 승인 보드는 비 예시이며 현재 실제 맑음에 그 비를 복제하지 않는다.

| 항목 | 원본 시안 | 최종 실제 라이트 Home |
| --- | --- | --- |
| 빛의 깊이·색층 | 여러 미세한 밝기층과 불균일한 빛결 | 큰 청백색 확산 면이 중심. 세밀한 깊이는 아직 부족 |
| 질감 | 미세 입상감과 국소 밀도 변화가 강함 | 런타임 질감은 더 부드럽고 가시성이 약함. 동등 판정 없음 |
| 보조 날씨 정보 | 기온·짧은 상태가 중심 | 작은 아이콘+맑음 상태로 재배치, 불필요한 패널 제거 |
| 본문·기능 | 안정된 읽기면 | 본문은 고정, 실제 정보·기존 조작 유지. 실기기 전체 접근성 감사는 미완료 |
| 연속 경험 | 정지 시안은 모션 증거가 아님 | 두 정지 캡처의 차이만 확인. 주목성/연속성/손끝 반응 통과를 주장하지 않음 |

## 검사·적용 증거

검사: 모바일 TypeScript noEmit, 실제 Home JSX의 28pt 상태 아이콘·번역/큰 글자, 64개 명시된 날씨/시간대 fixture, 실제 native gradient parser 및 기본층/터치 lifecycle, 밤 전체 별 subtree/스크롤 억제, 새 낮 햇살의 투명 경계/배경 크기/공통 시계, 기존 강수 읽기 억제, viewport, localization native exports 90 consumers, diff whitespace 모두 통과. Fixture는 실제 날씨·기기 제스처 증거가 아니다.

보수적 최대 합성 대비(맑은 낮): 다크 본문 6.93/보조 4.57/행동 문구 5.13, 라이트 본문 12.52/보조 5.37/행동 문구 4.88. 기존 흐림/비/눈/폭우 조건도 검사했다. 이 계산은 실제 VoiceOver·저시력/장시간 경험 검증을 대신하지 않는다.

증분 빌드는 순차 2회였다. 첫 실제 라이트 적용에서 햇살이 넓은 회색 기운으로 섞여 보여, 맑은 낮의 색만 청백색에 가까운 빛으로 보정한 뒤 두 번째 빌드했다. 두 빌드 모두 성공했고 마지막 빌드의 codesign 검증·같은 bundle ID 덮어설치·정상 Home 딥링크 실행을 확인했다. clean·동시빌드·동일 소스 반복빌드·앱 삭제/초기화·서명/권한/계정 설정 변경 없음. Android·Xcode Cloud·배포 작업 없음.

최종 설치 Hermes bundle SHA-256: `4766c322ebc859db4ce0a3e61f427f4a401913265928528179e0d797886d07b5`.

로컬 증거는 저장소 밖 `local-evidence/`에만 보존한다. 원본 전체 캡처는 사적 장소/목적지 정보가 포함되므로 이 보고서에는 그 이름·주소·계획 시각을 복제하지 않는다.

- `weatheron-sun-correction-build.log`, `weatheron-sun-color-repair-build.log`: 첫 수정/실제 픽셀 후 색 보정 빌드.
- `weatheron-sun-repaired-install.json`, `weatheron-sun-repaired-launch.json`: 최종 설치 및 정상 실행 성공.
- `weatheron-sun-repaired-home-0.png`, `weatheron-sun-repaired-home-1.png`: 최종 설치본의 실제 맑은 낮 라이트 Home. 네모 없음, 보조 아이콘+상태 표시, 정상 읽기/코디 화면. 두 캡처 모두 새 redbox는 관찰되지 않음.
- `weatheron-sun-repaired-policy.json`: 저전력·Reduce Motion·Reduce Transparency 모두 false. down/move/up/cancel/measured 모두 0으로 새 사용자 입력의 통과 증거 없음.
- `weatheron-sun-repaired-temporal-pixels.json`: 원본 픽셀의 텍스트/사진/독립 시스템 UI를 피한 오른쪽 빈 영역에서 시간차를 측정. 이는 배경 전체의 움직임 원인 분리나 체감 증거가 아니다.
- `weatheron-sun-repaired-flow.json`: 실제 20초 녹화 1회 시도는 기기의 Screen Recording capability 미지원(CoreDeviceError 1001)으로 실패. 녹화 파일 없음. 미러링도 iPhone 사용 중이라 정상 UI 입력이 불가했다. 권한 변경/우회 없음.

두 최종 캡처 간격: 37.78초. 빈 영역 평균 채널 변화(0–255)는 0.483, 0.506, 0.574이며 매우 작다. **실제로 눈에 잘 들어오는 연속 햇살이라고 판정할 수 없다.**

`weatheron-sun-repaired-home-0.png` SHA-256: `366d0c4778c265a58517030f35e725cd50a66f29d7116b258d3a7fe1392fb035`.

`weatheron-sun-repaired-home-1.png` SHA-256: `f4db3a4b6d9cc9fc629cd66782d24b67b73d162d2a0ca903220de06e016d219f`.

## 남은 확인

맑은 낮의 라이트·다크에서 승인 시안에 가까운 빛의 깊이/색층/질감과 가독성, 무입력 시간 흐름의 실제 주목성·연속성, 누른 채 이동/놓기·스크롤·재진입을 사용자 실기기에서 확인해야 한다. 이번 결과는 사용자가 지적한 패널/아이콘 구조의 수정이며 Ambient Surface 경험 완성 선언이 아니다. 검증 결과 없이 빌드·재설치를 반복하지 않는다.
