// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";
import { fillSource, loadExercise } from "./editor-helpers.js";
test("custom lesson setup explains its project copy and preserves unapplied fields and saved projects", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto("/lessons/addition/");
  await expect(page.locator("#run")).toBeEnabled();
  await fillSource(page, "add t2, t0, t1");
  await tools(page, "setup");
  await expect(page.locator("#lesson-setup-note")).toBeVisible();
  await expect(page.locator("#lesson-setup-note")).toContainText(
    "project copy",
  );
  await page.locator("#project-inputs").fill("t0 = 81\nt1 = 4");
  await fillSource(page, "add t2, t0, t1\n# keep this draft");
  await tools(page, "program");
  await tools(page, "setup");
  await expect(page.locator("#project-inputs")).toHaveValue("t0 = 81\nt1 = 4");
  await page.locator("#setup-form button[type=submit]").click();
  await expect(page.locator("#lesson-setup-note")).toBeHidden();
  await expect(page.locator("#return-lesson")).toBeVisible();
  await page.locator("#run").click();
  await finished(page);
  await expect(page.locator("#t2-decimal")).toHaveText("85");
  await page.locator("#return-lesson").click();
  await expect(page.locator("#source")).toHaveValue(
    "add t2, t0, t1\n# keep this draft",
  );
  await page.locator("#run").click();
  await finished(page);
  await expect(page.locator("#t2-decimal")).toHaveText("0");
  await tools(page, "projects");
  await page.locator(".project-actions > summary").click();
  await expect(page.locator("#delete-project")).toBeDisabled();
  await expect(page.locator("#project-picker option")).toHaveCount(2);
  await page.reload();
  await expect(page.locator("#source")).toHaveValue(
    "add t2, t0, t1\n# keep this draft",
  );
  await tools(page, "projects");
  await expect(page.locator("#project-picker option")).toHaveCount(2);
});
async function tools(page, name) {
  const toggle = page.locator("#workspace-tools-toggle");
  if ((await toggle.getAttribute("aria-expanded")) !== "true")
    await toggle.click();
  if (name) await page.locator("#tab-" + name).click();
}
async function finished(page) {
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
}
test("one editor retains lesson drafts and exercise case when projects use real C and assembly builds", async ({
  page,
}) => {
  test.setTimeout(150000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/lessons/addition/");
  await expect(page.locator("#run")).toBeEnabled();
  await expect(page.locator("#workspace-tools-dock")).toBeHidden();
  await fillSource(page, "li t0, 19\nli t1, 23\nadd t2, t0, t1");
  await page.locator("#prediction").fill("42");
  await page.locator("#run").click();
  await finished(page);
  await expect(page.locator("#phone-observation-registers")).toContainText(
    "42",
  );
  await tools(page, "projects");
  await page.locator(".project-actions>summary").click();
  await page.locator("#copy-project").click();
  await expect(page.locator("#return-lesson")).toBeVisible();
  await fillSource(page, "sub t2, t0, t1");
  await tools(page, "setup");
  await page.locator("#project-inputs").fill("t0 = 20\nt1 = 3");
  await page.locator("#setup-form button[type=submit]").click();
  await page.locator("#run").click();
  await finished(page);
  await expect(page.locator("#t2-decimal")).toHaveText("17");
  await page.locator("#return-lesson").click();
  await expect(page.locator("#source")).toHaveValue(
    "li t0, 19\nli t1, 23\nadd t2, t0, t1",
  );
  await expect(page.locator("#prediction")).toHaveValue("42");
  await loadExercise(page);
  await page.locator("#case-picker button").nth(1).click();
  await fillSource(page, "# saved exercise\nadd t2, t0, t1");
  const inputs = await page.locator("#starting-state").textContent();
  await tools(page, "projects");
  await page.locator("#new-project").click();
  await page.locator("#new-project-kind").selectOption("c");
  await page.locator("#new-project-form button[type=submit]").click();
  await fillSource(page, "long lesson(long a,long b) { return a * 3 + b; }");
  await tools(page, "setup");
  await page.locator("#project-inputs").fill("a0 = 7\na1 = 5");
  await page.locator("#setup-form button[type=submit]").click();
  await page.locator("#run").click();
  await finished(page);
  await expect(page.locator("#a0-decimal")).toHaveText("26");
  await tools(page, "program");
  await page.locator("#program-mode").selectOption("instructions");
  await expect(page.locator("#machine-listing")).not.toBeEmpty();
  await expect(page.locator(".source-code-editor")).toBeVisible();
  await page.locator("#return-lesson").click();
  await expect(page.locator("#editor-context")).toHaveText("Exercise");
  await expect(page.locator("#source")).toHaveValue(
    "# saved exercise\nadd t2, t0, t1",
  );
  await expect(page.locator("#starting-state")).toHaveText(inputs);
  await page.locator("#return-example").click();
  await expect(page.locator("#source")).toHaveValue(
    "li t0, 19\nli t1, 23\nadd t2, t0, t1",
  );
  expect(errors).toEqual([]);
});
test("all advanced views share the editor; original and edited memory results come from execution", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/lessons/addition/");
  await expect(page.locator("#run")).toBeEnabled();
  const source = await page.locator("#source").inputValue();
  for (const tab of [
    "registers",
    "memory",
    "stack",
    "debugger",
    "program",
    "output",
    "diagnostics",
    "setup",
    "projects",
  ]) {
    await tools(page, tab);
    await expect(page.locator(".source-code-editor")).toBeVisible();
    await expect(page.locator("#source")).toHaveValue(source);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.locator("#new-project").click();
  await page.locator("#new-project-form button[type=submit]").click();
  await fillSource(
    page,
    "la t3, lesson_data\nld t0, 0(t3)\naddi t2, t0, 1\nsd t2, 8(t3)",
  );
  await tools(page, "setup");
  await page.locator("#project-bytes").fill("07 00 00 00 00 00 00 00");
  await page.locator("#setup-form button[type=submit]").click();
  await page.locator("#run").click();
  await finished(page);
  await expect(page.locator("#t2-decimal")).toHaveText("8");
  await tools(page, "memory");
  await expect(page.locator(".memory-byte.changed")).toHaveCount(1);
  await page.locator("#memory-before").click();
  await expect(page.locator(".memory-byte.changed")).toHaveCount(0);
  await page.locator("#memory-after").click();
  await tools(page, "debugger");
  await page.locator("#debug-line").fill("3");
  await page.locator("#debug-add-line").click();
  await page.locator("#debug").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused", {
    timeout: 45000,
  });
  await expect(page.locator("#t0-decimal")).toHaveText("7");
  await page.locator("#continue").click();
  await finished(page);
  await expect(page.locator("#t2-decimal")).toHaveText("8");
  await tools(page, "memory");
  await page.locator("#theme").selectOption("dark");
  await page.screenshot({
    path: `.artifacts/${info.project.name}-unified-tools.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
