# Counter-wrap bridge: independent technical and sceptic review

Copyright © 2026 Christopher Snow

## Scope and evidence

Reviewed the BigInt mathematical model, generated markup, runtime mounting, canonical JSON copy, lesson generator placement, styles and focused tests. Checked the generated uses in `addition-wraps` and `elapsed-time`. This review did not author the implementation or learner copy.

Independently executed checks for all sixteen input values to the increment helper, all four bounded model states and malformed saved-state inputs. Retained bits equal the low four bits of the exact sum; the extra bit equals the sum divided by the four-bit range. Stored patterns and full patterns parse back to the computed values. The elapsed subtraction is modulo sixteen and agrees with the bounded tick count. The displayed trace is computed from the same starting value and tick count.

Checked the pinned RISC-V manual excerpts in `/tmp/riscv-audit-rv32.txt` and `/tmp/riscv-audit-rv64.txt`: RV64 has XLEN=64; ADD/SUB write low XLEN result bits; the base integer instructions do not provide special overflow-check support. The local model note explicitly distinguishes a four-bit teaching model from the 64-bit native program. The carry is not presented as an architectural flag. The elapsed interpretation includes normal counter advance and less-than-one-full-turn assumptions; it does not infer complete turns from two readings.

The new model uses an independent lesson-specific storage key. It neither edits the source nor calls the native runtime. Static/generated text is escaped, embedded JSON escapes less-than characters, and model restoration validates the parsed number. Original starters, suggested native experiments and challenge data are unchanged.

## Findings and sceptic assessment

- **Accessibility issue, corrected before final inspection.** Early markup gave the bit-pattern div an accessible name while hiding every child from accessibility APIs, without a semantic role. The implementation now uses `role="img"` with the current pattern as its accessible name. Independently confirmed the role and changing accessible name in Chromium.
- The learner review reported no material learner-facing findings. Its distinction between the addition-only miniature and the final elapsed extension matches the generator and runtime conditions. No additional material technical fault found.

## Browser checks and limits

Independently used Chromium at 390×844 against generated `elapsed-time` files. Advanced through every tick, checked the changing bit pattern and separated carry, inspected the final elapsed assumption, reloaded and reset. The native register output remained unset while miniature controls changed; the model therefore did not impersonate an executed RV64 result. No page-level horizontal overflow occurred.

An optional native-browser verification attempt waited for a visible Finished badge and timed out because that badge was in a hidden inspection pane, although its text had reached Finished. This was a reviewer-harness error, not a passing native check or evidence of a product execution failure. A corrected independent rerun checked the Finished text without requiring the hidden badge to be visible: both the original elapsed-time example and its stated editable-input experiment executed successfully with the expected register result. Full suites and desktop/theme review remain separately reported by the implementation agent, parent and learner reviewer. Functional verification does not prove learning effectiveness.
