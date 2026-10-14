# Home wordmark 02 — selected contour asset
The path data was supplied directly from the source image workspace after that workspace opened the approved02 original. No new font or replacement character shapes were authored here.

Source deliverables: the approved wordmark 02 source package, comparison image and two-tone SVG. Private Library identifiers are retained outside the repository.
The earlier original Library download remains unavailable in this consuming environment. This integration uses the complete provided paths.json text, not a guessed or redrawn logo. The source producer disclosed raster contour extraction and smoothing, so this is not claimed to be pixel-identical to the original PNG.

paths.json is the preserved geometry. wordmark-light.svg / wordmark-dark.svg are standalone copies of the same two paths. IosHomeWordmark uses explicit native SVG Path fill props and evenodd counters. No SVG CSS-variable dependency or font substitution.
Viewport:180×30; viewBox:0 0 675 120; preserveAspectRatio:xMinYMid meet; actual measured ink161.414×23.272 at that viewport.
Weather: iOS theme.muted (#49656F/#C4DCE3). ON: theme.wordmarkOn (#80591F/#D8BB7A).
Home only. Accessible label remains WeatherON. Android/web keep the original text and colors, and do not evaluate the SVG module. Existing wordmark/launcher assets and mascot connections are unchanged.
Native dependency: Expo57 bundledNativeModules recommends react-native-svg15.15.4. It is pinned in mobile package.json and package-lock; existing lock entries are preserved.
Local Xcode build and update installation succeeded with the integrated source. Device UI acceptance remains with the user; installation is not a visual QA result.
