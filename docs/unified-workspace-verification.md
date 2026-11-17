# Unified workspace verification

Copyright © 2026 Christopher Snow.

## Required local checks

- All 35 unit/execution checks passed, without skips.
- The pinned editor bundle rebuilt without changing its bundle or manifest; all 26 pinned assets verified.
- Course generation was repeated and its committed pages/configuration remained unchanged.
- The complete lesson corpus passed: 57 native examples, 196 native reference cases, 57 rejected incomplete references, 58 xv6 examples, three xv6 syscall cases and one rejected incomplete syscall starter. No corpus failures.
- The first full browser command completed with **151 passes and one failure** in 9.1 minutes. It had no skips. The failure was the old phone viewport baseline described below; its original exit status remains a failure.
- After the measured baseline correction, a focused command repeated the geometry check twice at each width: **four passes**, no skips. Its strict geometry, page-scroll, source-scroll, program-scroll and paused-CPU assertions remain.
- The added custom-setup preservation command passed both phone and desktop checks. It verifies the pre-action explanation, unapplied setup fields, a real changed-result run, Return to lesson, protected project deletion and saved-work reload.

The head adds two checks to the original 152-test browser corpus. GitHub runs the complete 154-test suite against the final commit before merge. That CI outcome is reported separately from local commands; local focused successes do not rewrite the first full command's result.

## Phone scroll measurement

The old test captured its viewport baseline before navigating to a below-editor dock. On a 390-pixel viewport, Playwright scrolled the document to reach Program. Independent measurements found scrollY changing from 0 to 922 while the editor's document position changed only two pixels, its height remained 735.46875 pixels, and its internal scroll stayed 220. Registers/Program switching then kept the viewport fixed, preserved program scroll 120, and retained the paused CPU.

The baseline now starts after navigating to the dock. All previous strict tolerances and execution assertions remain. A separate two-pixel opening change came from the longer “Close tools” label wrapping; the disclosure now keeps the label Tools and communicates state with aria-expanded and the selected background.

## Development commands and review boundaries

Early development runs found real missing-element/handoff errors, a clipped action menu and insufficient source space when Find opened. Independent reviews also found the batch/deletion guard, setup-draft refresh and lesson-context restoration issues. Their fixes and independent rechecks are documented in the separate learner and technical review records.

An initial browser subset completed with three failures and one pass while old navigation assumptions remained. Another subset lost its test-owned server during concurrent runs; that network-invalid command had five connection-refused failures, two interrupted checks and two passes. Subsequent probes used a persistent server. The first stable-server migration subset had 31 passes and seven failures. After the migration and Find correction, a clean 14-check run covered those seven cases at both widths and passed without skips. One new preservation test initially compared innerText to textContent; both widths failed that assertion, which was corrected to compare like with like. The four new end-to-end flows then passed at both widths.

The independent learner and technical probes used actual browser compilation and xv6 execution, including C functions, complete programs, memory, stack, debugging, imports/exports, return from projects and stored drafts. They include phone/tablet/desktop sizes, both themes and keyboard controls. These checks establish functional observations in Chromium; they do not establish novice learning effectiveness or physical-device compatibility.
