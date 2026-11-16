# Tool context learner and UX review

Independent review of the working `feat/playground-learning-context` prototype, using the local learning-design skill and the imported authoring/style rules. This reviewer did not write or edit the implementation or canonical copy. Visual/UX judgments are heuristic review evidence; no human novice study was conducted.

## Browser evidence

Actual Chromium against `http://127.0.0.1:4220/playground/`, with independent browser contexts at 390 × 844, 768 × 1000 and 1440 × 1000 in Light and Dark. The rendered `data-theme` matched the selected theme in all six cases. Each case exercised a route/source link, actual xv6 stepping, relevant pins, calculator entry and result reinterpretation, Escape/focus return and restored source. No uncaught page errors were recorded.

| Width | Rendered themes | Route document-scroll delta | Ready-to-pause workspace top/height delta | Calculate bottom | Modal bottom |
| ----- | --------------- | --------------------------- | ----------------------------------------- | ---------------- | ------------ |
| 390   | Light and Dark  | 0 px                        | 0 / 0 px                                  | 690.5 px         | 818.7 px     |
| 768   | Light and Dark  | 0 px                        | 0 / 0 px                                  | 477.8 px         | 662.0 px     |
| 1440  | Light and Dark  | 0 px                        | 0 / 0 px                                  | 436.8 px         | 620.9 px     |

The complete-program guide was also exercised in desktop Chromium. Its preparation links and explanation precede the worked and fresh actions. Opening the worked program created a separate project. A real breakpoint at its exit `ecall` exposed the returned value in s0; Continue completed exit and retained the explicit qualification that the readings came from the last pause, not exit. Opening the fresh application created another project with different data. Selecting the prior projects recovered their exact source. The fresh application's result is deliberately omitted from this review.

A real two-function C program was stepped until it entered its helper. The notice said “The last paused PC is in helper, outside this scope.” The scope remained `user` until the recovery action was selected. That action changed the scope to All, restored one PC-marked row and focused Jump to PC. This was measured execution, not a source-only inference.

## Findings and correction record

1. **Medium, phone instruction visibility.** At 390 px, the single-line `#phone-observation-next` contains “Last paused PC: 0x100a0 · Next at the last pause: li t0,7”. Its fixed-width display truncates the right side, so the visible text reaches only the start of the operation and hides its operands. The preview is intended to let someone coordinate the operation with the pinned values while in Inspect; the long repeated labels consume the space needed for that operation. Keep the instruction readable, using shorter labels, a different ordering or a contained second line. Preserve the qualification that this belongs to the last pause.

2. **Medium, phone numeric interpretation.** After executing `li t0,-1`, the pinned strip showed t0 as `-1`. Choosing Unsigned in Inspect and returning to Code changed that displayed number to `18446744073709551615` at the same PC. The strip did not show Signed or Unsigned anywhere. The instruction and bits did not change, but their interpretation became hidden in another view. Label the strip's selected decimal reading locally. This is an observed information omission; whether a novice misreads it remains a hypothesis.

3. **Medium, guide navigation from expanded workspace.** In native fullscreen, selecting Complete-program guide opens the details outside the active workbench modal. The measured state was `document.fullscreenElement.id === 'workbench'`, the workbench dialog remained open, the guide was not inside that dialog, and focus remained on the guide-opening button. The background guide is not usable through the fullscreen/modal presentation. Close expanded mode before navigating to it, or present the guide inside the expanded workspace. Recheck native and modal fallback paths, including focus and preservation of the paused machine.

## Independent correction rechecks

All three findings were corrected and independently rechecked at 390 × 844 in both rendered themes. The recheck exercised actual xv6 stepping with a negative working-register value, then switched the inspector's decimal reading and returned to Code.

- The operation now appears before the PC in the shared strip and can wrap. A DOM Range around the actual next operands was measured wholly inside the displayed line box, rather than merely found in hidden text. In both themes its right edge was 101.5 px within the line box's right edge of 369.8 px. The next operands and opcode were visible. The full last-pause qualification remains in the title and the moment/PC labels.
- The strip visibly read “Signed reading” before the inspector change and “Unsigned reading” afterwards. The same paused register pattern and PC were retained. The numeric interpretation is now local to the values even in Code view.
- The guide path passed four actual fullscreen/theme combinations: native Light/Dark and forced modal fallback Light/Dark. For native cases, the probe explicitly asserted that `document.fullscreenElement.id` was `workbench` before selecting the guide; fallback cases disabled native fullscreen before page load. The guide action closed the expanded workspace, left no native fullscreen element, opened the guide and focused its summary. The same paused PC, exact source and Paused badge remained after navigation. This verifies the visible page and the machine state, not only a changed attribute.

The first correction probe assumed a literal space in GNU's displayed `li t1,5`; the actual disassembly used a tab. That probe failed to locate its text and was corrected to measure the operand substring. This was a probe assumption, not a product regression. The subsequent probes passed. No reviewed findings remain open in this scope.

## What to retain

- The structural route names supplied setup, user code, capture and reporting, with a concise visible stepping interval. Selecting Entry + setup expands actual supplied source, rather than showing a fabricated animation.
- The complete-program project route makes the source responsible for inputs, data and how execution ends. It does not insert the fragment reporter into that project.
- Relevant seeded pins keep the default example's working registers together while All remains available.
- The calculator's action is inside the initial phone modal viewport. Operand conversions are compact; the selected scratch width and reading remain named in its sticky heading.
- The calculator retains the actual result when the reading changes. With all-one 32-bit A and B equal to one, the same retained pattern remained visible while the reading-dependent full mathematical totals were distinguished. The RV64 W result is explicitly labelled as calculated, with “No CPU instruction was executed.”
- The guide supplies preparation, a small complete example, a fresh change and causal questions about inputs, call/return and the observation before exit. It asks for an explanation beyond reaching a matching number.

## Prerequisites and limits

The starting reader knows basic C and binary place values. The main route introduces or exposes entry, setup, capture and reporting, but it is not a complete first lesson in register operands or assembler syntax. The named guide appropriately links preparation for memory loads, calls/returns, system calls and executable entry. Those links are preparation routes, not evidence that an unfamiliar reader has practised the mechanisms.

The browser checks establish interaction, state and rendering behavior. They do not establish learning effectiveness, screen-reader accessibility, physical-device behavior, every possible assembler directive, GitHub CI or deployment. Source/semantic review and the parent's automated suite provide separate evidence. Probe scripts and screenshots were written under `/tmp`; no implementation files were changed by this reviewer.
