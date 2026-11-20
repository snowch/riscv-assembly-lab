# Independent technical review: RISC-V instruction reference

Copyright © 2026 Christopher Snow

Reviewer did not author the reference data, recordings generator or UI. Scope: content/reference/{arithmetic,control,notation}.json and tools/reference-recordings.js; real GNU/xv6 execution and independent QEMU traces. Prerequisites: simple C and small binary numbers; no assembly assumed. This technical review does not establish learning effectiveness.

## Sources and checks

- Official RISC-V ISA text `/tmp/riscv-audit-rv32.txt`, `rv64.txt`, `m.txt`: immediate and branch ranges; load/store widths and sign extension; RV64 W and LUI sign extension; signed/unsigned comparisons, multiply high variants, quotient/remainder and exceptional division results.
- The actual guest's `/workspace/xv6-lab/guest/kernel/syscall.h`: write is 16; exit is 2. The reference correctly treats these as xv6 conventions rather than architecture-defined syscall numbers.
- Course source scan: every assembly mnemonic in all original starters and exercise sources is covered. A separate scan of backtick notation in before/explanation/experiment/challenge prose found no additional instruction mnemonic omitted from the 54-entry reference. The prose scan also finds register names, C tokens and example labels; those are not missing instruction entries.
- The recorded-data generator executes the bundled GNU assembler/linker output in a real xv6 guest, samples registers and memory through CPU APIs, and compares exact before/after register values and next PC against an independent native QEMU instruction trace. The write example explicitly substitutes Linux's service number 64 only for the independent QEMU run and checks xv6's a7 value separately.
- The generator's memory comparison uses the final native reporter's bytes. The current memory examples have no memory-changing continuation after the focused instruction, so final memory equals immediate post-instruction memory. Do not generalise that shortcut to a future example that changes memory in its continuation.
- GNU errors, not undefined-symbol linker errors, are required for each claimed rejected-operand example.
- `.text`, `.global`/`.globl` and labels are correctly distinguished from executed instructions. `site/course/user.ld` uses `ENTRY(_start)`; exporting `reference_example` does not select the entry point.

## Findings

### T1, medium: load base preservation has an alias exception

Quote, repeated in lb/lbu/lh/lhu/lw/lwu/ld rules: “The base register keeps its value; the destination is overwritten.”

A valid load may use the same register as base and destination. The load reads the old base address, then writes the loaded result into that register. Real bundled GNU/xv6 check `la t0, lesson_data; ld t0, 0(t0)` with supplied byte 7 returned t0 = `0x0000000000000007`, rather than the old address.

Smallest correction: qualify preservation when base and destination differ; clarify that choosing zero as destination discards the loaded value. A general register-notation rule can carry the zero-register exception if it is visible before relying on destination semantics.

Status: closed. All seven load entries now qualify base preservation when base and destination differ, and explain writes to zero. Verified the built `lw` entry at 1280/390 pixels in actual light/dark themes; the corrected qualification was present in every case.

## Corpus and interface verification

The final generated corpus and the corrected interface were independently inspected as described below.

### T2, medium: distinguish the supplied capture at a control-flow boundary

The `j-skip` and `ret-prepared-address` examples target labels at the end of the learner fragment. Their actual next machine instruction is the supplied reporter's stack reservation, `addi sp,sp,-336`. Showing this next instruction without identifying the supplied capture would introduce unrelated stack instrumentation into a jump/return example.

Smallest correction: identify the boundary using the recorded next PC and the actual `_lab_lesson_end` symbol. Prefer the target label, and describe the next phase as supplied result capture. The raw next instruction can remain in complete-program/technical inspection. No invented execution state or altered teaching arithmetic is needed.

Status: closed. The generator records `nextSupplied` by comparing the actual next PC with the built report boundary. The UI keeps the actual target label and omits the unrelated supplied next instruction from this compact result. Verified `j-skip` and `ret-prepared-address` in the built page at 1280/390 pixels in light/dark themes: Next label showed `keep_reading` / `returned`, with no unqualified reporter stack instruction. Both fixture entries have `nextSupplied: true`. Raw complete program remains available.

Initial built technical inspection at desktop1280 in `/lessons/addition/`: switching to Course instructions and searching `lw` displayed the actual sign-extended register result and unchanged supplied data bytes. The scope filter correctly limited the initial lesson list, so a search for `lw` while retaining Used in this lesson had no entry; switching to Course instructions made it available. This is a lookup filter, not an assembler allow-list.

## Final corpus inspection

The final fixture contains 64 examples for 54 instruction names. `node --test tests/reference-recordings.test.js` passed 3/3. Independent native GNU assembler 2.44 accepted all 64 complete example sources and rejected all 54 common-mistake sources. Initial native invocation failed because the extracted binary could not locate its shared library; rerunning with its actual `/workspace/native-tools/usr/lib/x86_64-linux-gnu` library directory passed.

Inspected the recorded before/after states for all arithmetic and control examples, including unsigned wrap, ADDW/ADDIW/MULW/SUBW sign extension, LUI sign extension, signed minimum / -1, signed and unsigned division by zero, REM/REMU zero divisor, mixed signed×unsigned high product, taken/untaken BEQ, call-before-function-body, return-through-prepared-address, signed/unsigned loads, truncating stores and xv6 write's returned byte count and actual output. No numerical state disagreement found. The ecall recording's output is the actual `A` plus newline, and a0's after-state is the corresponding byte count.

No blocker found in the execution pipeline or coverage. Both explanatory findings above are corrected and independently rechecked. No open technical finding remains. This review is source/tool/browser functional evidence, not a study of novice understanding.

Final focused recheck after both fixes: corpus tests passed 3/3; built lw/j/ret checked desktop1280 and phone390 in actual light/dark themes. The memory checker now also asserts that the CPU state immediately after the focused instruction equals the CPU final memory before comparing the native QEMU report; a future memory-changing continuation cannot silently invalidate that comparison.
