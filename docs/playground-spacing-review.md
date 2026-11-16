# Playground spacing correction

16 November 2026. The user identified a squeezed Complete-program guide link and excessive blank editor space. This patch changes CSS only; existing labels, lesson prose, source, execution and project storage are unchanged. No new copy was drafted.

The guide occupies its own left-aligned row below the execution stages and description, with a 36px target. Removed the competing narrow-screen absolute positioning and 100px width that wrapped its label against the right edge.

The normal workspace now uses a stable 280–400px initial height, with a 360px minimum on phones to accommodate touch-sized source lines and wrapped footer actions. Fullscreen uses a larger viewport-based height. Existing vertical resizing and internal scrolling remain available. Height does not depend on execution state, selected tab or edits.

Independent learner and technical review agents inspected actual Chromium layouts at phone, tablet and desktop widths in both themes. The guide review covered fragment, C and complete-program layouts, plus native and fallback fullscreen navigation. No overlapping guide text or page-level horizontal overflow remained.

The learner review caught an initial 280px phone workspace cutting off the starter's third instruction. The accepted 360px phone minimum leaves a measured 196px code surface at 390×844; independent light/dark rechecks confirmed all three instructions and an empty fourth line are visible. Long code remains reachable by internal scrolling and fullscreen provides more room. Paused stepping and Code/Program/Inspect switching preserve workspace height. No unresolved review blocker remains.

All ten relevant existing desktop/phone browser cases passed after the phone correction: execution-section navigation, paused observations and view switching, native/fallback fullscreen guide opening, project menus and fullscreen pane layout. These checks do not establish physical-device touch accuracy or novice understanding. They do not change the lesson/playground identity labels discussed separately with the user.
