# Independent technical content review

Copyright © 2026 Christopher Snow.

Review date: 15 November 2026. Reviewer: `course_source_audit`, separate from the content authors. This record covers the RISC-V adaptation authorised by the author. It does not relicense Assembly Lab’s original material.

## Scope and evidence

Read all 54 lesson objects individually, including their introductory explanations, runnable starters, observation contracts, follow-up explanations, challenge requirements, reference programs and expected cases:

- `content/state-arithmetic.json`: 17 lessons.
- `content/control-memory.json`: 15 lessons.
- `content/products-functions.json`: 8 lessons.
- `content/c-xv6-appendices.json`: 14 lessons.

The review followed `docs/course-authoring.md` and the source course’s authoring and clarity guidance. Instruction and ABI facts were checked against the official [RV32I/base integer text](https://github.com/riscv/riscv-isa-manual/blob/main/src/unpriv/rv32.adoc), [RV64I differences](https://github.com/riscv/riscv-isa-manual/blob/main/src/unpriv/rv64.adoc), [M extension](https://github.com/riscv/riscv-isa-manual/blob/main/src/unpriv/m-st-ext.adoc), and [RISC-V procedure calling convention](https://github.com/riscv-non-isa/riscv-elf-psabi-doc/blob/master/riscv-cc.adoc), read on the review date. The pinned xv6 `kernel/exec.c`, syscall definitions, linker script and lab state-report model were inspected where they affected claims.

Manual checks covered operand order, fixed-width arithmetic, sign and zero extension, masks, shifts, signed and unsigned comparisons, little-endian transfers, array totals, product halves, division edge cases, stack alignment and preservation, recursive counts, the defined C test cases, xv6 syscall conventions and binary32 field encodings. These checks are not a claim that this reviewer independently executed every program.

## Accepted findings and closure

### P1: Bounds exercise accepted a forbidden load

The memory-protection challenge requires an invalid offset to leave `t2 = -1` and perform no load. Its original four cases accepted this counterexample:

```asm
la t3, lesson_data
add t3, t3, t0
lbu t2, 0(t3)
bltu t0, t1, done
li t2, -1
done:
```

Independent execution with `tools/course-runner.js` confirmed that all four original expected-value cases passed even though the load occurred before the check. Adding offset 64 and capacity 64 initially failed to expose the problem as well.

The cause was a real runtime defect, not the arithmetic check. In the pinned emulator, `src/mmu.rs` read the page-table user bit into an unused `_u` variable. The linker placed `lesson_data` at `0x11fc0`, ending at `0x12000`. xv6 cleared user permission on the following stack guard page, but an unsafe user load at `0x12000` still succeeded in the old emulator.

The runtime was patched and rebuilt separately. This reviewer then started a fresh Node process and independently reran the exact counterexample and corrected reference against the current vendored WebAssembly CPU:

- The corrected reference passed the new boundary case and reported `t2 = 0xffffffffffffffff`.
- The read-before-check counterexample failed, with no completed state report.
- The actual xv6 serial log reported `scause = 0x0d` (load page fault), `sepc = 0x100b4`, and `stval = 0x12000`.

The teaching exercise now distinguishes checking bounds before a load from repairing only the returned value afterwards. This finding is closed for the reproduced user-load regression. This reviewer did not independently exercise every supervisor/SUM/MXR permission combination; broader MMU verification belongs to the runtime patch’s tests.

Artifacts used for that independent verification:

- `riscv_emu_rust_wasm.js` SHA-256: `f18ff9cce28f75bae6673d99ea52d164dfc50ed1d5e29eb53a1e0aca99a7c694`.
- `riscv_emu_rust_wasm_bg.wasm` SHA-256: `acecbb32bb10570246f74889001c06f85d307fa4a24395e1bf85cfb2eb34b5c7`.

### P1: Complement derivation was off by one

The two’s-complement explanation originally described complementing a pattern as producing “one less than the all-ones value minus x”. For zero this would contradict the following paragraph’s all-ones result. The corrected statement is `2^64 - 1 - x`. Independent source re-read confirmed the correction and the subsequent addition-of-one argument. Closed.

### P2: W-suffix definition included stores

The word-arithmetic introduction originally applied its sign-extension rule to every instruction ending in `w`, which would incorrectly include `sw`. It now explicitly names arithmetic W variants such as `addw`, `subw` and `addiw`. Independent source re-read confirmed that the definition fits the RV64 rule and no longer contradicts the later store lesson. Closed.

### P2: Branch pseudo-instruction appeared before its explanation

The recursion starter used `beqz` without defining that spelling. The introduction now explains it as `beq a0, zero, fade_zero` before the starter. Independent source re-read confirmed the explanation. Closed.

### P2: Narrow argument conventions needed a local qualification

The C-width discussion now explains that standard RV64 integer arguments narrower than XLEN are widened to 32 bits according to signedness and then sign-extended to 64 bits, including unsigned 32-bit arguments. It distinguishes this call convention from `lwu` and explicitly says that the page’s long-only fixtures do not demonstrate an unsigned-int call. This matches the checked psABI without attributing an unperformed experiment to the page. Closed by independent source re-read.

### P2: C maximum-value notation was unexplained

The saturating-increment challenge first required `~0UL` without defining either `~` or the suffix. Its explanation now defines `0UL` as zero of type unsigned long and `~` as bitwise complement, establishing why the expression yields the type’s maximum before the task uses it. Independent source re-read confirmed the local explanation. Closed.

## Qualifications retained

No defect was found in the reviewed division-by-zero and signed-overflow expectations: they deliberately follow the RISC-V integer instruction contract, while the C lessons avoid using undefined cases as required answers. Likewise, W-result sign extension is intentional, and the signed/unsigned load distinctions are not interchangeable.

The floating-point appendix remains integer inspection of an encoding. It does not claim that the xv6 guest executes floating-point arithmetic or maintains floating-point context. The environment chapters describe xv6 user execution, not firmware reset, physical-board boot or arbitrary MMIO access.

A successful exercise check establishes its executed cases, not every possible input or every structural property of a submitted implementation. Challenge views should expose all expected outputs even when the worked example observes a different register subset.

## Verification limits

This is an independent technical source review and focused runtime regression check. It is not a browser learner review, a complete independent run of every reference and starter, a full MMU audit, or physical-hardware validation. The managing session’s complete course execution and browser results must be recorded separately. Later edits affecting these findings require the relevant checks to be repeated.
