# WeatherON 앱 빌드 및 UI 폴리싱 정리

> 기준일: 2026-06-29
> 목적: 지금까지 진행한 앱 빌드, UI 폴리싱, QA 결과, 남은 리스크를 한 문서에서 확인한다.
> 기능 출시 기준: `docs/planning/WeatherON_기능_출시_로드맵.md`

---

## 1. 현재 결론

현재 앱은 전체 기능 공개 출시 후보가 아니라 MVP 0~1 검증 전 단계다.

빌드와 UI 보정은 여러 차례 진행됐고 Android preview/production 산출물도 만들어졌지만, 다음 작업의 기준은 스토어 출시가 아니라 `O2 -> H1 -> G2 -> H5` 핵심 흐름 검증이다.

우선 검증해야 하는 가치는 아래 3개다.

- 출발시간 역산
- 목적지 날씨 비교
- 비 시작/그침 타임라인과 알림 신뢰성

---

## 2. 빌드 상태 요약

| 항목 | 현재 상태 |
|---|---|
| Android package | `com.weatheron.mobile` |
| Local debug package | `com.weatheron.mobile.dev` |
| 앱 버전 | `0.1.0` |
| Android versionCode | `4` |
| 최신 preview build | `29665e88-4da7-41f2-8178-9e85de34ecee` |
| preview build 상태 | FINISHED |
| 최신 production build | `90912651-fc84-47d0-91ce-9be096c2ff05` |
| production build 상태 | FINISHED |
| 정적 체크 | 20/20 통과 |
| EAS 로그인 | 통과 |
| EAS projectId | `3bf39144-92a4-48a9-8bd8-ae09daf2a817` |
| Play 제출 상태 | blocker 17개 잔존 |
| MVP 0 preview APK | 완료. 최신 설치 후보 `29665e88-4da7-41f2-8178-9e85de34ecee` |

### 주요 빌드 이력

| build | 목적 |
|---|---|
| `0afbdf0c-f617-43f5-8dd6-5466f862a40b` | 1차 제품 보정 |
| `ffe1ec96-c5a2-44d8-9a7d-b3a3a131d66a` | 홈 상태 문구 혼선 수정 |
| `8a0b9f32-260b-4b64-b335-b4b30113b3a1` | `.easignore` 반영 |
| `deb142d7-a9a8-44e5-85ba-6eb0e5b0dd95` | 하단 탭 IA 보정 |
| `da28ef88-3adb-4a25-858d-9e2e4ba62245` | `S1 ON Square` 분리 |
| `7c857db8-da31-4c95-88d8-0455546c1c4d` | `versionCode=2` QA build |
| `419e3d2c-135b-41a1-88f6-3321ad5115f1` | MVP 0 preview APK 후보. FINISHED |
| `29665e88-4da7-41f2-8178-9e85de34ecee` | MVP 0 최신 preview APK 설치 후보. FINISHED |

---

## 3. UI 폴리싱 적용 내역

| 영역 | 적용 내용 |
|---|---|
| 첫 진입 | 초기 route를 `O2` 온보딩으로 변경 |
| 내부 코드 노출 | 하단 탭의 route code, `Guest 홈`, `H5`, `source preset`, `fallback 샘플` 같은 개발 문구 제거 |
| 홈 첫 인상 | 큰 체감 온도, 상태, 강수/바람/습도 지표 중심으로 홈 날씨 요약 재구성 |
| 화면 밀도 | AppScreen/Section 간격, 헤더 높이, 패딩 축소 |
| 카드 스타일 | 앱 카드 radius를 8px 이하로 조정 |
| 하단 탭 IA | MVP 기준 `홈/출발/MY`로 고정, 코디·옷장은 MY 내부 진입 |
| 소셜 레이어 | 최초 출시 미공개 처리, 핵심 MVP 판단 흐름과 분리 |
| 상태 저장 | 온보딩/계정/권한/목적지/옷장/알림 히스토리 일부를 앱 전용 파일 저장소에 저장 |
| Android 뒤로가기 | 주요 화면별 상위 화면 복귀 정책 추가 |
| 데이터 일관성 | 홈 날씨 카드와 코디 추천 사유가 시간별 최대 강수/바람 기준을 공유하도록 보정 |
| QA 회귀 방지 | `npm run check:android-product-quality` 정적 체크 추가 |
| MVP 0 핵심 흐름 | `O2 -> H1 -> G2 -> H5` 상단 정보 구조를 출발시간, 목적지 날씨 차이, 비 시작/그침 알림 중심으로 재배치 |

---

## 4. 목업/시각 QA 정리

| 항목 | 결과 |
|---|---|
| 검증 범위 | preview navigation 43개 화면 |
| 캡처 기준 | 393x852 mockup surface |
| 테마 | light/dark 모두 검증 |
| `npm run build:mockups` | 통과 |
| Light DOM QA | 43개 화면 재생성 |
| Dark DOM QA | 43개 화면 재생성 |
| clipped total | light 0, dark 0 |
| tiny text total | light 0, dark 0 |
| low-contrast total | light 0, dark 0 |

### 주요 시각 보정

| 화면/영역 | 보정 |
|---|---|
| H5 | `비 알림 설정` CTA를 tab bar 위 safe-area 고정 CTA로 이동 |
| C4 | light mode 하단 CTA 배경을 dark overlay에서 light gradient로 변경 |
| H1/H2/H3/H5/G1/G4/G6/P2/R4/S2 | 작은 helper label 정리 또는 10px 이상으로 상향 |
| H3/W4/O5/C3/C4 | 메타/상태/상세 텍스트 대비 개선 |
| H4/H5 | 강수 확률, 축, 범례, 우산 비교 label 가독성 개선 |
| A2/O2/O3/O4/O6 | 온보딩 helper text, inactive control, permission chip, style preview icon 대비 개선 |
| Theme tokens | dark mode 기능색을 밝히고 light mode 기능색을 어둡게 조정 |

---

## 5. 현재 리스크

| 리스크 | 상태 |
|---|---|
| 제품 성격 | 아직 출시 후보가 아니라 빌드/설치/실행 검증용 APK 성격 |
| MVP 핵심 이해 | O2 -> H1 -> G2 -> H5 흐름을 다시 검증해야 함 |
| 알림 신뢰성 | 비 시작/그침 알림 조건 저장, 권한 복구, 푸시/딥링크 검증 필요 |
| 네이티브 내비게이션 | 수동 route state 구조라 전환 애니메이션/deep link 품질 보강 필요 |
| API UX | smoke는 통과했지만 화면 안 로딩/오류/fallback 체감 QA 필요 |
| 접근성 | 자동 대비 후보는 0이지만 실제 기기에서 foreground/background 측정 필요 |
| 터치 영역 | 일부 compact chip/button은 44px 미만. primary action은 44px 이상 유지 필요 |
| 스토어 제출 | Play 제출 blocker 17개 잔존 |

---

## 6. 다음 작업 기준

다음 폴리싱은 새 기능 추가가 아니라 MVP 0 핵심 흐름의 실기기 체감 검증이어야 한다.

| 우선 | 작업 | 완료 기준 |
|---|---|---|
| 1 | O2 온보딩 재정렬 | 1차 반영. 출발시간 역산, 목적지 날씨 비교, 비 그침 알림 가치가 첫 화면에서 이해됨 |
| 2 | H1 홈 재구성 | 1차 반영. 코디/소셜보다 출발, 목적지 차이, 강수 타이밍이 먼저 보임 |
| 3 | G2 목적지 케어 정리 | 1차 반영. 목적지 기준 출발시간, 날씨 차이, 준비 알림을 상단에서 판단 가능 |
| 4 | H5 강수 타임라인 정리 | 1차 반영. 비 시작/그침 시간과 알림 토글이 상단에 노출됨 |
| 5 | 실기기 QA | 작은 화면 360x800, 큰 화면 430x932에서 겹침/잘림/터치 문제 없음 |

## 6-1. MVP 0 1차 구현 검증

| 검증 | 결과 |
|---|---|
| TypeScript | `npx tsc -p apps/mobile/tsconfig.json --noEmit` 통과 |
| Android product quality | `npm run check:android-product-quality` 통과 |
| Android web export | `npm run export:android-web` 통과 |
| Android web export check | `npm run check:android-web-export` 통과. warning 1개 유지 |
| EAS login | `npm run check:eas-login-state` 통과. `weatheron / dev@weatheron.app` |
| EAS preview APK | `29665e88-4da7-41f2-8178-9e85de34ecee` FINISHED. artifact: `https://expo.dev/artifacts/eas/JGuXHi6pp0PtYN2z8Ogs5uJ9q00W7NxCecjagNY0NkU.apk` |
| Local debug APK | `npx expo run:android`는 Metro development build이므로 `com.weatheron.mobile.dev`로 분리. EAS preview 설치본과 공존 가능 |
| O2 DOM 검증 | `나가기 전 5초 판단`, `언제 나갈지`, `목적지는 다른지`, `비는 언제 그치는지` 확인 |
| H1 DOM 검증 | `언제 나가야 함`, `목적지는 다른가`, `비는 언제 그침` 확인. 코디 섹션은 핵심 판단 뒤로 이동 |
| G2 DOM 검증 | `목적지에서 바로 판단`, `08:10에 나가면 13:00 도착`, 날씨 비교, 출발 전 알림 흐름 확인 |
| H5 DOM 검증 | `18:00 시작, 21:00 그침`, `비 그치면 알려줘`, `알림 신뢰성 검증` 확인 |
| 393x852 캡처 | `/tmp/weatheron-mvp0-o2.png`, `/tmp/weatheron-mvp0-h1.png`, `/tmp/weatheron-mvp0-g2.png`, `/tmp/weatheron-mvp0-h5.png` 육안 확인 |

---

## 7. 연결 문서

| 문서 | 역할 |
|---|---|
| `docs/planning/WeatherON_기능_출시_로드맵.md` | MVP 0~1, Beta, v1.0, v1.1+ 기준 |
| `docs/planning/WeatherON_MVP_기능_PRD.md` | MVP 기능 상세 명세 |
| `docs/architecture/WeatherON_ANDROID_PRODUCT_QUALITY_AUDIT.md` | 제품 완성도 감사와 Android 보정 이력 |
| `docs/architecture/WeatherON_ANDROID_RELEASE_ACTION_BOARD.md` | Android 다음 액션과 blocker 현황 |
| `docs/architecture/WeatherON_ANDROID_RELEASE_READINESS_REPORT.md` | Android release readiness 현황 |
| `docs/audits/visual-qa-2026-06-25/report.md` | 43개 목업 화면 light/dark 시각 QA 결과 |

---

## 8. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-06-29 | 앱 빌드, UI 폴리싱, 목업 QA, 남은 MVP 0 진입 기준을 한 문서로 정리 |
| 2026-06-29 | MVP 0 1차 구현. O2/H1/G2/H5 상단 메시지 재정렬 및 web export/DOM/캡처 검증 |
| 2026-06-29 | MVP 0 preview APK 빌드 시도. EAS 업로드는 완료됐으나 Android Free plan quota 초과로 큐 생성 실패 |
| 2026-06-29 | 사용자 터미널의 no-wait build 2건 상태 확인. `419e3d2c-135b-41a1-88f6-3321ad5115f1`, `29665e88-4da7-41f2-8178-9e85de34ecee` 모두 FINISHED. 최신 설치 후보를 `29665e88-4da7-41f2-8178-9e85de34ecee`로 갱신 |
| 2026-06-29 | EAS preview/production build와 local debug build 식별자 분리. local debug는 `com.weatheron.mobile.dev`, EAS preview/production은 `com.weatheron.mobile` 유지 |
