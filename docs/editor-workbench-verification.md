# Editor workbench verification

Copyright © 2026 Christopher Snow.

The implementation uses a separate editor/copy author and independent learner and technical reviewers. Their actual browser evidence, accepted findings, failed probes and closure are recorded in the adjacent review files. This is a UI and execution review, not a novice study.

## Focused checks and corrections

- The initial focused run passed eight checks and failed two row-height assertions. CodeMirror estimates offscreen rows; the corrected checks scroll the editor into view, await measurement and retain the 44-pixel phone target assertion.
- An expanded focused run passed twelve and failed two Find assertions. The test filled the Find field without the keyup/change event used by CodeMirror to commit its query. Sending actual typed keys fixed that harness. A passing two-test rerun still did not establish usable source space: independent review subsequently exposed the real phone clipping defect and required stronger viewport assertions.
- The first full browser attempt was stopped for the Find and modal-navigation corrections: 29 passed, two interrupted and 21 did not run; exit 130. It is not a full-suite pass.
- Ten focused checks passed after those corrections. Independent technical review then established that native fullscreen was silently falling back because dialogs cannot request fullscreen. The second broad attempt was stopped: 17 passed, two interrupted and 33 did not run; exit 130.
- After changing the native target to the workbench, the native-focused run passed three checks and failed the phone help-navigation check. This exposed the actual fullscreen root's missing scroll container. The fullscreen root now owns scrolling.
- The final focused editor/native/fallback run passed all twelve checks. It asserts actual fullscreen identity, reachable complete source after return, usable Find source height and viewport intersection, and preserved source/CPU/readonly state.

The final full browser-suite result is reported separately in the pull request and its Actions checks. The focused passes above do not replace it. Earlier cancelled attempts and failures retain their original outcomes.

## Build and execution checks

All 14 unit/execution checks passed without skips. The full lesson corpus passed: 57 native examples, 196 native challenge cases, 57 rejected incomplete submissions, 58 xv6 examples, three xv6 challenge cases and one rejected xv6 incomplete submission, with no failures. The UI corrections do not change programs, fixtures or compilation/execution semantics.

All 26 pinned assets verify. The local CodeMirror bundle records exact dependency versions and all 15 third-party licences. CI regenerates it and checks the committed bytes and asset manifest, then regenerates all 58 lesson pages. Final formatting and generated-file checks accompany the pull request.

The browser tests edit the visible CodeMirror surface. The retained hidden textarea is a progressive-enhancement fallback and reflects the actual document; it is read for source/export assertions, never used as a hidden editing interface. Diagnostic checks inspect the real focused DOM selection.
