# Shared UI and guide clarity copy

Copyright © 2026 Christopher Snow

## Scope and method

Read every field in `content/guides/workbench.json`, `playground.json` and
`tool-context.json`, the user's clarity-review brief, `docs/course-authoring.md`,
and the imported Assembly Lab learning-design, authoring and style guidance.
Inspected the actual controller, editor, calculator and Playground layout sources.
This is a separate drafting pass from checked implementation facts, not an independent
browser review or evidence of novice learning. No lesson JSON, starter, reference,
exercise case, JavaScript, template or generated page was changed in this pass.

## Accepted findings and verification routes

| Field or source | Checked issue | Correction | Executable verification route |
| --- | --- | --- | --- |
| `workbench.sections[inspect-results].paragraphs[0]`; `playground.help[workspace-views].paragraphs` | Lesson inspector stacks below the editor; Playground instead switches Code/Program/Inspect at or below 950px. A generalised location can direct a phone user to a hidden panel. Checked `workbench.css`, `playground/layout.js`, `playground.css`. | Qualify the lesson arrangement and name the Playground tabs and wide-screen arrangement. | Guide browser tests plus Playground 390/800/1440px: switch all three views, inspect Registers, both themes and keyboard tabs. |
| `workbench.sections[step-and-debug]`; `playground.help[run-and-observe]` | The assembly line numbers are actual buttons in the breakpoint gutter, not text to select. Checked `editor.js` marker and its click callback. | Say to choose the numbered button beside the instruction. Existing first-instruction pause, source expansion and C address-only qualification stay intact. | Addition source gutter: keyboard/pointer select the add line, Start debugging, check pause before its instruction, Continue. C uses a real Debugger address. |
| `workbench.sections[run-an-example].paragraphs[2]`; `lessonFeedback.predictionMismatch` | Valid edited code can differ from the original example. Prediction matching uses the executed register snapshot, while mismatch feedback unconditionally diagnosed operand order even for memory/C. Checked `workbench-controller.js` checkPrediction. | Explain that edits are included in the prediction's actual run. State that this run completed, report its actual register/reading/value, and compare the entered prediction with this run without guessing the cause. | Run original and a valid edited example with a matching prediction; deliberately mismatch another. Check actual-run values and absence of an original-example success/failure judgement. Repeat on C and memory examples. |
| `lessonFeedback.noPrediction` | Existing no-prediction response refers to an expectation the user never entered, with no concrete next action. | Report the observation and tell the reader to enter a prediction before the next run. | Leave prediction empty, run successfully, check reported register/reading/value and next-run instruction. |
| `lessonFeedback.finishedLesson`, `finishedExercise`, `finishedProject` | Generic finished status says to change an input even when lesson setup is read-only. Lesson and project control contracts differ. | Example status routes to Registers and the actual Change it and run again task. Selected exercise-case status routes to Registers and Check all cases, which tests every supplied input. Project status names editable code or Starting setup. | Complete an example run, an exercise selected-case run and an independent fragment/C project. Confirm the exercise status names Check all cases instead of the example experiment. For a complete assembly project, retain existing programFinished/last-pause messages: it has no supplied reporter or Starting setup initialisation. |
| `lessonFeedback.predictionUnavailable` | A run starts with a checking message; error, Stop or no snapshot can leave that message indefinitely. | Say explicitly that the prediction was not checked because no completed register result exists. One message covers these unavailable-result states; do not invent a second stopped-specific result. | From curriculum example mode, build invalid code, Stop a run, and run code that exits without the report. Ensure no checking message or numeric verdict remains; preserve error versus stopped versus no-snapshot status. |
| `lessonFeedback.errorStatus`, `diagnosticsTitle` | Diagnostics is not consistently below the action, particularly in Playground; its Build messages title omits execution errors. | Name Diagnostics without direction and title its actual contents Build and execution messages. | Trigger an assembler error and an execution fault in a lesson and Playground. Open Diagnostics via the visible tab, check both message types and no misleading below instruction. |
| `calculator.width32`, `width64`; new `calculator.help` | The current width note and optional Numbers and width repeat narrowing/widening; the optional heading is broad. Existing visible resize warnings are necessary before changing width. | Preserve both visible width/resize notes exactly. Remove the duplicate resize paragraph from optional help; keep reading, pattern padding, rejection and shift guidance there. Use Entry, reading and width. | Calculator at both widths/readings: inspect the visible consequence note before narrowing; paste fitting short and oversized prefixed patterns; confirm zero fill/rejection, change Width explicitly, inspect retained low bits. |
| `calculator.entryHelp` | Existing top notation help is useful but is inline JavaScript, while optional help is being consolidated canonically. | Preserve its exact visible wording as a canonical string. The optional help explains distinct interpretation/entry rules rather than repeating prefix instructions. | Check the canonical text above both fields and both aria-describedby links after runtime integration. |

## Preserved copy and rejected expansion

- Workbench title, optional-guide purpose, actual addition example/link, restoration and undo,
  fresh-run/Stop guidance, inspector table, exercise controls, keyboard table, resize/fullscreen,
  persistence and complete-program qualification remain unchanged except for the accepted
  location, breakpoint and actual-run clarifications above.
- The independent-project paragraphs in the workbench guide and Playground links remain
  byte-for-byte equal as JSON values. Neither copy was rewritten.
- Playground project types, source/caller/complete-program boundaries, signature, starting
  setup, persistence/import/export, register filtering and PC/build staleness definitions
  remain. Complete-program last-pause versus exit-state warnings remain essential.
- Tool identity, execution interval/source labels, observations, listing scope, W-result
  formation and RISC-V's lack of arithmetic condition flags are preserved. No Arm flag claim
  was imported. Bridge source and worked/fresh values were not changed.
- No prediction gate, optional exercise, control mode, new lesson or long generic directions
  were added. A correct edited experiment is not equated with reproducing the original value.
- Preserved visible `calculator.width32`: "Keeps 32 bits. Widening adds upper zeros; narrowing discards upper bits."
- Preserved visible `calculator.width64`: "Keeps 64 bits. Selecting 32 bits discards valid values’ upper bits."

## Exact new shared keys

`lessonFeedback` has eight keys. The `{register}`, `{reading}` and `{value}` placeholders
are substituted only from the completed actual observation, never from original example
constants. Runtime integration is the managing agent's responsibility. Keep the entered prediction when source changes; a mismatch against edited code is not an execution error.

```json
{
  "noPrediction": "No prediction was entered. This run produced {register} = {value} ({reading}). Enter a prediction before your next run to check it.",
  "predictionMismatch": "This run completed with {register} = {value} ({reading}). Your prediction differs from this result; compare it with the code you ran.",
  "finishedLesson": "Run finished. Inspect Registers, then try the task under Change it and run again.",
  "finishedProject": "Run finished. Inspect Registers, then change your code or Starting setup and run again.",
  "predictionUnavailable": "Prediction not checked: this run produced no completed register result.",
  "errorStatus": "Inspect Diagnostics for the error.",
  "diagnosticsTitle": "Build and execution messages",
  "finishedExercise": "Run finished for the selected exercise case. Inspect Registers, then use Check all cases to test every supplied input."
}
```

Two additional calculator source keys, `entryHelp` and `help`, replace existing inline
copy. `help` contains a summary and four paragraphs; no duplicate resize paragraph.
Render plain source text safely, retaining the input associations and optional disclosure.

```json
{
  "entryHelp": "Decimal by default. Use 0x for hexadecimal or 0b for binary. Spaces, commas and underscores may separate digits.",
  "help": {
    "summary": "Entry, reading and width",
    "paragraphs": [
      "Unsigned reads the bits as zero or a positive number. Signed gives the top bit negative weight.",
      "Hexadecimal and binary entries describe bit patterns. Shorter patterns get upper zeros, even with Signed selected.",
      "Values must fit the selected width. Leading zeros are allowed. A pattern with nonzero bits above that width is rejected; entry never changes Width or discards bits.",
      "For Shift left, B is the number of positions to shift: zero to one less than the selected width. The full shift result uses A’s unsigned bit pattern."
    ]
  }
}
```

## Checks in this drafting pass

The three canonical JSON files parse. The independently maintained project paragraphs
remain equal. Diff inspection confirms that only the two guide location/breakpoint
clarifications, actual-run guide paragraph and shared-copy additions were authored.
No browser, GNU/TinyCC or xv6 execution was performed in this drafting pass. Those checks,
final learner/technical review, generated outputs and runtime integration remain with
the managing session and its independent reviewers.


## Supplemental static Hello World review

The static `site/lessons/hello-world/index.html` page is outside the generated set of
58 lessons. Read all its headings, introductory/source/task/help/reference/footer text,
initial statuses, empty output, diagnostics and serial-log labels. Inspected `site/app.js`,
`site/workbench.js`, `site/worker.js`, `site/build.js` and the actual `site/hello.s` starter.
No static page or runtime file was changed in this separate drafting pass.

Six literal, uniquely matched HTML substitutions are proposed in
`/tmp/clarity-hello-proposals.json` for the managing session to apply:

- Replace the Prototype badge with Complete program, describing the source boundary.
- Put the first action before editing: Build & Run the unchanged starter, then inspect Console.
- Name the editable text inside the `.ascii` quotation marks and explain `\n` as a new line
  before the task relies on it.
- Replace the open-ended edit with an exact quoted-message substitution, preserving the
  existing newline. Name Console as the output to inspect. Explain that the assembler computes
  `message_length` from the message bytes, so the learner leaves that line unchanged. Give the
  second-newline experiment a concrete question about spacing after the message.
- Say Open a copy in Playground. Preserve the same handoff link, new-tab attributes and source
  transfer; the draft does not change the original page when its copy is edited.
- Replace the stale statement that stepping is future work: this page offers Build & Run and
  Stop; Playground offers stepping and debugging. Preserve the implemented source/executable/
  execution limits and console-input limitation, with no new tool or control mode.

Retained: Hello, RISC-V! title; technical pipeline subtitle; no-script fallback; source and Console
headings; current-source/result snapshot warning; draft/restore/download actions; initial run,
console, build and serial-log text; the focused-addition route; the optional write/exit argument,
system-call, pseudo-instruction, fresh-machine, storage and provenance explanations; all reference
and footer links. Their core facts and purpose remain valid. The root session owns any separate
runtime feedback or diagnostics-title integration; this draft changes no JavaScript.

Checked source facts: `site/hello.s` has `.ascii "Hello, RISC-V!\n"` and
`.equ message_length, . - message`. `app.js` transfers current source as a complete-program copy.
The simple workbench disables breakpoints; the shared Playground supplies the debugger.
`build.js` enforces 64 KiB source/256 KiB executable limits; the worker limits execution to
30 seconds. Those limits were read in source, not newly measured in a browser.

Verification route: existing `tests/browser/workbench.spec.js` checks baseline output, an edited
message, diagnostics, restore and saved drafts. Extend the focused final review to run the exact
new message and a second newline, comparing Console text/spacing and completed status. Existing
`tests/browser/playground.spec.js` transfers this page's edited source into a new complete program;
confirm the updated label keeps native new-tab behaviour and debugger availability. Check phone,
tablet and desktop in both themes. This pass verifies unique literal targets and preserves the
source; it does not claim those browser/execution checks have run.
