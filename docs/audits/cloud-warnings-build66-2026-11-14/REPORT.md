# Build 66 warning audit — 2026-11-14

## Evidence and counting

- Repository: bernardchoi/weatherON; source SHA `3233c8a4feb5ceb0ca94fbc36c28531dc643e464`.
- Xcode Cloud build 66, Archive iOS, Xcode 27.1 (27A9275), macOS 27.2 (26B123).
- App Store Connect shows **623 warnings, 0 errors**. Downloaded build 66 XCResult contains **627 warning summaries** and metrics.warningCount=627. Both numbers are preserved; the four-item display discrepancy is not yet attributed.
- Raw archive log repeats diagnostics (3,760 `warning:` lines), so raw line count is not the defect count.
- `warnings.csv` enumerates all 627 summaries with target, category, message and source location. This is the build 66 evidence, not an extrapolation from build 64.
- App target name does not prove app-owned source: WeatherON's 40 summaries include generated JS bundle globals, SDK module context, toolchain search path and signed widget stripping notice. No direct app-owned Swift/ObjC source warning was found in these summaries.
- The previously merged build 64 fixes remain in this SHA; their regression check passes.

## Full categorization

| Category | Count | Disposition |
|---|---:|---|
| React/JSI umbrella module headers | 300 | Dependency module-map integration; upstream-compatible fix needed, not an instruction to delete headers. |
| SQLite integer precision conversions | 110 | Upstream C implementation; do not add blind casts or alter integer widths. |
| Empty object files | 38 | Platform/feature conditional compilation; not a demonstrated runtime defect. Keep. |
| Swift Sendable diagnostics | 38 | 37 inherited unchecked conformances plus one metatype diagnostic. Audit actor/ownership contracts; do not blanket-add unchecked Sendable. |
| JS runtime global declarations | 34 | Generated bundle, including runtime-provided globals. Do not delete APIs or add fake globals merely to silence. |
| Deprecation/documentation diagnostics | 30 | SDK/dependency migrations with compatibility checks. Includes legacy fallbacks that cannot simply be removed. |
| SVG possible missing super updateProps | 26 | Requires renderer inheritance analysis; blindly calling super can change rendering. |
| ObjC nullability/protocol definitions | 19 | Dependency public headers; module-cycle/type contract checks required. |
| Toolchain/other | 12 | Script dependency output warning, 3 SDK context warnings, Metal search path, eval lexical warning, widget stripping notice, 2 comma warnings, 2 unreachable-code warnings, property-synthesis warning. |
| Enum bitwise operations | 7 | Image-library API typing; preserve bitmap bit layout. |
| libwebp possible uninitialized locals | 5 | Read/assignment paths analyzed; no reachable uninitialized use demonstrated. Explicit initialization implemented after equivalent ARM assembly validation; not a demonstrated release-blocking defect. |
| C++ variable-length array extensions | 5 | SVG dependency; change to owned storage needs stack/performance/lifetime validation. |
| Deprecated Worklets conversion API | 2 | Behavior-preserving postinstall source patch implemented. |
| Screens enum exhaustiveness | 1 | Explicit None branch implemented, preserving assert and fallback. |
| **Total** | **627** | **16 source-level warning fixes; 611 retained diagnostics pending upstream/deeper validation.** |

Retained is not synonymous with impossible or harmless. There is no evidence supporting an immediate “all must be fixed before internal testing” claim, nor a safe basis to promise zero warnings. No warning suppression flags were added.

## Implemented narrowly scoped patches (16 summaries)

`patch-expo-modules-jsi-swift.mjs` now also patches:

1. `ExpoModulesCore/ios/Worklets/Core/DynamicSerializableType.swift:47` and `DynamicWorkletType.swift:31`.
   - Deprecated `JavaScriptValue.from(Any, runtime:)` delegates to `toJavaScriptValue` for representable values and returns undefined otherwise.
   - Replacement obtains runtime first, checks `JavaScriptRepresentable`, preserves undefined fallback, then calls `representing(value:in:)`.
   - A bare rename would not compile for generic `ValueType`, and moving runtime lookup after the guard would change error behavior. Both were avoided.
2. `react-native-screens/ios/conversion/RNSConversions-Tabs.mm:329`.
   - Adds `case RNSTabsScreenSystemItemNone: break;`.
   - Existing initial assertion and final return are unchanged. All four current callers exclude None first. The ineffective later `RCTAssert(true, …)` is not silently changed as part of warning cleanup.

The patch survives dependency reinstall through the existing postinstall mechanism. Dependency versions are unchanged. Podfile.lock includes the intentional Podfile checksum update.

## Higher-risk warning analysis

libwebp 1.6.0:
- `dec_neon.c:1467,1556`: sum_top/sum_left are assigned and used under matching do_top/do_left branches; combined read requires both.
- `backward_references_enc.c:723`: do_compute starts true; the only transition to false follows best_offset assignment. The true path also assigns it.
- Therefore adding zero initializers is optional compiler-clarity cleanup, not a demonstrated bug repair. External source was checked against build log excerpts and matching installed 1.6.0 sources.
- References: https://raw.githubusercontent.com/webmproject/libwebp/v1.6.0/src/dsp/dec_neon.c and https://raw.githubusercontent.com/webmproject/libwebp/v1.6.0/src/enc/backward_references_enc.c

Screens 4.26.2:
- keyWindow orientation fallback and legacy statusBarFrame fallback need scene/device checks, not indiscriminate removal.
- Twenty empty-object warnings reflect conditionally compiled objects, not missing functionality by themselves.

## Validation and limits

- `node scripts/check-ios-native-modules.mjs`: passed.
- `node scripts/check-ios-build66-warning-patches.mjs`: passed source assertions, clean-fixture reapplication and second-run idempotency.
- The same check compiled and ran a Swift behavior fixture with local Xcode 27.2: supported and unsupported conversion, runtime lookup count and throwing runtime behavior all passed.
- `git diff --check`: passed.
- A local unsigned generic iOS Release build completed with synthetic offline test configuration (details below). This is not a Cloud archive or TestFlight device regression. No new Cloud build was started and no reduced Cloud count is claimed. Next Cloud archive must verify the sixteen targeted summaries.

## Working state

Mac checkout `weatheron-character-integration`, branch `fix/ios-build66-warning-audit`, based on main `3233c8a`. The audit initially left changes uncommitted/unpushed and **not in main**. The user subsequently authorized committing and pushing these sixteen warning fixes on this branch. Main merge, Cloud rebuild and deployment remain outside this follow-up; no signing changes or build artifacts are included.


## Further cause-by-cause investigation

### Prebuilt module identity (300)
React prebuilt accounts for 294 summaries (Worklets265, Core29); JSI umbrella adds6. The React umbrella does import names such as RCTViewManager, but prebuilt `React_Core/React/…` physical paths and Pods source symlink paths can have different module identities. Adding identical includes is not a demonstrated fix. RN0.86's own issue documents the packaging problem: https://github.com/react/react-native/issues/57774 . A supported RN source-build comparison is a candidate, not a safe one-line warning patch; it changes the build dependency layout and time. No tested drop-in RN version resolving this Expo57 integration was established.

### Concurrency (38)
Inherited unchecked restatement37 splits into exception20, module14, SQLite handles3. The bases retain mutable exception metadata, module state, database pointers/closed/finalized flags. These are not safely resolved by a blanket unchecked annotation. A lock/actor/lifetime audit remains necessary before claiming concurrency safety. Metatype1 can potentially use `SendableMetatype` rather than unchecked, but that changes the public protocol's isolated-conformance contract; only a minimal fixture has passed, not full compatibility.

### ObjC headers (19)
Filesystem nullability8 (4 repeated in Core/Worklets), registry protocol definition2, RN nullability9. Expo issue https://github.com/expo/expo/issues/52713 reports the corresponding problem even on Expo58/RN0.88, so a major update is not a proven solution. A filesystem header nonnull annotation candidate matches the unique FileSystemManager implementation and guarded MediaHandler caller; Clang/Swift importer fixture passes. It is now implemented (8 diagnostics), with source/idempotency and Clang/Swift fixture checks; full module build verification is recorded below. Private conformance-header restructuring for the registry must be native-module-tested, not blindly adding a React import that may create cycles.

### SQLite arithmetic/control flow (114 + Sendable separately)
Bundled amalgamation is SQLite3.50.3. The110 narrowing conversions are internal SQLite widths, not damaged customer IDs caused by the app. Each conversion's bound was not individually proven here; therefore they are not all declared harmless. Blind casts conceal rather than repair potential truncation. The two comma expressions deliberately sequence pRaise creation and pX assignment. Two unreachable warnings point at parser-generator local declarations immediately before switch cases, not unreachable app logic. Keep vendor source semantics; evaluate fixes with a supported expo-sqlite update and database migration/integrity tests. SQLite's own compiler-warning discussion emphasizes tested behavior over mechanical warning edits: https://sqlite.org/faq.html#q17 . No compatible fixed version was verified.

### Image libraries (SDWebImage/SVG)
SDWebImage5.21.7 matches its current official latest release. Its30 summaries comprise legacy UTI APIs13, bitmap enum operations4, empty objects13. Changing UTI fallback requires format and animated-image regression checks; no update-only fix is available from the inspected release list: https://github.com/SDWebImage/SDWebImage/releases .
SVG15.15.4 has26 possible-super,5 VLA,1 inherited-property diagnostic. Official15.16.1 still has these constructs; upgrading for warning removal alone is unsubstantiated. SVG inheritance handles custom prop structures, so inserting26 super calls risks rendering changes. VLA-to-owned-storage is feasible with text/gradient zero-count/allocation tests, not yet validated. References: https://raw.githubusercontent.com/software-mansion/react-native-svg/v15.16.1/apple/Shapes/RNSVGCircle.mm and https://raw.githubusercontent.com/software-mansion/react-native-svg/v15.16.1/apple/Text/RNSVGTSpan.mm .

### Runtime and security API warnings
The34 JS global warnings concern names supplied by RN/Hermes or web-specific dependency paths. RN documents its JS environment: https://reactnative.dev/docs/javascript-environment . Individual feature-path availability still needs runtime tests; declaring fake globals is not a repair. The eval diagnostic comes from Expo's `src/async-require/fetchThenEvalJs.ts:26` split-bundle loader, not custom app eval. Removing it would affect dynamic loading; lexical-scope use was not demonstrated by this warning.
SecureStore's deprecated ALWAYS constants are exported compatibility branches. Current app callers in accountAuth.ts:390 and appIntegrity.ts:175 explicitly use AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY, so the warning is not evidence that this app selected ALWAYS. Authentication prompt migration still requires biometrics/keychain backward-compatibility tests. Scene-specific keyWindow/statusBarFrame fallbacks likewise require multiscene/device checks.

### libwebp5 now implemented and tested
Added `scripts/patch-libwebp-build66.rb`, called from Podfile after installation. Two NEON functions' sum_top/sum_left are explicitly zero-initialized, and encoder best_offset is initialized0. Existing control flow is unchanged. The helper checks expected occurrence counts, is idempotent and restores original file permission bits.
`bash scripts/check-libwebp-build66.sh <Pods>` reproduces original5 warnings and patched0 with actual Apple Clang arm64 iOS16.4 at both -O2 and -Os, including -Werror for patched source. Assembly is byte-identical for both files and both optimization levels. Official libwebp main still contains the uninitialized declarations, so updating alone is not a proven fix.

### What remains unproven
This classification does not establish that every retained warning is harmless, nor that every theoretical fix is impossible. Full source-bound proofs for110 SQLite conversions, whole-hierarchy concurrency correctness, SVG visual regression and module build-mode migration are not completed. No release blocker was established solely by the currently examined diagnostics. Scope these as separate validated dependency work rather than trading a lower warning count for behavior changes.


## Validation follow-up

The first local Xcode27.2 generic iOS Release build compiled the affected native dependency sources, and its XCResult contains none of the eight targeted Worklets/Screens/libwebp warnings. It then failed at the project's JS bundling preflight because local production weather service environment was not configured. This was a correctly enforced guard, not a native compilation error; it was not disabled.

A subsequent local-only build uses explicitly synthetic `example.invalid` service values to test compilation/bundling without live credentials. It is unsigned, not deployed or run, and **not a usable production/TestFlight artifact**. Cloud27.1 warning counts remain a separate validation requirement.

Pod installation used local CocoaPods1.17.0/Ruby2.6 and printed `filter_map` availability notices when inspecting optional precompiled-module configs. Current project explicitly disables Expo precompiled modules and native autolinking verification passed. This local environment difference must not be conflated with Cloud parity.


### Local build outcome

- Final local-only command: Xcode27.2 generic iOS Release, CODE_SIGNING_ALLOWED=NO, no install/upload/deploy, synthetic reserved-domain service configuration.
- **BUILD SUCCEEDED**, XCResult errorCount0. Native sources and JS bundling/linking completed.
- Incremental XCResult has449 warning summaries. This is NOT a comparable clean Cloud623/627 count and is not advertised as a178-warning reduction.
- The Worklets deprecated call, Screens None case, libwebp five variable warnings and EXFileSystemInterface nullability diagnostics are absent in the applicable local compilation results. The latter header was recompiled after the annotation change.
- Source/idempotency/Swift conversion tests and libwebp arm64 O2/Os assembly-equivalence tests all passed.
- Installed native integration test passed before cleanup of CocoaPods-generated metadata. CocoaPods-only project reformatting and environment-specific Hermes spec checksum churn were not retained; the intentional Podfile checksum change is retained. Re-run pod install for subsequent local validation; no dependency version was changed.
- Compiler results: /tmp/weatheron-warnings-20261114/local-build3.xcresult, build log local-build3.log; not committed or distributed.
- The local unsigned test artifact has synthetic configuration and must never be used for deployment.

## Final necessity / feasibility decision

1. **Implemented and locally validated:**16 diagnostic instances with narrowly scoped source changes, no warning suppression.
2. **Feasible but needs separate compatibility/behavior work:** module packaging/source-build transition; Sendable executor/ownership contracts; SQLite bound-by-bound review; SVG storage/rendering; SDK fallback migrations. Versions with proven drop-in fixes for this Expo57/RN0.86 app were not established. Do not blanket call these impossible or safe.
3. **Keep unless other evidence changes:** empty object38, signed-widget stripping, intentional Hermes configuration script behavior, vendor parser declarations/comma sequences. They are not established app defects.
4. **Further evidence required:** real-device behavior, full clean Cloud archive count, concurrency safety of inherited unchecked types, numeric bounds across all110 conversions. No claim that all611 retained instances have been individually proven harmless.
