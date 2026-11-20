// Copyright © 2026 Christopher Snow
// Compare all four-bit +1/-1 results and markers with real GNU/xv6/QEMU code.
import { mkdtemp, writeFile, chmod, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { build, execute } from "./course-runner.js";
import { readState } from "../site/course/model.js";
import { counterOperation } from "../site/course/counter-wrap-model.js";

export const COUNTER_NATIVE_SOURCE = `la t3, lesson_data
li t0, 0
li t4, 16
counter_steps:
    addi t1, t0, 1
    andi t1, t1, 15
    sb t1, 0(t3)
    sltiu t2, t0, 15
    xori t2, t2, 1
    sb t2, 1(t3)
    addi t1, t0, -1
    andi t1, t1, 15
    sb t1, 2(t3)
    sltiu t2, t0, 1
    sb t2, 3(t3)
    addi t3, t3, 4
    addi t0, t0, 1
    bltu t0, t4, counter_steps
`;
export const COUNTER_NATIVE_LESSON = {
  memory: "data",
  observe: ["t0", "t1", "t2"],
  result: "t1",
};
export function counterExpectedBytes() {
  return Array.from({ length: 16 }, (_, before) =>
    [1, -1].flatMap((direction) => {
      const step = counterOperation(BigInt(before), direction);
      return [Number(step.stored), Number(step.marker)];
    }),
  ).flat();
}
export async function checkCounterWrap({ native = true } = {}) {
  const expected = counterExpectedBytes();
  const program = await build(COUNTER_NATIVE_SOURCE, COUNTER_NATIVE_LESSON);
  const observed = readState(execute(program.elf).output);
  assert.ok(observed, "The xv6 program must report state");
  assert.deepEqual(
    observed.memory.bytes,
    expected,
    "xv6 low bits and carry/borrow markers",
  );
  let nativeChecked = 0;
  if (native) {
    const qemu =
      process.env.RISCV_QEMU ??
      (existsSync("/workspace/native-tools/usr/bin/qemu-riscv64")
        ? "/workspace/native-tools/usr/bin/qemu-riscv64"
        : "qemu-riscv64");
    const directory = await mkdtemp(join(tmpdir(), "riscv-counter-"));
    try {
      const linux = await build(
        COUNTER_NATIVE_SOURCE,
        COUNTER_NATIVE_LESSON,
        {},
        "linux",
      );
      const path = join(directory, "counter.elf");
      await writeFile(path, linux.elf);
      await chmod(path, 0o755);
      const result = spawnSync(qemu, [path], {
        encoding: "utf8",
        timeout: 5000,
        maxBuffer: 200000,
      });
      if (result.error) throw result.error;
      assert.equal(result.status, 0, result.stderr);
      const independent = readState(result.stdout);
      assert.ok(independent, "The QEMU process must report state");
      assert.deepEqual(
        independent.memory.bytes,
        expected,
        "Independent QEMU low bits and markers",
      );
      nativeChecked = 32;
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
  return {
    directions: 2,
    values: 16,
    xv6Checked: 32,
    nativeChecked,
    failures: [],
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const report = await checkCounterWrap();
  console.log(JSON.stringify(report));
}
