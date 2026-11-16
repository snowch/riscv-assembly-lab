# Playground layout learner review

Independent review of the built local page on `feat/playground-program-view`. The reviewer did not author the implementation or copy. Review evidence comes from Chromium against the actual local app, plus the canonical copy and relevant source. This is a review of the working playground, not a novice study or physical-phone test.

## Browser coverage

The source view was checked at 390 × 844, 768 × 1024 and 1440 × 1000, each in Light and Dark. The requested theme matched the root theme and computed background. All six had contained page width and no uncaught page errors. Program source showed Entry, collapsed supplied initialisation, the exact user code, collapsed capture/reporting/exit and starting data. At tablet and desktop widths, starting a real paused run changed workspace top and height by zero pixels. Height stayed fixed on phones too, but stepping scrolled the document by 97 pixels; see finding 4. Machine instructions marked the actual paused instruction in every case.

Keyboard ArrowRight and End changed the workspace tab and moved focus to it. At a phone width, a two-instruction fragment ran with committed `t0 = 9`, `t1 = 10` and three supplied bytes. Program source reflected the committed initialisation and the complete edited fragment. After a machine instruction, Changed showed one changed register. Pinning t0 then choosing Pinned showed t0 and the existing highlighted register. Editing while paused produced the explicit previous-build qualification in Machine instructions, while Program source showed the new editor text. Expanded supplied initialisation stayed expanded across an edit. Program source scrollTop stayed at 240 across Code → Program.

A real C example built and finished; its source view showed the C separately from the assembly entry/call. The C mapping qualification was present beside the machine listing. A complete Hello World program had no supplied source folds, ran and printed its actual output. Phone fullscreen retained the Program view and contained page width. Desktop native fullscreen (verified document.fullscreenElement) and forced-modal fallback also retained both side-by-side panes, contained page width and the selected Program view. Escape or the return control restored the workbench to main.

The review's first deeper probe incorrectly expected a one-instruction fragment to remain paused after executing its last instruction. The app finished as designed. The probe was corrected to use a second instruction; this was a review-script error, not a product finding.

## Findings

1. **Medium, keyboard focus: register pin actions discard focus.** Focus the button whose accessible name is “Pin t0”, then press Space. The card is recreated, and `document.activeElement` becomes BODY instead of the replacement “Unpin t0” control. Keyboard users lose their place in the register list. Preserve focus on the corresponding replacement control without scrolling the page; account for a filter that removes that row. This was observed at 1440 × 1000.

2. **Medium, debugging orientation: the PC row can be far outside the visible listing.** Choose Program → Machine instructions → All instructions, then Start stepping. The note says “PC marks the next instruction at the last pause”, but the highlighted row remained at y = 1733–1763 while the visible machine pane occupied y = 419–1021; its scrollTop remained zero. A user must search through supplied initialisation to locate execution. Provide a contained follow-PC action or a visible way to jump to the PC, preserving the page and other view scroll positions. This was observed with the actual default fragment at 1440 × 1000.

3. **Low, pin discoverability: visible circles do not identify the action on hover.** Register pin controls show “○” or “●”. Their accessible names describe Pin/Unpin correctly, but the controls have no title or visible explanation connecting those circles to pinning. Use a recognisable labelled cue or a tooltip alongside the existing accessible name. This is separate from the keyboard focus fault.

4. **Medium, phone stepping scrolls the document.** On a fresh 390 × 844 page at scrollY = 0, click “Start stepping” and wait for the actual pause. Immediately after the click scrollY remains zero; after the pause it becomes 97. The workspace stays at documentY = 436.4375 but moves from viewportY = 436.4375 to 339.4375. Code/Program switching itself then retains scrollY = 97. The editor's centred line scroll reaches the outer document. Keep instruction following inside the editor while preserving document position.

## Assumed knowledge and limits

The independent playground can be entered before completing the course. The read-only source exposes assembler directives, `_start` and supplied `_lab_*` labels, but the project type, fold labels and optional help identify which code is supplied. Machine instructions defines PC locally. C's missing source mappings are qualified rather than invented. Pinned/Changed/All has local help explaining the comparison. No additional unexplained prerequisite was found that prevents the tested run/edit/inspect flow.

No verdict is made here on every GNU directive, every instruction, screen-reader output, actual touch targets on hardware, other browser engines, or the entire lesson corpus. Technical execution/schema review and repository regression results are separate evidence. The findings above require independent browser rechecks after correction.

## Independent correction checks

Findings 1 and 3 were rechecked in the updated browser page. Space on Pin t0 focused the replacement Unpin t0 button, and the hover title was present. On a phone, unpinning the only displayed t2 under Pinned moved focus to Show registers; the empty state appeared and document scrollY stayed zero.

Finding 2 was rechecked with the actual All instructions listing and a fresh paused run. Its current PC row was at y = 705–735 inside the machine pane at y = 419–1021, with its own scrollTop = 1080. The supplied-code rows remained present; following the PC moved the contained listing. Program source still retained scrollTop = 240 across Code/Program switching. A visible Jump to PC control was also added; its manual interaction will be checked with the remaining phone-scroll correction.

Finding 4 remains open at this record point. Its isolated reproduction uses a fresh phone page, so it is independent of the matrix screenshot interactions.

Finding 4 was independently rechecked in both rendered phone themes. A fresh run and its first pause kept document scrollY at zero. A real branch to source line 63 scrolled CodeMirror to 2515 while document scrollY stayed zero, workspace viewportY stayed 436.4375 and its height stayed 540.15625. The later offscreen source line followed within the editor. This closes the phone stepping jump.

The added Jump to PC action was checked manually after scrolling the machine listing away. It returned the actual marked row into the pane and kept document scrollY at zero. Native fullscreen and return preserved machine scrollTop = 3032 in both phone themes. The same listing's automatic PC follow worked after changing instruction scope.

A final low-priority usability observation was sent to the implementer: the machine scope/Jump toolbar is itself inside the scroller and can be scrolled out of sight by automatic PC following. Making those actions sticky or placing them outside the scrolling listing would keep them available while browsing. This does not invalidate the corrected PC-follow and scroll-containment results.

The final toolbar observation was corrected and independently rechecked at 390 × 844 and 1440 × 1000, each in Light and Dark. In all four real paused runs, the sticky scope/Jump toolbar stayed at the machine pane's top while the actual PC remained visible below it. Manual Jump to PC remained reachable after scrolling the listing. Editing a previously scrolled source kept the explicit “Source changed. Instructions and observations still belong to the previous build” note visible outside the scroller, and the actual last-build PC row remained within the pane. On the phone the PC was at y = 753–784 and the sticky toolbar at y = 561–638 before the edit; desktop PC y = 705–735 and toolbar y = 419–497. This closes the final low-priority toolbar observation.

A fresh real C build on the phone also confirmed the stationary mapping qualification after scrolling All instructions: “TinyCC does not provide C source-line mappings. All includes compiled C and the supplied assembly.” It stayed visible at y = 593–629, as a child of the Program panel rather than the scroller. The last-successful-build note likewise remained outside the scroller. No reviewed findings remain open after these targeted checks; broader regression results remain separate.

The final register-filter help adjustment was independently checked by opening the “?” disclosure at 390 × 844 and 1440 × 1000, each in Light and Dark. Its complete explanatory text stayed inside the visible pane and viewport. Phone bounds were x = 120–370, y = 625–730; desktop x = 1163–1413, y = 520–624. Computed tooltip backgrounds matched the rendered light/dark surfaces. The revised README's Code/Program/Inspect, folded exact source, separate C caller, real instructions/PC, Jump to PC and retained filter-comparison descriptions agree with the browser interactions reviewed above. Existing storage/import guarantees were not re-certified by this small tooltip recheck; those remain covered by the separate technical review and regression evidence.
