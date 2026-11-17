# One workspace for lessons and independent projects

Copyright © 2026 Christopher Snow.

The user approved the interactive unified editor mock and requested implementation and a merge to main. The common lesson route remains predict, Build & Run, inspect relevant registers, edit and run again. Tools reveals advanced inspection and project controls without replacing the source. The separate playground URL remains a direct entry to the same interface and runtime.

## Checked implementation facts

`createWorkbench`, `Session`, the GNU/TinyCC builder and the xv6 worker already supply actual compilation, machine stepping, debugging and observations. This change reuses those components. No mock interpreter, invented register state, synthetic instruction listing or guessed C source mapping enters the production site.

The shared dock keeps Registers (all/pinned/changed, decimal/hex and bits), Memory Before/After, actual Stack slots, Debugger breakpoints/watches, complete Program source and native instructions, Output, Diagnostics, Setup and Projects. The editor and a compact observation remain mounted as tools change. Fullscreen, editor expansion, the keyboard/pointer width separator, CodeMirror editing and the calculator remain available. Find expands its editor enough to leave usable source space.

Addition starts with Tools closed. A lesson that explicitly supplies memory opens Memory, and debugging lessons open Debugger; essential output is visible for the current investigation. The compact beginner reading says Decimal before signed interpretation has been introduced. Advanced hex remains available on request.

Lessons and projects share their project-management implementation. A lesson can save its current source and selected fixture as a new project in the same workspace. Starting setup changes also create an independent project when the lesson draft is selected. Project source, metadata, imports, exports, complete programs, C functions and deletion recovery keep the existing project schema, storage keys and concurrency protection. No migration of learner data is required.

Return to lesson restores the example or exercise, selected case, source and prediction from before the project switch. It restores the lesson filename, source label, heading and controls. Changing context ends execution; saved projects contain source/setup, not a suspended CPU. The batch case checker locks project switches, with a controller guard as well. Delete project cannot act on a lesson draft or remove the library's previously selected project through that draft.

The source draft keys, old addition-source fallback and project library format remain unchanged. Unapplied setup fields survive source edits. Project-mode pages hide the lesson-specific C comparison and legacy lesson-copy link, so a project is never presented beside an unrelated C intent or transferred with stale lesson source. Project actions retain their active tool so status and Undo delete stay visible.

## Wording and independent review

The separate copy pass is `unified-workspace-copy.md`. Canonical guide JSON and generated guide pages describe the same controls. `unified-workspace-learner-review.md` and `unified-workspace-technical-review.md` record independent browser probes, initial findings, corrections and rechecks. These reviews apply the user's `learner-clarity.md` criteria. All confirmed review findings were resolved in the checked scope.

Functional checks establish observed interface/runtime behaviour in Chromium. They do not establish novice understanding, physical-device compatibility or learning effectiveness.
