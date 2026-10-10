# Continued iOS Home QA — latest installed 22:36–22:37 KST

## User physical verification update

After the normal-UI checklist was shared, the user reported: “응 너가 봐달라고 한건 다 직접 확인했고 문제 없어”. Record these four items as **PASS — user-performed physical iPhone verification** on the currently installed version:

- At standard text size, Home content has no clipping.
- In dark mode, weather icons, background and text are readable.
- Switching to each tab and returning to Home works normally.
- With larger text, all content remains reachable by scrolling.

These are human observations, not checks performed by this task's automation. No new screenshot, measured fontScale1.0 record, dark pixel comparison or native-input action was obtained by this task. They do not assert full approved-board fidelity, actual notification delivery, VoiceOver, Reduce Motion/Transparency or the complete error/loading/empty matrix. The remaining normal-UI checklist below is historical; these four coverage items are now satisfied by the user's report. Do not request the same four checks again. Installed bundle remains `bb8f5ab1a65895c2463078be3a6f434f3b3a1ea6383671116bdceedbba21db7b`; no new build/install/relaunch or settings change followed the report.

Remaining design difference: latest measured light upper RGB delta+12.62/+8.42/+3.53 and local spatial/fine-density differences versus the final core reference. Dark readability passed by user observation, while exact dark original-pixel fidelity is unmeasured. Existing App Attest warning and the unexplained latest signal9 event remain separate; see `WeatherON_IOS_HOME_READONLY_TERMINATION_DIAGNOSIS_2026-10-09.md`. User confirmation does not establish their underlying causes.

This report supersedes prior installed Home screenshots. First-stage Home/common implementation is installed but complete design acceptance and physical accessibility regression are still pending. No further screen migration, commit/push/merge/deployment, app deletion/reset or signing/security/auth changes occurred.

## Final bundled changes in this follow-up

- Restored the two-line companion to the existing localized Text/Pretendard path. Earlier RawText bypassed the application's font wrapper; this was an implementation defect. Full translation is still resolved before the sentence break. Font/line-height remains30/39pt, maxWidth352, no truncation or line cap.
- Actual fontScale above1.3 makes the iOS weather hero stack vertically, retaining temperature, condition, high/low and full weather icon. Normal scale retains the approved current horizontal hierarchy. More vertical space falls back naturally to the existing ScrollView; no fixed clipping or global text-setting changes.
- Reduced the light native density envelope over the upper blue region to35%, increasing smoothly to full density by65% of the view. This is a diffuse nonrepeating field; the existing real-weather layer still controls opacity/breath/scale. Dark density and materials retain their existing implementation.
- Light base upper color `#CBE1F7` → `#C6DDF5`. Small iOS Home preparation label `#B63121` → `#B12F21` preserves contrast on the deeper reading surface. Functional bright icon/button accent `#E53C24` is unchanged, as are other screens' palette values. Latest conservative source contrast: light text12.52, secondary5.37, small functional label4.57, icon3.01, ON3.02; dark text7.51, secondary4.95, functional label4.52.
- Added a development-only warning classifier before App imports. It preserves original console.warn delivery, records only static categories and counts to an authored cache JSON, never formatted arguments/errors/auth values. Release warning behavior is unchanged. The existing numeric layout diagnostic also remains development-only for pending normal-UI QA.

Changed source in this follow-up: `HomeScreen.tsx`, `AmbientSurfaceBackground.tsx`, `theme/ambientSurface.ts`, `LiquidGlassNavigationView.swift`, `apps/mobile/index.js`, new `src/debug/ambientWarningEvidence.ts`; associated hero/contrast checks. Earlier viewport helper changes remain installed.

## Actual device outcome

One ARM64 jobs1 incremental build after process inspection bundled these changes; BUILD SUCCEEDED, strict/deep codesign, existing-app overwrite install succeeded. Current Hermes SHA256 `bb8f5ab1a65895c2463078be3a6f434f3b3a1ea6383671116bdceedbba21db7b`.

Latest original actual Home: `local-evidence/ios-home-density-accessibility-settled-light.png` (1320×2868), banner-free, complete outfit and full circular/outline dock. This is a physical execution capture, not a model or synthetic composition. First `ios-home-density-accessibility-light.png` captured the launch splash and is invalid for Home pixel QA; its failed flatness result must not be treated as a Home design regression. A subsequent observation without our reinstall/relaunch shows Home.

First launched console process ended with signal9; a separate subsequent WeatherON app process70260 was observed running and provided the settled Home capture. We did not cause a second launch in this sequence. Cause of the termination/replacement is unverified; do not classify it as a clean launch-stability pass or invent a memory/user-action explanation. Existing BackgroundModes and disconnected Metro inspector warnings remain. No RedBox was observed in the settled Home.

Original-pixel comparison across three clear regions, avoiding labels/garments/dock: upper RGB delta now+12.62/+8.42/+3.53 (previous+21.98/+14.36/+5.99), middle+5.29/+4.00/+0.61, lower−2.58/−0.10/+0.01. Upper fine roughness0.274 vs reference0.361, middle0.335 vs0.347, lower0.438 vs0.352. Clear-margin field span11.0 exceeds unchanged flatness threshold10.25 (reference13.67), roughness0.325 vs0.294. Contour direction, typography, hero depth and quiet dock were visually checked as well. **Upper color and spatial variance still differ; full original-fidelity acceptance remains partial.** Actual clear/night data is retained rather than copying the rainy source-board example.

Numeric layout evidence continues to show viewport758pt/content758pt/overflow0 at actual fontScale0.882. A latest full-device default-scale1.0 pass is not established. The cache records only dimensions/scale/overflow; no user DB or content was copied.

## Warning diagnosis

The latest authored warning JSON reports `existing-app-attest-assertion:1`, warningDeliveryPreserved true. This maps to unchanged `providers/appIntegrity.ts` catch path: `console.warn("App Attest assertion unavailable", ...)`, followed by the existing empty-header fallback. Source diffs confirm no changes to that provider or accountAuth. The underlying caught error is intentionally not captured, so its server/key/network reason is unknown. This warning is outside the Home design change; no authentication/security adjustment or general warning suppression was performed.

Installed RN LogBoxData shows `Open debugger to view warnings.` is its Fusebox migration message: any warn with full-console support and no active debugger invokes it once per session; new process/session permits reappearance. Latest observed banner therefore had an existing account assertion warning trigger, rather than a confirmed new native texture registration warning. This does not prove every earlier banner had the same cause. Current source contains no LogBox ignoreAllLogs workaround.

Warning harness PASS: original warning arguments forwarded unchanged, authored diagnostic contains static category/count only and no private values/errors. Device read copied only the two exact authored numeric/warning cache filenames. Prior broad DB-copy denial and Library403 remain respected.

## Supplemental tests, clearly separated from physical QA

PASS: TypeScript; real HomeDecisionHero JSX/function across7 conditions/iOS+Android/light+dark/KO+EN+JA and scales1/1.6/2; actual large-type column branch; uncapped companion and intact translated information. Viewport source checks450–850pt, actual Ambient lifecycle/parser/weather/contrast checks, native localization87-consumer check, iOS reliability76 SQL failure points and weather/notification boundaries, whitespace check all pass.

No running simulator was available after a read-only check; no new simulator boot/build was started. No callable CUA/Mirroring/browser-control native input tool is exposed. Existing Puppeteer/Chrome provided a lightweight **DOM model of the actual HomeDecisionHero JSX/styles using actual app font files**, public test strings and native temperature-fitting constraints. Results are in `evidence/ios-home-type-model-results.json`; the harness is `check-home-type-model.mjs`. This is not RN/iOS app rendering, a physical capture, full Home default-height proof or touch/accessibility proof.

The model at content width384pt and scale1 renders full KO/EN/JA guidance in78pt (two39pt lines); width320pt permits additional lines for longer translations. Scales1.6/2 grow naturally to3–5 lines and use the actual component's vertical weather arrangement. No horizontal overflow or clipping was used to obtain the final model pass. Early row-layout and simplified-fit model failures informed the column fallback; final harness models the existing temperature minimum-font-fit0.8 without hiding content.

## Minimum remaining normal-UI checklist — perform once as a batch

1. Keep Home at top; dismiss warning if present. Set app-specific text size to standard only with the user's choice/authorized normal UI, confirm diagnostic fontScale1.0 and viewport/content/overflow, capture complete Home/dock.
2. Choose app dark appearance and return to Home; capture the actual original dark pixels. Exercise Home → another tab → Home, scroll down/top and touch an empty surface; verify data/re-entry and response.
3. With authorized app-specific larger text and a narrow viewport/test device, verify every label, required warning and existing detail action remains reachable by scrolling, then restore the user's chosen text size/appearance. Do not silently change global accessibility settings.
4. Review the remaining upper field color/spatial variance against final core originals. Additional refinement should follow concrete observed results, rather than repeating unchanged native builds.

Physical dark, standard-scale full-home fit, small/large-text scrolling, VoiceOver/Reduce Motion/Transparency and full error/loading/empty matrix remain unverified. Signal9 process replacement remains an observed event with unknown cause. These checks require authorized normal native UI access; source/DOM passes are not substitutes. Scope remains first-stage Home/common foundation.
