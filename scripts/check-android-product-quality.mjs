import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();

const requiredFiles = [
  "apps/mobile/src/providers/appStorage.ts",
  "apps/mobile/src/navigation/routeLabels.ts",
  "scripts/check-android-core-flow.mjs",
  "scripts/check-android-usable-mvp.mjs",
  "scripts/check-weather-proxy-cache.mjs",
  "docs/architecture/WeatherON_ANDROID_PRODUCT_QUALITY_AUDIT.md",
  "docs/architecture/WeatherON_ANDROID_WEB_EXPORT_QA.md",
];

for (const relativePath of requiredFiles) {
  assert.ok(existsSync(join(rootDir, relativePath)), `required quality artifact is missing: ${relativePath}`);
}

assertSourceIncludes("apps/mobile/src/theme/tokens.ts", [
  'warm: "#E8854A"',
  'alert: "#E97F77"',
  'warm: "#C84A2F"',
  'alert: "#B42318"',
]);
const forbiddenNonTokenColorSnippets = [
  "#C4B5FD",
  "#B894FF",
  "rgba(167,139,250",
  "rgba(196,181,253",
  "#51ACE6",
  "#F2A92E",
  "#ff8a42",
];
for (const relativePath of listFiles(["apps/mobile/src"])) {
  assertSourceExcludes(relativePath, forbiddenNonTokenColorSnippets);
}

assertSourceIncludes("apps/mobile/src/state/useWeatherOnAppState.ts", [
  'useState<AppRouteId>("O1")',
  "readAppJson",
  "writeAppJson",
  "weatherProviderResultStorageKey",
  "readPersistedWeatherProviderResult",
  "savePersistedWeatherProviderResult",
  "weatherLoadedFromNetworkRef",
  "최근 저장 예보 기준 추천",
  "originCountryCode: originLocation.countryCode",
  "setRoute(persistedState.onboardingCompleted ? \"H1\" : \"O1\")",
  "startAccountGate",
  "const result = await requestDeviceWeatherLocation()",
  "account-connect",
  'if (reason === "account-connect") return "계정 연결"',
  'setRoute(accountLinked ? "A3" : "A2")',
  'if (permissionGate?.reason === "destination-care")',
  "saveSelectedDestination(false)",
  'case "G2":',
  'return "G1";',
  'setRoute("M1");',
  "styleProfileReturnRoute",
  'if (nextRoute === "O4" && isP0Route(route))',
]);

assertSourceIncludes("apps/mobile/src/utils/locationDisplay.ts", [
  "getDisplayLocationName",
  "isGenericCurrentLocationName",
  'normalized === "현재 위치"',
  '"내 위치 주변"',
]);
assertSourceIncludes("apps/mobile/src/providers/weatherLocations.ts", [
  'locationName = "내 위치 주변"',
]);

assertSourceIncludes("apps/mobile/src/navigation/AppNavigator.tsx", ["BackHandler", "goBack"]);
assertSourceIncludes("apps/mobile/src/navigation/AppNavigator.tsx", [
  'route === "O4" && appState.styleProfileReturnRoute',
  "activeRoute={appState.styleProfileReturnRoute}",
]);
assertSourceIncludes("apps/mobile/src/config/weatherEnv.ts", [
  '"fixture" | "proxy" | "openmeteo"',
  'if (!value) return "openmeteo"',
  'if (value === "openmeteo") return "openmeteo"',
  'if (value === "fixture") return "fixture"',
  'return "openmeteo"',
]);
assertSourceIncludes("apps/mobile/src/providers/weatherClient.ts", [
  "createOpenMeteoWeatherClient",
  "KMA forecast is disabled in Open-Meteo weather mode",
  'if (config.clientMode === "openmeteo")',
  "return openMeteoClient",
]);
assertSourceIncludes("apps/mobile/src/providers/weatherProvider.ts", [
  "runtimeWeatherProvider",
  "normalizeKmaWeather",
  "fetchWeatherSnapshot",
  "shouldUseKmaForecast",
  'getWeatherRuntimeConfig().clientMode === "proxy"',
  "client.fetchKmaForecast",
  "client.fetchOpenMeteoForecast",
  "fetchOpenMeteoSnapshot",
]);
assertSourceIncludes("apps/server/src/index.mjs", [
  "DEFAULT_WEATHER_CACHE_TTL_MS",
  "forecastCache",
  "placeSearchCache",
  "fetchCachedJson",
  "if (cached) return cached.payload",
  "getUrlCacheKey(\"kma\", url, [\"serviceKey\"])",
]);
assertSourceIncludes("scripts/check-weather-proxy-cache.mjs", [
  "API rate limit exceeded",
  "WEATHER_CACHE_TTL_MS: \"1\"",
  "assert.equal(kmaRequestCount, 2)",
  "weather proxy cache check passed",
]);
assertSourceExcludes("apps/mobile/src/state/useWeatherOnAppState.ts", ["fixtureWeatherProvider"]);
assertSourceIncludes("apps/mobile/src/navigation/routeLabels.ts", ["getRouteLabel", "계정 연결", "권한 설정", "정책"]);
assertSourceIncludes("apps/mobile/src/navigation/routes.ts", ['label: "출발"', "isLaunchHiddenRoute", 'id: "H3"', 'id: "S1"']);
assertSourceExcludes("apps/mobile/src/navigation/routes.ts", ['  "C1",\n  "C2",\n  "C3",\n  "C4",', '  "O4",\n  "R3",']);
assertBottomNavRoutes("apps/mobile/src/navigation/routes.ts");

assertSourceIncludes("apps/mobile/src/components/BottomNav.tsx", ["getActiveTabRoute", 'route === "C1" || route === "C2" || route === "C3" || route === "C4"', 'return "C1";', 'return "H1";', 'route === "H3" || route === "H4" || route === "H5"', 'route === "G2"']);
assertSourceExcludes("apps/mobile/src/components/BottomNav.tsx", [">{route.id}</Text>", "route.id}</Text>"]);
assertSourceIncludes("scripts/check-android-core-flow.mjs", [
  "assertClearOfBottomNav",
  "bottom nav overlap risk",
  "checkOutfitLaunchFlow",
  "checkOutfitSaveGateFlow",
  '"코디 탭"',
  "checkNotificationPermissionRecovery",
  "checkPersistedWeatherFallbackFlow",
  "checkAlertSettingsDestinationEmptyFlow",
  "checkDestinationAddUiPersistenceFlow",
  "checkNotificationCenterDeepLinkFlow",
  "checkDestinationPersistenceFlow",
  "destinationAddUi",
  "notificationCenter",
  "alertSettingsNoDestination",
  "waitForPersistedDestination",
  "waitForPersistedDestinationSchedule",
  "waitForNotificationHistoryOpen",
  "waitForAlertPreference",
  "assertAriaIncludes",
  "persistedDestination",
  "푸시 알림 대기",
  "푸시 알림은 나중에",
  "강수 상세, 꺼짐",
  "비 시작 전·그칠 시각",
  "앱 권한 관리",
  "5초 뒤 확인 알림 발송",
  "위치 권한",
  "알림 설정으로 이동",
  "잠실종합운동장 알림",
  "목적지 기준 알림 미리보기",
  "weatheron.weatherProviderResult.v1",
  "forced weather offline",
  "최근 예보로 유지 중",
  "목적지 추가 필요",
  "알림 저장은 계정 연결 후 적용",
  "목적지 추가",
  "검색어 지우기",
  "동 읍 면 검색",
  "저장한 위치",
  "savedDestinations: [destination]",
  "알림 1/1",
  "목적지 필요",
  "장소 선택 필요",
  "도착 희망 시각",
  "경로 확인 전",
  "외출 가이드",
  "우산 추천",
  "정책 및 법적 고지",
  "assertNoText",
]);
assertSourceIncludes("package.json", [
  '"check:android-small-screen-layout": "node scripts/check-android-small-screen-layout.mjs"',
  '"check:android-usable-mvp": "node scripts/check-android-usable-mvp.mjs"',
]);
assertSourceIncludes("scripts/check-android-usable-mvp.mjs", [
  "check:android-core-flow",
  "check:android-small-screen-layout",
  "WEATHERON_WEB_PREVIEW_URL",
  "startStaticServer",
  "android usable MVP check passed",
]);
assertSourceIncludes("scripts/check-android-small-screen-layout.mjs", [
  "{ name: \"compact\", width: 360, height: 800 }",
  "{ name: \"large-phone\", width: 430, height: 932 }",
  "horizontal document overflow",
  "clipped button text",
  "small touch target",
  "duplicate accessible button label",
  "확인 알림",
  "목적지 출발",
  "notification-sidebar",
]);
assertSourceIncludes("apps/mobile/src/screens/DestinationListScreen.tsx", [
  "getDestinationResultBanner",
  "accountGateResult",
  "permissionGateResult",
  "목적지 저장 완료",
  "recentlyRemovedDestination",
  "RemovedDestinationBanner",
  "목적지 삭제됨",
  "목적지 복구",
  "다음 행동 · 복구된 목적지 알림 확인",
  "getDestinationActionText",
  "getDestinationSchedule",
  "알림 켬",
  "목적지를 누르면 날씨와 출발 준비를 자세히 볼 수 있어요",
  "onRestoreRemovedDestination",
]);
assertSourceExcludes("apps/mobile/src/screens/DestinationListScreen.tsx", [
  'onNavigate("G3")',
  "여행 플래너 열기",
  "목적지 검색 추가",
  "목적지 검색 · 추가",
  "searchRail",
  "handleNestedAction",
  "상단 목적지 추가",
  "dashedAdd",
  "＋ 목적지 추가",
]);
assertSourceExcludes("apps/mobile/src/screens/DestinationListScreen.tsx", ['title: index === 0 ? "회사"']);
assertSourceIncludes("apps/mobile/src/screens/DestinationAddScreen.tsx", [
  "장소 선택",
  "장소를 고르면 케어 기준이 맞춰짐",
  "주소와 거리 확인 후 선택",
  "목적지 저장하고 비교",
  'onSaveDestination("G2")',
  "SearchRecoveryButton",
  "검색어 지우기",
  "목적지 검색어 지우기",
  "다시 시도하거나 검색어를 지워 주세요",
  "검색 결과에서 주소와 국가를 확인 후 선택",
  "getPlaceDistanceLabel",
  "getResultSortLabel",
  "가까운 순",
  "해외 ·",
  "getOverseasDistanceLabel",
  "placeCountryCode !== currentCountryCode",
  "동명이름",
  "getProviderLabel",
  "getDuplicateNameCounts",
]);
assertSourceIncludes("apps/mobile/src/screens/OnboardingDestinationScreen.tsx", [
  "destinationSelectionReady",
  "canUseSelection",
  "목적지 선택 필요",
  "장소 검색 후 선택",
  "기본 후보는 저장하지 않음",
  'canUseSelection ? onSaveDestination("G2") : onNavigate("P1")',
]);
assertSourceExcludes("apps/mobile/src/screens/DestinationAddScreen.tsx", [
  'onRequireAccount("destination-care", "G1")',
  'onRequireAccount("destination-care", "P1")',
  "계정 연결하고 저장",
  "계정 필요",
  "게스트 미리보기",
  "약관 동의하고 저장",
  "약관 동의 필요",
  ">DESTINATION<",
  ">DESTINATION CARE<",
  "letterSpacing: 1.7",
]);
assertSourceIncludes("apps/mobile/src/screens/TermsConsentScreen.tsx", [
  "전체 동의 해제",
  "`${item.label} ${checked ? \"동의 해제\" : \"동의\"}`",
  "actionPanel",
  "동의하고 계속",
  "필수 동의 필요",
]);
assertSourceIncludes("apps/mobile/src/screens/OutfitDetailScreen.tsx", [
  "needsTerms",
  "약관 동의 후 저장",
]);
assertSourceIncludes("apps/mobile/src/screens/OutfitScreen.tsx", [
  "ownedRecommendedCount",
  "wardrobeCaption",
  "내 옷장",
  "프리셋 기준 추천",
]);
assertSourceIncludes("apps/mobile/src/screens/WardrobeScreen.tsx", [
  "내 옷장에 추가",
  "내 옷장에서 삭제",
]);
assertSourceIncludes("apps/mobile/src/screens/StyleProfileScreen.tsx", [
  "onboardingCompleted",
  "저장하고 코디로",
  "저장하면 코디 추천에 바로 반영",
  "primaryReturnTo",
]);
assertSourceIncludes("apps/mobile/src/screens/PermissionGateScreen.tsx", [
  "actionPanel",
  "gateReady",
  'gateReady ? "허용됨" : "대기"',
  "primaryLabel",
  "목적지는 먼저 저장할 수 있어요",
  "권한은 따로 설정해요",
  "계정 연결과 별도 · 나중에 변경 가능",
  "저장·동기화와 무관한 선택 권한",
  "계정 설정과 분리됨",
  "알림은 나중에 켜도 출발 탭에서 비교 가능",
  "알림 권한은 선택 사항이에요. 목적지는 출발 탭에 먼저 저장돼요",
  "알림 없이 저장",
  "저장 후 사용",
  "목적지 저장",
  "알림 없이 저장해도 목적지 비교와 출발 시간은 바로 사용할 수 있음",
  "현재 위치 기준 홈 반영됨",
  "비 알림 받을 수 있음",
]);
assertSourceExcludes("apps/mobile/src/screens/PermissionGateScreen.tsx", ["거부 상태", "readyCount", "${readyCount}/2"]);
assertSourceIncludes("apps/mobile/src/screens/AccountConnectScreen.tsx", [
  "다음 단계",
  "약관 확인 후 원래 화면으로 돌아감",
  "위치·알림 권한은 계정과 별도",
  "사용할 계정 방식을 선택",
]);
assertSourceIncludes("apps/mobile/src/providers/localNotifications.ts", [
  "verification-failed",
  "countScheduledNotifications",
]);
assertSourceIncludes("apps/mobile/src/providers/travelEstimateClient.ts", [
  "getInternationalFallbackTravelMinutes",
  "해외 목적지 기본 이동시간",
]);
assertSourceIncludes("packages/shared/src/fixtures/placeSearchFixtures.ts", [
  "도쿄 역",
  "東京駅",
  "신사이바시역",
  "Shinsaibashi Station",
  "난바역",
  "Namba Station",
  "localizePlaceSearchResults",
  "센트럴 파크",
]);
assertSourceIncludes("apps/mobile/src/screens/MyScreen.tsx", [
  "오늘 준비",
  "확인 필요한 항목 있음",
  "ReadinessSummary",
  "readinessCard",
  "needsTerms",
  "약관 동의 필요",
  "약관 동의 이어가기",
  "필수 약관 동의 후 저장·동기화 가능",
  "표시 설정",
  "앱 권한 관리",
  'onNavigate("M4")',
  "getAlertState",
  "getLocationState",
  "getGlobalSettingsSummary",
  "수동 위치",
  "알림 나중에 설정",
  "푸시는 대기 · 앱 안 판단 유지",
  "savedDestinations",
  "관리",
  "정책 및 법적 고지",
  "WeatherON v0.1.0",
]);
assertSourceExcludes("apps/mobile/src/screens/MyScreen.tsx", ["개인정보처리방침", "코디·옷장", 'onNavigate("C1")']);
assertSourceIncludes("apps/mobile/src/screens/AppPermissionsScreen.tsx", [
  "앱 권한 관리",
  "권한 상태",
  "위치 권한",
  "알림 권한",
  "위치 권한 보류",
  "알림 권한 보류",
  "위치 권한 복구",
  "알림 권한 복구",
  "수동 위치와 목적지 검색은 계속 사용할 수 있음",
  "홈·출발 판단은 유지되며 실제 푸시만 제한됨",
  "PermissionCard",
  "secondaryLabel",
  "getLocationPermissionCopy",
  "getNotificationPermissionCopy",
  "getPermissionResultCopy",
  'onRequestPermissionGate("location", "M4")',
  'onRequestPermissionGate("notification", "M4", "general")',
  'onNavigate("H2")',
  'onNavigate("M2")',
]);
assertSourceIncludes("apps/mobile/src/screens/GlobalSettingsScreen.tsx", [
  "표시 설정",
  "현재 적용",
  "투명 효과",
  "getDistanceUnitLabel",
  "accessibilityState={{ checked",
]);
assertSourceExcludes("apps/mobile/src/screens/GlobalSettingsScreen.tsx", [
  "2곳 저장됨",
  "앱 권한 관리",
  "위치 관리",
  "위치 권한",
  "알림 권한",
  "알림 권한 관리",
  "무게",
  "킬로그램",
  "파운드",
  "getWeightUnitLabel",
  "getLocationPermissionCopy",
  "getNotificationPermissionCopy",
  "getLocationState",
  "getNotificationState",
  "현재 위치 확인 필요 · 목적지",
  "수동 위치 적용",
  "알림 나중에 설정",
]);
assertSourceIncludes("apps/mobile/src/screens/AccountManagementScreen.tsx", [
  "계정 관리",
  "accountReady",
  "needsTerms",
  "profileTitle",
  "연결된 계정",
  "저장·동기화 사용 가능",
  "약관 동의",
  "필수 약관 동의 이어가기",
  "약관 동의 완료",
  'onRequireAccount("account-connect", "A4")',
  "로그아웃 확인",
  "계정 작업 취소",
]);
assertSourceExcludes("apps/mobile/src/screens/AccountManagementScreen.tsx", [
  'onRequireAccount("notification", "A4")',
  ">마이페이지<",
  "구독 관리",
  "데이터 내보내기",
  "연결 상태",
  "계정 준비 완료",
  "게스트 모드",
  "저장 · 동기화 사용 가능",
  "savedDestinationCount",
  "목적지 관리",
  "알림 설정",
  'onNavigate("G1")',
  'onNavigate("M2")',
  'onNavigate("G6")',
  "내보낼 데이터",
]);
assertSourceIncludes("apps/mobile/src/screens/PolicyHubScreen.tsx", [
  "MY로 돌아가기",
  "`${item.title}, ${item.body}`",
  "개인정보처리방침",
  "오픈소스 라이선스",
]);
assertSourceExcludes("apps/mobile/src/screens/PolicyHubScreen.tsx", [
  "PolicyQuickItem",
  "quickPanel",
  "알림 설정",
  "계정 관리",
  "위치 설정",
  'onNavigate("M2")',
  'onNavigate("A4")',
  'onNavigate("H2")',
]);
assertSourceIncludes("apps/mobile/src/screens/PolicyDocumentScreen.tsx", [
  "상단 정책 목록으로 돌아가기",
  "약관 동의 화면의 개인정보 수집·이용 동의 항목과 같은 기준임",
  "위치 변경, 권한 요청, 목적지 케어 화면과 같은 위치 기준을 사용함",
  "약관 동의와 동일 기준",
  "MY에서 위치·알림 설정 확인",
]);
assertSourceExcludes("apps/mobile/src/screens/PolicyDocumentScreen.tsx", [
  "A3 약관",
  "H2 위치",
  "O3 권한",
  "G2 목적지",
]);
assertSourceIncludes("apps/mobile/src/screens/WeatherReportScreens.tsx", ["위치 권한 필요 · 권한 설정에서 허용"]);
assertSourceExcludes("apps/mobile/src/screens/WeatherReportScreens.tsx", ["위치 권한 필요 · O3"]);
assertSourceIncludes("apps/mobile/src/screens/AlertSettingsScreen.tsx", [
  "alertPreferences",
  "onToggleAlertPreference",
  "고급 알림 기준",
  "deliveryReady",
  "DeliveryCheckCard",
  "DeliveryLine",
  "advancedEnabledCount",
  "getAlertReadinessCopy",
  "getNotificationPermissionResult",
  "푸시는 대기 상태이며 홈·출발 판단은 계속 사용할 수 있음",
  "고급 설정 닫기",
  "AdvancedToggleRow",
  "목적지 출발",
  "목적지 추가 필요",
  "DeliveryCheckCard",
  "푸시 확인",
  "목적지 필요",
  'onNavigate(destinationReady ? "G1" : "P1")',
]);
assertSourceExcludes("apps/mobile/src/screens/AlertSettingsScreen.tsx", [
  "목적지·여행",
  'onNavigate("P3")',
  "날씨·코디",
  "여행 D-1",
  "계정 연결 후 목적지 알림 저장",
  "알림 저장은 계정 연결 후 적용",
  "onRequireAccount",
]);
assertSourceIncludes("apps/mobile/src/screens/LocationChangeScreen.tsx", [
  "hasSavedDestinations",
  "locationSectionTitle",
  "getLocationCopy",
  "현재 위치 권한은 나중에 설정 · 수동 위치 사용 가능",
  "수동 위치 적용 중 · GPS 없이도 홈 날씨 기준 유지",
  "currentLocationAction",
  "getDeviceLocationStatusCopy",
  "activeWeatherPlace",
  "applySelectedPlace",
  "onSelectWeatherLocation(activeWeatherPlace)",
  "권한 거부됨 · 수동 위치로 계속 가능",
  "LocationRecoveryButton",
  "showShortQueryHint",
  "2글자 이상 입력하면 위치 후보를 검색함",
  "다시 검색",
  "위치 검색어 지우기",
  "검색어는 유지됨 · 다시 검색하거나 지워서 새로 시작 가능",
  "검색 결과",
  "홈에 적용",
  "새 위치 저장",
]);
assertSourceExcludes("apps/mobile/src/screens/LocationChangeScreen.tsx", [
  "onSelectDestinationPlace(activeWeatherPlace)",
  "savedPlaces",
  'label={accountLinked ? "위치 저장됨" : "게스트로 적용"}',
  'label={accountLinked ? "계정 연결됨" : "계정 연결"}',
  "검색어 ${placeSearchQuery",
]);
assertSourceIncludes("apps/mobile/src/state/useWeatherOnAppState.ts", [
  "permissionCompleted = result.status === \"granted\"",
  "createPermissionGateSkipResult(permissionGate.reason, permissionGate.returnTo)",
  "setDeviceWeatherLocation(null)",
  "setWeatherLocationMode(\"manual\")",
  "defaultAlertPreferences",
  "normalizeAlertPreferences",
  "notificationDeliveryStatus",
  "setNotificationDeliveryStatus",
  "getLocalNotificationResultLabel",
  "toggleAlertPreference",
  "getAlertSettingsFocusFromRoute",
  'record.provider === "openmeteo"',
]);
assertSourceExcludes("apps/mobile/src/providers/deviceLocation.ts", [
  "seongsuWeatherLocation",
  "location: seongsuWeatherLocation",
]);
assertSourceIncludes("apps/mobile/src/providers/placeSearchClient.ts", [
  "createOpenMeteoPlaceSearchClient",
  "DEFAULT_OPEN_METEO_GEOCODING_URL",
  'provider: "openmeteo"',
  "normalizeOpenMeteoPlaces",
  "if (query.length < 2) return []",
]);
assertSourceExcludes("apps/mobile/src/providers/placeSearchClient.ts", [
  "catch {\n        return [];\n      }",
]);
assertSourceIncludes("apps/mobile/src/providers/travelEstimateClient.ts", [
  "createProxyTravelEstimateClient",
  'new URL("/routes/estimate"',
  "fallbackTravelEstimateClient",
  "estimateFallbackRoute",
  "runtimeTravelEstimateClient",
]);
assertSourceIncludes("apps/server/src/index.mjs", [
  "DEFAULT_KAKAO_LOCAL_KEYWORD_URL",
  "DEFAULT_KAKAO_DIRECTIONS_URL",
  'url.pathname === "/routes/estimate"',
  "searchKakaoPlaces",
  "estimateKakaoRoute",
  "estimateFallbackRoute",
  'Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`',
]);
assertSourceIncludes("apps/mobile/src/providers/localNotifications.ts", [
  "expo-notifications",
  "checkLocalNotificationPermission",
  "requestLocalNotificationPermission",
  "scheduleLocalNotificationTest",
  "syncLocalWeatherNotifications",
  "addLocalNotificationResponseListener",
  "addNotificationResponseReceivedListener",
  "getLastNotificationResponseAsync",
  "clearLastNotificationResponseAsync",
  "subscription.remove()",
  "setNotificationChannelAsync",
  "scheduleNotificationAsync",
  "smartNotificationIdentifierPrefix",
  "cancelSmartScheduledNotifications",
  "getAllScheduledNotificationsAsync",
  "cancelScheduledNotificationAsync",
  "identifier.startsWith(smartNotificationIdentifierPrefix)",
  "WeatherON 확인 알림",
  "seconds: 5",
  "weatheron-smart-care",
  "Platform.OS === \"web\"",
]);
assertSourceExcludes("apps/mobile/src/providers/localNotifications.ts", [
  "cancelAllScheduledNotificationsAsync",
]);
assertSourceIncludes("apps/mobile/src/state/useWeatherOnAppState.ts", [
  "AppState.addEventListener",
  "addLocalNotificationResponseListener",
  "checkLocalNotificationPermission",
  "getP0RouteFromNotificationPayload",
  "if (!appStateHydrated) return",
  "isLaunchHiddenRoute(route) ? \"H1\" : route",
  "reconcileNotificationPermission",
  "sendTestNotification",
  "scheduleLocalNotificationTest",
  "openNotificationDeepLink(payload.ruleId ?? \"local-notification\", routeFromPayload)",
  "result.status === \"unavailable\"",
  "requestLocalNotificationPermission",
  "syncLocalWeatherNotifications",
  "shouldScheduleLocalNotification",
  "localNotificationSyncKeyRef",
  "preferences: alertPreferences",
  "saveSelectedDestination(permissionCompleted)",
]);
assertSourceIncludes("apps/mobile/src/state/useWeatherOnAppState.ts", [
  "DestinationRepeatDay",
  "repeatEnabled",
  "repeatDays",
  "toggleSelectedDestinationRepeat",
  "toggleSelectedDestinationRepeatDay",
  "normalizeDestinationSchedulePreference",
  "isDestinationRepeatDay",
]);
assertSourceIncludes("apps/mobile/app.json", [
  "POST_NOTIFICATIONS",
]);
assertSourceIncludes("apps/mobile/android/app/src/main/AndroidManifest.xml", [
  "android.permission.POST_NOTIFICATIONS",
  "com.google.firebase.provider.FirebaseInitProvider",
  'tools:node="remove"',
]);
assertSourceIncludes("apps/mobile/src/screens/HomeScreen.tsx", [
  "buildHomeDecision",
  "buildDestinationDiff",
  "buildRainWindow",
  "decisionHero",
  "HomeDecisionHero",
  "VisualDecisionCard",
  "HomeOutfitPreviewCard",
  "const HOME_OUTFIT_CARD_VISIBLE = true;",
  "HOME_OUTFIT_FALLBACK_IMAGE",
  "outfitImageAssets",
  "getTodayMinMax",
  "FeelsLikeCard",
  "DecisionMetric",
  "WeatherStatusPanel",
  "destinationReady",
  "목적지 추가",
  "나갈 시간",
  "비 완화",
  "챙길 것",
  "오늘 코디",
  "getOutfitVariantLabel(outfit.variant)",
  "weatherOrbIcon",
  "getHeroTemperatureRange",
  "최고 ",
  "showcaseMetaSub",
  "onNavigate(\"C1\")",
  "onNavigate(\"H6\")",
  "state.weatherProvider.status",
  "onSetWeatherProviderMode",
  "onRefreshWeather",
  "강수 타임라인",
  "getHomeLocationStatus",
  'value: "현재 위치"',
  'value: "수동"',
  'value: "확인 필요"',
  "unreadNotificationCount",
  "NotificationBellButton",
  "NotificationSidebar",
  "알림 열기",
  "permissionReady",
  "onOpenSettings",
  "onOpenCenter",
  "주의 필요",
  "오늘 예정",
  "최근 완료",
  "알림 설정으로 이동",
  "알림 센터 열기",
  "이력·도착 화면 확인",
  "푸시 알림 대기",
  "importantForAccessibility=\"no-hide-descendants\"",
  "minHeight: 44",
]);
assertSourceIncludes("apps/mobile/src/components/WeatherStatusPanel.tsx", [
  "기본 예보로 보기",
  "실시간 다시 시도",
  "실시간 날씨 다시 시도",
  "연결 전까지 마지막 예보로 판단 유지",
  "실시간 연결 전까지 기본 위치 예보로 판단",
  "날씨 다시 시도",
]);
assertSourceIncludes("apps/mobile/src/screens/AlertSettingsScreen.tsx", [
  "확인 알림",
  "5초 뒤 확인 알림 발송",
  "latestTestNotification",
  "testNotificationVerified",
  "수신 확인 전",
  "스마트 알림 확인 중",
  "확인 알림 수신 전",
  "최근 ${statusLabel}",
  "다시 보내기",
  "onSendTestNotification",
  "notificationDeliveryStatus",
  "푸시 확인",
  "권한, 예약, 실제 수신을 따로 확인함",
  "getNotificationDeliveryCopy",
  "getTestNotificationBody",
  "조건 대기",
  "예약 완료",
]);
assertSourceExcludes("apps/mobile/src/screens/HomeScreen.tsx", [
  'state.weatherProvider.fallbackUsed ? "기본 예보" : "실시간 예보"',
  "18:00 시작 · 21:00 그침",
  "출발지보다 흐리고 강수 가능성 있음",
]);
assertSourceIncludes("apps/mobile/src/screens/NotificationCenterScreen.tsx", [
  "알림 센터",
  "onClearNotificationHistory",
  "전체 읽음",
  "조건 설정",
  "알림 처리 이력 지우기",
  "HistoryRow",
  "route === \"G2\"",
  "목적지 케어 열기",
  "accessibilityState={{ disabled: read }}",
]);
assertSourceExcludes("apps/mobile/src/screens/NotificationCenterScreen.tsx", [
  "buildVisibleNotifications",
  "최근 {notificationHistory.length > 0 ? notificationHistory.length : 7}일 보관",
]);
assertSourceIncludes("apps/mobile/src/screens/DestinationListScreen.tsx", [
  "destinationWeatherById",
  "buildDestinationWarning",
  "getRecommendedDepartureTime(care)",
  "originWeather.current.tempC",
  "destinationWeather.current.tempC",
  "destination.alertCondition.rainThresholdPct",
  "numberOfLines={1}",
  "destinationSummaryRow",
  "destinationWeatherLine",
  "rainPill",
  "repeatLabel",
  "getRepeatLabel",
  "도착",
  "강수",
  "{item.departureTime} → {item.arrivalTime}",
]);
assertSourceIncludes("apps/mobile/src/data/demoState.ts", [
  "destinationWeatherById",
  "destinationSchedule",
  "travelProvider",
  "travelStatus",
  "buildDestinationWeatherById",
  "destinationSnapshots.find((snapshot) => snapshot.locationId === destination.place.id)",
  "destinationWeather,",
  "relabelWeatherSnapshot(fallbackDestinationWeather, destination.place)",
]);
assertSourceExcludes("apps/mobile/src/data/demoState.ts", [
  "personalizeDestinationWeather",
  "getDestinationWeatherVariant",
  "rainDelta",
  "tempDelta",
]);
assertSourceIncludes("apps/mobile/src/screens/DestinationCareScreen.tsx", [
  "originWeather",
  "destinationWeather",
  "도착 희망",
  "시 입력",
  "분 입력",
  "자동 여유",
  "이동수단",
  "배차/환승 변동 가능 · 선택 시 재계산",
  "ArrivalControl",
  "ArrivalInputControl",
  "getTravelEstimateCopy",
  "onSetDestinationTargetArrivalTime",
  "onSetDestinationTransportMode",
  "getConditionLabel",
  "getRecommendedDepartureTime(care)",
  "알림 권한 켜고 케어 시작",
  "자동 알림 기준",
  "목적지 알림 고급 설정으로 이동",
  "고급 설정",
  'onOpenAlertSettings("G2", "destination")',
  "onRemoveSavedDestination",
  "목적지 삭제",
  "삭제 후 출발 목록에서 바로 복구 가능",
  "푸시 알림 대기",
  "RepeatSchedulePanel",
  "repeatDayOptions",
  "반복 알림",
  "반복 없음",
  "onToggleDestinationRepeat",
  "onToggleDestinationRepeatDay",
  "getRepeatSummary",
  "repeatEnabled",
  "repeatDays",
  "TransportDropdown",
]);
assertSourceExcludes("apps/mobile/src/screens/DestinationCareScreen.tsx", [
  "회사 ·",
  "서울 삼성동",
  'value="30%"',
  'meta="출발지 0%"',
  'time="07:30"',
  'time="08:00"',
]);

const visibleCopyPaths = [
  "apps/mobile/src/screens",
  "apps/mobile/src/components",
];

const forbiddenVisibleSnippets = [
  'badge="A2"',
  'badge="A3"',
  'badge="A4"',
  'badge="O3"',
  'badge="P2"',
  "Guest",
  "GUEST",
  "LINKED",
  "READY",
  "ACTIVE",
  "LOADING",
  "OUTER",
  "TOP",
  "BOTTOM",
  "SHOES",
  "ACCESSORY",
  "status.toUpperCase()",
  '? "fallback" : "adapter"',
  "Settings State",
  "Mode A",
  "source ${",
  "fallback 샘플",
  "locationReady ${",
  "permissionReady ${",
  "source.toUpperCase()",
  "날씨 API",
  "정규화 완료",
  "최근 캐시",
  "source preset",
  "gate 결과",
  "권한 gate",
  "코디 variant",
  "P2 범위",
  "O4에서 추천",
  "H1/H3",
  "복귀 화면 {gate",
  'returnTo ?? "H1"',
  'badge="H5"',
];

for (const relativePath of listFiles(visibleCopyPaths)) {
  assertSourceExcludes(relativePath, forbiddenVisibleSnippets);
}

console.log("android product quality check passed");

function assertSourceIncludes(relativePath, snippets) {
  const text = readText(relativePath);
  for (const snippet of snippets) {
    assert.ok(text.includes(snippet), `${relativePath} must include: ${snippet}`);
  }
}

function assertSourceExcludes(relativePath, snippets) {
  const text = readText(relativePath);
  for (const snippet of snippets) {
    assert.ok(!text.includes(snippet), `${relativePath} must not include: ${snippet}`);
  }
}

function assertBottomNavRoutes(relativePath) {
  const text = readText(relativePath);
  const match = text.match(/export const bottomNavRoutes:[\s\S]*?\n\];/);
  assert.ok(match, `${relativePath} must define bottomNavRoutes`);
  const bottomNavText = match[0];
  for (const snippet of ['id: "H1"', 'label: "홈"', 'id: "C1"', 'label: "코디"', 'id: "G1"', 'label: "출발"', 'id: "M1"', 'label: "MY"']) {
    assert.ok(bottomNavText.includes(snippet), `${relativePath} bottomNavRoutes must include: ${snippet}`);
  }
  for (const snippet of ['id: "S1"', 'label: "소셜"', 'id: "H3"', 'id: "H4"', 'id: "H5"', 'label: "우산"', 'label: "강수"']) {
    assert.ok(!bottomNavText.includes(snippet), `${relativePath} bottomNavRoutes must not include: ${snippet}`);
  }
}

function listFiles(relativeDirs) {
  const files = [];
  for (const relativeDir of relativeDirs) {
    const absoluteDir = join(rootDir, relativeDir);
    for (const entry of walk(absoluteDir)) {
      if (entry.endsWith(".tsx") || entry.endsWith(".ts")) {
        files.push(entry.slice(rootDir.length + 1));
      }
    }
  }
  return files;
}

function* walk(path) {
  for (const name of readdirSync(path)) {
    const childPath = join(path, name);
    if (statSync(childPath).isDirectory()) yield* walk(childPath);
    else yield childPath;
  }
}

function readText(relativePath) {
  return readFileSync(join(rootDir, relativePath), "utf8");
}
