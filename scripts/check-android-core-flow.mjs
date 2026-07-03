const previewUrl = process.env.WEATHERON_WEB_PREVIEW_URL ?? "http://127.0.0.1:8094/";
const reportOnly = process.env.WEATHERON_CORE_FLOW_REPORT_ONLY === "1";
const optionalServer = process.env.WEATHERON_CORE_FLOW_OPTIONAL === "1";

const seedState = {
  onboardingCompleted: true,
  accountLinked: true,
  termsRequiredAccepted: true,
  locationReady: true,
  permissionReady: true,
  outfitSaved: false,
  styleProfileSaved: true,
  styleGender: "all",
  ageBand: "20-30",
  fitPreference: "standard",
  selectedStyles: ["미니멀", "캐주얼"],
  smartCareScenario: "outing",
  wardrobeOwnedItemIds: [],
  selectedWardrobeItemId: "",
  savedDestinations: [],
  previewDestinationCareEnabled: true,
  weatherLocationMode: "manual",
  temperatureUnit: "celsius",
  weightUnit: "kilogram",
  distanceUnit: "meter",
  themeMode: "system",
  reducedTransparency: false,
  adConsentMode: "personalized",
  readNotificationIds: [],
  notificationHistory: [],
};

const persistedDestination = {
  place: {
    id: "kr-jamsil-baseball-stadium",
    name: "잠실종합운동장",
    address: "서울 송파구 올림픽로 25",
    category: "sports",
    countryCode: "KR",
    coordinate: {
      latitude: 37.5122,
      longitude: 127.0719,
    },
    timezone: "Asia/Seoul",
    provider: "fixture",
  },
  careEnabled: true,
  alertCondition: {
    rainThresholdPct: 50,
    leadTimeMinutes: 60,
    windThresholdMs: 8,
  },
  savedAtLabel: "방금 저장",
};

const persistedWeatherPlace = {
  id: "saved-destination",
  name: "저장된 목적지",
  address: "서울 중구 세종대로 110",
  category: "custom",
  countryCode: "KR",
  coordinate: {
    latitude: 37.5665,
    longitude: 126.978,
  },
  timezone: "Asia/Seoul",
  provider: "fixture",
};

const persistedWeatherResult = {
  current: buildWeatherSnapshot("kr-default-seoul", "기본 위치 서울", "openmeteo", 22, 20),
  destination: buildWeatherSnapshot(persistedWeatherPlace.id, persistedWeatherPlace.name, "openmeteo", 24, 65),
  destinationSnapshots: [buildWeatherSnapshot(persistedWeatherPlace.id, persistedWeatherPlace.name, "openmeteo", 24, 65)],
  status: "ready",
  message: "저장 전 실시간 예보",
  retryable: false,
  fallbackUsed: false,
};

const issues = [];
const logs = [];

let browser;
let skippedMessage = "";

try {
  const puppeteer = await import("puppeteer");
  browser = await puppeteer.default.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  page.on("console", (message) => logs.push(`${message.type()}: ${message.text()}`));
  page.on("pageerror", (error) => issues.push(`page error: ${error.message}`));

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await installCoreFlowFetchMock(page);
  await runCoreFlowStep("load seeded app", () => loadSeededApp(page));
  await runCoreFlowStep("home decision flow", () => checkHomeDecisionFlow(page));
  await runCoreFlowStep("notification permission recovery", () => checkNotificationPermissionRecovery(browser));
  await runCoreFlowStep("app permissions recovery", () => checkAppPermissionsRecovery(browser));
  await runCoreFlowStep("persisted weather fallback", () => checkPersistedWeatherFallbackFlow(browser));
  await runCoreFlowStep("persisted weather location mismatch fallback", () => checkPersistedWeatherLocationMismatchFlow(browser));
  await runCoreFlowStep("alert settings destination empty", () => checkAlertSettingsDestinationEmptyFlow(browser));
  await runCoreFlowStep("destination add persistence", () => checkDestinationAddUiPersistenceFlow(browser));
  await runCoreFlowStep("destination persistence", () => checkDestinationPersistenceFlow(page));
  await runCoreFlowStep("my settings flow", () => checkMySettingsFlow(page));
} catch (error) {
  const message = error.message;
  if (optionalServer && isServerConnectionError(message)) {
    skippedMessage = message;
  } else {
    issues.push(message);
  }
} finally {
  if (browser) await browser.close();
}

if (skippedMessage) {
  console.warn(`android core flow check skipped: ${skippedMessage}`);
  process.exit(0);
}

if (issues.length > 0) {
  if (reportOnly) {
    console.log(`android core flow check generated: ${issues.length} issues`);
    process.exit(0);
  }
  console.error(`android core flow check failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  if (logs.length > 0) {
    console.error("browser logs:");
    for (const log of logs) console.error(` - ${log}`);
  }
  process.exit(1);
}

console.log("android core flow check passed");

async function runCoreFlowStep(label, task) {
  console.log(`core-flow: ${label}`);
  await task();
}

async function loadSeededApp(page) {
  await page.evaluateOnNewDocument((state) => {
    if (!localStorage.getItem("weatheron.appState.v1")) {
      localStorage.setItem("weatheron.appState.v1", JSON.stringify(state));
    }
    if (!localStorage.getItem("weatheron.notificationState.v1")) {
      localStorage.setItem(
        "weatheron.notificationState.v1",
        JSON.stringify({ readNotificationIds: [], notificationHistory: [] }),
      );
    }
  }, seedState);
  await page.goto(withCacheBust(previewUrl), { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.evaluate((state) => {
    localStorage.setItem("weatheron.appState.v1", JSON.stringify(state));
    localStorage.setItem(
      "weatheron.notificationState.v1",
      JSON.stringify({ readNotificationIds: [], notificationHistory: [] }),
    );
  }, seedState);
  await page.reload({ waitUntil: "networkidle0", timeout: 25000 });
  await waitForApp();

  await assertText(page, "출발 판단");
  await assertBottomNav(page);
}

async function checkHomeDecisionFlow(page) {
  await clickText(page, "출발 판단");
  await assertText(page, "출발");
  await assertText(page, "목적지 추가");
  await assertBottomNav(page);
  await assertClearOfBottomNav(page, "목적지 추가");

  await clickText(page, "홈");
  await assertText(page, "목적지 추가 필요");
  await clickText(page, "목적지 비교");
  await assertText(page, "목적지 추가");
  await assertText(page, "장소 선택");
  await assertBottomNav(page);
  await assertClearOfBottomNav(page, "장소 선택 필요");

  await clickText(page, "홈");
  await clickText(page, "강수 타임라인");
  await assertText(page, "비 그치면 알려줘");
  await assertText(page, "30분 단위 강수량");
  await assertText(page, "외출 가이드");
  await assertText(page, "우산 추천");
  await assertBottomNav(page);
  await assertClearOfBottomNav(page, "우산 추천");
  await clickAriaIncludes(page, "우산 추천 보기");
  await assertText(page, "우산 종류 비교");
  await clickAriaIncludes(page, "뒤로");
  await assertText(page, "강수 타임라인");
  await clickAriaIncludes(page, "뒤로");
  await assertText(page, "출발 판단");
}

async function checkNotificationPermissionRecovery(browser) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  try {
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    page.on("console", (message) => logs.push(`${message.type()}: ${message.text()}`));
    page.on("pageerror", (error) => issues.push(`page error: ${error.message}`));
    await installCoreFlowFetchMock(page);

  await page.evaluateOnNewDocument((state) => {
    localStorage.setItem(
      "weatheron.appState.v1",
      JSON.stringify({
        ...state,
        permissionReady: false,
      }),
    );
  }, seedState);
  await page.goto(withCacheBust(previewUrl, "permissionRecovery"), { waitUntil: "networkidle0", timeout: 25000 });
  await waitForApp();
  await clickAriaIncludes(page, "알림 열기");
  await assertText(page, "푸시 알림 대기");
  await assertText(page, "알림 설정으로 이동");
  } finally {
    await context.close();
  }
}

async function checkAppPermissionsRecovery(browser) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  try {
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    page.on("console", (message) => logs.push(`${message.type()}: ${message.text()}`));
    page.on("pageerror", (error) => issues.push(`page error: ${error.message}`));
    await installCoreFlowFetchMock(page);

    await page.evaluateOnNewDocument((state) => {
      localStorage.setItem(
        "weatheron.appState.v1",
        JSON.stringify({
          ...state,
          locationReady: false,
          weatherLocationMode: "manual",
        }),
      );
    }, seedState);
    await page.goto(withCacheBust(previewUrl, "appPermissionsRecovery"), { waitUntil: "networkidle0", timeout: 25000 });
    await waitForApp();
    await clickText(page, "MY");
    await clickText(page, "앱 권한 관리");
    await assertText(page, "앱 권한 관리");
    await assertText(page, "위치 권한 복구");
    await assertText(page, "수신 확인");
    await clickText(page, "위치 권한 복구");
    await assertText(page, "필요한 권한만 먼저 허용해 주세요");
    await assertText(page, "위치 권한");
    await clickText(page, "나중에 설정");
    await assertText(page, "위치 권한 보류");
    await assertText(page, "현재 위치 자동화만 대기");
  } finally {
    await context.close();
  }
}

async function checkPersistedWeatherFallbackFlow(browser) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  try {
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    page.on("console", (message) => logs.push(`${message.type()}: ${message.text()}`));
    page.on("pageerror", (error) => issues.push(`page error: ${error.message}`));
    await installCoreFlowFetchMock(page);

    await page.evaluateOnNewDocument((state, weatherResult, weatherPlace) => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = (input, init) => {
        const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
        if (url.includes("api.open-meteo.com") || url.includes("/weather/")) {
          return Promise.reject(new Error("forced weather offline"));
        }
        return originalFetch(input, init);
      };
      localStorage.setItem(
        "weatheron.appState.v1",
        JSON.stringify({
          ...state,
          savedDestinations: [
            {
              place: weatherPlace,
              careEnabled: true,
              alertCondition: {
                rainThresholdPct: 50,
                leadTimeMinutes: 60,
                windThresholdMs: 8,
              },
              savedAtLabel: "저장됨",
            },
          ],
          selectedDestinationPlace: weatherPlace,
        }),
      );
      localStorage.setItem("weatheron.weatherProviderResult.v1", JSON.stringify(weatherResult));
    }, seedState, persistedWeatherResult, persistedWeatherPlace);

    await page.goto(withCacheBust(previewUrl, "persistedWeather"), { waitUntil: "networkidle0", timeout: 25000 });
    await waitForApp();
    await assertText(page, "최근 예보로 유지 중");
    await assertText(page, "연결 전까지 마지막 예보로 판단 유지");
    await assertText(page, "기본 예보로 보기");
    await assertText(page, "기본 위치 서울");
    await assertText(page, "저장된 목적지");
  } finally {
    await context.close();
  }
}

async function checkPersistedWeatherLocationMismatchFlow(browser) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  try {
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    page.on("console", (message) => logs.push(`${message.type()}: ${message.text()}`));
    page.on("pageerror", (error) => issues.push(`page error: ${error.message}`));
    await installCoreFlowFetchMock(page);

    await page.evaluateOnNewDocument((state, weatherResult, weatherPlace) => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = (input, init) => {
        const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
        if (url.includes("api.open-meteo.com") || url.includes("/weather/")) {
          return Promise.reject(new Error("forced weather offline"));
        }
        return originalFetch(input, init);
      };
      localStorage.setItem(
        "weatheron.appState.v1",
        JSON.stringify({
          ...state,
          savedDestinations: [
            {
              place: weatherPlace,
              careEnabled: true,
              alertCondition: {
                rainThresholdPct: 50,
                leadTimeMinutes: 60,
                windThresholdMs: 8,
              },
              savedAtLabel: "저장됨",
            },
          ],
          selectedDestinationPlace: weatherPlace,
        }),
      );
      localStorage.setItem(
        "weatheron.weatherProviderResult.v1",
        JSON.stringify({
          ...weatherResult,
          current: {
            ...weatherResult.current,
            id: "weather-saved-current",
            locationId: "saved-current",
            locationName: "저장된 현재 위치",
          },
        }),
      );
    }, seedState, persistedWeatherResult, persistedWeatherPlace);

    await page.goto(withCacheBust(previewUrl, "persistedWeatherMismatch"), { waitUntil: "networkidle0", timeout: 25000 });
    await waitForApp();
    await assertText(page, "기본 위치 서울");
    await assertText(page, "날씨 갱신 실패");
    await assertNoText(page, "저장된 현재 위치");
  } finally {
    await context.close();
  }
}

async function checkAlertSettingsDestinationEmptyFlow(browser) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  try {
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    page.on("console", (message) => logs.push(`${message.type()}: ${message.text()}`));
    page.on("pageerror", (error) => issues.push(`page error: ${error.message}`));
    await installCoreFlowFetchMock(page);

    await page.evaluateOnNewDocument((state) => {
      localStorage.setItem(
        "weatheron.appState.v1",
        JSON.stringify({
          ...state,
          savedDestinations: [],
          permissionReady: true,
        }),
      );
      localStorage.setItem(
        "weatheron.notificationState.v1",
        JSON.stringify({ readNotificationIds: [], notificationHistory: [] }),
      );
    }, seedState);
    await page.goto(withCacheBust(previewUrl, "alertSettingsNoDestination"), { waitUntil: "networkidle0", timeout: 25000 });
    await waitForApp();

    await clickText(page, "MY");
    await clickText(page, "스마트 알림 설정");
    await assertText(page, "5초 뒤 확인 알림 발송");
    await assertText(page, "목적지 출발");
    await assertText(page, "목적지 추가 필요");
    await assertText(page, "목적지 필요");
    await assertNoText(page, "계정 연결 후 목적지 알림 저장");
    await assertNoText(page, "알림 저장은 계정 연결 후 적용");
    await clickText(page, "목적지 추가 필요");
    await assertText(page, "장소를 검색해 주세요");
    await assertText(page, "장소 선택 필요");
    await fillAriaInput(page, "목적지 검색어", "x");
    await assertText(page, "검색어 지우기");
    await clickText(page, "검색어 지우기");
    await assertText(page, "장소를 검색해 주세요");
  } finally {
    await context.close();
  }
}

async function checkDestinationPersistenceFlow(page) {
  await page.evaluate((state, destination) => {
    localStorage.setItem(
      "weatheron.appState.v1",
      JSON.stringify({
        ...state,
        savedDestinations: [destination],
        selectedDestinationPlace: destination.place,
      }),
    );
  }, seedState, persistedDestination);
  await page.reload({ waitUntil: "networkidle0", timeout: 25000 });
  await waitForApp();
  await assertText(page, "잠실종합운동장");
  await clickAriaIncludes(page, "출발 탭");
  await assertText(page, "잠실종합운동장");
  await assertText(page, "알림 1/1");
  await assertNoText(page, "첫 목적지를 추가해 주세요");
}

async function checkDestinationAddUiPersistenceFlow(browser) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  try {
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    page.on("console", (message) => logs.push(`${message.type()}: ${message.text()}`));
    page.on("pageerror", (error) => issues.push(`page error: ${error.message}`));
    await installCoreFlowFetchMock(page);

    await page.evaluateOnNewDocument((state) => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = (input, init) => {
        const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
        if (url.includes("/places/search")) {
          return Promise.resolve(
            new Response(JSON.stringify([buildJamsilPlace()]), { status: 200, headers: { "Content-Type": "application/json" } }),
          );
        }
        if (url.includes("geocoding-api.open-meteo.com")) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                results: [
                  {
                    id: 1843564,
                    name: "잠실종합운동장",
                    latitude: 37.5122,
                    longitude: 127.0719,
                    country_code: "KR",
                    country: "대한민국",
                    admin1: "서울특별시",
                    admin2: "송파구",
                    timezone: "Asia/Seoul",
                    feature_code: "STDM",
                  },
                ],
              }),
              { status: 200, headers: { "Content-Type": "application/json" } },
            ),
          );
        }
        return originalFetch(input, init);
      };
      function buildJamsilPlace() {
        return {
          id: "kr-jamsil-baseball-stadium",
          name: "잠실종합운동장",
          address: "서울 송파구 올림픽로 25",
          category: "sports",
          countryCode: "KR",
          coordinate: {
            latitude: 37.5122,
            longitude: 127.0719,
          },
          timezone: "Asia/Seoul",
          provider: "fixture",
        };
      }
      if (!localStorage.getItem("weatheron.appState.v1")) {
        localStorage.setItem("weatheron.appState.v1", JSON.stringify(state));
      }
      if (!localStorage.getItem("weatheron.notificationState.v1")) {
        localStorage.setItem(
          "weatheron.notificationState.v1",
          JSON.stringify({ readNotificationIds: [], notificationHistory: [] }),
        );
      }
    }, seedState);
    console.log("core-flow: destination add goto");
    await page.goto(withCacheBust(previewUrl, "destinationAddUi"), { waitUntil: "networkidle0", timeout: 25000 });
    console.log("core-flow: destination add app loaded");
    await waitForApp();

    console.log("core-flow: destination add open");
    await clickText(page, "출발");
    await assertText(page, "첫 목적지를 추가해 주세요");
    await clickText(page, "목적지 추가");
    await assertText(page, "장소 선택 필요");
    console.log("core-flow: destination add search");
    await fillAriaInput(page, "목적지 검색어", "잠실");
    await assertText(page, "검색 결과");
    await assertAnyText(page, ["가까운 순", "한국 기준"]);
    await assertText(page, "잠실야구장");
    console.log("core-flow: destination add select");
    await clickText(page, "잠실야구장");
    await assertText(page, "목적지 저장하고 비교");
    console.log("core-flow: destination add save");
    await clickText(page, "목적지 저장하고 비교");
    await assertText(page, "목적지 기준 알림 미리보기");
    await assertText(page, "이동수단");
    await assertText(page, "자동");
    await assertText(page, "도보");
    await assertText(page, "자차");
    await assertText(page, "대중교통");
    await assertText(page, "숫자만 입력");
    await assertText(page, "자동 여유");
    await fillAriaInput(page, "도착 희망 시 입력", "09");
    await fillAriaInput(page, "도착 희망 분 입력", "30");
    await assertText(page, "09:30");
    await clickText(page, "대중교통");
    await assertText(page, "배차/환승 변동 가능");
    await assertText(page, "계산식");
    await assertText(page, "조건 직접 조정");
    await assertAnyText(page, ["Kakao Directions", "Google Distance Matrix", "경로 확인 전"]);
    await assertText(page, "잠실야구장");
    await waitForPersistedDestination(page, "잠실야구장");

    console.log("core-flow: destination add reload");
    await page.reload({ waitUntil: "networkidle0", timeout: 25000 });
    await waitForApp();
    await assertText(page, "출발 판단");
    await assertText(page, "잠실야구장");
    await clickText(page, "출발");
    await assertText(page, "알림 1/1");
    await assertNoText(page, "첫 목적지를 추가해 주세요");
    await clickAriaIncludes(page, "잠실야구장 목적지 삭제");
    await assertText(page, "목적지 삭제됨");
    await assertText(page, "복구");
  } finally {
    await context.close();
  }
}

async function checkMySettingsFlow(page) {
  await clickText(page, "MY");
  await assertText(page, "스마트 알림 설정");
  await assertText(page, "앱 권한 관리");
  await assertText(page, "관리");
  await assertText(page, "표시 설정");
  await assertText(page, "정책 및 법적 고지");
  await assertText(page, "오늘 준비");
  await assertText(page, "사용 준비 완료");
  await assertNoText(page, "코디·옷장");
  await assertBottomNav(page);

  await clickText(page, "앱 권한 관리");
  await assertText(page, "앱 권한 관리");
  await assertText(page, "위치 권한");
  await assertText(page, "알림 권한");
  await assertText(page, "수신 확인");
  await clickText(page, "수신 확인");
  await assertText(page, "스마트 알림 설정");
  await assertText(page, "확인");
  await clickText(page, "MY");
  await clickText(page, "앱 권한 관리");
  await clickText(page, "위치 선택");
  await assertText(page, "위치 변경");
  await fillAriaInput(page, "동 읍 면 검색", "x");
  await assertText(page, "검색어 지우기");
  await clickText(page, "검색어 지우기");
  await assertText(page, "저장한 위치");
  await clickText(page, "MY");

  await clickText(page, "표시 설정");
  await assertText(page, "표시 설정");
  await assertText(page, "테마");
  await assertText(page, "투명 효과");
  await assertNoText(page, "위치 권한");
  await assertNoText(page, "알림 권한");
  await assertNoText(page, "알림 권한 관리");
  await assertNoText(page, "무게");
  await assertNoText(page, "킬로그램");
  await assertNoText(page, "파운드");
  await clickText(page, "MY");

  await clickText(page, "정책 및 법적 고지");
  await assertText(page, "개인정보처리방침");
  await assertText(page, "이용약관");
  await assertText(page, "위치기반서비스 이용약관");
  await assertText(page, "오픈소스 라이선스");
  await assertNoText(page, "계정 관리");
  await assertNoText(page, "위치 설정");
  await clickText(page, "개인정보처리방침");
  await assertText(page, "개인정보 수집·이용 고지");
  await clickAriaIncludes(page, "상단 정책 목록으로 돌아가기");
  await assertText(page, "오픈소스 라이선스");
  await clickAriaIncludes(page, "MY로 돌아가기");
  await assertText(page, "스마트 알림 설정");
}

async function assertBottomNav(page) {
  await assertText(page, "홈");
  await assertText(page, "출발");
  await assertText(page, "MY");
}

async function installCoreFlowFetchMock(page) {
  await page.evaluateOnNewDocument(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
      if (url.includes("/places/search")) {
        return Promise.resolve(jsonResponse([buildJamsilPlace()]));
      }
      if (url.includes("geocoding-api.open-meteo.com")) {
        return Promise.resolve(jsonResponse({
          results: [
            {
              id: 1843564,
              name: "잠실종합운동장",
              latitude: 37.5122,
              longitude: 127.0719,
              country_code: "KR",
              country: "대한민국",
              admin1: "서울특별시",
              admin2: "송파구",
              timezone: "Asia/Seoul",
              feature_code: "STDM",
            },
          ],
        }));
      }
      if (url.includes("api.open-meteo.com") || url.includes("/weather/openmeteo")) {
        return Promise.resolve(jsonResponse(buildOpenMeteoPayload()));
      }
      return originalFetch(input, init);
    };

    function jsonResponse(payload) {
      return new Response(JSON.stringify(payload), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    function buildJamsilPlace() {
      return {
        id: "kr-jamsil-baseball-stadium",
        name: "잠실종합운동장",
        address: "서울 송파구 올림픽로 25",
        category: "sports",
        countryCode: "KR",
        coordinate: {
          latitude: 37.5122,
          longitude: 127.0719,
        },
        timezone: "Asia/Seoul",
        provider: "fixture",
      };
    }

    function buildOpenMeteoPayload() {
      return {
        current: {
          time: "2026-06-30T08:00",
          temperature_2m: 24,
          apparent_temperature: 25,
          precipitation: 0,
          weather_code: 2,
          wind_speed_10m: 4.2,
          relative_humidity_2m: 68,
          uv_index: 6,
        },
        hourly: {
          time: ["2026-06-30T09:00", "2026-06-30T12:00", "2026-06-30T15:00"],
          temperature_2m: [24, 26, 25],
          apparent_temperature: [25, 27, 26],
          precipitation_probability: [20, 45, 30],
          precipitation: [0, 0.3, 0],
          weather_code: [2, 61, 3],
          wind_speed_10m: [4.2, 5.1, 4.8],
          relative_humidity_2m: [68, 72, 70],
          uv_index: [6, 7, 4],
        },
      };
    }
  });
}

async function assertClearOfBottomNav(page, label) {
  const result = await page.evaluate(async (label) => {
    const candidates = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
      const element = walker.currentNode;
      const value = (element.innerText || element.textContent || "").trim();
      if (value === label) candidates.push(element);
    }
    const navTarget = document.querySelector('[aria-label="홈 탭"]');
    const targets = [
      ...new Set(
        candidates.map((element) =>
          element.getAttribute("role") === "button" || element.getAttribute("role") === "checkbox"
            ? element
            : element.closest?.("[role=button],[role=checkbox]") ?? element,
        ),
      ),
    ].filter(Boolean);
    if (targets.length === 0 || !navTarget) return { ok: false, reason: `missing target or nav: ${label}` };

    const failures = [];
    for (const target of targets) {
      target.scrollIntoView({ block: "end", inline: "nearest" });
      await new Promise((resolve) => setTimeout(resolve, 120));

      const targetRect = target.getBoundingClientRect();
      const navRect = navTarget.getBoundingClientRect();
      const navTop = navRect.top;
      const viewportHeight = window.innerHeight;
      const visible = targetRect.bottom <= navTop - 4 && targetRect.top >= 0 && targetRect.bottom <= viewportHeight;
      if (visible) return { ok: true, reason: `${label} clear of bottom nav` };
      failures.push(`${Math.round(targetRect.bottom)} > ${Math.round(navTop)}`);
    }

    return {
      ok: false,
      reason: `${label} rect bottom must be above nav top: ${failures.join(", ")}`,
    };
  }, label);

  if (!result.ok) throw new Error(`bottom nav overlap risk: ${result.reason}`);
}

async function assertText(page, expected) {
  const body = await bodyText(page);
  if (!body.includes(expected)) {
    throw new Error(`missing text: ${expected}\n${body.slice(0, 1800)}`);
  }
}

async function assertNoText(page, unexpected) {
  const body = await bodyText(page);
  if (body.includes(unexpected)) {
    throw new Error(`unexpected text: ${unexpected}\n${body.slice(0, 1800)}`);
  }
}

async function assertAnyText(page, expectedValues) {
  const body = await bodyText(page);
  if (!expectedValues.some((expected) => body.includes(expected))) {
    throw new Error(`missing any text: ${expectedValues.join(" | ")}\n${body.slice(0, 1800)}`);
  }
}

async function waitForPersistedDestination(page, destinationName) {
  await page.waitForFunction(
    (destinationName) => {
      const rawValue = localStorage.getItem("weatheron.appState.v1");
      if (!rawValue) return false;
      try {
        const state = JSON.parse(rawValue);
        return Array.isArray(state.savedDestinations) && state.savedDestinations.some((item) => item?.place?.name === destinationName);
      } catch {
        return false;
      }
    },
    { timeout: 5000 },
    destinationName,
  );
}

async function clickText(page, label, index = 0) {
  const clicked = await page.evaluate(
    ({ label, index }) => {
      const candidates = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      while (walker.nextNode()) {
        const element = walker.currentNode;
        const value = (element.innerText || element.textContent || "").trim();
        if (value === label) candidates.push(element);
      }

      const targets = candidates
        .map((element) =>
          element.getAttribute("role") === "button" || element.getAttribute("role") === "checkbox"
            ? element
            : element.closest?.("[role=button],[role=checkbox]"),
        )
        .filter(Boolean);
      const target = targets[index] ?? candidates[index];
      if (!target) return false;
      target.click();
      return true;
    },
    { label, index },
  );

  if (!clicked) throw new Error(`missing clickable text: ${label}`);
  await waitForApp();
}

async function clickAriaIncludes(page, labelPart) {
  const clicked = await page.evaluate((labelPart) => {
    const target = [...document.querySelectorAll("[role=button],[role=checkbox],button")].find((element) =>
      (element.getAttribute("aria-label") || "").includes(labelPart),
    );
    if (!target) return false;
    target.scrollIntoView({ block: "center", inline: "nearest" });
    const rect = target.getBoundingClientRect();
    const eventInit = {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
      buttons: 1,
    };
    target.dispatchEvent(new PointerEvent("pointerdown", eventInit));
    target.dispatchEvent(new MouseEvent("mousedown", eventInit));
    target.dispatchEvent(new PointerEvent("pointerup", { ...eventInit, buttons: 0 }));
    target.dispatchEvent(new MouseEvent("mouseup", { ...eventInit, buttons: 0 }));
    target.dispatchEvent(new MouseEvent("click", { ...eventInit, buttons: 0 }));
    return true;
  }, labelPart);

  if (!clicked) throw new Error(`missing aria clickable: ${labelPart}`);
  await waitForApp();
}

async function fillAriaInput(page, label, value) {
  const filled = await page.evaluate(
    ({ label, value }) => {
      const target = [...document.querySelectorAll("input, textarea, [contenteditable=true]")].find(
        (element) => element.getAttribute("aria-label") === label,
      );
      if (!target) return false;
      target.focus();
      const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), "value")?.set;
      if (setter) setter.call(target, value);
      else target.value = value;
      target.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
      target.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    },
    { label, value },
  );
  if (!filled) throw new Error(`missing input: ${label}`);
  await waitForApp();
}

async function bodyText(page) {
  return page.evaluate(() => document.body.innerText);
}

async function waitForApp() {
  await new Promise((resolve) => setTimeout(resolve, 900));
}

function buildWeatherSnapshot(locationId, locationName, source, tempC, rainProbabilityPct) {
  return {
    id: `weather-${locationId}`,
    locationId,
    locationName,
    countryCode: "KR",
    observedAt: "2026-06-30T08:00:00+09:00",
    current: {
      tempC,
      feelsLikeC: tempC,
      condition: rainProbabilityPct >= 50 ? "rain" : "cloud",
      precipitationMm: rainProbabilityPct >= 50 ? 1.2 : 0,
      rainProbabilityPct,
      windMs: 4.2,
      humidityPct: 72,
    },
    hourly: [
      {
        time: "2026-06-30T09:00:00+09:00",
        tempC,
        rainProbabilityPct,
        precipitationMm: rainProbabilityPct >= 50 ? 1.2 : 0,
        windMs: 4.2,
        condition: rainProbabilityPct >= 50 ? "rain" : "cloud",
      },
    ],
    source,
    stale: false,
  };
}

function withCacheBust(url, key = "coreFlow") {
  const parsed = new URL(url);
  parsed.searchParams.set(key, String(Date.now()));
  return parsed.toString();
}

function isServerConnectionError(message) {
  return [
    "net::ERR_CONNECTION_REFUSED",
    "net::ERR_CONNECTION_RESET",
    "net::ERR_ADDRESS_UNREACHABLE",
    "Navigation timeout",
    "waiting for function failed",
  ].some((snippet) => message.includes(snippet));
}
