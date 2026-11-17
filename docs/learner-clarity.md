# Clear wording and uncluttered UI

Copyright © 2026 Christopher Snow

Apply these user-provided review criteria to learner-facing headings, instructions, labels, examples and feedback. Judge clarity from the stated prerequisites: simple C and small binary numbers; introduce assembly, hexadecimal, two's complement and pointers before relying on them.

## Wording

- Give each sentence a clear purpose: context, explanation, learner action, automatic behaviour or result interpretation.
- Distinguish prepared state from work the learner must do. Name the actual control or editable location, the exact change, when to run, and the evidence to inspect. Never request an edit to read-only setup.
- Explain why a comparison matters. Name the relevant output fields and the question to answer.
- Define necessary terms before use. Explain only helpers and implementation details relevant to the task.
- Match claims to what the example demonstrates. Distinguish observations, illustrative models, assumptions and production claims.
- Remove repetition, filler and meaningless labels while preserving useful context.

## Interface

- Keep a clear route: purpose → question → prepared state → action → result → explanation → next experiment.
- Keep essential instructions and explanations visible. Collapse only optional technical inspection, notes, references or alternate explanations; use descriptive labels and merge overlapping sections.
- Nest disclosures only for a clear benefit, such as revealing an answer after a question. Remove unnecessary material instead of merely hiding it.
- Make one primary action prominent. Show secondary controls and status messages when useful.
- Show relevant output and explain its quantities. Keep unrelated diagnostics and exports in optional tools.
- Distinguish execution errors, original-example checks and understanding checks. Valid edited code must not appear to fail because its result differs from the original.
- Use consistent headings, terminology and treatment. Preserve readable prose and sufficient width for code, diagrams and results.

## Verification

For substantive changes, follow the actual instructions: run original examples and suggested edits; check essential information, relevant screen sizes, themes and keyboard operation. Preserve saved drafts and projects. Report functional verification separately from evidence of learning effectiveness: passing tests does not prove understanding.

The separate drafting and independent learner/technical reviews in `course-authoring.md` still apply. Record unsupported assumptions and incomplete checks rather than turning them into claims.
