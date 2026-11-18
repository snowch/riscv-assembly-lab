# Counter wrap teaching bridge

Copyright © 2026 Christopher Snow

The `addition-wraps` and `elapsed-time` explanations now contain the same compact
four-bit counter model. It sits after the real code workbench and its prediction,
inside the existing explanation. It does not replace a native example, answer a
native prediction, or load code into the editor. The addition placement omits the
elapsed calculation; the elapsed placement connects the completed reading trace
to the interval calculation.

## Model and interface

`site/course/counter-wrap-model.js` derives every number and pattern using exact
BigInt arithmetic. The initial counter is 14. Three advances produce 15, 0 and 1.
Each completed addition has a full five-bit pattern, a separate carry-out bit and
the four retained bits. Initial state has no completed addition or fabricated
carry. A computed reading trace keeps the boundary visible on the final step.

The elapsed section appears after the third tick, using the original and final
readings, not the previous addition's two readings. Its visible qualification
requires a normally advancing counter and fewer than 16 elapsed ticks. It also
states that readings cannot identify additional complete turns.

Canonical wording is `content/guides/counter-wrap.json`, drafted separately and
embedded in only the two generated lesson pages. The component adds no C/V/NZCV
badges. Visible text distinguishes a mathematical four-bit teaching model from
the native 64-bit RISC-V program, which has no carry or signed-overflow flag.

Advance and Reset affect only the miniature. A bounded integer count is stored
under `riscv-counter-wrap-v1:<lesson id>`. Malformed stored values return the
miniature to its initial state; unavailable storage does not block interaction.
No editor, exercise, project, completion or runtime storage is written. The
existing `.project-active .lesson-explanation` rule hides the miniature while a
personal project is active and restores it on returning to the lesson.

The action controls stay above changing results, so advancing does not move them
down the page. The pattern is an accessible named image, and concise status text
announces advances. At the bound, keyboard focus moves to Reset before the
disabled Advance control can strand it. The UI uses existing theme variables.

## Functional verification

- `npm run build:course`: passed, 58 lessons generated. The only changed generated
  lesson pages are `addition-wraps` and `elapsed-time`.
- `npm test`: passed, 41 tests, zero failures or skips (about 104 seconds). This
  includes six added counter tests, with real GNU/RISC-V execution of the original
  examples and all seven stated original/edited scenarios in these two lessons.
- Final focused pure-model/copy rerun after the trace addition: five passed,
  including exhaustive increments for all 16 four-bit inputs, the boundary trace,
  elapsed ambiguity, malformed inputs/storage and safe template substitution.
- `npm run check:assets`: passed, 26 pinned assets. `git diff --check`: passed.
- Focused browser run on an isolated server, desktop 1440 × 1000 and phone
  390 × 844: eight scenarios exercised. Four initially passed (native execution,
  project isolation, corrupt/blocked storage and 320px layout); four initially
  exposed a keyboard-focus defect. Disabling Advance cleared `activeElement`
  before the focus check. Capturing focus before rendering fixed it.
- The next four-case rerun passed the focus checks but exposed an incorrect test
  assumption that predictions persist a full browser reload. Existing prediction
  values are in-memory state; existing source drafts are persistent. The final
  test checks the prediction survives miniature actions and the saved source and
  miniature survive reload. That final four-case rerun passed in both sizes.
  These reruns do not change the recorded failure status of the earlier runs.
- Browser assertions cover keyboard Enter/Space, the three derived states,
  carry-out versus retained bits, final elapsed assumption, reset, saved source,
  untouched other storage, unchanged native values, project copies, no console
  errors, actual light/dark theme state, 44px controls and no horizontal page
  overflow. Native elapsed examples ran to 16 and an edited interval to 13.
- `.artifacts/counter-{addition-wraps,elapsed-time}-{desktop,phone}-{light,dark}.png`
  capture the wrapped state. The phone light preview was visually inspected:
  no clipped content, clear bit/carry separation and explicit binary/decimal
  labels. Independent learner/technical reviews and the parent's final full
  browser/corpus checks are recorded separately.

No lesson starter, experiment, challenge fixture, reference solution or native
execution mechanism was changed. A passing functional check establishes the
displayed arithmetic and interactions; it does not measure learner understanding
or prove learning effectiveness.
