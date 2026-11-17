# Independent review: full-screen editor collapse

Copyright © 2026 Christopher Snow.

Reviewed the CSS cascade, existing full-screen controller and actual browser interaction independently of the implementation author. This is a control-behaviour fix, with no new instruction semantics or learner-facing terminology. It follows the course authoring and learner-clarity criteria. The reader still needs only the course's stated prerequisites; no new assumed knowledge is introduced.

## Findings and corrections

- The full-screen editor rule forced `height: max(280px, 50dvh)` whenever the workspace was full screen. Clearing the editor's expanded class therefore restored that full-screen height instead of its compact size. Removing the forced rule lets the shared compact, manually sized and expanded editor rules apply inside the workspace too. The managing session's original failing regression recorded 500 pixels after Collapse against a compact size of 160 pixels; this review checked the underlying cascade and independently verified the correction.
- The first independent matrix found a related standalone control problem: the older Playground stylesheet hid `#expand-editor`. Computed display was `none`, with no rendered rectangle. A keyboard attempt could not activate the hidden control. The correction explicitly displays this control for the unified workspace. The subsequent complete matrix verified it is visible and keyboard-operable in both lesson and project contexts.

Both confirmed findings are resolved in the reviewed scope. The two controls now have distinct, observable purposes: Full screen changes the workspace boundary, while Expand editor and Collapse editor change the code area's size. The full-screen toggle, editor label and aria-expanded values agree with the observed state. No new explanation is needed to compensate for an unresponsive control.

## Independent browser evidence

Probes used a separate persistent server on port 4222 and Chromium with 390-pixel touch and 1440-pixel desktop viewports, both 1000 pixels high. Native full screen and the modal fallback were checked independently, on both the addition lesson and the standalone Playground: eight combinations. Every combination rendered light and dark appearance and used keyboard Enter to expand and collapse the editor while the real CPU was paused.

- The compact editor measured 210 pixels on the touch viewport and 160 pixels on desktop. Entering full screen preserved that size. Expand measured 650 pixels at this viewport height; Collapse restored the exact prior compact size. Exiting full screen retained that compact size.
- A separate manual-size geometry probe set the inline editor height to 320 pixels, equivalent to the style retained after native CSS resizing. Entering and leaving full screen preserved 320 pixels in all eight combinations. This was a geometry probe, not a claim of physical touch-drag testing.
- Source text, the paused instruction location and the paused state stayed unchanged through the size/theme/full-screen transitions. Continuing produced the actual captured t2 value 12 in all eight combinations. No page error occurred.
- Additional phone/native probes selected the actual Dark theme control before entering full screen and captured the compact full-screen viewport. A separate paused-run probe continued through the completed xv6 report and observed t2 = 12. The viewport screenshot is `/tmp/fullscreen-review-collapsed-native-phone.png`; the matrix scripts and logs are `/tmp/fullscreen-independent-review.mjs`, `/tmp/fullscreen-independent-lessons.log` and `/tmp/fullscreen-independent-projects.log`.

These are functional and interface observations in Chromium. They do not establish learning effectiveness or physical Android-device compatibility. The repository regression suite and CI outcomes are separate from these independent probes.

## Adjacent removal of the lesson-footer Playground link

The user also requested removal of the separate Playground link from lesson-page bottoms. Independent checks at 390 and 1440 pixels found the old footer control absent on addition and the static Hello World page. Tools → Projects remained usable on addition: opening its tool, saving a copy and returning to the lesson preserved the edited source exactly. Hello World still built and printed its actual greeting. The course overview's Open the playground link opened the standalone workspace with the saved project intact, and the workbench guide described Tools → Projects without advertising the removed copy link. No page error occurred in either viewport. A source scan found no remaining old footer selectors or handoff-module references in executable site/generator sources, and both affected entry modules passed syntax checks. The local independent probe and its results are `/tmp/playground-footer-independent-review.mjs` and `/tmp/playground-footer-independent.log`.
