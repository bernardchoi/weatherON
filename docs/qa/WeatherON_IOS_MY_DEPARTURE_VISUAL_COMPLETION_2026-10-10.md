# iOS 마이·출발 완성도 1차

기준 HEAD `48087358083455041d09865c596db9782f50ba63`. 사용자 승인에 따른 M1/G1 후속 구현. 기존 31개 기본 화면·코디 완성도·홈의 미커밋 변경을 보존했다. 커밋·푸시 없음.

## 구현

- M1: 중앙 세로 계정 상태와 작은 관리 행동, 실제 Glass 하나로 묶은 권한·알림·표시 관리, 별도 정책/버전으로 위계를 정리했다. 계정 미연결/약관 상태의 기존 행동과 권한 추천은 유지한다. 추천이 필요하면 관리 묶음 안에 표시한다. 배경은 정적인 Ambient이며 날씨 애니메이션을 추가하지 않았다.
- G1: 현재 선택한 목적지를 먼저, 해당 목적지만 실제 Glass로 표시한다. 출발·도착 시각/목표 또는 예상 도착 구분, 기온 비교·강수·반복을 기존 모델에서 가져온다. 나머지는 열린 행으로 배치하며 자동으로 ‘다음 일정’이라고 해석하거나 선택 상태를 바꾸지 않는다. 360pt 미만 또는 fontScale 1.3 초과에서는 시간/상태를 세로로 전환하고 기존 ScrollView로 넘치는 내용을 접근한다.
- 다른 목적지 선택을 요청하고 controlled selected ID가 실제 반영된 때만 기존 confirmed selection haptic을 사용한다. 반복 선택/외부 복원에는 울리지 않는다. 실제 촉감은 검증하지 않았다.
- 공유 AppListRow의 contained 옵션은 기본 false이며 이번 iOS 관리 묶음에서만 사용한다. 기본 행/Android는 유지한다. 기존 UIGlassEffect(.regular) 및 Reduce Transparency/하위 OS fallback을 재사용했다. 일정·권한·계정·날씨 모델 로직은 변경하지 않았다.
- 영문/일문 반복 라벨 번역 두 키 추가. 기존 라우트, 최대 3개 안내, 삭제 복구/결과 메시지, 계정 게이트를 유지했다.

## 검사

PASS: mobile TypeScript noEmit, git diff whitespace, destination-labels, destination-limit, account-auth, native-navigation, home-return, home-outing, weather-outfit-regressions, 기존 codi-interactions, localization-native-exports 98 및 KO/EN/JA 2178.

새 `scripts/check-my-departure-interactions.cjs`는 실제 M1 JSX의 guest/terms/connected와 위치·알림 상태별 계정/관리 라우트 및 Glass 묶음을 검사한다. G1은 카드 모델 경계를 fixture로 두고 실제 JSX의 세 목적지 보존/선택 우선/단일 강조/빈 상태/Android 순서/확정 선택 햅틱만 발생함을 검사한다. 실제 높이와 촉감의 검증을 대신하지 않는다.

ambient-surface-regressions도 PASS. 기존 Home 회귀, reading light/dark, gradient parser, 보수적 대비 계산과 접근성 fallback 검사다. UIKit 합성 대비나 실제 접근성 전체 PASS는 아니다.

이전 `before-my-departure.patch`와 비교해 기존 tracked diff 48개 구간 중 이번 승인 대상 5개 파일(M1/G1/AppListRow/en/ja) 외의 변경 내용이 동일함을 확인했다. 기존 코디 untracked 구현도 수정하지 않았다.

## 빌드·설치

원래 의존성 `/Users/daehyeonchoi/Documents/Codex/2026-10-05/task/weatheron/node_modules`, Xcode27, 기존 WeatherONDeviceQA 설정/프로파일/DerivedData를 사용한 ARM64 jobs1 증분 빌드 1회 성공. codesign verify·데이터 보존 업데이트 설치·정상 실행 성공. 프로파일 생성·패키지 설치·앱 데이터 삭제 없음.

main.jsbundle SHA256: `58abe0789d5f8e7baecc56ffde1160c9b3c2a9f1f29074c383153e6dafc3a2bb`.

증거 로그: `/Users/daehyeonchoi/Documents/Codex/2026-10-10/task-2/design-audit/my-departure-evidence/`의 build/install/launch 로그, bundle.sha256, interactions.log, ambient-regressions.log, preservation.log. 작업용 의존성 링크와 QA 프로젝트 복사본은 종료 시 제거했다.

## 실제 iPhone 관찰

사용자가 잠금을 해제하고 미러링을 재연결한 뒤 현재 시스템 다크·기본 글자 크기를 그대로 유지해 확인했다. 도구의 정지 캡처를 직접 관찰했으며 별도 로컬 PNG로 저장하지 않았다.

- M1: 계정 아바타·연결 상태·관리 버튼, 세 관리 항목의 Glass 묶음, 정책·버전·탭까지 첫 화면에 모두 보인다. 설치 전 첫 화면 밖에 있던 버전도 보인다.
- 표시 설정 진입과 뒤로 복귀가 정상이다. 기존 시스템 테마 선택과 단위가 유지됨을 확인했으며 어떤 설정도 변경하지 않았다.
- G1: 실제 등록된 세 목적지, 선택 체크와 단일 Glass 강조, 출발/도착/날씨/반복, 추가 행동 및 최대 개수 안내까지 첫 화면에 모두 보인다. 이 기기의 현재 문장/상태에 대한 관찰이며 모든 언어/장문/기기의 무스크롤 보장은 아니다.
- 현재 선택된 목적지를 눌러 기존 G2 상세 진입과 복귀를 확인했다. 일정·라벨·알림을 편집하거나 저장하지 않았다. 다른 목적지로 선택을 바꾸지 않았다.
- Home의 확정 기온·날씨 아이콘·체감/최고최저·목적지 준비·Glass·코디 표면, C1의 네 품목과 준비/관리 행동 보존을 확인했다. 마지막 화면은 코디다.

미검증: 라이트, 작은 실기기, 큰 글자/VoiceOver/Reduce Motion/Reduce Transparency 실제 기기 상태, 물리 햅틱 촉감, 장시간 성능, 실제 계정/일정 저장 왕복. 시스템·권한·계정·알림 설정과 데이터는 조작하지 않았다. 모든 31개 화면이나 접근성 전체 PASS를 뜻하지 않는다.

## 게시 전 최종 검증

사용자의 현재 브랜치 커밋·정상 푸시 승인 후 전체 관련 변경을 다시 확인했다. TypeScript, 관련 회귀 17개, 번역 원문/카탈로그/placeholder 2178개 및 공백 검사가 모두 통과했다. 네이티브 재빌드는 하지 않았다. O4 시험용 collapsable/fullScreenSwipe 변경이나 화면·Swift 진단 출력은 남아 있지 않다. DestinationCare의 기존 dropdown collapsable=false는 이 진단과 무관한 HEAD의 기존 코드다.

게시 대상은 소스·번역·회귀 검사·QA 문서만이다. 비밀값·개인 장소/계정정보·사진·영상·스크린샷·기기 로그·빌드 산출물·임시 의존성 링크와 QA 프로젝트는 포함하지 않는다. O4는 사용자 직접 스크롤 정상 확인과 미러링 미확인을 구분한다. 31개 소스 적용을 전체 시각/접근성 PASS로 확대하지 않으며, 라이트·큰 글자·실제 햅틱 및 위젯/Live Activity 전용 디자인 등 잔여 범위는 기존 QA 기록대로 유지한다.
