# Home character integration — 2026-11-08

## Scope and status

Local implementation on `6e5700bdf875f7a1c523461c523a84be298ed129` (main baseline), in detached worktree `/Users/daehyeonchoi/Documents/Codex/weatheron-character-integration` on Daehyeons-Laptop.local. Uncommitted, unpushed, not included in main or a TestFlight build. No device build, release, or settings change performed.

The current home information hierarchy, weather icon, temperature/details, outfit and destination controls remain in place. iOS receives a decorative header slot (80pt; 56pt on narrow screens/large type). It does not intercept touch or add repeated screen-reader content. Existing header reading-region registration includes the slot. The neutral pose remains visible if weather cannot be verified; it does not claim a forecast.

## Assets and motion

The source-approved small eyes, no white catchlights, revised teal/cream/yellow design is preserved. The four local RGBA PNGs use a shared 1024px canvas/foot baseline. Weather and daylight remain independent (rain at night remains rain); cold and heat are presentation states, not official warnings. Cold clothing is selected only for snow (no new cold-temperature threshold); heat follows the existing art bible's 35°C threshold. Rain/storm retain the umbrella rather than switching to a cold pose. Unknown/loading/stale/fallback/unverified-location data uses neutral. Current atmosphere, not future rain probability, drives state.

The base/cold/heat poses use restrained 0–1pt drift. Base alone now has timed half/closed eye overlays. Rain uses a source-mask part rig: body/head remain stationary while the umbrella, hand and arm rotate together within ±0.6°. This is **not** free joint rigging, umbrella bending, articulated clothing, free fan-joint deformation, or a Rive rig. Those remain unimplemented. No additional weather/network/AI request, dependency change, video decoder, or particle system was added. Wind is an independent, low-opacity curve layer driven continuously by verified current wind speed, with no new strong-wind threshold. The heat pose uses a fan.

Files sourced from the asset worker's normalized set, unchanged:
- main-fullbody.png: `libfile_bd3eea7321b0819193e221919802655b`, SHA256 `2f28b09fada26ca5ce738d16be3d7bffcb2f61f5dffdd2cc4ab599a016615e97`
- main-rain.png: `libfile_7f563313d5f48191bf8fb6e5cad69c6c`, SHA256 `f3945bbfa43c81c2552466b657a9dff721eb070f6e7eca847ecac0d1fbdf12fc`
- main-cold.png: `libfile_e86f8d17a1b88191818bc0cad007cc02`, SHA256 `dcf5e17dde7074093fa2f3a66a4230bce4c11d24cee8dfed23d06b341408848e`

## Verification

- `node scripts/check-home-mascot.mjs`: 112 assertions pass, including actual component effect gating/cleanup, state combinations, unknown/invalid values, asset canvas/alpha format, and integration policy guards.
- `tsc -p apps/mobile/tsconfig.json --noEmit --preserveSymlinks`: pass. Reused existing host dependencies; missing react-native-svg 15.15.4 was fetched from npm into an isolated temporary directory, linked only in this worktree. No package/lockfile edits.
- `node scripts/check-home-ambient-host.mjs`: pass.
- `node scripts/check-home-viewport.mjs`: pass.
- `node scripts/check-ambient-surface-regressions.mjs`: pass.
- `git diff --check`: pass.
- `check-home-weather-icon.mjs`: fails existing Japanese sentence spacing assertion. Reproduced with untouched HEAD HomeScreen; not introduced by character changes. Left outside scope.

## Deferred verification

Physical-device UI/performance QA is deliberately deferred at the user's request until the overall design pass. Header layout, small-eye legibility, narrow/large-type views, light/dark contrast, scroll/background/low-power switching, VoiceOver, native Liquid Glass/Ambient compositing, memory, battery and frame rate still require rendering/device verification. Unit and source checks are not a visual QA substitute. Do not mark the whole character/motion production task or release as complete from this integration alone.

## Extended non-device visual QA

- Added `main-heat.png` from `libfile_715a79c4d358819195db0e57bc6a359b`, SHA256 `c6d7b1c343b3bed72f150f8cc4f9b105e42f38d7b583224ab011155757d461c3`.
- `node scripts/render-home-mascot-qa.mjs` renders the **actual** HomeWeatherMascot component using react-native-web. It passed: transform changes between frames, Reduce Motion stays static, no browser runtime errors. Outputs `/tmp/weatheron-character-render/frame-a.png`, `frame-b.png`, `result.json`.
- Visually inspected light/dark, clear/rain at night/snow/heat/wind/unknown and actual 80/56pt poses. Artwork/umbrella stays inside its canvas; gust stays beside the face. Small 56pt version is deliberately decorative, not a replacement for the existing weather text/icon.
- CoreSimulatorService was unavailable (connection refused) during read-only simctl inquiry, so no simulator session/build was performed. Used local headless Chrome instead, without changing system settings. This does not prove full native Home layout or native compositing/performance.
- Initial Library heat transfer had a null URL and the attempted malformed download was denied; metadata was refreshed and a verified signed HTTPS Library transfer succeeded. No malformed source was used.

## Eye and umbrella part integration

- Base-only eye overlays: `libfile_371ae4ca119881918934c0bf17aef360` (half), `libfile_f8a97ff01c9c8191b7b5898996a45faa` (closed). One owned cancellable timer: wait 6s → half 60ms → closed 80ms → half 60ms → open. No overlays on rain/cold/heat faces. No blink under Reduce Motion, unavailable motion policy, neutral weather, hidden or inactive state.
- Rain original: `libfile_3b374661c7d08191bec6b2c2275e95e4`; mask contract `libfile_7ab05db02eb88191a460c438a406635e`. `HomeMascotRainRig.tsx` applies the exact 1024 normalization and `(720,940)` source pivot. Per-instance SVG IDs and explicit userSpaceOnUse mask bounds. Native-driver View rotation preserves the source mask layers without per-frame React updates.
- Extended browser test observes both eye-overlay variants and return to open, changing umbrella transform with unchanged body SVG, static reduced-motion rendering, and zero runtime errors. Enlargement of rain source boundaries inspected at 320pt. Screenshot Library ID `libfile_36818d8796f88191aead1e2dac0dfc12`.
- The fan source-mask experiment failed asset QA (root seam/cut boundaries) and is deliberately **not included or enabled**. This earlier exclusion is superseded only by the separately repaired v4 sprite rig described below; the failed mask assets remain excluded. No failed experimental assets copied into app.
- Native mask/render memory behavior and full Home layout remain in deferred native/device QA. Browser validation is not proof of native fidelity.

- Independent audit correction: `current.tempAvailable` is passed through to mascot state. A numeric hourly fallback in `tempC` with `tempAvailable:false` cannot select the heat pose. Regression covers unavailable 36°C fallback and available 36°C current observation.

## Repaired fan v4 integration (supersedes static heat-only status)

The asset worker rebuilt the hidden body/face underlay and registered a separate fan+hand+arm sprite, then independently checked 80/320pt light/dark and ±5° extremes. Integrated only this passing v4 pair in `HomeMascotFanRig.tsx`:
- underlay `libfile_9940e4620ff88191bab8f9580acb92e6`
- sprite `libfile_2020e20e460081918f19d8e6e17afe42`
- contract `libfile_2083706fe6fc8191af5aa6486a1c601d`

Both are 1024 RGBA, pivot (396.554974,780.727749). Fixed body + one rotating sprite, no native mask/filter. Two 1.5s cycles within ±5°, neutral return and 4s pause. Motion disabled returns immediately to 0° and stops the loop. Original static heat image is retained for load-error fallback. Slightly darker shoulder shading is a known art difference; not claimed pixel-identical to original.

TypeScript, 112 automated assertions, diff whitespace check pass. Actual RN-web replay checks changing fan transform with unchanged underlay, neutral stop transition, eye sequence, umbrella body stability and no runtime errors. Inspected 80/320pt bright/dark captures: hand remains in contact, no visible white gap/root cut at these sizes. Test harness needed `global: globalThis` (standard RN-web environment alias) for stopping native-style animations; this changed only QA bundling, not application logic. Physical/native validation remains deferred.

## Fan v9 correction after user feedback (current candidate)

User rejected v4 arm anatomy despite earlier technical checks. v6 was replay-tested but rejected by independent visual QA (tube-like arm/shoulder patch), and preserved outside the application at `/tmp/weatheron-fan-v6-review`. v4 originals remain at `/tmp/weatheron-fan-v4-preserved`; neither is the current sprite.

Current v9 uses four layers: fixed underlay → rotating arm/fan → fixed foreground head → rotating foreground fan. Both moving layers share the **same interpolation object and pivot**, `(393.8062827225131,736.7486910994764)`, ±5°. Head occlusion hides the shoulder root; the arm is a narrow rounded bend rather than a horizontal band. Same cycle/rest and stop policies. Inputs/temperature-availability audit fix unchanged.

Sources: arm/fan `libfile_b1ea04df5a6c8191964040d5feae6d07`, head `libfile_1a6cafe544188191bf1e5c36fbeb36a5`, fan front `libfile_ea767a6224f08191bd043fd07b8f1d50`, contract `libfile_4f51a1b12c748191af723068f880631a`. Underlay unchanged from v4.

Independent asset QA recommended the v9 small-home candidate. Actual RN-web verification passes: both moving layers have identical changing transforms; head and body markup remain unchanged; pause returns neutral; no browser errors. 80/320pt light/dark render visually inspected. No observed facial incursion, white gap or hand disconnection in these rendered frames. Enlarged arm shine still differs slightly from matte body; aesthetic acceptance by the user and native/device validation are not claimed. Screenshot `libfile_f0da8cf9a0388191ac190bc3d535c039`.

Latest automated results: **120 assertions**, TypeScript, diff check pass. Remains uncommitted/unpushed, not in main/TestFlight.

## Fan v11 outward-elbow candidate (current)

After user feedback that v9's elbow appeared to bend into the body, replaced only the arm/fan and fan-front art with v11 and the shoulder pivot with `(391.05759162303667,731.2513089005236)`. Underlay/head-front and all shared-animation/stop policies remain unchanged. V9 assets preserved at `/tmp/weatheron-fan-v9-preserved`.

Sources: arm/fan `libfile_0bed7cf6e07c8191ad583525442f7751`, fan front `libfile_59a0d94e9e9c819187f106455a78038a`, contract `libfile_ebd3294e992c81919a75c4b6b2ac4a8f`. Actual component replay passes TypeScript and the 120-assertion suite; synchronized layer movement, fixed body/head and stop-to-neutral all pass in RN web. Captured 12 actual replay frames in each of light/dark (24 crops at 320px) and examined the sequence. Elbow stays on the outer side in these samples, with no observed hand disconnect or root gap. At enlargement its short rounded tip can still read as paddle-like; this is a remaining aesthetic limitation, not asserted final user acceptance. Native/device validation remains deferred.

## Fan v13 arm-thickness candidate (current)

User noted v11's moving arm was thinner than the other arm. V13 widens upper arm/forearm and softens the deep inner shade while keeping the v11 outward-elbow pose and pivot. Only arm/fan (`libfile_4a3c360e9d34819189298409c51047f0`) and front fan (`libfile_439e877442848191ac6302ce5a06a825`) changed. V11 art/sequence preserved under `/tmp/weatheron-fan-v11-preserved`. No timing, motion policy, mapping or availability logic changed.

120 assertions, TypeScript, actual RN-web replay/stop checks pass. Inspected 12 light and 12 dark actual-render samples at 320px plus 80pt rendering: visible width is consistent across sampled motion; hand attachment, outside elbow and shoulder connection remain intact. Arm reads less string-like. At enlargement the fuller elbow can still read paddle-like, so further enlargement is not recommended. This is a visually reviewed candidate, not final user aesthetic acceptance or native/device clearance.

## Fan v16 shoulder-connection candidate (current)

User feedback identified a detached-shoulder impression in v13. V16 introduces a fixed shoulder socket in the head-front overlay, covering the rotating upper-arm root, with fan/hand/shaft in the foreground. Same pivot, angle, timing, four-layer contract and availability/motion policies. V13 art/sequence preserved at `/tmp/weatheron-fan-v13-preserved`.

Sources: rotating arm `libfile_f91483677b8081919db3af4c6394d7b7`, fixed head/socket `libfile_17aec7eef3748191b8589385066bb269`, rotating front fan/hand `libfile_1c151c289b7c8191be685508d4945449`. Underlay unchanged.

120 assertions and TypeScript pass. Actual browser replay validates synchronous rotating layers, fixed body/head, neutral stop and no runtime errors. Inspected bright/dark 80/320pt views and sampled replay frames, including enlarged frame 3/8: shoulder looks more attached, hand contact and outside elbow persist; no exposed white gap observed. A soft darker shoulder patch remains visible at enlargement, so a perfectly seamless painterly transition or final user aesthetic approval is not claimed. Physical/native validation remains pending.

## Fan v17 localized shoulder finish (current)

Only fixed head/shoulder overlay changed (`libfile_c667c0b294408191b1702c54b3415407`), reducing the brighter cyan socket shading. All moving art, underlay, pivot, mask/layer structure, timing and policies remain as v16. Previous overlay preserved at `/tmp/weatheron-fan-v16-preserved`.

TypeScript, 120 assertions and actual browser replay/neutral-stop checks pass. Reviewed light/dark sampled sequence and 320px frame details: connection remains closed, socket brightness is less detached, no exposed gap observed. Soft socket texture remains visible at enlargement; perfectly invisible compositing or final aesthetic/native acceptance is not claimed. Uncommitted/unpushed; not in main or TestFlight.

## 2026-11-09 approved v18 arm integration
- Replaced only `heat-fan-sprite.png` with user-approved Library `libfile_12bebcc20de881918c6e869bfbd304e0`. Prior v17 sprite preserved in `/tmp/weatheron-fan-v17-preserved/`.
- Underlay, head/shoulder socket, fan-front, pivot, motion timing, availability and stop policies unchanged.
- Passed 120 automated assertions, TypeScript (`--preserveSymlinks`), whitespace check and actual RN web component playback. Both rotating layers remain synchronized; fixed body/head unchanged; stopping returns to zero; reduced motion stays static; no browser page errors.
- Inspected light/dark 320px sequential captures and existing 80pt sample. No visible shoulder separation or hand/fan discontinuity in inspected frames. Approved artwork retains its smooth shoulder shading.
- QA video is a recording of actual RN web screenshots, not a native iOS/device capture. Native whole-Home layout, performance, battery and Liquid Glass interactions remain deferred to combined design/device QA.
- Host Daehyeons-Laptop.local; detached worktree `/Users/daehyeonchoi/Documents/Codex/weatheron-character-integration`, base SHA `6e5700bdf875f7a1c523461c523a84be298ed129`. Changes remain uncommitted/unpushed and not integrated in main/TestFlight.

### Video QA correction
The first v18 WebM recording opened a separate recorder tab, risking app-background motion suppression. User correctly reported motion was not apparent. This was not a sufficient video acceptance check despite the earlier DOM and PNG checks. Re-recorded on the same active page with expanded viewport, 2x zoom and all four rig transform values observed through ±5 degrees. Decoded WebM via data URL (HTTP server without Range handling was unsuitable for seeking), checked time-varying pixels. Replacement: `WeatherON-v18-visible-motion-RN-web.webm`. Timing is unchanged: about 3s of fanning and 4s pause; non-device RN web capture only.
