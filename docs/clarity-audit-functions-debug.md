# Functions, products and debugging clarity audit

Copyright © 2026 Christopher Snow

## Scope and evidence

Read-only audit of all eight lessons in `content/products-functions.json` and all four lessons in `content/debugging.json`, on the `review/learner-clarity` branch. Canonical content was not edited in this pass. The audit follows `docs/clarity-review-brief.md`, `docs/course-authoring.md`, the imported Assembly Lab authoring/style rules and its learning-design skill.

For each of the twelve IDs below, this pass read every title, summary, objective, `before` paragraph, starter instruction/comment, observed/result register, prediction prompt/hint/reading, explanation paragraph, experiment task/hint, exercise task/starter/reference/hint, case name/input/output contract, memory label, C comparison and source/provenance field. Internal provenance was checked for context; it is not treated as visible lesson copy. Clear wording was retained. The findings below locate changes that improve an actual action, comparison or observation rather than merely vary the prose.

The learning outcome throughout this group is to trace the given mechanism on actual inputs, change a named instruction or operand, run or pause the resulting program, and explain the observed register/memory difference. The ordinary route is explanation and worked example, a supported changed example, then an optional independent exercise. No new instruction sequence or assessment is needed to resolve the copy findings.

Checked implementation sources: `site/course/workbench-markup.js`, `workbench-controller.js`, `debugger.js`, `model.js`, `tools/course-data.js`, `tools/course-runner.js` and current lesson generation in `tools/build-course.js`. Instruction semantics were checked against the locally downloaded official M-extension and psABI text in `/tmp/riscv-audit-m.txt` and `/tmp/riscv-audit-abi.txt`; these confirm low/high multiplication, signed division/remainder edge cases and preserved-register conventions. Existing GNU/xv6 execution establishes the program-specific observations below.

### Execution evidence

`/tmp/clarity-functions-execution.log` records 35 completed GNU assembler/linker plus actual xv6-emulator state-report runs: all twelve original starters and twenty-three edited variants. No completed-state attempt in that set failed. This is focused evidence, not a claim to have rerun the whole course corpus or all exercise cases. `/tmp/clarity-functions-experiments.json` contains the twelve originals and twenty-five edited variants, with the two deliberately broken programs explicitly labelled.

Two initial deliberate-failure attempts used a forty-chunk budget, which stopped during boot and therefore supplied no evidence about the user program. Those inconclusive attempts remain in the log. A separate rerun with the normal execution budget established that removing recursive progress produces an xv6 store fault and no completed report; removing the outer return-address save/restore did not complete before the execution budget. These are expected failure mechanisms, not numerical exercise outcomes. A further actual browser check paused the broken return-address example at its outer `ret`, stepped it from source line nine back to source line seven inside the same function, then successfully used Stop. This directly verifies the proposed bounded observation route.

The changed comparisons that completed were:

- `products`: changed factors with `mul` and then `mulw`.
- `high-products`: both factors all ones, then changing only the unsigned high operation to mixed signed/unsigned.
- `division-remainders`: unsigned quotient and remainder with unchanged loaded bits.
- `safe-scaling`: scale first and divide first with fuel one/distance three, plus `mulw` with the original large fuel.
- `calls-and-returns`: argument eighty-five/reserve five, adding after and before the helper.
- `stack-frames`: saved value 258 with a deliberately zeroed second slot; load offset zero and offset eight.
- `recursive-progress`: progressing brightness eight.
- `debug-loop-boundary`: faulty loop with a changed out-of-range byte; corrected loop with and without that change.
- `debug-load-width`: unsigned original byte, then both signed/unsigned loads with an explicitly stored top-bit-clear byte.
- `debug-memory-boundary`: offsets one/three through both unchecked and guarded examples.

### Browser evidence

Current generated pages for `stack-frames` and `debug-return-address` were opened in Chromium at 390 and 1440 pixels, in light and dark themes, for eight render states. The requested theme was actually applied; the editable CodeMirror surface, Memory and Output tabs and the nested Inspect the stack disclosure were present, with no page-wide horizontal overflow. `/tmp/clarity-functions-browser.log` records these observations. The deliberately broken return-address browser route above was separately exercised at phone width; `/tmp/clarity-functions-paused-browser.log` records the observed source-line transition and the Stop action.

These were representative route checks. They are not a full keyboard/screen-reader audit, a novice study, a claim that all proposed text was already rendered, or final independent verification of the integration edits.

## Reviewed IDs and retained strengths

| ID | Outcome and preparation checked | Retained clear material |
| --- | --- | --- |
| `products` | Explain the low product and preserve inputs for scaled accumulation. Earlier lessons teach hexadecimal, 64-bit registers, wrapping and W-operation sign extension. | Product definition, exact `mul` destination/source roles, discarded high bits and signed-C qualification. |
| `high-products` | Select the high product from each operand's interpretation. Builds on `products` and signed/unsigned readings. | Exact bit ranges, all-ones interpretation, preserving both factors and the mixed operand-role explanation. |
| `division-remainders` | Trace quotient/remainder and distinguish ISA edge results from C. Builds on signed reading and arithmetic bounds. | Dividend/divisor/quotient/remainder definitions precede use; rounding and remainder sign are explicit. Edge rules and exercise contract agree. |
| `safe-scaling` | Choose arithmetic order and width, with an explicit zero-distance rule. Builds on multiplication/division. | Units, 32-bit zero-extended input bounds, the 64-bit intermediate requirement and distinction between application policy and ISA divide-by-zero. |
| `calls-and-returns` | Follow argument/result and return destinations separately. Simple C functions are a declared prerequisite; assembly labels/jumps were practised earlier. | Caller/callee/argument definitions, calling-convention agreement, exact `call`/`ret` roles, jump past helper bodies and pseudo-instruction qualification. |
| `preserving-return-address` | Preserve the incoming return destination across a nested call. Builds on the preceding helper. | Stack direction, frame reservation, sixteen-byte alignment, `sd`/`ld` offsets and balanced release. |
| `stack-frames` | Distinguish a saved memory value from a working register; preserve the caller's `s0` across a nested call. | Caller-saved/callee-preserved definitions, deliberate active-frame stopping point, little-endian byte view and final-versus-active exercise distinction. |
| `recursive-progress` | Trace base case, shrinking argument and pending additions in separate frames. Builds on nested calls and frame slots. | Recursion/base-case definitions precede code, the saved brightness and `ra` have distinct roles, and termination is tied to decreasing unsigned bits. |
| `debug-loop-boundary` | Locate the first invalid iteration before a repeated load. Arrays/bounds and byte loads were taught earlier. | Defines breakpoint/watch and off-by-one, names count/index/address registers and explains pause-before-load timing. |
| `debug-load-width` | Locate unwanted extension between a memory byte and its multiplication. Signed/unsigned loads and multiplication were practised earlier. | Distinguishes the low memory byte, upper register bits and display interpretation; exercise boundary cases discriminate `lb` from `lbu`. |
| `debug-return-address` | Compare an active frame's saved slot with live `ra` across a nested call. Builds on nested-return/frame lessons. | Working versus broken code is identified, stack bytes are not called a reconstructed call chain, and restoration must precede release. |
| `debug-memory-boundary` | Reject an offset before loading and distinguish readable memory from logical membership. Builds on array bounds; page/protection/fault are defined locally. | Requested range and offset are explicit, equality is outside, and missing state after a fault is not treated as an arithmetic result. |

The copy proposals preserve all starter code, exercise programs/cases, expected results, C comparisons and official references. Optional exercises add independent input/boundary evidence. The debug-return lesson is related to the earlier nested-call lesson but has a distinct job: inspect the actual saved address and current `ra` at two pauses. It is not a duplicate merely because it uses the same mechanism.

## Accepted findings and proposed corrections

The precise replacement strings are in `/tmp/clarity-functions-proposals.json` as `{id, field, value}`. Array paths use dot indices, such as `before.2`.

### P2: operation-order experiment does not identify the necessary operand changes

Location: `safe-scaling.experiment.task`.

Original: “Load fuel 1 and distance 3. Compare multiply-then-divide with divide-then-multiply.” This does not name the loads or show how to retain the scale. Simply reversing the existing final instructions divides the scale in `t2` and then multiplies by fuel; that is not the intended fuel-first quotient.

Proposed task names `li t0, 1`, `li t1, 3` and retained `li t2, 100`, then gives the divide-first pair `divu t3, t0, t1` / `mul t2, t3, t2`. It identifies `Registers → t2` after completion. The second comparison explicitly restores the original source before changing only `mul` to `mulw`, so arithmetic order and arithmetic width are tested separately. The edited inputs belong in source, not the read-only supplied-input display.

Verification: original reports a complete consumption result; both small-input orders and the original-large-input W operation assemble and complete on xv6. The two small-input orders differ, and the W operation differs from the original 64-bit intermediate. Retain the existing experiment hint, which accurately distinguishes early fraction loss from high-bit loss.

### P2: “move the check” refers to a check absent from the example

Locations: `debug-memory-boundary.experiment.task`, `.experiment.hint`.

The example contains only address setup and a load. The existing instruction “Then move the check before the load” can refer only to the optional exercise starter, creating an unannounced source/mode switch. The supplied inputs are also read-only.

Proposed task keeps the example selected, changes the offset with a named `li`, and introduces the guarded sequence explicitly: initialise the rejection result, branch before `la`/`add`/`lbu`, and put the end label after the load. It names `Registers → t2` after completion. The hint states that Starting inputs records the supplied state before the inserted `li` executes. The protected-boundary exercise remains a separate later action.

Verification: unchecked offsets one and three both complete because both bytes are mapped. Guarded offset one still loads, while offset three leaves the rejection value and skips even the address calculation. Both guarded sources execute through a full report on xv6.

### P2: frame-offset comparison lacks a controlled second slot

Location: `stack-frames.experiment.task`.

Original: “Change the value saved into the active frame… Then load from offset 8 instead of offset 0”. This neither identifies which `li` is saved nor says that only `ld` must change. Offset eight has not been deliberately assigned a comparison value, so an observed difference has an unexplained origin.

Proposed task changes `li s0, 73` to a two-byte value, requests Memory offsets zero/one, explicitly zeroes the second slot, and changes only `ld t1, 0(sp)` to `ld t1, 8(sp)`. It compares `Registers → t1` after each completed run. This adds one purposeful source instruction, not a new helper or mode.

Verification: the two controlled variants complete; the first reloads the saved value, the second reloads the separately stored zero. The frame reservation stays sixty-four bytes and neither version writes outside it. No claim is made that an uninitialised slot was guaranteed zero.

### P2: deliberate broken returns need an observable stopping route

Location: `preserving-return-address.experiment.task`.

Removing the save and restore is technically executable, but “Run… use Stop if it does not finish” can leave the learner with no intermediate register evidence of which return was wrong. The proposed route removes exactly `sd ra, 8(sp)` and `ld ra, 8(sp)`, marks the outer `ret`, uses Start debugging, inspects `ra`, steps the return once, then stops and restores the lines.

Verification: the normal-budget full run did not complete. The actual phone browser paused at the outer return on modified source line nine; one Step instruction resumed at source line seven inside the same function, and Stop ended the run. The existing hint about the nested call's replacement `ra` remains useful.

### P2: ambiguous input and result instructions weaken otherwise valid comparisons

Locations: `products.experiment.task`, `high-products.experiment.task`, `division-remainders.experiment.task`, `calls-and-returns.experiment.task`.

All four existing experiments are feasible in the editor, but use generic “load”, “set inputs”, “replace it” or “compare the result” language. The proposals identify the actual instructions/registers and the Registers view, hold inputs fixed between paired operations, and say when to inspect the completed result.

- Products changes the two named `li` instructions and only the product mnemonic; the concrete comparison is the same factors at 64- versus 32-bit product width.
- High products changes only the second load to make both inputs all ones, compares all three result registers, then changes the single high-product instruction. The common `mul` stays in place.
- Division changes the named quotient/remainder instructions while keeping both loads; hexadecimal `t2`/`t3` exposes the ISA interpretation difference.
- Calls supplies an odd argument and a changed reserve, then keeps both fixed while moving the same caller `addi` across the call. This isolates operation order from changed data.

Verification: all eight edited variants assemble and produce complete xv6 reports. The return-order variant has distinct final `a0` readings while the helper itself is unchanged. Retain all definitions, mathematical qualifications, exercise tasks and hints in these lessons.

### P2: loop experiment compresses a four-run comparison into an ambiguous instruction

Location: `debug-loop-boundary.experiment.task`.

Original asks to run the faulty loop, repair it, and “compare both versions with that store removed”. The intended dependence test is strongest when each loop is run with and without the changed byte. The proposal makes those four conditions explicit and names final `a0` in Registers. It retains the actual source stores and the reminder that data cells are read-only.

Verification: the original faulty loop and faulty edited-byte loop have different totals. Both corrected versions have the same total and count, showing that the byte outside the requested range no longer contributes.

### P2: required inspection routes should name current tabs

Locations: `debug-load-width.before.1`, `.experiment.task`; `debug-return-address.before.1`, `.experiment.task`; `debug-memory-boundary.before.2`, `.experiment.hint`; `recursive-progress.experiment.task`.

Proposals name Memory for the byte view, Output → xv6 serial log for guest faults, and Debugger → Inspect the stack for the saved return slot. The return-address experiment marks both exact source instructions, uses Start debugging then Continue, and identifies slot offset eight and the unchanged active `sp`. The byte-width experiment names the complete load instruction, keeps the actual store edit, and preserves the instruction to mark `mul` again after source edits clear breakpoints.

Verification: current lesson markup and eight actual render states confirm those controls and their containment. The existing source-edit clearing rule is implemented in the workbench, not a teaching fiction. The width variants complete and discriminate the top-bit-set input while agreeing on the explicitly stored top-bit-clear byte.

### P3: final-state qualifications need to name the execution mode

Locations: `preserving-return-address.before.3`, `recursive-progress.before.3`.

“The snapshot is after both functions return” is accurate after completed Build & Run, but the current workbench can also show paused intermediate state. The proposals tie final values to **Build & Run after completion**, identify Registers, and retain the warning against treating one final view as every intermediate frame.

### P3: the editor does not execute instructions

Location: `products.before.2` and `recursive-progress.before.3`.

“The editor loads…” is imprecise. The proposals say the `li` instructions load the inputs, preserving the difference between editing source and executing it. Retain the existing prediction targets and no-answer-before-run boundary.

### P3: references to “the challenge” do not match the current optional entry

Locations: prose in `products`, `high-products`, `safe-scaling`, `preserving-return-address`, `stack-frames` and `debug-return-address`.

The actual entry is **Optional exercise**, followed by **Load exercise**. The proposed replacements use “the optional exercise” at these prose references. Exercise code, cases and the internal `challenge` data key stay unchanged. This is route naming, not a request to duplicate the exercise task in the main prose.

## Rejected and retained items

- **Rejected: move the lesson stack instructions to a separate Stack tab.** An early source suspicion confused Playground's `standalone: true` route with lesson markup. Current lessons call `workbenchMarkup` with `standalone: false`; their Inspect the stack disclosure is inside Debugger. All eight browser observations confirmed this. The proposal clarifies the existing route instead of inventing a lesson Stack tab.
- **Retained: the paired division results and C qualifications.** The M-extension's divide-by-zero and signed-minimum/-one results match the current exercise cases. They are not C guarantees. No semantic correction is needed.
- **Retained: deliberate active versus completed frame examples.** `stack-frames` intentionally leaves a frame active, while its optional exercise returns and restores `sp`. The prose identifies this distinction; combining them would remove a useful comparison.
- **Retained: debug-return as a separate investigation.** It teaches observed addresses/slots across two pauses. Its scope differs from the earlier nested-call arithmetic and saved-register construction exercises.
- **Retained: mixed high-product operand order.** The current explanation correctly says `mulhsu` treats the first source as signed and the second as unsigned.
- **Retained: guarded-memory failure explanation.** A protected access has no completed report; its fault is evidence in Output's serial log. Numerical comparison must use the later completed guarded version.
- **No new vocabulary activity.** “Invocation” can be simplified to “call” during routine editing, but it does not justify another section. `beqz` appears in the revealed safe-scaling reference before its explicit equivalence is given in recursion; learners can solve the exercise using the already-taught `beq` with `zero`, so this is a minor reference-reading issue rather than a blocked essential task. If the reference is retained, a brief local equivalence is sufficient; no new worked example is needed.

## Decision and remaining work

Keep the twelve lesson mechanisms, existing code/examples/cases and their useful definitions. Apply the concrete source edits, labelled inspection routes and mode-specific observation timing above. The initial factual run establishes feasibility of the proposals; integration must still check the rendered final wording, exercise-mode draft preservation and prediction feedback for valid edited examples. Independent technical review of applied corrections remains separate from this audit. No beginner study or complete assistive-technology evaluation was performed.
