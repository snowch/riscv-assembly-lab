// Copyright © 2026 Christopher Snow
import { test, expect } from "@playwright/test";
import { fillSource, loadExercise, openTools } from "./editor-helpers.js";

test("a valid edited experiment compares the entered prediction with this run", async ({
  page,
}) => {
  await page.goto("/lessons/addition/");
  await expect(page.locator("#run")).toBeEnabled();
  await page.locator("#prediction").fill("12");
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#prediction-feedback")).toHaveText(
    "Your prediction matches the executed result.",
  );
  const edited = "li t0, 19\nli t1, 23\nadd t2, t0, t1\n";
  await fillSource(page, edited);
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#t2-decimal")).toHaveText("42", {
    timeout: 45000,
  });
  await expect(page.locator("#prediction")).toHaveValue("12");
  await expect(page.locator("#prediction-feedback")).toHaveText(
    "This run completed with t2 = 42 (decimal). Your prediction differs from this result; compare it with the code you ran.",
  );
  await expect(page.locator("#run-status")).not.toHaveClass(/error/);
  await page.reload();
  await expect(page.locator("#source")).toHaveValue(edited);
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Finished", {
    timeout: 45000,
  });
  await expect(page.locator("#prediction-feedback")).toContainText(
    "No prediction was entered. This run produced t2 = 42",
  );
  await loadExercise(page);
  await fillSource(page, "add t2, t0, t1\n");
  await page.locator("#run").click();
  await expect(page.locator("#t2-decimal")).toHaveText("19", {
    timeout: 45000,
  });
  await expect(page.locator("#run-status")).toHaveText(
    "Run finished for the selected exercise case. Inspect Registers, then use Check all cases to test every supplied input.",
  );
});

test("build errors, stopped execution and faults do not leave predictions checking", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("/lessons/addition/");
  await expect(page.locator("#run")).toBeEnabled();
  await page.locator("#prediction").fill("12");
  await fillSource(page, "not_an_instruction\n");
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("Error", {
    timeout: 45000,
  });
  await expect(page.locator("#prediction-feedback")).toHaveText(
    "Prediction not checked: this run produced no completed register result.",
  );
  await expect(page.locator("#prediction")).toHaveValue("12");
  await expect(page.locator("#diagnostics > summary")).toContainText(
    "Build and execution messages",
  );
  await expect(page.locator("#diagnostic-lines")).not.toBeEmpty();
  await fillSource(page, "again:\nj again\n");
  await page.locator("#step").click();
  await expect(page.locator("#state-badge")).toHaveText("Paused", {
    timeout: 45000,
  });
  await page.locator("#stop").click();
  await expect(page.locator("#state-badge")).toHaveText("Stopped");
  await expect(page.locator("#prediction-feedback")).toContainText(
    "Prediction not checked",
  );
  await page.goto("/lessons/memory-protection/");
  await expect(page.locator("#run")).toBeEnabled();
  const original = await page.locator("#source").inputValue();
  await fillSource(page, original.replace("la t0, lesson_data", "li t0, -1"));
  await page.locator("#run").click();
  await expect(page.locator("#state-badge")).toHaveText("No snapshot", {
    timeout: 45000,
  });
  await expect(page.locator("#prediction-feedback")).toContainText(
    "Prediction not checked",
  );
  await openTools(page, "output");
  await page.locator("#serial-log > summary").click();
  await expect(page.locator("#serial")).toContainText("usertrap");
});
