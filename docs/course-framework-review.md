# Independent framework review

Copyright © 2026 Christopher Snow.

Review date: 15 November 2026. Reviewer: `course_source_audit`, separate from the framework author. This review complements `course-technical-review.md`; it is not the independent learner review of all lesson pages.

## Scope

Read the generated-page contract and the implementation of `site/course/model.js`, `builder.js`, `compiler.js`, `worker.js`, `session.js`, `lesson.js`, `zip.js`, the ELF reader, `tools/build-course.js`, and the relevant unit, execution-corpus and browser tests. The checks focused on actual captured state, instruction boundaries, source/fixture identity, challenge grading, cancellation and errors, C compilation/disassembly and source exports.

The snapshot scaffold saves the integer registers before reusing working registers, reconstructs the fragment’s original `sp`, and separately reports the prepared initial stack pointer. The stack inspection reservation and the reporter’s frame remain multiples of 16 bytes. The debugger pauses at actual executable symbols and reads real CPU state. It uses decoded instruction addresses rather than assuming source lines have fixed instruction counts. C listings are disassembled from the linked executable and do not invent source-line associations.

`checkState` compares register bit patterns, expected byte values and explicit preservation relationships. The execution checks use new machines for fixtures. Full-program views are generated from the current fragment and selected fixture; recorded compiler output is labelled as belonging to its build. These source inspections are not a certification of all possible ISA instructions or submissions.

## Findings and independent closure

### P1: A fixture could change while its previous run continued

Reproduced in Chromium at the local built site: start the first addition challenge case with `add t2,t0,t1`, then choose “A zero input” before the first run finishes. The starting-state panel changed to `t0=0,t1=9`, but the old run later displayed `t0=14,t1=5,t2=19`. A source-only stale notice did not identify the different fixture.

Case and recorded-case buttons now lock during active or paused execution, with a defensive cancellation path for case changes. Independent rerun confirmed that the picker was disabled during execution, and that selecting the second case afterwards and running it produced its own result, `t2=9`. Closed.

### P2: Programmatic source changes retained a paused old machine

Reproduced by pausing code whose first line loaded `t0=99`, restoring the starter whose first line loads 7, then stepping. The editor showed the new source while the old machine loaded 99.

Restore and reference loading now use the cancellation path before changing source. Independent browser rerun confirmed that Restore changed the control back to “Start stepping”; a new stepping session then loaded 7. The reference-loading handler was independently checked to use the same cancellation path. Closed.

### P2: Recorded case inspection needed the whole observation bundle

The earlier implementation restored register/memory state alone, leaving console, serial, compiler and ELF views from the last case. Records now retain those views and diagnostics together. The user-facing console removes the supplied state-report frame while the raw serial log remains available.

Independent browser verification ran all system-call challenge cases, observed `trip\n` for the final five-byte case, then inspected the zero-byte case. Its register result became zero and the visible console no longer contained the five-byte message. The record-restoration code was checked for the corresponding serial, build metadata and error fields. Closed.

### P2: Dependent numeric details could survive cleared observations

After a successful floating-point-bit run, an invalid edit cleared the register card but left the old numeric binary32 interpretation visible without a stale notice. Separately, after inspecting byte 8 after a store, switching to Before showed a zero cell while the detail still reported decimal 136 / hexadecimal 88.

Independent browser rerun confirmed that a failed floating-point-bit run no longer retained the old 9.5 interpretation, and that switching the memory moment cleared the obsolete selected-byte detail. Closed.

### P2: Successful C warnings were dropped

The adapter originally returned an empty diagnostic array even when TinyCC warned. Direct observation of the existing compiler log confirmed the warning for `long lesson(long a,long b){long *p=a;return a+b;}` while its returned diagnostics were empty.

The adapter now preserves filtered warning lines and the builder merges them with assembler/linker diagnostics. Independent browser rerun completed that compilation and displayed `lesson.c:1: warning: assignment makes pointer from integer without a cast`. Verbose adapter tracing is not exposed as learner diagnostics. Closed.

### P2: Storage-denied activity switching lost the draft

With `localStorage` denied, editing Explore, switching to Challenge and switching back originally restored the starter despite the tab-only draft message. The page now maintains per-activity in-memory drafts as well as attempting browser storage.

Independent browser rerun with a throwing storage getter preserved the edited Explore fragment through both activity switches. This establishes the in-page fallback; it does not promise persistence across reloads when browser storage is unavailable. Closed.

### P2: C export had an uncaught fetch failure and an asynchronous snapshot boundary

Aborting the linker-script download originally raised a page error and left the status at Ready. The export now catches network failures and captures the C text once before awaiting the fetch.

Independent browser rerun aborted that fetch and received a visible failure status without a page error. A second run deliberately delayed the fetch, edited the C source while waiting, then released the download. Parsing the resulting ZIP confirmed that `lesson.c` contained the source captured when Download was pressed, rather than the later edit. The supplied assembly and linker file remain included. Closed.

## Verification record and limits

The final independent Chromium scenario run completed successfully at `http://127.0.0.1:4230/` at a desktop viewport. It covered all closures above and had no page errors. An earlier closure-script attempt failed because it waited for an already-Finished badge immediately after requesting a second run, then compared the newly cleared result too early. The corrected run awaited that case’s unique new numeric result. The first attempt is not counted as a passing run.

The managing session separately reports a complete execution corpus and desktop/phone regression tests; those are not relabelled here as this reviewer’s independent runs. The independent whole-course learner review is also separate. This review does not attempt hostile serial-report forgery, arbitrary-ISA certification, exhaustive MMU verification or physical-hardware validation.

No open P1/P2 findings remain among the concrete scenarios reviewed here. Runtime artifact hashes still match the independently checked guard-regression artifacts recorded in `course-technical-review.md`; that earlier record needed no hash change. Later relevant code changes require the corresponding closure checks to be repeated.
