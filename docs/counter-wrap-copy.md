# Addition wrap: canonical copy

Copyright © 2026 Christopher Snow

This compact four-bit model belongs only to `addition-wraps`, where the learner is investigating the stored bits of addition. The elapsed-time lesson keeps its own native 64-bit subtraction and assumptions; the separate increment activity has been removed from that route after the learning-design review.

Copy was drafted separately for the approved simplification preview, then checked against both arithmetic models. The diagram shows each full addition, separate carry and retained bits. Removed duplicate counter/tick panels and the ambiguous last-tick heading stay removed. All values come from the existing model; the real RV64 program, source drafts, project state and saved model key are unchanged. A fresh model starts before the first tick, not at the preview's prepared wrap state.

The width note is visible. RISC-V has no carry or signed-overflow flag; the carry displayed here belongs to this four-bit calculation. The final bound and Reset cue remain visible. Architecture notes use an explicit separator class so live announcements do not affect styling.

## Canonical strings

### `title`

See a counter wrap

### `modelNote`

This is a {width}-bit teaching model. The lesson uses {realWidth}-bit registers.

### `instruction`

Choose Advance one tick. Each tick adds one. Watch which bits the counter stores.

### `advance`

Advance one tick

### `reset`

Reset

### `carryLabel`

Carry out

### `retainedLabel`

Bits stored

### `initialNote`

Starting reading: {start}. Choose Advance one tick to add one.

### `initialStatus`

Starting reading: {stored}. No ticks have passed.

### `stepStatus`

Ticks passed: {ticks}. Stored reading: {stored}. Full sum: {fullSum}. Carry out: {carryOut}.

### `limitNote`

This example ends after {maximumTicks} ticks. Choose Reset to try it again.

### `carryExplanation`

Carry out is the bit beyond the counter’s width. The counter stores only the low {width} bits.

### `wrapExplanation`

This is unsigned wrap.

### `architectureNote`

RISC-V has no carry or signed-overflow flag. The carry shown here belongs to the four-bit calculation.
