// Copyright © 2026 Christopher Snow
import test from "node:test";
import assert from "node:assert/strict";
import { build, execute } from "../tools/course-runner.js";
import {
  readState,
  learnerOutput,
  checkState,
  makeProgram,
  diagnosticLocation,
} from "../site/course/model.js";
import { loadLessons } from "../tools/course-data.js";
const lessons = await loadLessons();
test("complete catalogue has stable unique routes, exercises and provenance", () => {
  assert.equal(lessons.length, 60);
  assert.equal(new Set(lessons.map((l) => l.id)).size, 60);
  for (const lesson of lessons) {
    assert.ok(lesson.originalityNote);
    assert.ok(lesson.sourceLessons.length);
    if (lesson.kind === "program") assert.ok(lesson.independentTask.length);
    else assert.ok(lesson.challenge.cases.length >= 3);
    assert.ok(lesson.observe.includes(lesson.result));
  }
});
test("general snapshot captures registers, word wrap, memory and stack preservation", async () => {
  for (const [source, expect] of [
    ["li t0,7\nli t1,5\nadd t2,t0,t1", { t0: "7", t1: "5", t2: "12" }],
    ["li t0,7\nli t1,5\nsub t2,t0,t1", { t0: "7", t1: "5", t2: "2" }],
    ["li t0,-1\nli t1,1\nadd t2,t0,t1", { t0: "-1", t1: "1", t2: "0" }],
    ["li t0,0x7fffffff\nli t1,1\naddw t3,t0,t1", { t3: "0xffffffff80000000" }],
    ["la t0,lesson_data\nli t1,42\nsb t1,0(t0)\nlbu t2,0(t0)", { t2: "42" }],
  ]) {
    const program = await build(source, {});
    const state = readState(execute(program.elf).output);
    assert.ok(
      checkState(state, { expect, expectEqual: { sp: "initial:sp" } }).pass,
    );
    if (source.includes("sb ")) assert.equal(state.memory.bytes[0], 42);
  }
});
test("real C compilation, aggregate initialisers and disassembly are executable", async () => {
  const program = await build(
    "long lesson(long a,long b){long values[3]={a,b,2};return values[0]+values[1]+values[2];}",
    { language: "c" },
    { inputs: { a0: "19", a1: "23" } },
  );
  assert.ok(program.disassembly.length > 0);
  assert.ok(
    program.disassembly.every((i) => i.sourceLine === null),
    "do not invent compiler line mappings",
  );
  const state = readState(execute(program.elf).output);
  assert.equal(BigInt(state.registers.a0), 44n);
});
test("breakpoint and stepping read actual CPU state before and after each instruction", async () => {
  const program = await build("li t0,7\nli t1,5\nadd t2,t0,t1", {});
  const paused = execute(program.elf, { debugEntry: program.entry });
  const vm = paused.vm;
  try {
    assert.equal(vm.read_pc(), BigInt(program.entry));
    assert.equal(vm.read_register(5), 0n);
    vm.run_cycles(1);
    assert.equal(vm.read_register(5), 7n);
    vm.run_cycles(1);
    assert.equal(vm.read_register(6), 5n);
    vm.run_cycles(1);
    assert.equal(vm.read_register(7), 12n);
    assert.equal(vm.read_pc(), BigInt(program.end));
  } finally {
    vm.free();
  }
});
test("guard checks reject read-before-check and writes while allowing the reference", async () => {
  const good =
    "li t0,64\nli t1,64\nli t2,-1\nbgeu t0,t1,done\nla t3,lesson_data\nadd t3,t3,t0\nlbu t2,0(t3)\ndone:";
  const state = readState(execute((await build(good, {})).elf).output);
  assert.equal(state.registers.t2, "0xffffffffffffffff");
  for (const [instruction, cause] of [
    ["lbu t2,64(t3)", "000000000000000d"],
    ["sb zero,64(t3)", "000000000000000f"],
  ]) {
    const result = execute(
      (await build("la t3,lesson_data\n" + instruction, {})).elf,
    );
    assert.equal(readState(result.output), null);
    assert.ok(result.output.includes("usertrap()"));
    assert.ok(result.output.includes(cause));
  }
});
test("fragment diagnostics map correctly and partial or duplicate reports have no observation", () => {
  const fragment = "li t0,1\nwrong_operation t2,t0,t0",
    program = makeProgram(fragment);
  const location = diagnosticLocation(
    `program.s:${program.lineOffset + 2}: Error: unrecognized opcode`,
    fragment,
  );
  assert.equal(location.line, 2);
  assert.match(location.label, /^lesson.s:2:/);
  assert.equal(readState("RVLAB_STATE_V2\n0000000000000000\n"), null);
});

test("owned state-report filtering keeps learner output and incomplete reports", async () => {
  const result = execute((await build("li t0,7", {})).elf).output;
  assert.ok(readState(result));
  const frame = result.match(
    /\nRVLAB_STATE_V2\n(?:[0-9a-f]{16}\n){42}RVLAB_END\n/,
  )[0];
  assert.equal(learnerOutput("hello" + frame), "hello");
  assert.equal(
    learnerOutput("hello\nRVLAB_STATE_V2\npartial"),
    "hello\nRVLAB_STATE_V2\npartial",
  );
  assert.equal(learnerOutput("hello\nRVLAB_STATE_V2\npartial", true), "hello");
});
