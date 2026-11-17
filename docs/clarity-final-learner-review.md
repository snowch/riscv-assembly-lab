# Final independent learner review

Copyright © 2026 Christopher Snow

Reviewed 17 November 2026 against `docs/clarity-review-brief.md`, `docs/learner-clarity.md`, and the authoring/style/learning-design requirements imported by `docs/course-authoring.md`. I did not draft these changes. This is the independent integration review of the final wording and interface, following the separate content audits; it is not a novice learning study.

**Decision: accept. No remaining learner-facing blocker found in the reviewed changes.** The requested edits now identify editable source rather than suggesting changes to read-only prepared inputs, and the shared feedback distinguishes a completed experiment from an incorrect prediction and from an execution error.

## Learner pass

I read the meaningful old/new teaching-field changes across all 58 lessons in the five canonical files: state/arithmetic (17), control/memory (15), products/functions (8), debugging (4), and C/xv6/appendices (14). I checked surrounding source, setup, observations and prerequisites where a changed instruction depended on them, plus the final mechanism-specific C/xv6 prediction hints. This independently reviews the edits across the full course; it does not replace the other reviewers' sentence-by-sentence audits of every unchanged sentence.

The assumed learner knows simple C and small binary place values. The changes generally keep the route concrete: what is prepared, which source line to change, which control to use, which register or memory position to inspect, and when. The final wording avoids relying on ARM flags in the first RISC-V comparison lessons. Relevant definitions precede the changed activities, including `mulhsu`, byte/halfword widths, bounded memory, and the floating-point appendix's representation terms. Definitions explain operations without supplying the numerical prediction result.

Specific integration decisions checked independently:

| Location | Judgement and evidence | Direction |
| --- | --- | --- |
| Memory, C and debugging experiments | Accepted: source overrides are explicit. Supplied Starting inputs/Memory Before remain the prepared state. Actual assembly and C edits below confirmed the distinction. | Keep these source/setup labels. |
| `c-integer-widths` prompt and introduction | Accepted late correction: the first measurement may be run with a blank prediction. ABI-dependent sizes are explained after measurement rather than assumed as prior knowledge. Checked final source and rendered page. | No further wording required. |
| Fourteen C/xv6 prediction hints | Accepted: final hints point to each mechanism, replacing generic instructions to follow the path. They do not state the requested numerical answer. | Keep locally useful hints. |
| First-lesson prediction feedback | Accepted late correction: the shared label is **decimal** until `lesson.ui.signed` introduces signed/unsigned readings; hexadecimal remains explicit. Independently checked the final `checkPrediction()` source gate. | Do not introduce “signed” through feedback earlier. |
| Completed selected exercise case | Accepted final source correction: `activity === "challenge"` uses the distinct `finishedExercise` message, directing the learner from Registers to Check all cases. Ordinary examples and Playground projects retain their own next actions. Canonical/generated copy agree. This late dispatch correction was source-reviewed; the managing session owns its targeted browser regression. | Preserve the distinction between running one case and checking every case. |
| `c-decisions` equality experiment | Potential objection rejected: equal return values cannot reveal the chosen return statement, but the final question explicitly asks whether the return value alone distinguishes those paths. | Preserve that question; do not present it as proof of a path. |
| `c-return-values` comparison | Accepted removal of the proposed historical listing comparison: the UI retains one current build. The surviving return-constant edit has an actual Registers observation. | Avoid asking learners to compare unavailable builds. |
| `stopping-sentinel` experiment | Accepted: names the actual Start stepping and Stop controls instead of implying an unbounded run will complete. | Keep the explicit stop action. |
| Hidden idle Continue/Stop | Accepted: initial actions remain Build & Run, Start debugging and Start stepping. Continue/Stop appear when useful; hiding disabled controls preserves position. Actual keyboard/idle-state checks passed. | No additional modes or guidance needed. |

I challenged potentially ambiguous experiments against their actual source: the string terminator move changes editable stores; narrowing-store offsets remain aligned; safe-scaling separates early division loss from word-width truncation; the debugging memory guard is placed before the load. No new prerequisite blocker or unintended prediction answer disclosure was found in these edits. Optional exercise reference solutions remain deliberate learner-controlled reveals.

## Actual interface and functional evidence

Preview: `http://127.0.0.1:4220/`. Evidence and reproducible scripts are outside the repository at `/workspace/output/riscv-clarity-final-learner/`.

- **390, 834 and 1440 pixels, light and dark:** rendered workbench guide, Playground and calculator help; actual narrow Code/Program/Inspect controls; editable Playground setup; calculator result and width/processor distinction. No page-level horizontal overflow in these checks. `interface.json` records all six contexts, with screenshots. I inspected representative phone, tablet and lesson screenshots; tall element captures can include a sticky-toolbar stitching artefact and are not evidence of a live overlap.
- **Actual assembly execution, 1440 light and 390 dark:** the original addition returns 12; editing to 19 + 23 returns 42. A prediction of 12 produces “This run completed…” and a mismatch, while execution remains Finished. An invalid instruction produces Diagnostics and “Prediction not checked”; stopping a stepped run likewise does not check a pending prediction. Edited source survives reload. See `flows.json` and its script/screenshots.
- **Memory edit, 834 dark:** ran original and suggested `loads-and-stores` source. The inserted store changes the relevant copied byte from 102 to 153; Memory Before retains the supplied bytes. Restore/Undo, loading the optional exercise and returning to the example preserve the edited example draft, including after reload. See `edits.json`.
- **C edit, 390 light:** ran the original `c-overflow-contracts` example and an edited unsigned subtraction. The observed all-ones result follows the edited C, while supplied Starting inputs remain visible unchanged. Restore/Undo, exercise/example separation and reload preserve the edit. See `edits-c.json`.
- **Keyboard and final copy:** Find opens/closes; Escape then Tab leaves the editor without changing the draft. Narrow Playground view tabs respond to arrow keys and Home. Idle disabled Continue/Stop are hidden. The final type-size prompt permits first measurement without prediction and does not reveal the target sizes before running. See `final-keyboard.json`.
- **Playground persistence, 834 pixels:** edited source and applied Starting setup survive reload; opening and closing the calculator does not replace that source. Setup correctly normalises decimal 27 to the same hexadecimal bit pattern. See `project-save.json`.

The guide's automatic reporting/capture description matches the actual fragment setup. The calculator help distinguishes scratch width from RV64 execution and introduces its signed reading locally. Essential action and result controls are not placed inside new optional sections. Existing optional explanation/reference controls remain available.

The focused probes initially contained harness mistakes: waiting on an already-Finished badge instead of the new result, expecting prediction text to survive reload although only the source draft promises that, comparing differently normalised whitespace, assuming Assembly Lab's calculator button/copy names, and expecting applied Starting setup to retain decimal notation rather than its normalised equivalent. The final scripts use the actual RISC-V controls and completed outputs. Those corrected assumptions are not product findings or claims that prediction drafts persist across reload.

## Evidence boundaries

The managing session reports all 58 original examples, the reference-solution corpus, 35 units and 32 additional state experiments passing on the actual GNU/TinyCC/xv6 route. I did not duplicate those broad runs; the selected executions above are independent browser checks. The full browser suite was still running when this review was written, so this document does not claim its final result.

This review establishes wording consistency, executable selected actions, observation placement, error feedback and selected persistence/keyboard behaviour. It does not establish learning effectiveness, retention or transfer for novices. There was no novice study, screen-reader/assistive-technology session, physical phone test, complete accessibility audit, or independent execution of every proposed experiment. Remaining uncertainty is about those unmeasured outcomes, not a demonstrated unresolved defect in the reviewed changes.

## Static Hello World supplement

The separate `site/lessons/hello-world/index.html` page is outside the 58 generated lessons. I independently read its final source diff, actual `site/hello.s`, transfer-link binding and rendered DOM. **Accepted; no additional blocker found.** The initial action now runs the unchanged program and names Console. The first message edit identifies the exact `.ascii` quotation marks, defines `\n` before relying on it, and tells the learner to leave the assembler-computed `message_length` line unchanged. The second edit, `"Trip ready!\n"` to `"Trip\nready!\n"`, gives a visible two-line comparison rather than asking the learner to detect an inconspicuous trailing blank line. Complete program and Open a copy in Playground accurately describe the source boundary and independent copy; the help distinguishes this page's Run/Stop controls from Playground stepping/debugging.

Final DOM checks passed at 390, 834 and 1440 pixels in both themes: task text matches the loaded starter, the copy link remains keyboard-focusable with native new-tab attributes, idle Stop is hidden without removing its reserved position, and there is no page-width overflow. The inspected phone screenshot shows the exact task and focused copy link readable with optional explanations closed. See `hello-supplement.cjs`, `hello-supplement.json` and `hello-390-*.png` in the evidence directory. This supplement checks source and interface; the managing session separately owns the three actual unchanged/edited program runs and existing browser regression checks. The learning/assistive-technology limits above still apply.
