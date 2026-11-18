# RISC-V Assembly Lab learner wording and interface review

## Opening rubric check

The published `main` started at `b5614320be73e66e25ea767c7fbfeb7f1660377a`. Its Pages run was [44200180032](https://github.com/snowch/riscv-assembly-lab/actions/runs/44200180032).

The course assumes small C functions, conditions, loops, arrays and small binary numbers. The review checks instruction notation, hexadecimal, signed readings, addresses and pointers where the learner first needs them. It follows the [learner clarity rubric](learner-clarity.md), [course authoring brief](course-authoring.md) and the imported Assembly Lab learning-design skill. The review asks whether a learner can run the prepared example, make the named change, find the new observation and explain the difference.

The inventory is 58 generated lessons in 15 modules, the course overview, Using the workbench, Playground and Hello World. The shared review covers headings, code, labels, hints, feedback, optional tools, exercise context and persisted drafts. It treats the GNU assembler and linker, TinyCC and the simulated RISC-V CPU running xv6 as separate parts of the browser workflow. Browser results are observations of the simulated guest. Linux QEMU is a separate check of the instruction results supported by the corpus.

Independent readers cover state and control, products and late lessons, and the home, guides and shared workspace. Wording drafts and the technical check are separate from integration. Functional evidence below is separate from evidence of what a beginner understands.

## Closing rubric check

Each route below was read from its prerequisite knowledge through its next experiment, including learner-facing source comments, labels, predictions, hints and feedback. The specific cue or observation in each row identifies what the learner needs to follow. The workbench keeps the preparation and current result with the editor. The active exercise keeps its task, case selection and case results visible, and makes **Check all cases** its primary action. Hints, the reference solution, diagnostic logs and compiler details remain optional. The reference C comparison shows the starter on both sides. Execution errors, a different prediction, and a case check each describe the operation that produced them.

| Route | Learner action and observation reviewed |
| --- | --- |
| Course overview | Read the C and binary prerequisites before starting. Choose a lesson or open the introductory example. |
| Using the workbench | Change 7 to 19 in Addition and compare t2. Use an instruction breakpoint to distinguish the paused t2 from the finished result. |
| Playground | Open a complete program, pause before exit and inspect s0. Change addition to subtraction in a new project and compare. Calculator width, reading and retained versus full results are explained beside their controls. |
| Hello World | Run the complete starter and read Console. Make a literal message edit, then insert a newline between the words and compare. Use Playground for stepping. |
| `addition` | Read both starting registers and the sum. Edit both constants and check the prediction against the new t2. |
| `constants-and-inputs` | Change the immediate and the starting value independently and check their effect on t2. |
| `register-reuse` | Record the original t2 before swapping the subtraction operands. Explain which value the subtraction reads. |
| `instruction-order` | Reorder the named instructions and identify which operation last writes t2. |
| `zero-register` | Write to zero and read the destination alongside the separate inputs. |
| `hexadecimal` | Open Inspect registers and record t0 and t2. Try equivalent notation before trying a different input. |
| `signed-readings` | Switch Decimal reading and inspect bit 63 of the same t2 pattern. |
| `building-constants` | Change the upper immediate and compare both decimal readings of t0 while its hexadecimal pattern stays fixed. |
| `word-arithmetic` | Compare the full hexadecimal patterns in t2 and t3 after the same inputs. |
| `addition-wraps` | Read the named input and sum as unsigned and compare increments 0, 1 and 2. |
| `carry-without-flags` | Compare the explicit carry result with the sum and original input. |
| `signed-overflow` | Compare the expected direction with the resulting signed reading. |
| `elapsed-time` | Change the recorded endpoints within the stated elapsed-time assumption and compare the difference. |
| `bit-masks` | Compare t2 masks in Registers, then inspect the surviving low positions. |
| `set-clear-toggle` | Insert the second operation and compare the affected position and the rest of the pattern. |
| `logical-shifts` | Record t0 and t2 before changing the exact input. Inspect t0 for the changed bit and t2 for the extracted field. |
| `arithmetic-shifts` | Inspect the two full patterns and compare signed t2 with division rounded toward zero. |
| `compare-values` | Run literal below, equal and above trials, change the threshold, then move the result to t0. |
| `signed-unsigned-comparison` | Compare the two zero-or-one results for unchanged input bits. |
| `branch-paths` | Test fuel 9, 10 and 11 at reserve 10, then swap the named branch operands. Read the warning in t2. |
| `choosing-maximum` | Delete the named jump, then try an unsigned comparison and identify the selected input. |
| `counting-up` | Record the original total, move the reset inside the loop and test limits 4 and 2. Restore the reset and test zero. |
| `counting-down` | Compare the odd input and zero-count run. Step the broken variant up to the next branch, read the wrapped counter and stop. |
| `test-before-body` | Record both zero-limit counters and compare them with the named limits 1 and 4. |
| `stopping-sentinel` | Run the supplied early exit, remove its brightness test, compare two visits at the same instruction and stop. |
| `memory-bytes` | Change the loaded offset and distinguish the observed address from the byte value. |
| `loads-and-stores` | Compare source and destination offsets in Before and After while cross-checking the loaded value. |
| `load-widths` | Use two load widths to compare extensions of the same supplied byte. |
| `narrowing-stores` | Compare the named byte offsets after aligned stores of different widths. |
| `array-addresses` | Trace a valid and wrong-but-aligned scale through the byte offset and loaded result. |
| `sum-array` | Record original t1 and t2. Compare shorter counts and a stride of eight, then inspect which bytes the larger stride read. |
| `zero-terminated-strings` | Change input through literal stores and check the stopping byte and capacity in the snapshots. |
| `products` | Compare the exact product with the low bits written to the register. |
| `high-products` | Use the signed and unsigned high halves to interpret the same inputs. |
| `division-remainders` | Check the chosen quotient and remainder together under the defined divisor conditions. |
| `safe-scaling` | Compare dividing first with a narrow multiply. Find which operation loses information in each trial. |
| `calls-and-returns` | Trace the helper’s argument and returned value through a named call. |
| `preserving-return-address` | Follow the saved outer return address before and after the nested call. |
| `stack-frames` | Read bytes zero and one in Stack bytes, then compare loads from two explicit slots. |
| `recursive-progress` | Compare completed brightness sums. When the decreasing argument is removed, stop the run or inspect the serial log. |
| `debug-loop-boundary` | Compare index and count just before the load. Repair the exact branch and test whether an outside byte affects a0. |
| `debug-load-width` | Mark the multiply again after every edit. Compare the same pinned t2 under sign- and zero-extending loads. |
| `debug-return-address` | Use Tools → Stack to compare ra and the observed bits at sp + 8 before the inner call and before restoration. |
| `debug-memory-boundary` | Re-mark the load after edits. Compare offset and count before touching memory, then verify the guard skips the load. |
| `c-return-values` | Change the fixed charge and read a0. Open the emitted instructions after a successful build. |
| `c-decisions` | Compare returned values on equality with two different operators. Inspect TinyCC’s actual output. |
| `c-loops` | Connect the loop’s bounds and update to the returned a0 for the supplied arguments. |
| `c-memory` | Compare accesses to supplied data at an element offset and at a byte offset. |
| `c-integer-widths` | Replace the size expression with pointer size and compare the measured target code. |
| `c-overflow-contracts` | Compare defined unsigned wrapping and a bound check that precedes the increment. |
| `checked-addition` | Compare the ordinary sum and saturated result at the supplied boundaries. |
| `system-calls` | Compare returned t2 and the precise bytes under Tools → Output after reducing the count. |
| `elf-entry` | Distinguish the program entry from the callable function and inspect the built ELF in optional tools. |
| `memory-protection` | Compare the captured data base with t0 in a valid run. Read the xv6 fault in the serial log after the exact address edit. |
| `trip-computer` | Follow record bounds, filtering, accumulation and a helper through captured results. |
| `twos-complement` | Compare the complemented and negated patterns at the stated width. |
| `riscv-and-arm` | Compare the explicit RISC-V check with the documented Arm mechanism. The Arm listing is illustrative. |
| `floating-point-bits` | Extract stored binary32 fields with integer instructions. The resulting reading describes the stored bits. |

## Functional evidence

Independent browser runs on the published baseline established the real behavior behind the revised instructions. They used keyboard-driven runs and breakpoints, original code and exact edits, dark and light themes, and phone, tablet and desktop layouts. Checked journeys covered the Addition prediction and three exercise cases, Hello World’s one-line and two-line messages, signed and unsigned register views, branches and loop boundaries, memory snapshots, nested return slots, compiled C and xv6 output and faults. Exact edits used the learner editor. The baseline xv6 corpus executed all 58 worked examples and three xv6-only cases, and rejected an intentionally incomplete case.

The new browser regressions check the two recovered drafts across reload. Existing draft and progress keys stay compatible. Backups use separate keys, and a tab-only save message remains when browser storage is unavailable.

These checks cover whether the interface and instructions let learners complete the activities. We did not observe independent learners completing the activities or measure understanding.
