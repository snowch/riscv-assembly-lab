# Workbench guide technical review

Copyright © 2026 Christopher Snow.

Reviewed independently on 15 November 2026 by `guide_technical_review`, which did not draft the guide or implement its generator, links or controller change. Read the source authoring/review instructions and inspected the actual guide and implementation before the author's brief.

## Source inspection

Read the canonical guide JSON, generator, explicit lesson loader, guide and editor styles, lesson controller, editor adapter, debugger and workspace handling. The guide's displayed program comes directly from addition's canonical starter. It contains no typed result and creates no separate execution environment. The guide JSON is outside the explicit lesson-file list, and the page has no lesson payload, source editor, completion checkbox or completion entries. The catalogue remains at 58 lessons.

The guide's register/console distinction matches the controller's register captures and removal of the supplied state-report frame from program output. Stepping pauses at the lesson code, and the next PC supplies the assembly execution highlight. Breakpoints select the first actual instruction for a source line. The C debugger uses real instruction addresses and does not invent source-line mappings. The first addition has no Memory tab, as the guide explicitly says.

Checked relative links and stylesheet/script prefixes for the guide's one-level route and the lessons' two-level routes. The complete-program listener is now scoped to its exact fragment link, so the newly added guide link cannot trigger it. Help links use a new tab with `noopener`. The CI generated-file check includes `site/using-the-workbench/`.

## Independent browser evidence

Used fresh Chromium contexts against `http://127.0.0.1:4246`, at 390 and 1440 pixels in both light and dark themes. Compared the rendered guide source exactly with the canonical starter, checked optional-page/count/progress invariants and valid local section targets, and followed the real addition-workbench link. No page overflow or uncaught page error occurred in these four completed scenarios.

In each scenario, selected the line beside the addition, started actual GNU/xv6 debugging and observed the pause before that instruction executed. The execution highlight identified the next source line. Opening help's guide link created a guide tab with no opener, preserved the original paused PC, source and state, and did not open the complete-program disclosure. After closing the guide, Continue completed the original run. Output contained the expected absence of user console text. Separately started stepping and confirmed the first instruction changed its destination before the next pause.

Also entered actual native fullscreen and followed the existing complete-program help link in each scenario. It still returned from the modal, focused the destination summary, made the source reachable in the viewport and preserved the paused state. This checks the shared handler after adding a second help link.

At 800 pixels, independently exercised actual visible editing, Ctrl+Z, Tab indentation, Escape-then-Tab focus escape, Find with rendered matches, Restore starter and Undo restore, separate Explore/Challenge drafts, source download contents and Expand editor. A real C build/debug pause displayed the no-source-mappings qualification and actual instruction-address choices, with no assembly-source breakpoint controls.

## Findings and closure

**P3, closed: developer check recipe omitted the guide.** README's claim to list the same checks as CI initially retained the old generated-file paths. The implementation added the guide directory to CI but not that recipe. Reported the inconsistency; independently confirmed README now includes `site/using-the-workbench/` as well.

**Saved-draft correction independently verified.** The learner reviewer identified that an existing addition draft could differ from the displayed example. After the guide gained the conditional Restore starter / Undo restore direction, repeated the route in four fresh phone/desktop and theme contexts with a deliberately different saved draft. Arrival preserved the saved draft; explicit Restore matched the guide's canonical source; Undo restore recovered the draft; completion data stayed unchanged. No automatic source reset was introduced.

No unresolved P1/P2 technical finding remains in the inspected guide and navigation scenarios.

## Limits

These are source and real browser/execution checks, not a full ISA audit, physical-device or screen-reader test, or a novice learning study. Did not independently run the complete browser suite or a separate deterministic rebuild; the main process owns those checks. The source-level CI and README generation commands were inspected, and the rendered example was compared with canonical data.
