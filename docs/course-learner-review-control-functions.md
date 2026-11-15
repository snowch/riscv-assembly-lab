# Learner and browser review: control, memory, products and functions

Copyright © 2026 Christopher Snow.

## Scope and method

Independent review of the 15 lessons in `content/control-memory.json` and eight lessons in `content/products-functions.json`. This reviewer did not author those files. The reviewer authored the earlier state/arithmetic lessons, which are excluded from the reviewed material and were treated only as the learner’s completed prerequisites.

The review used `/workspace/assembly-lab/AGENTS.md`, its binding `CLAUDE.md`, `docs/style.md`, and the RISC-V `docs/course-authoring.md`. The learner can read simple C and small binary numbers, plus the preceding lessons in course order. The browser target was the generated worktree at `http://127.0.0.1:4230/`; repository HEAD was `7a04a3f6cc63fe3ea7ec7892c34d0b17b626926e`, with the new course changes uncommitted. Review and closure checks took place on 15 November 2026, through 12:57 UTC. This is a review of that worktree, not a claim about a deployed site.

Every listed lesson was individually read in source and opened in Chromium at desktop 1440 × 1000 and phone 390 × 1000, in both light and dark themes. The initial views, source/editor readability, prediction wording, input/result timing, navigation and relevant prerequisites were checked. All 92 render combinations produced no page errors, no page-level horizontal overflow and no visible text smaller than 11 pixels. Computed page backgrounds changed with the selected theme. Representative screenshots were also visually inspected, including the phone array lesson, dark division lesson, and the active-frame observations.

## Findings

### L1. Medium, corrected and independently verified: the finished stepping view presented reporter instructions as the next lesson instruction

Affected shared interaction: start stepping, execute a machine instruction, then Continue to completion. Reproduced in `calls-and-returns` and also visible after the active-stack example.

The result badge says **“Finished”**, but Instruction path still shows a next-PC line such as **“PC 0x00000000000100bc. One source line may expand into several machine instructions.”** The instruction above it is **“ADDI sp … fffffffffffffeb0”**, from the supplied register-reporting code rather than the edited lesson fragment. The panel explains that PC holds the address of the **“next machine instruction”**, without marking this final instruction as supplied code or a past observation.

A learner can mistake the reporter’s stack reservation for an instruction still awaiting execution in their own lesson. It also leaves the meaning of “next” inconsistent with the Finished state. Direction: finalise the instruction label at fragment completion, or explicitly distinguish the final historical observation and supplied code from the learner’s next step. Keep the real trace available; no synthetic state is needed.

Evidence: `.artifacts/review-stale-next-instruction-desktop.png` and `.artifacts/review-stack-frames-stepped.png`. Originally submitted to the managing session for the sceptic/fix pass; independently closed by the final rendered checks below.

### L2. Medium, corrected and independently verified: memory offsets mixed unlabelled hexadecimal and decimal

Original `sum-array` view placed **“+16: one-past address”** above a row labelled **“+10”**. Rows used hexadecimal while named offsets used decimal. The caption only said **“Offsets count bytes from lesson_data.”** The same notation occurred in data and stack views. Without an explicit radix, the same byte location appeared to have different offsets.

Direction submitted: make the radix explicit and keep named and row offsets consistent.

The managing session changed row offsets to decimal and added explicit radix captions. This reviewer independently re-opened `loads-and-stores`, `sum-array` and `stack-frames` at both widths. Data views were checked before execution and after a fresh successful Build & Run; stack views were checked after execution. The observed rows were consistently **+0, +8, +16, +24, +32, +40, +48, +56**. The after-run caption explicitly states **“Cells show hexadecimal bytes; row offsets are decimal byte counts.”** Data labels and rows now agree.

All six post-fix runs finished. Desktop closure used the light theme; phone closure used the dark theme. Closure screenshots: `.artifacts/review-radix-fixed-<lesson>-1440.png` and `-390.png` for those three lessons. L2 is closed for those rendered data/stack states; the fix belongs to the shared renderer used by the other memory lessons.

### L3. Low, corrected and independently verified: alignment was used before its plain-English definition

`loads-and-stores` says **“The two transfer locations are aligned to eight-byte boundaries.”** Its explanation then says **“Use naturally aligned addresses while learning the transfer rule.”** The preceding `memory-bytes` lesson defines byte addresses, offsets and pointers, but not alignment. The standard-stack lesson later explains alignment as a multiple of 16; that occurs after this use.

The worked locations are safe and the environment qualification is useful. The learner nevertheless lacks the rule needed to identify another aligned address. Direction: define the address/transfer-size relationship locally before using “aligned” or “misaligned”, retaining the warning that misalignment behaviour depends on the environment. This is a terminology finding, not an observed execution failure.

### L4. Low, corrected and independently verified: “undefined behaviour” first appeared as an unexplained C term

`products` says **“Signed C multiplication is different: an unrepresentable mathematical result has undefined behaviour.”** Earlier lessons explain that signed C addition does not promise wrapping, but do not define this term. The later C-boundary module supplies the deeper discussion.

Direction: give a brief local meaning sufficient for this qualification, or state the consequence in plain language until the dedicated C lesson introduces the term. Preserve the distinction between an executed assembly result and C’s guarantees. The current multiplication exercise itself has a clear assembly contract.

## Per-lesson review coverage

“Four render states” means desktop/phone × light/dark, including initial editor, source prose, input labels and lesson-navigation links. “Run” means the actual Build & Run operation reached Finished. It is not a claim that every possible edited program or every challenge case was checked.

| Lesson | Source and prerequisite check | Four render states | Executed/interaction evidence |
| --- | --- | --- | --- |
| `compare-values` | Comparison produces an ordinary Boolean; signed reading and equal boundary are clear. | Checked | Starter Run finished. |
| `signed-unsigned-comparison` | Holds input bits fixed; defines unsigned comparison and keeps outcomes separate. | Checked | Starter Run finished. |
| `branch-paths` | Defines label, target, taken branch and direct-register comparison before the activity. | Checked | Starter Run; stepping and Continue finished. |
| `choosing-maximum` | Defines `mv`; explains the unconditional jump and accidental fall-through. | Checked | Starter Run finished. |
| `counting-up` | Defines loop, counter, exclusive limit and final observation moment. | Checked | Starter Run; 12 observed step transitions then Continue; separate zero-boundary challenge Run finished. |
| `counting-down` | Count and brightness roles remain distinct; initial zero protection and wrapping failure are explained. | Checked | Starter Run finished. |
| `test-before-body` | Defines pre-/post-test arrangements; two loops begin with separate counters. | Checked | Starter Run finished. |
| `stopping-sentinel` | Defines sentinel; distinguishes matching brightness from exhausting every tick. | Checked | Starter Run finished. |
| `memory-bytes` | Defines byte, address, pointer, symbol address and offset notation before loads. | Checked | Starter Run; byte inspector exercised. Shared offset finding L2. |
| `loads-and-stores` | Explains transfer width, little-endian layout and store footprint. Alignment terminology correction is recorded and closed under L3. | Checked | Starter Run; five step transitions; memory inspection; post-fix data Before/After at both widths. |
| `load-widths` | Distinguishes sign/zero extension from changing a display reading; wider load pairs explained. | Checked | Starter Run; byte inspector exercised. Shared offset finding L2. |
| `narrowing-stores` | Separates stored copy from unchanged source and calls out neighbour preservation. | Checked | Starter Run; phone challenge reference passed all three visible cases. |
| `array-addresses` | Defines element index versus byte displacement and four-byte C pointer element size. | Checked | Starter Run; byte inspector exercised. Shared offset finding L2. |
| `sum-array` | Defines moving pointer versus progress count and keeps the load behind the bound. | Checked | Starter Run; byte inspector; post-fix data Before/After at both widths. |
| `zero-terminated-strings` | Defines terminator, capacity, ASCII and byte-count versus character-count distinction. | Checked | Starter Run; byte inspector; separate zero-capacity challenge Run finished. |
| `products` | Defines product width and retained low half; C qualification terminology correction is recorded and closed under L4. | Checked | Starter Run finished. |
| `high-products` | Explains high/low halves and independent signed/unsigned readings of the same factors. | Checked | Starter Run; five observed step transitions followed by completion. |
| `division-remainders` | Defines dividend, divisor, quotient, remainder and truncation; separates hardware edges from C. | Checked | Starter Run; phone reference challenge passed all four visible cases, including architectural boundaries. |
| `safe-scaling` | Explicit input bounds and upper-bit state justify the wide intermediate; zero-distance rule is local. | Checked | Starter Run finished. |
| `calls-and-returns` | Defines caller/callee, arguments, result convention, `ra`, leaf function and top-level exit distinction. | Checked | Starter Run; seven observed step transitions then completion; separate Step/Continue completion-view repro L1. |
| `preserving-return-address` | Introduces stack pointer, frame, alignment and separate return destinations; release is not erasure. | Checked | Starter Run finished. |
| `stack-frames` | Explains caller-saved/callee-preserved roles and explicitly labels the example’s still-active frame. | Checked | Starter Run; five step transitions, actual stack-byte inspector, Continue; post-fix stack Run at both widths. |
| `recursive-progress` | Defines recursion and base case; distinguishes final observations from an all-frame drawing. | Checked | Start stepping, 12 observed transitions then Continue finished; phone reference challenge passed all four visible cases. |

## Distinct interaction checks and limits

- Real stepping and Continue were exercised for branches, loops, loads/stores, high-product arithmetic, calls, an active stack frame and recursion. Register/state observations and trace entries appeared, and each execution completed.
- The active-frame inspection selected a real byte after stepping and showed its address, decimal, hexadecimal and bit readings. The reporter’s final state was clearly distinguished from a claim to display every intermediate frame. L1 concerns the separate next-instruction label after completion.
- The phone all-case checks used the visible Load reference into editor action, then Check all cases, for narrowing stores, signed division/remainders and recursion. Their visible case counts were 3/3, 4/4 and 4/4. No challenge answers are reproduced in this report. Screenshots that revealed reference solutions were discarded.
- After each checked challenge batch, the pressed case button agreed with the displayed Starting inputs case name. An initial static-code suspicion of stale case selection was therefore rejected against actual current browser evidence.
- Separate phone challenge Runs exercised zero input boundaries for the counted-loop and bounded-string patterns. These were single selected-case Runs, not full challenge-suite claims.
- The first broad execution collector exited with status 1 after 22 starter fragments had reached Finished because the collector tried to click a data Before/After toggle on the stack view. The stack view correctly has no such toggle. A subsequent render collector completed all 23 lessons in all four render states. Separate actual stack stepping/inspection and recursive execution completed successfully. The original collector failure is not reclassified as a passing command or a product failure.
- The reviewer did not run the complete automated test suite, every challenge case in all 23 lessons, malformed/timeout variants of every example, C compilation, or physical hardware. Those are outside this browser-review evidence. The managing session reported broader native/QEMU and xv6 checks separately; they are not counted as this reviewer’s independent runs.

## Prerequisite and mechanism assessment

The inspected sequence introduces labels and branch choices before loops; bytes, addresses and pointer notation before arrays; multiplication halves before scaled division; and call/return before stack preservation and recursion. It retains the strongest source-course distinctions: starting inputs versus results, signed versus unsigned order, width versus filling rule, value versus address, requested work versus useful work, return destination versus return value, and final snapshots versus intermediate states. The original local missing term definitions were L3 and L4; both are closed by the final rendered verification below.

The optional full-program disclosure intentionally exposes later machinery and is not required for the focused activity. It was not treated as a prerequisite that a first-time reader must understand. This report records findings and verification evidence for independent sceptic/checker follow-up; it does not certify untested states.


## Final rendered fix verification

Independent closure checks completed at 2026-11-15 13:01 UTC. Only this review record and optional review images were changed by the checker; content, UI and engine corrections came from the managing session.

- **L1 closed:** at desktop 1440 × 1000/light and phone 390 × 1000/dark, opened `calls-and-returns`, chose Start stepping, executed one Step instruction, then Continue. Both runs reached Finished. The instruction heading now reads **“Your code has reached the reporting checkpoint.”** The location says **“Lesson code ended at PC 0x00000000000100bc. The supplied reporting code runs next.”** This explicitly separates completed lesson code from the supplied reporter and no longer presents the reporter disassembly as a pending learner instruction. Historical trace entries remain available. Screenshots: `.artifacts/review-L1-closed-1440.png` and `-390.png`.
- **L3 closed:** opened the regenerated `loads-and-stores` page at both widths/themes above and checked the actual visible paragraph. It now begins **“Eight-byte alignment means the starting byte address is a multiple of eight.”** That definition precedes the later alignment/misalignment uses. No page-level overflow was observed. Screenshots: `.artifacts/review-loads-and-stores-definition-closed-1440.png` and `-390.png`.
- **L4 closed:** opened the regenerated `products` page at both widths/themes above and checked the actual visible C-qualification paragraph. It now includes **“Undefined behaviour means that C makes no promise about what that program does.”** The local qualification therefore supplies the term’s meaning before the learner needs the later C-boundary module. No page-level overflow was observed. Screenshots: `.artifacts/review-products-definition-closed-1440.png` and `-390.png`.

These targeted closure checks passed. They add two actual Step/Continue executions and four rendered definition checks to the earlier evidence; they are not a rerun of every lesson or challenge state. L2 had already been independently closed with six fresh data/stack executions. No open findings remain from this review’s four reported items.
