# Optional workbench guide learner review

Copyright © 2026 Christopher Snow.

Independent learner/design review on 15 November 2026 by `guide_learner_review`, which did not draft the guide or implement its page and links. Used the inherited model without an override. Read the source authoring/style requirements and inspected the actual guide and lesson before the author's brief.

## Scope and browser evidence

Reviewed the generated optional guide at `http://127.0.0.1:4246/using-the-workbench/`, its canonical copy and CSS, and the live addition workbench. Used fresh Chromium contexts at 390, 800 and 1440 pixels, each 1000 pixels high, in both light and dark themes. All six initial render combinations had no page-level horizontal overflow, no uncaught page errors and no visible text below 11 pixels. The guide's displayed example exactly matched addition's canonical three-line starter. Its section links all had real destinations, the tables wrapped readably, and the page had no lesson-completion control. Visually inspected the phone guide and its tables.

In all six width/theme combinations, followed Open the addition workbench, started real GNU/xv6 stepping, and opened the guide from How this lab works in a labelled new tab. The original lesson retained its source, paused status and program counter. After closing the guide, the next machine step and Continue completed the original addition. This verifies the interaction and captured result, not a learner's understanding of the mechanism.

## Learning route and prerequisites

The guide assumes programming familiarity and introduces registers as working storage before asking readers to inspect them. It explains the purpose of the existing loads and addition without printing the result or supplying a challenge answer. Readers can predict, run, inspect the capture and make a fresh input change in the actual lesson. A smaller example would remove one of the input/destination roles the guide needs to orient.

The guide names the actual controls and distinguishes register captures from console output. It explicitly says the addition example has no Memory tab, while explaining where Memory appears later. The stepping text distinguishes source lines from machine instructions and identifies the execution highlight as the next instruction's source line. The C mapping limitation is local to its debugging direction. Processor details and deeper debugging remain outside this optional UI reference.

The page is visibly optional and does not add an assessment or a completion gate. Its table of contents supports reference use on phones. No new unsupported assembly prerequisite or answer leakage was identified in the inspected route. This is not a term audit of every existing lesson.

## Accepted finding and independent closure

**P2, closed: the try-it route assumed an unchanged starter.** The original guide said the first two lines load values and later directed readers to the line beside `add`. Opening the real addition lesson correctly restores a saved Explore draft. Independently saved the one-line draft `li t0, 99`, visited the guide and followed Open the addition workbench: that one-line draft remained, with no `add` line. The guide's directions could therefore describe a different program from the reader's actual editor.

The implementer added an early conditional direction to Restore starter when the saved draft differs, with Undo restore recovery explained before the action. It now describes the displayed example rather than assuming every saved draft has those lines. Independently verified the final copy and route in all six width/theme combinations: opening addition preserves the saved draft; Restore starter loads the canonical example; Undo restore recovers the saved draft. An existing lesson-completion mark remained byte-for-byte unchanged throughout. No automatic draft reset was introduced.

No unresolved P1/P2 learner or design finding remains in the checked states.

## Limits and decision

Keep the optional guide, named inspector directions and state-preserving help links with the verified correction above. These checks used automated Chromium and visual inspection, not physical devices, screen readers or a novice study. They establish the observed route and rendering, not complete accessibility or a measured learning benefit. The main process owns the independent technical review, full test suite and deployment checks.
