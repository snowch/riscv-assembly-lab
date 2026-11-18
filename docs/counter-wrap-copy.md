# Counter wrap copy draft

Copyright © 2026 Christopher Snow

Separate drafting pass from the parent's checked-fact brief. Learner copy lives in
`content/guides/counter-wrap.json`. It shares its key names with Assembly Lab's
`COUNTER_WRAP_STRINGS`; the architecture note is specific to RISC-V.

## Purpose and scope

Show why an unsigned counter wraps when it stores only a fixed number of low bits.
Connect that mechanism to elapsed ticks across a wrap. The miniature has four bits;
the lesson runs real code with 64-bit RISC-V registers. Learners can read simple C
and small binary numbers; no knowledge of logic gates is needed.

Use in `elapsed-time` and `addition-wraps`, after the native workbench alongside
the existing explanation. The earlier prediction refers to the native program,
not the miniature; no native answer is supplied by the miniature. An addition
placement should omit the elapsed interval section, keeping the model focused on
the mechanism the lesson needs.

## Rendering contract

Keep the heading, miniature qualification and action visible. Prepare the initial
reading automatically; `Advance one tick` increments this miniature, while `Reset`
restores only this miniature. Do not change the lesson editor or saved learner work.
Stop after the bounded tick count. At the start, show `initialNote` and omit any
completed addition or carry value.

After each tick, label the previous increment `Last tick's addition`. Separate its full
sum and carry from the counter's currently stored bits. `carryExplanation` defines
the extra bit. Show `wrapExplanation` only for an addition with a carry out, using
that addition's values.

At the last tick in the elapsed-time placement, show `elapsedTitle`,
`elapsedExplanation`, `elapsedAssumption`, `turnLimit` and `limitNote`. Use the
original reading and current reading for elapsed subtraction, not the previous and
current readings of the final tick.

Use `initialStatus` and `stepStatus` for status announcements; do not repeat the
same information as another visible paragraph beside the labelled values.

## Template values

All numeric and binary substitutions come from the model, including values inside
the following strings. The drafting record does not supply a prediction answer.

| Key | Placeholders |
| --- | --- |
| `fullSumValue` | `{fullSum}`, `{fullPattern}` |
| `retainedValue` | `{pattern}`, `{stored}` |
| `modelNote` | `{width}`, `{realWidth}` |
| `initialStatus` | `{stored}` |
| `stepStatus` | `{ticks}`, `{stored}`, `{fullSum}`, `{carryOut}` |
| `limitNote` | `{maximumTicks}` |
| `wrapExplanation` | `{fullSum}`, `{fullPattern}`, `{pattern}`, `{stored}` |
| `elapsedExplanation` | `{start}`, `{stored}`, `{width}`, `{elapsed}` |
| `elapsedAssumption` | `{range}` |

All other keys are literal strings. Keep `architectureNote` visible: the arithmetic
carry shown in the four-bit miniature is not an architectural RISC-V flag. RV64
arithmetic keeps low register-width bits and has no NZCV flags. Do not introduce
an Arm-style C or V badge in this model.

## Accuracy and review boundaries

Unsigned wrap is distinct from signed overflow. A full sum and its retained low
bits are different readings of the calculation, not evidence that a reset
instruction executed. The elapsed interpretation requires a counter advancing
normally, with fewer than one full turn between readings. The readings cannot
reveal additional complete turns.

The user explicitly requested this change in both courses; that authorisation
supersedes the older authoring brief's restriction against changing Assembly Lab.

This draft addresses wording and display order. Independent technical and learner
reviews, model checks and browser verification belong to the integration pass.
Passing those checks does not establish measured learning effectiveness.

## Canonical wording

Placeholder values come from the model. These sentences are the draft reviewed by the integration pass.

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

### `counterLabel`

Stored counter bits

### `startingLabel`

Earlier reading

### `ticksLabel`

Ticks since the earlier reading

### `additionLabel`

Last tick's addition

### `fullSumLabel`

Full sum

### `carryLabel`

Carry out

### `retainedLabel`

Bits stored

### `initialNote`

No tick has advanced yet. There is no completed addition to show.

### `initialStatus`

Starting reading: {stored}. No ticks have passed.

### `stepStatus`

Ticks passed: {ticks}. Stored reading: {stored}. Last tick's full sum: {fullSum}. Carry out: {carryOut}.

### `limitNote`

This example ends after {maximumTicks} ticks. Choose Reset to try it again.

### `carryExplanation`

Carry out is the bit beyond the counter's width. It is separate from the bits stored in the counter.

### `wrapExplanation`

The full sum is {fullSum}, or {fullPattern} in binary. The counter stores only the low bits: {pattern}, read as {stored}. This is unsigned wrap.

### `elapsedTitle`

Count the ticks across the wrap

### `elapsedExplanation`

The earlier reading is {start}; the later reading is {stored}. Subtract the earlier reading from the later one and keep the low {width} bits. The result is {elapsed}, matching the ticks you advanced.

### `elapsedAssumption`

This measures elapsed ticks only if the counter advances normally and fewer than {range} ticks pass between readings.

### `turnLimit`

The two readings alone cannot tell you how many complete turns the counter made.

### `architectureNote`

RISC-V has no carry or signed-overflow flag. The carry shown here belongs to the four-bit calculation.

