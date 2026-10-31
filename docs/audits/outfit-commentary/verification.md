P2 홈 코디 코멘트 세분화 검증 기록

기준 HEAD: `2ce0ed8c1d7356f0dae92d2c20204754c18ca83e` + 작업 트리 변경임. 기존 미커밋 작업을 보존한 상태에서 검사함. 운영 배포·기기 설치·TestFlight 결과가 아님.

- 기존 `getWeatherSignals` 및 품목 선택 규칙을 재사용함. 별도 추천 엔진·랜덤 문구·새 이미지 생성 없음.
- 기본 옷차림과 이유를 먼저 유지하고, 강수·바람·눈 등 필요한 추가 행동을 붙임. 강한 강수의 방수 준비도 유지함.
- 홈 상단은 목적지 도착 무렵의 실제 시간별 예보를 사용함. 해당 시간 예보가 없으면 표시한 현재 기준으로만 안내함. 이 단일 시점에 일교차를 붙이지 않음.
- 홈 코디 카드의 문구와 이미지는 동일한 `state.outfit`을 사용함. iOS는 기존 `buildTodayOutfit`의 선택 위치·오늘 남은 시간 범위를 유지함. 다른 플랫폼의 기존 제공 예보 범위는 별도 표시함.
- 코디 이미지 선택은 추천 품목의 `imageUrl` → `getOutfitImageSource` → 번들 이미지/사용자 사진 흐름 그대로임. 품목이 없을 때 임의의 레인 재킷을 보여주던 대체 이미지를 제거함.
- 미래 시간별 체감온도·자외선·먼지를 현재 수치에서 추정하지 않음. 시간별 행동이 달라질 때만 추가 안내함. 확인 구간의 온도 차를 하루 전체 일교차로 단정하거나 실제 존재하는 겉옷을 뺐다고 말하지 않음.
- 온도 누락은 중립 문구와 품목 없음으로 유지함. stale/cache/fallback/위치 미확인은 중립 문구로 처리함. 날짜·시간대·관측 나이·부분 예보 방어를 유지함.

통과한 검사:

- `node scripts/check-outfit-commentary.mjs`: 추위+비, 더위+비, 강풍+낮은 체감온도, 강한 강수, 큰 기온 차, 평온, 누락·비정상 수치·stale/cache/fallback/위치 미확인, 온도 경계, 미래 강풍+비의 우산 모순, 시간별 행동 변경, 이미지 파일/품목, 한국어·영어·일본어, 실제 코디 카드 JSX 1/1.6/2배 글자 검사함.
- `node scripts/check-home-outing.mjs`: 기존 강수 단계·누락·신뢰도·시간대·도착/현재 구분 검사를 유지하고, 온도 경계를 공용 규칙 기준으로 보완함.
- `node scripts/check-home-refresh.mjs`: 갱신 대기/실패/새 자료/만료/위치 변경 검사를 통과함.
- `node scripts/check-today-outfit.mjs`: 남은 날짜 범위·시간대·관측/예보 누락·신뢰도·온도 존재 검사 통과함.
- `node scripts/check-shared-rules.mjs`: 새 설명 의도에 맞춰 보완함. 신뢰 가능한 추천 fixture와 fallback fixture를 분리하고 fallback의 중립 문구·빈 이유·빈 시간별 안내를 추가 검사함.
- `node scripts/generate-mobile-locales.mjs --check`: 2257개 메시지 검사 통과함.
- `npx tsc --noEmit -p apps/mobile/tsconfig.json`, `git diff --check` 통과함.
- `CI=1 npx expo export --platform web --output-dir /private/tmp/weatheron-p2-web-final` 통과함.

브라우저 검사:

- In-app browser로 실제 웹 앱의 홈 코디 설명 노출을 확인함.
- 실제 `HomeOutfitPreviewCard` JSX와 스타일, 공용 추천 결과, 번들 이미지를 추출한 임시 React Native Web 검증 화면을 사용함. 제품에 새 테스트 화면을 추가하지 않음.
- 390px 카드 폭에서 한국어·영어·일본어 2배 글자를 확인함. 7개 조건 카드의 가로 넘침 없음. 번들 이미지 로딩 및 누락 온도 카드의 이미지 0개를 확인함.
- 브라우저 글자 확대는 웹 검증용 모사임. iPhone의 실제 Dynamic Type 및 네이티브 화면 배치 확인을 대신하지 않음.

남은 한계:

- 실기기·TestFlight·Xcode Cloud 빌드는 수행하지 않음.
- `node scripts/check-weather-outfit-regressions.mjs`는 기존 테스트 로더가 `travelEstimate.ts`의 `./zonedDateTime` import를 제공하지 못해 중단됨. 진단 중 다음 기존 import(`../state/appStateHelpers`) 누락도 확인함. 해당 로더 변경은 남기지 않음. 독립적인 `check-outfit-cold-forecast.mjs` 구간은 통과함.
- `node scripts/check-android-product-quality.mjs`는 기존 `originCountryCode: originLocation.countryCode` 코드 문자열 검사에서 중단됨. 이번에 제거한 임의 대체 이미지·분리 문구 엔진에 대한 홈 문자열 검사는 새 의도에 맞춰 보완했으나 전체 Android 검사 통과로 주장하지 않음.

핵심 변경 소스 SHA-256:

- `apps/mobile/src/utils/homeOuting.ts`: `5d6b0328e02d8d544b59163cb7cd98a68309c3fc70d1c5478833dde22612872a`
- `packages/shared/src/rules/outfit.ts`: `b261244fb32edca8bb606a66c9e27f7e7244c6a562f3a608d672b724d65fbb4c`
- `apps/mobile/src/utils/todayOutfit.ts`: `df59b2ab016f8ccb8ca93a99c6cd692c46a5d181e2b428d1e6237dcbc4f8abcb`
- `apps/mobile/src/screens/HomeScreen.tsx`: `ce037cd799900835acfe2e6ff157e07480f4e7bc16bf4fb05de9c9ca55387851`
