// Copyright © 2026 Christopher Snow
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { transferGuideMarkup } from "../site/course/transfer-guide.js";
import { loadLessons } from "../tools/course-data.js";
import { build, execute } from "../tools/course-runner.js";
import { readState } from "../site/course/model.js";
import { newProject, projectContext } from "../site/playground/projects.js";

const guide = JSON.parse(
  await readFile(
    new URL("../content/guides/moving-to-arm.json", import.meta.url),
    "utf8",
  ),
);
const caller = guide.sections
  .flatMap((section) => section.snippets ?? [])
  .find((snippet) => snippet.source.startsWith("li a0"));

test("the directional reference keeps foreign code read-only and preserves the original workspace", async () => {
  const lesson = (await loadLessons()).find(
    (lesson) => lesson.id === "riscv-and-arm",
  );
  assert.equal(lesson.title, guide.title);
  assert.equal(lesson.result, "t3");
  assert.equal(
    lesson.starter,
    "li t0, -1\nli t1, 1\nadd t2, t0, t1\nsltu t3, t2, t0\n",
  );
  assert.equal(lesson.challenge.cases.length, 3);
  assert.match(lesson.challenge.reference, /bgeu t0, t1/);
  const markup = transferGuideMarkup(guide);
  assert.match(markup, /Arm A64 function, read-only here/);
  assert.match(markup, /#\/lesson\/moving-to-riscv/);
  const unsafe = transferGuideMarkup({
    title: "<unsafe>",
    sections: [
      {
        heading: "<script>",
        prose: ["<img>"],
        snippets: [{ label: "Source", source: "<code>" }],
      },
    ],
  });
  assert.doesNotMatch(unsafe, /<script>|<img>|<code><code>/);
  assert.match(unsafe, /&lt;code&gt;/);
});

test("the exact project caller and requested edits execute with 64-bit inputs and a real return", async () => {
  const fresh = caller.source
    .replace("call difference", "li a2, 3\ncall difference")
    .replace("sub a0, a0, a1", "sub a0, a0, a1\n  add a0, a0, a2");
  for (const [source, expected] of [
    [caller.source, 13n],
    [fresh, 16n],
    [caller.source.replace("li a0, 53", "li a0, 4294967349"), 4294967309n],
  ]) {
    const context = projectContext({
      ...newProject("asm", "Transfer verification"),
      source,
    });
    const built = await build(source, context);
    const state = readState(execute(built.elf).output);
    assert.equal(BigInt(state.registers.t2), expected);
    assert.equal(BigInt(state.registers.a0), expected);
    assert.equal(BigInt(state.registers.a1), 40n);
  }
});
