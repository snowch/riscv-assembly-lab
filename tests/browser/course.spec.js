// Copyright © 2026 Christopher Snow
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
  await page.locator("#start-challenge").click();
  await page.locator("#source").fill("sub t2,t0,t1");
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
  await page.locator("#source").fill("add t2,t0,t1\naddi t2,t2,1");
  await expect(page.locator("#snapshot-note")).toBeVisible();
});

test("byte views identify decimal offsets and preserve before/after observations", async ({
  page,
}, info) => {
  await go(page, "loads-and-stores");
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
  await page
    .locator("#source")
    .fill("long lesson(long a,long b) {\n return missing_name;\n}");
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Error", {
    timeout: 30000,
  });
  await expect(page.locator("#diagnostic-lines")).toContainText("lesson.c:2:");
  await page.locator(".diagnostic-link").first().click();
  expect(
    await page
      .locator("#source")
      .evaluate((el) => el.value.slice(el.selectionStart, el.selectionEnd)),
  ).toContain("missing_name");
  await expect(page.locator("#a0-decimal")).toHaveText("—");
});

test("completion and independent drafts survive navigation without forcing progress gates", async ({
  page,
}) => {
  await go(page, "addition");
  await expect(page.locator("#reading")).not.toBeVisible();
  await expect(page.locator("#bit-view")).not.toBeVisible();
  await page.locator("#source").fill("li t0,8\nli t1,9\nadd t2,t0,t1");
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
  await page.locator('.course-module a[href="./lessons/addition/"]').click();
  await expect(page.locator("#source")).toHaveValue(
    "li t0,8\nli t1,9\nadd t2,t0,t1",
  );
  await expect(page.locator("#lesson-complete")).toBeChecked();
  await go(page, "signed-readings");
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
  await page.locator("#source").fill("li t0,99\nli t1,5\nadd t2,t0,t1");
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
  await page.locator("#challenge-mode").click();
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
  await page.locator("#challenge-mode").click();
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
  await page.locator("#source").fill(code);
  await page.locator("#challenge-mode").click();
  await page.locator("#explore-mode").click();
  await expect(page.locator("#source")).toHaveValue(code);
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#diagnostic-lines")).toContainText("warning:");
  await page.route("**/course/user.ld", (route) => route.abort());
  await page.locator("#complete-program > summary").click();
  await page.locator("#download-complete").click();
  await expect(page.locator("#run-status")).toContainText("Could not download");
});
