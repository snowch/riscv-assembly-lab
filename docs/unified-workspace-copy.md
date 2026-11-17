# Unified workspace wording

Copyright © 2026 Christopher Snow.

This is the separate drafting pass for the unified editor and optional playground tools. It follows `course-authoring.md`, the source course’s style checklist, and the user’s learner-clarity criteria. Prerequisites remain simple C and small binary numbers. No lesson examples, reference solutions or instruction semantics changed.

The guides describe one editor for a lesson example, its optional exercise, and independent projects. Tools exposes further inspection and project controls. The main path remains predict, run, inspect relevant results, edit and run again. Selecting a tool keeps the current source in the editor. Opening a project is an explicit source/context change and ends the previous execution.

The project copy instructions name source and starting setup together. Exercise copies use the selected case. Return to lesson restores the example or exercise draft the learner left. Browser storage and file exports keep source/setup, not a paused machine. The older Open a copy in Playground resource still explicitly describes its separate-tab behaviour; it is an optional alternative to the same-workspace project controls.

The technical distinctions remain: machine stepping executes actual machine instructions; an assembly source line can expand; TinyCC has no C source-line mappings; observed pauses and final fragment reports are different from a complete program’s exit state. Project type definitions, imported-project schema text, reserved-register restrictions and runtime limits remain unchanged.

The main implementation must confirm the exact surface labels and behaviour before publishing:

- Tools, Projects, Save a copy and Return to lesson match the guide’s directions.
- Registers offers pinned/changed/all views and a bit view; Memory/Stack remain available without replacing the editor.
- Program exposes the complete current source and the last successful build’s machine instructions.
- The setup form’s heading may remain Starting setup while its Tools entry is Setup. Both refer to the same form.
- Same-workspace project copies preserve example/exercise drafts and the selected exercise case for Return to lesson.

Copy validation: both guide files parse as JSON. Existing keys were retained, including all workspace keys and the unchanged projectTypes array. Four labels and two project-status messages were added for the implementation. No browser or novice-learning verification is claimed by this drafting record; implementation checks and independent reviews must establish the interface behaviour separately.
