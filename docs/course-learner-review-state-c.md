# Independent learner review: state, arithmetic, C and xv6

Copyright © 2026 Christopher Snow.

## Scope and independence

Reviewer: `/root/draft_control_memory`. Reviewed the 17 state/arithmetic lessons and 14 C/xv6/appendix lessons authored by other agents, 31 lessons in total. This reviewer authored `control-memory.json`, which is excluded from the independent verdict. Its linker-definition change below is recorded separately as an author correction requested by the parent.

Read the course prerequisites, the sequence leading into each lesson, the lesson-specific paragraphs, source, prediction, experiment and challenge task. Earlier functions material was read to establish that caller/callee, a0/a1, ra, stack frames and preserved registers were already taught before the C module.

Browser target: `http://127.0.0.1:4230/lessons/<id>/`, Chromium through Playwright. Viewports: desktop 1440 × 1000 and phone 390 × 844. Both actual light and dark themes were selected and measured. These are browser emulations, not physical-phone tests.

## Browser evidence

- 31 actual Build & Run example executions completed with state reports, at desktop width in light theme.
- 124 initial/theme render states were checked across all 31 pages, both widths and both themes. No page-level horizontal overflow, missing active-course navigation, visible text below 11px, or phone button/select/input targets below 40px was found in that sweep. Checkbox label hit areas were not included in that automated size measurement.
- Every C example exposed nonempty actual compiler output; all 31 pages exposed built ELF load segments and complete source after execution.
- Phone course-navigation disclosures opened and exposed the current lesson on all 31 pages.
- No `pageerror` events were recorded in the 31-page sweep.
- Actual stepping followed by Continue completed on addition (desktop/light), c-return-values (phone/dark) and system-calls (desktop/dark). Trace entries advanced and current instructions were shown. The visible PC definition was verified in all three flows.
- Three challenge flows were checked: c-return-values (desktop/light), bit-masks (phone/dark), and system-calls (phone/light). In each, the incomplete starter failed at least one case, a hint became visible, the reference passed all three cases, and an earlier case could be inspected afterwards. This is nine browser-graded reference cases, not a claim that every challenge in the course was manually browser-graded here.

Machine-readable evidence: `.artifacts/review-state-c-browser-results.json` and `.artifacts/review-state-c-interactions.json`. Automation used `.artifacts/review-state-c-browser.mjs` and `.artifacts/review-state-c-interactions.mjs`. Selected full-page screenshots use `.artifacts/review-state-c-*.png`.

The initial/theme sweep is distinct from result-state coverage: all examples ran once, and selected result/step/challenge states were inspected, but every result state was not repeated at all four width/theme combinations. The parent’s full automated suite and independent technical checks are separate evidence.

## Findings and correction checks

### L1. Signedness controls arrive before their explanation — medium, fixed and browser-verified

Initial addition page quoted “Your prediction (signed reading)” and showed “Signed / Unsigned” before the signed-readings lesson introduced those terms. Direction: either introduce the reading locally or defer those controls until the concept is taught.

Current rendered addition page labels the prediction “decimal reading”, hides the signedness selector and advanced bit disclosure, and signed-readings exposes the controls after its definitions. This correction was checked after reload, not inferred from the parent’s account. A related hex-label regression is L4 below.

### L2. Object/linker terms precede their definitions — medium, fixed and browser-verified

The first C lesson originally said the tools “link the resulting object” before defining either an object file or linking. The later elf-entry lesson had the definition, which could not supply prior knowledge to the first C activity. Direction: define the build stages at first use.

The current C-return-values page defines an object file as machine code with unresolved address references and explains what the linker joins and resolves. The revised rendered text was checked. The course introduction now also defines assembler/linker. The sibling linker use in memory-bytes was corrected by this reviewer as its author, at the parent’s request: “The linker is the build tool that assigns final code and data addresses before execution.” That clause was subsequently verified in the rendered page, but it is not presented as an independent review of this reviewer’s own lesson.

### L3. Mathematical power notation resembles C XOR — medium, fixed and browser-verified

The two’s-complement appendix originally used code-formatted `2^64 - 1 - x` for a mathematical exponent. A C reader has just learned XOR and can read `^` as that operator. Direction: use unambiguous mathematical wording or rendering.

The current rendered appendix uses “the unsigned maximum minus x” and no longer contains that caret expression. Verified after reload.

### L4. Hexadecimal question labelled as decimal — medium, fixed and browser-verified

After the signedness gate correction, the hexadecimal page asks “What hexadecimal value will t2 hold after the adjustment?” but its field says “Your prediction (decimal reading)”. Direction: preserve a hexadecimal-specific label once hexadecimal is introduced, while deferring Signed/Unsigned terminology until the signed-readings lesson. This mismatch was reproduced and sent to the parent. After regeneration, the rendered field says “Your prediction (hex reading)”; independently verified after reload.

### L5. Prediction input rejects the minus symbol used in prose — low, fixed and browser-verified

Several lesson paragraphs print a typographic minus, “−”. A negative prediction pasted with that symbol is rejected after a successful run with “Use a whole decimal number, 0x hexadecimal or 0b binary for the prediction.” Direction: normalise the minus used by the lesson for human prediction input, or consistently teach the required input notation. This finding concerns the prediction field; it does not ask the GNU assembler to accept nonstandard source syntax. The human-input parser now normalises the typographic minus. A fresh arithmetic-shifts Run accepted the pasted symbol and graded the matching prediction successfully; independently verified in the browser.

### L6. Reuse wording can blur a read with a write — low, fixed and browser-verified

Register-reuse says “Follow the changing value in t0 across both operations.” Its final subtraction writes t2, while t0 retains the preceding sum. Direction: distinguish following a value through a later read from changing that register again. The source itself and later explanation correctly identify the observation moment, so this was a local precision improvement rather than a wrong executed example. Current rendered prose explicitly distinguishes updating t0 from reading it to write t2; verified after reload.

### L7. Zero can name a register or a value — low, fixed and browser-verified

Zero-register says “The first line below attempts to write zero.” The shown instruction targets the register named zero while supplying another value. Direction: name the zero register explicitly when discussing the attempted destination write. The subsequent fixed-register explanation is correct, so this was an identifier/value ambiguity rather than an architectural error. Current rendered prose says “the register named zero”; verified after reload.

### L8. Current operation is remote from mobile step controls — medium, fixed and browser-verified

The phone C-return-values step view keeps Step instruction/Continue in the sticky toolbar, while the decoded current operation appears only in the “Instruction path” panel below the source and result panes. A reader working in the source pane cannot see that machine operation without moving to another part of the page. Direction: expose a compact current operation/location beside the paused controls while retaining the full path below. The source authoring guidance specifically asks for the current operation near the controls at narrow widths. The actual step/Continue mechanism works; this is an observation-layout issue. Initial evidence: `.artifacts/review-state-c-step-c-return-values.png`. The current paused toolbar now shows an actual decoded machine instruction for C; after a step it changes to the next instruction. On phone/dark, after scrolling into the register view, the operation remains in the viewport immediately beneath the controls. It hides after Continue completes. These states were checked in the browser, with final evidence in `.artifacts/review-state-c-sticky-operation-phone-dark.png` and `.artifacts/review-state-c-fixes.json`.

## Rejected or qualified concerns

- PC terminology was initially queried before using the step controls. On opening stepping, the page already gives the local definition “The program counter (PC) holds the address of the next machine instruction.” It is available when needed. No missing-definition finding remains.
- The first page’s 64-bit statement is scoped by the course introduction, which explicitly selects 64-bit RISC-V/RV64GC. It need not be read as a claim about all RISC-V variants.
- The C views expose actual raw compiler disassembly and label it as such. They do not promise one-to-one C/source instruction mappings, and no invented line association was found.
- Result tests cannot prove every absence of an out-of-bounds read or every termination property. The lessons qualify bounds/progress, distinguish missing reports from values, and do not claim that one successful run proves all possible inputs safe.

## Per-lesson understanding pass

Each row records initial/theme coverage and the example run; the notes identify what the page assumes and where its new mechanism is supplied. No challenge answers are reproduced.

| Lesson | Width/theme states | Example run | Prior knowledge and local teaching |
|---|---:|---|---|
| addition | 4 | Finished | Registers, operands, destination and li are introduced locally. Signedness labels were premature; see L1 closure. |
| constants-and-inputs | 4 | Finished | Immediate operands and their range are introduced before use; register roles are prior knowledge. |
| register-reuse | 4 | Finished | Subtraction direction and reading old values are explicit; one wording ambiguity is noted as L6. |
| instruction-order | 4 | Finished | Uses only previously introduced arithmetic; observation moment is explicit. |
| zero-register | 4 | Finished | x0/zero aliases and discarded writes are introduced locally; minor identifier wording noted as L7. |
| hexadecimal | 4 | Finished | Hex digits, four-bit groups and 0x are introduced locally; field-label mismatch was corrected and verified as L4. |
| signed-readings | 4 | Finished | Signed/unsigned weights are introduced locally, with the same-pattern distinction explicit. |
| building-constants | 4 | Finished | LUI placement, sign extension and signed low immediate are explained before the activity. |
| word-arithmetic | 4 | Finished | Word-result width and sign extension are explicit; independent operations use the same inputs. |
| addition-wraps | 4 | Finished | Exact mathematical sum is distinguished from stored bits; no Arm flag behaviour is assumed. |
| carry-without-flags | 4 | Finished | SLTU and a Boolean carry result are defined locally; the old input must remain available. |
| signed-overflow | 4 | Finished | SLT, SLTI and Boolean XOR are explained before the directional overflow check. |
| elapsed-time | 4 | Finished | The normally advancing counter and less-than-one-turn assumption are explicit. |
| bit-masks | 4 | Finished | AND and the distinction between a mask result and a Boolean result are introduced locally. |
| set-clear-toggle | 4 | Finished | Independent OR/AND/XOR operations, sign-extended clear masks and preservation are explicit. |
| logical-shifts | 4 | Finished | Shift positions, masks and replacement order are explained; register-count masking is qualified. |
| arithmetic-shifts | 4 | Finished | Sign copying, rounding down and signed division truncation are distinguished; input-notation issue L5. |
| c-return-values | 4 | Finished | Arguments, returns and stack knowledge are supplied by earlier function lessons; object/linker gap fixed as L2. |
| c-decisions | 4 | Finished | Signed cap versus a two-sided clamp and the nonnegative upper-limit precondition are explicit. |
| c-loops | 4 | Finished | Initialisation/test/update order and the bounded count are visible before use. |
| c-memory | 4 | Finished | Array initialisation, pointer scaling and valid subscripts are explicit; no fixed compiler storage choice is promised. |
| c-integer-widths | 4 | Finished | Sizeof, target type widths, unsigned narrowing and narrow-argument extension are defined locally. |
| c-overflow-contracts | 4 | Finished | Defined unsigned wrapping and undefined signed overflow are separated; executed cases use defined C. |
| checked-addition | 4 | Finished | Boolean result versus saturated-sum contract is explicit; unsigned checking stays unsigned. |
| system-calls | 4 | Finished | Register arguments, xv6-specific call number, byte count and return value are defined locally. |
| elf-entry | 4 | Finished | Object/linker, ELF entry, process entry versus ordinary return, and current-source versus past-run states are explicit. |
| memory-protection | 4 | Finished | Mapped-memory permission and application-level capacity are distinguished; a missing report is not treated as a number. |
| trip-computer | 4 | Finished | Record layout, bound, mask meaning, leaf helper and observation moment are stated before the combined example. |
| twos-complement | 4 | Finished | Top-bit weighting, complement and fixed-width negation are explicit; ambiguous exponent notation fixed as L3. |
| riscv-and-arm | 4 | Finished | The comparison identifies architecture, width, ABI and environment as separate contracts; no Arm execution is claimed. |
| floating-point-bits | 4 | Finished | Binary32 fields and special cases are introduced; integer execution and numeric interpretation are clearly separated from native FP execution. |

## Verdict after targeted rechecks

All accepted findings L1–L8 have independently verified rendered corrections. No outstanding blocker was found in the assigned 31-page scope. The fix checks are recorded in `.artifacts/review-state-c-fixes.json`; the full 124-state sweep was not rerun after every local correction, so the final course-wide automation remains separate evidence.

## Remaining limits

All 31 assigned pages were individually read and rendered. No physical board, firmware boot, native floating-point arithmetic, screen-reader interaction, or non-Chromium browser was tested by this reviewer. Intentional fault/long-loop experiments were read for clarity; their platform-level correctness belongs to the independent technical checks unless named above. Later edits affecting accepted corrections or reviewed components need targeted rechecks.
