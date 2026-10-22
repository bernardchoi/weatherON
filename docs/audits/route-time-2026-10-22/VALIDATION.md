# Selected-time transit verification — 2026-10-22

Actual local API keys were used without recording credentials. Coordinates resolved through Kakao place search: screenshot origin Wonhyo-ro 3-ga 51-7 (road address 154); destination Hyundai Sun & Vill, Samsong-ro 210. The WeatherON screenshot instead shows Wonhyo-ro 152-1, so this is a near-origin comparison, not proof of identical saved coordinates.

Google Distance Matrix transit, 2026-10-22 Asia/Seoul:
- 17:00 departure: 2772 sec, app rounds to 47 min, 17.846 km.
- 18:00 departure: 3404 sec, app rounds to 57 min, 19.947 km.
- 19:00 departure: 2892 sec, app rounds to 49 min, 17.846 km.
- Screenshot Kakao: 18:00–19:02, displayed 61 min; different provider/route. Google Matrix does not expose exact boarding/arrival timestamps or steps; arithmetic ETA is not verified timetable arrival.

Kakao affiliate timed transit returned HTTP 403 permission denied. Google legacy Directions returned REQUEST_DENIED (API not enabled). Existing enabled Google Distance Matrix supports this domestic time-specific request.

Production Worker version: 6644552f-74b4-4057-b62b-8439ec42f66d
Production /routes/estimate verified HTTP 200, google-transit, ready:
- 18:00 departure: 57 min.
- 19:02 arrival target: 47 min.

Checks: selected-time mock regression, proxy/cache regression, request-log privacy regression passed.
Deployment changes server only; local mobile UI changes are not distributed as a new TestFlight build.
Physical iPhone 16 Pro Max listed as paired; devicectl launch failed with connection reset. Mirroring was connected but usable full-size app flow not verified. No physical-device acceptance PASS.
