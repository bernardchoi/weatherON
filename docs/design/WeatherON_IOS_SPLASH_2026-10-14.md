# WeatherON iOS splash · 2026-10-14
Baseline: feat/ambient-surface-foundation-home, 1a258866e016bef65dd794be5981b7900909bf07. Existing 37-file palette/selected02 work retained. No commit, push, PR, merge, build install or deployment.

Actual IosLaunchSplash source: cloud down 9pt and opacity .35→1 (0–410ms); original B sun behind rises 14pt (180–780ms); faint mode-aware glow (280–850ms); fixed selected02 180×30 vector revealed by clip width (530–1010ms); hold to1280ms; exit220ms. Total1500ms. Reduced Motion/Transparency short260ms opacity substitute. Layout readiness/fallback once; load waits on unchanged navigator readiness; background cancels with no replay; bounded2100ms animation watchdog. Original B paths and existing selected02 curves untouched.

Colors: tokens.ts/brandPalette.ts background E9F6F8/102B38, Weather49656F/C4DCE3, ON80591F/D8BB7A. B cloud547F94/F4F8F8; sunFFC650/FFCC59 from approved light/dark B layer SVGs. Existing button accent unchanged.
Native storyboard first cloud uses matching180×124 region, centerY−29; dark/light image appearances at1×2×3×. Plugin aligns Expo generated storyboard and copies image set. Old icon assets preserved. Android legacy function/styles and effective Expo splash options remain equal to baseline.

Verification: mobile TypeScript noEmit pass; check-ios-launch-state, check-ios-brand-splash, platform-boundary and diff whitespace pass. Source-level effect harness covers timeline, one-shot, slow load, unknown accessibility policy, reduced motion, background/resume, watchdog and unmount. Native XML / SDK mutation static checks pass. MP4s are actual RN component rendered through RN Web/SVG boundary adapters at390×844,2×25fps controlled clock; Home after splash is a prior source-rendered static screenshot. These are browser previews, not native device measurements. No native clean-prebuild, Xcode build, device launch, GPU/thermal or real API timing claim.

Text patch omits PNG bytes: use source ZIP for all new native PNGs. Apply over current palette/wordmark workspace, not as complete pristine-app replacement.
