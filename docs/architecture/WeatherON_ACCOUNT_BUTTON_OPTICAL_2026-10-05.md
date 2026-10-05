# Account button optical verification — 2026-10-05

The final normal iOS Release update passed build, signature/entitlement/profile
checks, installation and launch. The user then opened and expanded the actual
account screen. A fresh read-only capture of that screen confirms the complete
Korean “LINE으로 로그인” label and all five provider controls without clipping.
No test screen, authentication or device setting change was used for this final
capture. Screenshots, identifiers, install receipts and backups are private and
are not part of this repository.

## Native LINE regression and correction

The preceding layout inherited `styles.content.flex = 1` while overriding grow,
shrink and basis:auto. React Native Yoga with native defaults resolves that
positive flex/auto combination to a zero basis. The content retained only its
padding and the label disappeared. Browser checks alone missed the native fault.

A C++ reproduction compiled against the installed React Native Yoga sources
uses a fixed 112-point text measure callback and parent widths 288/385/616.
The inherited-flex case gives group 94, content 40, label 0; removing inherited
flex gives group 206, content 152, label 112. Both cases were rerun successfully
before commit. This proves the layout mechanism, not UIKit glyph metrics.
The final `lineContent` is independent of `styles.content`, with no flex shorthand.

The final mark targets are Naver 18 and other custom providers 20. Custom iOS
text compensates below font scale 1; Apple internals remain native and unchanged.

## Actual current iPhone pixels

The capture is 1320×2868. Values below are thresholded visible ink bounds in
original screenshot pixels, not font point sizes or line-box dimensions.
Dark marks/text use channels below 100, white ink above 235; Google uses color
separation for its mark and a gray threshold for text. Antialiasing affects edges.

| Provider | Visible logo width × height | Full label ink height | Logo-to-label ink gap |
| --- | --- | --- | --- |
| Kakao | 56×53 | 41 | 29 |
| Naver | 54×54 | 41 | 28 |
| Apple | 38×46 | 62 | 23 |
| Google | 58×60 | 44 | 38 |
| LINE | 58×54 | 40 | 119 |

The Naver mark's 54 physical pixels correspond to its 18-point target at 3×.
LINE has nonzero text ink and the complete Korean label. Ink vertical centers
are within approximately 3 physical pixels of their button centers in this
capture; combined ink horizontal centers differ from the button center by about
2–8 physical pixels. These are optical observations, not baseline measurements.

Apple text is still larger. LINE's icon column, separator and mandatory text
padding leave a larger apparent gap. Google keeps its prescribed typography.
Equal button bounds therefore do not mean equal internal logo/text dimensions
or equal perceived weight. No custom replacement for the native Apple control
is implemented, and this batch is not marked optically identical or complete.

## Limits and supporting checks

TypeScript, font patch, production-element metrics and native Yoga checks pass.
The latest 96-case web matrix and normal iOS Metro/Release build also pass;
web results do not substitute for actual iOS pixels. The current capture covers
one iPhone, Korean, enabled controls, dark appearance and Small Dynamic Type.
Full native iOS language/state/Dynamic Type coverage and VoiceOver speech remain
unverified. Android's earlier 24-case matrix predates the final iOS-follow-up
LINE style and mark-size changes; final-source Android rendering needs a rerun.
TalkBack semantics were inspected, but spoken traversal was not verified.
No live account connection was tested by this visual check.

References:
- https://developers.google.com/identity/branding-guidelines
- https://developers.kakao.com/docs/ko/kakaologin/design-guide
- https://developers.naver.com/docs/login/bi/bi.md
- https://developers.line.biz/en/docs/line-login/login-button/
