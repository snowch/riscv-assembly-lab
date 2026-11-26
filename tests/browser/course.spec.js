// Copyright © 2026 Christopher Snow
import {
  fillSource,
  selectedSource,
  loadExercise,
  returnToExample,
  openTools,
} from "./editor-helpers.js";
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { loadLessons } from "../../tools/course-data.js";
const lessons = await loadLessons();
const go = async (page, id) => {
  await page.goto("/lessons/" + id + "/");
  await expect(page.locator("#run")).toBeEnabled();
};

test("every published lesson has readable, connected course views in both themes", async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const lesson of lessons) {
    await go(page, lesson.id);
    await expect(page.locator("h1")).toHaveText(lesson.title);
    await expect(page.locator('a[aria-current="page"]')).toHaveText(
      lesson.title,
    );
    await expect(page.locator("#source")).toHaveValue(lesson.starter);
    await expect(
      page.locator('.lab-help a[href="../../using-the-workbench/"]'),
    ).toHaveAttribute("target", "_blank");
    await expect(page.locator("#complete-source")).not.toBeVisible();
    for (const theme of ["light", "dark"]) {
      await page.locator("#theme").selectOption(theme);
      const problems = await page.evaluate(() => {
        const issues = [];
        if (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        )
          issues.push("page overflow");
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
        );
        let node;
        while ((node = walker.nextNode())) {
          if (!node.textContent.trim()) continue;
          const el = node.parentElement,
            style = getComputedStyle(el);
          if (!el.getClientRects().length || style.visibility === "hidden")
            continue;
          if (parseFloat(style.fontSize) < 11)
            issues.push("small text: " + node.textContent.slice(0, 35));
        }
        return issues;
      });
      expect(problems, lesson.id + " " + theme).toEqual([]);
    }
  }
  expect(errors).toEqual([]);
});

test("step, continue, challenge feedback and case inspection use actual observations", async ({
  page,
}) => {
  test.setTimeout(90000);
  await go(page, "addition");
  await page.locator("#step").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused", {
    timeout: 45000,
  });
  await expect(page.locator("#t0-decimal")).toHaveText("0");
  await page.locator("#step").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused");
  await expect(page.locator("#t0-decimal")).toHaveText("7");
  await page.locator("#continue").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#t2-decimal")).toHaveText("12");
  await expect(page.locator("#current-instruction")).toContainText(
    "reporting checkpoint",
  );
  await loadExercise(page);
  await fillSource(page, "sub t2,t0,t1");
  await page.locator("#check-cases").click();
  await expect(page.locator("#state-badge")).toHaveText("Try again", {
    timeout: 45000,
  });
  await expect(page.locator("#case-results .failed").first()).toBeVisible();
  await page.locator("#next-hint").click();
  await expect(page.locator("#challenge-hints li")).toHaveCount(1);
  await page.locator("#reference-solution > summary").click();
  await page.locator("#use-reference").click();
  await page.locator("#check-cases").click();
  await expect(page.locator("#state-badge")).toHaveText("Passed", {
    timeout: 45000,
  });
  await expect(page.locator("#case-results .passed")).toHaveCount(
    lessonBy("addition").challenge.cases.length,
  );
  await page.getByRole("button", { name: "Inspect this case" }).first().click();
  await expect(page.locator("#register-note")).toContainText(
    "last challenge check",
  );
  await fillSource(page, "add t2,t0,t1\naddi t2,t2,1");
  await expect(page.locator("#snapshot-note")).toBeVisible();
});

test("byte views identify decimal offsets and preserve before/after observations", async ({
  page,
}, info) => {
  await go(page, "loads-and-stores");
  await openTools(page, "memory");
  await expect(page.locator(".memory-offset").nth(2)).toHaveText("+16");
  await expect(page.locator("#memory-note")).toContainText("decimal");
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#memory-note")).toContainText("observed at 0x");
  await page.locator(".memory-byte").nth(8).click();
  await expect(page.locator("#byte-inspection")).toContainText("0x");
  await page.locator("#memory-before").click();
  await expect(page.locator("#memory-note")).toContainText("before execution");
  await expect(page.locator("#byte-inspection")).toHaveText(
    "Choose a byte to inspect this view.",
  );
  await page.screenshot({
    path: ".artifacts/" + info.project.name + "-course-memory.png",
    fullPage: true,
    animations: "disabled",
  });
});

test("C really compiles, exports complete source and reports source-line errors", async ({
  page,
}) => {
  await go(page, "c-return-values");
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#compiled-assembly")).not.toHaveText(
    "Not compiled yet.",
  );
  await expect(page.locator("#compiled-source")).toHaveText(
    await page.locator("#source").inputValue(),
  );
  await page.locator("#complete-program > summary").click();
  const pending = page.waitForEvent("download");
  await page.locator("#download-complete").click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe("c-return-values-complete.zip");
  const bytes = await readFile(await download.path());
  const files = {};
  let offset = 0;
  while (bytes.readUInt32LE(offset) === 0x04034b50) {
    const size = bytes.readUInt32LE(offset + 18),
      nameLength = bytes.readUInt16LE(offset + 26),
      extra = bytes.readUInt16LE(offset + 28),
      name = bytes.subarray(offset + 30, offset + 30 + nameLength).toString();
    const start = offset + 30 + nameLength + extra;
    files[name] = bytes.subarray(start, start + size).toString();
    offset = start + size;
  }
  expect(files["lesson.c"]).toBe(await page.locator("#source").inputValue());
  expect(files["support.s"]).toContain("call lesson");
  expect(files["user.ld"]).toContain("0x10000");
  await fillSource(
    page,
    "long lesson(long a,long b) {\n return missing_name;\n}",
  );
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Error", {
    timeout: 30000,
  });
  await expect(page.locator("#diagnostic-lines")).toContainText("lesson.c:2:");
  await page.locator(".diagnostic-link").first().click();
  expect(await selectedSource(page)).toContain("missing_name");
  await expect(page.locator("#a0-decimal")).toHaveText("—");
});

test("completion and independent drafts survive navigation without forcing progress gates", async ({
  page,
}) => {
  await go(page, "addition");
  const contents = page.locator("#course-navigation");
  await expect(contents).toBeHidden();
  await page.locator("#course-toggle").focus();
  await page.keyboard.press("Enter");
  await expect(contents).toBeVisible();
  await expect(page.locator('a[aria-current="page"]')).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(contents).toBeHidden();
  const originalViewport = page.viewportSize();
  await page.setViewportSize({
    width: originalViewport.width > 950 ? 800 : 1100,
    height: originalViewport.height,
  });
  await expect(contents).toBeHidden();
  await page.setViewportSize(originalViewport);
  await expect(contents).toBeHidden();
  await expect(page.locator("#reading")).not.toBeVisible();
  await expect(page.locator("#bit-view")).not.toBeVisible();
  await fillSource(page, "li t0,8\nli t1,9\nadd t2,t0,t1");
  await page.locator("#lesson-complete").check();
  await page.locator(".brand").click();
  await expect(page.locator("#course-progress")).toContainText(
    "1 marked complete",
  );
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await expect(page.locator("#course-contents")).toHaveJSProperty(
    "open",
    false,
  );
  await expect(page.locator("#fundamentals")).toHaveJSProperty("open", false);
  await expect(page.locator(".home-hero-art img")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".home-hero-art img")
        .evaluate((img) => img.complete && img.naturalWidth > 0),
    )
    .toBe(true);
  await page.locator("#course-contents > summary").click();
  await page.locator("#fundamentals > summary").click();
  await page.locator('.course-module a[href="./lessons/addition/"]').click();
  await expect(page.locator("#source")).toHaveValue(
    "li t0,8\nli t1,9\nadd t2,t0,t1",
  );
  await expect(page.locator("#lesson-complete")).toBeChecked();
  await go(page, "signed-readings");
  await openTools(page, "registers");
  await expect(page.locator("#reading")).toBeVisible();
  await expect(page.locator("#bit-view")).toBeVisible();
  await page.goto("/lessons/hello-world/");
  await expect(page.locator("#source")).toHaveValue(/Hello, RISC-V!/);
});
const lessonBy = (id) => lessons.find((lesson) => lesson.id === id);

test("prediction accepts the minus sign used in the lesson prose", async ({
  page,
}) => {
  await go(page, "arithmetic-shifts");
  await page.locator("#prediction").fill("−5");
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#prediction-feedback")).toHaveText(
    "Your prediction matches the executed result.",
  );
});

test("fixture controls stay locked while paused and restoring code starts a fresh CPU", async ({
  page,
}) => {
  await go(page, "addition");
  await fillSource(page, "li t0,99\nli t1,5\nadd t2,t0,t1");
  await page.locator("#step").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused", {
    timeout: 45000,
  });
  await page.locator("#restore").click();
  await expect(page.locator("#state-badge")).toHaveText("Stopped");
  await page.locator("#step").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused", {
    timeout: 45000,
  });
  await page.locator("#step").click();
  await expect(page.locator("#t0-decimal")).toHaveText("7");
  await loadExercise(page);
  await page.locator("#step").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused", {
    timeout: 45000,
  });
  for (const button of await page.locator("#case-picker button").all())
    await expect(button).toBeDisabled();
  await page.locator("#stop").click();
  await expect(page.locator("#case-picker button").first()).toBeEnabled();
});

test("recorded system-call cases restore their own output and state", async ({
  page,
}) => {
  test.setTimeout(90000);
  await go(page, "system-calls");
  await loadExercise(page);
  await page.locator("#reference-solution > summary").click();
  await page.locator("#use-reference").click();
  await page.locator("#check-cases").click();
  await expect(page.locator("#state-badge")).toHaveText("Passed", {
    timeout: 60000,
  });
  await expect(page.locator("#console")).toHaveText("trip\n");
  await page.getByRole("button", { name: "Inspect this case" }).first().click();
  await expect(page.locator("#t2-decimal")).toHaveText("0");
  await expect(page.locator("#console")).toContainText("No console text");
  await expect(page.locator("#serial")).toContainText("RVLAB_STATE_V2");
  await page.getByRole("button", { name: "Inspect this case" }).nth(1).click();
  await expect(page.locator("#t2-decimal")).toHaveText("1");
  await expect(page.locator("#console")).toHaveText("t");
});

test("compiler warnings and download failures remain visible, tab drafts survive blocked storage", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new Error("blocked");
    };
    Storage.prototype.getItem = function () {
      throw new Error("blocked");
    };
  });
  await go(page, "c-return-values");
  const code = "long lesson(long a,long b){long *p=a;return a+b;}";
  await fillSource(page, code);
  await loadExercise(page);
  await returnToExample(page);
  await expect(page.locator("#source")).toHaveValue(code);
  await page.locator("#run").click();
  await page.locator("#runner-intro [data-continue]").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#diagnostic-lines")).toContainText("warning:");
  await page.route("**/course/user.ld", (route) => route.abort());
  await page.locator("#complete-program > summary").click();
  await page.locator("#download-complete").click();
  await expect(page.locator("#run-status")).toContainText("Could not download");
});

test("the bare-metal lesson boots edited assembly and exports the current ELF", async ({
  page,
}) => {
  await go(page, "boot-trip-computer");
  const starter = await page.locator("#source").inputValue();
  const download = page.locator("#download-elf");
  await expect(download).toBeDisabled();

  await page.locator("#step").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused", {
    timeout: 45000,
  });
  await expect(page.locator("#current-instruction")).toContainText("80000000");
  await expect(page.locator("#sp-decimal")).toHaveText("0");
  await page.locator("#stop").click();

  await fillSource(page, starter.replace(".word 12, 7, 23", ".word 19, 80, 1, 4"));
  await expect(download).toBeDisabled();
  await page.locator("#run").click();
  await expect(page.locator("#run-status")).toContainText("Reached park", {
    timeout: 45000,
  });
  await openTools(page, "output");
  await expect(page.locator("#console")).toHaveText("Trip total: 104 km");

  const saving = page.waitForEvent("download");
  await download.click();
  const file = await saving;
  expect(file.suggestedFilename()).toBe("trip.elf");
  const elf = await readFile(await file.path());
  expect(elf.readBigUInt64LE(24)).toBe(0x80000000n);
});

test("the trip-computer lesson links QEMU instructions, the Pico guide and its UF2", async ({
  page,
}) => {
  await go(page, "boot-trip-computer");
  const transfer = page.locator("#boot-transfer");
  await expect(transfer.getByRole("heading", { name: "Boot in QEMU" })).toBeVisible();
  await expect(transfer.locator("pre")).toContainText("-bios none -nographic -kernel trip.elf");

  await expect(transfer.locator('a[href$=".uf2"]')).toHaveCount(0);
  await transfer.getByRole("link", { name: "Open the Pico 2 guide" }).click();
  const saving = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download trip_computer.uf2" }).click();
  const firmware = await saving;
  expect(firmware.suggestedFilename()).toBe("trip_computer.uf2");
  expect(await readFile(await firmware.path())).toEqual(
    await readFile(new URL("../../site/pico2/trip_computer.uf2", import.meta.url)),
  );

  await expect(page.getByRole("heading", { name: "Test it from a phone" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download trip.S" })).toHaveAttribute("download", "");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});
