// Copyright © 2026 Christopher Snow
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { loadLessons } from "../tools/course-data.js";
import { build, bootBareMetal, execute } from "../tools/course-runner.js";
import {
  makeProgram,
  readState,
  diagnosticLocation,
} from "../site/course/model.js";
import {
  fromLesson,
  importProject,
  newProject,
  projectContext,
  serialiseProject,
} from "../site/playground/projects.js";

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

test("a saved bare-metal project boots edited source directly and prints its total", async () => {
  const lesson = (await loadLessons()).find(
    ({ id }) => id === "boot-trip-computer",
  );
  const source = lesson.starter.replace(".word 12, 7, 23", ".word 19, 80, 1, 4");
  const saved = importProject(serialiseProject(fromLesson(lesson, source)));
  const built = await build(saved.source, projectContext(saved));
  assert.equal(saved.target, "bare-metal");
  assert.equal(built.entry, 0x80000000);
  assert.ok(built.park > built.entry);
  assert.equal(built.program, source);
  assert.equal(bootBareMetal(built), "Trip total: 104 km\n");

  await assert.rejects(
    build(source.replaceAll("park", "idle"), lesson),
    /Define park/,
  );
});
