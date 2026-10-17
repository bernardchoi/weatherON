# Ambient iOS 변경 커밋 전 검증 — 2026-10-11

기준: `feat/ambient-surface-foundation-home` / `0e804e5dad1747628a25c73c14d95238b23f3de1`.

## 포함 범위

- 코디 목록의 이미지/간격, 상세의 최대 네 품목 비교 rail과 좁은 폭/큰 글자 줄바꿈 fallback, 옷장 빈 상태 간격.
- 출발의 선택 목적지 Glass 강조와 저장된 세 목적지 유지, 목적지별 날씨 누락·이전 관측·시간별 예보 누락 안내. 상세 정보 밀도 조정과 iOS 요약 문구 줄바꿈.
- 하나의 전역 Ambient 캔버스와 연속 native clock, 읽기 화면의 입자 억제, 비활성 화면 콘텐츠/터치/접근성 차단. 홈/코디/목적지의 날씨 문맥 구분, provider가 실제 제공한 안개/뇌우 및 강수 근거 사용.
- 터치 주변의 별도 원형 효과 대신 기존 빛/깊이 면 변형. 수직 스크롤·route 변경 시 관찰만 취소하고 responder를 취득하지 않음. Reduce Motion/Transparency·저전력·백그라운드 기존 정책 유지.
- 별도 iOS `WeatherON-Ambient-B.icon` 및 Debug/Release 기본 아이콘 연결. 구형 애셋과 Android 런처 애셋 보존.
- 새/분리된 UI 문구 11개를 영어·일본어 catalog에 추가하고 사용하지 않는 반복 문구 2개 제거. 기존 번역 값 보존.

## 최종 검사

- 모바일 TypeScript noEmit 통과.
- Ambient shared context, surface/대비, response, home host 회귀 통과.
- native navigation의 MY/account/policy push/pop·취소·tab reset·뒤로가기 계약 및 실제 route wrapper의 비활성 콘텐츠/포인터/접근성 차단 통과.
- outfit text clipping, today outfit, outfit/departure policy contracts, destination limit, 실제 코디·출발·MY 상호작용 검사 통과.
- shared rules, iOS reliability, correctness batch, weather/outfit regressions, review regressions, Android product quality 통과.
- localization 2,187개 메시지 및 placeholder 검사 통과.
- Xcode 프로젝트 plist 파싱, 원본 SVG 5개 일치, 4개 그룹의 light/dark 매핑, Debug/Release 새 아이콘 연결, diff whitespace 통과.
- 최초 실패한 navigation 검사는 구형 화면별 불투명 배경을 강제하고 있었다. 현재 단일 캔버스의 실제 wrapper 행동 검사로 교체했다. presentation 검사는 목적지 날씨 필드 확장만 허용하며 기존 계산 정책을 계속 대조하고 누락/fallback/stale 분기를 추가 검증했다. 독립 옷장 필터는 이미 승인된 `0e804e5` 기준과 일치한다.
- 원래 미커밋/미추적 소스 23개는 이번 정리 전후 SHA256이 동일하다. 추가 변경은 검사 보완, 번역, 아이콘과 QA 기록이다. 원본 화면·기기 식별자·설치 로그·로컬 QA 프로젝트·빌드 산출물·개인 절대 경로는 커밋에서 제외했다.

## 빌드 및 실기기 근거의 경계

- 최종 번역을 포함한 Xcode 27 Debug ARM64 Mac 증분 빌드·서명 검증 성공. 새 아이콘 기본 연결 확인.
- 최종 Mac `main.jsbundle` SHA256: `cefe6db6c45436c0e253c4e5366f151b579a16c3921353da0e7ab68d924e5511`.
- 앞선 iPhone 설치/홈 화면 아이콘 검증 번들은 `f18351c2c393c4022a9fab5d701d9b3fcc98a00081f022903c59cccd0d42c893`. 아이콘 및 기능 소스는 같고 이후 영어·일본어 catalog만 보완됐다. 최종 번역 번들은 재설치하지 않았으므로 최종 전체 diff의 실기기 검증 완료로 주장하지 않는다.
- 실제 손끝 반응의 자연스러움은 사용자 확인 완료. 새 dark 앱 아이콘은 실제 iPhone 홈 화면에서 확인 완료. 상세 근거는 `WeatherON_IOS_AMBIENT_B_ICON_2026-10-11.md`.
- tinted 시스템 자동 변형은 대비가 낮으며 최종 품질 PASS가 아니다. 모든 모드/OS/글자 크기/전환·제스처의 실기기 PASS를 뜻하지 않는다.
- Live Activity 사용자 검증은 다음 날 예정이며 완료하지 않았다. 큰 글자 이슈는 사용자 우선순위상 후순위다.
- 앞선 USB 충전+미러링+Debug 혼합 조건에서 thermalState serious가 관찰됐지만 원인은 확정되지 않았다. 사용자가 발열 측정/대응을 보류했으므로 이번에는 프로파일링·스트레스·보호코드 변경·기기 재설치를 하지 않았다.
- 로컬 개발 빌드이며 Xcode Cloud/TestFlight 배포 후보 검증을 대신하지 않는다.

## main 평가 기준

확인한 원격 main은 `49a628f05649541be4dc1577b18263e606e9af3a`이며 작업 기준 feature의 조상이다. 이번 커밋 전 7개 커밋이 앞서 있고 main 쪽 별도 커밋은 없어 충돌 없이 통합 가능한 계보다. 단, 범위는 아이콘만이 아니라 기존 Ambient 화면·내비게이션·날씨 문맥 전체다.

main에 이미 있는 Source checks는 main push/PR/수동 실행, Android APK는 수동 실행이다. 이번 작업은 워크플로·자동 빌드·배포 설정을 변경하지 않는다. Xcode Cloud의 실제 서버 workflow trigger 설정은 저장소 파일만으로 확정할 수 없다.

feature 보존·다음 개발에는 main 병합이 필수는 아니다. 출시 기준 main 통합은 원격 CI 성공과 미검증 항목의 명시적 수용/추가 QA 후 권장한다. 이번에는 main 병합과 PR 생성을 수행하지 않는다. 실제 push SHA 및 원격 CI 상태는 푸시 후 별도 보고한다.
