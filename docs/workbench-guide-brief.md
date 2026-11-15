# Optional workbench guide

Copyright © 2026 Christopher Snow.

Readers can program in C but may be new to this assembly workbench. The guide's outcome is to edit a small example, execute it, locate captured registers, and distinguish stepping from running. Processor concepts and deeper debugging remain in their existing lessons.

Applied the source course's learning-design attention/state/access checks. The actual addition workbench, editor adapter, controller, tab/fullscreen handling and existing help were inspected during implementation and review of the workbench. The guide links to that real example rather than introducing another execution environment or a required lesson. No beginner study has been performed.

The displayed source comes directly from addition's canonical starter. Do not print its result or a challenge answer. Name Memory as available only in relevant lessons; the addition example has Registers, Output, Diagnostics and Debugger. Distinguish register captures from console output, source lines from machine instructions, and C instruction addresses from unavailable source mappings.

Keep the optional guide outside the 58-lesson catalogue, completion marks and sequence. Link it visibly from the first lesson and the home page, and from lesson help. Help opens it in a labelled new tab so a current VM, draft and selected inspector remain intact. Standalone Hello World links to the same guide, whose try-it route explicitly uses addition.

Separate copy drafting is followed by independent learner and technical review. Check phone/tablet/desktop in both themes, keyboard navigation and readable tables, guide/return links, absence of completion changes, and actual run/step/breakpoint/shortcut instructions. Source and live observations must support every behaviour claimed. Record browser checks separately from a novice learning study.

## Review and verification

The guide was drafted separately by `workbench_guide_copy`. Independent learner and technical reviewers inspected the built page and real addition workbench. They checked six layout/theme combinations and actual execution, guide popups, unchanged paused state, shortcuts, fullscreen and source recovery. Their adjacent records distinguish browser evidence from learner research.

An accepted P2 finding concerned saved drafts: the link correctly retained an existing Explore draft, but the initial guide assumed the canonical example was already loaded. The guide now gives conditional Restore starter and Undo restore directions before the exercise. Both reviewers independently verified retained draft, restored canonical source, recovered draft and unchanged completion marks. The README's generated-file check was also updated to include the new guide path.

The initial four focused browser checks passed. After the saved-draft correction, all four passed again with a seeded draft and explicit restore/recovery assertions. The final full browser run is reported separately in the pull request and GitHub Actions. Runtime programs, fixtures and execution semantics are unchanged.
