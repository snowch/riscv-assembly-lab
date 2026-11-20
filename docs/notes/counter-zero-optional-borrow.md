# Zero-start forward counter with optional subtraction

Copyright © 2026 Christopher Snow

User request: start at zero and separate carry from borrowing. Required path: +1 advances an unsigned four-bit stored reading, cycling through zero without stopping. Borrowing is not needed to calculate elapsed ticks using sub. The independent optional experiment has -1 and its own Reset; neither pane changes the other, source drafts, native observations or predictions. Definitions of ALU and decrement appear only in the optional pane. Architecture notes describe RISC-V, with no invented carry/borrow flags.

The free explorer now starts at zero. The fixed worked elapsed example and legacy v1 restoration still start at their original fourteen. Valid v2 saved readings are retained without writes on load, including old downward histories; a last subtraction marker is suppressed rather than relabelled as carry in the forward pane. The next actual addition supplies its own carry. Optional subtraction uses a separate riscv-counter-borrow-v1 key. Reset applies only to its own miniature.

A separate drafting agent supplied copy from a checked brief. Full brief, copy and independent reviews are recorded in the companion Arm change under docs/notes/counter-zero-optional-borrow. Models still pass all 32 actual xv6 cases, and existing independent QEMU verification remains part of CI. Local results: all 50 Node tests and 12 focused browser checks passed. Initial browser run had four theme-assertion failures caused by measuring the new transparent inner pane; correction selects the unchanged themed outer card and the full rerun passed. Generated course page was rebuilt. Full final-commit CI results are recorded in the pull request.

Browser and agent checks are functional/review evidence, not a human learning-effectiveness study.
