# State and arithmetic clarity audit

Copyright © 2026 Christopher Snow.

Read-only learner-clarity audit on `review/learner-clarity`, 17 November 2026. Reviewed the original canonical `content/state-arithmetic.json` snapshot before integration changes. The reviewer did not edit canonical content or implementation. Proposed wording is a separate drafting record for the integration pass and subsequent independent technical review, not a claim that the final changes have been validated. Used the inherited model without an override and applied `docs/course-authoring.md`, the imported authoring/style guidance and learning-design skill.

## Coverage and retained material

All 17 objects were read sentence by sentence: title, summary, objectives, every before/explanation paragraph, prediction prompt/hint, experiment task/hint, challenge task/starter/reference/hints/case names and fixtures, observed/result registers, and provenance/reference metadata. Shared generated headings and controls were checked separately in the live interface. Unlisted sentences are retained. No starter, challenge case, expected result, instruction semantic rule or exercise reference is proposed for change.

| Reviewed ID | Main retained teaching route |
| --- | --- |
| addition | Add two register values |
| constants-and-inputs | Add a constant |
| register-reuse | Read and replace a register |
| instruction-order | Follow instructions in order |
| zero-register | Use the zero register |
| hexadecimal | Read hexadecimal |
| signed-readings | Read one pattern two ways |
| building-constants | Build a larger constant |
| word-arithmetic | Calculate with the low 32 bits |
| addition-wraps | Keep the bits that fit |
| carry-without-flags | Check unsigned carry explicitly |
| signed-overflow | Check the signed range |
| elapsed-time | Measure ticks across a wrap |
| bit-masks | Keep selected warning bits |
| set-clear-toggle | Set, clear and toggle warnings |
| logical-shifts | Move and replace a field |
| arithmetic-shifts | Shift a signed reading right |

The first five lessons correctly establish registers, operands, immediates, destination-first notation, instruction order and read-before-write reuse. The hexadecimal grouping, two readings of one pattern, explicit LUI/sign-extension rule, independent add/addw comparison, separation of unsigned carry from signed overflow, one-turn counter assumption, mask-position rule and logical/arithmetic filling contrast are worth keeping. Existing explanations of independent versus chained operations, preserving inputs and automatic low-bit retention are particularly useful. Their related exercise cases include fresh inputs and relevant boundaries; no case/reference change is justified by this audit.

## Checked interface and technical facts

- All 17 original examples load their teaching constants in editable `li`/`lui` source. The lesson’s Starting inputs panel describes supplied state; it is not a setup form. Exercise inputs come from the selected case and must not be overwritten with worked-example constants.
- Build & Run executes the fragment and captures its completed registers. Registers is the output tab; Output contains console text. A card marked Result remains the lesson’s requested register even when an experiment changes an instruction’s destination. The proposed zero-destination task therefore names zero/t0 directly.
- Hexadecimal cards become visible at hexadecimal. Decimal reading appears at signed-readings; it switches the decimal interpretation of the same pattern. Inspect the register bits has the Register selector and High bits/Low bits controls. A reading switch, opening a disclosure and scrolling bits do not execute code.
- Source cross-checks: `tools/build-course.js` UI gating; `site/course/workbench-markup.js` controls; `site/course/workbench-controller.js` register rendering, reading and prediction feedback; `site/course/builder.js` execution boundary. ISA facts were checked against `/tmp/riscv-audit-rv32.txt` (register/immediate operations, comparisons and sign extension) and `/tmp/riscv-audit-rv64.txt` (LUI, W operations and shifts).

## Shared blocker: an instructed edit can look like a mistake

**P2, shared controller, integration owner notified.** With the original addition, prediction 12 matched the actual run. Changing only the two li constants to 19/23 ran successfully and produced the new sum, but retained feedback said “Revisit the operand order and reading, then try a fresh input.” This is not evidence that the instructed edit is wrong. `checkPrediction()` compares the old text against the current run and uses corrective wording even when that text came from an earlier source version. Keep successful execution distinct from a prediction comparison. Either bind the prediction to its source version and explain when it is stale, or use neutral current-run comparison feedback that does not diagnose a source error. Lesson wording alone cannot resolve this.

Original route: fresh addition → enter the original prediction → Build & Run → matching prediction feedback. Edited route: change only the two li constants → Build & Run → Finished and fresh register cards, with the old prediction still present. Browser evidence records both states.

## Repeated prediction hint

**P2, all 17 `prediction.hint` fields.** The identical “Follow the instruction inputs in order, then inspect the requested register after the fragment” is an execution instruction where the reader needs a reasoning hint before running. Replace it with the lesson’s mechanism; do not insert an expected numerical answer. Exact proposed replacements follow within each lesson record.

## Per-lesson findings and proposed wording

Execution convention for every record below: use a fresh browser context at `/lessons/<id>/` so the unchanged starter is loaded without overwriting a saved user draft. Predict if desired, choose Build & Run, wait for the completed capture, then inspect the named Registers cards. For the edited route use the exact source variant in `/tmp/clarity-state-experiments.json`, execute again and make the stated comparison. Each variant keeps the original instruction sequence except the requested operand/order/repetition change.

### addition

**P2.** experiment.task says “Change the starting values” and “Predict the destination”. The preparation panel is read-only, the editable constants are in the li lines, and the intended prediction is a value, not a register name.

Checked facts: All three starter lines are editable; add writes t2 and leaves t0/t1 alone. The edited run was executed in the browser.

Proposed prediction.hint:

> The li lines prepare t0 and t1. Add the values read by the final add; neither input is its destination.

Proposed experiment.task:

> Change `li t0, 7` to `li t0, 19` and `li t1, 5` to `li t1, 23` in the editor. Predict the value in t2, then choose Build & Run. In Registers, check t0 and t1 beside t2: did the add change either input?

Original and edited execution route: Original and edit: Registers t0/t1/t2 after the whole fragment; compare the input cards as well as the Result card.

### constants-and-inputs

**P2.** experiment.task names the adjustment and “more than one starting value” without identifying either editable operand. A new assembly reader can confuse changing the prepared input with changing li.

Checked facts: The first line loads t0; the last operand of addi is the adjustment. There is no lesson setup editor.

Proposed prediction.hint:

> Read t0 from the li line, then apply the final numeric operand of addi. addi does not replace its input with the immediate alone.

Proposed experiment.task:

> Change `addi t2, t0, 3` to `addi t2, t0, -4`. Choose Build & Run first with the existing `li t0, 18`, then with that line changed to `li t0, 30`. In Registers, compare t0 and t2 after each run. Does the adjustment replace t0?

Original and edited execution route: Original and each edit: Registers t0 and t2 after completion. Repeat with both proposed li values; keep the same negative immediate.

### register-reuse

**P3.** The experiment already gives the exact final instruction and a useful prediction question. Retain both; name the run and observation that test the prediction.

Checked facts: Only sub source order changes. The preceding add has already replaced t0.

Proposed prediction.hint:

> First update t0 with the add. The final sub reads that updated value, with its third operand subtracted from its second.

Proposed experiment.task:

> Change the final instruction to `sub t2, t1, t0`. Predict how reversing only the two inputs changes the result, then choose Build & Run. In Registers, compare t2 with the earlier result. Which stored values did the subtraction read?

Original and edited execution route: Original and edit: Registers t0/t1/t2 after completion; compare the final subtraction result with the earlier observation.

### instruction-order

**P3.** The experiment correctly asks which write discards the correction. Make the moved line and the unchanged load order explicit so the learner does not move initialisation along with the correction.

Checked facts: addi t2,t2,-2 is the correction. Moving it just before add leaves both input loads first; add is then the final write to t2.

Proposed prediction.hint:

> The final addi reads the sum already written to t2. Carry that value forward instead of using t2’s starting value.

Proposed experiment.task:

> Move `addi t2, t2, -2` immediately before `add t2, t0, t1`, leaving both li lines first. Predict the final t2, then choose Build & Run and inspect t2 in Registers. Which write discards the correction?

Original and edited execution route: Original and edit: Registers t2 after all four lines, rather than a paused intermediate value.

### zero-register

**P2.** before[2] says the “next line” reads zero. The next line is li t0,8, which does not read zero; the final add does. challenge.task also uses “signed” before signed-readings introduces the term. The experiment itself is sound and only needs a concrete source/run/restore route.

Checked facts: The zero write is discarded. Browser execution of the original and final-destination edit confirmed fixed zero and unchanged t0.

Proposed prediction.hint:

> The attempted write cannot change zero. Work out which values the final add actually reads.

Proposed experiment.task:

> Change the final instruction to `add zero, t0, zero`, then choose Build & Run. Check t0 and zero in Registers: did discarding the sum change either source? Restore the destination t2 before continuing.

Proposed before[2]:

> The first line below attempts to write the register named `zero`. Predict the final result using the value that the final add actually reads. Treat the fixed register rule as part of the machine, not a convention that your program may choose to ignore.

Proposed challenge.task:

> A working value arrives in t0. Put its negation into t2 using zero as an input. Preserve t0.

Original and edited execution route: Original and edit: Registers zero and t0 after completion. Restore add’s destination t2 afterwards; do not interpret the unchanged Result-card designation as the destination of the edited add.

### hexadecimal

**P2.** before[0] leaves A–F’s numeric mapping implicit. before[2] says “Load the example”, although it is already loaded, and tells the reader to compare before it finally asks for a prediction. The experiment’s notation comparison is useful; retain it and specify its actual li edit and fresh letter-digit input.

Checked facts: The loaded starter is editable; hexadecimal register cards become visible on this lesson. 0x prefix and letter case change notation, not the bit pattern.

Proposed prediction.hint:

> Keep the place value of 0x10 distinct from decimal 10. Add the hexadecimal values, carrying into the next digit position if needed.

Proposed experiment.task:

> Change `li t0, 0x2a` to `li t0, 42`. Choose Build & Run and compare the hexadecimal patterns for t0 and t2 with the previous run. Then try `li t0, 0x3b` and predict the new sum before running. Does changing notation alone change the stored bits?

Proposed before[0]:

> Hexadecimal writes a bit pattern more compactly than binary. Each digit describes four bits. The digits run from 0 to 9, then A to F for the values ten through fifteen. Upper-case and lower-case letters mean the same thing.

Proposed before[2]:

> Predict the sum in the two lines below before choosing Build & Run. Afterwards, compare the decimal and hexadecimal readings in the t0 and t2 register cards. Leading zeros in a displayed 64-bit pattern make its width visible. They do not change its value.

Original and edited execution route: Original and decimal-notation edit: compare t0/t2 hexadecimal cards after completion. Then predict/run the fresh hexadecimal input; keep addi’s adjustment unchanged.

### signed-readings

**P2.** before[0] first relies on numbered bit positions without saying where numbering starts. before[2]/experiment.task ask for two decimal readings and a “hexadecimal top bit” without identifying the actual Decimal reading selector or bit inspector.

Checked facts: The initial Decimal reading is Unsigned. Switching Signed/Unsigned changes the displayed decimal values while the hexadecimal cards stay fixed. Bit inspection has a Register selector and High bits control.

Proposed prediction.hint:

> The copy leaves every bit unchanged. For a negative signed reading, add one full 64-bit range to find the unsigned reading of the same pattern.

Proposed experiment.task:

> Change the first line to `li t0, -1`, then to `li t0, 1`, choosing Build & Run each time. In Registers, compare t2 under both Decimal reading choices and check that its hexadecimal pattern stays unchanged when you switch readings. Open Inspect the register bits, select t2 and choose High bits. How does the top bit relate to the two decimal readings?

Proposed before[0]:

> An unsigned reading treats every set bit as a positive place value. A signed two’s-complement reading gives the top bit a negative weight and keeps the lower bit weights positive. Bit positions are numbered from zero at the right, so the top bit of a 64-bit register is bit 63.

Proposed before[2]:

> Loading a negative constant gives the assembler a way to describe its two’s-complement pattern. The example copies that pattern without changing it. Predict the unsigned reading of t2, then choose Build & Run. In Registers, use Decimal reading to compare Unsigned and Signed while checking that the hexadecimal pattern stays the same.

Original and edited execution route: Original and each li edit: completed t2 in Registers, both Decimal reading choices; then Inspect the register bits → Register t2 → High bits. Switching reading is not another execution.

### building-constants

**P2.** experiment.task says “inspect t0 before interpreting it as unsigned” without a run or observation moment. This can sound like a request for an intermediate pause, although the result capture is sufficient and t0 is unchanged by the later addi.

Checked facts: LUI first forms a 32-bit pattern and RV64 sign-extends it. addi writes t2. Both t0 and t2 are observed; selecting a decimal reading leaves the pattern alone.

Proposed prediction.hint:

> Track where lui places each hexadecimal digit. Then add the low adjustment, keeping the full 64-bit pattern.

Proposed experiment.task:

> Change the first line to `lui t0, 0x80000` and choose Build & Run. In Registers, compare t0’s hexadecimal pattern under the Signed and Unsigned Decimal reading choices. Which upper bits came from copying bit 31, and which changes are only changes of reading?

Original and edited execution route: Original and changed lui: after Build & Run compare t0’s hexadecimal card and Signed/Unsigned decimal readings, not only the highlighted t2.

### word-arithmetic

**P2.** The experiment asks to “Use” inputs without naming their li operands, and its second application leaves the reader to invent a suitable upper-bit pattern. Give one precise fresh pair while retaining the comparison of two independent additions.

Checked facts: Both operations read the same t0/t1. addw keeps the low 32 result bits and copies bit31 upwards; all four registers are already observed.

Proposed prediction.hint:

> Keep the low 32 bits of the sum first. Use bit 31 of that result to fill every upper position in t3.

Proposed experiment.task:

> Change the two li lines to load `0xffffffff` into t0 and 1 into t1. Choose Build & Run and compare the full hexadecimal patterns in t2 and t3. Then use `li t0, 0x100000003` with t1 still 1. Predict which upper bits add and addw will keep before running again.

Original and edited execution route: Original and both edited pairs: compare full hexadecimal cards t2 (add) and t3 (addw) after completion; inputs remain t0/t1.

### addition-wraps

**P2.** objectives[1]/before[2] introduce a “flag” and Arm-style flags without defining that extra machine concept. The lesson only needs to distinguish retained bits from a separate range check. experiment.task also leaves all-ones and the loaded adjustments implicit.

Checked facts: add retains the low 64 bits. It does not automatically write an extra carry/overflow result. The lesson has no flag display to inspect.

Proposed prediction.hint:

> Find the exact unsigned sum, then keep only its lowest 64 bit positions.

Proposed experiment.task:

> Change the first line to `li t0, 0xffffffffffffffff`. Run with the second line loading 0, then 1, then 2 into t1. Predict t2 before each Build & Run. In Registers, select Unsigned for Decimal reading and compare t2 with the inputs. At which run does the stored sum become smaller than t0?

Proposed objectives[1]:

> Explain fixed-width wrapping.

Proposed before[2]:

> The example places a value close to the top of the range in t0. Read t0 and t2 as unsigned for this prediction. RISC-V add does not automatically store a separate result saying whether the unsigned or signed range was exceeded. The next lessons build explicit checks when the program needs them.

Original and edited execution route: Original and each edited t1 constant: Registers with Decimal reading Unsigned; compare t2 with t0/t1 after completion.

### carry-without-flags

**P2.** before[0] starts with a carry flag before defining unsigned carry. experiment.task says “two distinct questions” without naming the comparison the reader should explain. Keep the two input patterns but identify li edits and t3 versus t2.

Checked facts: An unsigned carry means the exact sum needs another bit. sltu writes its explicit comparison result to t3 and preserves the sources.

Proposed prediction.hint:

> Find the stored sum in t2, then compare it with the unchanged t0 as unsigned values. sltu writes one only when its left input is smaller.

Proposed experiment.task:

> In the two li lines, first load `0x7fffffffffffffff` into t0 and 1 into t1, then load -1 into t0 with t1 still 1. Choose Build & Run for each pair. Compare the carry result in t3 and the sum in t2 in Registers. Why can the two pairs need different unsigned carry results?

Proposed before[0]:

> An unsigned carry means the exact sum needs more than the register’s 64 bits. RISC-V add keeps the low result bits but does not record that carry automatically. If the program needs a carry check, it computes a separate result. Here the check writes zero for no carry or one for carry.

Original and edited execution route: Original and both edited pairs: Registers t2 stored sum and t3 carry result after completion; original t0 remains available for the comparison.

### signed-overflow

**P2.** The experiment requires the reader to invent two negative inputs crossing the 64-bit lower boundary before it can test the taught mechanism. It then says “compare the direction checks” without mapping the available register observations to those checks.

Checked facts: t3 holds the sign predicate; t4 is overwritten by XOR, so its completed value is overflow, not the intermediate slt result. The observed direction can still be inferred by comparing completed signed t2 and t0.

Proposed prediction.hint:

> Predict t3 from t1’s sign. Separately decide whether the stored signed sum is below t0. The final xor asks whether those two answers differ.

Proposed experiment.task:

> In the two li lines, first load `0x8000000000000000` into t0 and -1 into t1. Choose Build & Run and compare the signed sum in t2 with t0, alongside the sign check in t3 and overflow result in t4. Then repeat with t0 = -7 and t1 = 3. Why does comparing directions reveal more than looking only at the sum’s sign?

Original and edited execution route: Original and both edited pairs: Signed Registers t0/t2, sign check t3 and completed overflow result t4. Do not describe final t4 as the raw direction check. If inspecting raw slt, explicitly use stepping before xor, which this proposed task does not require.

### elapsed-time

**P2.** before[1] uses unexplained “modulo”; explanation[0] describes high bits a negative mathematical difference “would need”, which distracts from the fixed-width result rule. experiment.task gives semantic aliases but not the actual li edits or Unsigned control.

Checked facts: t1 is then, t0 is now. sub writes the low 64 bits. The stated less-than-one-turn assumption is essential and should remain.

Proposed prediction.hint:

> Count forwards from the earlier reading to the wrap boundary, then from the start of the range to the later reading. Use the stated limit on elapsed ticks.

Proposed experiment.task:

> Change the li lines to load 40 into t1 (then) and 53 into t0 (now). Choose Build & Run and read t2 in Registers with Decimal reading set to Unsigned. Then load 40 into both registers and run again. What does each interval establish when fewer than one full counter turn has passed?

Proposed before[1]:

> `sub t2, t0, t1` keeps the low 64 bits of now minus then. If now is numerically smaller because the counter wrapped once, the stored result still gives the forward interval around the counter’s range.

Proposed explanation[0]:

> The counter and the subtraction use the same width. The subtraction keeps only 64 result bits. Under the stated limit on elapsed ticks, those bits give the forward interval even when now is smaller than then.

Original and edited execution route: Original and edited pairs: completed t2 with Decimal reading Unsigned. Equal observations only imply no elapsed ticks under the stated counter assumption.

### bit-masks

**P2.** The experiment’s exact mask changes are useful and should remain. Its instruction to inspect “positions” needs the visible bit-inspector route, because the ordinary output is decimal/hex cards.

Checked facts: Only the last operand of andi changes. The register bit inspector can select t2 and navigate to its low positions.

Proposed prediction.hint:

> The mask selects bit 3. Keep that source bit if it is set and clear every other result position.

Proposed experiment.task:

> Change the mask in `andi t2, t0, 0x08` to `0x03`, then to `0x30`, choosing Build & Run each time. Compare the hexadecimal t2 patterns in Registers. To inspect positions, open Inspect the register bits, select t2 and choose Low bits. Which positions survive each mask?

Original and edited execution route: Original and each changed mask: completed hexadecimal t2 in Registers; Inspect the register bits → Register t2 → Low bits for individual positions.

### set-clear-toggle

**P2.** The experiment says apply operations twice “through the same destination”, but does not state that the second operation must read the first result. Duplicating xori t4,t0,2 merely repeats an independent calculation. Also define register-register or when OR is introduced, before logical-shifts uses it. Retain the existing explicit independence explanation.

Checked facts: Chained second xori must read t4, and second ori must read t2. Browser execution confirmed the differing repeated-operation effects. or and ori use register versus immediate second inputs.

Proposed prediction.hint:

> Follow the andi that writes t3. It reads the original t0, not the separate results in t2 or t4.

Proposed experiment.task:

> Keep the first line and the independent clear operation. After `xori t4, t0, 2`, add `xori t4, t4, 2`. After `ori t2, t0, 1`, add `ori t2, t2, 1`. Choose Build & Run and compare t4 and t2 with t0 in Registers. Explain why a second toggle and a second set have different effects.

Proposed before[0]:

> OR writes one where either input bit is one. OR with a mask therefore sets selected positions without clearing any others. `or` takes two register inputs; `ori` uses an immediate mask. XOR writes one where corresponding bits differ, so `xori` toggles the positions selected by its mask.

Original and edited execution route: Original and chained edit: completed t4/t2 against original t0 in Registers. Keep the independent clear to t3 unchanged.

### logical-shifts

**P2.** “Field” is used as a technical noun without a direct definition. The experiment requires inventing a neighbouring-bit-only change. Supply a concrete changed pattern to test the original extraction. challenge.hints[2] calls a full 64-bit pattern a “word”, which can be confused with the 32-bit W operations just taught.

Checked facts: Positions4–6 are the three-bit field. Changing 0x2a to 0xaa changes only bit7, outside it. The two original extraction instructions need no change. The register-register or form is covered by the proposed earlier OR definition.

Proposed prediction.hint:

> Move the original pattern right by four positions before applying the mask. Keep only the three new low positions.

Proposed experiment.task:

> Change only the first line to `li t0, 0xaa`, then choose Build & Run. Compare t2 in Registers with its previous value. Use the hexadecimal patterns, or Inspect the register bits with Low bits selected, to identify the changed input bit. Why does a change outside positions 4 through 6 leave the extracted field unchanged?

Proposed before[1]:

> A field is a group of bit positions that holds one value. The warning pattern below stores a three-bit gear field in positions 4 through 6. Shift it right by four so the field reaches positions 0 through 2. Then mask with 7 to remove every other position that moved down with it.

Proposed challenge.hints[2]:

> −113 supplies that clear mask; combine the cleared pattern with the shifted replacement.

Original and edited execution route: Original and edited packed value: compare completed t2; Low bits inspection can identify the changed source bit. Browser runs confirmed extraction unchanged.

### arithmetic-shifts

**P2.** The experiment’s signed values are useful, but “Identify where rounding matters” does not say what to compare against the arithmetic shift. Comparing only arithmetic and logical outputs does not isolate rounding down versus truncating division.

Checked facts: srai copies the top bit; srli fills zeros. srai’s negative odd-input result differs from division by two truncated towards zero. The conceptual division comparison needs no new div instruction.

Proposed prediction.hint:

> Move the bits right while copying the top bit into the vacated position. For a negative odd input, distinguish rounding down from truncation towards zero.

Proposed experiment.task:

> Change only the constant in the first li line to -8, -9 and -1, then to 8, 9 and 1. Keep both shift counts at one and choose Build & Run for each input. In Registers, read t2 as Signed and compare it with dividing the input by two and discarding the fractional part towards zero. Which inputs distinguish that rule from rounding down?

Original and edited execution route: Original and each li edit: completed t2 with Decimal reading Signed, compared with the conceptual division rule. Keep both shift counts at one; t3 still offers the separate logical-fill comparison.

## Learning sequence and examples

The main mechanism in each worked fragment is defined before the code and is then available for a fresh application. Definitions alone are not treated as proof of readiness. In signed-overflow, two comparison results are composed with XOR for the first time; its new prediction hint gives the intermediate questions separately and the experiment names each available observation. A shorter add-only example would remove the disagreement that constitutes the check. In logical-shifts, the read-field example is intentionally smaller than the replacement exercise. The earlier set/clear/toggle operations supply its pieces; explicitly naming a field and the register-register OR form closes vocabulary gaps without adding another mode or disclosing the replacement exercise’s complete code.

The existing set/clear/toggle example is usefully independent. Its experiment should be the bridge to composition: the proposed second instruction reads the first result. This distinguishes a genuine repeated operation from recomputing the same original expression. The experiment stays before the combined field-update exercise. No extra disclosure or larger worked program is proposed.

Rejected concern: new temporary names such as t3/t4 do not require another register-naming lesson. Each is introduced in the source with its role identified beside it, after the course has established that these names select ordinary working registers. Rejected concern: repeated reminders to preserve source inputs are not redundant where a new operation or a supplied-input exercise makes that requirement meaningful. Retain those instructions.

## Functional evidence and limits

Inspected actual Chromium at 390 × 844, 950 × 1000 and 1440 × 1000, each in light/dark, using signed-readings as the shared-control sample. Visually checked the rendered phone light, tablet dark and desktop light screenshots; the other theme/viewport combinations were checked through actual loaded controls/geometry. No page-level horizontal overflow was observed. Source remained editable and the initial unsigned-reading selector and read-only Starting inputs panel matched the proposed routes. These checks are not a full visual audit of every lesson.

Executed the original and edited addition, zero-register, set-clear-toggle, logical-shifts and arithmetic-shifts through the actual browser GNU/xv6 path. Executed signed-readings and switched its live decimal reading while checking the unchanged hexadecimal pattern. The new chained operations and the changed neighbouring bit produced the intended comparisons. Evidence: `.artifacts/clarity-state-browser-evidence.json` and `clarity-state-<width>-<theme>.png`. A first reviewer script checked the previous Finished badge too early on rerun; it was corrected to wait for the fresh completed capture and all edited runs were repeated.

Additional phone interaction checks: Escape then Tab left CodeMirror; edited source survived reload; a deliberately invalid instruction produced a genuine assembler error; its diagnostic link selected the exact editable line; Restore starter recovered the original source. Keyboard Enter opened the bit disclosure, and its Register/High bits controls worked. This separates a real build error from the successful edited-run prediction-feedback issue.

The two handoff files contain 46 proposed field replacements and 32 precise edited sources across all 17 IDs. Only the selected browser runs above were executed by this reviewer; the remaining proposed variants are verification routes for the integrator’s actual GNU/QEMU/xv6 checks. No broad corpus run, final applied-text technical review, screen-reader audit or novice study was performed here. The report must not be described as learner validation or a measured learning benefit.

Keep the original lesson structure and most prose. The integration owner reports applying all 46 state proposals and correcting the shared edited-run feedback. Those applied changes still require the independent final technical review and integration checks; this reviewer has not re-audited the integrated corpus. No later amendment to the 46 proposed replacements is requested here.
