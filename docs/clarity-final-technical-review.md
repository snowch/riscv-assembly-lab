# Final clarity technical review

Copyright © 2026 Christopher Snow

Independent technical review on 17 November 2026 for `review/learner-clarity`. The reviewer used an independent Codex agent with the inherited model and effort, did not draft the reviewed copy, and made no implementation or canonical-content edits. No unresolved blocking technical finding remains after the final C hint and size-measurement follow-up.

## Coverage and method

Read `docs/clarity-review-brief.md`, `docs/course-authoring.md`, and all five audit records: `clarity-audit-state.md`, `clarity-audit-control.md`, `clarity-audit-functions-debug.md`, `clarity-audit-c-xv6.md` and `clarity-audit-ui-copy.md`. Applied the imported authoring, style, independent-review and learning-design instructions already read in this review session. Assembly Lab was read only.

Reviewed every changed canonical sentence against the original JSON diff, each affected starter and its supplied inputs/data, the shared controller, generated markup and current controls. Checked the actual operation, source/destination order, width, signedness, observation moment, editable source versus supplied setup, and available output route. The five canonical lesson files contain all 58 lessons:

| File | Lessons covered by the independent content audit and final change review |
| --- | ---: |
| `state-arithmetic.json` | 17 |
| `control-memory.json` | 15 |
| `products-functions.json` | 8 |
| `debugging.json` | 4 |
| `c-xv6-appendices.json` | 14 |

The final technical pass reviews the integrated changes; it does not claim a second sentence-by-sentence rereading of every unchanged teaching field. The separate content audits document that wider coverage. An independent structural comparison confirmed that starter source, reference solutions, fixture inputs, data, observed/result registers and expected exercise results are unchanged. The one changed case name identifies the inspection-area limit without claiming a mapped-page boundary. Four lessons' neutral memory labels remain accurate after their requested source writes and selected cases.

## Source and semantic findings

No blocking accuracy or actionability finding was found in the reviewed changes.

The source edits now identify existing instructions and operands rather than asking the reader to change read-only Starting inputs or Memory cells. C argument experiments assign parameters inside `lesson`; this does not change the supplied caller's starting values. The unsigned subtraction and carry comparisons retain unsigned types, so no signed-C-overflow result is invented. The equality experiment uses equal local values and correctly asks whether the returned value alone establishes which path ran.

Memory activities keep width and addressing together. The wider-store comparison changes both read/write offsets to two before using `sh`. The array experiment changes the shift immediate rather than deleting a destination-producing instruction. The stride experiment restores count four before changing the increment to eight; the later loads remain inside the supplied 64-byte region. The moved-terminator experiment uses actual stores, preserves Before as prepared data and observes After as executed memory. The load-width comparison uses an existing supplied byte at offset two, not a nonexistent setup editor.

Deliberately broken countdown, sentinel and return-path activities provide stepping and Stop routes. They do not require a completed result from a path that cannot practically finish. The recursion experiment explicitly allows Stop or a guest fault and names the serial-log route. Guarded-memory instructions distinguish a mapped byte outside the logical range from a protected access, and place rejection before the load. A blank or missing snapshot is never described as a numeric result.

The high-product text retains operand interpretation and common low-product distinctions. The mixed high multiplication keeps its first source signed and second source unsigned. W operations remain 32-bit results sign-extended to 64 bits. The floating-point activity changes the loaded integer copy, leaves supplied memory unchanged and makes no floating-point execution claim. RISC-V carry/range checks remain explicit program results, without architectural condition flags.

Shared feedback uses the completed actual register snapshot and the lesson's selected prediction reading. A mismatch reports that this run completed and names its observed value; it does not diagnose an operand error or compare against a hard-coded original-example answer. Empty predictions report the observation and give a next-run action. Error, Stop and no-snapshot paths end the pending checking message. Complete programs retain their separate last-pause versus exit-state contract.

The calculator keeps visible narrowing/widening consequences before the action, removes the duplicate optional paragraph and retains entry rejection, zero padding, signed reading and shift-count qualifications. The disabled Continue/Stop controls are visually hidden while keeping their layout boxes; usable paused controls remain visible.

## Independent execution and browser evidence

Used Chromium and the real browser GNU/TinyCC plus xv6 CPU path at `http://127.0.0.1:4220`. These are selected final checks, separate from the parent's full unit, original-example, exercise-corpus and browser suites.

`/tmp/independent-clarity-final-functional.mjs` completed with exit 0 and wrote `/tmp/independent-clarity-final-functional.json`. It checked:

- Original addition with prediction 12; edited loads 19/23 with prediction 42; the edited run with stale prediction 12; and a blank prediction. Matching runs match, the stale prediction reports actual t2 = 42 without blaming operand order (the final early-lesson display label is covered below), and the blank prediction reports the actual observation.
- A genuine invalid-instruction build error produces Error, routes to Diagnostics and ends the pending prediction. Diagnostics says “Build and execution messages”.
- Explicit early exit produces No snapshot and blank register cards, rather than Error or a numeric prediction result. Stop produces Stopped and ends the pending prediction.
- Both C equality comparisons after `a = b;` return 20. That verifies the proposed edit while preserving the distinction between return value and executed path.
- The local unsigned C subtraction returns the all-one pattern, with actual unsigned mismatch feedback. Starting inputs still shows the caller's prepared arguments.
- The aligned byte-store baseline produces After bytes `aa bb 34 dd ee`; replacing `sb` with `sh` produces `aa bb 34 12 ee`. Before stays `aa bb cc dd ee`. The extra byte, transfer width and preparation/execution distinction are observable.
- The four-byte write returns 4, shows `trip` under Program output and remains present separately in the serial log.
- The invalid-address load produces No snapshot, “Prediction not checked” and actual `usertrap` evidence under Output → xv6 serial log.
- The deliberately broken zero-tick countdown is stepped until `t1` wraps to `0xffffffffffffffff`, then Stop ends it. This tests the new observation route without waiting for its loop to finish.
- An edited lesson draft survives reload, Restore starter and Undo restore. Independent project source and committed Starting setup survive reload.

An initial version of this probe script reused a previous Finished badge as its completion wait, then timed out while the next run was still checking. That script exited 1. It was corrected to wait for the run control to become enabled after the fresh execution; the complete script was rerun successfully. The initial timing error is not evidence of an execution or prediction bug.

`/tmp/independent-clarity-final-ui.mjs` exited 0 for six fresh viewport/theme combinations: 390×844, 950×1000 and 1440×1000, each light and dark. It checked actual theme selection, no page horizontal overflow, keyboard arrow navigation through inspection tabs, the Diagnostics heading, calculator input descriptions, visible width warnings, signed short-pattern zero padding, oversized-entry rejection without changing width, four optional help paragraphs, Escape focus return and Playground Code/Program/Inspect navigation. Inspected representative phone-light, tablet-dark and desktop-light screenshots at `/tmp/clarity-technical-calculator-<width>-<theme>.png`; the remaining combinations have loaded-control and geometry evidence rather than a full visual reading.

`/tmp/independent-clarity-final-actions.mjs` exited 0 in a fresh phone touch context. Continue/Stop are hidden at Ready with their boxes reserved, visible and enabled at an actual Paused observation, and hidden again after Stop. Stop works and its box width remains stable.

## Rejected proposals and retained distinctions

- Reject a historical compiler-listing comparison that implies the UI retains both builds. The final C-return task names the actual return-constant edit and Registers observation. It does not promise an unavailable previous listing.
- Reject calling the original misaligned wider-store edit an observed emulator fault. The audit's emulator ran it; the accepted aligned edit isolates width and follows the course's alignment guidance.
- Reject deleting array scaling as an unscaled-index comparison: deleting that instruction leaves its destination at its initial value. The accepted wrong-shift edit tests the intended address mechanism.
- Reject setup/data-edit directions that require controls unavailable in lessons. Use existing offsets or explicit taught source assignments/stores instead.
- Reject an invented lesson Stack tab. Lesson stack inspection is inside Debugger; Playground has its own Stack tab. The final wording preserves that difference.
- Reject adding another miniature or disclosure merely to retain surplus explanation. The removed four-bit drawing was not present; the live activity remains explicitly 64-bit. The removed narrow-call paragraph was not demonstrated by the size-measurement function and was not rejected as technically false.
- Retain separate carry versus signed-overflow, active versus returned stack-frame, current source versus last build, prepared input versus local assignment, and successful execution versus prediction mismatch distinctions. These are necessary qualifications rather than redundant warnings.

## Functional and learning limits

The evidence establishes that selected edits can be made, executed and observed through the named controls, and that the final changed instructions agree with source and execution semantics. It does not establish that a novice will independently notice the mechanism or transfer it to another task. No novice study, broad learning-effectiveness claim or complete accessibility audit is made.

Screen-reader output, physical devices and browsers other than Chromium were not tested. Full-suite results and deterministic generation belong to the parent integration record and must not be inferred from these focused checks. This review does not establish GitHub publishing or merge status. Any later change requires a recheck of the affected finding.


## Final C hint and measurement follow-up

Read all fourteen final `c-xv6-appendices.json` prediction hints after application, alongside each unchanged starter and prediction target. They now supply mechanism-specific reasoning rather than the repeated instruction to inspect the result. The hints correctly distinguish the returned Boolean from its local sum, byte counts from string termination, a loaded byte from its address, little-endian encoding from field extraction, the complement intermediate from the final negation, and unsigned carry from a signed interpretation. They do not insert the expected numerical answer.

The final C-return hint says to add the constant after forming the product, avoiding two meanings of “charge”. The ELF hint names the helper `advance`, avoiding the unrelated phrase “in advance”. The size lesson now explicitly permits a blank prediction for a first measurement, directs the unchanged expression through Build & Run to a0, and says register width does not establish C type sizes. Its exact target sizes remain in the later explanation. This closes the unsupported-guess concern without changing the optional prediction framework or adding another mode.

These final changes affect text only. Source inspection confirmed the reasoning against the existing executable instructions; no additional CPU rerun was required. The technical decision is to retain the integrated changes. Final generation, wider-suite outcomes and merge remain in the parent integration record.


## Final feedback wording and activity routing

Rechecked the final reading-label substitution in `workbench-controller.js`: hexadecimal predictions say hexadecimal; other predictions expose their signed/unsigned label only when that lesson enables signed readings, otherwise they say decimal. The underlying value conversion and numerical comparison remain unchanged. This aligns early feedback with the visible prediction label and avoids introducing signed terminology before its lesson. The earlier independent execution probe preceded this display-only correction; the final addition regression expects `42 (decimal)`. No additional CPU run was required for this source-only follow-up.

Rechecked the eighth shared feedback key, `finishedExercise`, and the final routing at completed snapshots. A curriculum selected-case run in activity `challenge` now names the selected exercise case, Registers and Check all cases. Ordinary lesson runs retain the Change it and run again route; independent projects retain code/Starting setup. These branches do not change captured state, prediction comparison or the separate complete-program completion path. The selected-case message accurately avoids presenting one completed case as an all-cases pass. Parent targeted regressions own the final runtime rerun of these narrow changes.

## Static Hello World supplement

The standalone `site/lessons/hello-world/index.html` is additional to the 58 generated lessons. Read its six final text substitutions, the supplemental drafting record in `clarity-audit-ui-copy.md`, `site/hello.s`, the current-source handoff and implemented limits. No source or runtime changes accompany this supplement.

The Complete program badge matches its `_start` and explicit exit. The first instruction is to run the unchanged source and inspect Console. The editable `.ascii` string exactly matches the provided starter; `\n` is explained before the task uses it. The sequence `"Hello, RISC-V!\n"` → `"Trip ready!\n"` → `"Trip\nready!\n"` is actionable and creates an observable two-line word split. `.equ message_length, . - message` computes the message's byte count, so leaving that line unchanged is correct. Stepping/debugging are routed to an actual complete-program copy in Playground; no unavailable same-page action or future-work claim remains. Existing source/executable/execution limits and console-input restriction agree with their implementation.

`/tmp/independent-clarity-hello-final-dom.mjs` exited 0 for 390/950/1440px in light and dark. It checked the rendered string notation and complete-program badge, actual theme, editable starter, exact second edit, no document overflow, hidden idle Stop with its box reserved, and the real new-tab handoff payload. In a phone context, the link opened a separate complete-program project with unchanged source and enabled Start stepping/Start debugging controls. Inspected representative phone-light, tablet-dark and desktop-light screenshots. The parent integration owns the original and exact edited Hello World CPU executions and existing Hello World tests; this reviewer did not duplicate them.

No unresolved technical blocker was found in these final supplements. The functional-versus-learning and accessibility limits above still apply.
