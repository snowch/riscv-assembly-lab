// Copyright © 2026 Christopher Snow
import { mkdtemp, writeFile, chmod, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { loadLessons } from "./course-data.js";
import { buildLesson } from "../site/course/builder.js";
import { readState, checkState } from "../site/course/model.js";
import { assets, factories, execute } from "./course-runner.js";
const lessons = await loadLessons(),
  directory = await mkdtemp(join(tmpdir(), "riscv-course-"));
const nativeOnly = process.argv.includes("--native-only"),
  xv6Only = process.argv.includes("--xv6-only");
const qemu =
  process.env.RISCV_QEMU ??
  (existsSync("/workspace/native-tools/usr/bin/qemu-riscv64")
    ? "/workspace/native-tools/usr/bin/qemu-riscv64"
    : "qemu-riscv64");
const lightweight = { as: factories.as, ld: factories.ld };
const totals = {
  lessons: lessons.length,
  nativeExamples: 0,
  nativeCases: 0,
  incompleteReferencesRejected: 0,
  xv6Examples: 0,
  xv6Cases: 0,
  xv6IncompleteRejected: 0,
  failures: [],
};
async function run(
  source,
  lesson,
  fixture = {},
  platform = "linux",
  timeout = 1500,
) {
  const built = await buildLesson(
    source,
    lesson,
    fixture,
    assets,
    lightweight,
    platform,
  );
  if (platform === "xv6") {
    const result = execute(built.elf);
    return { ...result, state: readState(result.output) };
  }
  const path = join(directory, "lesson.elf");
  await writeFile(path, built.elf);
  await chmod(path, 0o755);
  const result = spawnSync(qemu, [path], {
    timeout,
    encoding: "utf8",
    maxBuffer: 200000,
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`Native process exited ${result.status}: ${result.stderr}`);
  return { output: result.stdout, state: readState(result.stdout) };
}
const fail = (lesson, where, error) => {
  totals.failures.push({
    lesson: lesson.id,
    where,
    error: error.message ?? String(error),
  });
  console.error("FAIL", lesson.id, where, error.message ?? error);
};
try {
  if (!xv6Only) {
    const version = spawnSync(qemu, ["--version"], { encoding: "utf8" });
    if (version.error || version.status)
      throw new Error(
        "qemu-riscv64 is required. Install qemu-user or set RISCV_QEMU.",
      );
    console.log(version.stdout.split("\n")[0]);
  }
  for (const lesson of lessons) {
    if (!xv6Only && lesson.id !== "system-calls") {
      try {
        const result = await run(lesson.starter, lesson);
        if (!result.state) throw new Error("No state report.");
        totals.nativeExamples++;
      } catch (error) {
        fail(lesson, "native worked example", error);
      }
      for (const test of lesson.challenge.cases) {
        try {
          const result = await run(lesson.challenge.reference, lesson, test);
          const verdict = checkState(result.state, test);
          if (!verdict.pass) throw new Error(verdict.messages.join(" "));
          totals.nativeCases++;
        } catch (error) {
          fail(lesson, "native reference " + test.name, error);
        }
      }
      let rejected = false;
      for (const test of lesson.challenge.cases) {
        try {
          const result = await run(
            lesson.challenge.starter,
            lesson,
            test,
            "linux",
            500,
          );
          if (!checkState(result.state, test).pass) {
            rejected = true;
            break;
          }
        } catch {
          rejected = true;
          break;
        }
      }
      if (rejected) totals.incompleteReferencesRejected++;
      else
        fail(
          lesson,
          "incomplete challenge",
          new Error("Starting code passes every case."),
        );
    }
    if (!nativeOnly) {
      try {
        const result = await run(lesson.starter, lesson, {}, "xv6");
        if (!result.state)
          throw new Error("No state report. " + result.output.slice(-400));
        totals.xv6Examples++;
      } catch (error) {
        fail(lesson, "xv6 worked example", error);
      }
      // System-call numbers belong to xv6; those cases are intentionally not run as Linux calls.
      if (lesson.id === "system-calls")
        for (const test of lesson.challenge.cases) {
          try {
            const result = await run(
              lesson.challenge.reference,
              lesson,
              test,
              "xv6",
            );
            const verdict = checkState(result.state, test);
            if (!verdict.pass) throw new Error(verdict.messages.join(" "));
            totals.xv6Cases++;
          } catch (error) {
            fail(lesson, "xv6 reference " + test.name, error);
          }
        }
    }
    if (!nativeOnly && lesson.id === "system-calls") {
      let rejected = false;
      for (const test of lesson.challenge.cases) {
        try {
          const result = await run(
            lesson.challenge.starter,
            lesson,
            test,
            "xv6",
          );
          if (!checkState(result.state, test).pass) {
            rejected = true;
            break;
          }
        } catch {
          rejected = true;
          break;
        }
      }
      if (rejected) totals.xv6IncompleteRejected++;
      else
        fail(
          lesson,
          "xv6 incomplete challenge",
          new Error("Starting code passes every case."),
        );
    }
    console.log(`${lesson.id}: checked`);
  }
  await mkdirArtifacts();
  await writeFile(
    new URL(
      `../.artifacts/course-execution-${nativeOnly ? "native" : xv6Only ? "xv6" : "full"}.json`,
      import.meta.url,
    ),
    JSON.stringify(totals, null, 2) + "\n",
  );
  console.log(JSON.stringify(totals, null, 2));
  if (totals.failures.length) process.exitCode = 1;
} finally {
  await rm(directory, { recursive: true, force: true });
}
async function mkdirArtifacts() {
  const { mkdir } = await import("node:fs/promises");
  await mkdir(new URL("../.artifacts/", import.meta.url), { recursive: true });
}
