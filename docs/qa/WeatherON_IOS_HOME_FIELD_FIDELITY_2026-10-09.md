# iOS Home field fidelity — installed 22:10 KST

## User-requested typography follow-up — installed 22:15 KST

This follow-up supersedes the installed bundle/capture and banner limitation below. Actual original capture: `local-evidence/ios-home-type-balance-light.png` (1320×2868), banner-free including the complete dock. Bundle SHA256: `478294bff2c2d1d788ddcf00b77fd1dd910ece4f6336b06e978f97c769cd1c13`.

The identified text immediately below the high/low range is the live `companionMessage`: “선선한 날이에요. 가벼운 겉옷이면 좋아요.” The iOS companion changed from font/line-height 34/42pt to 30/39pt, maximum width 352pt within available layout width. The intact translation key is resolved before inserting a newline at its first sentence boundary. Current physical Korean rendering is exactly “선선한 날이에요.” then “가벼운 겉옷이면 좋아요.” with no orphan “면” line start. The same type hierarchy applies in light/dark. No numberOfLines, font fitting, ellipsis, fixed height or font-scale cap was added; narrow screens, larger text and longer translations may expand beyond two lines. A one-sentence short status remains naturally short rather than adding meaningless forced text.

The user's newer temperature preference overrides the original approved-board size: iOS normal temperature font/line-height changed 124/120pt → 112/108pt (font −9.7%, line height −10%). Short-height variant changed 100/100pt → 90/90pt. Condition remains 22/30pt, high/low 16/24pt, existing buttons and hero frame 126pt are unchanged. Same-mode original physical before/after pixels were viewed: the temperature remains the dominant information, cloud is subordinate, and the two-line guidance has more breathing room. No claim of a latest physical dark or Dynamic Type pass is made.

PASS: actual hero test across seven conditions, iOS/Android, light/dark, plus actual KO/EN/JA locale strings translated intact then split without information loss; uncapped companion props. TypeScript, native localization/export 87-consumer check, contrast/lifecycle and diff checks passed. Both requested type changes were bundled into one ARM64 jobs1 incremental build and one data-preserving overwrite install after process inspection; build, strict/deep signing check and physical launch/capture passed. No observed fatal/RedBox; retained background warnings are listed below. Temporary QA project/workspace were moved out and dependency symlink removed. Background implementation is the already-installed 22:10 correction; remaining upper-color fidelity and physical dark/touch/accessibility checks remain open.

This report supersedes the installed-state/flat-field conclusions in the earlier icon/surface diagnosis. The first-stage common foundation and Home implementation is present on `feat/ambient-surface-foundation-home`; remaining screens are not comprehensively migrated. No commit, push, merge, deployment, app deletion/data reset, signing or security changes occurred.

## Reference and implementation

Original final core iOS light v3 pixels were reviewed again, together with the previously verified 104-page manifest and final SVG icon package. Home maps the core wordmark, current weather, preparation, destination/schedule, outfit preview and dock to existing live selectors. The user-required hero uses the final icon board's 126-unit frame and scales on narrow layouts; current live condition and temperature remain authoritative. Approximate visible cloud/temperature glyph height ratio is 74%, compared with 77% from the supporting icon board geometry; the core Home itself has no separate hero ratio specification.

The background retains real-wind bounded breathing, current-rain density, native coordinate-based touch, invalid-data handling, app-background and reduced-motion/transparency controls. It now adds a native CoreImage nonrepeating fine density field within the existing weather-controlled layer, without a raster design-board backdrop, repeating asset, package dependency or frame timer. A bounded native image is regenerated on theme/size changes only. The iOS base has a stronger blue upper region, diffuse unequal contours rise gently to the right, and scoped Home reading foreground is darker in light mode. Bright functional icon accents remain unchanged. Native dock selection is circular glass with quiet coral tint; all tab glyphs remain outlined.

## Actual evidence

Latest original physical capture: `local-evidence/ios-home-field-fidelity-light.png` (1320×2868). This is an installed app execution, not a composed mockup. Hermes bundle SHA256: `213f25bdf69d66d28692017997e114a988aa3737d2cc9345abf724e6b63c56fe`. Build/console/capture/metrics evidence uses prefix `ios-home-field-fidelity-` in task-2/evidence. Native texture harness evidence is diagnostic rendering only, not an app capture.

The latest screenshot has a development warning banner obscuring the dock's lower portion. The preceding `ios-home-surface-texture-light.png` at 22:02 is banner-free and confirms full circular selection and outline dock; it predates the latest base/contour/foreground changes. No claim of a banner-free latest-version dock is made.

## Results and limits

- PASS: TypeScript, actual HomeDecisionHero regression for seven conditions/platform/theme combinations, actual Ambient component/hook lifecycle, installed RN gradient parsing, rain/wind bounds, freeze behavior, touch coordinate conversion, diff whitespace check.
- PASS: conservative source contrast under maximum flow/touch: dark body 7.51, secondary 4.95, functional label 4.52; light body 13.01, secondary 5.59, functional label 4.54, functional icon 3.13, ON 3.14. The light reading foreground override is scoped to iOS Home. Native display/accessibility still requires physical checks.
- PASS: sequential ARM64 jobs1 incremental build, strict/deep codesign, existing-app overwrite install, launch and actual capture. No observed fatal/RedBox; existing BackgroundModes/Metro inspector warnings remain.
- PASS: actual right-margin field variation test now 11.67 versus original 13.67, above the operational 75% minimum of 10.25. Neighbor roughness is 0.354 versus original 0.294, improved from 0.142 at 22:02. This criterion is a flatness check, not approved full-fidelity acceptance.
- PARTIAL: three original-pixel clear-region comparisons show upper RGB difference reduced from +38/+26/+11 to +22/+14/+6, middle from +15/+12/+5 to +8/+6/+1, lower now −3/0/0. The upper region remains brighter than the reference, and local variation differs. Contour direction, grain, shallow hero, text contrast and surface appearance were also visually reviewed; full fidelity is not declared complete on one brightness metric.
- Previously passed and unaffected by this final color/geometry batch: localization 2066 entries, native localization exports, iOS reliability 76 SQLite failure points and weather/notification boundaries, storage/photo/timezone regressions. Earlier reports retain detailed outputs.

## Remaining physical checks

No callable CUA/Mirroring/native-input tool is exposed in this environment. Simulator-only input refs were not substituted. A human or parent with authorized normal UI access must dismiss the current warning, capture latest full dock, exercise tabs → Home, scroll/re-entry and touch, then select app dark appearance for original physical dark capture. Physical Dynamic Type, VoiceOver, Reduce Motion/Transparency and complete error/loading/empty matrix remain unverified. Global device settings were not altered.

Continue upper-region color/distribution refinement after reviewing this concrete capture; do not treat passed flatness as full design acceptance. Do not broaden to other screens until this first-stage result is shared. Library403 and the earlier broad DB-copy denial remain respected; no workaround or private DB read occurred.
