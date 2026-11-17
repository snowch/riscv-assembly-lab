# C, xv6 and appendix clarity audit

Copyright © 2026 Christopher Snow

Reviewed all 14 objects in `content/c-xv6-appendices.json` on `review/learner-clarity`, sentence by sentence. The pass covered titles, summaries, objectives, every before/explanation paragraph, prediction prompts and hints, experiment tasks and hints, starter/reference code, challenge contracts, hint order, case names/inputs/expected observations, memory labels and attribution fields. Canonical content was not edited. Proposed replacement fields and executable edited examples are separate drafting evidence for integration and independent technical review.

The review applied `docs/clarity-review-brief.md`, `docs/course-authoring.md`, and the imported Assembly Lab `CLAUDE.md`, `docs/authoring.md`, `docs/style.md` and `.agents/skills/learning-design/SKILL.md`. The observable outcome is to make an available edit, execute it, locate the relevant observation and explain the comparison. The prerequisites are simple C and small binary place values, plus the preceding course lessons. New controls, production hardening and additional execution modes are deferred.

## Checked interface and execution facts

- `site/course/workbench-controller.js` renders Starting inputs as text/code. Those lesson inputs are not editable controls. `site/course/model.js` and `builder.js` prepare them in supplied assembly before the C call or fragment. The learner edits the visible CodeMirror source. Local assignments to C parameters or an explicit `li` inside a fragment provide direct, testable edits without changing the fixture.
- `site/course/workbench-markup.js` names the relevant destinations: Inspect → Registers; Inspect → Output → Program output or xv6 serial log; and Inspect the real compiler output. The compiled listing belongs to the latest build. Record an earlier value or instruction before rebuilding if a comparison needs it.
- A C result is captured after `lesson` returns. A fragment result is captured after the fragment reaches the supplied capture code. A missing report after the deliberate bad load is an execution outcome, not a numeric answer. The current invalid-address run ends with “The process ended before producing a state report.”
- A project has Starting setup controls, but the proposals below avoid an unnecessary project detour. They state when local assignments replace the supplied values inside the call. Starting inputs must continue to describe the caller's prepared values.
- The earlier `memory-bytes`/`array-addresses` material introduces addresses, pointers and element scaling; `set-clear-toggle` introduces XOR; `compare-values` introduces Boolean results. The C section therefore need not redefine all of that material. The local `sizeof`, cast and undefined-behaviour explanations are necessary and mostly clear.
- The checked ABI text `/tmp/riscv-audit-abi.txt:181` confirms narrow integer argument widening. `/tmp/riscv-audit-rv64.txt` confirms RV64 W result sign extension. The existing arithmetic and environment qualifications are retained. No host C execution, invented compiler output, floating-point execution or performance measurement substitutes for the real toolchain/guest.

The misconceptions below are review hypotheses, not observed novice responses. Evidence of success is the reader identifying which state changed and which output supports the explanation. A completed run or a correct guess alone is insufficient.

## Findings and proposed corrections

### 1. `c-return-values`

Retain the title, compiler/linker explanation, unsigned call contract, result timing, reference and cases. The distinction between current compiler output and a universal implementation promise is useful.

**Low, `experiment.task`:** “compare the emitted instructions” does not identify the disclosure or preserve the old build for comparison. Proposed text names `charge + 7`, `charge + 11`, `a0` in Registers and Inspect the real compiler output. It first asks the reader to note the original return and the instruction adding the fixed charge. The actual listings contain `addi a0,a0,7` and `addi a0,a0,11`; the rest of that observed sequence is unchanged. Do not promise that every compiler emits that sequence.

Verification: run the unchanged source with prepared arguments 6 and 4; record `a0` and the instruction. Edit the return expression, rebuild, and compare the same fields after return. Actual guest observations were 31 and 35. These reviewer numbers do not belong before the prediction.

### 2. `c-decisions`

Retain the cap definition, signed ordering, path explanation and lower-bound exercise. The challenge cases cover negative, interior, above-cap and coincident-zero boundaries.

**High, `experiment.task` and `.hint`:** changing `>` to `>=` with prepared inputs 28 and 20 never exercises equality. Both original variants return 20, so that pair cannot support the equality inference requested. Add `a = b;` before `if` inside the visible function, then run the two comparisons. State that this changes local `a`, not the caller setup. Ask whether the returned value alone identifies the executed return statement; the existing hint currently supplies the outcome instead of guiding that distinction.

Verification: run original `>` and `>=` at 28,20; then run both versions with the local equality assignment. All four calls return 20. The condition and source path explain which return executes; identical output alone does not prove identical control flow. The first proposed equality edit also ran successfully through the actual browser editor and Build & Run control.

### 3. `c-loops`

Retain the test/body/update order, completed-return timing, zero-iteration explanation and bounded challenge. No new termination or optimisation claim is needed.

**Low, `experiment.task`:** the requested extra body executions are not directly counted by the final result cards. Name `i < a` → `i <= a`, then ask the reader to compare the final `a0` total with the original run. Use that total as evidence for the inferred extra iteration, with unchanged `b`.

Verification: original call 4,3 returns 12; the edited call returns 15. The generated listing and the existing loop-order explanation support the count reasoning. Neither result is a recorded intermediate loop value.

### 4. `c-memory`

Retain the element/byte distinction, defined signed starter inputs, unsigned exercise and warnings about uninitialised/out-of-bounds reads. The objective about unsigned arithmetic is met in the challenge; the signed example is not itself an unsigned example.

**Low, `experiment.task`:** identify the exact assignment `samples[2] = 2` → `samples[2] = -2`, then name Build & Run and `a0` after return. Keep the in-bounds constraint. The edit exists in the visible C source; no data/setup edit is required.

Verification: unchanged arguments 8,-3 give returns 7 and 3. No Memory tab is supplied for this C lesson, so do not ask the reader to inspect array bytes there. Retain the qualification that source subscripts do not guarantee individual machine loads.

### 5. `c-integer-widths`

Retain the `sizeof` definition, target qualification, cast/modulo explanation and unsigned-byte exercise.

**High, `before[1]`:** explicitly giving int=32 and long=64 before asking for `100*sizeof(int)+sizeof(long)` supplies the prediction's inputs and makes its supposed target measurement redundant. Keep the 64-bit result-register fact before the activity; move the exact LP64 type facts after execution into `explanation[0]`. The proposal still explains target dependence before the question and does not put the resulting size code into the introduction.

**Medium, `before[3]`:** the technically correct narrow-call ABI paragraph is not demonstrated by this function, whose arguments are unsigned long. It introduces a separate call-boundary mechanism while the activity measures sizes and practises byte conversion. Remove it from this local route; retain its verified fact wherever narrow calls are actually taught. Do not create another disclosure solely to retain surplus prose.

**Low, `experiment.task`:** `sizeof(void *)` adds pointer-type syntax without stating its purpose and “compile it” cannot observe the returned size code. Say it asks for a pointer's size, then run and inspect `a0`.

Verification: original and pointer-size variants both return 408 on the pinned compiler. Byte challenge source and all four cases were read; this pass did not rerun those challenge cases. The cast rule and widening order remain unchanged.

### 6. `c-overflow-contracts`

Retain the clear distinction between unsigned wrapping, machine addition and undefined signed C overflow. Keep the `0UL`/`~0UL` definition before the challenge and its unchanged saturating-increment contract.

**High, `experiment.task`:** “use a = 0, b = 1 in a fresh call” has no lesson input-edit control. Proposed task adds `a = 0;` and `b = 1;` inside `lesson`, replaces the return with `return a - b;`, and names the hexadecimal `a0` reading in Registers. It explicitly identifies the local replacement of supplied arguments.

Verification: original supplied maximum,2 addition returns 1. The proposed local subtraction returns all-one 64-bit bits using defined unsigned arithmetic. The caller's Starting inputs text remains accurate for the original arguments even though local assignments subsequently replace them.

### 7. `checked-addition`

Retain the Boolean definition, carry relationship, separate result/check contract, signed-C caveat and saturating-sum cases.

**High, `experiment.task` and `.hint`:** “Change the starting second argument” refers to read-only prepared state. “Then try a pair” neither gives a place to edit nor a concrete comparison. Proposed first run inserts `b = 0;` before `sum`; the second replaces it with `a = 0x7fffffffffffffffUL; b = 1;`. The task identifies `a0` as the returned Boolean, not the local sum, and the hint explains that these are local argument changes.

Verification: original maximum+1 check returns 1. The zero-second-argument run and top-bit-without-carry run both return 0. The latter checks the distinction the hint names. Do not imply that a sum card is available: this function returns only the Boolean.

### 8. `system-calls`

Retain the explicit byte count, zero-byte distinction, xv6-only call convention, copied return timing and challenge range. The starter's `li a2, 5` is directly editable.

**Medium, `before[0]`:** “file descriptor” appears later without naming it when `a0` is introduced. Define it locally as a number naming an open file. This is an operating-system term, not part of the simple-C prerequisite.

**Medium, `explanation[2]` and `experiment.task`:** name Inspect → Output → Program output for message bytes, and xv6 serial log for the full report. Identify `li a2, 5` → `li a2, 4`, the captured count in `t2`, and the post-run moment. This avoids sending the reader to an assumed output area or treating the supplied report as message bytes.

Verification: original captured count is 5; edited count is 4. Only the request length changes. The omitted byte is the newline, as the supplied data and existing hint state. The code and setup remain valid xv6 requests, not Linux syscall examples.

### 9. `elf-entry`

Retain the object/linker/ELF explanation, entry-versus-return distinction, current-source/build distinction and helper-call exercise.

**Medium, `experiment`:** the requested jump removal is possible, but “use Stop if execution cannot reach a completed report” makes the reader wait for an undefined period and gives no observation route. Name `j entry_done` immediately after `call advance`, then use Start stepping and Step instruction to follow the helper's return, with Stop ending the repeated path. The hint points to the return address rather than merely saying that the body remains present.

Verification: original returns 14 and reaches capture. In the edited real guest, breakpoints revisit `advance` at the same address 65712 with `ra` also 65712 and `a0` successively 9,14,19. That directly confirms return-to-body repetition. An earlier reduced-budget full-run attempt ended during boot and is excluded as evidence of this loop. The stopped debugger route avoids requiring a completed report from a deliberately non-completing fragment.

### 10. `memory-protection`

Retain the important distinction between record bounds and mapped process memory, the correct equality rejection, and the safe starter.

**Medium, `explanation[0]` and `experiment.task`:** “Inspect the serial log” does not identify the available destination. The proposed text names Inspect → Output → xv6 serial log, the exact `la t0, lesson_data` → `li t0, -1` edit, and restoration afterwards. It asks whether the load faults before capture rather than treating a blank result as a returned value.

**Medium, `challenge.cases[4].name`:** “At the mapped data boundary” suggests an operating-system mapping boundary. The provided offset/capacity are both 64, which is the inspection-area limit; the mapped page can be larger. Proposed label: “At the inspection-area limit”. Do not change the case's input, expected result or guard-before-load contract.

Verification: original `t1` is 41 and `t2` is 42. The edited xv6 run emits `usertrap()` with scause 13 and fault address `0xffffffffffffffff`, producing no state report. The actual browser Output disclosure exposes that message. The cases were read; their current result assertions alone do not prove that a wrong implementation never attempted a load, so preserve that instruction-order requirement in independent technical review.

### 11. `trip-computer`

Retain the four-byte record map, mask semantics, count-before-read loop, leaf-helper explanation and varied cases. The supplied maximum count and in-range arithmetic are preconditions; do not invent general validation of arbitrary counts or arithmetic overflow.

**High, `experiment.task`:** “Change the record count from three to four” names a supplied `t0` value absent from the editable fragment. Insert `li t0, 4` before `la t3, lesson_data` and explicitly state that it replaces the prepared count inside this fragment. Keep data/mask/scale unchanged and inspect `a0` after the helper returns.

Verification: original count 3 yields 320; the source override count 4 yields 1310. Those observations establish that the extra record contributes under the existing mask. No edit to the read-only data listing is required.

### 12. `twos-complement`

Retain the sign-bit weighting, fixed-width complement/add derivation, C qualification and all boundary cases.

**Medium, `experiment.task` and `.hint`:** “the most-negative 64-bit pattern” does not give a source spelling. Name the two edits to `li t0, 5`: first `li t0, 0`, then `li t0, 0x8000000000000000`. Ask for comparison of `t0`/`t2` hexadecimal readings after each run so pattern equality is distinguishable from a signed decimal interpretation.

**Low, `explanation[2]`:** the hypothetical four-bit drawing is not present in this activity. Remove the paragraph instead of asking the reader to imagine an extra representation. This retains the two explanatory paragraphs about the actual 64-bit run and avoids another mode or miniature.

Verification: zero and the minimum pattern each remain unchanged after machine negation. The executed instructions are integer assembly; no overflowing signed C expression is introduced.

### 13. `riscv-and-arm`

Retain the cross-architecture qualifications, live RISC-V/illustrative Arm distinction, W-width warning and unsigned-maximum challenge. These paragraphs do not claim to execute Arm code.

**Medium, `experiment.task`:** “carry check still reports overflow” blurs unsigned carry with the course's separate signed-overflow concept. Name `li t0, -1` → `li t0, 255`, leave `add`/`sltu` unchanged, and ask for the unsigned carry result in `t3`. The existing eight-bit-versus-64-bit hint is useful and retained.

Verification: original returns `t3=1`; the edited addition stores `t2=256` and `t3=0`. This is evidence about a carry beyond 64 bits, not a claim that crossing a byte boundary or setting a sign bit is signed overflow.

### 14. `floating-point-bits`

Retain the integer-only execution limitation, normal/exceptional encoding distinction, widened-integer sign warning and negative-zero exercise. No floating-point arithmetic or rounding-mode claim is added.

**Medium, `before[0]` and `explanation[0]`:** “normal”, “exponent” and “bias” arrive before their meanings are useful. State the bit positions needed for extraction before the prediction; identify normal encodings by their non-endpoint exponent field. After observation, explain subtracting 127 and name that offset as the exponent bias. Keep exceptional encodings in the existing explanation rather than expanding the introduction into a second lesson.

**Medium, `experiment.task` and `.hint`:** “Change only the sign bit in the supplied encoding by using an integer bit operation” does not distinguish changing the loaded register from changing supplied memory. Insert `li t3, 0x80000000` and `xor t1, t1, t3` after `lwu`, before `srli`. State that it changes the loaded copy in `t1`, leaves Memory unchanged, and compare `t1` with extracted `t2` after Build & Run. XOR is already taught; no new operation is introduced.

Verification: original `t1=0x41180000`, edited `t1=0xc1180000`, and exponent `t2=130` in both. The source instructions and Memory bytes establish which representation changed. These numbers remain reviewer evidence rather than pre-run answers.

## Verification record and limits

The machine-readable proposals are `/tmp/clarity-c-xv6-proposals.json` with `{id, field, value}` records. All fields are top-level replacements except the explicitly targeted `challenge.cases[4].name`. The 17 edited-source records in `/tmp/clarity-c-xv6-experiments.json` provide `{id, source, note}`. These are staging artifacts; this report carries the substantive findings if the temporary files disappear.

`/tmp/clarity-c-xv6-check.mjs` used the repository's real GNU assembler/linker, pinned browser TinyCC, objdump and xv6 RISC-V runner. `/tmp/clarity-c-xv6-execution.json` records all 14 originals, the edited variants and the uncorrected comparison control: 32 attempts, including the excluded premature-budget attempt. All 14 originals produced complete state reports. All 15 intended completing proposed variants produced complete reports; the invalid-address variant produced the expected user trap without a report. The missing-jump variant was independently confirmed by the breakpoint route in `/tmp/clarity-c-xv6-selected.mjs` and `/tmp/clarity-c-xv6-elf-path.json`. No QEMU/native run or full challenge-suite rerun is claimed for this pass.

`/tmp/clarity-c-xv6-browser.mjs` and its JSON record contain selected DOM/action checks on `c-decisions`, `system-calls`, `memory-protection` and `floating-point-bits` at widths 1440 and 390, with both requested themes. They confirmed source editability, no Starting inputs editors, no whole-page horizontal overflow, a real edited equality run, and the actual invalid-address serial-log route. A separate computed-style spot check confirmed light background `rgb(245, 249, 248)` and dark background `rgb(16, 30, 28)`. These were selected functional checks, not a visual review of every lesson or a keyboard/assistive-technology audit. Tablet, full-screen and full saved-draft recovery coverage remain with integration.

Keep the accurate source/compiler/environment distinctions and the focused challenge contracts. Change the non-actionable argument experiments first, then the equality comparison and width-prediction leakage. The remaining proposals connect existing instructions to exact controls and observations. Independent learner/technical review of integrated wording is still required. This audit provides no novice-study evidence or claim of learning effectiveness.

## Supplemental prediction-hint draft

The final integration pass identified the unchanged generic prediction hint in all 14 lessons. `/tmp/clarity-c-hints-proposals.json` supplies 14 mechanism-specific replacements, each targeting `prediction.hint`. They direct reasoning about the existing expression, branch, loop, byte transfer or field extraction. They contain no computed answers and do not substitute post-run inspection for a reasoning hint. The code and prepared states are unchanged, so the execution evidence above still applies; these new hint strings need independent wording review.

Removing the known type sizes from the integer-width introduction also removes the facts needed to predict a compiler-specific size code. Simple C knowledge alone does not establish this target’s int or long size. `/tmp/clarity-c-width-measurement-proposals.json` therefore supplies two additional replacements: the prompt explicitly permits leaving the optional prediction blank and measuring first; `before[1]` directs Build & Run on the unchanged expression and identifies a0 in Registers as the measured size code. The activity retains the existing prediction control and introduces no new mode. Its hint distinguishes bytes from bits and warns that the result-register width does not establish C type sizes. The earlier measured result remains post-run reviewer evidence, not an input the learner must guess.
