# Editor workbench technical review

Copyright © 2026 Christopher Snow.

Independent review of `feat/editor-workbench`, 15 November 2026. The reviewer did not implement the editor, controller, workbench layout or interface copy. Read the actual changed modules and generated pages before the author's brief. Followed `docs/course-authoring.md` and the source course's independent-review instructions using the inherited model without an override.

## Scope and evidence

Read the CodeMirror adapter, bundle builder and package/asset records, course and Hello World controllers, inspector/fullscreen controller, generated markup and workbench CSS. The GNU toolchain, CPU runtime, fixtures and graders are unchanged. Browser checks used fresh Chromium contexts against `http://127.0.0.1:4246`, with real compilation and xv6 execution rather than scripted register values.

- At 390 and 1440 pixels, in both light and dark themes, the visible assembly source and breakpoint rows aligned: 44 pixels on phone, 25.92 pixels on desktop. Phone source was 16 pixels; desktop source was 14.4 pixels. The checked pages had no page-level horizontal overflow.
- In all four combinations, selected a real line breakpoint, started stepping, expanded the workspace and editor, returned to the lesson and continued execution. The source, selected breakpoint and paused PC survived the layout transitions. Keyboard focus returned to the workspace toggle. The next step loaded the expected initial input and the actual run completed with the example's result.
- Independently exercised Escape return with the Fullscreen API available and with `document.fullscreenEnabled` forced false. Both paths retained source and returned focus. Actual mouse dragging resized the editor from 144 to 267 pixels; this was not a script setting an inline height.
- A 31-row assembly fragment incremented `t0` on its first 30 rows. F9 on source line 21 selected that exact line. Actual debugging paused before it with `t0 = 20`, marked the instruction in the editor, and Continue completed with 30. Editing a separately paused source stopped its CPU, cleared breakpoints/current-instruction marking and displayed the prior-observation notice.
- A GNU assembly diagnostic selected the actual faulty text in the visible CodeMirror editor. Error handling selected the Diagnostics tab.
- C had ordinary line numbers and no assembly breakpoint buttons. Selected a real emitted instruction address (`0x10254` in the checked build); Continue paused at that address. The compiled function subsequently returned 31 in `a0`. No source-line mapping was invented.
- The memory inspector showed 64 actual observed bytes after a load/store example. Stack frames retained the visible alignment/inspection qualification and produced 64 observed bytes. The system-call lesson selected Output initially and produced its actual console text.
- Loading a challenge reference established a fresh editor undo history: Ctrl+Z did not reveal another activity's document. During the actual multi-case check, CodeMirror became non-editable and returned to editable after all cases passed.
- The standalone Hello World editor had no fabricated breakpoint buttons. At phone and desktop widths, edited its visible source, built and executed the changed message, then checked Restore and Undo restore.
- All 26 pinned assets passed the independent asset check. All 15 bundled package versions matched `package-lock.json`. The builder retains their licence texts and CI verifies regeneration. This is a provenance/rebuild check, not a new upstream dependency audit.
- No uncaught page error occurred in the completed scenarios.

## Accepted finding

### P2: Complete program is inaccessible from the expanded workspace

Open the workspace, open How this lab works, and follow View complete program. The controller opens `#complete-program`, but that element is outside the modal dialog. Independently reproduced with the native API available and with its availability forced false. After 300 milliseconds the dialog remained open, the body still had `overflow: hidden`, and the opened complete-program disclosure remained behind the modal. A passing check of its `open` property alone would miss the failure.

The controller now awaits workspace return before opening and navigating to the complete program. Initial closure checks used the modal because of the separate native-fullscreen finding below. After both subsequent corrections, independently repeated the link at 390 and 1440 pixels with actual native fullscreen and with the API forced unavailable. In all four final checks the modal closed, the complete source entered the viewport, its summary received focus, the paused PC/source/registers remained identical, and subsequent execution returned the actual example result. **Closed.**

### P2: The native fullscreen request targets an invalid element

The controller calls `dialog.requestFullscreen()`. A dialog is not an eligible fullscreen element. In a fresh browser with `document.fullscreenEnabled === true`, independently intercepted the promise rejection: `TypeError: Dialog elements are invalid`, with the target tag `DIALOG`. The controller swallowed the rejection, so the modal filled the window and its button said Exit full screen while `document.fullscreenElement` remained null. Earlier checks of `dialog.open` exercised the fallback rather than establishing native fullscreen.

The controller now requests fullscreen for the workbench section and recognises it in the exit path. Independently verified `document.fullscreenElement.id === "workbench"` at phone and desktop widths, plus Escape return and source/focus preservation. The forced-unavailable fallback still works. **Closed.** Enabling the actual native path exposed the scrolling issue below.

### P2: Native fullscreen content cannot scroll into view

On the new actual native path at 390 × 1000, the fullscreen workbench measured 1000 pixels high with 1478 pixels of content and `overflow: visible`. Its parent dialog, previously responsible for scrolling, was outside the fullscreen section and measured no scroll range. How this lab works began at approximately y = 1078. Clicking it timed out because scrolling could not bring it into the viewport. Lower inspection content was similarly beyond the fullscreen surface.

The actual fullscreen workbench now owns `overflow: auto`. A fresh 390-pixel native view reached Help and the lower Debugger controls, selected `t0` and pinned it. Its scrollTop reached 1237 pixels with 2237 pixels of content in the 1000-pixel viewport. The final four paused navigation scenarios also passed: actual native fullscreen at both widths, forced-unavailable fallback at both widths, complete-program return, source/PC/register preservation and the resumed example result. **Closed.** The preceding failed native-navigation rerun exposed this product issue; it is separate from the earlier reviewer harness correction.

## Rejected assumptions and check history

The initial combined reviewer script incorrectly expected a second Continue action at the reporting checkpoint. The worker takes its final observation there and automatically runs the reporter; the extra action timed out because execution had already completed. The failed script is not counted as a passing check. Its affected long-source and C scenarios were rerun successfully with a single Continue to completion and a fresh-PC wait at the selected C address.

CodeMirror uses estimated row heights outside the viewport. Before scrolling a newly mounted offscreen editor into view, an estimated gutter row can measure 14 pixels while the source's CSS line height is larger. The visible checks first brought the editor into view and then compared its measured source and gutter rows. The actual phone rows measured 44 pixels; no touch-target or visible alignment finding was established by the offscreen estimate.

## Limits

These are focused UI/controller and real-execution checks, not a full ISA audit or evidence of improved learning. They used desktop Chromium at phone-sized viewports, not physical phone keyboards or a screen reader. The main process owns the full test suite, final build and production checks. All three accepted P2 findings are independently closed; no unresolved P1/P2 issue remains in the scenarios reviewed here.
