# Debugging integration verification

Copyright © 2026 Christopher Snow. Checked on 15 November 2026.

The course now has 58 lessons in 15 modules. Four debugging investigations follow the functions module. Their ordinary worked examples terminate; the deliberately broken nested-return challenge is investigated with breakpoints, stepping and Stop before checking a repair.

## Actual execution

The unchanged vendored CPU executes every observation. `npm test` passes all 14 tests, including three new debugger regressions using real GNU builds and xv6 machines. Those cover exact source mapping, repeated loop stops, adjacent breakpoints and the final checkpoint, real stack/memory reads, and observation without advancing PC or changing integer registers.

`npm run test:course` completes with zero failures: 58 xv6 worked examples, 57 portable QEMU examples, 196 portable reference cases, three xv6-specific reference cases, and rejection of all 58 incomplete challenge starters. The separate authoring record documents all fourteen new reference cases executed in xv6, plus six actionable experiment edits executed with GNU/QEMU.

The runtime's `run_until_breakpoints` executes a tick before comparing the resulting PC. Continue delegates directly to that behaviour; an extra manual tick was found during independent review and removed. That finding and its fresh-browser closure are recorded in `debugging-technical-review.md`.

## Browser evidence

The complete local browser suite passes 36 checks at desktop and phone widths. Its catalogue check reads every published page in light and dark themes and rejects document overflow. New interactions execute repeated loop stops, adjacent selected source lines, the selected final instruction, paused memory refresh without a PC change, unreadable bytes, actual saved return-address slots, C instruction-address breakpoints and source-edit invalidation. Existing assembly, C, challenge, export, persistence and recovery checks remain included.

An initial concurrent targeted run had four passing checks and two `ERR_CONNECTION_REFUSED` failures because another Playwright invocation retired the shared server that it had started. A separately owned server was started; all six targeted debugger checks then passed, followed by the successful complete suite. This was a test-server lifecycle failure, not a product-code correction. A native test initially assumed address zero was unmapped; direct execution showed that xv6 maps the gap below this image. The test now uses `zero - 8`, with partial guard-boundary readability checked separately.

Instruction-button and gutter updates preserve keyboard focus on the corresponding rebuilt control without scrolling or moving focus from another control. The C breakpoint keyboard scenario is also checked in a focused phone/desktop rerun after that small UI correction.

Independent learner and technical records are separate from these managing-session results. The learner review covers the new lesson wording, required actions and rendered themes. The technical review covers actual CPU boundaries, inspection and invalidation. The component's author additionally checked its real-state rendering at both widths and themes; that is author evidence, not an independent verdict.

## Scope and distribution

Assembly line breakpoints use the first emitted instruction for that exact line. Non-executable lines do not silently move. C uses actual instruction addresses because this compiler does not provide source-line mappings. Watches sample at pauses; they are not hardware data watchpoints. The stack view shows eight observed doublewords and exact symbol/instruction matches, without inferring a caller chain.

The distributed CPU, compiler and kernel bytes are unchanged. All 24 pinned assets pass `npm run check:assets`. The static catalogue is regenerated from canonical lesson data. CI repeats generation, Node tests, the complete execution corpus and browser checks before Pages publication; production smoke checks follow deployment.
