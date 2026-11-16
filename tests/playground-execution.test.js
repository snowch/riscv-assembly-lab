// Copyright © 2026 Christopher Snow
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { build, execute } from "../tools/course-runner.js";
import {
  makeProgram,
  readState,
  diagnosticLocation,
} from "../site/course/model.js";
import { newProject, projectContext } from "../site/playground/projects.js";

test("complete assembly projects execute their own entry and exit without instrumentation", async () => {
  const source = await readFile(
    new URL("../site/hello.s", import.meta.url),
    "utf8",
  );
  const context = projectContext({ ...newProject("program"), source });
  assert.equal(makeProgram(source, context).source, source);
  const built = await build(source, context);
  assert.equal(built.program, source);
  assert.equal(built.lineOffset, 0);
  assert.equal(built.end, 0);
  assert.ok(built.entry >= 0x10000);
  assert.ok(built.disassembly.length);
  assert.ok(built.disassembly.some((i) => i.address === built.entry));
  const output = execute(built.elf).output;
  assert.match(output, /Hello, RISC-V!/);
  assert.equal(readState(output), null);
  const location = diagnosticLocation(
    "program.s:3: Error: wrong instruction",
    source,
    context,
  );
  assert.equal(location.line, 3);
  assert.match(location.label, /main.s:3/);
});

test("full-program debugger pauses at the real entry before executing user instructions", async () => {
  const context = projectContext(newProject("program"));
  const built = await build(context.starter, context),
    paused = execute(built.elf, { debugEntry: built.entry });
  try {
    assert.equal(paused.paused, true);
    assert.equal(paused.vm.read_pc(), BigInt(built.entry));
    assert.equal(paused.vm.read_register(0), 0n);
    // xv6 does not promise initial temporary-register values for raw programs.
    paused.vm.run_cycles(1);
    assert.equal(paused.vm.read_register(5), 7n);
    assert.notEqual(paused.vm.read_pc(), BigInt(built.entry));
  } finally {
    paused.vm.free();
  }
});
