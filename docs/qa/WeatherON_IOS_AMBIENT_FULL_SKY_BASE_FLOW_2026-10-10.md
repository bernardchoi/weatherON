# iOS Ambient Surface: 기본 흐름·전체 하늘 후속 검증

검증 시각: 2026-10-10 00:51–00:59 KST. 작업 브랜치: `feat/ambient-surface-foundation-home`. 기준 main: `49a628f05649541be4dc1577b18263e606e9af3a`.

## 현재 판정

수정 코드를 iPhone 16 Pro Max / iOS 27.0.1에 설치하고 정상 통합 실행으로 복귀했다. 타입·소스 회귀 검사, ARM64 jobs1 증분 빌드, 서명 검증, 설치·실행은 통과했다. 새 빌드의 **기본 흐름 체감, 손끝 반응, 스크롤 연속성은 사용자 재검증 대기**다. 이전 사용자의 흐름·터치 실패 판정은 새 캡처나 좌표 계산으로 통과 처리하지 않았다. 사용자가 확인한 유성은 이전 빌드의 유성이며, 새 빈 공간 경로 유성은 아직 관찰하지 못했다.

## 디자인 근거와 코드 매핑

- `docs/Project Wind/yokohama_tower_of_winds_ui_design_system.md` §1, §4.1, §6.1–6.4, §10: 환경의 빛·밀도·리듬, UI 테마와 별개인 실제 시간대, 정보 대비, 접근성·전력 정책을 적용했다.
- `docs/Project Wind/perfora_air_v1_1_experimental_addon/docs/01_experimental_direction_brief.md` §3: 실제 데이터와 기존 판단 로직 유지, 텍스트 영역 억제, 풍향·AQI 등 없는 정보를 만들지 않는 기준을 적용했다. 기존 국소 영역 규칙보다 최신 사용자의 전체 배경 희소 별 승인 범위를 우선했다.
- `docs/Project Wind/perfora_air_components_v0_1_package/perfora_air_components_v0_1.md`: 눌림의 국소 빛과 안정화 방향을 참고했다. “기존 흐름에 터치가 합류”는 문서의 직인용이 아니라 최신 사용자 요구를 공유 시계와 독립 접촉 세기로 구현한 해석이다.
- 승인된 104 PNG 페이지 패키지의 최종 iOS core 라이트·다크 이미지와 최종 SVG/문서를 앞선 단계에서 실제 픽셀까지 검수했다. 최종 아이콘 문서는 정적 아이콘 기준이며 런타임 반응 명세로 주장하지 않는다. 기존 애셋은 유지한다.

주요 변경 파일:

| 파일 | 역할 |
| --- | --- |
| `apps/mobile/src/components/AmbientBaseFlow.tsx` | 날씨 입자와 분리한 네이티브 기본 흐름. 두 비대칭 확산 면, 약 35–44초 시계, 수평 62pt·수직 66pt 이동 범위. 텍스트/레이아웃은 움직이지 않음 |
| `apps/mobile/src/components/AmbientSurfaceBackground.tsx` | 실제 측정한 Home 영역, 기본층 단독 개발 실행, 접근성·전력·foreground 정책, 공통 시계 연결 |
| `apps/mobile/src/utils/ambientSky.ts` | 전체 화면 26개 희소 별의 결정적 배치, 읽기 영역 억제, 보호 영역 사이 유성 경로 |
| `apps/mobile/src/components/AmbientWeatherLayer.tsx` | 실제 밤의 전체 하늘, 7개 별만 서로 다른 반짝임, 네이티브 스크롤 값으로 보호 영역 이동. 스크롤 중 별 subtree 제거 없음 |
| `apps/mobile/src/components/AmbientTouchLayer.tsx` | 148pt 국소 빛·밤의 7개 국소 점, 실제 접촉 좌표, 110ms 진입·420ms 안정화, 읽기 영역 억제 |
| `apps/mobile/src/screens/HomeScreen.tsx` | 실제 읽기 영역 측정, 네이티브 Animated.ScrollView, 스크롤 시 접촉만 취소하고 기본층 유지 |
| `apps/mobile/src/utils/ambientWeatherMotion.ts` | 신뢰할 수 없는 날씨 값으로 환경을 만들어내지 않는 기본 흐름 분리 |
| `apps/mobile/src/debug/ambientTouchEvidence.ts` | 개발용 숫자 카운터·정책만 기록. 좌표·날씨·계정 데이터 기록 없음 |
| `apps/mobile/ios/WeatherON/LiquidGlassNavigationView.swift` | DEBUG 전용 기본층 단독 실행 인자와 현재 저전력 정책 전달 |
| `scripts/check-ambient-response.mjs`, `scripts/check-ambient-surface-regressions.mjs` | 실제 JSX·핸들러·네이티브 값 그래프 회귀 검증 |

빛의 기본층은 iOS에서 날씨 종류와 독립적으로 존재한다. 날씨 표현은 기존 신뢰 가능한 서비스 데이터만 사용한다. 낮·황혼·밤의 의미를 UI 테마로 결정하지 않는다. Reduce Motion·Reduce Transparency·저전력·백그라운드에서는 정적 대체/정지 정책을 적용한다. Android 화면의 전면 전환은 하지 않았다.

## 실제 실행 증거

증거 루트: `local-evidence/`. 모든 아래 전체 화면 PNG는 실제 iPhone 실행 캡처다.

| 증거 | 확인 범위 |
| --- | --- |
| `ios-ambient-base-isolated-0.png` (00:51:02), `ios-ambient-base-isolated-1.png` (00:51:54) | 52초 간격 기본층 단독 화면. 별·날씨 입자·터치층 제외, 실제 날씨 정보와 정적 아이콘 유지. 두 이미지 픽셀 검수. 정지 캡처만으로 연속 움직임의 체감을 입증하지 않음 |
| `ios-ambient-base-isolated-policy.json` | 저전력·Reduce Motion·Reduce Transparency 모두 false. 정책이 기본 흐름을 막고 있지 않음 |
| `ios-ambient-full-sky-settled.png` (00:59:19) | 정상 통합 실행의 최신 전체 화면, 실제 맑음·16°, 기존 사용자 목적지·출발 설정 유지 (개인 명칭·시각 생략) |
| `ios-ambient-full-sky-settled-input.json` | down/move/up/cancel/measured 모두 0. 이번 관찰에 새 사용자 터치 입력이 없어 실제 터치 통과를 주장할 수 없음 |
| `ios-ambient-settled-forecast-pixel-crop.png`, `ios-ambient-settled-wordmark-pixel-crop.png` | 전체 캡처의 원본 픽셀 일부를 크기 변경 없이 추출. 축소 뷰에서 불분명했던 “예보”와 WeatherON 글자가 원본에서 정상임을 확인 |

최신 전체 PNG SHA-256: `54149aa3322e568079497a2e62ceadf4b7517ff09e71452efe3734fb59174522`.

코드상 별은 26개지만 읽기 영역 억제로 실제 캡처에서 강하게 보이는 별은 hero 오른쪽 빈 공간의 일부다. 전체 26개가 눈에 띈다고 보고하지 않는다. 새 유성 경로·라이트 밤·강수 표현은 이번 실기기 캡처에서 확인하지 못했다. 연속 동영상 캡처는 제공된 장치 CLI가 지원하지 않아 확보하지 못했다.

기본층 단독 모드는 DEBUG 인자 `--weatheron-ambient-base-only`로만 켜진다. 정상 인자 없는 실행으로 이미 복귀했으며 사용자 설정이나 저장 데이터는 변경하지 않았다. 숫자 진단 파일은 앱의 `Library/Caches/ambient-home-touch-debug-20261010.json` 단일 파일이다.

## 검사 결과와 실제 오류 복구

- PASS: 모바일 TypeScript noEmit; 64개 라이트/다크 × 시간대 × 날씨 fixture와 실제 JSX 검사; 접촉 hold/move/up/cancel/비동기 측정, 네이티브 capture 등록, 스크롤 취소·읽기 영역 그래프, 별 subtree 유지.
- PASS: 실제 기본층/터치층 로딩과 native gradient 검사, 기본층 이동 범위, 기본층 단독 분리, lifecycle·foreground 재생 방지, 접근성·저전력 정책. 보수적 읽기 영역 대비 계산: 다크 본문 7.83/보조 5.16/버튼 4.71, 라이트 12.52/5.37/4.57. 이는 실제 기기의 전체 접근성 감사를 대신하지 않는다.
- PASS: 실제 Home hero 글자 크기 1/1.6/2 및 viewport 회귀, localization native exports 90 consumers, iOS reliability 76 SQL 실패 지점·알림/날씨 race 검사, 날씨·코디 회귀, git diff whitespace 검사.
- PASS: 직렬 ARM64 jobs1 증분 빌드 및 codesign 검증, 기존 bundle에 설치, 정상 Home 재진입. Android 빌드·Xcode Cloud 실행 없음.
- 최초 이 증분 빌드는 컴파일 성공 후 실제 실행에서 `Cannot read property 'layout' of null`이 발생했다. React updater가 실행되기 전에 pooled LayoutChangeEvent가 해제된 원인이었다. `nativeEvent.layout`을 동기 복사한 뒤 updater에 전달하도록 수정했다. 실제 handler에서 event를 null로 만든 뒤 지연 updater를 실행하는 회귀 검사를 추가·통과했다. 오류 캡처 `ios-ambient-base-only-0.png`는 실패 증거로 보존하며 성공 기본층 증거로 사용하지 않는다.
- 복구 변경 때문에 증분 빌드를 한 번 더 수행했다. 이번 변경의 빌드는 총 두 번, 순차 실행이며 clean·동시 빌드·변경 없는 반복 빌드는 없었다. 복구 후 redbox는 관찰되지 않았다.

최종 설치 Hermes bundle SHA-256: `6923bbe2ddc86b28cd3efc4797d5b602daee03e5aa94e2405679998604a47d61`.
복구 빌드 로그: `ios-ambient-full-sky-pooled-event-repair-build.log`. 설치 결과: `ios-ambient-full-sky-repaired-install.json`. 정상 실행 로그: `ios-ambient-full-sky-repaired-console.log`.

## 남은 실제 확인

사용자에게 현재 설치본의 무입력 기본 흐름, 빈 공간에서 누른 채 이동 후 놓기, 위아래 스크롤 및 재진입을 확인받아야 한다. 이전 빌드의 유성 가시성 PASS는 새 기본 흐름/터치/스크롤 PASS가 아니다. 최신 라이트 밤·황혼·강수, 접근성/전력 정책은 소스 검사 통과이고 실기기 조합 확인은 미완료다. 그 결과가 오기 전 재설치나 추가 빌드를 반복하지 않는다.

공통 기반·Home 범위만 작업했다. 코디·외출/목적지·마이/설정·온보딩 전면 전환, 커밋·푸시·main 병합·배포는 수행하지 않았다. 앱 삭제/초기화, 서명·인증·보안 설정 변경, 자동 빌드 설정 복원, 새 의존성 추가도 수행하지 않았다.
