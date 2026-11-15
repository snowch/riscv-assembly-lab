# Editor workbench learner review

Copyright © 2026 Christopher Snow.

Independent learner/design review on 15 November 2026 by `editor_workbench_learner`, which did not draft the copy or implement the interface. Used the inherited model without an override. Read the source authoring/style instructions and inspected the actual product before reading `editor-workbench-brief.md`.

## Scope and evidence

Used fresh Chromium contexts against the generated site at `http://127.0.0.1:4246`. Inspected addition, recursive progress, C return values, stack frames, system calls and standalone Hello World at 390, 800 and 1440 pixels, in light and dark themes: 36 initial render combinations. Verified the requested theme changed the actual page background. Every combination retained one visible CodeMirror surface, no page-level horizontal overflow and no uncaught page errors.

In each course combination, every inspector tab opened its named panel, exactly one tab panel was visible, and the Registers panel could be restored. Starting inputs and fresh-machine information remained visible outside the tabs. Stack frames retained its stack-alignment and inspection-area qualification. The Memory tab was present only in lessons with a memory view. Visually inspected representative desktop light addition, phone dark stack and tablet dark C screenshots, including the source and inspector arrangement.

The initial strict rendering script stopped at Hello World's phone metadata font sizes after five course combinations passed. A later complete 36-state inspection reported the remaining desktop shortcut font issue separately. These failed font assertions are not counted as successful checks. After the scoped correction, a fresh six-state Hello World pass at all three widths and both themes found no visible text smaller than 11 pixels. Course combinations had already met that threshold.

## Teaching route and assumptions

The audience is familiar with programming and simple C while new to assembly. The unchanged first introduction defines registers, operand roles, `li` and assembler expansion before the workbench. The three-line program remains a complete small example. Removing a load would obscure the distinction between supplied inputs and values loaded by code, so a smaller example is unnecessary for this interface change. Prediction still precedes the run, observations identify their capture moment, and the fresh-input challenge remains separate.

Code highlighting, search and indentation introduce editor operations rather than new processor semantics. Syntax colour does not supply prediction answers. The visible Build & Run control and named inspector tabs support the essential route with every optional disclosure closed. The optional help correctly describes the independently checked Tab/Escape focus escape and search shortcut. The complete supplied source remains available; the editor shows the focused lesson fragment.

C source has ordinary line numbers rather than assembly breakpoint buttons. The optional debugger explains its actual-address approach to C. No new unexplained assembly prerequisite was identified in the inspected pages through the workspace change. This is not an audit of every pre-existing lesson term.

## Independently exercised interactions

At 390, 800 and 1440 pixels, edited the actual visible CodeMirror surface, used Ctrl+Z to restore the previous source, opened Find with Ctrl+F, indented with Tab, and used Escape then Tab to leave the editor. Keyboard ArrowRight, Home and End moved selection/focus through the inspector tabs and showed the corresponding panel.

Entered and left the maximised modal workspace at each width. The workbench returned to its lesson position and focus returned to its toggle. Started an actual GNU/xv6 paused addition session, entered/exited that mode, and independently confirmed the source and PC were unchanged. A following machine step loaded the expected first input; Continue completed the original addition. These early checks established modal maximisation, not native browser fullscreen: a later technical review established that requesting fullscreen on the dialog silently took the fallback path. They are not counted as native-fullscreen checks. These are execution observations, not claims that learners inferred operand roles.

At desktop width, physically dragged the native resize handle: editor height increased from 144 to 247 pixels. Escape from the maximised modal editor returned to the lesson. These checks did not edit or restart the program. Touch resizing on a physical phone was not tested; the Expand editor button provides a separate control.

## Final native-fullscreen recheck

After the independent technical review identified the silent dialog fallback and a phone scrolling issue, the implementer changed the request target to the workbench section and gave the actual fullscreen element a viewport height and its own scrolling. Rechecked the affected states rather than repeating the unrelated 36 initial renders.

At 390 × 844 and 1440 × 1000, in both themes, independently asserted that `document.fullscreenElement.id` was `workbench` and its client height equalled the viewport height. The source remained unchanged. Find stayed usable with at least 100 pixels of source viewport and actual query matches. Lower help and inspector controls were reachable. The phone workbench scrolled by 615 pixels to reach the help link. Following View complete program exited native fullscreen and the modal, restored the workbench to the lesson, and opened readable complete source outside it. All four scenarios completed without page errors.

Both phone theme scenarios used a real paused addition session. PC and source were preserved through native fullscreen and the complete-program link; the next machine step still loaded the original input, and Continue completed the original sum. A separate dark phone Memory scenario reached and selected byte 63 while the fullscreen workbench had scrolled by 874 pixels. Exiting retained the selected Memory tab. These checks confirm the corrected native mode and its lower controls, rather than relying on the earlier fallback observations.

## Findings and closure

**P3, closed: small Hello World metadata.** The touched standalone page initially showed its phone eyebrow/badge at 10.24 pixels, its draft footer at 10.88 pixels, and its desktop keyboard shortcut at 10.88 pixels. These were existing shared-style values exposed by reviewing the upgraded page. The implementer added scoped minimum text sizing. Independently reran all six width/theme combinations and verified no visible text below 11 pixels.

**P3, closed: positional memory-view wording.** `memory-bytes` originally said “The memory view below shows the supplied bytes”; `memory-protection` said “contains the byte shown below the editor.” The new inspector sits beside code on desktop and its Memory view is selected through a named tab. The implementer replaced the positional references with directions naming Memory and its Before/After controls. Independently verified both final generated pages at all three widths and in both themes: 12 combinations, with the named controls visible after selecting Memory.

**P2, closed: Find hid the compact phone editor.** At 390 pixels, opening Find on the untouched addition example initially shrank the source viewport to about 2.06 pixels while the search panel took about 204.94 pixels. The intended search expansion rule occurred before a later phone minimum-height rule with equal specificity, so the phone rule won. The implementer moved the search rule after the phone rules and strengthened the browser assertion to measure usable source space rather than only a match element's visible bounding box.

Independently repeated the original sequence with no prior editor expansion at 390 and 1440 pixels, in both themes. Typing `t0` produced highlighted source matches inside both the scroller and window viewport. The source viewport measured 352 pixels on phone and 453 on desktop, with no page overflow. Closing Find restored the original 210/144-pixel compact editor heights. The four corrected scenarios completed without page errors. One intermediate review script mistakenly expected the same Escape that closes Find also to release editor Tab indentation; its final focus assertion failed. The proper sequence closes Find, then uses Escape followed by Tab from the editor, and passed in all four reruns. That script mistake did not require a product change.

No unresolved P1/P2 learner or design finding remains in the checked scenarios.

## Limits and decision

The connected toolbar/editor/inspector supports the requested programmer-oriented experience while keeping the lesson's essential starting state and sequence. Keep this arrangement with the independently verified corrections above.

This review used automated Chromium and visual inspection, not physical devices, a screen reader or a novice study. It does not establish complete accessibility or a measured learning benefit. The main process owns the full automated suites, independent technical review and deployment checks.
