# Ambient Surface motion — first implementation pass, 2026-11-03

## Existing plan and reviewed implementation

Existing UI specification (`WeatherON_UI_Design_Spec.md`, motion section) calls for RN Animated, immediate feedback, Reduce Motion and retained overlays through exit. Ambient foundation and Home return records require stable reading geometry and truthful weather/ETA data. Current iOS selection sheet already retains outgoing content, waits for native presentation, coalesces dismiss, guards interrupted close/reopen and confines drag capture to the handle. Time selection already positions the wheel on native layout and emits selection haptics only after owner-confirmed changes. These behaviors remain intact.

User-approved new first-pass recommendations extend those rules to a small reusable vocabulary. [Stageshow motion guidance](https://github.com/benjitaylor/skills/blob/main/stageshow/references/motion.md) informed local continuity, changed-part motion, retained context and immediate input. Its DOM/CSS kit, illustrative delays/loops/cursors and numerical demos were not installed into the native app. Product data is never staged for a story.

## Shared tokens and concrete rules

`apps/mobile/src/theme/ambientMotion.ts` is plain data; easing/driver belongs to each native component.

| Token | ms | Scope / rationale |
| --- | ---: | --- |
| result | 160 | New Home meaningful-value opacity; no translation, never blank, unchanged timestamps do not replay it |
| busyDelay | 250 | New threshold for a real pending indicator; never delays a result |
| busyPulse | 650 | Each opacity half-cycle while real sustained work is visible, foreground and power-eligible; stop otherwise |
| pressIn / pressOut | 80 / 140 | Existing FeedbackPressable timing retained; immediate user callback, native driver, no action delay |
| disclosureOpen / disclosureClose | 220 / 160 | New measured inline content track; no scaled text or hard 260pt cap |
| androidSheetOpen / androidSheetClose | 260 / 190 | Existing platform timing retained; now cancellation-safe and Reduce Motion aware |

Existing iOS selection-sheet timing (240/260), native drag behavior and navigation are intentionally not blindly unified. A platform's established gesture semantics matter more than replacing every duration with one number.

## Applied scope

- Home update state: same-request fresh ETA preservation, invalid new plan neutralization, independent displayed route/weather pending, stable status slots, original lookup basis, explicit retry. See `docs/audits/home-update-ux-2026-11-03/REPORT.md`.
- Home status pulse: motion is disabled off Home, in inactive/background state, low-power mode, Reduce Motion or unknown preference; text/busy semantics still work. No decorative idle loop.
- `AmbientDisclosure`: G2 notification-schedule details measure natural content height. Header remains outside the track. Retarget the same Animated height when interrupted or when text/width changes. Keep content mounted for measurement/reversal; closed descendants are removed from touches/accessibility. No scale transform, clipping cap, data fetch or timer. Height uses a bounded JS-driver animation, opacity native driver; native performance is still device QA.
- Android `LegacyBottomSheet`: retain outgoing content, stop obsolete animation and guard completion generations. Closing content cannot receive focus/touches. Unknown/enabled Reduce Motion immediately settles. Existing callback/navigation, scroll area, bottom clearance and iOS delegate remain unchanged.
- `FeedbackPressable`: keep existing subtle scale and immediate haptic/action behavior. Stop/settle when Reduce Motion changes, stop on unmount. Existing function/array/transform styles remain preserved.

## Acceptance criteria and evidence boundary

1. Input callbacks occur immediately, before animation completion. No request count, debounce, ETA computation, notification/Live Activity or stored user data policy changes.
2. Same object/container persists across state; no blank outgoing sheet and stale close callback cannot unmount a reopened sheet.
3. Disclosure natural height grows beyond 260pt and reacts to measurement changes; no text scaling or line cap. Closed content cannot be reached by screen reader or tap. Existing selected/expanded labels and confirmation-only haptics remain.
4. Reduce Motion/unknown policy immediately settle, with no residual partial press scale. No repeated live-region announcement for partial loading/timestamps.
5. No motion is perpetual when idle. Busy work stops when hidden/background/power restricted. All effects cancel on replacement/unmount. No new SDK, network, analytics or permissions.
6. Executed JS/native-boundary contracts and component-only RN-web/Chromium QA do not establish actual UIKit/Android rendering, VoiceOver/TalkBack focus, wheel behavior, frame rate, battery consumption or thermal performance. Those require the normal authorized real-device QA; none was performed here.

New `scripts/check-ambient-motion.mjs` executes actual disclosure/sheet/press modules with deterministic native boundaries. Existing `check-ios-selection-ui.mjs` continues to exercise the untouched iOS sheet's drag thresholds, rapid reopening, retained content and reduced-motion behavior. Home-specific tests cover real pending timing and request identity. See the audit for final command results.

## Remaining candidates, not implemented

- MaterialSnackbar: review reduced-motion and interruption behavior separately while preserving its swipe-to-dismiss/action semantics. It is outside this first pass.
- Rich numerical rolling or animated selection-track geometry: only if device QA shows a clear usability benefit; do not fabricate intermediate ETA numbers.
- Native screen navigation, iOS sheet springs/gestures, all outfit/wardrobe cards and Ambient weather canvas: preserve the working behavior; no blanket replacement.

One independently run older check, `node scripts/check-my-departure-interactions.cjs`, fails on main's unchanged MyScreen extraction because its VM omits useWindowDimensions. MyScreen and the check match main byte-for-byte; this is a pre-existing harness failure, not observed application failure. It was not repaired by changing unrelated product code. The scoped motion/type/aggregate checks are reported separately.
