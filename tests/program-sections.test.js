// Copyright © 2026 Christopher Snow
import test from "node:test";
import assert from "node:assert/strict";
import { makeProgram } from "../site/course/model.js";

test("folded program sections retain every source byte, including user labels and data", () => {
  const source =
    "# _lab_lesson_begin: is only text here\nli t0, 7\nj finished\nhelper:\n ret\n.data\nmy_bytes: .byte 7, 5\n.text\nfinished:\n";
  const program = makeProgram(source, { inputs: { t1: "5" }, data: [1, 255] });
  assert.equal(
    program.sections.map((part) => part.source).join(""),
    program.source,
  );
  assert.equal(
    program.sections.find((part) => part.id === "user").source,
    source,
  );
  assert.equal(
    program.sections.find((part) => part.id === "user").folded,
    undefined,
  );
  assert.match(
    program.sections.find((part) => part.id === "entry").source,
    /_start:/,
  );
  assert.match(
    program.sections.find((part) => part.id === "setup").source,
    /li t1, 0x0000000000000005/,
  );
  assert.match(
    program.sections.find((part) => part.id === "data").source,
    /lesson_data: .byte 1,255,0/,
  );
  assert.equal(
    program.source.split("\n")[program.lineOffset],
    source.split("\n")[0],
  );
  assert.match(
    program.sections.find((part) => part.id === "report").source,
    /li a7, 2\n    ecall/,
  );
});

test("C projection shows the supplied caller separately from actual C source", () => {
  const c = "long lesson(long a,long b) { return a + b; }\n";
  const program = makeProgram(c, { language: "c" });
  assert.equal(
    program.sections.map((part) => part.source).join(""),
    program.source,
  );
  assert.equal(
    program.sections.find((part) => part.id === "caller").source,
    "    call lesson\n",
  );
  assert.ok(!program.source.includes(c));
});

test("complete assembly programs have one unfolded exact source section", () => {
  const source =
    '.text\n.global _start\n_start:\n li a7,2\n ecall\n.data\nmessage:.ascii "Hello"';
  const program = makeProgram(source, { kind: "program" });
  assert.equal(program.sections.length, 1);
  assert.equal(program.sections[0].source, source);
  assert.equal(program.sections[0].folded, undefined);
  assert.equal(program.source, source);
  assert.equal(program.lineOffset, 0);
});
