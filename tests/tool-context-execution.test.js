// Copyright © 2026 Christopher Snow
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { build, execute } from "../tools/course-runner.js";
import {
  newProject,
  projectContext,
  normaliseProject,
} from "../site/playground/projects.js";
import { readState } from "../site/course/model.js";

test("complete-program bridge owns real data, a helper result and exit", async () => {
  const worked = await readFile(
    new URL("../site/playground/complete-counts.s", import.meta.url),
    "utf8",
  );
  for (const [source, expected] of [
    [worked, 42n],
    [
      worked
        .replace(".quad 19, 23", ".quad 31, 17")
        .replace("add a0, a0, a1", "sub a0, a0, a1"),
      14n,
    ],
  ]) {
    const context = projectContext({
      ...newProject("program"),
      source,
      result: "s0",
    });
    const built = await build(source, context);
    assert.equal(built.program, source);
    assert.ok(!built.program.includes("RVLAB_STATE"));
    const exitLine =
      source.split("\n").findIndex((line) => line.trim() === "ecall") + 1;
    const exit = built.disassembly.find((row) => row.sourceLine === exitLine);
    assert.ok(exit, "real assembler mapping locates exit ecall");
    const observation = execute(built.elf, { debugEntry: exit.address });
    try {
      assert.equal(observation.paused, true);
      assert.equal(observation.vm.read_register(8), expected);
      assert.equal(observation.vm.read_register(10), 0n);
      assert.equal(observation.vm.read_register(17), 2n);
      assert.equal(observation.vm.read_register(2) % 16n, 0n);
    } finally {
      observation.vm.free();
    }
  }
});

test("full listings retain actual assembly mappings without assigning wrapper lines to compiled C", async () => {
  const asm = newProject(),
    built = await build(asm.source, projectContext(asm));
  const first = built.disassembly[0];
  assert.equal(first.sourceLine, built.lineOffset + 1);
  const full = built.allInstructions.find(
    (row) => row.address === first.address,
  );
  assert.equal(full.sourceLine, first.sourceLine);
  assert.match(full.sourceFile, /program\.s$/);
  assert.ok(
    built.allInstructions.some(
      (row) => row.sourceLine > 0 && row.sourceLine <= built.lineOffset,
    ),
  );
  const source =
    "long helper(long a){return a+3;}\nlong lesson(long a,long b){return helper(a)+b;}\n";
  const context = projectContext({ ...newProject("c"), source });
  const c = await build(source, context),
    helper = c.symbols.find((symbol) => symbol.name === "helper");
  assert.ok(helper?.size > 0);
  const rows = c.allInstructions.filter(
    (row) =>
      row.address >= helper.address &&
      row.address < helper.address + helper.size,
  );
  assert.ok(rows.length > 0);
  assert.ok(
    rows.every((row) => row.sourceLine === null && row.sourceFile === null),
  );
  assert.ok(
    c.allInstructions.some((row) => row.sourceFile?.endsWith("program.s")),
  );
  assert.equal(
    readState(execute(c.elf).output).registers.a0,
    "0x000000000000000f",
  );
});

test("example pins are explicit, canonical and optional in older project files", () => {
  const project = newProject();
  assert.deepEqual(project.pins, ["t0", "t1", "t2"]);
  assert.deepEqual(
    normaliseProject({ ...project, pins: ["x5", "t0", "s0"] }).pins,
    ["t0", "s0"],
  );
  const { pins, ...old } = project;
  assert.equal(normaliseProject(old).pins, undefined);
  for (const pins of [["nope"], ["__proto__"], [5], "t0", Array(33).fill("a0")])
    assert.throws(
      () => normaliseProject({ ...project, pins }),
      /Pinned registers/,
    );
});
