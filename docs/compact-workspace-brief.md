# Compact lesson workspace

Copyright © 2026 Christopher Snow.

## Outcome and scope

Keep a short assembly fragment close to its observed registers so the reader can trace which inputs an instruction reads and which destination it writes. Preserve the existing predict, run, inspect and fresh-input challenge route. Longer assembly, C, memory and debugger lessons use the same workspace.

The first addition lesson defines registers, instruction operands, `li`, and assembler expansion before the editor. The starting inputs must remain visible. Run observations must remain distinct from starting values. No instruction semantics, program fixtures or grading change.

Applied the source course's `learning-design` skill, particularly attention, state and access. Inspected the user's screenshot, live addition at 390, 800 and 1440 pixels, and the shared CSS/controller/generator. This is a design review, not evidence from a novice study.

## Decisions to verify

- Fit the editor to source line count and rendered line height, with a minimum writing area and a bounded height for long code. Recalculate after edits, draft loads, restores and width changes. Do not resize on execution snapshots.
- Offer a keyboard-operable Expand editor / Collapse editor control that changes neither source nor execution state.
- Keep 44-pixel phone breakpoint rows aligned with source lines and retain contained scrolling for long or wide source.
- Reduce panel, activity-control and register-card spacing without reducing existing font sizes or touch targets.
- Keep fresh-machine wording, named challenge inputs and stack qualifications visible. Put longer supplied-program and usage notes under How this lab works, with an actual link opening View complete program.
- Preserve prediction/result timing, sticky execution controls, breakpoint selection, diagnostics, independent drafts, and all 58 lesson links.

## Evidence required

Check short and long assembly, C, stack and challenge states at phone, tablet and desktop widths, in both themes. Verify growth, expansion/collapse, restore/undo, activity switching and viewport changes. Exercise real stepping and challenge runs through the existing browser suite, and independently review the final built experience for learner clarity and technical regressions.

The hypothesis is that less unused editor area reduces scrolling during code/result comparison. Browser measurements can establish the layout change, but not a learning benefit.

## Implementation verification

Separate copy drafting was performed by `compact_workspace_copy`. Independent learner and technical reviews are recorded in the adjacent review files. Neither reviewer implemented the changes. No unresolved P1/P2 product finding remains in their checked states.

The first new focused browser run had three passes and three failures. One assertion required exact source/gutter scroll equality; Chromium rounded their 30-line desktop scroll ranges to 452 and 451 pixels. The final assertion documents that observation and allows at most one pixel, with separate checks that row heights match. Two failures came from a test incorrectly expecting a second Continue action after normal stepping had already completed the run. The corrected test checks the actual completion and result after one Continue. No product change was made to satisfy these corrections. The focused rerun passed all six checks across phone and desktop.

The 14 existing unit/execution tests passed without skips. All 24 pinned assets were verified and all 58 lesson pages regenerated. Full browser-suite and course-corpus results are reported separately in the pull request and GitHub Actions checks; the focused rerun does not stand in for them.
