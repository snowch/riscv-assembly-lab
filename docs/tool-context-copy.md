# Tool context copy drafting pass

This separate drafting pass owns `content/guides/tool-context.json`. It follows `docs/tool-context-brief.md`, the local learning-design skill and the imported Assembly Lab prose rules. It is not a completed independent learner or technical review.

## Checked facts

The actual generator supplies fragment entry, working-register initialisation, state capture, report formatting and xv6 exit. Complete assembly source is unchanged. The debugger starts fragments after setup and C at `lesson`; helper calls can leave that function’s listing scope. The supplied capture checkpoint ends the inspected fragment interval before automatic reporting. Selecting All changes what is listed, not that interval.

The observation copy distinguishes an actual paused PC, the next instruction at that pause, captured fragment results, a retained pause after raw-program completion and a stale build. It must only be rendered for the matching runtime facts. No wording invents a raw program’s final register state or animates unobserved setup stages.

Calculator bit patterns and their signed/unsigned readings use the existing exact integer model. Reading-only changes can keep the retained pattern while recalculating reading-dependent mathematical values. Width changes resize valid operands as already documented and invalidate the result. Generic zero-widening is separate from RV64 W sign extension. Carry is an arithmetic property, not a stored RISC-V flag.

The guide uses the parent’s specified complete program: count data, `_start`, argument loads, a leaf helper, result copied into s0 and xv6 exit. The copy deliberately gives no numeric worked result. The exit-ecall breakpoint is the named observation point. `ret` is explained as a function return, and the caller’s a0 reuse explains saving the result first.

## Learning route and limits

The small persistent contract gives the essential execution context without requiring a disclosure. The optional complete-program guide names its entry before any completion gate. It links actual memory/call/syscall/entry prerequisites, then supplies one supported trace. Its fresh application changes the calculation and inputs; the learner must explain the data, call and observation boundaries. It uses the same editor in a separate project, with no additional quiz mode or score.

The fresh project’s initial helper may still contain the worked addition. Its task names a different operation without showing that operation’s solution in prose. Do not turn the worked project into the learner’s exercise automatically or replace an existing project. No lesson prediction or challenge answer is included in the draft.

The exact source and line positions are the implementation owner’s responsibility. The parent must assemble and run the worked and fresh sources and test the pause before the exit ecall. Any generated source-location label must use known source identity; the text does not permit assigning C lines where TinyCC emits none. The copy proposes short structural stage labels, not proof that a beginner will infer the mechanisms. Independent browser reviews and a human novice session remain distinct evidence.

## Integration notes

- Group keys are `execution`, `observation`, `scope`, `calculator` and `bridge`.
- Substitute `{symbol}`, `{pc}`, `{line}`, `{instruction}` and `{reading}` only from validated runtime metadata or exact source associations.
- Use a specific full-program route where the source owns exit. A structural “Your exit call” stage must not imply an arbitrary imported program contains a successful exit.
- Show `readingChanged` only when an existing result was preserved. If there is no retained result, use `inputReadingChanged`.
- Show W-extension output only where the calculator has a 32-bit retained result and the implementation computes the displayed 64-bit pattern. Do not label that output as an executed instruction.
- Stage-link actions should open the corresponding actual source section. Capture and reporting currently share a generated source span; do not invent a separate source boundary solely for the diagram.
