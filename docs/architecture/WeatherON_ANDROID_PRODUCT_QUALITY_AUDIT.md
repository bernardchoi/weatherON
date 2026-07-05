# WeatherON Android 제품 완성도 감사

> 목적: preview APK 실기기 확인 후 낮아 보인 완성도 원인과 개선 순서를 제품 QA 기준으로 유지한다.
> 기준일: 2026-06-29
> 기능 출시 기준: `docs/planning/WeatherON_기능_출시_로드맵.md`

---

## 1. 현재 판단

현재 Android preview APK는 출시 후보가 아니라 빌드/설치/실행 검증용 APK다. 실기기에서 완성도가 낮아 보인 주요 원인은 앱 기능이 아직 제품화 단계가 아니라 프로토타입 상태에 가깝기 때문이다.

2026-06-29 기획안 피드백 기준으로도 현재 우선순위는 전체 기능 출시가 아니라 MVP 0~1 검증이다. 출발시간 역산, 목적지 날씨 비교, 비 시작/그침 타임라인과 알림 신뢰성을 먼저 검증하고, 소셜/ON Square 확장, CP, 커뮤니티 제보, 여행/AI 플래너, 광고, 구독은 제품 지표 확인 전까지 보류한다.

## 2. 확인된 원인

| 구분 | 현상 | 영향 | 우선순위 |
|---|---|---|---|
| 첫 진입 | 홈으로 바로 진입하고 온보딩 맥락이 약함 | 앱 목적과 사용 흐름이 바로 이해되지 않음 | P0 |
| UI 표기 | `H1`, `O2`, `Guest 홈` 같은 내부 코드/상태가 노출됨 | 프로토타입 느낌이 강함 | P0 |
| 화면 밀도 | 헤더와 카드 간격이 커서 작은 화면에서 정보량이 낮음 | 실사용 앱보다 시안처럼 보임 | P1 |
| 상태 저장 | 온보딩/계정/목적지/옷장 상태가 앱 재시작 후 유지되지 않았음 | 실제 앱 사용감 부족 | P1 |
| 네이티브 내비게이션 | 수동 route state 전환 구조 | 뒤로가기, 전환 애니메이션, deep link 품질 낮음 | P1 |
| API UX | smoke는 통과했지만 앱 화면 안의 로딩/오류/fallback QA는 미완료 | 실제 데이터 신뢰감 부족 | P1 |
| 자산/용량 | EAS archive가 277MB -> 139MB -> 62.5MB 수준으로 감소 | 설치 전환율과 빌드 속도에 불리 | P2 |
| 스토어 준비 | 제출 blocker 17개 잔존 | 출시 불가 | P0 |

## 3. 이번 보정

| 항목 | 변경 |
|---|---|
| 첫 진입 | 초기 route를 `O2` 온보딩으로 변경 |
| 코드 노출 | 하단 탭의 route code 표시 제거 |
| 홈 배지 | `Guest 홈` 대신 위치 상태 배지 표시 |
| 온보딩 문구 | 내부 단계명보다 사용자 행동 기준 문구로 변경 |
| UI 밀도 | AppScreen 헤더 높이와 간격 축소 |
| 카드 라운드 | 앱 카드 radius를 8px 이하로 조정 |
| Android 뒤로가기 | 주요 화면별 상위 화면 복귀 정책 추가 |
| 상태 영속화 | 온보딩/계정/권한/목적지/옷장/알림 히스토리 일부를 앱 전용 파일 저장소에 저장 |
| 빌드 운영 | 1차 제품 보정 build `0afbdf0c-f617-43f5-8dd6-5466f862a40b` 완료, 홈 상태 수정 build `ffe1ec96-c5a2-44d8-9a7d-b3a3a131d66a` 완료, `.easignore` 반영 build `8a0b9f32-260b-4b64-b335-b4b30113b3a1` 완료, 하단 탭 IA 보정 build `deb142d7-a9a8-44e5-85ba-6eb0e5b0dd95` 완료, `S1 ON Square` 분리 build `da28ef88-3adb-4a25-858d-9e2e4ba62245` 완료, `versionCode=2` QA build `7c857db8-da31-4c95-88d8-0455546c1c4d` 완료 |
| 빌드 추적 | `npm run check:eas-build-status -- <eas-build-id>` 상태 확인 명령 추가 |
| 문구 정리 | 계정/권한/목적지/코디 화면의 내부 라우트 코드, `Guest`, 영어 상태값 노출 제거 |
| 실기기 첫 인상 | 홈 날씨 요약을 큰 체감 온도, 상태, 강수/바람/습도 지표 중심으로 재구성 |
| 실기기 문구 보정 | 권한 화면의 `locationReady`/`permissionReady`, 코디의 `fallback 샘플`, 강수의 `H5`, 옷장의 `source preset` 노출 제거 |
| 실기기 밀도 보정 | AppScreen/Section 간격과 패딩 축소로 작은 화면 첫 화면 정보 밀도 개선 |
| 데이터 일관성 | 홈 날씨 카드와 코디 추천 사유가 시간별 최대 강수/바람 기준을 함께 사용하도록 보정 |
| QA 컨트롤 제거 | 홈 날씨 상태 패널의 QA용 상태 토글을 사용자용 현재 상태 문구로 대체 |
| 하단 탭 IA | QA용 `코디/소셜/우산/강수` 직접 탭을 제거하고 MVP 기준 `홈/출발/MY`로 고정 |
| 소셜 레이어 | `S1 ON Square`는 최초 출시 미공개 처리, 핵심 MVP 판단 흐름과 분리 |
| 반복 방지 | `npm run check:android-product-quality` 정적 체크와 `npm run check:android-core-flow` 클릭 흐름 체크 추가 |
| 하단 탭 가림 회귀 | `npm run check:android-core-flow`에서 목적지/강수/코디 하단 CTA가 하단 탭 위로 노출되는지 확인 |
| 오프라인 상태 문구 | 홈 날씨 pill이 provider 상태 전체를 보도록 보정해 실패/최근 예보 상태를 `실시간 예보`로 오인하지 않게 함 |
| 출발시간 역산 UX | G2 목적지 케어에 `자동/도보/자차/대중교통` 드롭다운 선택, 선택 즉시 리스트 닫힘, 도착 희망 `시/분` 스크롤 선택, 현재시각 기준 자동 여유시간, 대중교통 변동 안내 추가 |
| G1 목적지 카드 밀도 | 큰 출발 블록과 4분할 정보 타일을 제거하고 목적지명, 기온 비교, 강수, 출발/도착, 반복, 경고만 3줄 요약형으로 정리 |
| EAS 업로드 최적화 | `.easignore` 추가로 docs/mockups/brand/store-only 산출물 제외, archive 업로드 62.5MB 확인 |
| EAS archive 회귀 | web export/모노레포 산출물 확인 과정 이후 preview build `5e5b8f72`, `d217ac7e`, `d6b3aa4b`가 200MB archive로 업로드됨. APK 기능 검증용으로는 사용 가능하나 용량 최적화 기준에서는 superseded 후보 |
| EAS ignore 보강 | root `.easignore`에 `.git`, `.git/`, `apps/mobile/dist/`, mobile `.easignore`에 `dist/`, `dist-web/`, `web-build/` 제외 추가 |
| EAS archive 회복 | `eas build:inspect` 기준 archive stage 64MB, preview build `da28ef88-3adb-4a25-858d-9e2e4ba62245` 완료 및 업로드 `62.6 MB` 확인 |
| EAS archive 재회복 | 최신 preview build 시도에서 archive `892 MB` 회귀 확인. `android/app/build` 등 native 산출물 제외와 native `applicationId` 보정 후 `eas build:inspect --stage archive` 기준 75MB 확인 |

## 4. 다음 개선 순서

1. O2 -> H1 -> G2 -> H5 핵심 MVP 흐름 실기기 QA와 `npm run check:android-core-flow` 반복 확인
2. 작은 화면 360x800, 큰 화면 430x932 레이아웃 QA
3. 출발시간 역산의 이동수단 드롭다운 선택, 선택 후 자동 닫힘, 도착 희망 시/분 스크롤 선택, 자동 여유시간, 대중교통 변동 안내를 실기기에서 QA
4. G1 목적지 카드가 작은 화면에서 3줄 요약형으로 읽히고 하단 탭과 겹치지 않는지 실기기 QA
5. 목적지 날씨 비교, 강수 타임라인의 로딩/오류/fallback 문구 정리
6. 네트워크 끊김 시 홈 상태 pill이 `최근 예보` 또는 `기본 예보`로 표시되는지 새 APK에서 재검증
7. 비 시작/그침 알림 조건 저장과 앱 재시작 후 상태 영속화 QA
7. EAS quota reset 후 최신 보정본 기준 새 preview APK 생성
8. 기본 내비게이션 스택 도입 검토
9. 새 preview APK에서 하단 탭 `홈/출발/MY`, 목적지 추가/알림 설정, 하단 CTA 가림 없음 재확인
10. `소셜`/`ON Square`는 MVP 검증 완료 전까지 사용자 화면 미공개 유지
11. 이미지 자산 최적화와 `.easignore` 효과 재측정
12. Beta 전 스토어 스크린샷 캡처와 제출 blocker 17개 해소

## 5. 검증 기준

| 검증 | 기준 |
|---|---|
| TypeScript | `npx tsc -p apps/mobile/tsconfig.json --noEmit` 통과 |
| Android release config | `npm run check:android-release` 통과 |
| Product quality | `npm run check:android-product-quality` 통과 |
| Core flow | `npm run check:android-core-flow` 통과. 홈 CTA, 목적지 비교, 강수 알림, 코디 기준 저장, 옷장 추가, 하단 탭 가림 회귀 포함 |
| 통합 게이트 | `npm run check:android-local-release-ready` 통과 |
| 실기기 QA | `WeatherON_ANDROID_APK_QA_체크리스트.md` 기준으로 결과 기록 |

## 5-1. 관련 요약 문서

| 문서 | 역할 |
|---|---|
| `docs/architecture/WeatherON_BUILD_UI_POLISH_SUMMARY.md` | 지금까지의 빌드, UI 폴리싱, 목업 QA, 남은 MVP 0 진입 기준을 한 화면에서 확인 |

---

## 6. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-07-05 | 폐쇄 테스트 문구 정리: `배지 제외`·`도착 역산`·`온보딩`·`미리보기 상태` 등 내부/스펙 톤 문구를 사용자 카피로 교체(H1 사이드바, H3, C3, O1/O4, 스플래시). 목업 정합: M1에 스타일 태그 설정 행 추가(O4 진입), 탭바 라벨 타이포·dot 간격 목업 수치 동기화. 전 게이트 재통과 |
| 2026-07-05 | UI 디자인 스펙 정합: radius 토큰 상향(card 20/cardSm 16/sheet 28/tab 24), 플로팅 탭바 적용, 알림 센터·권한 게이트·약관·제보 텍스트 아이콘 제거, 알림 미읽음 Gold 테두리 제거. tsc/product-quality/preview-preflight/shared 통과. MVP 1 테스트 피드백 기록 양식 신설 |
| 2026-06-27 | preview APK 실기기 확인 후 제품 완성도 감사 문서 작성 |
| 2026-06-27 | Android hardware back 버튼 복귀 정책 추가 |
| 2026-06-27 | 앱 전용 파일 저장소 기반 상태 영속화 추가 |
| 2026-06-27 | 제품 보정 preview build 완료 상태와 추적 명령 기록 |
| 2026-06-27 | 내부 코드/개발 문구 노출 제거와 제품 품질 정적 체크 추가 |
| 2026-06-27 | 내부 문구 추가 정리 반영 preview build `3df4fb84-98d5-417d-865e-240e14200520` 시작 |
| 2026-06-27 | In-app browser 홈 QA에서 발견한 상태 문구 혼선 수정 후 preview build `ffe1ec96-c5a2-44d8-9a7d-b3a3a131d66a` 완료 |
| 2026-06-27 | EAS 업로드 최적화용 `.easignore` 추가 및 archive 업로드 62.5MB 확인 |
| 2026-06-27 | 실기기 저완성도 피드백 반영: 홈 날씨 카드, 권한/코디/강수/옷장 문구, 화면 밀도 보정 |
| 2026-06-27 | 홈 강수 표시와 코디 추천 사유의 강수 기준 통일, QA용 날씨 상태 토글 제거 |
| 2026-06-27 | preview build `5e5b8f72`, `d217ac7e`, `d6b3aa4b` 생성 중 archive 200MB 회귀 확인 및 mobile `.easignore` 보강 |
| 2026-06-27 | `.git` ignore 매칭 보정 후 `build:inspect` 64MB, preview build `deb142d7-a9a8-44e5-85ba-6eb0e5b0dd95` 62.5MB 업로드 확인 |
| 2026-06-30 | 하단 탭을 MVP 기준 `홈/출발/MY`로 고정하고 미공개 직접 탭을 제거 |
| 2026-06-30 | 소셜 레이어 최초 출시 미공개 기준으로 제품 품질 기준 갱신 |
| 2026-06-30 | 핵심 클릭 흐름에 하단 탭 CTA 가림 회귀검사를 추가하고 product quality 게이트에 고정 |
| 2026-06-30 | 최신 preview build 시도 중 EAS quota 소진과 archive 892MB 회귀 확인. `.easignore` native build 산출물 제외 및 Android applicationId 보정 후 archive inspect 75MB 확인 |
| 2026-06-28 | preview build `deb142d7-a9a8-44e5-85ba-6eb0e5b0dd95` 완료 및 최신 실기기 QA 대상으로 갱신 |
| 2026-06-28 | `S1 ON Square` 반영 preview build `da28ef88-3adb-4a25-858d-9e2e4ba62245` 완료 및 최신 실기기 QA 대상으로 갱신 |
| 2026-06-28 | `H3/H4/H5` 홈 활성 탭 보정 및 Android `versionCode=2` preview build `7c857db8-da31-4c95-88d8-0455546c1c4d` 완료 |
| 2026-06-28 | 앱 카테고리/광고 포함 여부 1차 제출 기준 확정으로 스토어 blocker 14개로 갱신 |
| 2026-06-28 | Play Console 계정 유형/폐쇄 테스트 blocker를 제출 blocker에 반영해 17개로 갱신 |
| 2026-06-29 | 기획안 피드백 반영. Android QA 우선순위를 전체 출시 준비에서 MVP 0~1 핵심 흐름과 알림 신뢰성 검증으로 조정 |
| 2026-06-29 | 앱 빌드 및 UI 폴리싱 요약 문서 연결 |
| 2026-06-29 | MVP 0 O2/H1/G2/H5 1차 UI 재정렬 및 web export 검증 반영 |
