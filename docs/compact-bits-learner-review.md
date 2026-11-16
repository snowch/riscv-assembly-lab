# Compact calculator bits learner review

Copyright © 2026 Christopher Snow.

Independent learner/UX review of `fix/compact-calculator-bits`, 16 November 2026. The reviewer did not draft the copy or implement the change; used the inherited model without an override. Applied `docs/course-authoring.md`, the imported Assembly Lab authoring/style rules and learning-design skill. Read the compact-bits brief and copy record, and inspected the actual calculator.

## Browser evidence

Used local Playwright Chromium at `http://127.0.0.1:4220/lessons/addition/`, in fresh contexts at 1440 × 1000 and 390 × 844, both light and dark. Checked actual theme attributes/backgrounds, screenshots and live geometry. No page-level horizontal overflow or uncaught page errors appeared. Local evidence is in `.artifacts/compact-learner-evidence.json` and `compact-review-*` screenshots. No full CPU tests were run.

In all four combinations, opening Compare the bits started at the low end, where B = 1 was immediately visible. Show carries was present, unchecked and disabled alongside “Calculate to show carries.” Calculate enabled it. High bits exposed Out and the top retained bit; Low bits returned to bit 0. The toolbar stayed on one row on the inspected phone. Sticky row headings, four-bit gaps and digits remained legible in both themes.

The fresh-result display correctly separated the carry into the top bit from Out for `0x7fff_ffff_ffff_ffff + 1`, and for the 32-bit all-ones pattern plus one. The latter retained zero while Out held one. A separate `15 + 1` application showed the carry chain across the four-bit boundary. The visible explanation defines the direction and rule beside the display: “Each column adds A, B and the carry from its right.” Out has a separate divider, empty operand/result positions and an accessible description saying it is outside the retained result.

High/low choices and a manually selected middle position survived carry toggles. Middle offsets changed by the extra column's 38 pixels when it disappeared, preserving the viewed bits. Editing A removed the stale result/carries, restored the clicked bit's focus and retained the viewed position. Reading changes, collapsing/reopening Compare the bits and closing/reopening the calculator retained horizontal position; reopening focused Close. Width changes returned to low bits. Invalid input showed an error with no result and a disabled explained carry control. Subtract and Shift left hid the inapplicable carry control.

On phone, keyboard Enter opened the bit disclosure and activated navigation, Space toggled carries and edited A, and ArrowLeft scrolled the focused region. Editing retained focus on the replacement A button. A reading-only change retained a fresh result. Independently rechecked the final description change: the pending explanation is referenced while disabled, removed after Calculate and restored after an edit.

## Finding and verification

**Accepted P1, fixed:** the instruction “Scroll the aligned rows together to compare columns” initially described misaligned columns. Global button padding made A cells 29.1875 pixels wide while other rows used 28 pixels. The error accumulated across the word and visibly put A under different bit indices, undermining the main comparison outcome. Requested shared cell sizing rather than any copy change.

The integrator added explicit compact-cell padding/minimum sizing. Repeated all four browser combinations after that fix and visually rechecked phone high/low and desktop screenshots. A now measures 28 × 44 pixels; sampled positions 63, 60 and 59 align with every other row. A separate phone check compared all 64 columns and found matching positions and widths across every row. No unresolved P1/P2 finding remains in the inspected states.

## Learning route and limits

The stated prerequisite is reading small binary place values. Signed/unsigned readings and width are explained in the existing calculator; carry mechanics and signed overflow are locally defined when enabled. The optional calculator is an exploration aid, with editable inputs and fresh applications possible, rather than an assessed lesson. The four-bit-boundary application is a smaller complete case than a word overflow; it preserves the explicit real word width and makes the column rule visible before inspecting the top boundary. No new unexplained prerequisite was identified in this change. Guided learner practice was not observed.

Keep the compact default, discoverable gated toggle and separate Out column. This review supports the inspected interaction and representation, not a measured learning benefit. Physical-device touch accuracy, screen-reader output and novice understanding remain untested. Paused-machine isolation, independent technical review and publishing checks belong to the integration pass.
