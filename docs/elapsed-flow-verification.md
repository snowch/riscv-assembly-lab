# Elapsed route and addition diagram verification

Copyright © 2026 Christopher Snow

The learning-design review of the matching Arm elapsed lesson found an operation/input/width detour from subtraction into an unrelated increment. The final RISC-V generator therefore mounts the simplified four-bit model only on `addition-wraps`. The elapsed page retains its native 64-bit subtraction, original inputs, assumptions and fresh experiments. Native starters, exercises and references are unchanged.

Before submission, all 41 unit/integration tests passed, 26 pinned assets verified, the editor bundle regenerated without a tracked difference, and generated pages rebuilt. The final focused browser command passed all eight desktop/phone scenarios. Those scenarios include the addition model's keyboard/bounded/reload/Reset behaviour and independent project state, native original/edited addition, corrupt/blocked model storage at 320px, and native original/ordinary/equal elapsed-time calculations with no increment detour.

Two earlier local browser harness invocations failed before testing product behaviour: one found an old process on the default port; a temporary configuration then served the wrong relative directory. The corrected configuration used a dedicated port and an absolute site directory. Their failed statuses are not rewritten as passing runs.

The independent technical review records arithmetic, gate/storage invariants, rendered themes, phone/desktop and the explicit architecture-note separator. The initial component-only learner review is historical; the elapsed miniature it described has been removed. The whole-lesson reasoning is recorded in Assembly Lab's `docs/notes/elapsed-learning-design/`. No novice formative session or learning-effectiveness claim is made.

The full CI corpus and browser suites run separately before merge, followed by publication checks and verification of the actual public pages.
