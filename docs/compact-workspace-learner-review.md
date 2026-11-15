# Compact workspace learner review

Copyright © 2026 Christopher Snow.

Independent review of `fix/compact-lesson-workspace`, 15 November 2026. The reviewer did not draft the interface copy or implement the layout/controller changes. Used the inherited model without an override, following the separate-review process in `docs/course-authoring.md` and the source course's `CLAUDE.md`, authoring and style guidance.

## Scope and evidence

Read the actual generated pages and shared CSS, controller and generator before reading `docs/compact-workspace-brief.md`. Inspected Chromium at `http://127.0.0.1:4245` with fresh contexts at 390, 800 and 1440 pixels, each 1000 pixels high, in both light and dark themes. The sample was addition, recursive progress, C return values and stack frames: 24 initial render combinations. Verified actual theme backgrounds, no page-level horizontal overflow and no uncaught page errors. Visually inspected phone light challenge, tablet dark long assembly, phone dark C and tablet completed-addition screenshots.

In every render combination, keyboard Enter expanded and collapsed the editor, the reported expansion state changed, the source was unchanged, and the help link opened the complete-program disclosure. Addition's challenge mode retained a visible case name, supplied register values and fresh-machine statement. Stack frames retained the visible stack alignment/inspection qualification.

Measured short-addition editor heights were 204 pixels on phone and 144 pixels on tablet/desktop, including borders. The recursive example used the bounded compact height, 352 pixels on phone and 360 elsewhere, while expansion reached 700 pixels at the checked viewport height. The source font stayed 16 pixels on phone and 14.4 elsewhere. These are layout observations, not evidence that a learner understood the instructions.

Additional 320/390/800/1440 checks found no visible text below 11 pixels and no page overflow in the addition page. The new expansion button and both activity controls measured at least 44 pixels high. Phone breakpoint rows remained 44 pixels high. The editor continues to contain horizontal scrolling for the wide C function signature.

## Learning route and prerequisite check

The unchanged addition introduction defines registers, temporary-register names, operands/destination, `li`, assembler expansion and Build & Run before the editor. The example is still three instructions, with prediction before observations and a separate fresh-input application afterwards. A smaller example is unnecessary for this spacing change: removing a load would obscure the distinction between supplied inputs and values loaded by the reader's code. No new learning mechanism was introduced.

The required Build & Run route works with every optional disclosure closed. Starting inputs and the explicit fresh-machine statement remain visible. Moving repeated usage notes into How this lab works does not hide the first definition of assembler expansion: it already appears in addition's introduction. During actual paused execution, the visible step-location message repeats that one source line may expand into several machine instructions, and the sticky operation names the next source operation. The result stays explicitly labelled as captured after execution rather than an initial value.

The compact register cards retain register names, the Result label, decimal values and the existing width/observation caption. The result is distinguished by text, size and border as well as colour. The checked samples introduced no additional unexplained prerequisite through the revised workspace copy. This is not an audit of every pre-existing lesson term.

## Interaction checks and findings

Independently edited a 30-line assembly fragment at 390/800/1440, observed growth and contained vertical scrolling, restored the three-line starter, undid the restore and observed the longer editor return. Then used the actual GNU/xv6 path to start stepping the restored addition, expanded the paused editor, executed a machine step, collapsed it, continued and confirmed the completed example. Expansion did not stop the machine or change source. Compact height stayed stable across execution snapshots. The code/result comparison in the completed 800-pixel workspace fits within roughly one 1000-pixel viewport when positioned at the editor panel.

No accepted P1/P2 learner or design finding remains in the inspected states.

Rejected concern: an initial inspection-script assertion required exactly equal source and gutter `scrollTop` at the bottom of 30 lines. Phone measured equal; tablet/desktop measured 452 versus 451 pixels. The rerun accepted at most one pixel after checking the rendered rows; no visible line-to-number mismatch or growing drift was observed. The original script failed at that assertion, and the subsequent interaction checks were rerun successfully at the two affected widths. This was an over-strict reviewer assertion, not a failed product browser test.

## Limits and decision

Keep the compact layout, expansion control and optional usage notes. The observable reduction in unused editor space supports the requested layout change. The preserved inputs, labels and execution behaviour support continuity with the existing teaching route.

This review used automated Chromium and visual inspection, not physical phones, screen readers or a novice study. It does not establish a measured learning benefit or complete accessibility. The main process owns the full test suite, independent technical review and production deployment checks.
