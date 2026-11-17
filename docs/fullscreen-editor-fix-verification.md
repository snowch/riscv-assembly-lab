# Fullscreen editor sizing and redundant lesson links

Copyright © 2026 Christopher Snow.

The reported collapse failure reproduced before the fix: the control returned to Expand editor with aria-expanded false, but the editor stayed 500 pixels high instead of its 160-pixel compact height. The fullscreen-specific height rule overrode the compact editor rule. Removing that override lets fullscreen preserve the current editor size and lets Collapse restore the compact or manually chosen height. A legacy standalone rule also hid Expand editor; the unified workspace now explicitly shows that shared control.

The user also requested removal of the now-redundant bottom Playground link. The generated lessons and static Hello World page no longer render that link. Lesson and Hello World controllers no longer construct its transfer URL, and the unused UI handoff module was removed. Existing project/transfer schemas, imports, stored projects, the overview's direct entry and Tools → Projects remain available. Guide copy now describes the remaining controls.

## Verification

- Before-fix native/desktop regression: one failure, with the measured 500/160 height mismatch above.
- The first post-fix subset exposed the hidden standalone Expand control: its native Playground case timed out. That command was interrupted after the separate visibility correction, and is not reported as passing.
- Fresh final editor/fullscreen/layout/fallback subset: 26 passes, no skips, in 1.3 minutes. The new matrix covers lesson and Playground, native and modal fullscreen, both configured widths and both rendered themes. Tests preserve source and a paused real CPU, collapse while fullscreen remains active, leave/re-enter fullscreen and continue execution to the actual result.
- The broad project/identity command had 22 passes and two failures in the new copy test. Those tests inspected the prior Finished badge before the next run had produced its result. The test now waits for the current run's actual value with the established native-runtime timeout, then checks Finished. A clean focused footer/copy/identity command passed all eight checks at both widths without skips. It checks all catalogue pages plus Hello World for link absence, real project/example runs and source restoration, overview navigation and saved Hello World edits.
- All 35 unit/execution checks passed. Formatting and whitespace checks passed. GitHub repeats the complete required checks, including the expanded browser corpus, before merge.

The independent browser review is recorded in `fullscreen-editor-collapse-review.md`. Functional checks establish observed Chromium behaviour; they do not establish learning effectiveness or physical mobile-device coverage.
