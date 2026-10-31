# Live Activity automatic-end investigation — 2026-10-23 KST

## Reproduced on TestFlight 55
- Physical iPhone 16 Pro Max, via iPhone Mirroring; the previous turn independently verified installed version 55.
- UI showed `종료 연결 재시도 중`.
- Production Worker tail showed route estimate requests but no departure registration requests during multiple time changes.
- Device Console: `ContentSourceResolver(requester: com.weatheron.mobile, permissions: Permissions(apsEnvironmentName: nil...))` and `Push token is not available; waiting for next update`.
- App Store Connect build 55 metadata lists only application identifier, team identifier, beta-reports-active, and get-task-allow. APNs, App Groups, App Attest, Apple Sign In, and widget WeatherKit are missing. Evidence: build55-metadata.png and device-push-diagnostic.txt.

## Root cause and fix
`ci_pre_xcodebuild.sh` injected `CODE_SIGNING_ALLOWED = NO` into both app and widget archive configurations. The exported distribution app lost the requested capabilities. Removed that mutation; added a post-archive gate that reads the signed app and extension entitlements and rejects missing required capabilities.

Commit: c7255d0158f910eccf1819930f892eb5615e70f8, pushed to main.
Xcode Cloud build 56: 3fe953e9-86ed-4ca5-898b-14f8f8bf344c.

## Validation so far
- Shell syntax passed.
- Post-archive gate exercised with valid plist fixtures and a missing-APNs fixture: accepts valid, rejects missing.
- check-departure-push.mjs passed validation, authentication, JWT, end payload, retries, token rotation, iOS bridge and environment isolation checks.
- check-ios-live-activity.mjs passed.
- Temporary device departure 00:25 then 00:30 restored to 18:00 before build wait. Transit, current location, weekday repeat and care ON preserved.
- Corrected TestFlight candidate installed; physical results below.

## Build 56 release evidence
- Xcode Cloud Archive and all exports succeeded. Post-archive gate verified both app and widget signed entitlements.
- Apple processed build 56; added to existing internal Team (Expo) group.
- App Store Connect distribution metadata now includes APNs production, App Group, App Attest production, Apple Sign In, and widget WeatherKit.
- Mac/iPhone authentication restored by user. TestFlight update installed at 00:53 KST; devicectl independently reports bundle version 56.
- Source signing evidence and physical results are recorded separately below.

## Physical build 56 verification
- 00:55 departure: UI recovered to `00:55까지 표시 중`; before expiry expanded Dynamic Island showed the destination, departure 00:55 and 19 seconds remaining.
- After 00:55, without reopening WeatherON, expanded Live Activity disappeared. Long-pressing the island did not reopen it. Evidence: device56-before-departure.png and device56-after-departure.png.
- Second departure 01:00 registered at 00:56; UI `01:00까지 표시 중`, then Home with 3:44 remaining. At 01:00:05 (first observation after expiry) it had disappeared without any app reopen. Long-press confirmed no remaining activity. Evidence: device56-second-before.png and device56-second-after.png. Background duration approximately 3 minutes 44 seconds.
- Changing many picker values quickly briefly showed retry; it recovered on its own before backgrounding. Near-term retries recovered; see remaining scheduled-case issue below.
- Worker log observation unavailable in this phase: Wrangler OAuth token expired and refresh failed. No APNs response code claimed from this run.

- Original departure 18:00 restored after both expiry checks; transit, care ON and weekday repeat preserved.
- Limits: iPhone Mirroring verified the physical Dynamic Island; the physical lock-screen surface and offline behavior were not separately tested. Server APNs response unavailable due to expired log credentials.

## Remaining scheduled-case issue
- Restoring 18:00 at 01:00 left `종료 연결 재시도 중` visible through 01:03, including an app foreground refresh. Do not classify the entire retry issue as resolved.
- Immediate-start activities ended correctly twice. A far-future scheduled activity has a distinct pending lifecycle; whether its push token is available and whether server registration is failing remains unconfirmed.
- Evidence: device56-restored-pending.png. Original 18:00 setting preserved.
- Wrangler refresh failed. Read-only account/user/tail OAuth reauthentication opened in IAB; user login requested. No new credential saved or permission grant performed by agent.

## User-requested closeout — build 56 retained
- User requested stopping build 57 and further verification.
- Xcode Cloud build 57 cancellation confirmed in UI; Cancel Build changed to Rebuild. No build 57 TestFlight distribution or installation performed.
- Build 56 remains the delivered/device version. Pending-token wording change 909a073 remains on main, unreleased.
- Worker tail and Console streaming stopped.
- Temporary departure restoration to 18:00 could not be confirmed: iPhone Mirroring disconnected because the phone was in use. No further authentication or device manipulation requested.
- Evidence: build57-cancelled.png.
