# WeatherON 디자인 QA 보고서

source visual truth path: blocked - 별도 Figma, 원본 이미지, 기준 스크린샷이 제공되지 않음
implementation screenshot path: `design-qa-screenshots/light-C1.png`, `design-qa-screenshots/dark-C1.png`, `design-qa-screenshots/light-C3.png`, `design-qa-screenshots/light-M2.png`, `design-qa-screenshots/light-O6.png`, `design-qa-screenshots/light-P3.png`
viewport: 브라우저 1280x900, 프리뷰 내부 폰 프레임 393x852
state: Light/Dark 대표 상태, 게스트 기본 프리뷰 상태
full-view comparison evidence: blocked - 구현 스크린샷은 확보했으나 비교할 원본 디자인 기준 없음
focused region comparison evidence: blocked - 기준 원본 없이 구현 화면 기준으로만 영역 점검함
patches made since previous QA pass: C1, C3, M2, O6, P3 UI 개선 및 QA 캡처 재생성

## 요약

- 구현 화면 기준 핵심 문제는 수정 완료.
- C1 하단 액션/탭바 겹침, 라이트모드 우상단 옷장 아이콘 비노출, 다크모드 의류 대비 문제를 수정함.
- C3 프리셋 그리드와 하단 CTA 밀도 문제를 줄임.
- M2 스마트 알림 상태 문구 모순을 `권한 확인 필요 / 일시 중지 / 켜짐` 상태로 분리함.
- O6 비활성 CTA 대비와 선택 전 안내 문구를 보강함.
- P3 중복 섹션 라벨과 `케어` 표현을 목적지 알림 기준으로 정리함.
- 정식 디자인 QA는 원본 디자인 기준이 없어 blocked 상태로 유지함. 구현 QA는 현재 캡처 기준 통과.

## 수정 반영

- C1 코디 메인
  - 하단 액션 버튼이 탭바와 겹치지 않도록 카드 밀도, 스크롤 높이, 하단 안전영역 조정.
  - 라이트모드 우상단 옷장 아이콘을 `logoNavy` 컬러로 변경.
  - 다크모드 의류 카드 안에 밝은 이미지 well을 적용해 슬랙스와 신발이 카드 배경에 묻히지 않게 수정.

- C3 옷 등록
  - 프리셋 카드 높이와 이미지 슬롯을 줄이고, 선택 미리보기 카드 밀도 조정.
  - CTA 위치와 스크롤 영역을 재계산해 첫 프리셋 행이 잘려 보이지 않게 수정.
  - 아이템 / 계절 / 목적 필터 구조는 유지하되 모바일 첫 화면 노출 밀도 개선.

- M2 스마트 알림 설정
  - `알아서 챙기기` 토글 ON인데 `스마트 알림 일시 중지`로 보이던 모순 제거.
  - 기본 게스트 상태는 `알림 권한 확인 필요`로 표시.
  - 권한 부족 상태와 실제 일시 중지 상태를 요약 카드, 상태 칩, 하단 문구에서 분리.

- O6 목적지 등록
  - 비활성 CTA 대비를 높이고 opacity 약화 제거.
  - 선택 전 안내를 `목적지를 선택하면 더 정확하게 시작할 수 있어요`로 변경.
  - `출발 케어`, `신발 케어` 표현을 `출발 알림`, `신발 알림`으로 정리.

- P3 목적지 필터
  - 첫 카드 라벨을 `준비 가이드`로 변경해 바로 아래 `목적지 알림` 카드와 구분.
  - 목적지 상세 상태 문구에서 `케어`를 `알림` 중심 표현으로 변경.

## 브라우저 테스트 차단 원인

- 원인: Codex managed sandbox에서 Puppeteer Chromium 자식 프로세스 실행이 차단됨.
- 증상: sandbox 일반 실행 시 `Failed to launch the browser process: Code: null`.
- 해결 경로: 앱 문제는 아니며, 디자인 QA 캡처는 승격 실행으로 고정함.
- 재검증 명령: `node scripts/design-qa-capture.mjs`
- 결과: 승격 실행 기준 `24`개 캡처 생성, 콘솔 오류 없음.
- 캡처 로그: Vite 연결 로그와 React DevTools 안내만 있음.

## 검증

- `npm run build:mockups` 통과.
- `node scripts/design-qa-capture.mjs` 승격 실행 통과.
- 캡처 생성 수: 24개.
- 주요 확인 화면: C1 Light/Dark, C3 Light, M2 Light, O6 Light, P3 Light.
- C1 하단 액션과 탭바 겹침 없음.
- C1 라이트모드 우상단 아이콘 표시 확인.
- M2 상태 문구 모순 제거 확인.
- C3 프리셋 첫 행과 CTA 겹침 없음.
- O6 비활성 CTA 읽기 가능.
- P3 중복 라벨 제거 확인.

## 남은 리스크

- 원본 디자인 기준이 없어 픽셀 단위 비교는 불가.
- H1/O2 등 일부 화면에 `HYBRID CHROME`, `RECOMMENDATION`, `WARDROBE` 같은 프리뷰성 영문 라벨이 남아 있음. 앱 최종 개발 전 사용자 화면용 문구로 추가 정리 필요.
- 다크모드는 개선됐지만 전체 제품 톤은 아직 라이트모드 쪽이 더 완성도가 높음. 2차 QA에서 다크모드 전체 화면군을 별도 점검하는 것이 좋음.

final result: blocked

---

## 2차 접근성·정합화 폴리싱 (2026-06-26)

audit(2026-06-25)의 "남은 리스크" 및 우선 수정 권장 항목 대응.

### 접근성 — 시맨틱 버튼 전환
- 전 목업의 재사용 헬퍼(BrandCard·TabItem·ClothCard·NotifCard 등)를 `<div onClick>`에서 시맨틱 `<button>`으로 전환.
  - onClick이 optional인 카드 헬퍼는 `const Tag = onClick ? "button" : "div"`로 동적 렌더(클릭 가능할 때만 button).
  - button 전환 시 `appearance:none / border:none / background:transparent / font:inherit / textAlign:left / width:100%` 리셋을 앞에 두어 기존 스타일 보존.
- TabItem: `aria-label`(탭 이름) + `aria-current={active?"page":undefined}` 부여, `height`→`minHeight`로 터치 타겟 보장.
- 아이콘 전용 버튼(헤더 백버튼·닫기·공유·전송)에 `aria-label` 추가: H4/M2/P3/C4/날씨상세.
- H3 알림카드: 외곽 div 대신 내부 button으로 onClick·handlers 이관(중첩 버튼 방지), `aria-label` 부여.

### 접근성 — 보조 텍스트 대비
- 앱 프레임 내부 UI의 저대비 보조 텍스트(MISTLITE 0.40~0.55)를 0.62~0.66으로 상향: A4·C2·C3·R1·S4·S5·H1.
- 프리뷰 캡션(폰 프레임 바깥 화면번호/푸터, DM Mono)은 앱 UI가 아니므로 대상에서 제외.
- 터치 타겟: 24px 미만 클릭 요소 없음(칩·아이콘 버튼 모두 기준 충족) — 신규 위반 없음.

### 프리뷰성 영문 라벨 한글화
- M2 ShortcutContextCard: `UMBRELLA SHORTCUT`→`우산 알림`, `RAIN SHORTCUT`→`강수 알림`.
- H3 알림 sub의 화면코드 노출 제거: `(H5)`/`(H4)` → `강수 타임라인 보기`/`우산 추천 상세 보기`.
- 그 외 영문은 코드값(tone명·OAuth 제공자 키)·오픈소스 라이선스명(React/Vite/Mermaid)이라 유지.

### R/W/S 라인 정합화
- 코드 점검 결과 R/W/S는 이미 핵심 플로우(H/C/G)와 동일하게 테마 토큰(ink/mist floor)·배경 그라데이션·카드 그림자·하단 안전영역(paddingBottom 90 > 탭바 82)을 사용 중. 구조적 결함 없음 → 토큰/대비/여백 정합 확인으로 마무리.

### 검증
- `npx vite build` 전체 통과: 77 modules transformed, ✓ built (회귀 없음).
- 전 목업 + design_system + preview JSX 구문 검증(esbuild) 에러 0.
- 재사용 헬퍼 기준 잔존 `<div onClick={onClick}>` 0건(전부 button 전환).
- 합의 범위에 따라 인라인 지역 div onClick(리스트행 등)은 의도적으로 유지.

### 차단 사항
- 스크린샷 캡처: sandbox 네트워크 정책상 puppeteer Chromium 다운로드 차단(403). 시각 회귀 캡처는 승격 환경에서 `node scripts/design-qa-capture.mjs`로 별도 수행 필요. 빌드·구문 검증으로 코드 회귀는 확인됨.

final result: pass (build + 구문 검증 기준), 시각 캡처 blocked
