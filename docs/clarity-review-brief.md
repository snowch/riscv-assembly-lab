# Learner clarity review

Copyright © 2026 Christopher Snow

The user requested a sentence-by-sentence review of learner-facing headings, prose, instructions, labels, examples and feedback, plus an uncluttered progression from purpose through action and observation to the next experiment. Apply their clear-wording, UI and verification requirements across all 58 RISC-V lessons, guides, shared workbench, Playground and calculator.

Prerequisites are simple C (variables, conditions, loops, functions and arrays) and reading small binary numbers by place value. Assembly, hexadecimal, two's complement and pointers are introduced by the course. Read docs/course-authoring.md and its imported authoring/style requirements. Apply the imported learning-design skill to confusing activities, preserving independent drafting and review passes.

Outcome: a reader can identify the prepared state, make the requested edit through an actual control, execute it, find the relevant output and explain what the comparison demonstrates. A valid edited experiment must not look like an execution failure simply because it differs from the original example. Preserve source/setup/fixture distinctions and saved drafts/projects. Do not add unsupported numerical or production claims, unexplained terms, unnecessary modes, repeated directions or optional sections that merely conceal excess material.

Audit every sentence and teaching field in the assigned canonical files. Record reviewed lesson IDs and concrete findings with JSON field, problem, checked source/UI facts, proposed correction and executable verification route. Check all requested edits against editable source versus supplied read-only setup; identify precise instructions/operands and the relevant Registers/Memory/Output field and observation moment. Definitions must precede reliance on a term. Retain clear existing prose rather than rewriting for novelty.

Read-only content reviewers may propose wording in their reports but must not edit canonical content. The integration pass will implement from those checked facts and obtain a separate technical review of the final wording/behaviour. Keep instruction semantics, tests, source examples and exercise cases unchanged unless a demonstrated issue requires a targeted correction. Avoid disclosing prediction/exercise answers in advance. Shared UI and guide review must check actual available actions and distinguish original predictions, exercise checks and execution errors.

Run original examples and affected suggested edits through real GNU/TinyCC and xv6. Check representative actual browsers at phone/tablet/desktop sizes, both themes and keyboard flows, including errors and saved work. Record functional evidence separately from independent review and from learning effectiveness. No claim of a novice study or complete accessibility audit. Merge authorised completed fixes; record remaining limitations honestly.
