# Compact bit comparison copy pass

Separate drafting pass from `docs/compact-bits-brief.md`, the calculator source and its exact addition-carry model. Applied the imported `docs/style.md`, `docs/authoring.md` and `.agents/skills/learning-design/SKILL.md` from Assembly Lab. No Assembly Lab files changed.

The learner knows binary place values. The intended action is to compare aligned columns and distinguish an incoming carry from the extra carry-out position. The two local explanations define the carry mechanism and signed overflow when carries are enabled. The existing calculator introduction still distinguishes scratch calculation from CPU execution.

`calculator.bits` in `content/guides/tool-context.json` contains the draft. Use `help` once beside the shared scroller. Keep `showCarries` visible for Add; disable it without a fresh addition result and show `calculateForCarries` beside it. Its initial state is unchecked. Use `carryOut` for the separate column heading, with `carryOutLabel` as its accessible description. `carryOutValue` describes the actual carry digit. `{top}` is the selected width minus one. `{intoSign}`, `{out}` and `{overflow}` must come from the current result's addition-carry model; the last placeholder uses Yes or No from its `v` value. No expected calculation answers are stored in this copy.

Keep the two mechanism strings together below the enabled carry display, after the model-derived summary. The digits zero and one remain model output. The general totals in `carryMechanism` explain binary addition rather than supplying an example's answer. Four-bit gaps need no separate prose because the position indices already identify every column.

Reviewed only in source in this drafting pass. Browser checks, independent learner/technical reviews and fresh boundary applications belong to the parent integration pass. These checks are not evidence from a novice study. No arithmetic or calculation state changes were made.
