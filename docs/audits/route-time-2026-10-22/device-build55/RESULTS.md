# Physical-device selected-time QA — build identity corrected

Observed through iPhone Mirroring on the user's connected iPhone, 2026-10-22 23:58–2026-10-23 00:02 KST. Initially attributed to TestFlight 55 based on user confirmation. Subsequent successful devicectl inspection on 2026-10-23 00:04 KST reported installed bundle version 54 (1.0.0). These observations therefore verify build 54 with the updated production API, NOT build 55. No local binary was installed. The directory name is retained only to preserve evidence links.

## Results

Initial configuration: GPS current location (Samsong-dong 289), Hyundai Sun & Vill destination, public transit, 18:00 departure, weekday repeat enabled, care enabled. Initial estimate: 18 minutes, arrival 18:18.

- Changed departure to 17:00: arrival changed to 17:18.
- Switched to arrival target 17:00: recommended departure 16:22 (18-minute travel + 20-minute buffer).
- Changed arrival target to 18:00: recommended departure 17:22.

Temporarily selected the existing saved origin GP Club (Wonhyo-ro 152) to exercise a longer domestic route. Target journey date shown in the destination list: 2026-10-23. This origin differs from the earlier API sample at Wonhyo-ro 154; the 47-minute result must not be represented as an exact-coordinate comparison with the earlier 57-minute sample.

| Selected basis/time | Travel | Displayed result | Evidence |
| --- | --- | --- | --- |
| Arrival 18:00 | 48 min | Depart 16:52, buffer 20 min | arrival-1800.png |
| Arrival 19:00 | 47 min | Depart 17:53, buffer 20 min | arrival-1900.png |
| Departure 19:00 | 49 min | Arrive 19:49 | departure-1900.png |
| Departure 18:00 | 47 min | Arrive 18:47 | departure-1800.png |

PASS: selecting both basis and time updates final duration and calculated labels; arrival arithmetic includes the displayed buffer. Observed a pending/no-estimate state during origin and basis changes before results arrived. Destination list reflected 18:00/18:47, and returning to detail retained the same values (list-departure-1800.png).

Restored original GPS current-location mode and 18:00 departure. Destination list again showed 18-minute travel implied by arrival 18:18. Repeat days, care, and saved places were preserved. No application code changed during this QA.

## Limits

This is physical UI verification of successful selected-time calculations, not proof of actual boarding/arrival accuracy, identical Kakao routes, or complete release QA. No offline/API-failure injection, cold-start persistence test, or real journey performed. No network capture of the TestFlight app's requests. Google Matrix does not expose boarding timestamps; the 20-minute arrival buffer does not itself prove that a particular earlier service can be boarded.
