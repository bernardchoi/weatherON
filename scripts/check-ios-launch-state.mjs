import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync("apps/mobile/App.tsx", "utf8");
const navigatorSource = readFileSync("apps/mobile/src/navigation/AppNavigator.tsx", "utf8");
const stateSource = readFileSync("apps/mobile/src/state/useWeatherOnAppState.ts", "utf8");

assert.match(appSource, /SplashScreen\.preventAutoHideAsync\(\)/u);
assert.match(navigatorSource, /if \(!appState\.appStateHydrated\) return;[\s\S]*SplashScreen\.hideAsync\(\)/u);

const localRestoreStart = stateSource.indexOf("Promise.all([\n      readPersistedWeatherProviderResult");
const localRestoreEnd = stateSource.indexOf("  }, []);", localRestoreStart);
assert.ok(localRestoreStart >= 0 && localRestoreEnd > localRestoreStart, "local restore effect is missing");
const localRestoreEffect = stateSource.slice(localRestoreStart, localRestoreEnd);
assert.doesNotMatch(localRestoreEffect, /restoreAccountSession/u);
assert.match(localRestoreEffect, /setRoute\(persistedState\.onboardingCompleted \? "H1" : "O1"\)/u);
assert.match(localRestoreEffect, /setAccountLinked\(persistedState\.accountLinked\)/u);

const remoteRestoreStart = stateSource.indexOf("void restoreAccountSession().then");
assert.ok(remoteRestoreStart > localRestoreEnd, "remote account restore must run after the local restore effect");
assert.match(stateSource.slice(localRestoreEnd, remoteRestoreStart), /if \(!appStateHydrated\) return/u);
assert.match(stateSource, /return \{\n    appStateHydrated,/u);

console.log("iOS launch-state check passed");
