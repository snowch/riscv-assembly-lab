// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";
import { fillSource, loadExercise, returnToExample } from "./editor-helpers.js";

const go = async (page) => {
  await page.goto("/lessons/addition/");
  await expect(page.locator("#run")).toBeEnabled();
};
const barTop = (page) =>
  page
    .locator(".workbench-bar")
    .evaluate((el) => el.getBoundingClientRect().top);

test("loading the reference keeps the example and the prior exercise draft across reload", async ({
  page,
}) => {
  await go(page);
  const example = "li t0, 19\nli t1, 23\nadd t2, t0, t1\n";
  const attempt = "# My exercise attempt\nsub t2, t0, t1\n";
  await fillSource(page, example);
  await expect(page.locator("#exercise-work")).toBeHidden();
  await loadExercise(page);
  await expect(page.locator("#exercise-work #exercise-task")).toBeVisible();
  await expect(page.locator("#check-cases")).toHaveClass(/primary/);
  await fillSource(page, attempt);
  await page.locator("#reference-solution > summary").press("Enter");
  await page.locator("#use-reference").press("Enter");
  await expect(page.locator("#source")).not.toHaveValue(attempt);
  await page.reload();
  await expect(page.locator("#source")).toHaveValue(example);
  await loadExercise(page);
  await page.getByRole("button", { name: "Undo restore", exact: true }).press("Enter");
  await expect(page.locator("#source")).toHaveValue(attempt);
  await returnToExample(page);
  await expect(page.locator("#source")).toHaveValue(example);
});

test("an exercise build error is separate from an output mismatch", async ({ page }) => {
  await go(page);
  await loadExercise(page);
  await fillSource(page, "unrecognised_instruction t2, t0, t1\n");
  await page.locator("#check-cases").press("Enter");
  await expect(page.locator("#state-badge")).toHaveText("Error", { timeout: 45000 });
  await expect(page.locator("#challenge-status")).toContainText("Could not run 3");
  await expect(page.locator("#case-results li").first()).toContainText("Could not run");
  await fillSource(page, "add t2, t0, t1\n");
  await expect(page.locator("#case-result-context")).toBeVisible();
});

test("the optional exercise leaves a paused example untouched until explicitly loaded", async ({
  page,
}) => {
  await go(page);
  await expect(page.locator("#explore-mode, #challenge-mode")).toHaveCount(0);
  await expect(page.locator(".source-code-editor")).toHaveCount(1);
  const example = "li t0, 9\nli t1, 10\nadd t2, t0, t1\n";
  await fillSource(page, example);
  await page.locator("#step").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused", {
    timeout: 45000,
  });
  const pc = await page.locator("#step-location").textContent();
  await page.locator("#challenge > summary").click();
  await expect(page.locator("#editor-context")).toHaveText("Example");
  await expect(page.locator("#source")).toHaveValue(example);
  await expect(page.locator("#step-location")).toHaveText(pc);
  await expect(page.locator("#state-badge")).toHaveText("Paused");
  await expect(page.locator("#check-cases")).not.toBeVisible();
  await page.locator("#start-challenge").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#editor-context")).toHaveText("Exercise");
  await expect(page.locator(".cm-content")).toBeFocused();
  await expect(page.locator("#continue")).not.toBeVisible();
  await expect(page.locator("#t0-decimal")).toHaveText("—");
  await expect(page.locator("#starting-state")).toContainText("t0 = 14");
  await returnToExample(page);
  await expect(page.locator("#source")).toHaveValue(example);
  await expect(page.locator("#editor-context")).toBeFocused();
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#t2-decimal")).toHaveText("19");
});

test("returning from a saved exercise keeps the toolbar and working height steady", async ({
  page,
}) => {
  await go(page);
  const example = Array.from({ length: 30 }, (_, i) => `addi t0,t0,${i}`).join(
    "\n",
  );
  const exercise = "add t2,t0,t1\n";
  await page.evaluate(
    (value) =>
      localStorage.setItem("riscv-assembly-lab:addition:challenge:v2", value),
    exercise,
  );
  await fillSource(page, example);
  const height = await page
    .locator("#source-editor")
    .evaluate((el) => el.getBoundingClientRect().height);
  for (let attempt = 0; attempt < 3; attempt++) {
    await loadExercise(page);
    await expect(page.locator("#source")).toHaveValue(exercise);
    await expect(page.locator("#editor-context")).toBeFocused();
    expect(
      await page
        .locator("#source-editor")
        .evaluate((el) => el.getBoundingClientRect().height),
    ).toBe(height);
    await page.evaluate(() =>
      window.scrollBy(
        0,
        document.querySelector(".workbench-bar").getBoundingClientRect().top -
          100,
      ),
    );
    const before = await barTop(page);
    await page.evaluate(() => {
      window.__returnPositions = [];
      window.__returnTrace = new Promise((resolve) => {
        const record = () => {
          window.__returnPositions.push(
            document.querySelector(".workbench-bar").getBoundingClientRect()
              .top,
          );
          if (window.__returnPositions.length < 20)
            requestAnimationFrame(record);
          else resolve();
        };
        requestAnimationFrame(record);
      });
    });
    await returnToExample(page);
    await page.evaluate(() => window.__returnTrace);
    const drift = await page.evaluate(
      (top) =>
        Math.max(...window.__returnPositions.map((y) => Math.abs(y - top))),
      before,
    );
    expect(drift).toBeLessThanOrEqual(1.5);
    await expect(page.locator("#source")).toHaveValue(example);
    expect(
      await page
        .locator("#source-editor")
        .evaluate((el) => el.getBoundingClientRect().height),
    ).toBe(height);
    expect(
      await page.evaluate(() => document.scrollingElement.style.overflowAnchor),
    ).toBe("");
  }
});

for (const fallback of [false, true]) {
  test(`${fallback ? "modal fallback" : "native fullscreen"} returns to the same editor position after loading the example`, async ({
    page,
  }) => {
    if (fallback)
      await page.addInitScript(() =>
        Object.defineProperty(document, "fullscreenEnabled", {
          get: () => false,
        }),
      );
    await go(page);
    const example = await page.locator("#source").inputValue();
    await loadExercise(page);
    await page.evaluate(() =>
      window.scrollBy(
        0,
        document.querySelector(".workbench-bar").getBoundingClientRect().top -
          100,
      ),
    );
    const before = await barTop(page);
    await page.locator("#fullscreen-workspace").click();
    await expect(page.locator(".workbench-dialog")).toHaveJSProperty(
      "open",
      true,
    );
    if (!fallback)
      await expect
        .poll(() => page.evaluate(() => document.fullscreenElement?.id))
        .toBe("workbench");
    await returnToExample(page);
    await expect(page.locator("#source")).toHaveValue(example);
    await page.locator("#fullscreen-workspace").click();
    await expect(page.locator(".workbench-dialog")).toHaveJSProperty(
      "open",
      false,
    );
    await expect
      .poll(async () => Math.abs((await barTop(page)) - before))
      .toBeLessThanOrEqual(1.5);
    await expect(page.locator("#fullscreen-workspace")).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
