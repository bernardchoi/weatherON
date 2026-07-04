const previewUrl = process.env.WEATHERON_WEB_PREVIEW_URL ?? "http://127.0.0.1:8094/";
const optionalServer = process.env.WEATHERON_SMALL_SCREEN_OPTIONAL === "1";
const captureScreenshots = process.env.WEATHERON_SMALL_SCREEN_SCREENSHOT === "1";

const viewports = [
  { name: "compact", width: 360, height: 800 },
  { name: "large-phone", width: 430, height: 932 },
];

const basePlace = {
  id: "kr-jamsil-stadium",
  name: "잠실종합운동장",
  address: "서울 송파구 올림픽로 25",
  category: "sports",
  countryCode: "KR",
  coordinate: { latitude: 37.515, longitude: 127.072 },
  timezone: "Asia/Seoul",
  provider: "fixture",
};

const secondPlace = {
  id: "kr-seoul-station",
  name: "서울역",
  address: "서울 중구 한강대로 405",
  category: "custom",
  countryCode: "KR",
  coordinate: { latitude: 37.5547, longitude: 126.9706 },
  timezone: "Asia/Seoul",
  provider: "fixture",
};

const alertCondition = {
  rainThresholdPct: 50,
  leadTimeMinutes: 60,
  windThresholdMs: 8,
};

const appState = {
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
  savedDestinations: [
    {
      place: basePlace,
      careEnabled: true,
      alertCondition,
      schedulePreference: { targetArrivalTime: "09:00", transportMode: "auto", repeatEnabled: true, repeatDays: ["sun"] },
      travelEstimate: createTravelEstimate(basePlace, 34),
      savedAtLabel: "업데이트됨",
    },
    {
      place: secondPlace,
      careEnabled: true,
      alertCondition: { ...alertCondition, rainThresholdPct: 70 },
      schedulePreference: { targetArrivalTime: "08:40", transportMode: "transit", repeatEnabled: true, repeatDays: ["mon", "wed", "fri"] },
      travelEstimate: createTravelEstimate(secondPlace, 28),
      savedAtLabel: "방금 저장",
    },
  ],
  selectedDestinationPlace: basePlace,
  previewDestinationCareEnabled: true,
  previewDestinationAlertCondition: alertCondition,
  previewDestinationSchedulePreference: { targetArrivalTime: "09:00", transportMode: "auto", repeatEnabled: true, repeatDays: ["sun"] },
  previewDestinationTravelEstimate: createTravelEstimate(basePlace, 34),
  weatherLocationMode: "manual",
  temperatureUnit: "celsius",
  weightUnit: "kilogram",
  distanceUnit: "meter",
  themeMode: "system",
  reducedTransparency: false,
  adConsentMode: "personalized",
  readNotificationIds: [],
  notificationHistory: [],
  alertPreferences: {
    rainDetail: true,
    routine: true,
    bedtime: true,
    destination: true,
    quietHours: true,
  },
};

const onboardingState = {
  ...appState,
  onboardingCompleted: false,
  savedDestinations: [],
};

const issues = [];
const evidence = [];
let browser;

function createTravelEstimate(destination, durationMinutes) {
  return {
    status: "fallback",
    originPlaceId: "kr-seoul-seongsu",
    destinationPlaceId: destination.id,
    durationMinutes,
    distanceMeters: durationMinutes * 520,
    provider: "fixture",
    fetchedAt: "2026-07-02T00:00:00.000Z",
  };
}

try {
  const puppeteer = await import("puppeteer");
  browser = await puppeteer.default.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  for (const viewport of viewports) {
    console.log(`small-screen: ${viewport.name}/home`);
    const page = await browser.newPage();
    await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 2 });
    await loadSeededApp(page, appState);
    console.log(`small-screen: ${viewport.name}/home loaded`);

    await assertAnyText(page, ["다음 비", "다음 시간"], viewport, "home");
    await assertText(page, "주간 강수", viewport, "home");
    console.log(`small-screen: ${viewport.name}/home text`);
    await checkLayout(page, viewport, "home");
    console.log(`small-screen: ${viewport.name}/home layout`);
    await screenshot(page, viewport, "home");
    console.log(`small-screen: ${viewport.name}/home screenshot`);

    console.log(`small-screen: ${viewport.name}/destination-list`);
    await clickText(page, "출발");
    await assertText(page, "출발", viewport, "destination-list");
    await assertText(page, "잠실종합운동장", viewport, "destination-list");
    await assertText(page, "서울역", viewport, "destination-list");
    await assertNoText(page, "— 25", viewport, "destination-list");
    await assertNoText(page, "— 405", viewport, "destination-list");
    await checkLayout(page, viewport, "destination-list");
    await screenshot(page, viewport, "destination-list");

    console.log(`small-screen: ${viewport.name}/destination-care`);
    await clickText(page, "잠실종합운동장");
    await assertText(page, "목적지 기준 알림 미리보기", viewport, "destination-care");
    await assertText(page, "이동수단", viewport, "destination-care");
    await assertText(page, "도착 희망", viewport, "destination-care");
    await assertText(page, "숫자만 입력", viewport, "destination-care");
    await assertText(page, "자동 여유", viewport, "destination-care");
    await assertText(page, "대중교통", viewport, "destination-care");
    await assertText(page, "반복 알림", viewport, "destination-care");
    await assertText(page, "ON", viewport, "destination-care");
    await checkLayout(page, viewport, "destination-care");
    await screenshot(page, viewport, "destination-care");

    console.log(`small-screen: ${viewport.name}/notification-sidebar`);
    await clickText(page, "홈");
    console.log(`small-screen: ${viewport.name}/notification-sidebar home`);
    await clickBell(page);
    console.log(`small-screen: ${viewport.name}/notification-sidebar bell`);
    await assertText(page, "알림", viewport, "notification-sidebar");
    await assertText(page, "주의 필요", viewport, "notification-sidebar");
    await assertText(page, "오늘 예정", viewport, "notification-sidebar");
    await assertText(page, "최근 완료", viewport, "notification-sidebar");
    console.log(`small-screen: ${viewport.name}/notification-sidebar text`);
    await checkLayout(page, viewport, "notification-sidebar");
    console.log(`small-screen: ${viewport.name}/notification-sidebar layout`);
    await screenshot(page, viewport, "notification-sidebar");
    console.log(`small-screen: ${viewport.name}/notification-sidebar screenshot`);

    console.log(`small-screen: ${viewport.name}/alert-settings`);
    await clickText(page, "알림 설정으로 이동");
    await assertText(page, "스마트 알림 설정", viewport, "alert-settings");
    await assertText(page, "확인 알림", viewport, "alert-settings");
    await assertText(page, "목적지 출발", viewport, "alert-settings");
    await checkLayout(page, viewport, "alert-settings");
    await screenshot(page, viewport, "alert-settings");

    await page.close();

    console.log(`small-screen: ${viewport.name}/onboarding`);
    const onboardingPage = await browser.newPage();
    await onboardingPage.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 2 });
    await loadSeededApp(onboardingPage, onboardingState);
    await assertText(onboardingPage, "오늘의 외출, 미리 준비하세요", viewport, "onboarding");
    await assertText(onboardingPage, "온보딩 시작", viewport, "onboarding");
    await assertText(onboardingPage, "홈으로", viewport, "onboarding");
    await checkLayout(onboardingPage, viewport, "onboarding");
    await screenshot(onboardingPage, viewport, "onboarding");
    await onboardingPage.close();
  }
} catch (error) {
  if (optionalServer && isServerConnectionError(error.message)) {
    console.warn(`android small screen layout check skipped: ${error.message}`);
    process.exit(0);
  }
  issues.push(error.message);
} finally {
  if (browser) await browser.close();
}

if (issues.length > 0) {
  console.error(`android small screen layout check failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log(`android small screen layout check passed: ${evidence.length} screenshots`);

async function loadSeededApp(page, state) {
  await page.evaluateOnNewDocument((nextState) => {
    localStorage.setItem("weatheron.appState.v1", JSON.stringify(nextState));
    localStorage.setItem("weatheron.notificationState.v1", JSON.stringify({ readNotificationIds: [], notificationHistory: [] }));
  }, state);
  await page.goto(withCacheBust(previewUrl), { waitUntil: "domcontentloaded", timeout: 25000 });
  await waitForUi();
}

async function checkLayout(page, viewport, screen) {
  const result = await page.evaluate(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const overflowElements = [];
    const clippedButtons = [];
    const smallTouchTargets = [];
    const buttonLabelCounts = {};
    const all = [...document.querySelectorAll("button, [role='button'], [role='switch'], [role='checkbox'], input, textarea, img, [aria-label]")];
    for (const element of all) {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      if (rect.width <= 1 || rect.height <= 1) continue;
      if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) continue;
      const text = (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();
      const role = element.getAttribute("role");
      const isButton = role === "button" || element.tagName.toLowerCase() === "button";
      const buttonLabel = (element.getAttribute("aria-label") || text).replace(/\s+/g, " ").trim();
      if (rect.left < -1 || rect.right > width + 1) {
        overflowElements.push({
          tag: element.tagName.toLowerCase(),
          role,
          text: text.slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        });
      }
      if (isButton && buttonLabel) {
        buttonLabelCounts[buttonLabel] = (buttonLabelCounts[buttonLabel] || 0) + 1;
        if (rect.width < 44 || rect.height < 44) {
          smallTouchTargets.push({
            label: buttonLabel.slice(0, 80),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          });
        }
      }
      if (isButton && text && element.scrollWidth > element.clientWidth + 2) {
        clippedButtons.push({
          text: text.slice(0, 80),
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
        });
      }
    }
    return {
      width,
      height,
      documentWidth: Math.round(document.documentElement.scrollWidth),
      overflowElements: overflowElements.slice(0, 12),
      clippedButtons: clippedButtons.slice(0, 12),
      smallTouchTargets: smallTouchTargets.slice(0, 12),
      duplicateButtonLabels: Object.entries(buttonLabelCounts)
        .filter(([, count]) => count > 1)
        .map(([label, count]) => ({ label, count }))
        .slice(0, 12),
    };
  });

  if (result.documentWidth > viewport.width + 1) {
    issues.push(`${viewport.name}/${screen}: horizontal document overflow ${result.documentWidth} > ${viewport.width}`);
  }
  const meaningfulOverflow = result.overflowElements.filter((item) => item.tag !== "flt-glass-pane");
  if (meaningfulOverflow.length > 0) {
    issues.push(`${viewport.name}/${screen}: visible horizontal overflow ${JSON.stringify(meaningfulOverflow)}`);
  }
  if (result.clippedButtons.length > 0) {
    issues.push(`${viewport.name}/${screen}: clipped button text ${JSON.stringify(result.clippedButtons)}`);
  }
  if (result.smallTouchTargets.length > 0) {
    issues.push(`${viewport.name}/${screen}: small touch target ${JSON.stringify(result.smallTouchTargets)}`);
  }
  if (result.duplicateButtonLabels.length > 0) {
    issues.push(`${viewport.name}/${screen}: duplicate accessible button label ${JSON.stringify(result.duplicateButtonLabels)}`);
  }
}

async function assertText(page, text, viewport, screen) {
  const found = await page.evaluate((target) => document.body.innerText.includes(target), text);
  if (!found) issues.push(`${viewport.name}/${screen}: missing text "${text}"`);
}

async function assertAnyText(page, texts, viewport, screen) {
  const found = await page.evaluate((targets) => targets.some((target) => document.body.innerText.includes(target)), texts);
  if (!found) issues.push(`${viewport.name}/${screen}: missing any text "${texts.join("\" or \"")}"`);
}

async function assertNoText(page, text, viewport, screen) {
  const found = await page.evaluate((target) => document.body.innerText.includes(target), text);
  if (found) issues.push(`${viewport.name}/${screen}: unexpected text "${text}"`);
}

async function clickText(page, text) {
  const point = await page.evaluate((target) => {
    const normalize = (value) => (value || "").replace(/\s+/g, " ").trim();
    const elements = [...document.querySelectorAll("button, [role='button'], a, [tabindex], *")];
    const candidates = [];
    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      if (rect.width <= 1 || rect.height <= 1) continue;
      if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) continue;
      const label = normalize(element.getAttribute("aria-label") || element.innerText || element.textContent);
      if (!label.includes(target)) continue;
      const tag = element.tagName.toLowerCase();
      const role = element.getAttribute("role");
      const interactive = tag === "button" || tag === "a" || role === "button" || element.hasAttribute("tabindex");
      candidates.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        exact: label === target,
        interactive,
        area: rect.width * rect.height,
      });
    }
    candidates.sort((a, b) => Number(b.exact) - Number(a.exact) || Number(b.interactive) - Number(a.interactive) || a.area - b.area);
    return candidates[0] ?? null;
  }, text);
  if (!point) throw new Error(`missing clickable text: ${text}`);
  await page.mouse.click(point.x, point.y);
  await waitForUi();
}

async function clickBell(page) {
  const clicked = await page.evaluate(() => {
    const target = [...document.querySelectorAll("[role=button],button")].find((element) =>
      (element.getAttribute("aria-label") || "").startsWith("알림 열기"),
    );
    if (!target) return false;
    target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, pointerId: 1, pointerType: "mouse", isPrimary: true }));
    target.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true, pointerId: 1, pointerType: "mouse", isPrimary: true }));
    target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return true;
  });
  if (!clicked) throw new Error("missing notification bell");
  await waitForUi();
}

async function screenshot(page, viewport, screen) {
  if (!captureScreenshots) return;
  const path = `/tmp/weatheron-${viewport.name}-${screen}.png`;
  await page.screenshot({ path, fullPage: false });
  evidence.push(path);
}

function withCacheBust(url) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}small=${Date.now()}`;
}

async function waitForUi() {
  await new Promise((resolve) => setTimeout(resolve, 900));
}

function isServerConnectionError(message) {
  return /ERR_CONNECTION_REFUSED|ECONNREFUSED|net::ERR_FAILED|fetch failed/i.test(message);
}
