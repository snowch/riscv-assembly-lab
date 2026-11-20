# Independent learner and UX review

Copyright © 2026 Christopher Snow

The reviewer did not draft the copy, implement the reference, or generate its recordings. Prerequisites used for this review: simple C and small binary numbers; no prior assembly. This is an agent review, not evidence from a novice learning study.

## Browser checks

Reviewed the built `/lessons/addition/` reference at widths 390 and 1440, in requested light and dark themes. Actual dialog backgrounds were checked: `rgb(245, 249, 248)` and `rgb(16, 30, 28)` respectively. Also checked `/playground/` at width 390.

Looked up add/addi, li, lb, sb, beq, j and ret; inspected their visible syntax, operand rules, prepared source, source-line focus, register states and relevant memory/next-instruction evidence. Read the complete-example and assembly-notation explanations for `.text`, `.global reference_example` and `reference_example:`. Searching `.global` reveals the notation directly. Distinctions between pseudo-instructions, directives, labels and executed instructions are explicit. The entry-point qualification correctly says exporting the name does not select where execution begins.

No page or dialog horizontal overflow was measured in these contexts. Visible code was at least 13.12px. No page errors were observed. Escape closed the reference and restored focus to its header opener at all four width/theme combinations. Addition initially filters to Used in this lesson; the playground omits that irrelevant filter and shows Course instructions. The empty-result message tells learners to broaden the filter.

Exact recorded before/after values and next-label evidence let the reader distinguish the value-reading operation from a destination write. Store examples visibly show the supplied memory bytes before and after; branches show the unchanged inputs and selected next instruction/label. The call example explicitly states that the called function body has not run in its after-state. The prepared reference examples remain distinguishable from the learner's active editor.

The parent has separate automated coverage of paused execution, saved edits/prediction, calculator preservation, load failure/recovery and page position. Those tests are not claimed as independent checks performed by this reviewer.

## Findings

### L1, medium: syntax placeholders rely on optional notation

Quote: `addi rd, rs1, imm` appears in the primary syntax block. The local rules define `imm`, but `rd` and `rs1` are defined only in the collapsed “Reading assembly notation” section. A reader who has learned destination/input register roles has not necessarily learned these placeholder spellings.

Smallest correction: show a concise syntax key near the instruction forms, defining rd as destination and rs/rs1/rs2 as source registers. Keep the detailed header/directive explanation optional until complete program source is opened. The actual t2/t0 example is a useful concrete bridge and should stay.

Status: corrected and independently rechecked in the built reference at widths 390 and 1440, actual light and dark themes. The visible contextual syntax key defines destination/source placeholders and adds immediate, offset and label definitions only for forms that use them. Checked add/addi, lb/sb and beq; the definitions appear before the operand rules and worked example.

### L2, low: the first table heading breaks inside its word on phones

Quote: “Register” renders on two lines as “Regis” and “ter” at width 390 in the add worked example. The first column becomes about 40px wide because the two before/after column headings are longer, and the general overflow-wrap rule permits breaking any word.

Smallest correction: keep the first column's heading together with a suitable minimum width or use the existing short Before/After labels with the source-line scope stated nearby. Preserve contained scrolling for long hexadecimal values.

Status: corrected and independently rechecked at widths 390 and 1440, actual light and dark themes. The first heading has `white-space: nowrap`; its measured phone width is 72.625px. “Register” stays together, and no page horizontal overflow was measured. Original screenshot evidence is in `.artifacts/reference-review/390-light-add.png` and the matching dark image.

## Assumed knowledge

The lookup assumes register/input/destination roles from the first addition lesson and signed/unsigned/hexadecimal readings from the relevant subsequent course material. The reference supplies an optional notation key for aliases, immediates and memory-address syntax. Most instruction-specific requirements, including sign extension and memory order, are defined locally. The tool names GNU, xv6 and QEMU appear in the provenance sentence; that sentence supplies evidence rather than a learner action, but it is not a substitute for the course introductions to those tools.

No unintroduced prerequisite was found that blocks the checked concrete examples once L1 is corrected. Complete-program entry/reporting code remains optional technical inspection and is not presented as something the learner must add to a lesson fragment.

## Final recheck

Both ranked findings are closed. Searching the complete directive line `.global reference_example` now opens the matching notation and suppresses the unrelated empty-instruction message at both widths in both actual themes. The j/ret examples identify the boundary as “Next: supplied result capture” and retain the target label, avoiding unexplained reporter instructions. The disassembly disclosure now explicitly distinguishes GNU disassembly aliases from original source lines. The legacy `/lessons/hello-world/` route exposes the Reference button on phones; opening it showed the reference without page overflow and correctly omitted the lesson-only filter. No new blocking finding arose in this recheck.

### Responsive header recheck

Independently checked the final compact header at widths 320, 390 and 1440, in actual light/dark themes, on both `/lessons/addition/` and legacy `/lessons/hello-world/` (12 contexts). At 320/390, Calculator and Reference each measure 44×44px and have the accessible names and titles “Calculator” and “Reference”; their visual text labels are hidden while their icons remain. Both named controls opened their respective dialogs in every context. The Theme selector is 44px tall and occupies the same navigation row as both tools. There was no page horizontal overflow. At 1440, both tools retain visible text labels and 44px heights, with Theme on the same header row. The actual light and dark background tokens were checked rather than inferred from the selected preference. No new finding.
