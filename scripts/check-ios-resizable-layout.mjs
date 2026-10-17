import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const responsiveSource = readFileSync("apps/mobile/src/theme/responsiveLayout.ts", "utf8");
const responsiveModule = { exports: {} };
const responsiveCode = ts.transpileModule(responsiveSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
new Function("module", "exports", "require", responsiveCode)(responsiveModule, responsiveModule.exports, (name) => {
  if (name === "react") return { createContext: () => ({}), useContext: () => null, useMemo: (factory) => factory() };
  if (name.endsWith("localization/react-native")) return { useWindowDimensions: () => ({ width: 0, height: 0 }) };
  throw new Error(name);
});

const { resolveNavigationContainerLayout, resolveResponsiveLayout, sideNavigationRailWidth } = responsiveModule.exports;
for (const [width, height] of [[320, 568], [375, 667], [390, 844], [430, 932], [600, 850], [760, 520]]) {
  const layout = resolveResponsiveLayout(width, height);
  assert.equal(layout.width, width);
  assert.equal(layout.height, height);
  assert.ok(layout.contentMaxWidth > 0);
  assert.ok(layout.screenHorizontalPadding > 0);
}
assert.equal(resolveResponsiveLayout(375, 667).useSideNavigation, false);
assert.equal(resolveResponsiveLayout(600, 850).useSideNavigation, true);
assert.equal(resolveResponsiveLayout(760, 520).useSideNavigation, true);
assert.equal(resolveResponsiveLayout(430, 932).useSideNavigation, false);
assert.equal(resolveResponsiveLayout(-10, -20).width, 0);
assert.equal(resolveResponsiveLayout(-10, -20).height, 0);

const narrowContainer = resolveNavigationContainerLayout(600, 850, 0, 0);
assert.equal(narrowContainer.useSideNavigation, false);
assert.equal(narrowContainer.contentWidth, 600);
const wideContainer = resolveNavigationContainerLayout(600 + sideNavigationRailWidth, 850, 0, 0);
assert.equal(wideContainer.useSideNavigation, true);
assert.equal(wideContainer.contentWidth, 600);
assert.equal(resolveNavigationContainerLayout(600 + sideNavigationRailWidth, 479, 0, 0).useSideNavigation, false);
assert.equal(resolveNavigationContainerLayout(600 + sideNavigationRailWidth - 1, 850, 0, 0).useSideNavigation, false);
assert.equal(resolveNavigationContainerLayout(760, 520, 20, 0).contentWidth, 648);

const appNavigator = readFileSync("apps/mobile/src/navigation/AppNavigator.tsx", "utf8");
assert.match(appNavigator, /useSideNavigation = Platform\.OS === "ios" && layout\.useSideNavigation/);
assert.match(appNavigator, /const renderPrimaryNavigation = \(navigationRoute: AppRouteId, placement: "bottom" \| "side" = "bottom"\)/);
assert.match(appNavigator, /key=\{`primary-navigation-\$\{navigationRoute\}`\}/);
assert.match(appNavigator, /renderPrimaryNavigation\(route, useSideNavigation \? "side" : "bottom"\)/);
assert.match(appNavigator, /styles\.rootWithRail/);
assert.match(appNavigator, /key="route-stack"/);
assert.match(appNavigator, /width - insets\.left - insets\.right/);
assert.match(appNavigator, /resolveReservedContentRegion/);
const bottomNav = readFileSync("apps/mobile/src/components/BottomNav.tsx", "utf8");
assert.match(bottomNav, /placement\?: "bottom" \| "side"/);
assert.match(bottomNav, /sideRail && styles\.rail/);
assert.match(bottomNav, /sideRail \? styles\.railIosDockFrame/);
const selectionSheet = readFileSync("apps/mobile/src/components/IosSelectionSheet.tsx", "utf8");
assert.match(selectionSheet, /resolveReservedContentRegion/);
assert.match(selectionSheet, /width: panelWidth/);
assert.match(selectionSheet, /translateX: panelCenterX - width \/ 2/);
assert.match(selectionSheet, /maxWidth: 560/);
assert.match(selectionSheet, /automaticallyAdjustKeyboardInsets/);
const destinationHub = readFileSync("apps/mobile/src/screens/DestinationHubScreen.tsx", "utf8");
assert.match(destinationHub, /useResponsiveLayout/);
assert.match(destinationHub, /<ScrollView horizontal/);
const destinationCare = readFileSync("apps/mobile/src/screens/DestinationCareScreen.tsx", "utf8");
assert.match(destinationCare, /fontScale > 1\.15/);
assert.match(destinationCare, /singleRow=\{!compactControls\}/);
const weatherDetail = readFileSync("apps/mobile/src/screens/WeatherDetailScreen.tsx", "utf8");
assert.match(weatherDetail, /fontScale > 1\.35/);
assert.match(weatherDetail, /styles\.factGridCompact/);
const rainTimeline = readFileSync("apps/mobile/src/screens/RainTimelineScreen.tsx", "utf8");
assert.match(rainTimeline, /fontScale > 1\.35/);
assert.match(rainTimeline, /styles\.rainDecisionStripCompact/);
assert.match(rainTimeline, /styles\.togglePanelCompact/);
const appScreen = readFileSync("apps/mobile/src/components/AppScreen.tsx", "utf8");
assert.match(appScreen, /automaticallyAdjustKeyboardInsets/);

console.log("PASS: executed responsive layout thresholds and container-width math; static source assertions cover rail, sheet, keyboard, and large-text wiring. Native rendering remains device QA.");
