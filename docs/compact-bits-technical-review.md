# Compact bits independent technical review

Reviewed 16 November 2026 on `fix/compact-calculator-bits` by an independent Codex review agent, using the parent session's inherited model and effort. This agent did not draft or edit the implementation or learner copy. No blocking technical finding remains in the reviewed files.

## Scope and sources

Read `docs/compact-bits-brief.md`, `docs/compact-bits-copy.md`, `docs/course-authoring.md`, `site/course/calculator.js`, `site/course/calculator.css`, `site/course/calculator-model.js`, `content/guides/tool-context.json` and the generated `site/course/tool-context-copy.js`. Applied the independent-review requirements imported from Assembly Lab's `AGENTS.md`, `CLAUDE.md`, `docs/style.md`, `docs/authoring.md` and `.agents/skills/learning-design/SKILL.md`. Assembly Lab was read only.

The checked RISC-V source extracts at `/tmp/riscv-audit-rv32.txt` describe arithmetic overflow being ignored, retention of low XLEN bits and explicit branch-based overflow checks. `/tmp/riscv-audit-rv64.txt` describes low 32-bit W results and sign extension. These support the copy's distinction between this scratch calculation and architectural execution; displaying these carries does not imply hardware condition flags.

## Browser checks

Ran fresh Chromium contexts against the locally served built site at `http://127.0.0.1:4220/lessons/addition/`, at 1440×1000 and 390×844, in explicitly selected light and dark themes. Confirmed the actual theme and dialog backgrounds: light `rgb(245, 249, 248)`, dark `rgb(16, 30, 28)`. Inspected a screenshot from each combination. No document horizontal overflow or browser page errors occurred.

A separate review script calculated a ripple-carry oracle one column at a time, independently of `calculatorAdditionCarries`. It compared every displayed incoming carry and retained result digit, both widths, for three inputs in each of the four viewport/theme combinations: 24 rendered arithmetic cases.

| A plus B | Widths | Carry into top bit | Out | Signed overflow | Retained result |
| --- | --- | --- | --- | --- | --- |
| Largest positive signed pattern plus 1 | 32 and 64 | 1 | 0 | Yes | Top bit 1; all lower bits 0 |
| All-one pattern plus 1 | 32 and 64 | 1 | 1 | No | All zeros |
| 15 plus 1 | 32 and 64 | 0 | 0 | No | 16 |

The carry row starts with the incoming carry for each numbered retained bit. Out is an additional unnumbered position beyond bit 31 or 63. Each row has exactly the selected width of numbered cells; operand and result Out positions are blank. Its accessible description explicitly says it is not part of the retained result. Measured all corresponding cell left edges across Bit, Carry in, A, B and Result: they match exactly in the checked cases. The editable A cells match the span cells after the integration fix adding `min-width: 0; padding: 0`.

Checked the following state transitions in all four viewport/theme combinations:

- First opening starts at the low bits. Show carries is visible, unchecked and disabled, with “Calculate to show carries.” visible before a result exists.
- A completed addition enables carries. Changing Signed/Unsigned retains the exact result pattern and updates its readings; the carry pattern remains correct. A final focused browser check confirmed the pending `aria-describedby` exists initially, is removed after a fresh calculation, and returns after an edit, matching the visible pending explanation.
- Editing A, editing B, invalid input, an invalid Calculate attempt, changing operation and changing width remove the prior result and its carry row. The addition control becomes disabled with the pending explanation where applicable.
- Subtract and Shift left hide the carry control, carry help and Out column, before and after calculation. Returning to Add requires a fresh calculation.
- An interior retained column's viewport position changes by less than one pixel across carry on/off, reading changes and edits. This checks the retained column position, not merely the numeric scroll offset, because Out changes grid width.
- Explicit High bits stays at the high end when carries reappear. Low bits stays at the low end after a bit edit. Collapsing/reopening Compare the bits and closing/reopening the calculator preserve the selected interior scroll position. Width changes move to the new word's low bits.
- Editing bit 0 preserves keyboard focus on the replacement bit button. In a separate phone keyboard check, ArrowLeft scrolls the focused region, Enter activates Low bits, Space edits A and toggles carries, Ctrl+Enter calculates, and Escape closes the dialog and returns focus to its opener.

Review scripts were run from `/tmp/compact-technical-review.mjs` and `/tmp/compact-keyboard-review.mjs`, both exit 0. Screenshot evidence was inspected at `/tmp/compact-technical-{1440,390}-{light,dark}.png`.

## Findings and decision

Keep the current implementation and copy. The incoming-carry formula agrees with the independent ripple oracle, the extra Out column is separate from retained bits, corresponding rows align, and the existing result invalidation contract is preserved. The mechanism text accurately distinguishes carry-out from signed overflow and states that RISC-V does not record arithmetic condition flags.

The integration author reported an earlier editable-cell padding regression while this review was running. The current source contains the correction, and independent browser geometry checks verify it. This is closed for the reviewed state. No additional correction was requested by this technical pass; no findings were rejected without evidence.

These are local technical and rendering checks, not a novice study or a claim of complete accessibility. Screen-reader output, browsers other than Chromium and physical touch hardware were not tested. Full CPU tests and paused-program isolation are left to the parent integration checks, as requested; source inspection confirms the calculator remains a separate mathematical scratch tool. This review does not establish GitHub publishing or merge status. Recheck any affected result if the implementation changes after this pass.
