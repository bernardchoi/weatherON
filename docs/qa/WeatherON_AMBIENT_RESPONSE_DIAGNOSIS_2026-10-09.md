# Ambient Surface reaction diagnosis — iOS, read-only

The user's current feedback is an experience assessment, not authorization to add large effects. Existing installed bundle is preserved. No app-code effect changes, build/install/relaunch, new library, new haptic, OS setting change, Android work, commit/push or Library workaround occurred. Only documentation, local diagnostic harnesses and read-only physical captures were added.

## Conclusion

The user has a concrete basis for saying the intended reaction is almost absent. A real dark Home temporal sequence shows a changing field, but changes are extremely small. Touch implementation has only a short start pulse, not a down/move/hold/up/cancel relationship. Static visual polish and four usability checks do not establish the Ambient Surface experience.

## Original intent versus current implementation

The Yokohama Tower of Winds source calls for invisible environmental input to become perceptible surface light/density/rhythm, and for static objects to acquire context states. The WeatherON direction brief takes priority: actual weather evidence → existing preparation logic → the same evidence drives density/flow/light. It prohibits invented wind bearing, unrelated urgency driving wind, text contrast changing with weather, meaningless pattern decoration, and motion in background/low power/Reduce Motion. It limits the first viewport to one environmental animation and places an environmental area beside/below the hero rather than pattern behind reading text.

References: `docs/Project Wind/yokohama_tower_of_winds_ui_design_system.md`; `perfora_air_v1_1_experimental_addon/docs/01_experimental_direction_brief.md`. Final icon README explicitly says the assets are static and do not implement weather/touch reactions. The final core PNGs are still images and do not prescribe exact touch durations, travel distances or tactile perception thresholds. Values proposed below are evaluation candidates, not designer-approved specifications.

| Axis | Implemented | Gap / interpretation |
| --- | --- | --- |
| Actual weather input | Home passes current condition, windMs, precipitationMm and reliable/loading gating from existing data. Weather icon/current text use actual weather. | Ambient base/glow colors largely depend on theme, not an expressive weather state; clear/cloud differ mainly by semantic icon and rain adds strips. No meaningfully proven weather-change experience. |
| Wind | Wind0..12 controls a shared breath speed, opacity and uniform scale; unreliable/zero/invalid input removes that field. No invented wind bearing. | No density transport or visible field flow. Whole-screen zoom/brightness is extraordinarily quiet in the actual observed dark state. |
| Rain | Current rain/storm plus current precipitation controls8..24 strips; future probability does not paint current rain. | Strip positions stay fixed and share breath opacity; no observed physical rain-state/time comparison. Do not call this validated rainfall experience. |
| Touch | Root observes down once, measures actual origin, places a240pt radial white highlight.100ms attack then700ms automatic decay. | No move, held contact, release or cancel state; no velocity/strength feedback. Finger can remain down after effect has disappeared. Light highlight on a pale reading surface has little luminance separation. |
| Controls/dock | Existing FeedbackPressable scales to0.985 over80ms, restores over140ms. UIKit dock has interactive glass and selection drag/release/cancel. | This is control feedback, not proof of an environmental finger relationship. Root Home surface does not include the sibling dock. No new haptic is needed or added. |
| Accessibility/lifecycle | Actual hooks cancel breath/touch for background and Reduce Motion; Reduce Transparency removes field/highlight. Null/error Reduce Motion resolves conservatively. | Low-power gating is absent. Old touch can replay on foreground or after motion/transparency is restored. Reduced modes remove environmental feedback rather than offering a separately defined static touch state. |

## Actual time-changing render evidence

The device was already displaying dark Home, confirmed by original `evidence/ios-ambient-reaction-observation-initial.png`. We did not select dark or navigate it. Screen recording capability returned CoreDeviceError1001 unsupported, so no video was produced. No alternative device permission or recording bypass was attempted.

Five original physical PNGs `evidence/ios-ambient-dark-time-0.png` through `-4.png` were captured at UTC13:51:01/14/28/40/52, spanning51s, with no injected touch/weather/setting changes. Initial/final pixels were visually checked: Home remained visible with the same layout and weather labels. Capture cadence is sparse, not a video or frame-rate/latency measurement. Actual wind speed and reduced-setting values were not freshly exported; an older light-state0.89m/s diagnostic must not be presented as this dark state's live value.

Unchanged-background ROIs exclude status bar, text, moon icon, garments and dock. Metrics use the arithmetic mean of RGB8 channels (not physical luminance or a validated perception threshold):

| Region | Mean per-pixel temporal span /255 | Largest sampled pixel span /255 | Interpretation |
| --- | ---: | ---: | --- |
| Upper atmosphere | 0.443 | 1.333 | Very small actual change |
| Visible contour | 0.770 | 3.000 | Field changes; its mean difference is less than one8-bit RGB step |
| Lower clear margin | 0.016 | 1.333 | Almost stationary in this sampled region |

The alternating contour means50.041→50.807→50.041→50.761→50.088 are consistent with the breath implementation. Samples establish that some rendered field pixels change; they do not by themselves prove exact input causality or subjective noticeability. Combined with the user's experience feedback, they support weak temporal differentiation rather than declaring an experience pass. Evidence: `ios-ambient-temporal-metrics.json`, `analyze-ambient-temporal.mjs`. Original frames are actual app captures; no synthetic temporal mockup is substituted.

## Specific code causes

1. Breath round-trip period is `2*(14000-650*windMs)`ms:28s near zero wind,12.4s at12m/s. The existing earlier0.89m/s example would yield26.843s, scale1→1.001187; this is illustrative, not the current dark state's measured wind. At758pt height the edge displacement is roughly0.45pt in that example. Dark field opacity changes only about0.063 and is then multiplied by faint gradient-stop alpha and native texture opacity0.03. Most pixels barely move or change color.
2. The native density bitmap is generated once per theme/size, with a stable random origin during a view lifetime. Only its enclosing opacity/scale breathes. Nonrepeating grain solves static texture, not temporal transport or gesture response.
3. `HomeScreen.onTouchStart` is the only environmental touch handler. After an asynchronous origin measurement it increments touchPulse and writes one position. There is no touchMove/end/cancel handler or phase/id, so the surface cannot follow a fingertip or know when it leaves.
4. `AmbientSurfaceBackground` immediately schedules both attack and release. Effect lifetime is independent of contact lifetime. Max opacity is0.10light/0.04dark with white center; white over an already pale light background has minimal separation. Strength is constant, not linked to duration or movement. No native touch-time rendering was obtained, so pulse visibility/latency remains unverified.
5. `active`/reducedMotion/reducedTransparency are effect dependencies, while touchPulse remains nonzero after prior contact. Returning to active or restoring motion can replay the old pulse at an old position. A read-only harness executing the actual component/hooks with mocked native animation boundaries confirms sequences1 initially,2 after background→active,3 after Reduce Motion on→off, with no new touch. Evidence `ambient-touch-replay-result.json`. This is confirmed component behavior, not a physical replay capture.
6. Parent touch observation does not currently capture a responder, so there is no source proof it blocks ScrollView. But it lights on intended button/scroll starts and never cancels when a drag becomes scrolling, creating visual ambiguity. Future handling must not seize ScrollView or duplicate the native dock's gestures. Native dock's actual deformation/drag feel remains separate from previously passed tab navigation.
7. No low-power check/notification was found in the ambient path. Background cancellation exists; foreground currently resets breath to its starting phase and can replay stale touch. No new timer or pressure sensor should be added just to make it look alive.

## Small, reviewable behavior proposal — not implemented

Keep one existing environmental field and the current text/action hierarchy. First establish a recognizable contact lifecycle; do not add particles, a second large glow, global haptics or new libraries.

| Event | Proposed response |
| --- | --- |
| Blank environmental-area down | Begin a fresh contact/id at the actual measured finger position. Ramp local density/light to a clearly distinguishable pressed state in roughly80–120ms. These are comparison candidates, not approved timing. |
| Hold | Maintain that localized state until contact ends. Pause/suppress ambient breath there so two animations do not compete. No force/pressure value is invented. |
| Move | Follow the latest local coordinate with bounded native transform updates. No wind direction implication; no whole-screen text/cell displacement. |
| Scroll recognized, multitouch, cancel, background or unmount | Cancel contact promptly, clear the contact/id/position, and let existing scroll/tab behavior own the gesture. No root responder capture. |
| Up | Decay smoothly to the current weather baseline over a short candidate300–500ms. A later foreground/motion-setting change cannot replay the contact. |
| Reduced motion/transparency | Keep readable weather/selection unchanged. Use a bounded static pressed density/border state where appropriate; no moving white halo. Background/low power stop autonomous field motion. |

Then tune the **same field's** wind response in an empty hero/section environment region: bounded symmetric deformation/density variation with speed derived only from actual wind; do not fabricate bearing or turn every card into glass. Candidate wind period12–20s and stronger localized contrast can be compared against the observed0.77/255 contour span, but require actual light/dark time sequences and user noticeability checks before choosing values. Maintain fixed text contrast and reading-plane geometry. Static upper-color mismatch is a separate residual, not the priority remedy for absent reaction.

Validation for a small prototype, if later authorized: same live weather light/dark; no-touch temporal sequence; down/hold/move/up/cancel sequence; scrolling and dock gestures untouched; foreground without ghost touch; reduced settings/low power; native performance. Our tool environment currently cannot inject normal physical gestures and the device cannot provide this recording capability. Existing usability confirmation does not substitute for these reaction tasks. No reaction-experience completion is claimed.
