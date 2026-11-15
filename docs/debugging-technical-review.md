# Debugger technical review

Reviewed independently on 15 November 2026 for `feat/debugging-tools-and-lessons`. The reviewer did not implement the debugger or author its four lessons. This record covers execution and observations, not a separate learner reading of all lesson prose.

## Scope and checked implementation

Read `site/course/debugging.js`, `debugger.js`, `worker.js`, `session.js`, `builder.js`, the controller integration in `lesson.js`, generator integration, and the new native and browser checks. Checked the actual runtime breakpoint contract in the previously inspected Rust/WASM API: `run_until_breakpoints` executes a CPU tick and then compares the resulting PC. It does not immediately return merely because the starting PC is selected.

Used fresh Chromium contexts against the locally served generated site at port 4230, plus the real GNU build and xv6 CPU through `tools/course-runner.js`. Observations below were executed independently; they are not inferred from author checks or design intent.

## Accepted finding and closure

**P2: Continue skipped an adjacent selected breakpoint.** The original worker both executed `run_cycles(1)` when resuming a selected breakpoint and then invoked `run_until_breakpoints`. This advanced through two instructions before the next comparison. With breakpoints on consecutive source lines containing `li t0,1`, `addi t0,t0,1`, and `addi t0,t0,1`, the original browser implementation paused first at line 1 with t0 = 0, then at line 3 with t0 = 2. It skipped the selected line 2 pause before t0 became 2. The same path could also bypass the lesson-end observation after a selected final instruction.

The implementer removed the extra manual tick and its skip flag. Independently repeated the browser counterexample after the correction: PCs were `0x100a0`, `0x100a4`, `0x100a8`, with t0 = 0, 1, 2 respectively. Continuing from the selected final instruction reached the reporting checkpoint at `0x100ac`, then completed with t0 = 3. The finding is closed. A direct CPU regression also covers adjacent selected instructions and the final checkpoint.

## Independently verified observations

- **Exact source mapping:** a single `li t0,0x123456789abcdef0` emitted eight real instructions. A line breakpoint resolved only the first emitted instruction. Comment-only and label-only lines resolved to no instruction; they did not silently move to the next executable line. Invalid and unaligned address selections were rejected.
- **Real C addresses:** the interface stated that C source-line mappings are unavailable and offered actual disassembly addresses. Selecting the second instruction, then Continue, paused at that exact address (`0x10254` in the checked build). No fabricated C source line was shown.
- **Prepared initial sp survives seeking:** a breakpoint after allocating 16 stack bytes produced an initial-sp value 16 greater than the observed current sp. Initial sp was captured at entry before seeking to the later breakpoint.
- **Paused watches do not execute instructions:** adding a watch of `sp + 0` observed byte 42. Adding an inaccessible watch at `zero - 8` observed `null`. PC and all 32 integer register readings remained identical across both refreshes.
- **Boundary bytes remain distinct:** a real CPU watch of two bytes at `lesson_data + 63` returned `[0, null]`; an unaligned eight-byte observation inside valid data returned its actual bytes. An inaccessible byte was not converted to zero or a prior value.
- **Current stack and return address:** the stack table contained eight observed doublewords beginning at the actual current sp. A saved return address at sp + 8 exactly matched the `done` symbol (`0x100c0` in the checked build). After completion, the retained stack sample and current sp/ra still referred to the matching final observation.
- **Invalidation:** editing paused C stopped its VM, removed selected breakpoints and invalidated the disassembly. Editing assembly cleared register/memory observations and breakpoints; the previous byte 42 was not displayed as a new observation. Pin and watch selections may remain as controls, with no fabricated sample.
- The focused browser checks above produced no uncaught page errors.
- Independently ran `node --test tests/debugging.test.js`: all three checks passed, including repeated hits on the same loop breakpoint, observational memory/stack reads, and adjacent/final instruction boundaries.

## Rejected assumptions and limits

Address zero is not a useful inaccessible-memory fixture in this xv6 layout: the user image maps the gap below its text. The inaccessible watch check uses address `0xfffffffffffffff8` instead. A watch that crosses the data/guard boundary checks partial readability separately.

The stack view identifies exact symbol/instruction address matches. These matches do not establish a call frame, saved return address or reconstructed call chain, and the interface says so. No automatic unwinding or hardware data watchpoint claim was accepted or tested.

The native helper checks supplement browser checks; they would not alone have detected the original worker's extra Continue tick. Browser evidence was required to close that finding. This focused review used desktop Chromium, not a physical phone, and is not a full ISA, privileged-MMU or adversarial source security certification. The underlying runtime binary was unchanged by this feature. No unresolved P1/P2 issue remains in the scenarios reviewed here.
