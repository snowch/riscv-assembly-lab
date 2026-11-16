# Independent learner review: one editor and an optional exercise

Copyright © 2026 Christopher Snow.

Reviewed 16 November 2026 using the inherited model, with no model override. This is an independent review of the rendered product and learner-facing source, not a novice usability study. The reviewer did not edit product code or commit changes.

## Scope and reading order

Inspected the actual lesson markup, controller, editor layout and rendered lessons before reading `docs/single-editor-brief.md`. Applied `docs/course-authoring.md` and the source course's learner-review guidance. The target reader is a programmer who knows simple C but is learning assembly. The question was whether one editor with an explicitly optional exercise preserves the main predict, run, inspect and change route while removing disruptive mode switching.

The addition lesson remains a small, complete worked example. Registers, operands and the load/add operations are introduced before the editor; the new interaction adds no ISA prerequisites. “Change it and run again” remains the main experiment. The optional exercise names its task and fresh inputs before the learner explicitly loads it. The example and exercise context labels describe the current editor contents without presenting a second mandatory learning route.

## Evidence

Used Chromium through Playwright against `http://127.0.0.1:4246`. Fresh contexts covered addition, recursive progress, C return values, loads and stores, and stack frames at 390, 800 and 1440 pixels, in light and dark themes: 30 render/action combinations. The 390-pixel contexts used mobile/touch emulation. All viewports were 1000 pixels high.

In all 30 combinations:

- Exactly one source editor was present, with no Explore/Challenge mode buttons.
- Optional exercise started closed. Opening it left the source and Example context unchanged.
- Explicit Load exercise changed the context to Exercise and held the editor's physical height. Pointer activation focused the context label rather than the code input.
- Return to example restored the original example source and held the editor height. With the workbench toolbar positioned 100 pixels below the viewport top before returning, the largest measured displacement after settling was 0.36 pixels.
- There was no page-level horizontal overflow, uncaught page error or visible text smaller than 11 pixels.

Additional actual execution checks at each of the three widths used the addition lesson:

- Started a real machine and paused before execution. Opening and closing Optional exercise preserved the paused execution position and source. The disclosure itself performed no input or execution change.
- Activated Load exercise with Enter. The same code editor received keyboard focus; its context changed to Exercise.
- Edited separate example and exercise drafts, returned between them, and recovered each exact saved draft. This verified saved exercise restoration rather than just repeated starter loading.
- Entered native fullscreen, returned to the example inside fullscreen, then exited. The example draft returned correctly. The largest measured toolbar displacement across fullscreen exit was 0.18 pixels.
- Ran Check all cases on the incomplete exercise starter and observed the expected unsuccessful result. Loaded the existing reference through the UI, ran the real case checks, and observed Passed. Returning afterwards still recovered the separately saved example draft. No assessment answer is reproduced here.

Visually inspected the phone light and desktop dark workbench screenshots, and the expanded optional exercise at 390 pixels. The task, the saved-draft explanation and Load exercise action were readable and distinct. The context label and Return action communicate the active document; deliberately loading from the exercise below the workbench reveals the editor. Returning does not introduce the earlier disruptive displacement.

Checked the generated Using the workbench page at `/using-the-workbench/`: its optional-exercise section describes opening the disclosure, explicitly loading a draft, checking fresh inputs and returning to the example. No old “Explore mode” or “Challenge mode” instruction remains in that guide.

## Findings

No blocking or actionable learner/UX defect was found in the reviewed change. The optional disclosure now separates reading an exercise from changing the working document. Explicit Load exercise and Return to example make the draft boundary understandable, while preserving one editor and the existing experiment route. The source and real case checks retain the previous exercise task and grading behavior.

The guide's description matches the observed controls and saved-draft behavior. No new definitions or additional prerequisite lesson are required for this interaction change.

## Limits and original failures

The first supplementary guide check used an invented `/guide/workbench/` URL and timed out waiting for a main element. The generated guide is `/using-the-workbench/`; the corrected browser check passed. This was a reviewer harness error, not a product navigation failure. The 30-state interaction pass and the deeper execution checks had no failed assertions.

This review did not test a physical phone, an actual software keyboard, a screen reader, every browser, every course lesson or unavailable-fullscreen fallback. Focus was checked directly; suppression of a physical phone keyboard is inferred from not focusing the editable content. The real execution and case-check scenarios used addition, not every lesson's fixtures. This review does not replace technical validation or establish learning gains with novice programmers.

Temporary evidence includes `/tmp/single-editor-learner-results.json`, six `/tmp/single-editor-{width}-{theme}.png` workbench images and `/tmp/single-editor-optional-exercise-390.png`. These are local review artifacts, not deployed course assets.
