// Copyright © 2026 Christopher Snow
// A mathematical teaching miniature, independent of the executed RV64 program.
export const COUNTER_WIDTH = 4;
export const COUNTER_START = 14n;
export const COUNTER_RANGE = 1n << BigInt(COUNTER_WIDTH);
export const MAXIMUM_TICKS = 3;

export function addCounterTick(value) {
  if (typeof value !== "bigint") throw new TypeError("Counter value must be a bigint");
  if (value < 0n || value >= COUNTER_RANGE) throw new RangeError("Counter value must fit four bits");
  const fullSum = value + 1n;
  const stored = fullSum % COUNTER_RANGE;
  return {
    before: value,
    fullSum,
    fullPattern: fullSum.toString(2).padStart(COUNTER_WIDTH + 1, "0"),
    carryOut: fullSum / COUNTER_RANGE,
    stored,
    pattern: stored.toString(2).padStart(COUNTER_WIDTH, "0"),
  };
}

export function counterWrapState(ticks) {
  if (!Number.isInteger(ticks) || ticks < 0 || ticks > MAXIMUM_TICKS)
    throw new RangeError("Tick count must be an integer from zero to three");
  const stored = (COUNTER_START + BigInt(ticks)) % COUNTER_RANGE;
  return {
    width: COUNTER_WIDTH,
    realWidth: 64,
    start: COUNTER_START,
    range: COUNTER_RANGE,
    maximumTicks: MAXIMUM_TICKS,
    ticks,
    stored,
    pattern: stored.toString(2).padStart(COUNTER_WIDTH, "0"),
    elapsed: (stored - COUNTER_START + COUNTER_RANGE) % COUNTER_RANGE,
    trace: Array.from({length: ticks + 1}, (_, index) => (COUNTER_START + BigInt(index)) % COUNTER_RANGE),
    addition: ticks ? addCounterTick((COUNTER_START + BigInt(ticks - 1)) % COUNTER_RANGE) : null,
  };
}

export function restoreCounterTicks(serialised) {
  try {
    const ticks = JSON.parse(serialised);
    counterWrapState(ticks);
    return ticks;
  } catch {
    return 0;
  }
}
