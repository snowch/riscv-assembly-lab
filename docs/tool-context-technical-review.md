# Tool context technical review

Independent review of the working-tree implementation on `feat/playground-learning-context`, based on `2365a56`. Applied the learning-design skill and imported authoring rules. This reviewer did not edit application code. The parent is responsible for the full verification workflow, CI and publishing.

## Findings

1. **Medium: the phone strip suggests Run can observe a raw program's registers.** Open the worked complete program, choose Build & Run without pausing, and wait for Finished. The strip said “Run or start stepping to observe register values.” Its values remained dashes. The inspector correctly said “No paused observation was captured. Start stepping or Start debugging to inspect registers, memory and stack.” Running the same raw program again does not create a final report. Use the raw-program-specific direction in the strip as well. This is an observed inconsistency; novice misunderstanding remains a hypothesis.

2. **Medium: phone decimal observations do not visibly name their reading.** At 390 × 844, the strip shows the observation moment, last paused PC and pinned decimal values. Code and Program do not show the inspector's Signed/Unsigned control. The strip text has no reading label, although values use `view.readingMode`. Add a compact visible reading qualifier so a high-bit pattern's decimal meaning remains explicit across the views. The canonical observation copy already contains a reading phrase.

## Browser checks

Used an independent Chromium context at 1440 × 1000 and a 390 × 844 touch viewport against the local preview. These were actual GNU/TinyCC/xv6 executions, not expected-value animations.

- Compiled a C program with a `helper` called from `lesson`. The lesson-function scope remained selected when execution reached the helper. The new note named the helper and explained that the last paused PC was outside this scope. Choosing its recovery action selected All and restored one actual PC row. All displayed 148 supplied-source associations in this build; it did not invent C line associations for the helper. The source parser resets location metadata at symbol headings before accepting subsequent actual file/line records.
- For calculator32, `0xffffffff + 1` retained zero across an unsigned-to-signed reading change. The result stayed visible; its full signed result was zero and its full unsigned result was 4,294,967,296. Subtracting one retained `0xfffffffe`, with signed −2 and unsigned 4,294,967,294. These are different mathematical readings of the same operand/result patterns.
- A left shift of `0x80000000` by one retained zero, with the explicitly unsigned full shift result 4,294,967,296. Reading changes preserved that result. Widening subsequently cleared the result and zero-extended A to `0x0000000080000000`, with signed reading 2,147,483,648. The W-formation example was explicitly labelled as calculated, not executed.
- Opened the worked complete program and set a breakpoint on its actual exit `ecall`, source line 12. Actual registers there were s0 = 42, a0 = 0 and a7 = 2. Observed data held the two source counts 19 and 23. The generated complete source equalled the user's raw source. Continue completed exit, retaining the explicit last-pause qualification rather than claiming exit registers.
- Opened the fresh application, confirmed its source counts were 31 and 17, changed the helper to the requested difference and paused at its exit `ecall`. The observed s0 was 14. Ctrl+Enter in the calculator calculated its scratch values without advancing that paused CPU. Returning to the original project restored its exact source. This reference probe is evidence of executable correctness, not a worked answer added to the guide.
- On the phone, stepping the default fragment showed the actual first pause with zeroed working registers; after one `li`, t0 was 7 while t1/t2 remained zero. The next PC/instruction reflected that pause. A fast fragment producing t2 = 123 showed the captured-before-reporting qualification. Editing its source kept the old value and identified the observation as belonging to the earlier build.
- Pinning s0 persisted across reload. An initial role-locator probe counted zero because the reloaded Inspect pane was hidden; the stored pin was present, as the strip's “+1 more” and subsequent inspector state showed. This probe correction is not a product defect.

## Source and schema checks

Read the builder, worker, controller, generated-source model, project persistence, context/Program views, calculator model/UI and guide/example source. The structural route does not claim to animate supplied initialisation. The worker still seeks to the fragment or C-function entry and automatically reports after the capture checkpoint. All changes the listing scope, not that execution interval. Raw source remains unwrapped.

Seven independent pin assertions passed: aliases `x8`, `fp`, `s0` normalise to one s0 entry; JSON retains pins; unknown names, non-string entries, oversized arrays and non-array values are rejected; old project files without pins remain valid. This does not replace the parent's broader multi-tab and import tests.

## Correction rechecks

Both strip findings were independently rechecked in a fresh 390 × 844 touch context. A real fragment producing the all-ones pattern showed “Signed reading” and t2 = −1. Changing the inspector to unsigned and returning to Code showed “Unsigned reading” and t2 = 18,446,744,073,709,551,615, with the same captured-before-reporting qualification. Running the worked raw program without a pause now showed “Start stepping or Start debugging to observe this program’s registers.” Its register preview remained dashes. Both findings are resolved.

The final guide navigation fix was also checked on the phone with genuine native fullscreen and with fullscreen explicitly disabled to force the modal fallback. Selecting Complete-program guide left fullscreen, removed the modal and expanded the visible guide in both cases. The native probe asserted a non-null `document.fullscreenElement` before navigation; the fallback probe asserted it remained null. Neither path left the guide behind an open workspace dialog.

No findings remain open in the reviewed scope.

The final All-scope explanation and PC placement were independently rechecked through a real C helper call at 390 × 844 and 1440 × 1000. Selecting the recovery action displayed “All changes the listing scope. It does not change where stepping starts or where the supplied capture occurs.” The actual PC row remained below the sticky toolbar and inside the listing pane at both widths. On the phone, the toolbar ended at y = 469.19 and the PC row occupied y = 538.44–568.47 inside a pane ending at y = 637.89. The desktop assertion likewise passed. Changing scope did not move the outer page after the recovery button had been brought into view. The first probe measured before Playwright's automatic scroll-to-button and therefore detected that user-action preparation; it was corrected to isolate the listing's own scroll behavior. Source inspection also confirmed that ordinary project actions preserve an older project's absent pin metadata; explicit pin changes remain the action that writes pins.

## Limits

Full-suite, physical-device, screen-reader and human novice validation were not performed by this reviewer. Learner/theme/layout checks are separate evidence. Subsequent implementation changes affecting these checks need rechecking.
