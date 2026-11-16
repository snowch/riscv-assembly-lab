# One editor and an optional exercise

Copyright © 2026 Christopher Snow.

The user reported disruptive page jumps when switching Explore/Challenge, questioned the duplicated activity flow, and explicitly chose one editor with an optional exercise section. Preserve the worked example and Change it and run again as the main route. The optional exercise still checks one submitted program on fresh inputs; no instruction semantics, fixtures or grading changes.

Applied the source learning-design workflow to attention, state and access. Browser reproduction at 390, 800 and 1440 pixels across addition, recursive progress and C return values showed the workbench returning 219–264 pixels lower in the viewport. Hiding and restoring the prediction above the editor changed document layout and browser anchoring inconsistently. Source length and starting-input changes added smaller shifts.

Remove the top-level mode toggle. Keep an Example/Exercise context label, explicit Load exercise and Return to example actions, and a named Optional exercise disclosure after the existing experiment. Opening the disclosure must not replace source or run code. Loading uses the saved exercise draft or starter; returning restores the example draft. Keep existing storage keys and recovery controls.

Keep the working editor height during these explicit transitions and preserve the workbench's viewport position when returning. Loading from the exercise below the editor may deliberately reveal the same workbench. Pointer activation must not force open the phone keyboard. Preserve batch locking, cancellation when changing inputs, source/fixture identity and real case inspection.

Use separate copy drafting and independent learner/technical reviews. Check mouse and keyboard, short/long source, saved drafts, phone/tablet/desktop in both themes, actual execution and case checks, fullscreen and fallback. Distinguish optional disclosure from an execution/input change. Do not equate a successful UI review with evidence of novice learning.

## Verification record

UI and guide wording was drafted separately by `single_editor_copy`. The independent learner review covered 30 lesson/viewport/theme combinations and actual paused disclosure, keyboard loading, saved drafts, fullscreen return and case checking. Its largest measured return drift was 0.36 pixels, compared with the original 219–264-pixel movement. These are interface measurements, not a novice study.

The first focused run passed twelve checks and failed four because two migrated tests lacked their new `loadExercise` helper import. The missing import was corrected without changing product behaviour. A fresh eighteen-check focused run passed, including frame-by-frame viewport tracking, retained working height, native/fallback fullscreen exit, keyboard focus and actual execution.

The final full browser suite passed all 66 checks without skips. All 14 unit/execution checks and 26 asset checks passed. The earlier focused failure and rerun retain their separate outcomes above. Existing runtime programs and fixtures remain unchanged. GitHub Actions repeats the required checks before publishing.
