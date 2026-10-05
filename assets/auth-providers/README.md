# OAuth brand assets

The original full-button images are official provider assets downloaded from each provider's login-brand resource page. Derived mark resources added later are described separately below. The English Kakao asset was added on 2026-09-19.

- `kakao-login-ko.png`, `kakao-login-en.png`: Kakao Developers login resources, large/wide Korean and English
- `naver-login-ko.png`: NAVER Login Korean green wide H56
- `line-login.png`: LINE Developers iOS 44dp 3x login button
- `google-login-ios.png`: Google Identity iOS light pill 3x sign-in button
- `naver-icon.png`, `line-icon.png`, `google-icon-ios.png`: official icon-mode assets used in responsive buttons

Official references:

- Kakao: https://developers.kakao.com/docs/ko/kakaologin/design-guide
- NAVER: https://developers.naver.com/docs/login/bi/bi.md
- LINE: https://developers.line.biz/ja/docs/line-login/login-button/
- Google: https://developers.google.com/identity/branding-guidelines

Keep original full-button files unchanged. Use derived marks only as documented below and subject to each provider's rules; do not distort or redraw logos.

## Responsive login controls (2026-10-05)

`AccountProviderButton` uses the following mark-only resources instead of placing
an entire icon-mode button inside another button. The original downloaded button
files remain unchanged. Do not distort or redraw the marks.

- `google-g.png`: unchanged official gradient G downloaded from
  https://developers.google.com/static/identity/images/g-logo.png (200 × 204).
- `naver-mark.png`: unchanged 80 × 80 white N region (x=72, y=72) extracted from
  the official 224 × 224 `NAVER_login_Light_KR_green_icon_H56.png` in
  https://developers.naver.com/inc/devcenter/downloads/bi/NAVER_login_KR.zip.
  The downloaded icon matches the existing `naver-icon.png`; no recoloring is needed.
  Its green background is #03A94D, matching the custom container.
- `kakao-symbol.png`: the speech-bubble region (x=28, y=27, w=38, h=36) from
  the existing official 600 × 90 Korean button. The yellow container is removed
  using its coverage against #FEE500; the black symbol geometry is unchanged.
  Kakao explicitly permits recomposing symbol, label and container under its
  [design guide](https://developers.kakao.com/docs/ko/kakaologin/design-guide).
- `line-icon.png`: existing official 132 × 132 canvas retained intact, with its
  98-pixel visible bubble used to calculate display size. The documented disabled
  gray tint, white container, separator and pressed background are applied by the
  button component, following https://developers.line.biz/en/docs/line-login/login-button/.

Google Sans is bundled at `apps/mobile/assets/fonts/google-sans/` with its SIL OFL.
Source: https://github.com/google/fonts/tree/main/ofl/googlesans (variable font,
medium weight requested by the Google button). Other labels use system typography;
Apple remains the native Apple Authentication button. Common outer bounds do not
imply identical internal brand padding. No authentication behavior is changed.

## Distribution and third-party rights

These brand assets are included only to implement the corresponding provider's
login controls in WeatherON. Provider marks retain their respective owners'
rights; they are not relicensed under a general source-code license and this
repository grants no independent right to reuse them as artwork, app icons or
endorsements. Follow the linked provider terms/design guides when redistributing
or adapting this implementation. This is not a standalone asset pack.

Google's guide permits downloaded/custom sign-in controls subject to its brand
rules. Kakao permits recomposing the button subject to its symbol/color rules.
Naver provides login assets and limited design changes while prohibiting logo
deformation. LINE use is limited to its login purpose under the
[Usage Guidelines](https://terms2.line.me/LINE_Developers_Guidelines_for_Login_Button);
its existing icon file is unchanged. No broader trademark license is asserted.

The unmodified Google Sans font and copyright/license notice were compared with
the official `google/fonts` distribution before commit (license line endings
and trailing whitespace normalized without changing its text). SIL OFL 1.1 permits
bundling/redistribution with software when the copyright and license accompany
the font; the font remains under OFL and may not be sold by itself. Full notice:
`apps/mobile/assets/fonts/google-sans/OFL.txt`. Font SHA-256:
`d0a87d835a944b8b40d0e82a5651bb59ab97b936a2aeed5946eb57e7b2a3a90a`.
