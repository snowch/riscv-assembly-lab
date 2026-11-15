# Independent learner review: debugging lessons and interface

Copyright © 2026 Christopher Snow.

## Scope and independence

Reviewer: `/root/draft_control_memory`, who did not author `content/debugging.json` or the debugger interface. The reviewer previously authored the separate control/memory lessons; those lessons are not included in this independent verdict.

Read each of the four debugging lessons separately, including its introduction, starter, prediction, explanation, experiment and challenge, against the preceding course sequence. The learner has reached functions and stack frames, but has not reached the later C and xv6 modules. Applied the source course's `CLAUDE.md` learner-review rules and the RISC-V course contract in `docs/course-authoring.md`.

Browser target: `http://127.0.0.1:4230/lessons/<id>/`, using Chromium through Playwright. Desktop was 1440 × 1000; phone was 390 × 844. Both actual light and dark themes were selected. These are browser emulations, not physical-device checks.

## Browser evidence

All four lessons passed all four width/theme combinations, 16 states in total. For each state the reviewer selected the exact numbered source-line breakpoint, started real debugging, verified the paused source line, pinned relevant registers, added a memory watch, opened the actual instruction-address listing and the stack view, removed the breakpoint and used Continue to finish the example. No page errors were recorded. Execution was through the debugger followed by Continue, rather than a separate Build & Run click in every state.

The exact pause points were the loop's byte load (source line 7), the load-width example's multiplication (line 3), the nested call (line 6), and the memory-boundary byte load (line 3). At these pauses the marked instruction had not executed. The instruction-address listing marked one current machine instruction and the location agreed with the source breakpoint.

The nested-call example was also stepped through the actual two-instruction call expansion in all four width/theme states. The live return address changed while the eight-byte memory watch at the saved stack slot retained the earlier address. The stack view showed eight observed doublewords and qualified its address matches; it did not invent call frames.

Each challenge was opened on phone/light, its reference was loaded through the actual interface, and Check all cases completed with Passed: loop boundary 3/3, load width 4/4, return address 3/3 and memory boundary 4/4. This is 14 browser-graded reference cases, including the protected-page boundary case. Those challenge states were not repeated in every width/theme combination. No reference code or exercise answers are reproduced here.

All 16 initial and paused states had no page-level horizontal overflow. The phone controls measured at least 40px high, including the source-line targets. Long stack rows stayed inside their own horizontal scroller. Visible debugger text was at least 11px in the automated measurement. Representative phone/dark and desktop/light screenshots were visually inspected for readable code, grouped controls, current-operation visibility and connected values. This is not a screen-reader or complete accessibility audit.

Machine-readable evidence: `.artifacts/review-debugging-states.json`; full-page screenshots: `.artifacts/review-debug-<lesson>-<viewport>-<theme>.png`. The targeted correction check is `.artifacts/review-debugging-closure.json`.

## Individual learner passes

| Lesson | Browser states | Understanding and interaction check |
|---|---:|---|
| debug-loop-boundary | 4 | The faulty but finite starting loop is labelled as such. Count, index and address roles are established by earlier lessons. Breakpoint, watch, Continue and Step instruction are defined locally. The text distinguishes a successful run from reading the correct elements, and names the before-load observation moment. The experiment changes a byte through explicit assembly stores rather than implying that displayed data cells are editable. |
| debug-load-width | 4 | Earlier load-width and multiplication knowledge is enough. The page distinguishes a memory byte, the widened register pattern and a later consumer. The paused multiplication occurs after the load, which is the intended investigation. Signed extension is explained before asking the learner to inspect it. The revised experiment now accounts for source edits clearing breakpoints; see D1. |
| debug-return-address | 4 | Earlier nested-call and stack-frame lessons supply ra, sp, frame storage, sd and ld. The worked program is explicitly correct; the challenge's missing save/restore is deliberately different. The text directs the learner to debug and Stop before checking all cases. It explains call expansion, the live versus stored return address and the limits of observed stack bytes without claiming a reconstructed call chain. |
| debug-memory-boundary | 4 | The page distinguishes an application capacity from readable mapped memory. Page permission and fault are defined locally because the fuller protection lesson comes later. It names the pause before the load, gives concrete source edits for changed offsets, and tells the learner to mark the load again after editing. The guard-page case is qualified; an ordinary successful run is not presented as proof that all accesses were within the logical bound. |

No additional missing prerequisite term or architectural error was found in these four individual passes. They use direct RISC-V comparisons and actual machine addresses, with no assumed Arm flags or invented compiler mappings.

## Findings and closure

**D1 — Moderate, closed: edited load experiment lost its observation point.** The earlier direction, “Replace lb with lbu and compare the paused t2 pattern”, did not tell the learner to re-establish the multiplication breakpoint after editing. Editing clears breakpoints, so following that direction could instead pause before the first instruction, before the load had supplied the intended value. Direction: account for the real reset behaviour in the experiment at the point it asks for another paused comparison.

The final rendered experiment now says, “Source edits clear breakpoints, so mark mul again before Start debugging” and repeats “marking mul again after each edit”. Independently verified on the phone page: the source edit removed the selected breakpoint; entering the new exact line through Toggle breakpoint and choosing Start debugging paused before the intended multiplication. The displayed experiment also uses an explicit store to change the read-only input data. D1 is closed.

## Verdict and limits

No outstanding learner blocker was found in the reviewed four-lesson scope after D1's rendered correction. The breakpoint, pin, memory-watch and observed-stack interfaces were understandable at the tested moments, and the deliberate faulty starters were distinguishable from correct worked code.

This review does not replace the independent low-level runtime audit or full-course execution checks. It does not claim physical-device, non-Chromium, screen-reader or arbitrary-memory-safety coverage. Intentional protected-page failures were read for learner clarity; their trap behaviour is covered by the separate technical execution review. The deliberately looping return-address challenge starter was not allowed to run to the execution limit here.
