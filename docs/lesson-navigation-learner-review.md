# Independent learner and UX review

Copyright © 2026 Christopher Snow.

Reviewed on 2026-11-16 under `docs/course-authoring.md`, the imported Assembly Lab review rules and `docs/style.md`. This reviewer did not write the implementation or draft its learner-facing copy. The assumed learner can read simple C and small binary numbers; they have no prior assembly, hexadecimal, two’s-complement or pointer knowledge.

## Findings

No unresolved learner-facing finding in the changed navigation, resources, first-addition explanation, operand schematic or calculator.

The first lesson defines registers, instructions, operands and the destination before using them in its diagram. It expands `li` as load immediate, defines immediate using the literal in `li t0, 7`, and explains the assembler and possible instruction expansion before running. The diagram labels its exact instruction and shows source/destination roles without printing a numerical sum or claiming to be a hardware implementation. The first prediction still requires the learner to obtain the result by running the real code.

The new breadcrumb gives course context close to the title. Its Course disclosure reveals a contained course list with the current module open and current lesson marked. Opening it overlays the lesson without moving the heading. The module breadcrumb opens the matching front-page module. Prose links remain underlined; the resource rows have full-width targets, recognisable icons and chevrons. Resources open in place and navigation uses links. No nonexistent recap or local-run resources have been added.

The optional calculator distinguishes scratch work from running lesson instructions. Decimal is the default notation; its visible help names `0x` and `0b`. Width errors stay with the field and do not silently truncate pasted values. Signed/unsigned reading and width effects are explained in Numbers and width; those concepts are optional tool help rather than prerequisites of the first lesson. Addition carry details remain optional and explicitly say that RISC-V has no arithmetic condition flags.

## Browser evidence

Used the built site served independently on port 4247 and headless Chromium through Playwright. Checked addition, loads-and-stores and c-return-values at 390, 800 and 1440 pixels in both requested and rendered light/dark themes: 18 combinations. The body colours were `rgb(245, 249, 248)` and `rgb(16, 30, 28)` respectively. After the existing background-colour transition settled, the dark calculator opener used the dark surface and light foreground. No page overflow or browser page error occurred.

At each combination, tested keyboard opening of the course disclosure, visibility of its current lesson, Escape with focus returned to the summary, pointer dismissal from an actual outside margin, References expansion, calculator opening with Close focused, exact prefixed arithmetic, optional carries, contained horizontal bit scrolling and Escape returning focus to the opener. Opening the course menu moved the lesson heading by zero pixels in every measured combination. Addition module links opened the correct course module and contents group.

Separately checked a 390-pixel touch context: paused the actual machine, used the calculator, retained the source and prediction and identical paused location, then continued real execution to the expected register observation. Tested a 33-bit value rejected at 32 bits, accepted after selecting 64; a 32-bit binary pattern read as positive at 64, negative at 32 and zero-extended positive again on widening; a signed boundary addition and its differing top-bit carries; and calculator drafts retained after navigation to the course home.

After the final modal/layout corrections, rechecked normal addition and the standalone Hello World page at all three widths in both themes: 12 combinations. Opening and closing the calculator preserved header geometry, returned keyboard focus, and kept its heading at the same top position as result and carry content grew. Phone, tablet and desktop screenshots were visually inspected for heading, menu, diagram, resource and calculator states.

Native course-menu opening and direct navigation to another lesson also passed with JavaScript disabled at 390 and 1440 pixels in both system colour schemes. Browser evaluation was used only to inspect state in these checks; the interaction used the native disclosure and real links.

## Check record and limits

The first private matrix script timed out because the reviewer attempted to click the lesson heading while that heading was covered by the open course menu. The corrected script clicked the visible outside margin and all 18 combinations passed. This was a reviewer interaction error, not an application failure. The initial timeout and corrected pass are distinct outcomes; root test-suite results are recorded separately by the managing session.

This is an independent interface and explanation review, not a novice-learning study. Accessible names, native keyboard operation and focus recovery were checked in Chromium; a screen reader and physical mobile keyboard were not used. The reviewer did not rerun the complete native course corpus or certify new RISC-V semantics: the lesson programs and fixtures are unchanged. The exact mathematical parser and arithmetic require the independent technical review and automated checks too.
