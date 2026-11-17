# Unified workspace: independent learner review

Copyright © 2026 Christopher Snow.

Reviewed the uncommitted implementation independently from the actual interface and the learner-clarity criteria. The assumed learner reads simple C and small binary numbers. This review used Chromium with 390 × 844/1000 touch, 800 × 1000 and 1440 × 1000 viewports, including light and dark appearances. No production implementation was edited by this reviewer.

## Findings and corrections

1. **Project actions were initially clipped and unusable on a phone.** Tools → Projects → Project actions placed Save a copy outside the workbench's clipped boundary. A normal click failed because the following lesson explanation intercepted it. This was a release blocker, not merely a visual preference. The implementation changed these menus to flow in the document. The same normal-click path then succeeded: a copy opened, edited code ran to 42, and Return to lesson restored the original source and the Lesson draft picker entry.

2. **Imported optional guides interrupted prediction → editor.** The initial lesson page put “From a fragment to a complete program” and “Using the playground” between the prediction and editor. These optional guides were moved after the lesson workbench/resources. They no longer interrupt the main action sequence.

3. **The initial lesson displayed a link back to itself.** Back to source lesson appeared in the lesson workspace before any project existed. The origin link is now withheld while in lesson mode. A project can retain its useful origin link.

4. **Essential memory results require a contextual default.** At the time of the initial probe, memory-bytes loaded with Tools closed, although its introduction specifically relies on the Memory Before view. This differs from addition, where compact relevant-register results suffice. The implementation now selects Memory for lessons that originally request a memory view and Debugger for debugging lessons. An independent 390-pixel recheck confirmed memory-bytes opens Memory before execution and keeps its 64 cells visible after a real run; debug-load-width opens Debugger; addition keeps Tools closed. Their editors stayed visible, with no page overflow or exceptions. The screenshot also confirms the supplied-byte offsets, labels and Before/After controls are readable.

5. **Beginner summary vocabulary should remain decimal.** The first addition lesson initially labelled the compact results “Signed reading” before signed interpretation was introduced. It now retains “Decimal reading” when the lesson's existing signed-interpretation gate is false. Independent checks at 390 pixels in dark appearance and 1440 pixels in light appearance confirmed the label before project work and after Return to lesson.

6. **Personal projects need their own purpose heading.** The initial same-page project mode retained the lesson-only heading and summary above arbitrary personal code. The implementation now shows the project name and project-type description there and restores the lesson title/summary on return. Both viewport/appearance combinations above independently passed that full transition. The breadcrumb remains available as lesson context.

7. **Project feedback and recovery must remain visible.** Applying setup or changing projects should not force a different inspection tab and hide the resulting message or Undo control. The final independent recheck confirmed Save a copy retains Projects and its message; Apply setup retains Setup and its entered values; Delete project retains Projects and exposes Undo delete; Undo restores the project and its heading without leaving Projects.

8. **Explain the lesson setup action before it changes context.** The lesson-only setup note now states: “Apply setup opens a project copy with these values. Your lesson draft and its starting setup stay unchanged.” A final 390-pixel touch recheck confirmed the note is visible before Apply; entering t0 = 9 and t1 = 10 opens a project copy with those values and keeps Setup selected; the note is hidden in project mode. Return to lesson restores the exact source and original empty starting-register setup, hides Return to lesson, and shows the note again. No page exceptions occurred. This makes the automatic context change explicit before the learner chooses it.

An apparent source/gutter alignment problem in an initial full-page screenshot was challenged and rejected as a persistent defect. The editor was below the viewport and CodeMirror deferred measurement. Scrolling the editor into view aligned source and gutters exactly, with the existing 44-pixel touch line height. No implementation change was requested for that observation.

## Functional evidence

- Original addition executed to t0 = 7, t1 = 5 and t2 = 12. The suggested edit to 19 and 23 executed to 42; prediction feedback matched the edited program, without treating it as a failed original-example check.
- All nine tool destinations—Registers, Memory, Stack, Output, Diagnostics, Debugger, Program, Setup and Projects—retained the visible editor. No page horizontal overflow or page exceptions occurred in the three viewport/appearance combinations above.
- Arrow/Home/End navigation reached the first and last tool tabs with a single active inspection tab. Program showed three instructions from the actual addition build. Selecting a gutter breakpoint opened Debugger and exposed Start debugging. Actual execution paused with 19/23/0, then Continue finished at 42.
- On a phone, an edited example with prediction 42 was followed by an edited optional exercise using the “A zero input” case. A new C project opened in the same editor and actually compiled/executed to a0 = 12. Return to lesson restored the exercise's exact source, selected case and starting state. Return to example then restored the earlier 19/23 source and prediction 42. No page exceptions occurred.
- Memory-bytes executed with 64 inspectable bytes. Before correctly described supplied bytes; After named the observed data address. Switching those moments worked through the visible controls after opening Tools → Memory.
- Final targeted checks at 390 pixels/dark and 1440 pixels/light confirmed the decimal vocabulary gate, optional hexadecimal register readings, current project heading/description, setup values, deletion/undo feedback and exact lesson heading/summary restoration. One visible source editor remained throughout; there were no page exceptions or page horizontal overflow.

These are interface and execution checks. They do not establish novice understanding or learning effectiveness. The initial failed menu click, its corrected recheck, and the resolved contextual-memory finding are recorded separately rather than folded into a single passing claim.

No unresolved learner-review finding remains in the checked scope.
