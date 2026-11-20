// Copyright © 2026 Christopher Snow
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  addCounterTick,
  counterWrapState,
  restoreCounterTicks,
  counterOperation,
  initialCounterExplorer,
  counterExplorerState,
  stepCounterExplorer,
  restoreCounterExplorer,
  isCounterExplorerState,
} from "../site/course/counter-wrap-model.js";
import {
  counterWrapText,
  counterWrapMarkup,
} from "../site/course/counter-wrap.js";
import { loadLessons } from "../tools/course-data.js";
import { build, execute } from "../tools/course-runner.js";
import { readState } from "../site/course/model.js";

test("each four-bit increment retains exactly the low bits and accounts for the extra bit", () => {
  for (let value = 0n; value < 16n; value++) {
    const next = addCounterTick(value);
    assert.equal(next.stored, BigInt.asUintN(4, value + 1n));
    assert.equal(next.carryOut, value === 15n ? 1n : 0n);
    assert.equal(next.fullSum, next.carryOut * 16n + next.stored);
    assert.equal(BigInt("0b" + next.fullPattern), value + 1n);
    assert.equal(BigInt("0b" + next.pattern), next.stored);
    assert.equal(next.pattern.length, 4);
    assert.equal(next.fullPattern.length, 5);
  }
});

test("the three real increments cross the boundary and their elapsed difference recovers the count", () => {
  const states = [0, 1, 2, 3].map(counterWrapState);
  assert.deepEqual(
    states.map((state) => state.stored),
    [14n, 15n, 0n, 1n],
  );
  assert.deepEqual(
    states.map((state) => state.pattern),
    ["1110", "1111", "0000", "0001"],
  );
  assert.equal(states[0].addition, null);
  assert.equal(states[2].addition.fullSum, 16n);
  assert.equal(states[2].addition.carryOut, 1n);
  assert.equal(states[3].addition.before, 0n);
  assert.equal(states[3].addition.carryOut, 0n);
  assert.deepEqual(states[3].trace, [14n, 15n, 0n, 1n]);
  for (const state of states) assert.equal(state.elapsed, BigInt(state.ticks));
});

test("the elapsed interpretation cannot distinguish additional complete turns", () => {
  const end = counterWrapState(3);
  assert.equal((end.start + 3n) % end.range, end.stored);
  assert.equal((end.start + 19n) % end.range, end.stored);
  assert.equal(end.elapsed, 3n);
});

test("invalid model and stored input cannot become a counter state", () => {
  for (const ticks of [-1, 4, 1.1, NaN, Infinity, "2", null, {}, 2n])
    assert.throws(() => counterWrapState(ticks));
  for (const value of [-1n, 16n, 14, "14", null])
    assert.throws(() => addCounterTick(value));
  for (const value of [
    null,
    "null",
    "4",
    "-1",
    "1.5",
    '"2"',
    "{}",
    "[]",
    "not JSON",
  ])
    assert.equal(restoreCounterTicks(value), 0);
  for (const ticks of [0, 1, 2, 3])
    assert.equal(restoreCounterTicks(JSON.stringify(ticks)), ticks);
});

test("canonical copy substitutes every number and is safe to embed", async () => {
  const copy = JSON.parse(
    await readFile(
      new URL("../content/guides/counter-wrap.json", import.meta.url),
      "utf8",
    ),
  );
  const state = counterExplorerState(initialCounterExplorer());
  const values = {
    ...state,
    direction: "+1",
    marker: 0,
    markerLabel: copy.carryLabel,
  };
  for (const text of Object.values(copy))
    assert.doesNotMatch(counterWrapText(text, values), /\{\w+\}/);
  assert.throws(
    () => counterWrapText("{unknown}", state),
    /Missing counter value/,
  );
  const markup = counterWrapMarkup({
    ...copy,
    title: "<unsafe>",
    instruction: "</script>",
  });
  assert.match(markup, /&lt;unsafe&gt;/);
  assert.match(markup, /\\u003c\/script>/);
  assert.doesNotMatch(markup, /<unsafe>/);
});

test("both actual directions retain four bits and distinguish carry from borrow", () => {
  for (let value = 0n; value < 16n; value++)
    for (const direction of [1, -1]) {
      const result = counterOperation(value, direction);
      assert.equal(result.stored, (value + 16n + BigInt(direction)) % 16n);
      assert.equal(result.pattern, result.stored.toString(2).padStart(4, "0"));
      assert.equal(
        result.marker,
        direction === 1 ? (value === 15n ? 1n : 0n) : value === 0n ? 1n : 0n,
      );
      assert.equal(result.wrapped, result.marker === 1n);
      assert.equal(result.fullResult, value + BigInt(direction));
    }
  assert.throws(() => counterOperation(16n, 1));
  assert.throws(() => counterOperation(0n, 0));
  assert.throws(() => counterOperation(13, 1));
});

test("the explorer cycles indefinitely in either direction and its history is bounded", () => {
  let state = initialCounterExplorer();
  assert.deepEqual(state, { readings: [0] });
  assert.equal(counterExplorerState(state).operation, null);
  for (const direction of [1, 1, -1, -1]) {
    for (let step = 0; step < 16; step++) {
      state = stepCounterExplorer(state, direction);
      assert.ok(isCounterExplorerState(state));
      assert.ok(state.readings.length <= 5);
      assert.equal(counterExplorerState(state).operation.direction, direction);
    }
    assert.equal(counterExplorerState(state).stored, 0n);
  }
  state = stepCounterExplorer({ readings: [0] }, -1);
  assert.equal(counterExplorerState(state).stored, 15n);
  assert.equal(counterExplorerState(state).operation.marker, 1n);
  state = stepCounterExplorer(state, 1);
  assert.equal(counterExplorerState(state).stored, 0n);
  assert.equal(counterExplorerState(state).operation.marker, 1n);
});

test("restoration preserves legacy values and reconstructs only valid recent operations", () => {
  for (let ticks = 0; ticks <= 3; ticks++) {
    const legacy = counterWrapState(ticks);
    const migrated = restoreCounterExplorer(null, JSON.stringify(ticks));
    assert.equal(counterExplorerState(migrated).stored, legacy.stored);
    assert.deepEqual(migrated.readings, legacy.trace.map(Number));
  }
  const state = { readings: [14, 15, 0, 15, 14] };
  assert.deepEqual(restoreCounterExplorer(JSON.stringify(state), "2"), state);
  const view = counterExplorerState(state);
  assert.equal(view.operation.direction, -1);
  assert.equal(view.operation.marker, 0n);
  for (const bad of [
    null,
    {},
    { readings: [] },
    { readings: [0, 2] },
    { readings: [-1] },
    { readings: [16] },
    { readings: [NaN] },
    { readings: [1, 2, 3, 4, 5, 6] },
  ]) {
    assert.equal(isCounterExplorerState(bad), false);
    assert.throws(() => counterExplorerState(bad));
    assert.deepEqual(
      restoreCounterExplorer(JSON.stringify(bad), "2"),
      initialCounterExplorer(),
    );
  }
  for (const bad of ["broken", "null", "99", '"1"'])
    assert.deepEqual(
      restoreCounterExplorer(null, bad),
      initialCounterExplorer(),
    );
  assert.deepEqual(
    restoreCounterExplorer(null, null),
    initialCounterExplorer(),
  );
});

test("native examples and the stated editable experiments remain real RV64 arithmetic", async () => {
  const lessons = await loadLessons();
  const scenarios = [
    ["addition-wraps", null, 3n],
    [
      "addition-wraps",
      "li t0, 0xffffffffffffffff\nli t1, 0\nadd t2, t0, t1",
      (1n << 64n) - 1n,
    ],
    [
      "addition-wraps",
      "li t0, 0xffffffffffffffff\nli t1, 1\nadd t2, t0, t1",
      0n,
    ],
    [
      "addition-wraps",
      "li t0, 0xffffffffffffffff\nli t1, 2\nadd t2, t0, t1",
      1n,
    ],
    ["elapsed-time", null, 16n],
    ["elapsed-time", "li t1, 40\nli t0, 53\nsub t2, t0, t1", 13n],
    ["elapsed-time", "li t1, 40\nli t0, 40\nsub t2, t0, t1", 0n],
  ];
  for (const [id, source, expected] of scenarios) {
    const lesson = lessons.find((lesson) => lesson.id === id);
    const program = await build(source ?? lesson.starter, lesson);
    const state = readState(execute(program.elf).output);
    assert.equal(
      BigInt(state.registers.t2),
      expected,
      id + ": " + (source ?? "starter"),
    );
  }
});

test("actual GNU/xv6 instructions agree with all 32 counter operations", async () => {
  const { checkCounterWrap } = await import("../tools/check-counter-wrap.js");
  const result = await checkCounterWrap({ native: false });
  assert.equal(result.xv6Checked, 32);
  assert.deepEqual(result.failures, []);
});
