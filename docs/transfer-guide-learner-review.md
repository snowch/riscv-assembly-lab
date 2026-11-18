# RISC-V-to-Arm appendix: independent learner review

Copyright © 2026 Christopher Snow

## Scope and evidence

Separate reviewer session using the inherited parent model, with no model override. Reviewed one appendix at `http://127.0.0.1:4490/lessons/riscv-and-arm/`, including its original native workspace and the guide's separate-project instructions. Read `docs/course-authoring.md`, `docs/learner-clarity.md`, the Arm repository's authoring rules/style checklist, the actual guide and relevant earlier RISC-V function/width preparation. The reviewer did not draft or edit learner-facing source.

This is an agent review and functional browser verification, not a formative study with a novice. It supplies no measured evidence that readers will understand or transfer the concepts unaided. Primary ISA and ABI verification is covered by the separate technical review.

## Assumed preparation

The appendix appears after the RISC-V core course. It assumes practised register operands and aliases; 64-bit patterns and the signed/unsigned readings; RV64 W-result sign extension; function arguments/results, `call`/`ret`, branches and local labels; stack alignment/preservation; and xv6 user-process/system-call context. These have earlier course preparation. The guide itself introduces ordinary Arm argument/result/return-address/zero-register names, describes the different lab runtime, and labels the foreign code as read-only.

One new Arm-specific prerequisite was insufficiently explicit in the initial draft: the relationship between W and X names for the same register. That finding is listed below.

## Findings and corrections

1. **Medium, prerequisite clarity: W/X alias relationship.** Under “Check the register names”, the initial text said “An Arm write through a w name clears the upper half of its x register.” A learner arriving only from RISC-V knows W-suffixed instructions, but has not been told that `w0` is the low-32-bit view of `x0`. Direction: establish that concrete alias relationship before comparing write effects. Parent accepted and added it in canonical JSON; final built-page verification is recorded below.
2. **Low, execution boundary.** “Start stepping pauses before the first machine instruction” could refer to process entry. In the actual interface, supplied entry/setup run first and the pause is before the fragment's first instruction. Direction: identify that boundary. Parent accepted; built text now identifies the supplied entry/setup and the fragment's first instruction. The actual stepping controls agree.
3. **Low, code readability.** Initial reference listings inherited a 12.24px code size inside a 13.6px preformatted block, alongside 16px prose. The short function comparison had room for body-sized code. Direction: set listing typography explicitly and remove inherited inline-code chip styling inside these blocks. Parent accepted; final CSS computes to 16px code and the listings remain contained on phones.

The reference appendix is longer than a core activity, but its headings separate the name/width comparison, worked function, runtime boundary, project caller and transfer task. I did not treat length alone as a finding. The read-only listings, actual native workspace and cross-course exercise are distinguished explicitly.

## Actual browser checks

The complete workflow passed in Chromium at 1280×900 and 390×900, each in selected and rendered light/dark themes:

- Original RISC-V carry example ran and showed `t3 = 1`.
- Saved an edited original lesson draft, followed the guide's actual playground link, opened **Tools → Projects → New project**, selected **Assembly fragment**, entered a project name and chose **Create project**.
- Pasted the exact guide caller/function through the visible CodeMirror editor. **Build & Run** showed `t2 = 13` in the default Registers display, matching the guide's requested evidence.
- Applied the fresh three-argument extension described by the linked Arm guide: loaded `a2 = 3` before the call and added `a2` inside the function. The actual guest run showed `t2 = 16`.
- **Tools → Program** exposed the supplied entry and surrounding source. **Start stepping** paused before the first lesson/fragment instruction, and **Step instruction** advanced one machine instruction.
- Opened New project with keyboard Enter. Typed the dialog fields, reached actual controls, and confirmed that the instruction listings are focusable. This is targeted keyboard verification, not a complete screen-reader audit.
- Returned to the original appendix and confirmed the edited lesson draft remained intact. No project action overwrote that draft.
- No page exceptions or page-level horizontal overflow appeared in the four full workflows.

The original “Change it and run again” edit, `li t0, -1` to `li t0, 255`, also ran independently. It showed `t3 = 0`, a normal finished status and neutral feedback describing the edited result. It did not falsely fail because the result differed from the original example.

Screenshots of the full guide and project were inspected in light/dark and at phone/desktop sizes. The register table reflows without losing its associations; function listings stack on phones and remain labelled by architecture. Additional 375px final-layout checks cover the narrower width. Evidence is under `/tmp/riscv-transfer-*` and the exact full workflow results are `/tmp/riscv-transfer-learner-results.json`.

## Harness failures kept separate

The first complete workflow script stopped because a global `Project name` label selector matched existing, new-project and import-project fields. The next attempt stopped because exact `Project type` label matching included option text. These were reviewer harness selector errors, not learner-visible product failures. Dialog-scoped IDs corrected the harness; the subsequent full run passed all four combinations. The actual dialog labels/options matched the guide throughout.

An initial final-layout probe selected themes without waiting for the app's theme handler/state. Its theme state was not counted as verified. The final probe waits for the run control and asserts the actual document theme before measuring typography and overflow.

## Final verification status

After the final generated-page build, opened fresh cache-busted browser contexts at 1280px, 390px and 375px in each actual light/dark theme. All six checks confirm the concrete `w0`/`x0` alias definition appears before the W-write rule, the stepping boundary identifies the supplied entry/setup and first fragment instruction, and code computes to 16px without overflow. The three findings are closed.

The final caller instructions now ask the learner to copy the code before leaving the guide or creating the project. In all six combinations, created an assembly project while remaining on the lesson route: the guide hid while the independent project was active, then **Return to lesson** restored both the guide and the edited original lesson draft. No page exceptions or overflow occurred. Inspected the final narrow dark caller screenshot and final alias paragraph screenshots. Evidence: `/tmp/riscv-transfer-closure-results.json` and `/tmp/riscv-transfer-closure-*.png`.

The appendix is discoverable from the collapsed course contents under Further readings. Its Arm exercise link has the intended production URL; the corresponding local built Arm page and named exercise heading both exist. Public deployment of that new target is the parent's release check.

No unresolved learner-flow or functional blocker remains within this review's scope. No screen-reader session or novice formative study was performed.
