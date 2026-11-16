# Workspace identity learner review

Copyright © 2026 Christopher Snow.

Independent learner/UX review of `feat/workspace-context-labels`, 16 November 2026. The reviewer did not draft the copy or implement the change. Used the inherited model without an override, following `docs/course-authoring.md`, the imported authoring/style guidance and learning-design skill. Read the identity brief/copy record and inspected the generated interface and canonical copy.

## Browser evidence

Checked local Playwright Chromium at 390 × 844, 950 × 1000 and 1440 × 1000, in light and dark themes. Inspected actual screenshots of scrolled lessons/projects and full screen, including the long lesson title “Keep a type’s width separate from a register’s width”, a near-limit project name and an exercise-derived project. Actual rendered themes were checked. Evidence is in `.artifacts/identity-learner-evidence.json`, `identity-*-lesson-*`, `identity-*-project-*` and `identity-exercise-phone.png`.

With the page heading offscreen, Lesson workspace and Playground project remain explicit beside the sticky run controls. Full screen retains the same context. Neither kind label is clipped. Long names use ellipsis without overflowing; their complete text remains in the DOM and title, and the full editable project name remains available through Project actions. Names fit fully at the inspected wider widths. No page-level horizontal overflow, overlapping context labels or uncaught page errors appeared.

The lesson identity row measured about 27 pixels high. A copied project with a return link used about 61 pixels on phone and 42 pixels at wider widths. The extra phone row keeps the return action readable. The final compact phone-toolbar CSS was included in these checks. The compact editor remained usable: a fresh phone project retained a 360-pixel workspace and 196-pixel code surface; the copied C example's three lines were visible. Wider project workspaces stayed 320 pixels at the checked viewport height. Full screen still provided more editing space.

Exercising the actual copy route produced Playground project with the current lesson title. Back to source lesson opened the correct source lesson in a new tab in every viewport/theme combination. Its accessible name includes the source title and new-tab behaviour. Fresh independent projects and an imported project had no source link. Rename, Save a copy, project selection and confirmed JSON import all updated the displayed project identity; selecting the earlier project restored its name. Editing the copied project's source left the lesson draft unchanged.

On the addition exercise route, Lesson workspace remained the context while Exercise remained the activity. The transferred project name included “exercise” and its origin included the selected “A zero input” case. These labels distinguish the independent copy from the original guided exercise without treating Exercise as another workspace type.

## Copy and orientation

The visible action reads “Open a copy in Playground” with “Independent copy · new tab · lesson draft kept”. Its accessible label names current code and starting setup. In the rendered workbench guide, the guided/independent choice is stated directly: “Use the lesson workspace for guided examples and exercises. Use a Playground project to work independently with the same editor, build tools and debugger.” The adjacent guide paragraph explicitly keeps project edits and lesson drafts separate. The return-link wording matches the actual action.

This is orientation for an existing shared tool, not a new instruction mechanism. No new prerequisite was identified. The complete route checked was lesson → independent copy → separate edit → source lesson; the exercise-case route and originless project provide fresh variations. No separate smaller worked instruction example is needed for these labels.

## Findings and limits

No unresolved P1/P2 learner or UX finding remains in the inspected states. Keep the compact identity row, explicit copy wording and conditional source return.

Two reviewer-script assumptions were corrected: default projects have generated IDs, and importing JSON requires confirming the preview. The corrected UI routes passed; these were not product failures. No implementation or copy was changed by this reviewer.

This is browser inspection and agent review, not a novice study or screen-reader validation. Touch access to a truncated title's tooltip, physical-device behaviour, modal fullscreen fallback and paused-machine/setup isolation were not independently established here. The integration/technical pass owns those checks and publishing validation.
