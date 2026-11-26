# Shared course controls review — 2026-11-23

The original layout exposed tool-heavy workbench controls and used a different course menu from the Foundry and CUDA courses. The updated header retains Calculator and Reference with visible labels, adds optional App status and Code runner, and moves Source to the footer. The inline Course lessons row combines progress and breadcrumbs. The original homepage illustration sits beside the introduction at wide widths and after course choices on phones. Local Plex fonts and Material Symbols match the shared course guide.

The runtime remains real RV64GC/xv6 execution. A prepared-tool host shares immutable binaries and derived modules; each execution still starts fresh tool instances and a fresh machine. The introduction precedes the first implicit startup, is cancellable, and is acknowledged by explicit header preparation. No CPU percentages or guessed memory use are shown. The standalone Hello World page also uses the shared controls, original complete-program linker script and its existing source keys.

The learner can read without downloading WASM, open either header tool, prepare explicitly, run an edited program, release memory and retain the result. Explicit complete-course saving verifies every file. A fresh offline tab must open a different lesson and execute real code; an update uses safe all-window saving and preserves independent predictions, drafts, completion and earlier observations. Failed saving vetoes restart. Loader failures use a persistent native modal and keep earlier genuine results; normal source diagnostics remain inline.

Browser checks exposed and corrected visible-label overflow on narrow headers, a feedback-height mismatch after the font change, and a legacy standalone page outside the course generator. Compiled WASM modules cannot reliably cross a SharedWorker agent-cluster boundary, so prepared bytes plus a release-keyed IndexedDB module cache are used instead. Tests exercise actual execution rather than replacing the runtime. The native Background Fetch fallback imports only verified completed records and preserves explicit consent; protocol tests cover unresolved records and earlier-release retention.

Verification covers desktop and phone, both themes, keyboard interactions, actual assembly/C/debugging/challenges, source/project persistence, fresh-tab offline execution and staged two-window updates. See the test output and CI for the final status; functional success does not establish learning effectiveness or physical Android performance. No lesson objectives or runtime observations were replaced by illustrative output.

The two-window update test caught a substantive participant-discovery bug: directory-based lesson URLs were excluded from restart saving/reload. Normalizing all trailing slashes to the corresponding `index.html` fixes the skipped participants and repeated restart offer. The regression checks blocked saving in one lesson, intact old release/work, then successful all-window restart to the same new version.

A stronger plane journey saved from the homepage before any run and stopped the real HTTP server. It exposed a second directory-key bug in offline fetch lookup, which browser offline emulation had masked. One directory-to-index helper now serves cache lookup, restart participation and recovery classification. The regression requires a fresh unvisited lesson to execute without any previously prepared modules or reachable host; the updated-course journey also stops the server. Recovery uses the course's actual theme key and RISC-V subtitle.

The first complete final CI browser run passed 200/204 cases; the remaining two scenarios appeared in both viewports. Their stale assumptions skipped first-use acknowledgement when storage was denied and tried to intercept a SharedWorker fetch through a page-only route. The corrected checks still require an actual CPU trap to report Error with no infrastructure modal. The loader journey now injects a real execution-worker HTTP503, retains the genuine previous greeting and edited source, verifies modal/Escape/focus recovery, and reruns the changed greeting successfully. No product behavior or timeout was weakened to accept the tests.

The standalone workbench now announces Starting immediately while it prepares, preserving the old output until tools are ready. The recovery regression waits for the new run to finish and requires its changed greeting, so an earlier Finished label/output cannot satisfy the retry assertion.

## Resource-row follow-up — 2026-11-24

The shared appearance was incomplete: resource chevrons still used CSS borders, the course row used text symbols, References had no scope subtitle, and two project guides were appended after lesson navigation. Resource and outline marks now use the pinned official Material geometry. The existing reference labels supply the scope; titles and subtitles have separate elements. Both guides move intact into the resource section before completion, retaining their IDs and workbench actions.

The first focused run exposed the title/subtitle text target and failed in both viewports. A run started during regeneration also failed and is not a successful verification. After complete regeneration, the final four browser cases passed in 35.7 seconds: desktop/phone, both themes, 20px chevrons, keyboard disclosure and outline actions, resource ordering, and actual paused execution preserved when its guide opens. The two release/retention tests passed. Four resource screenshots at 390px and 1440px in both themes were inspected. A redundant local full runtime suite was stopped; required full CI remains separate evidence. These checks establish interface behavior, not learning effectiveness.

Independent follow-up review accepted the resource geometry, existing-label scope and node movement, and found that the new decorative completion SVG left its generic wrapper without reliably exposed status text. Completed outline marks now have an explicit image role and the existing accessible name Completed. A real checkbox/outline journey verifies the status appears with that role/name, keeps its SVG decorative and disappears on undo. The focused desktop/phone matrix passed2/2 in13.7seconds; the exact updated head must still pass the complete CI workflow before merge. No runtime/model/storage content changed.

## Shared header icon controls

UX and learning-design review: compact Material 3 theme/offline actions replace header text controls; 48px targets, action labels, tooltips and focus outlines preserve discoverability and keyboard access. Existing native theme handlers, offline verification, saved work, runner controls and subject-specific links remain authoritative. The saved badge requires a verified current offline copy; an update dot identifies an offered update. Go keeps a status icon because it offers no complete offline copy. No lesson sequence, teaching claims or prerequisites change. Review phone/tablet/desktop, both themes, keyboard, storage denial and the real save/update state transitions. Functional evidence is recorded with the change; it does not establish learning effectiveness.

Header validation keeps the existing source-site emulator fixtures isolated. The shared-course suite separately serves the built, versioned site for header tools, System preference, saved work, complete offline access and real fresh-tab execution; native execution assertions and deadlines are preserved.


## Visible header labels (2026-11-26)

UX and learning-design review: retain the Material symbols and add visible
**Offline** and **Theme** labels so touch users can identify the actions without
a tooltip. The Code runner name and state, subject-specific tools, native theme
preferences and verified offline/update badges remain. Controls fit their text,
use at least 48px touch targets, and wrap on narrow screens rather than hiding
labels. No execution, lesson instructions, progress or saved-work contract changes.
The shared [course design guide](https://github.com/snowch/cuda-python-lab/blob/main/docs/course-design-guide.md#theme-and-offline-icons)
records this rule. Validation covers the built header at 320, 390, 820 and 1440px
in both themes, keyboard focus, modal opening/Escape, persistence and project-local
asset requests. Functional checks do not establish learning effectiveness.
