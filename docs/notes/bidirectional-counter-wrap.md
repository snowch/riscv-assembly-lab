# Counter exploration in both directions

Copyright © 2026 Christopher Snow

The shared user request is implemented in both courses: controls below the result, continuous +1/−1 arithmetic, carry for addition and borrow needed beyond the stored width for subtraction. The unsigned decimal reading stays below its four bits; the recent trail holds only five readings. Large equations and the old automatic stop are removed.

The new explorer starts at13. Legacy v1 progress retains its original start14 displayed reading and history; migration is read-only until an action. New v2 state is separate. Reset returns13 and preserves native results, source drafts and current prediction input. The fixed old elapsed model remains independent.

Separate copy drafting and independent learner/technical review records are in Arm Assembly Lab's `docs/notes/bidirectional-counter-wrap/` directory. They cover both implementations, including the explicit override of the generic cross-repository authoring restriction for this user-authorised work. No open findings remain.

Verification: all50 unit/integration tests passed,10 final focused browser tests passed, and all32 operations agreed with actual GNU/xv6 and independent QEMU execution. `npm run test:counter` is part of CI after QEMU installation. Independent review verified320/390/1280/1440px in actual light/dark themes; controls remained fixed below the display, with no page overflow. A first browser run's four stale prediction-reload assumptions were corrected without changing product behaviour; tests still cover preservation during counter operations and Reset. Full exact-head CI checks all original lessons/challenges and the full browser suite before merge.

This is source and functional evidence, not a novice learning-effectiveness study. RISC-V has no carry or signed-overflow flags; the markers belong to the explicitly four-bit mathematical miniature, while the native lesson runs real RV64 code.
