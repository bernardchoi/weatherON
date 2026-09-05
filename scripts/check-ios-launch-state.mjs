import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const appSource = readFileSync("apps/mobile/App.tsx", "utf8");
const navigatorSource = readFileSync("apps/mobile/src/navigation/AppNavigator.tsx", "utf8");
const stateSource = readFileSync("apps/mobile/src/state/useWeatherOnAppState.ts", "utf8");

assert.match(appSource, /SplashScreen\.preventAutoHideAsync\(\)/u);
assert.match(navigatorSource, /if \(!appState\.appStateHydrated && !appState\.storageLoadError\) return;[\s\S]*SplashScreen\.hideAsync\(\)/u);

const localRestoreStart = stateSource.indexOf("Promise.all([\n      readPersistedWeatherProviderResult");
const localRestoreEnd = stateSource.indexOf("  }, [storageRetryTick]);", localRestoreStart);
assert.ok(localRestoreStart >= 0 && localRestoreEnd > localRestoreStart, "local restore effect is missing");
const localRestoreEffect = stateSource.slice(localRestoreStart, localRestoreEnd);
assert.doesNotMatch(localRestoreEffect, /restoreAccountSession/u);
assert.match(localRestoreEffect, /setRoute\(persistedState\.onboardingCompleted \? "H1" : "O1"\)/u);
assert.match(localRestoreEffect, /setAccountLinked\(persistedState\.accountLinked\)/u);

const remoteRestoreStart = stateSource.indexOf("void restoreAccountSession().then");
assert.ok(remoteRestoreStart > localRestoreEnd, "remote account restore must run after the local restore effect");
assert.match(stateSource.slice(localRestoreEnd, remoteRestoreStart), /if \(!appStateHydrated\) return/u);
assert.match(stateSource, /return \{\n    appStateHydrated,/u);

const storyboard = readFileSync("apps/mobile/ios/WeatherON/SplashScreen.storyboard", "utf8");
assert.match(storyboard, /firstAttribute="width" constant="108"/u);
assert.match(storyboard, /firstAttribute="height" constant="108"/u);
assert.match(storyboard, /firstAttribute="centerX"/u);
assert.match(storyboard, /firstAttribute="centerY"/u);
const images = JSON.parse(readFileSync("apps/mobile/ios/WeatherON/Images.xcassets/SplashScreenLogo.imageset/Contents.json", "utf8")).images;
assert.ok(images.some((image) => image.appearances?.some((appearance) => appearance.value === "dark")));
assert.match(navigatorSource, /if \(!launchReady && !appState\.storageLoadError\) return/u);

// Run the actual launch effect to verify readiness, accessibility and cancelled transitions.
const splashSource = ts.createSourceFile("LaunchSplash.tsx", readFileSync("apps/mobile/src/components/LaunchSplash.tsx", "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let effect;
function visit(node) {
  if (ts.isCallExpression(node) && node.expression.getText(splashSource) === "useEffect" && node.arguments[1]?.getText(splashSource).includes("started")) effect = node.arguments[0].getText(splashSource);
  ts.forEachChild(node, visit);
}
visit(splashSource);
assert.ok(effect);
let finished = 0;
let stopped = false;
let complete;
const Animated = { delay: () => ({}), timing: () => ({}), sequence: () => ({ start: (callback) => { complete = callback; }, stop: () => { stopped = true; } }) };
const run = new Function("started", "reduceMotion", "theme", "onFinish", "Animated", "Easing", "nameOpacity", "opacity", ts.transpileModule(`const effect = ${effect};`, {}).outputText + "\nreturn effect();");
const execute = (started, reduced) => run(started, reduced, { reducedTransparency: false }, () => finished++, Animated, { out: () => {}, cubic: () => {} }, {}, {});
execute(false, false);
execute(true, null);
assert.equal(complete, undefined);
assert.equal(finished, 0);
execute(true, true);
assert.equal(finished, 1, "reduced motion must enter without the animation delay");
const cleanup = execute(true, false);
complete({ finished: false });
assert.equal(finished, 1, "cancelled animations must not complete launch");
complete({ finished: true });
assert.equal(finished, 2);
cleanup();
assert.equal(stopped, true);

console.log("iOS launch-state check passed");
