# Workspace identity independent technical review

Reviewed 16 November 2026 on `feat/workspace-context-labels` by an independent Codex agent using the parent session's inherited model and effort. This agent did not draft or edit the implementation or canonical copy. No blocking technical finding remains in the reviewed prototype.

## Scope and sources

Read `docs/workspace-identity-brief.md`, `docs/workspace-identity-copy.md`, the canonical identity and Playground strings, the generated markup, and the changes to `workbench-markup.js`, `workbench.css`, `playground.css` and `playground/app.js`. Traced the existing project normalisation, metadata updates, lesson snapshot and handoff code. Applied `docs/course-authoring.md` and the imported Assembly Lab authoring, style, independent-review and learning-design requirements already read in this review session. Assembly Lab remained read only.

The new labels describe interface context rather than processor state. Program kind and Example/Exercise remain separate. Generated lesson names use the shared HTML escaping function. Dynamic project names, origin titles and case names use text or DOM attribute assignment; validated origin IDs form the relative lesson URL.

## Browser evidence

Ran independent Chromium scripts against the local built site on port 4220. The layout matrix used phone 390×844, tablet 950×1000 and desktop 1440×1000, explicitly selected light and dark themes, lessons and projects, and native and modal fallback fullscreen: 24 combinations. The fallback was set before application initialisation in fresh browser contexts. Native cases confirmed an actual fullscreen element; fallback cases confirmed none.

Every combination passed these checks:

- The toolbar shows “Lesson workspace” with the current lesson title, or “Playground project” with the current project name. Scrolling until the build toolbar is pinned keeps the identity visible with the page heading offscreen.
- The identity stays above the run controls, with a positive name width and no document horizontal overflow. Both identity fields remain visible in native and fallback fullscreen.
- A project without an origin has no return link. A project opened from a source lesson has one origin container inside the build toolbar. The link says “Back to source lesson”, targets `_blank`, has the lesson title as its tooltip and names the lesson and “new tab” in its accessible label.
- An 80-character project name containing markup-like text appears as text, creates no image element, keeps its complete text and title in the DOM, and truncates visually where space requires it. Phone layout wraps the source link below the kind/name rather than overlapping the run controls.

Inspected normal-layout screenshots for both contexts across phone, tablet and desktop, including both themes. Additional measured checks covered the first three starter lines within the source pane in normal and native fullscreen layouts for both contexts at all six viewport/theme combinations. The source remains visible without clipping; the earlier compact workspace sizing remains in place.

A separate state script checked actual UI actions:

- Rename updates the toolbar immediately after committing the field. Save a copy creates a distinct project ID and displays the copied name. Selecting the original restores its name.
- Opening the array example updates both name and source lesson URL. Selecting a project without an origin removes the link. Importing a C project updates name and origin accurately; selecting a previous copy restores that copy's name and clears the imported origin.
- Imported names and origin titles containing `<b>`, `<img>` and `&` remain text and attributes, with no inserted child markup.
- The lesson link visibly says “Open a copy in Playground”, has native `_blank` semantics and describes the new tab in its accessible label.
- A selected addition exercise case was paused before copying. The actual handoff URL contained the edited source and selected `t0`/`t1` inputs, with no PC, runtime register snapshot, paused state or prediction fields. The new project started Ready, displayed the exercise project name and source-case origin, and contained the same source and starting setup.
- Editing that independent project left the original lesson's source, Paused state and PC unchanged. The source-lesson link opened a separate lesson tab. Continuing the original paused lesson still produced its selected case's result, 9.

The independent scripts were `/tmp/independent-workspace-identity-matrix.mjs`, `/tmp/independent-workspace-identity-state.mjs` and `/tmp/independent-workspace-identity-source.mjs`, each exit 0. Screenshots used `/tmp/identity-technical-{lesson,project}-{390,950,1440}-{light,dark}.png`.

## Decision and limits

Keep the current implementation and copy. The identity reflects the active context, dynamic metadata stays current, origin links describe and perform separate-tab navigation, and the copy operation preserves source/setup independence. No correction was requested by this technical pass. No unsupported findings were retained or rejected.

This is local technical and rendering evidence, not a novice study or complete accessibility validation. Screen-reader output, physical touch hardware and non-Chromium browsers were not tested. Parent integration owns the wider automated suites and deterministic generation checks; this review does not establish merge or publishing status. Recheck affected results if implementation changes after this pass.
