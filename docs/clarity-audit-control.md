# Learner clarity audit: control flow and memory

Copyright © 2026 Christopher Snow

Reviewed independently on 17 November 2026 for `review/learner-clarity`. This reviewer read the assigned canonical content without editing it. This is a content/interaction audit, not a novice study. The integration pass must assess the proposals and obtain independent technical review of final wording.

## Scope and method

Read every field in all 15 lessons in `content/control-memory.json`: titles, summaries, objectives, before paragraphs, assembly/C examples, prediction prompts/hints, explanations, experiments, exercise tasks/starters/references/hints/case names, prepared input/data contracts and memory labels. Reviewed the current controller, workbench markup, memory renderer, source/setup distinction and execution runner. Applied `docs/clarity-review-brief.md`, `docs/course-authoring.md`, the imported source-course style/authoring instructions and learning-design skill.

The outcome used for the audit was concrete: the reader can find the editable operands, run the requested version, locate the relevant register or memory byte at the stated moment, and explain what the comparison isolates. The assessment distinguishes real source edits from read-only supplied setup and from changing the displayed reading.

No canonical lesson, source example, expected exercise value or shared product code was changed by this reviewer. Machine-readable proposals are in `/tmp/clarity-control-proposals.json` (`{id,field,value}`, 29 field edits). Source variants for execution checking are in `/tmp/clarity-control-experiments.json` (`{id,source,note}`, 39 records); notes distinguish original problematic instructions from suggested corrections. Dot-number field paths use zero-based array indices.

## Complete lesson coverage

| Lesson ID | Fields reviewed and verdict |
| --- | --- |
| `compare-values` | All fields. Signed comparison/strict equality boundary is defined, demonstrated and exercised correctly. Clarify which `li` operands to edit and inspect `t0` after the optional destination-alias experiment; remove unexplained Arm-flag comparison. |
| `signed-unsigned-comparison` | All fields. Same-bit comparison and its C/handwritten-assembly distinction are clear. Name both result registers and the exact first/second input edits. |
| `branch-paths` | All fields. Labels, taken/not-taken flow and branch forms prepare the exercise, including priority for empty fuel. Clarify input-versus-branch operand edits; remove the stale-condition-flag aside. |
| `choosing-maximum` | All fields. Copy/jump/fall-through purpose is sound. Clarify that the unsigned experiment must change `bge` to `bgeu`, and name the observed register. |
| `counting-up` | All fields. The exclusive-bound loop and zero-work exercise are coherent. Specify the exact moved initialisation and restore location; trim redundant “nonnegative unsigned”. |
| `counting-down` | All fields. Initial zero protection, unsigned wrapping and separate count/result are sound. Make the deliberately broken zero-count version a stepping-and-Stop observation, not a normal run-to-completion task. |
| `test-before-body` | All fields. Two independently reset visit counters isolate the test-position comparison. Name the edited `li` and compare both counters against the zero case. |
| `stopping-sentinel` | All fields. Sentinel is defined and the early exit has a mechanism-based justification. Name the input edits and inspect the deliberately broken version using stepping and Stop. |
| `memory-bytes` | All fields. Pointer/address versus byte value and `la` versus load are introduced before use. Name `lbu t2` and the Memory byte-inspection control in the experiment. |
| `loads-and-stores` | All fields. Width/direction/byte-order facts and exercise copy are coherent. Give a feasible source-byte edit using already-taught `sd`; say “zero” instead of “empty”; remove a static destination label that becomes false in the exercise. |
| `load-widths` | All fields. Sign/zero extension comparison and word-load exercise are sound. Replace the unavailable supplied-byte edit with editing both offsets to an existing byte; define halfword at the first width explanation. |
| `narrowing-stores` | All fields. Register-preservation versus stored-copy narrowing is clear and exercise checks neighbours. Keep the wider-store experiment aligned and fix static labels that would describe the wrong destination after the edit. |
| `array-addresses` | All fields. Index/byte-offset/pointer construction and valid-index exercise are sound. The literal scaling-deletion experiment does not perform the intended comparison; replace it with a precise aligned wrong-scale edit and correct the objective's scaled quantity. |
| `sum-array` | All fields. Stride/count/accumulator roles and entry bounds check are coherent. Restore the sample count before the stride experiment; use an aligned wrong stride and remove labels whose “requested” positions change with the count. |
| `zero-terminated-strings` | All fields. Termination/capacity/byte-versus-character explanation and bounded exercise are coherent. Define capacity explicitly, give actual source stores to change a terminator, distinguish Before/After, and remove static labels contradicted by the requested edit. |

Exercise case names, starter/reference relationships, register and memory preservation requirements were read across every assigned lesson. No incorrect expected bit pattern or impossible reference was found by this source audit. This is not a claim that this reviewer reran every exercise case; the integration/full corpus checks own that evidence.

## Accepted findings and precise correction routes

### C1 — P2: two experiments request edits unavailable in a lesson

**Locations:** `load-widths.experiment.task`; `zero-terminated-strings.experiment.task`.

“Try a first byte whose top bit is clear” and “Move the zero byte later, then remove every zero” refer to supplied data. The Memory view has observation buttons, not editable data fields. View complete program is read-only. The lesson has no Playground setup form. The current wording never says to add stores or take a different project route.

For `load-widths`, use data already present: change both load offsets from `0(t0)` to `2(t0)`, run and compare the full hexadecimal patterns of `t1` and `t2` in Registers, then restore both offsets. Both comparisons read the same address each time. The first-byte top-bit case and the zero byte at offset two provide the intended contrast without teaching a new store instruction early.

For `zero-terminated-strings`, supply an explicit edit after `la t1, lesson_data`: load 88 into `t3`, store it at `4(t1)`, and store zero at `5(t1)`. Run and inspect `t2`, then Memory → After. Delete only the zero store for the no-terminator-within-capacity comparison, and finally edit the capacity in `li t0, 6` to zero. `sb` has been taught by this point. Before stays the original setup; it does not change when the running program writes memory.

**Checked execution:** existing-offset comparison completed with both results zero; restoring offset zero produces different extended patterns. The terminator edits completed with counts five and six respectively, and capacity zero completed with count zero. These observations are verification evidence, not text to expose the prediction answer in advance.

### C2 — P2: deleting the array scaling instruction tests the wrong mechanism

**Locations:** `array-addresses.experiment.task`; `objectives[1]`.

The task says to “remove the scaling shift” and inspect what `lwu` reads for index one. The shift writes `t3`. Deleting it leaves `t3` at its supplied initial zero, so `add t3, t0, t3` selects the base regardless of `t1`. It does not turn the index into an unscaled byte offset. Actual execution confirmed the base address and first sample.

Use index one, change only shift amount two to three, and compare `t3` and `t2` against the sample offsets in Memory. This produces an aligned but incorrect eight-byte stride; restore shift two to recover the four-byte size. The proposed objective is “Calculate an element address from its index and size”: it is the index that is scaled, not an address.

**Original route:** delete the shift, run, see the unchanged base in `t3` and first sample in `t2`. **Corrected route:** edit the shift immediate, run, inspect the selected address/sample, restore. Both were executed. There is no need to ask the reader to infer an unmentioned `mv t3, t1` replacement.

### C3 — P2: the requested sequence can make the stride experiment do nothing

**Location:** `sum-array.experiment.task`.

The task asks for two samples, then zero samples, then a pointer-increment change. Following that sequence literally leaves the requested count at zero, so the changed increment is never reached. It cannot demonstrate overlapping or skipped byte groups.

Name `li t0, 4`, inspect `t2` after count changes, then explicitly restore count four before changing the stride. The proposed stride is eight rather than one, to keep the example naturally aligned while demonstrating skipped elements. Inspect `t1` and `t2`; restore stride four afterwards. The final two loads in the wrong-stride version reach zero-filled bytes beyond the four supplied samples but remain inside the 64-byte supplied region.

**Checked execution:** count-two, count-zero, original one-byte stride, and corrected eight-byte stride all completed. The wrong stride's different sum and final pointer are visible in the captured registers. The current emulator supports the misaligned one-byte-stride accesses; it would be incorrect to report that original edit as an observed execution fault.

### C4 — P2: observation labels become false during the requested activities

**Locations:** `loads-and-stores.memoryLabels`, `narrowing-stores.memoryLabels`, `sum-array.memoryLabels`, `zero-terminated-strings.memoryLabels`.

These labels are static, reused in Before/After and exercise fixtures. The copy destination remains labelled at offset eight when the exercise copies to offset sixteen. “Last requested sample” at offset twelve is false for the requested counts zero/two/eight. “Zero terminator” at offset four becomes false after the learner moves or removes it. A fixed “one-byte destination” at offset one conflicts with the aligned-width experiment at offset two.

The proposed minimal correction retains only “supplied data begins” at offset zero for these four lessons. The byte-offset controls and explanatory text already identify specific source/destination positions. This avoids pretending that a static label is computed from the edited program or selected fixture.

**Browser evidence:** the moved-terminator source produced Memory Before byte four `00` and After byte four `58`, while the visible After label still said “zero terminator”. The corrected source was retained after reload. No snapshot or saved-draft bug was inferred from the stale label.

### C5 — P2: a changed destination is still observed through the old Result card

**Location:** `compare-values.explanation[2]`.

“Try using one input as the destination” omits the resulting observation change. The highlighted Result card remains `t2`; changing the destination to `t0` does not retarget it. Name the exact replacement `slt t0, t0, t1` and direct the reader to inspect `t0`. The existing source registers are already in Registers, so no UI change is needed.

**Checked execution:** the new answer was written to `t0`; `t2` remained its initial zero. The source example/reference/exercise stay unchanged.

### C6 — P2: the unsigned maximum experiment does not name its required instruction edit

**Location:** `choosing-maximum.experiment.task`.

Deleting `j done` is a useful counterexample. “Restore it before trying unsigned inputs” does not say to change the signed branch as well. A top-bit-set pattern alone leaves the signed `bge` in use. Name `bge` → `bgeu`, the first loaded pattern and `t2` as the observed result. The explanation already supplies the conceptual reason.

**Checked execution:** deleting the jump exposed the unwanted second copy with the shown inputs. Restoring it and using `bgeu` with a top-bit-set first input selected that unsigned input. No full maximum solution is newly exposed before the optional exercise.

### C7 — P2: deliberately long-running examples need an observable stopping route

**Locations:** `counting-down.experiment.task`; `stopping-sentinel.experiment.task`.

These intentionally broken variants can consume an enormous work count. Build & Run clears the register observations while execution continues, so a reader cannot observe “after brightness stops changing” from its completed-result cards. Waiting for automatic execution limits also looks like an ordinary failure, rather than the intended counterexample.

Use Start stepping, inspect `t1` and `t2` after the relevant instructions, then Stop and restore the deleted guard. The repaired sentinel version can still use ordinary Build & Run first, because it finishes. The proposed wording does not ask the reader to wait for completion of the broken version.

**Checked execution:** actual-entry debugger stepping of the zero-count broken countdown observed the count wrap to all ones after the first decrement. Browser stepping independently showed the same state, and Stop returned the workbench to Stopped. For the broken sentinel, successive shifts left zero unchanged while the remaining count decreased. The restored versions' original examples completed.

### C8 — P3: the wider-store comparison conflicts with the alignment guidance

**Location:** `narrowing-stores.experiment.task`.

Replacing `sb` with `sh` literally retains address `1(t0)`, an odd address. The previous lesson tells the reader to use addresses aligned for the chosen width. This activity should isolate transfer width rather than add environment-dependent misalignment.

First change the store and read-back offsets to two and run a byte-store baseline. Then change only `sb` to `sh`, rerun and compare Memory → After. The low byte read back stays the same while the additional destination byte changes. Restore `sb` before the top-bit low-byte comparison. This keeps the write/read-back addresses together and introduces no new instruction.

**Checked execution:** both original odd-address `sh` and corrected aligned variants completed on this emulator. This is a consistency/portability correction, not a claim that the original version faults here.

### C9 — P3: the source-byte copy edit is underspecified

**Locations:** `loads-and-stores.experiment.task`; `before[2]`.

“Change one source byte ... through code” gives no instruction or location for that write. `sb` has not yet been introduced, but `sd` is introduced here. Insert a taught `li`/`sd` pair before the original load to write a complete pattern differing in one byte. Then compare corresponding offsets two and ten in Memory → Before/After. The proposal keeps all eight-byte transfers aligned.

The next region is “initially zero”, not “empty”: zero is an actual supplied byte pattern, not an absence of memory.

**Checked execution:** the suggested complete pattern altered source offset two and copied offset ten identically, leaving the other seven source/copy bytes unchanged. The final `t2` byte alone does not reveal that changed position, which is why the Memory observation is specified.

### C10 — P3: several valid experiments do not identify the exact edit and output

**Locations:** the remaining proposed `experiment.task` changes for comparisons, branch paths, counting up, test-before-body and memory bytes.

The existing exercises are executable and their mechanisms are sound. Keep that prose. Give the reader the register-load or instruction operand to edit, Build & Run as the action, the relevant Registers or Memory observation, and the purpose of the contrast. Distinguish changing `li` input values from swapping only the comparison's source operands. Name the exact initialisation move under `again:` and restore it before the zero-limit comparison.

The full proposed sentences are in the JSON handoff. These are directions for existing controls, not new modes or extra lesson sections. Every corresponding edited source was assembled and executed, except that intentionally nonterminating variants were inspected through actual-entry stepping instead of completion.

### C11 — P3: small vocabulary and objective corrections

**Locations:** `compare-values.before[2]`, `branch-paths.before[2]`, `choosing-maximum.objectives[1]`, `counting-down.explanation[0]`, `load-widths.explanation[1]`, `zero-terminated-strings.before[1]`, `counting-up.challenge.task`.

Unexplained Arm-style/stale/flag-setting comparisons do not help a first-time RISC-V reader perform these tasks. State the actual destination write or direct register comparison instead. Define halfword as sixteen bits where its load forms are introduced, and capacity as the number of bytes available from the starting pointer before using that limit. “Nonnegative unsigned” is redundant; keep the stated 0–8 limit.

No other prerequisite gap was found in the assigned changed activities. Earlier lessons define hexadecimal, signed readings, shifts and immediate operands; branch paths defines labels and jump/branch forms; memory bytes defines pointers/addressing; the later tasks use widths and stores introduced before them. This check is distinct from having observed a novice practise those prerequisites.

## Execution and browser evidence

`/tmp/clarity-control-execution.json` records 51 real GNU/xv6 probes: all 15 original examples and 36 variants. All original examples produced complete register/memory snapshots. Thirty-four variants completed; two deliberately broken probes were initially given an insufficient 50-chunk total budget and stopped during guest boot. Those two errors establish nothing about loop behaviour and were not treated as product failures.

`/tmp/clarity-control-corrected-execution.json` records eight complete corrected/aligned variants plus two valid deliberately broken observations: boot to the actual lesson-entry breakpoint, execute 12 machine instructions, inspect real registers and free the machine. The node execution path uses GNU as/ld/objdump and the same real xv6/WASM CPU. This reviewer did not additionally run QEMU's independent corpus; the integration pass can use the supplied variants for that check.

In Chromium at 390/800/1440 pixels, light/dark, checked zero-terminated strings' Memory/Before/After UI, absence of an editable setup form and keyboard inspection-tab navigation. All six states had no page overflow or uncaught page errors. An 800-pixel actual run verified the source-store terminator change, original Before versus mutated After, and draft persistence across reload. An actual broken countdown stepping session verified the wrap and usable Stop action. This was not a repeat of the entire browser suite or every exercise corpus.

## Retained prose and limits

The sequence and complete worked examples remain useful. Signed/unsigned ordering, branch rule priority, independent pre/post-test counters, sentinel justification, pointer/value distinction, transfer widths, sign extension, neighbouring stores, scaled addressing and bounded byte scans each have a distinct purpose. No broad rewrite, extra mini-lesson or repeated summary pane is proposed.

The audit confirms feasible edit/observe routes and specific wording problems. It does not prove learning effectiveness, complete accessibility or behaviour on physical RISC-V hardware. Integration should preserve prediction timing and saved example/exercise drafts, apply the smallest supported corrections, then independently review final edited prose and behaviour.
