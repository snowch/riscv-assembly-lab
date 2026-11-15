# Compact workspace technical review

Copyright © 2026 Christopher Snow.

Reviewed independently on 15 November 2026 by `compact_workspace_technical`, which did not implement the changes or draft their UI copy. The source course requires an independent technical pass through `docs/course-authoring.md`. No product files were edited during this review.

## Scope

Read the actual CSS, controller and generator diff before the author's design brief. Checked the generated addition and C pages, source and debugger state handling, starting fixtures, and the matching supplied-program construction in `site/course/model.js`. The runtime, instruction implementation and challenge fixtures are unchanged.

Ran fresh Chromium contexts against the generated site at `http://127.0.0.1:4245`. Layout and editor interactions covered widths 390, 800 and 1440 in both themes. Additional width transitions covered 320, 520, 521, 800, 1440 and 390. Real execution checks covered phone 390 and desktop 1440, including addition, edited long assembly, C return values and stack frames.

## Independently verified behaviour

- **Content height:** the four source rows of the initial addition example, including its final blank row, occupy a 204-pixel editor on the phone and a 144-pixel editor on tablet/desktop. Source edits containing 35 rows reach the intended 352/360-pixel caps. Expansion increases the available editor area; collapse returns to the fitted height.
- **Rows and scrolling:** phone source and gutter line heights are both exactly 44 pixels. Desktop computed line height is 25.92 pixels, with rendered button boxes at 25.90625 pixels through fractional layout rounding. The source and gutter remain aligned in the checked scroll and breakpoint scenarios. A one-pixel endpoint tolerance for approximately 30 desktop rows is reasonable; pixel-identical scroll endpoints are not promised for arbitrary source lengths. That fractional sizing rule predates this change.
- **Width transitions:** crossing the 520-pixel breakpoint recalculates source height using the new rendered line height. Every checked width retained source/gutter alignment and had no page-level horizontal overflow.
- **Expansion state:** keyboard Enter expands and collapses while focus remains on the toggle. Its accessible expanded state matches the rendered state. Source text is unchanged. During an actual paused CPU session, both operations preserve the PC, observed registers and paused state.
- **No resizing on CPU observations:** stepping from the initial addition pause executes the first instruction and produces `t0 = 7` without changing editor height. Continue completes with the actual sum in `t2`.
- **Long-source breakpoint:** a 31-line fragment increments `t0` on each of its first 30 lines. Selecting source line 21 pauses before that increment, with `t0 = 20`; Continue reaches the result of 30. Source and gutter scroll together at the pause. This was independently executed at both phone and desktop widths.
- **Drafts and replacement paths:** long source survives Explore/Challenge switching and page reload. Restore starter reduces the source and editor together; Undo restore recovers the long text. Named challenge starting inputs and their register/value chips remain visible and separate from observations.
- **C:** the starting argument chips remain visible. C has numbered source spans rather than fabricated assembly breakpoint buttons. Real compilation and execution of the starting function reports 31 in `a0` at both widths.
- **Stack:** `stack-frames` retains both the fresh-machine statement and the 16-byte-aligned stack/64-byte inspection qualification outside the help disclosure. Actual execution produces 64 observed byte cells.
- **Help link:** opening How this lab works and following View complete program opens the complete-program disclosure and retains the current source. It does not load a reference answer or run code.
- No uncaught page errors occurred during the completed scenarios.

## Findings, rejected assumptions and limits

No unresolved P1 or P2 product finding was established in these scenarios. The smaller editor does not change source, fixture, prediction or CPU state. Essential starting inputs remain outside optional help; the existing paused instruction description still explains the source-line/machine-instruction distinction when stepping.

An initial reviewer script asserted the stack qualification on `preserving-return-address`, which does not request a stack memory view. That assertion failed because the reviewer selected the wrong fixture, not because the new renderer dropped the qualification. The corrected full scenario used `stack-frames`, whose data explicitly selects `memory: "stack"`, and passed independently at both widths. The failed probe is not counted as a passing check.

This is a focused technical review of the final shared workspace, not a new full ISA audit or a novice learning study. Browser checks used desktop Chromium with phone-sized viewports, not a physical phone, virtual keyboard or screen reader. Arbitrary source lengths and every assistive-technology combination were not tested.
