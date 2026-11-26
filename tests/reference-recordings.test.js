// Copyright © 2026 Christopher Snow
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { loadLessons } from "../tools/course-data.js";
import {
  referenceFragment,
  referenceRegister,
  validateReferenceEntries,
} from "../site/course/reference-model.js";
const raw = await Promise.all(
  ["arithmetic", "control"].map((name) =>
    readFile(
      new URL("../content/reference/" + name + ".json", import.meta.url),
      "utf8",
    ),
  ),
);
const entries = raw.flatMap((text) => JSON.parse(text));
const fixture = JSON.parse(
  await readFile(
    new URL("../site/course/reference-recordings.json", import.meta.url),
    "utf8",
  ),
);

test("the reference includes every mnemonic in the course assembly examples and exercises", async () => {
  const ids = new Set(entries.map((entry) => entry.id));
  for (const lesson of await loadLessons()) {
    if (lesson.language === "c") continue;
    for (const source of [
      lesson.starter,
      ...(lesson.challenge
        ? [lesson.challenge.starter, lesson.challenge.reference]
        : []),
    ]) {
      for (const line of source.split("\n")) {
        const instruction = line
          .replace(/^[\w.]+:\s*/, "")
          .trim()
          .match(/^([a-z][a-z0-9]*)\b/);
        if (instruction)
          assert.ok(
            ids.has(instruction[1]),
            lesson.id + ": missing " + instruction[1],
          );
      }
    }
  }
});

test("each worked example has a source-matched, independently checked CPU recording", () => {
  const totals = validateReferenceEntries(entries);
  assert.equal(Object.keys(fixture.examples).length, totals.examples);
  assert.equal(
    fixture.provenance.sourceDigest,
    createHash("sha256").update(raw.join("\n")).digest("hex"),
  );
  for (const entry of entries)
    for (const example of entry.examples) {
      const recording = fixture.examples[example.id];
      assert.equal(recording.instruction, example.instruction);
      assert.ok(recording.source.includes(referenceFragment(example)));
      assert.deepEqual(
        recording.before.map((row) => row.register),
        example.watch,
      );
      assert.deepEqual(
        recording.after.map((row) => row.register),
        example.watch,
      );
      assert.ok(recording.machineInstructions.length >= 1);
      assert.match(recording.beforePC, /^0x[\da-f]{16}$/);
      assert.match(recording.afterPC, /^0x[\da-f]{16}$/);
      assert.equal(typeof recording.nextSupplied, "boolean");
      assert.equal(typeof recording.nextInstruction, "string");
      assert.equal(typeof recording.output, "string");
      for (const row of [...recording.before, ...recording.after])
        assert.deepEqual(row, referenceRegister(row.register, row.hex));
      if (example.data) {
        assert.equal(recording.memory.before.length, 64);
        assert.equal(recording.memory.after.length, 64);
        assert.deepEqual(
          recording.memory.before.slice(0, example.data.length),
          example.data,
        );
      }
    }
});

test("invalid reference records cannot silently share IDs or name nonexistent registers", () => {
  const original = entries[0];
  assert.throws(
    () => validateReferenceEntries([original, original]),
    /duplicate reference instruction/,
  );
  assert.throws(
    () =>
      validateReferenceEntries([
        {
          ...original,
          examples: [{ ...original.examples[0], watch: ["missing"] }],
        },
      ]),
    /unknown register/,
  );
  assert.throws(
    () =>
      validateReferenceEntries([
        {
          ...original,
          examples: [{ ...original.examples[0], instruction: "ecall" }],
        },
      ]),
    /another instruction/,
  );
});
