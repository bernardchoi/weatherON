# Approved design correction, 2026-11-09

## Scope and source
- Target: main after `84c53561b0275c2fcfe8ebe9c3a8d61ed46acdbb` (TestFlight 64).
- Correction branch: `release/ios-design-only-20261109`.
- Approved prototype: weatheron-ambient-study-20261105.bchii.chatgpt.site, v20, source SHA `c31e17107d6227be1e8f53943f2eddeb1458108e`.
- Partial refinements only: home forecast cue, detail current-hour focus, outfit/wardrobe controls and boundaries, departure empty/search spacing, MY/account hierarchy and provider mark.
- Native UIGlassEffect is reused for back/filter controls; no claim of prototype scripted sheen or interactive shape deformation.
- Character integration commit `4c1b37b` and its assets/motion remain explicitly excluded. No production release or external TestFlight group authorized.

## Verification
- TypeScript and approved-design regression checks pass; diff whitespace clean.
- Native Debug simulator build succeeded with Xcode 27.2 / iOS 27.0, dedicated iPhone 17 simulator.
- Actual light UI: Home, WeatherDetail, Outfit, Wardrobe, preset add, empty Departure. Navigation/scroll/local wardrobe add exercised.
- Actual dark and accessibility-medium text: Home, destination search, guest MY, AccountConnect failure state. This is not an exhaustive theme/state cross-product.
- Native QA exposed unboxed Section corner clipping of first title glyph; radius/overflow corrected and recaptured. Redundant iOS filter outline removed.
- Generated CocoaPods project/lock changes and QA artifacts excluded.

## Remaining validation
- iOS 26 and physical device not exercised; distribution candidate requires device QA.
- Authenticated account/provider variants, search-result selection and Reduce Transparency not runtime verified.
- Unsigned simulator emits notification registration keychain error; no notification delivery validation claimed.
- Local provider-list request fails on AccountConnect; error UI observed, not successful authentication.
- Cloud source SHA, build number and internal Team(Expo) readiness must be verified separately after this commit is pushed.
