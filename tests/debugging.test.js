// Copyright © 2026 Christopher Snow
import test from "node:test";
import assert from "node:assert/strict";
import { build, execute } from "../tools/course-runner.js";
import {
  resolveBreakpoints,
  inspectionState,
} from "../site/course/debugging.js";

test("line breakpoints resolve exact emitted instructions and repeated loop hits advance on the CPU", async () => {
  const source = "li t0,0\nli t1,3\nloop:\naddi t0,t0,1\nbltu t0,t1,loop";
  const built = await build(source, {});
  const points = resolveBreakpoints(built, {
    lines: [3, 4],
    addresses: ["0x1", "bogus"],
  });
  assert.equal(
    points.length,
    1,
    "label lines must not silently move to another source line",
  );
  const { vm } = execute(built.elf, { debugEntry: built.entry });
  try {
    assert.ok(vm.run_until_breakpoints(new BigUint64Array(points), 100000));
    assert.equal(
      vm.read_register(5),
      0n,
      "breakpoint is before its instruction",
    );
    for (let n = 1; n < 3; n++) {
      assert.ok(vm.run_until_breakpoints(new BigUint64Array(points), 100000));
      assert.equal(vm.read_register(5), BigInt(n));
    }
    assert.ok(
      vm.run_until_breakpoints(new BigUint64Array([BigInt(built.end)]), 100000),
    );
    assert.equal(vm.read_register(5), 3n);
  } finally {
    vm.free();
  }
});

test("memory watches and stack slots read actual bytes and mark inaccessible addresses", async () => {
  const source =
    "la ra,return_here\nla t0,lesson_data\nli t1,0x1234\nsd t1,8(t0)\naddi sp,sp,-16\nsd ra,8(sp)\nreturn_here:";
  const built = await build(source, { data: [255, 128, 127] });
  const { vm } = execute(built.elf, { debugEntry: built.entry });
  try {
    assert.ok(
      vm.run_until_breakpoints(new BigUint64Array([BigInt(built.end)]), 100000),
    );
    const pc = vm.read_pc(),
      before = Array.from({ length: 32 }, (_, i) => vm.read_register(i));
    const state = inspectionState(vm, built, [
      { id: "data", base: "lesson_data", offset: 8, width: 2 },
      { id: "bad", base: "zero", offset: -8, width: 1 },
      { id: "cross", base: "lesson_data", offset: 63, width: 2 },
    ]);
    assert.deepEqual(state.watches[0].bytes, [0x34, 0x12]);
    assert.deepEqual(state.watches[1].bytes, [null]);
    assert.deepEqual(state.watches[2].bytes, [0, null]);
    assert.equal(BigInt(state.stack.address), vm.read_register(2));
    const saved = state.stack.bytes
      .slice(8, 16)
      .reduceRight((n, b) => n * 256n + BigInt(b), 0n);
    assert.equal(saved, vm.read_register(1));
    assert.equal(vm.read_pc(), pc);
    assert.deepEqual(
      Array.from({ length: 32 }, (_, i) => vm.read_register(i)),
      before,
      "observing must not execute instructions or alter integer registers",
    );
  } finally {
    vm.free();
  }
});

test("adjacent breakpoints and the final checkpoint never skip an instruction boundary", async () => {
  const built = await build("li t0,7\nli t1,5\nadd t2,t0,t1", {});
  const targets = new BigUint64Array([
    ...resolveBreakpoints(built, { lines: [1, 2, 3] }),
    BigInt(built.end),
  ]);
  const { vm } = execute(built.elf, { debugEntry: built.entry });
  try {
    assert.ok(vm.run_until_breakpoints(targets, 100000));
    assert.equal(vm.read_register(5), 7n);
    assert.equal(vm.read_register(6), 0n);
    assert.ok(vm.run_until_breakpoints(targets, 100000));
    assert.equal(vm.read_register(6), 5n);
    assert.equal(vm.read_register(7), 0n);
    assert.ok(vm.run_until_breakpoints(targets, 100000));
    assert.equal(vm.read_pc(), BigInt(built.end));
    assert.equal(vm.read_register(7), 12n);
  } finally {
    vm.free();
  }
});
