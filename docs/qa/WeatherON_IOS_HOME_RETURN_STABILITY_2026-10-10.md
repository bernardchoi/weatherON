# iOS 홈 복귀 요소 정착 수정

## 실제 사용자 영상

공식 Library 흐름으로 KakaoTalk_Video_2026-10-10-18-37-55.mp4를 가져와 실제 프레임을 확인했다. 21.734초, 880×1920, 30fps 영상이다. 전체는 0.5초 간격, 홈 복귀 12.0–13.2초와 후반 19.7초부터 끝까지는 0.1초 간격으로 추출했다. 영상·캡처에는 개인 정보가 있어 Git에 넣지 않는다. Library 원본은 변경하지 않았다.

- 6초대 코디 이동, 9초대 상세 진입, 11초대 목록 복귀에서 이전 조사 때의 Home/Codi 본문 지속 중첩은 보이지 않는다. 상세 슬라이드의 양옆 화면 노출과 지속 중첩을 구분한다.
- 12.1초 홈 복귀에서 글과 카드가 먼저 보인다. 12.2초에 카드 간격이 줄고 기온 글자가 옅어지며 12.3초에는 정착한다. 전체 페이지의 프레임 저하라고 단정하지 않는다. 동일 내용의 재표시·레이아웃 정착 문제다.
- 20.0초대 시스템 오버레이 출입과 함께 날씨 확인 중 행이 나타난다. 20.5–20.6초, 21.1–21.2초, 21.4–21.5초에 목적지 안내가 확인 필요 문구로 바뀌었다가 정상 정보로 돌아온다. 이 부분은 값이 실제로 달라지는 데이터 갱신 상태이며 12초대 동일 값 재진입과 분리한다. 영상만으로 요청이 여러 번 발생한 세부 원인을 확정하지 않는다.

## 확인한 원인과 최소 수정

HomeValueTransition은 Animated.Value(1)로 본문을 먼저 표시한 뒤, 홈 재마운트마다 비동기 Reduce Motion 값이 null→false로 바뀔 때 effect가 다시 실행돼 opacity 0.72 / translateY 3부터 280ms 효과를 시작했다. 기온·안내·출발 각각에 이 hook이 있어 같은 정보가 개별적으로 다시 나타나는 인상을 만들었다. 실제 함수를 실행하는 회귀에서 unchanged visible temperature의 animation count가 기대 0 / 실제 1로 실패했다.

이제 iOS에서는 실제 value가 바뀔 때만 기존 효과를 실행한다. 최초 mount 및 접근성 조회/설정 변화만으로 같은 값에 효과를 재실행하지 않는다. Android 기존 효과는 유지했다. Reduce Motion 활성 시 즉시 정착하며, 실제 기온·안내 변경의 기존 효과도 유지했다. 새 진입 효과를 추가하지 않았다.

또한 HomeScreen의 viewportHeight useState(0)는 탭 왕복마다 초기화됐다. resolveHomeViewportSpacing(0)은 넓은 여백, 실제 800pt 미만 측정 결과는 좁은 여백을 선택해 최초 프레임 다음 카드가 이동했다. 측정 상태를 수명이 유지되는 iOS NavigationStack의 실제 콘텐츠 프레임으로 옮기고 Context로 Home에 전달했다. safe area·하단 dock을 제외한 같은 크기를 사용한다. 홈 복귀 첫 렌더부터 이전 측정값을 사용하며 실제 프레임 크기 변경은 계속 반영한다. 최초 앱 시작의 첫 측정 전에는 기존 fallback이며 스플래시 아래에서 측정된다.

네이티브 화면 스택 동작·전환 설정, 레이아웃 확정값·폰트·터치·스크롤, Glass와 Ambient, 데이터 신뢰도/예보 부재 표현은 변경하지 않았다. 확인 중 데이터를 정상 값으로 위장하거나 숨기지 않았다. 후반 데이터 갱신의 문구 변화는 이번 두 원인의 수정만으로 해결됐다고 주장하지 않는다.

## 검증

- scripts/check-home-return.mjs: 실제 HomeValueTransition의 mount→접근성 조회→동일 값→새 값→Reduce Motion을 실행. 수정 전 실패, 수정 후 PASS. 실제 IosStack의 높이 측정→Home/Codi/Home/Departure/Home→크기 변경도 실행해 높이 유지 PASS.
- check-home-viewport, check-home-outing, check-ambient-surface-regressions, check-home-ambient-host, check-today-outfit, check-weather-outfit-regressions PASS. 모바일 tsc --noEmit 및 git diff --check PASS.
- Xcode 27 기존 DerivedData·프로파일, ARM64 / jobs1 증분 빌드 1회 성공. codesign strict 검증 후 데이터 삭제 없이 덮어 설치하고 override 없는 정상 실행 성공.
- 설치 bundle SHA256: 2eb2101e88cebae6b002878af79d176001f716edaaa63843b44d2ffeaf7915b1.
- 실기기 미러링에서 iPhone 사용 중 / 연결하려면 잠금 필요 응답. 사용자에게 잠금 후 검증 재개를 요청했다. 이 시점에서는 수정본 왕복 UI 확인 및 사용자 체감 PASS를 아직 선언하지 않는다.

기존 눈 안내·코디 오늘 범위 미커밋 변경은 모두 보존했다. 새 의존성·권한·시스템 설정·데이터 삭제·커밋·푸시 없음. 로그와 실제 영상 프레임은 Git 밖 evidence/home-return-20261010에 보관한다.


## 사용자 확인 및 후반 데이터 문구 진단

사용자가 설치본을 직접 확인하고 “안정적으로 잘 나온다!”라고 보고했다. 이를 홈 복귀 요소 안정성의 사용자 확인 PASS로 기록한다. 모든 날씨·접근성·성능 시나리오 PASS로 확대하지 않는다. 사용자 잠금 후 미러링 연결도 재개됐고 Home→코디→Home 및 코디 상세 정착을 확인한 뒤 Home으로 복귀했다. 첫 코디→Home 캡처는 입력 요청 이후 1118/1169/1219ms에 같은 기온·안내·카드 간격을 보였다. 이것은 0–280ms 구간을 촬영한 고속 영상이 아니므로 초기 효과 제거의 직접 프레임 증명으로 쓰지 않는다. 사용자 실체감 확인과 실제 함수 회귀 검사를 함께 근거로 삼는다. 사용자 통과 보고 이후 동일 검증 반복과 효과 수정은 중단했다.

후반 문구 변화는 실제 새 날씨 수치 변화만으로 설명되지 않는다. weatherProvider.ts의 getSnapshots 시작 시 모든 위치의 메모리 캐시를 markSnapshotStale로 초기화한다. 현재 위치 응답이 먼저 끝나면 publish/onUpdate가 호출되어 목적지의 아직 유효한 이전 스냅샷도 stale:true 상태로 UI에 전달된다. buildHomePreparation은 stale 자료에서 중립 문구 및 새로 확인 필요 표시를 반환한다. 목적지 응답이 나중에 도착하면 원래 문구로 돌아온다. 이는 React의 동일 데이터 재렌더만으로 발생한 것이 아니라, 공급자 중간 결과가 신뢰도 플래그를 실제로 변경한 것이다.

외부 네트워크 없이 실제 createWeatherProvider, WeatherKit 정규화, buildHomePreparation을 연결한 재현을 실행했다. 먼저 22도 정상 자료를 받고, 같은 22도 자료로 갱신하되 목적지 응답만 지연했다. 새 온도 없이도 다음 assertion이 실패했다: 기대 “편한 차림으로,\n기분 좋게 나가요.” / 실제 “나가기 전, 가는 곳 날씨를\n같이 확인해요.”. 온도는 그대로 22도였다. 재현 스크립트는 Git 밖 evidence/home-return-20261010/check-home-refresh-repro.mjs에 보관했다. 이 검사는 발견된 미수정 동작을 잡는 RED 재현이며 PASS로 표기하지 않는다.

영상의 20.5–20.6초와 21.1–21.2초 등의 안내 교체는 위 중간 stale 경로와 문구가 일치한다. 다만 영상 당시 원시 응답·요청 로그는 없으므로 각 교체의 원인을 모두 확정하거나 실제 새 데이터가 전혀 없었다고 단정하지 않는다. 별도로 isWeatherLoading의 확인 중 행이 추가/제거되면 아래 요소가 이동하고, AppState active에서 날씨 갱신과 위치 재동기화가 각각 실행된다. 새 위치 객체는 경로 재요청도 유발할 수 있어 “경로 확인 중”까지 관찰되지만, 영상 당시 실제 좌표 변경 여부는 미확인이다.

최신 사용자 지시에 따라 안정화된 설치본은 그대로 두고 진행 중 진단을 마무리했다. 공급자/후반 데이터 처리에 추가 소스 수정·빌드·설치는 하지 않았다. 다음 수정 시에는 같은 위치의 신선한 자료를 단지 요청 pending이라는 이유로 stale 처리하지 않되, 실제 만료·오류·다른 위치·새 응답 변화는 그대로 반영하는 경계가 필요하다. 이는 완료된 홈 재진입 효과 수정과 분리된 남은 항목이다.


## 후속 승인: 갱신 중 유효한 안내 유지

앞 절의 미수정 진단 이후 사용자가 최소 공급자 수정을 승인하여 적용했다. iOS ready 갱신은 동일 locationId·국가·시간대의 검증된 WeatherKit 자료이고 관측 시각이 현재보다 미래가 아니며 15분 미만일 때만 pending 중 기존 신뢰도를 유지한다. 안내 문자열을 저장하지 않고 원래 snapshot을 전달하므로 선택 시각 변경은 계속 새로 계산한다. 만료·미검증·오류·다른 위치·해당 시각 예보 부재를 정상 정보로 꾸미지 않는다. 실제 새 응답은 그대로 반영한다. Android와 명시적 stale/error 모드의 pending 처리는 유지했다.

실제 갱신 실패는 메모리 캐시에도 stale을 반영하여 다음 재시도 도중 정상 안내가 잠깐 살아나지 않게 했다. 요청 시작의 캐시와 현재 캐시가 같을 때만 무효화하므로 늦게 실패한 이전 요청이 더 최근 성공 자료를 훼손하지 않는다. 홈 진입 효과·레이아웃·Glass·Ambient는 이 후속 수정에서 변경하지 않았다.

- scripts/check-home-refresh.mjs: 실제 production provider와 Home 안내 함수를 실행하여 동일 22도 pending 유지, 만료/잘못된 관측 시각/미검증/다른 위치·국가·시간대, 실제 오류와 재시도, 새 4도 응답, 선택 시각 변경·예보 부재, 동시 요청의 늦은 실패를 검증해 PASS. 기존 RED 재현의 실패 원인을 해결했다.
- check-ios-reliability, check-home-return, check-home-viewport, check-home-outing, 모바일 tsc --noEmit 및 git diff --check PASS.
- 기존 DerivedData·프로파일 ARM64/jobs1 증분 빌드 1회 성공, codesign --verify --strict 성공, 앱 데이터 삭제 없이 설치 성공. bundle SHA256: b96fbf07df8f2ce6e11f8f065cdb65bf06b2289de13a5b98329256bb037c1743.
- CLI 실행은 기기 잠금으로 실패했지만 기존 iPhone 미러링을 재개하고 실제 WeatherON 아이콘으로 정상 실행했다. 테스트 override·Metro·시스템 테마 변경 없이 현재 21도, 목적지 22도, 친근한 준비 안내와 09:06 출발 정보를 확인했다. 앱을 배경으로 보냈다가 아이콘으로 돌아온 후에도 같은 정상 안내와 카드 구성을 확인했다.
- 이 실기기 관찰은 정상 실행과 복귀 후 정착 상태 확인이다. pending 순간 전 구간의 연속 고속 촬영이나 네트워크 오류·만료를 실기기에서 재현한 검증은 아니다. 당겨서 새로고침 시도는 실제 요청 발생을 확인하지 못했으므로 해당 제스처 PASS로 세지 않는다. pending/error 경계는 위 결정적 함수 회귀의 근거로 구분한다. 최신 설치본에 대한 사용자 체감 승인 및 모든 날씨·접근성 전체 PASS를 선언하지 않는다.

빌드·설치·기존 회귀 로그와 bundle hash는 Git 밖 ../evidence/home-refresh-20261010에 보관한다. 작업용 node_modules 링크와 DeviceQA Xcode 복사본은 검증 후 제거했다. 이전 미커밋 변경을 보존했으며 커밋·푸시·시스템 설정 변경은 없다.


## 커밋 전 재검토

사용자가 관련 변경 전체의 커밋·동일 브랜치 푸시를 승인했다. 위 미커밋/푸시 없음 문장은 각 작업 당시의 이력이다. 눈 안내, iOS 오늘 코디 범위·최신성, 홈 복귀 동일 값/높이 안정화, 갱신 pending 유효자료 유지와 테스트·QA 문서를 함께 검토했다. 개인 원본 영상/캡처·기기 로그·빌드 산출물은 Git 밖에 유지한다.

커밋 전 check-home-outing, check-today-outfit, check-home-return, check-home-refresh, check-home-viewport, check-ios-reliability, check-weather-outfit-regressions, check-ambient-surface-regressions, check-home-ambient-host, 모바일 TypeScript noEmit, 번역 2,168개 및 diff 공백 검사 PASS. 기존 설치 이후 제품 소스를 추가 변경하지 않았고 네이티브 빌드를 반복하지 않았다. 사용자 PASS는 앞서 명시한 홈 복귀 안정성 범위이며, 연속 갱신 영상·접근성 전체·실기기 오류/예보 누락 주입 검증은 여전히 완료로 표시하지 않는다.
