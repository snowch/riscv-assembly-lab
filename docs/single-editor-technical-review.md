# Independent technical review: one editor and an optional exercise

Copyright © 2026 Christopher Snow.

Reviewed 16 November 2026 using the inherited model without a model override. The reviewer did not implement the product change or edit its copy. This record covers independent source inspection and Chromium execution against `http://127.0.0.1:4246`, on `fix/single-editor-exercise`.

## Scope and reading order

Read the actual generator, generated lesson, controller, workspace and editor layout changes before reading the author brief. Applied `docs/course-authoring.md` and the source course's independent technical-review requirements. Reviewed the guide changes after forming the initial assessment. The diff changes the activity presentation and viewport preservation; canonical lesson programs, fixtures, expected states, grading and execution machinery are unchanged.

## Evidence

### Stable editor and viewport

Used fresh browser contexts for addition, recursive progress and C return values at 390, 800 and 1440 pixels in both light and dark themes: 18 layout/action combinations. Each had exactly one source editor, no Explore/Challenge mode buttons, and an optional disclosure that left the source unchanged until Load exercise was activated. Short and long programs retained the editor's actual working height through explicit transitions. Pointer loading focused the context label; Return restored the example source and focused that label.

For each combination, positioned the workbench toolbar 100 pixels below the viewport top, then recorded its geometry for 12 animation frames after Return. Maximum displacement was 0.36 pixels, including the prediction above the workbench being restored. The temporary scroll-anchoring override was released afterwards. There were no uncaught page errors.

Tested actual native fullscreen and deliberately unavailable-fullscreen fallback at 390 and 1440 pixels. Returned to the example inside the expanded workspace, then exited. The original toolbar position was preserved within 0.18 pixels across 12 recorded frames, the normal editor height was retained, the dialog closed, and focus returned to the fullscreen control. Source inspection confirms exit restoration uses workbench geometry rather than a stale absolute page offset.

### Drafts, execution and case identity

Ran real addition machines at 390 and 1440 pixels in both themes, with legacy `explore:v2` and `challenge:v2` draft keys prepopulated. Verified:

- Opening and closing Optional exercise preserves the paused CPU's execution position, source and pause state. It neither loads a fixture nor starts a machine.
- Explicit Load retrieves the saved exercise draft, stops the old paused machine, removes the continuation control and clears old observations. Return retrieves the separate edited example draft. Repeated Load while already in the exercise preserves source and selected case.
- Check all cases executes all three actual cases successfully with a valid submitted program. While checking, the editor is read-only and Load/Return are disabled. Closing the disclosure does not release those locks.
- Inspect this case displays each recorded case's observed registers matching that case's canonical expected state; the selected case indicator also matches. No assessment answer is reproduced in this review.
- Returning afterwards starts an example machine with zero working registers before its first instruction, rather than exercise inputs. Continuing the edited example produces its corresponding result. Drafts survive returning and reloading through the existing storage keys.

A separate Stop check used a nonterminating exercise program. Stopping the batch restored editing and Return. Returning to the example left no stale exercise observation or later CPU update.

With browser storage deliberately blocked at 390 and 1440 pixels, separate edited drafts still survived in-memory returns between example and exercise. Keyboard activation of Load moved focus to CodeMirror; pointer activation did not. The implementation retains the existing storage keys and guide destinations. The guide's new optional-exercise description matches the explicit controls and saved-draft behavior.

## Findings and closure

No unresolved blocking, major or minor technical defect was found in the reviewed change. The disruptive Return displacement is closed by the measured toolbar anchoring and retained editor height. The optional disclosure is an information-only action; explicit loading remains the boundary that changes source and execution inputs. Legacy drafts, case identity, cancellation, real case inspection, fullscreen exit and keyboard/pointer focus behaved as intended in the reviewed scenarios.

## Harness failures and limits

The final 1440-pixel dark execution repeat initially failed its reload assertion because the reviewer had unconditionally reseeded legacy draft keys in an initialization script on every navigation. That script overwrote the edited exercise before reload. The corrected check seeded only missing keys and passed exact draft recovery after reload. The preceding CPU, batch, case-inspection and fresh-example assertions in that repeat had already passed. This was a reviewer harness error, not a product failure; the corrected reload and Stop checks both completed successfully.

These are Chromium viewport and focus checks, not physical-device, software-keyboard or screen-reader observations. Layout coverage includes tablet width; deep execution uses addition rather than every lesson's programs. This review is not a full ISA audit, a novice learning study or a claim that the repository's complete test suite passed. Those broader checks remain separate from this independent evidence.
