# Verification

Copyright © 2026 Christopher Snow

## Functional evidence before pull request

- Separate arithmetic/control/UI/header drafting from the checked brief. Independent learner and technical reviews recorded alongside this file; all ranked findings corrected and independently rechecked.
- 54 taught instruction/pseudo-instruction names, including names introduced in prose. Coverage checks derive names from source examples and exercises; lesson filtering also includes code notation in lesson prose.
- 64 example programs assembled with bundled GNU tools, executed in xv6 and compared against an independent native QEMU instruction trace. Exact watched before/after registers and next PC agree. Data examples additionally agree on memory; the write service agrees on output and returned byte count. GNU rejects all 54 claimed bad operand examples. `npm run test:reference` passed with no failures.
- `npm test`: 46 passed, no skips or failures. `npm run check:assets`: all 26 pinned assets verified.
- Focused browser suite: final eight tests passed on desktop1440/phone390, actual light/dark, course home, lessons, guide, playground and legacy Hello World. Checks cover syntax, before/after readings, memory, pseudo expansion/disassembly, complete program, directive search, download failure/retry, paused execution, edited source, prediction, calculator work, focus, keyboard Escape/Ctrl+Enter, page position, readable type, control targets and no overflow.
- Initial focused run: four passed/four failed. Two product issues (Escape clearing search instead of closing; error state lost after filtering) were corrected. Two route checks tried to select a deliberately hidden lesson filter; corrected the test to respect its visible state. Subsequent focused runs passed eight/eight; the original failure remains a failure.
- Course generation rebuilt 58 lessons; the reference is also installed on the separately maintained Hello World page. Runtime/compiler/vendor files, learner storage formats and platform code are unchanged.
- Full course execution and full browser checks started locally. Exact pull-request-head CI repeats generated-source consistency, all unit tests, all 64 reference execution checks, all lesson/challenge executions and the entire browser suite before merge. Those results belong to their CI run rather than this pre-commit record.

## Learning evidence

Reviewers worked from the stated prerequisites and exercised the built interface; no human novice study was conducted. These checks establish content/tool consistency and functional behaviour, not that every learner will understand the material. A novice transfer check should ask the learner to distinguish a label, exported symbol and entry point in a fresh program and to predict an unfamiliar instruction's effect using the reference.
