# iOS 코디 온도 존재 여부 — 2026-10-10

## 승인과 원인

사용자 승인에 따라 코디 온도 누락 처리를 수정했다. 기준 HEAD b957702d와 기존 미게시 Home 목적지 행·루트 Ambient 유지 변경을 보존했다. 커밋·푸시는 수행하지 않았다.

WeatherKit 어댑터는 누락 온도를 다른 값 또는 0으로 대체하면서 feelsLikeAvailable/tempAvailable로 실제 존재 여부를 별도 전달한다. buildTodayOutfit은 유한 숫자만 검사하여 대체 0을 현재 체감으로 사용할 수 있었다. `check-today-outfit.mjs`에 누락 플래그가 false인 0도 입력을 추가했고 기존 코드에서 currentAvailable=true로 실패함을 확인한 뒤 수정했다.

## 최종 정책

- WeatherKit은 해당 존재 플래그가 true이고 숫자가 유한할 때만 온도로 사용한다. 다른 공급자는 명시적 false를 존중하며 기존 숫자 계약을 유지한다.
- 실제 체감을 우선하고, 체감만 없으면 실제 기온을 사용하며 ‘현재 기온 기준’으로 구분한다. 실제 0도와 음수도 유효한 온도다.
- 둘 다 없으면 숫자·온도 기반 품목·현재 차림 유지를 전제하는 시간 조언을 유보한다. 관측 신뢰도와 온도 가용성을 분리하여 유효한 남은 시간 예보, 비·눈·자외선·먼지 안내를 불필요하게 제거하지 않는다.
- 위치의 오늘 남은 시간 범위, 관측 시각, 실제 stale/cache/unverified 정책을 유지한다. 온도 누락 자체를 오래된 자료로 표시하지 않는다.
- 상세 온도 타일도 같은 선택값을 사용하고 누락 시 ‘확인 필요’, stale 시 ‘최근 관측 기준’을 표시한다.
- 공유 recommendOutfit의 네 번째 옵션을 iOS today 경로만 사용한다. Android/base state, 목적지·내일 화면 등 기존 3인자 호출의 동작은 유지한다. 품목 유보를 타입으로 표현하고 위젯의 빈 품목 소비도 안전하게 처리했다.

## 검사

PASS: 실제 WeatherKit 어댑터→오늘 코디의 누락 0도, true 플래그 실제 0도, 기온만 존재하는 0/30도, undefined/false 플래그, 비유한 온도, 비·눈·UV·예보 유지, stale 구분, 기존 공유 호출. 실제 상세 타일 함수도 실행하여 누락 숫자 숨김·기온 기준·실제 0도·stale 표시를 확인했다.

PASS: TypeScript noEmit, shared-rules, weather-outfit-regressions, home-outing, home-return, ios-widget-sync, home-plan-width, home-ambient-host, installed native-module 검사, native localization exports(94 consumers), KO/EN/JA localization(2,175 messages), git diff --check.

## 빌드·설치와 직접 실기기 확인

기존 프로파일 및 DerivedData에서 Debug iphoneos ARM64 ONLY_ACTIVE_ARCH=YES jobs=1 증분 빌드 1회 성공. codesign strict 확인 후 앱 데이터 삭제 없이 설치·일반 실행했다.

설치 JS bundle SHA-256: `4ac46947bbe05448219981814dcb0bc825daba06c3e836eaf002e7c507c7cc8a`.

정상화된 iPhone 미러링을 직접 조작하여 Home→코디→상세→코디→Home 왕복 확인. 실제 정상 공급자 응답에서 현재 18도·흐림, 상세 체감 온도 18도·현재 체감 기준, 오늘 남은 시간 범위와 관측 시각 및 강수·바람 정보가 표시됐다. 홈 복귀 후 기존 목적지 이름·펼침 버튼·출발 시각과 Ambient/유리 패널 유지도 확인했다. 상세 진입 중 슬라이드 프레임은 전환 완료 캡처와 구분했다.

누락·기온만 존재하는 응답은 자동 회귀 검사로 검증했으며 해당 응답을 실제 기기에 강제하지 않았다. 기기 설정·권한·테스트 데이터·테마 override를 변경하거나 추가하지 않았다. 새 녹화 도구나 권한을 시도하지 않았다. 이번 정지 캡처를 프레임 단위 모션 전체 PASS로 주장하지 않는다.

빌드·설치·실행 로그와 해시는 Git 외부 `../evidence/outfit-temperature-presence-20261010/`에 보관한다. 개인정보가 있는 캡처는 Git에 추가하지 않았다.
