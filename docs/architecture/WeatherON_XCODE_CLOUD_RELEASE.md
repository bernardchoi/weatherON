# WeatherON Xcode Cloud iOS release

WeatherON iOS TestFlight and App Store binaries are built with Xcode Cloud. Android builds continue to use EAS.

## Build rules

1. 빠른 개발·실기기 디버깅: 로컬 Xcode 27
2. 자동 빌드·테스트: Xcode Cloud
3. 배포 후보 실기기 QA: Xcode Cloud → TestFlight → 실제 iPhone
4. 최종 App Store 바이너리: Xcode Cloud
5. Android: EAS Build 유지

iOS 바이너리는 EAS Build로 만들거나 제출하지 않는다. Xcode Cloud는 원격 Git
브랜치를 복제하므로 배포 대상 변경은 검증 후 커밋·푸시되어 있어야 한다. 로컬
Xcode 설치 버전과 Cloud 실행 버전은 별개이며, Workflow 환경에서 Xcode 27 정식
버전을 선택한다.

## Project

- Repository: `bernardchoi/weatherON`
- Workspace: `apps/mobile/ios/WeatherON.xcworkspace`
- Scheme: `WeatherON`
- Branch: `main`
- Archive configuration: `Release`
- App version: `1.0.0`
- Current source build number: `41`
- Next distributed build number: App Store Connect의 최신 번호보다 큰 값

The shared scheme and CocoaPods lockfile are committed. Xcode Cloud runs
`apps/mobile/ios/ci_scripts/ci_post_clone.sh` after checkout to install the
React Native workspace dependencies and CocoaPods.

## Workflow environment

Configure these variables in the Xcode Cloud workflow:

| Variable | Value | Secret |
| --- | --- | --- |
| `WEATHERON_BUILD_VARIANT` | `production` | No |
| `EXPO_PUBLIC_WEATHER_CLIENT` | `proxy` | No |
| `EXPO_PUBLIC_WEATHER_API_BASE_URL` | Current public HTTPS WeatherON proxy URL | No |
| `EXPO_PUBLIC_WEATHER_API_TOKEN` | Current WeatherON proxy token | Yes |
| `EXPO_PUBLIC_WEATHER_TIMEOUT_MS` | `8000` | No |

Do not print the proxy token in build logs. The pre-Xcodebuild script validates
that the production proxy configuration exists without printing its values.

The iOS client requests WeatherKit data through the WeatherON proxy. Native
WeatherKit entitlement is therefore not required by the current client target.

## Xcode Cloud workflow

1. Open `apps/mobile/ios/WeatherON.xcworkspace` in Xcode.
2. Use Product > Xcode Cloud > Create Workflow.
3. Select the `WeatherON` product and the `main` branch.
4. Add an Archive action using the Release configuration.
5. Add a TestFlight Internal Testing post-action.
6. Add the workflow environment variables above.
7. In App Store Connect > WeatherON > Xcode Cloud > Settings > Build Number,
   set a number greater than the latest processed build before distribution.
8. Start the workflow and confirm the new build reaches App Store Connect and
   the intended TestFlight group.

Xcode Cloud owns subsequent iOS build-number increments. Keep
`MARKETING_VERSION` and `expo.ios.version` aligned when the app version changes.

## App Group signing regression (build 54)

Reported distribution evidence for Xcode Cloud run
`eb4e726e-0f10-45ee-82d6-7beaa2537eab` maps `1.0.0(54)` to
`fix/mac-existing-uiux-search-20261020` at
`13bb16f28c1d8bb174fef477d1f0194fe4e0c270`:

- The app and widget in the archive were unsigned (no `LC_CODE_SIGNATURE`).
- Export input had `isSigned=0` and `entitlements=null`; export generated only
  baseline entitlements, without the App Group, also absent from the final IPA.
- Both embedded provisioning profiles permitted `group.com.weatheron.mobile`.
  This is not evidence of insufficient account/profile permissions or an export
  removing a group entitlement from a previously signed archive.
- The pre-build hook forced `CODE_SIGNING_ALLOWED = NO` into both Release
  configurations. This fits the unsigned-archive evidence. The target effective
  settings dump and original `.xcent` files were not retained, so this setting
  alone is not established as the sole cause of every signing-stage decision.

The hook must preserve automatic signing and the existing target
`CODE_SIGN_ENTITLEMENTS` paths. Do not disable signing on the app or extension to
work around archive errors. Investigate the actual signing error instead. The
Podfile's resource-bundle-only signing exception is unrelated and remains intact.
This restores an existing declared App Group; it introduces no new group or
account capability. No account/profile/certificate change is required by the
build-54 evidence.

`npm run check:ios-release-signing` checks both Release settings and App Group
source declarations, rejects forced unsigned settings in the pre-build hook,
and executes that hook with synthetic inputs against a temporary project copy.
It checks the existing service validation, token non-disclosure and absence of
project mutation. Source checks run this regression in CI. A PASS does **not**
verify Swift execution, actual signing, archive/export entitlements or TestFlight.

## Read-only archive and final IPA verification

Perform these checks on existing artifacts, on a Mac with Apple's `codesign` and
Python 3. They do not build, sign, install, upload or change Apple account settings.

1. Record the Cloud run ID, source SHA, branch and artifact identity. Confirm the
   app and widget bundle IDs, version and build match the intended run. Do not
   infer a source SHA from the Cloud build counter or from current repository HEAD.
2. In preserved build logs/settings inspect both Release targets for effective
   signing settings and `CODE_SIGN_ENTITLEMENTS`, including command-line overrides.
   If available, compare generated `.xcent`, the archive signatures, export input
   entitlements and final IPA signatures in that order. A source plist or a
   provisioning allowlist alone is not proof of a signed entitlement.
3. Inspect the archive and final export separately. Set the two paths below to
   the existing archive's app and the app from the final App Store IPA. Extract
   the IPA into a fresh temporary directory (for example, with `ditto -x -k`);
   never modify the original artifact or run a signing command against it.

```sh
weatheron_archive_app='/path/to/WeatherON.xcarchive/Products/Applications/WeatherON.app'
weatheron_export_app='/path/to/extracted-ipa/Payload/WeatherON.app'
python3 - "$weatheron_archive_app" "$weatheron_export_app" <<'PY'
import pathlib
import plistlib
import subprocess
import sys

group = 'group.com.weatheron.mobile'
versions = set()
for stage, app_path in zip(('archive', 'final IPA'), sys.argv[1:]):
    app = pathlib.Path(app_path)
    for bundle, bundle_id in (
        (app, 'com.weatheron.mobile'),
        (app / 'PlugIns/WeatherONWidget.appex', 'com.weatheron.mobile.widget'),
    ):
        with (bundle / 'Info.plist').open('rb') as stream:
            info = plistlib.load(stream)
        if info['CFBundleIdentifier'] != bundle_id:
            raise SystemExit(f'{stage}: unexpected bundle ID for {bundle}')
        versions.add((info['CFBundleShortVersionString'], info['CFBundleVersion']))
        result = subprocess.run(
            ['codesign', '-d', '--entitlements', ':-', str(bundle)],
            check=True, capture_output=True,
        )
        entitlements = plistlib.loads(result.stdout)
        if group not in entitlements.get('com.apple.security.application-groups', []):
            raise SystemExit(f'{stage}: missing App Group in {bundle_id}')
        print(f'{stage}: {bundle_id}: signed App Group present')
if len(versions) != 1:
    raise SystemExit('Archive/app/widget/final IPA version or build mismatch')
print('Matching artifact version/build:', versions.pop())
PY
```

An unsigned archive, absent/unreadable entitlement data, missing extension or
missing group must fail this check. Do not continue by treating the profile's
allowed group as the app's claimed entitlement. If profiles are present, decode
them read-only with `security cms -D -i <embedded.mobileprovision>` and confirm
that each permits this same group. Preserve all other target capabilities,
including the widget's existing WeatherKit entitlement, during signing repair.

4. If archive signatures contain the group but the final IPA does not, investigate
   export/re-sign inputs and overrides. If the archive is unsigned or lacks the
   group, resolve the archive stage first. Keep each stage's evidence with the
   exact run; do not print service tokens or entire profiles into public CI logs.
5. Only after separately authorized build/distribution, check the candidate on a
   real iPhone: retain saved destinations, load app weather, verify both
   `WidgetSync` delivery keys (`weatheron.widget.locations.v1` and
   `weatheron.widget.store.v2`), saved places in Edit Widget, and current-location
   weather after returning home. Also test destination selection, an immediate
   background transition and an offline reopen without deleting user data.

The signing-script change and source regression are not a completed production
fix until the new signed artifacts and real TestFlight behavior pass these checks.
