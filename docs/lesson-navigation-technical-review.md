# Navigation and calculator technical review

Copyright © 2026 Christopher Snow.

Independent review on 2026-11-16, using `docs/course-authoring.md`, the imported Assembly Lab contributor/style rules and `docs/lesson-navigation-brief.md`. Reviewed the changed source and the actual built pages served separately on port 4248. This review did not edit product code.

## Findings and verification

1. **Medium: the calculator shortcut started the lesson behind the modal.** The calculator says “These controls do not run instructions or change your lesson code.” On the addition page, pressing Ctrl+Enter in Value A triggered the document-level lesson build shortcut. After one second the underlying lesson reported “Running” and “Starting xv6…”. Both the course and Hello World workbench have global handlers. Requested isolation at the calculator event boundary, with a regression proving a paused program is unchanged. **Corrected and independently rechecked:** the calculator handles Ctrl+Enter and Cmd+Enter locally. Both shortcuts calculated the expected scratch result with zero underlying build-button clicks. The actual addition VM remained paused at the same PC; Hello World remained in its ready state. Escape closed the dialog and returned focus; the explicit Close button also worked.
2. **Low: Hello World calculator inputs missed the shared input styles.** On the hand-authored Hello World page, Value A was 25 pixels high, while the course-page input rule supplies a 44-pixel target. Calculator-specific styles need to carry their own input height, padding and theme treatment. Arithmetic worked. **Corrected and independently rechecked:** Hello World inputs now measure 44 pixels high with 16-pixel text, in both themes at 390 and 1440 pixels. Their colours follow the actual theme and calculator arithmetic still passes.
3. **Resolved during review: the hand-authored Hello World header initially omitted the calculator.** Reported the shared-component omission; the header now includes the calculator assets and button. Its conversion/arithmetic worked in the browser; the input-style finding above is separate.

## Browser evidence

- Phone 390 and desktop 1440 pixels, each in the actual light and dark theme: course menu keyboard opening, Escape closing and returned focus; pointer outside closing; no document overflow; module breadcrumb opens the matching front-page module and its enclosing contents disclosure. No page errors.
- Calculator arithmetic in those four combinations: exact unsigned maximum plus one; the same bits read as signed; signed subtraction below zero; and a 63-position shift of the high bit. Checked retained decimal and full mathematical results independently, including results beyond JavaScript Number precision.
- Completed addition carries: high carry-in, final carry-out and signed-overflow readings matched the selected input patterns. High/low buttons scroll the shared bit rows. Editing an input clears the old result. A shorter binary pattern is zero-padded at 64 bits; explicit 64→32 then 32→64 changes match the documented truncation and zero extension. Oversized nonzero pasted bits remain rejected at the selected width; extra leading zeros are accepted. Navigating to the front page preserves input values in session storage.
- At 390, 800 and 1440 pixels: paused an actual custom addition program, opened and used the calculator, then closed it. Source, prediction, paused PC and scroll position were unchanged; heading coordinates and width did not move on open. The dialog top stayed fixed when a result appeared. Continuing the real program produced the expected observed register value. Checked restored root overflow/padding after the native close event completed.
- Addition, loads/stores and C-return pages at phone width: resource rows open the existing native disclosures. Complete source contains the generated `_start` program; References opens actual linked sources and the licensing record.
- With JavaScript disabled, the native Course disclosure and its current-lesson anchor remain usable. With sessionStorage throwing SecurityError, calculator entry, arithmetic, closing and same-page reopening work without an exception.
- Visually inspected calculator screenshots at phone/light and desktop/dark. The pinned dialog heading, input/result representations and contained layout were readable. This is a browser/UI review, not a novice usability study.

## Independent arithmetic check

Ran 112,360 comparisons against a separate calculation: 32/64-bit signed and unsigned Add/Subtract full and retained results, plus per-column carries and signed-range overflow. Inputs included zero, one, both sides of the sign boundary, maximum patterns and 100 deterministic additional patterns for each width. Each operand pair was checked with independent modular arithmetic and bit-column addition. All comparisons passed.

Read the parser bounds and explicit setting-change code. Input size is bounded; BigInt retains exact 64-bit patterns; incoming over-width nonzero digits are not silently truncated. Signed decimal has the selected signed range; hexadecimal/binary describe full-width patterns. Width changes explicitly resize existing valid values; invalid drafts remain available to correct. Shift count is an unsigned quantity below the selected width. The tool's widening contract is not presented as the RISC-V calling convention or a hardware instruction. No Arm NZCV values are presented as RISC-V machine state.

## Probe corrections and limits

The first outside-click probe targeted the lesson heading underneath the intentionally open dropdown, so Playwright correctly reported that the dropdown intercepted the pointer. Repeated on actual outside-menu background and passed. A first close-geometry probe read root styles before the asynchronous native close event; waiting for that event completed restored styles and position. These were reviewer probe corrections, not suppressed product failures.

The review is Chromium-based. Safari/Firefox, physical touch keyboards and assistive-technology speech output were not exercised. The root task owns the full browser/unit and corpus checks; this review does not claim those results. Both actionable findings above have been corrected and independently verified on the final files. No unresolved technical findings remain within the checked scope.
