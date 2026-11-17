# Learner clarity integration and verification

Copyright © 2026 Christopher Snow

Reviewed on 17 November 2026 against the user's clear-wording and uncluttered-UI criteria, now recorded in `learner-clarity.md` and linked from `course-authoring.md`.

## Coverage and corrections

The separate content passes read every learner-facing field in all 58 lessons: 17 state/arithmetic, 15 control/memory, 8 products/functions, 4 debugging and 14 C/xv6/further readings. The shared workbench, Playground and calculator guides, labels, feedback and optional inspections were reviewed alongside their actual controls. Existing clear explanations, executable examples, exercises and useful optional technical views were retained.

The applied corrections address concrete action or interpretation problems:

- Name editable `li`, load/store, branch, shift and C-expression locations rather than asking learners to edit read-only prepared inputs/data. Local C assignments explicitly replace supplied arguments within the call; source stores explicitly change memory during execution while Before remains the original setup.
- Replace the misleading array-scaling deletion with an aligned wrong-stride comparison. Prepare a known second stack slot rather than drawing conclusions from uninitialised bytes. Make missing bounds checks actual instructions to insert, not a check supposedly already in the example.
- Name Registers, Memory/Before/After, Output/Program output and xv6 serial log where those are the relevant evidence. Deliberately broken loops use stepping and Stop; faulting examples say that no completed report is expected.
- Remove static memory captions that become false after source writes or different exercise cases. Keep a neutral region-origin label.
- Correct the zero-register instruction-order claim, define needed terms, replace generic hints with mechanism-based reasoning, and make compiler-specific type sizes a first measurement rather than an unsupported guess. Exact type-size facts remain in the later explanation.
- Compare an entered prediction with the program actually run. A valid edited result is not diagnosed as a bad operand order. An error, Stop or missing snapshot ends the pending prediction with an explicit unavailable-result message, while preserving the typed prediction and distinct execution status. Early lessons say decimal until signed interpretation is introduced.
- Route completion guidance by activity: ordinary example → Registers and the next experiment; selected exercise case → Registers and Check all cases; Playground fragment/function → Registers and editable code/setup. Diagnostics names build and execution messages.
- Remove duplicated calculator resize prose while keeping destructive width-change consequences visible. Hide idle disabled Continue/Stop without shifting their reserved positions. Retain the existing optional technical/program/reference views and answer disclosures because they have distinct jobs.

The separate static Hello World entry was also read sentence by sentence. Its unchanged-program action now names Console; its quoted `.ascii` edit and newline meaning are explicit; its copy link matches Playground wording; and its page-versus-Playground debugger description replaces an obsolete future-work claim. The fresh newline experiment splits two words across visible lines instead of relying on an inconspicuous trailing blank line. The original `hello.s` and standalone runtime remain unchanged.

The integration rejected a proposed comparison with an earlier compiler listing: the interface retains only the latest build's listing. The C return experiment instead names its editable constant and actual return register. An initial suspicion about the stack-tab route was also rejected: lesson Debugger contains Inspect the stack, while Playground has a separate Stack tab. Unaligned accesses completing on this emulator were not described as proven runtime failures; aligned alternatives isolate the intended comparison without claiming general hardware behaviour.

## Functional verification

An independent structural comparison confirmed that all 58 original starters, observed/result registers, supplied inputs/data, reference solutions and exercise input/expected-result contracts are unchanged. One case name and four lessons' memory captions changed; lesson IDs and draft/project storage keys did not. Actual edit/reload/Restore/Undo, exercise separation and independent project-copy flows were checked.

- `npm test`: 35 tests passed.
- `npm run test:course`: all 58 original xv6 examples passed; the portable independent QEMU path passed 57 examples and 196 reference cases. The xv6-specific lesson passed its 3 reference cases. All 58 incomplete exercise starters were rejected by at least one case. No corpus failures.
- An additional independent GNU/Linux-QEMU pass completed all 32 proposed state/arithmetic edited variants. The separate content passes ran the affected control/memory, functions/debugging and C variants through GNU/TinyCC and xv6. Their audit records distinguish completed edits, deliberately broken paths and excluded premature-boot probes.
- Focused browser regression checks cover valid edited predictions, blank predictions, compiler errors, stopped execution, missing snapshots and selected-exercise completion guidance. Wider browser results are recorded below.
- `npm run check:assets`: 26 pinned assets verified. Generation and whitespace checks pass.

The initial focused feedback test awaited an old Finished badge before the new run had completed; it was corrected to await the actual new result with the execution timeout. During the broad run, one already-loaded test retained the old signed-reading expectation after the final early-decimal wording correction. Its page showed the correct decimal result. The final affected regression cases are rerun against the completed source; neither test-script issue is counted as evidence of a processor or learner failure.

## Review records and limits

Content/drafting records: `clarity-audit-state.md`, `clarity-audit-control.md`, `clarity-audit-functions-debug.md`, `clarity-audit-c-xv6.md` and `clarity-audit-ui-copy.md`. Separate final reviewers did not draft or edit the applied material: `clarity-final-learner-review.md` and `clarity-final-technical-review.md`. Both found no remaining blocker in the inspected final changes.

Browser inspection covered phone, tablet and desktop, both themes and selected keyboard routes; the suite also opens every published lesson in both themes. This establishes functional edit/run/observe routes and rendering for the checked states. It is not evidence that novices understand or transfer the mechanisms. No novice study, physical-device test, non-Chromium compatibility claim or complete assistive-technology audit is made. Publishing status is checked separately after merging.

## Final integration result

The broad 148-case browser run passed 147 cases. The one already-loaded feedback case still expected the old “signed” label after the final early-decimal correction; its actual page showed the correct decimal result. A clean final run of all four feedback cases passed, including that case and the added selected-exercise completion route. The other broad cases passed, including every published lesson in both themes, saved-work recovery, geometry, debugging, calculator isolation and native/fallback fullscreen.

After the static Hello World text changes, four relevant browser checks passed on desktop/phone for actual edits/output/diagnostics/draft recovery and native new-tab source transfer. A separate phone run checked three programs: the unchanged message, `Trip ready!` with its newline, and the two-line `Trip`/`ready!` version. All printed the exact expected Console text; `message_length` required no manual adjustment. Independent final reviewers checked the static page at three widths in both themes and added their findings to the final review records.

Rebuilding the course produces identical generated output. Whitespace and structural checks pass. No remaining blocker was found by the final learner or technical reviewer. GitHub CI/deployment outcomes are reported separately from these local checks.
