# WeatherON Product Design UI/UX Audit

Date: 2026-07-04
Device: Android real device `000841458003652`
Scope: Home, Departure list, Destination care, MY

## Evidence

| Step | Screen | Screenshot |
|---:|---|---|
| 1 | Destination care | `01-destination-care.png` |
| 2 | Home | `02-home.png` |
| 3 | Departure list | `03-departure.png` |
| 4 | MY | `04-my.png` |

## Step Health

| Step | Health | Notes |
|---:|---|---|
| 1 | Needs cleanup | Destination care flow works, but nested cards, repeated accent color, and destructive CTA weight still make the screen feel busy. |
| 2 | Mostly good | Home structure now matches current weather on top and destination information below. Notification badge and destination selector density still need tuning. |
| 3 | Needs cleanup | Destination cards are simpler than before, but the top summary module reads like disabled controls and delete actions are too visible. |
| 4 | Good with copy fixes | MY is the cleanest screen. Action/status chip distinction and duplicated copy need correction. |

## Strengths

- Home has a clear top-to-bottom hierarchy: current weather, destination selector, then destination summary cards.
- Destination care no longer uses four transport buttons; dropdown behavior is simpler and easier to scan.
- G2 arrival time input uses hour/minute scroll wheels, avoiding keypad friction.
- MY screen uses predictable list rows and has the best scan rhythm across captured screens.
- Light mode color tokens are mostly consistent: warm accent for primary departure-related emphasis, clear for normal states, sky for weather/info.

## UX Risks

1. Home notification badge looks like a blocking error.
   Evidence: `02-home.png`. The red badge with border pulls attention away from the main weather decision. Unread notifications should feel informational, not urgent-error level.

2. Home destination selector still competes with summary cards.
   Evidence: `02-home.png`. The selector card, horizontal chips, and 3 summary cards are all card-like. This creates a stacked-card rhythm and makes the lower summary feel less immediate.

3. Departure top module reads as disabled controls.
   Evidence: `03-departure.png`. `날씨 비교`, `출발 08:46`, `비 그침` appear like a segmented control, but two items are grey disabled-looking blocks and the center item is plain text.

4. Departure card delete actions are too prominent.
   Evidence: `03-departure.png`. Each destination exposes `삭제` on the main list. This increases destructive-action noise in a screen meant for quick selection.

5. Destination care has too many nested frames.
   Evidence: `01-destination-care.png`. The top card contains three mini cards, the time picker card, and another settings card. The screen works, but it still feels heavier than the decision requires.

6. Destination care destructive CTA looks like a primary CTA.
   Evidence: `01-destination-care.png`. `목적지 케어 끄기` uses strong warm/orange fill and is placed above the tab bar, so it visually competes with the main flow.

7. MY status/action chips are visually similar.
   Evidence: `04-my.png`. `정상`, `허용됨`, `관리`, `보기` use similar pill treatment, so state and action roles are not distinct enough.

8. MY copy has duplicated words.
   Evidence: `04-my.png`. `위치 위치 허용됨 · 알림 알림 허용됨` should be corrected.

## Accessibility Risks

1. Some visual icons have no semantic labels in the UI tree.
   Screenshot-only limit: decorative icons can be silent, but meaningful status icons should be included in the row label.

2. Destination care scroll wheels need focused state verification.
   Evidence: `01-destination-care.png`. The selected values are visually clear, but screen reader focus order and scroll adjustment behavior need separate assistive-tech testing.

3. Color alone carries selected/emphasis state in multiple places.
   Evidence: `02-home.png`, `03-departure.png`, `01-destination-care.png`. Selected destination, active tab, and warning/summary emphasis should retain shape/text/state cues independent of color.

4. Low-priority destructive actions are too close to high-frequency navigation.
   Evidence: `01-destination-care.png`, `03-departure.png`. The care-off CTA and list delete buttons should have more separation or confirmation to reduce accidental activation.

## Recommended Fix Order

1. Fix MY duplicated copy and separate state chips from action chips.
2. Rework Departure top summary into a plain 3-metric strip or a real segmented control.
3. Move Departure card delete into an overflow action or secondary detail area.
4. Reduce Destination care nested card borders: keep one main panel, then use rows/dividers for summary and settings.
5. Restyle `목적지 케어 끄기` as a secondary/destructive text or outline action, not a primary filled CTA.
6. Reduce Home destination selector visual weight: make it a compact selector row with chips, then keep the 3 summary cards as the main lower content.
7. Change Home unread badge from error-red treatment to informational treatment unless the notification is truly blocking.

## Implementation Pass

Date: 2026-07-04

- Completed 1: MY readiness copy no longer repeats `위치` and `알림`; action chips now use outline styling while status chips keep tone fills.
- Completed 2: Departure top summary changed from disabled-looking segments to a compact 3-metric strip.
- Completed 3: Destination delete action removed from list cards; deletion remains in destination detail.
- Completed 4: Destination care inner summary/settings surfaces are flatter, with fewer nested borders.
- Completed 5: `목적지 케어 끄기` changed from filled primary CTA to secondary destructive outline.
- Completed 6: Home destination selector is more compact; lower 3 summary cards retain the main decision role.
- Completed 7: Home unread notification badge now uses info tone instead of blocking error tone.

## Evidence Limits

- This audit used real-device screenshots and UI tree dumps only.
- Gesture depth, TalkBack behavior, dynamic type, reduced motion, and full offline/error states were not fully re-tested in this pass.
- Findings are UX/design risks, not a full WCAG compliance claim.
