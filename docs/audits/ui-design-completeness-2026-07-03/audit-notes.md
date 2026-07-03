# WeatherON UI 디자인 완성도 점검

생성일: 2026-07-03

## 범위

- 현재 앱 웹 프리뷰: `http://127.0.0.1:8094/`
- 현재 캡처: `screenshots/01-current-home-mobile.png`
- 목업 기준: `mockups/WeatherON_design_system.jsx`, `mockups/WeatherON_H1_mockup.jsx`
- 점검 항목: 아이콘 애셋 누락, 하단 내비게이션 목업 차이, 화면 내 아이콘 완성도

## 결론

- 아이콘 파일 참조 누락은 확인되지 않음.
- `apps/mobile/src/assets.ts`의 `require(...)` 44건은 모두 실제 파일이 존재함.
- `assets/ui-icons`의 PNG 17개도 모두 `uiIconAssets`에 등록되어 있음.
- 다만 하단 내비게이션은 목업 원본과 명확히 다름.
- 또한 일부 화면은 아직 실제 아이콘 애셋 대신 문자, 기호, 코드 드로잉을 아이콘처럼 쓰고 있음.

## 하단 내비게이션 차이

### 목업 기준

- 목업 탭은 `홈 / 코디 / 출발 / MY / 소셜` 5개 구조임.
- 목업 `TabBar`는 화면 하단에 떠 있는 pill형 바임.
- 스타일 기준:
  - `bottom: 18`, `left/right: 16`
  - `height: 64`
  - `borderRadius: RADIUS.tab`
  - `boxShadow: 0 10px 24px rgba(0,0,0,0.45)`
  - active 상태는 5px 점 + 골드 컬러로 표시

근거: `mockups/WeatherON_design_system.jsx:148-179`

### 현재 앱

- 현재 앱 `bottomNavRoutes`는 `홈 / 출발 / MY` 3개만 렌더링함.
- `코디`, `소셜` 탭이 빠져 있음.
- `C1-C4` 코디 화면은 active 탭을 `H1`로 강제 매핑함.
- `S0-S3` 소셜 라인은 `launchHiddenRouteIds`에 포함되어 하단 내비에서 빠짐.
- 현재 렌더링 캡처에서도 탭은 `홈 / 출발 / MY`만 확인됨.

근거:

- `apps/mobile/src/navigation/routes.ts:77-81`
- `apps/mobile/src/navigation/routes.ts:83-99`
- `apps/mobile/src/components/BottomNav.tsx:45-50`
- `docs/audits/ui-design-completeness-2026-07-03/screenshots/01-current-home-mobile.png`

### 디자인 차이

- 현재 앱은 하단 전체 너비 영역 위에 3개 segment button이 놓인 형태임.
- 목업은 floating tab bar 느낌이고, 각 탭 배경은 투명하며 active indicator dot이 있음.
- 현재 active 상태는 배경 카드 + 테두리 강조라 목업의 가벼운 탭바 톤과 다름.
- 현재 라벨 굵기 `900`, 아이콘 크기 `23`도 목업의 `10.5 / 600`, `21` 계열보다 무거워 보임.

근거:

- `apps/mobile/src/components/BottomNav.tsx:66-94`
- `mockups/WeatherON_design_system.jsx:152-163`

## 아이콘 애셋 상태

### 파일 누락

- 누락 없음.
- `apps/mobile/src/assets.ts` 기준 `require(...)` 44건 모두 존재.
- `assets/ui-icons` 파일 17개 모두 등록됨.

### 하단 탭 아이콘

- `tab-home`, `tab-depart`, `tab-my`는 현재 렌더링됨.
- `tab-outfit`, `tab-social` 파일은 있지만 현재 하단 메뉴 구조상 사용자에게 노출되지 않음.
- 즉 파일 누락이 아니라 메뉴 구조 누락임.

근거:

- `apps/mobile/src/assets.ts:40-44`
- `apps/mobile/src/navigation/routes.ts:77-81`

## 아이콘 완성도 리스크

아래는 파일 누락은 아니지만, 목업 수준의 아이콘 애셋 적용 관점에서는 미완성으로 보는 게 맞음.

1. 날씨 제보 화면
   - `☼`, `▬`, `☔`, `＊`, `≋`, `↯` 문자 기호를 아이콘으로 사용 중.
   - 근거: `apps/mobile/src/screens/WeatherReportScreens.tsx:11-18`

2. 알림 센터
   - `☼`, `비`, `↗`, `⌁` 텍스트를 알림 아이콘으로 사용 중.
   - 근거: `apps/mobile/src/screens/NotificationCenterScreen.tsx:258-296`

3. 정책 허브
   - `방패`, `문서`, `위치`, `OSS` 텍스트를 아이콘 박스 안에 사용 중.
   - 근거: `apps/mobile/src/screens/PolicyHubScreen.tsx:9-13`

4. 일부 세부 화면
   - 목적지 허브, 목적지 추가, 알림 설정, MY 설정 일부는 코드로 그린 mini icon 또는 텍스트 표식이 섞여 있음.
   - 이 자체가 오류는 아니지만, 목업 원본의 통일된 stroke icon 톤과 현재 PNG 애셋 톤 사이에서 일관성이 약해질 수 있음.

## 우선 수정 권장

1. 하단 내비게이션 정책 결정
   - 목업 기준으로 맞출 경우 `bottomNavRoutes`를 `홈 / 코디 / 출발 / MY / 소셜` 5개로 복원 필요.
   - 출시 범위 때문에 3개가 의도라면 목업/기획 문서도 3탭 기준으로 업데이트 필요.

2. `BottomNav` 스타일 목업화
   - floating bar, 64px 높이, 24px급 radius, active dot, 투명 탭 배경으로 조정 필요.

3. 텍스트 아이콘 정리
   - 날씨 제보, 알림 센터, 정책 허브부터 실제 아이콘 애셋 또는 통일된 아이콘 라이브러리로 교체 필요.

4. 숨겨진 탭 아이콘 처리
   - `tab-outfit`, `tab-social`은 파일이 있으나 현재 구조상 미노출임.
   - 5탭 복원 시 바로 사용 가능.
   - 3탭 유지 시 미사용 애셋으로 남는 이유를 문서화 필요.

## 판정

- 파일 참조 안정성: 통과
- 하단 내비 목업 일치: 실패
- 아이콘 애셋 적용 완성도: 부분 미완성
- 전체 UI 디자인 완성도: 하단 내비와 텍스트 아이콘 정리 전까지 목업 대비 미달
