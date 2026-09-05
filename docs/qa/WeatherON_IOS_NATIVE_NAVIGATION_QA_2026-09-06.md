# iOS native navigation corrections — 2026-09-06

## Requested fixes

1. Rounded capsule selection and native Liquid Glass press response.
2. MY → Account → back must preserve MY selection, without a Home-to-MY indicator animation.
3. Native iOS interactive back navigation.

## Implementation

- Native UIKit `UIGlassEffect.isInteractive = true` and `.capsule()` corner configuration. Glass receives real touches; a separate container owns positional movement so effect deformation cannot corrupt drag geometry.
- A single BottomNav instance covers main/account/policy/style routes. First layout positions selection directly. Account/policy routes resolve to MY.
- Expo-compatible react-native-screens 4.26.2, native `ScreenStack`/`ScreenStackItem` with default system transitions and gestures. Existing return routing is shared between explicit back and native dismissal. Android retains ScreenTransition.
- Reference: [Apple interactive glass](https://developer.apple.com/documentation/uikit/uiglasseffect/isinteractive), [native stack guide](https://github.com/software-mansion/react-native-screens/blob/main/guides/GUIDE_FOR_LIBRARY_AUTHORS.md).

## Static/build validation

- `npm exec --workspace @weatheron/mobile tsc -- --noEmit` passed.
- `node scripts/check-native-navigation.mjs` passed: stack push/pop/cancel, dynamic return targets, account/permission cleanup, one persistent BottomNav.
- `node scripts/check-ios-tab-drag.mjs` passed for fallback drag and reduced motion.
- Physical Debug build succeeded: `/tmp/weatheron-native-navigation-release-gesture-build.log`.
- User-supplied 18.127-second video inspected via local AVFoundation frame extraction; source file unchanged.

## Physical validation

- iPhone 16 Pro Max / iOS 27: rounded capsule, native tab taps, MY → Account push and button-back observed. MY selection remained in place during account navigation.
- Native default push/pop showed the underlying MY screen during transition. Automated Mirroring drags did not validate native content-pop gestures; user explicitly confirmed a real finger swipe returned Account → MY.
- Interactive UIKit glass receives touches with native interactivity enabled. Final drag implementation isolates positional geometry from glass deformation and consumes ending translation even when no intermediate changed event arrives.
- Final installation succeeded (`/tmp/weatheron-native-navigation-final-install.json`) and strict codesign passed. Final automatic launch was rejected because the phone was locked (`/tmp/weatheron-native-navigation-final-launch.json`); earlier native-stack iteration was launched and visually checked. User asked to open the final app and confirm press/drag behavior.
- Quantitative FPS, physical Reduce Motion setting, and direct-finger press-deformation quality have not been measured. Do not equate automatic native effect configuration with a recorded press-animation measurement.

Local Debug only; no TestFlight upload. No account/security/settings mutations authorized or performed.
