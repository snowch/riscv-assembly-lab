# Course integration verification

Copyright © 2026 Christopher Snow. Checked on 15 November 2026.

The course has 54 lessons in 14 generated modules, including three further readings. Canonical content is in `content/*.json`; generated pages and the catalogue are committed. Assembly Lab itself was not modified.

## Executable evidence

`npm run test:course` builds real GNU/TinyCC objects. It executes all 54 worked examples in fresh xv6 guests. The independent Linux/QEMU variant changes only the supplied reporting syscall ABI, then runs 53 portable examples and 182 portable reference cases. The explicitly xv6-specific system-call lesson runs its three reference cases in xv6 instead. Incomplete challenge starters must fail a listed case. These checks establish the executed cases, not arbitrary-input correctness or full CPU conformance.

`npm test` exercises real GNU compilation, assembler/linker failures, register and byte capture, 32-bit result extension, stack preservation, C aggregate initialisation, actual GNU disassembly, CPU breakpoints, three instruction steps and guard-page reads/writes. A separate owned-frame regression confirms that the learner console view removes only a complete instrumentation report and preserves incomplete output. Raw serial remains unchanged.

The CPU’s native permission tests and clean reproducible build are recorded separately in `runtime-permission-build.md`; the independent guard regression is recorded in `course-technical-review.md`.

## Browser and learner evidence

The catalogue browser test opens every lesson at desktop and phone widths in light and dark themes, checks connected navigation and readable visible text, and rejects document overflow. Interaction checks execute actual edits, Step/Continue, wrong and correct challenges, byte observations, C compilation and diagnostics, complete-source ZIP downloads, predictions, progress and independent activity drafts.

The initial full browser suite passed 24 checks. The final review added targeted regression checks, passing eight desktop/phone executions: paused restore starts a fresh CPU, fixture controls lock while a run is active or paused, recorded system-call cases restore their own console/state, byte detail resets when the view changes, real C warnings remain visible, blocked storage retains activity drafts within the page, and rejected source-download fetches report a useful error. CI repeats the complete expanded suite on the final commit.

Independent source and learner reviews are recorded in:

- `course-technical-review.md`: all 54 lesson objects, checked ISA/ABI facts and guard counterexample.
- `course-learner-review-state-c.md`: 31 individually read/run lessons, 124 desktop/phone light/dark states, selected stepping and challenge flows.
- `course-learner-review-control-functions.md`: the other 23 individually read lessons, selected actual execution/challenge flows and four rendered states per page.
- `course-framework-review.md`: independent closure of framework interaction findings.

## Distribution checks

`npm run check:assets` verifies 24 pinned tool/runtime/source/licence assets. `npm run build:course` followed by a generated-file diff verifies reproducible catalogue output. `git diff --check` passes; `.gitattributes` preserves unified-patch context and verbatim third-party licence whitespace.

The GitHub Actions check repeats asset hashes, generation, Node execution tests, the complete course corpus and browser checks before Pages deployment. Production smoke checks follow deployment. Source archives and content attribution remain distributed with the course.
