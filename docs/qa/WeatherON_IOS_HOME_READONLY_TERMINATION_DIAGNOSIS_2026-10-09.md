# Read-only App Attest / signal9 diagnosis

Subsequent user confirmation: standard-size Home, dark readability, all-tab returns and large-text scroll access were directly checked on the installed app with no issue reported. No additional termination event or attributable force-quit/tool action was supplied. The previously unexplained PID70256 signal9 event therefore remains unresolved; do not infer its cause or expand the user's usability confirmation into an authentication or process-stability diagnosis. No new build/install/launch/setting change was performed after this report.

This follow-up used existing local execution/build/capture evidence and unchanged source only. No build, install, launch/terminate, screenshot, app/OS setting change, private DB read or new device-log extraction was performed. The pending manual QA device state was preserved.

## Verified warning origin and impact

The already collected authored warning diagnostic contains `existing-app-attest-assertion:1`. Its classifier matches the static first argument `App Attest assertion unavailable`; it deliberately does not copy formatted errors, tokens or identifiers. The source is the unchanged `createAppIntegrityHeaders` catch in `providers/appIntegrity.ts`: warn, then return `{}`. Caller `accountAuth.accountRequest` obtains these headers for protected token-bearing requests. Session restoration uses `/auth/session`, but the category alone does not identify which protected request triggered this particular warning.

The installed RN LogBoxData emits the visible `Open debugger to view warnings.` migration message when a warning occurs with full-console support and no active debugger. Its per-session flag explains why a warning can produce a fresh banner after an app relaunch. The diagnostic's original warning delivery was preserved. This confirms the latest known trigger is an existing account-integrity path, not a confirmed new Home texture/viewport defect. It does not prove all earlier banners had the same trigger.

Underlying assertion failure reason (challenge request, native assertion, key state, network, response parsing or other caught exception) is unknown: the available safe diagnostic records only category/count. This warning has a handled source fallback; the recorded catch itself contains no process kill/exit. There is no evidence tying it causally to signal9. The protected account request may fail depending on the existing service policy; successful account synchronization must not be inferred from the warning or Home screenshot. No authentication/security change or account-state reset is warranted within this design task.

## Timestamp correlation (KST = UTC+9)

Console signal9 lines themselves have no timestamp. The table uses the console file's final-write time as an approximate bound, not an iOS termination-reason timestamp.

| Process log | Last write / signal9 | Next recorded development launch | Interpretation |
| --- | --- | --- | --- |
| field-fidelity | 22:15:23.209 | type-balance 22:15:40.069 | Final write falls in the next overwrite-install/relaunch sequence. Expected development replacement is consistent with this event. |
| type-balance | 22:21:17.208 | viewport 22:21:36.620 | Same correlation with the subsequent overwrite install and terminate-existing launch. |
| viewport | 22:36:36.841 | density/accessibility 22:36:55.141 | Same correlation with the subsequent overwrite install. |
| density/accessibility, PID70256 | 22:37:11.319 | No subsequent launch/terminate/install by this task | Started22:36:55.141; final write about16.178s later. This event cannot be attributed to this task's next development reinstall or explicit terminate command. |

The latest build finished22:35:45.879, followed by the single overwrite install and `devicectl ... launch --terminate-existing --console`. That command can explain replacement of the **prior** app, but does not by itself explain the subsequent kill of newly launched PID70256 about16s later. Existing command history contains no second mutation in that interval. Screenshot completion22:37:18.772 showed the launch splash; settled screenshot22:37:56.427 showed full banner-free Home. A subsequent read-only process query found app PID70260 and widget PID70257. PID70260 differs from70256, confirming process replacement, not a proven cause or actor.

Signal9 reports SIGKILL, which is compatible with explicit process termination, OS resource/watchdog termination and other causes. Existing logs have no explicit exception/backtrace, jetsam/watchdog termination reason or attributable second launch command. Absence of a RedBox/fatal line is not proof that the OS did not terminate the app. Do not relabel this as a clean launch-stability pass, a confirmed crash, memory exhaustion, user force-quit or tool-induced restart.

## Outcome and minimum next step

Earlier signal9 events are consistent with the known development replacement sequences. Latest PID70256 termination remains **unexplained**, while the installed app was subsequently observed running and displaying complete Home. Existing auth-integrity warning is outside the design change; leave its configuration and implementation untouched. Pending normal UI design QA can proceed on the current installed app without another build/reinstall.

To settle the latest process event requires an attributable manual/tool termination record at approximately22:37:11, or a specific app termination-reason report for that event. Neither exists in the logs available to this task. No broad device diagnostic or sensitive account-log dump was requested or collected. If termination repeats during ordinary manual use, record just time/action and app-specific termination metadata before considering a separate reliability investigation.
