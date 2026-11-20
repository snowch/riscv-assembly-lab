// Copyright © 2026 Christopher Snow
// A mathematical teaching miniature, independent of the executed RV64 program.
export const COUNTER_WIDTH = 4;
export const COUNTER_START = 14n;
export const COUNTER_RANGE = 1n << BigInt(COUNTER_WIDTH);
export const MAXIMUM_TICKS = 3;

export function addCounterTick(value) {
  if (typeof value !== "bigint")
    throw new TypeError("Counter value must be a bigint");
  if (value < 0n || value >= COUNTER_RANGE)
    throw new RangeError("Counter value must fit four bits");
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
    trace: Array.from(
      { length: ticks + 1 },
      (_, index) => (COUNTER_START + BigInt(index)) % COUNTER_RANGE,
    ),
    addition: ticks
      ? addCounterTick((COUNTER_START + BigInt(ticks - 1)) % COUNTER_RANGE)
      : null,
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

// Separate free exploration from the fixed worked elapsed-time example.
export const COUNTER_EXPLORER_START = 13;
export const COUNTER_HISTORY_LENGTH = 5;

export function initialCounterExplorer() {
  return { readings: [COUNTER_EXPLORER_START] };
}

export function isCounterExplorerState(state) {
  if (!state || !Array.isArray(state.readings)) return false;
  const readings = state.readings;
  if (readings.length < 1 || readings.length > COUNTER_HISTORY_LENGTH)
    return false;
  if (
    Array.from(readings).some(
      (value) =>
        !Number.isInteger(value) || value < 0 || value >= Number(COUNTER_RANGE),
    )
  )
    return false;
  return readings.every((value, index) => {
    if (!index) return true;
    const distance =
      (value - readings[index - 1] + Number(COUNTER_RANGE)) %
      Number(COUNTER_RANGE);
    return distance === 1 || distance === Number(COUNTER_RANGE) - 1;
  });
}

export function counterOperation(value, direction) {
  if (typeof value !== "bigint")
    throw new TypeError("Counter value must be a bigint");
  if (value < 0n || value >= COUNTER_RANGE)
    throw new RangeError("Counter value must fit four bits");
  if (direction !== 1 && direction !== -1)
    throw new RangeError("Counter direction must be +1 or -1");
  const fullResult = value + BigInt(direction);
  const stored = BigInt.asUintN(COUNTER_WIDTH, fullResult);
  const marker =
    direction === 1 ? fullResult / COUNTER_RANGE : fullResult < 0n ? 1n : 0n;
  return {
    before: value,
    direction,
    fullResult,
    stored,
    pattern: stored.toString(2).padStart(COUNTER_WIDTH, "0"),
    marker,
    wrapped: marker === 1n,
  };
}

export function counterExplorerState(state) {
  if (!isCounterExplorerState(state))
    throw new TypeError("Invalid counter explorer state");
  const trace = [...state.readings];
  const stored = BigInt(trace.at(-1));
  let operation = null;
  if (trace.length > 1) {
    const before = trace.at(-2);
    const direction =
      (Number(stored) - before + Number(COUNTER_RANGE)) %
        Number(COUNTER_RANGE) ===
      1
        ? 1
        : -1;
    operation = counterOperation(BigInt(before), direction);
  }
  return {
    width: COUNTER_WIDTH,
    realWidth: 64,
    range: COUNTER_RANGE,
    start: COUNTER_EXPLORER_START,
    stored,
    pattern: stored.toString(2).padStart(COUNTER_WIDTH, "0"),
    trace,
    operation,
  };
}

export function stepCounterExplorer(state, direction) {
  const current = counterExplorerState(state);
  const next = counterOperation(current.stored, direction);
  return {
    readings: [...current.trace, Number(next.stored)].slice(
      -COUNTER_HISTORY_LENGTH,
    ),
  };
}

export function restoreCounterExplorer(serialised, legacySerialised = null) {
  if (serialised !== null) {
    try {
      const state = JSON.parse(serialised);
      if (isCounterExplorerState(state))
        return { readings: [...state.readings] };
    } catch {
      /* Corrupt storage only resets this miniature. */
    }
    return initialCounterExplorer();
  }
  if (legacySerialised !== null) {
    try {
      const ticks = JSON.parse(legacySerialised);
      const legacy = counterWrapState(ticks);
      return { readings: legacy.trace.map(Number) };
    } catch {
      /* Invalid legacy progress does not affect learner work. */
    }
  }
  return initialCounterExplorer();
}
